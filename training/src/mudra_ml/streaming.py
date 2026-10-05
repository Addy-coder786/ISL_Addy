"""Real-time sign segmentation: resting -> signing -> ended, then classify the whole sign once.

Shared by the live API (WebSocket /stream) and the continuous-stream benchmark, so the
app and its evaluation run the same logic. Time-based (seconds), so browser frame-rate
changes do not alter behaviour.
"""

from __future__ import annotations

import json
from collections import deque
from dataclasses import asdict, dataclass
from pathlib import Path

import numpy as np
import torch

from mudra_ml import schema
from mudra_ml.datasets.isl_dataset import BACKGROUND_LABEL, FeatureConfig, sequence_features
from mudra_ml.models.sequence_model import ModelConfig, build_model
from mudra_ml.preprocessing.sequence import LandmarkSequence


@dataclass
class SegmenterConfig:
    raise_y: float = 1.5  # wrist higher than this many shoulder-widths below the shoulder line = raised
    speed: float = 1.0  # wrist speed (shoulder-widths per second) that counts as movement
    on_s: float = 0.15  # continuous activity needed to start a sign
    off_s: float = 0.35  # continuous rest needed to end a sign
    pad_pre_s: float = 0.3  # context kept before the detected start (training clips start at rest)
    pad_post_s: float = 0.2
    min_sign_s: float = 0.3  # shorter bursts are ignored (fidgets, detection glitches)
    max_sign_s: float = 6.0  # a sign running this long is classified anyway
    buffer_s: float = 12.0
    commit_threshold: float | None = None  # whole-sign confidence needed to add a word (None = model card value)

    @classmethod
    def load(cls, path: Path | None) -> SegmenterConfig:
        if path and Path(path).exists():
            return cls(**json.loads(Path(path).read_text(encoding="utf-8")))
        return cls()

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class Frame:
    t: float
    hands: np.ndarray  # [2, 21, 3] signer-left / signer-right
    present: np.ndarray  # [2] bool
    pose: np.ndarray  # [33, 4]
    pose_present: bool


class SignSegmenter:
    """Hysteresis state machine over a per-frame activity signal (hands raised or moving)."""

    def __init__(self, cfg: SegmenterConfig, width: int, height: int):
        self.cfg = cfg
        self.aspect = width / height if width > 0 and height > 0 else 1.0
        self.frames: deque[Frame] = deque()
        self.state = "idle"
        self.active_since: float | None = None
        self.rest_since: float | None = None
        self.sign_start: float | None = None
        self.body: tuple[np.ndarray, float] | None = None  # shoulder centre, shoulder width
        self.prev_wrist: list[np.ndarray | None] = [None, None]
        self.prev_t: float | None = None

    def _activity(self, f: Frame) -> bool:
        if f.pose_present:
            ls, rs = f.pose[schema.POSE_LEFT_SHOULDER], f.pose[schema.POSE_RIGHT_SHOULDER]
            if ls[3] >= 0.5 and rs[3] >= 0.5:
                c = (ls[:2] + rs[:2]) / 2 * [self.aspect, 1]
                w = float(np.linalg.norm((ls[:2] - rs[:2]) * [self.aspect, 1]))
                if w > 1e-4:
                    self.body = (c, w)
        dt = (f.t - self.prev_t) if self.prev_t is not None else 0.0
        active = False
        for h in range(2):
            if not f.present[h]:
                self.prev_wrist[h] = None
                continue
            wrist = f.hands[h, schema.WRIST, :2] * [self.aspect, 1]
            if self.body is None:
                active = True  # no body reference: a visible hand is the only evidence
            else:
                c, w = self.body
                raised = (wrist[1] - c[1]) / w < self.cfg.raise_y
                prev = self.prev_wrist[h]
                moving = prev is not None and dt > 0 and np.linalg.norm(wrist - prev) / w / dt > self.cfg.speed
                active = active or raised or moving
            self.prev_wrist[h] = wrist
        self.prev_t = f.t
        return active

    def push(self, f: Frame) -> tuple[str | None, LandmarkSequence | None]:
        """Add one frame. Returns (event, segment): event is 'sign_started', 'sign_ended' or None."""
        cfg = self.cfg
        self.frames.append(f)
        while self.frames and f.t - self.frames[0].t > cfg.buffer_s:
            self.frames.popleft()
        active = self._activity(f)
        if active:
            self.rest_since = None
            self.active_since = self.active_since if self.active_since is not None else f.t
        else:
            self.active_since = None
            self.rest_since = self.rest_since if self.rest_since is not None else f.t

        if self.state == "idle":
            if self.active_since is not None and f.t - self.active_since >= cfg.on_s:
                self.state, self.sign_start = "signing", self.active_since
                return "sign_started", None
            return None, None

        ended = self.rest_since is not None and f.t - self.rest_since >= cfg.off_s
        too_long = f.t - self.sign_start >= cfg.max_sign_s
        if not (ended or too_long):
            return None, None
        end = self.rest_since if ended else f.t
        start = self.sign_start
        self.state, self.sign_start, self.active_since = "idle", None, None
        if end - start < cfg.min_sign_s:
            return "too_short", None
        return "sign_ended", self._segment(start - cfg.pad_pre_s, end + cfg.pad_post_s)

    def _segment(self, t0: float, t1: float) -> LandmarkSequence | None:
        fs = [f for f in self.frames if t0 <= f.t <= t1]
        if len(fs) < 4:
            return None
        return LandmarkSequence(
            hands=np.stack([f.hands for f in fs]).astype(np.float32),
            hand_present=np.stack([f.present for f in fs]),
            hand_score=np.stack([f.present for f in fs]).astype(np.float32),
            pose=np.stack([f.pose for f in fs]).astype(np.float32),
            pose_present=np.array([f.pose_present for f in fs]),
            timestamps_ms=np.array([int(f.t * 1000) for f in fs]),
            meta={"width": 0, "height": 0},
        )


class ModelBundle:
    """Exported model directory (model.pt + model_card.json) -> calibrated class probabilities."""

    def __init__(self, model_dir: Path, device: str = "cpu"):
        card = json.loads((Path(model_dir) / "model_card.json").read_text(encoding="utf-8"))
        self.card, self.name, self.classes = card, card["name"], card["classes"]
        self.cfg = FeatureConfig.from_dict(card["feature_config"])
        self.mean = np.asarray(card["feature_mean"], np.float32)
        self.std = np.asarray(card["feature_std"], np.float32)
        self.temperature = float(card["temperature"])
        self.threshold = float(card["uncertain_threshold"])
        self.device = torch.device(device)
        self.model = build_model(ModelConfig.from_dict(card["model_config"]))
        self.model.load_state_dict(torch.load(Path(model_dir) / "model.pt", map_location=self.device, weights_only=True))
        self.model.to(self.device).eval()

    @torch.no_grad()
    def probs(self, seqs: list[LandmarkSequence], width: int, height: int) -> np.ndarray:
        feats = []
        for s in seqs:
            s.meta = {**s.meta, "width": width, "height": height}
            x = np.clip(sequence_features(s, self.cfg), -self.cfg.clip_value, self.cfg.clip_value)
            feats.append((x - self.mean) / self.std)
        logits = self.model(torch.from_numpy(np.stack(feats)).to(self.device)).float().cpu().numpy() / self.temperature
        p = np.exp(logits - logits.max(axis=1, keepdims=True))
        return p / p.sum(axis=1, keepdims=True)

    def decide(self, p: np.ndarray, top_k: int = 3, threshold: float | None = None) -> dict:
        """Whole-sign decision: background -> no_sign; below threshold -> uncertain; else ok."""
        best = int(p.argmax())
        order = [i for i in np.argsort(-p) if self.classes[i] != BACKGROUND_LABEL][:top_k]
        top = [{"sign": self.classes[i], "confidence": float(p[i])} for i in order]
        if self.classes[best] == BACKGROUND_LABEL:
            status = "no_sign"
        elif p[best] < (self.threshold if threshold is None else threshold):
            status = "uncertain"
        else:
            status = "ok"
        return {"status": status, "sign": self.classes[best] if status == "ok" else None,
                "confidence": float(p[best]), "top_k": top}


class StreamingRecognizer:
    """Segmenter + whole-sign classification. Feed frames, receive events."""

    def __init__(self, bundle: ModelBundle, cfg: SegmenterConfig, width: int, height: int):
        self.bundle, self.width, self.height = bundle, width, height
        self.segmenter = SignSegmenter(cfg, width, height)
        self.threshold = cfg.commit_threshold if cfg.commit_threshold is not None else bundle.threshold

    def push(self, frame: Frame) -> dict | None:
        event, segment = self.segmenter.push(frame)
        if event != "sign_ended":
            return {"event": event, "state": self.segmenter.state} if event else None
        if segment is None:
            return {"event": "sign_ended", "state": "idle", "result": {"status": "no_sign", "sign": None, "confidence": 0.0, "top_k": []}}
        result = self.bundle.decide(self.bundle.probs([segment], self.width, self.height)[0], threshold=self.threshold)
        return {"event": "sign_ended", "state": "idle", "result": result,
                "t0": float(segment.timestamps_ms[0]) / 1000, "t1": float(segment.timestamps_ms[-1]) / 1000}
