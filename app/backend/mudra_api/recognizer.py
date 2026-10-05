"""Loads an exported model and turns a landmark window into a sign prediction.

Feature building reuses ``mudra_ml`` (the training package), so live inference and
training share one implementation of hand assignment, sampling and normalisation.
"""

from __future__ import annotations

import json
import time
from pathlib import Path

import numpy as np
import torch
from mudra_ml import schema
from mudra_ml.datasets.isl_dataset import (
    BACKGROUND_LABEL,
    FeatureConfig,
    sequence_features,
)
from mudra_ml.models.sequence_model import ModelConfig, build_model
from mudra_ml.preprocessing.sequence import LandmarkSequence, assign_hands

from mudra_api.schemas import PredictRequest


def readable(sign: str) -> str:
    """'GOOD_MORNING' -> 'Good morning'."""
    words = sign.replace("_", " ").lower()
    return words[:1].upper() + words[1:]


class SignRecognizer:
    def __init__(self, model_dir: Path, device: str = "cpu", threshold_override: float | None = None):
        self.model_dir = Path(model_dir)
        card = json.loads((self.model_dir / "model_card.json").read_text(encoding="utf-8"))
        self.card = card
        self.name = card["name"]
        self.classes: list[str] = card["classes"]
        self.feature_cfg = FeatureConfig.from_dict(card["feature_config"])
        self.mean = np.asarray(card["feature_mean"], dtype=np.float32)
        self.std = np.asarray(card["feature_std"], dtype=np.float32)
        self.temperature = float(card["temperature"])
        self.threshold = float(threshold_override if threshold_override is not None else card["uncertain_threshold"])
        self.device = torch.device(device if device != "cuda" or torch.cuda.is_available() else "cpu")

        self.model = build_model(ModelConfig.from_dict(card["model_config"]))
        state = torch.load(self.model_dir / "model.pt", map_location=self.device, weights_only=True)
        self.model.load_state_dict(state)
        self.model.to(self.device).eval()

    def to_sequence(self, req: PredictRequest) -> LandmarkSequence:
        n = len(req.frames)
        hands = np.zeros((n, 2, schema.NUM_HAND_LANDMARKS, 3), dtype=np.float32)
        present = np.zeros((n, 2), dtype=bool)
        scores = np.zeros((n, 2), dtype=np.float32)
        pose = np.zeros((n, schema.NUM_POSE_LANDMARKS, 4), dtype=np.float32)
        pose_present = np.zeros(n, dtype=bool)

        for i, frame in enumerate(req.frames):
            pose_frame = None
            if frame.pose is not None:
                pts = np.asarray(frame.pose, dtype=np.float32)
                if pts.shape[1] == 3:
                    pts = np.concatenate([pts, np.ones((len(pts), 1), np.float32)], axis=1)
                pose[i] = pts
                pose_present[i] = True
                pose_frame = pts
            detected = [np.asarray(h.landmarks, dtype=np.float32) for h in frame.hands]
            labels = [h.handedness or "" for h in frame.hands]
            hand_scores = [h.score for h in frame.hands]
            hands[i], present[i], scores[i] = assign_hands(detected, labels, hand_scores, pose_frame, req.mirrored)

        return LandmarkSequence(
            hands=hands,
            hand_present=present,
            hand_score=scores,
            pose=pose,
            pose_present=pose_present,
            timestamps_ms=np.arange(n, dtype=np.int64),
            meta={"width": req.width, "height": req.height},
        )

    @torch.no_grad()
    def predict(self, req: PredictRequest, min_hand_rate: float) -> dict:
        start = time.perf_counter()
        seq = self.to_sequence(req)
        hand_rate = float(seq.hand_present.any(axis=1).mean())

        feats = sequence_features(seq, self.feature_cfg)
        feats = np.clip(feats, -self.feature_cfg.clip_value, self.feature_cfg.clip_value)
        feats = (feats - self.mean) / self.std
        logits = self.model(torch.from_numpy(feats[None]).to(self.device)).float().cpu().numpy()[0]
        z = logits / self.temperature
        probs = np.exp(z - z.max())
        probs /= probs.sum()

        best_index = int(np.argmax(probs))
        order = [i for i in np.argsort(-probs) if self.classes[i] != BACKGROUND_LABEL][: req.top_k]
        top = [{"sign": self.classes[i], "label": readable(self.classes[i]), "confidence": float(probs[i])} for i in order]
        best = top[0]

        if hand_rate < min_hand_rate:
            status = "no_hands"
        elif self.classes[best_index] == BACKGROUND_LABEL:
            status = "no_sign"  # the model sees resting hands or an incomplete sign
        elif best["confidence"] < self.threshold:
            status = "uncertain"
        else:
            status = "ok"
        confident = status == "ok"
        return {
            "status": status,
            "sign": best["sign"] if confident else None,
            "label": best["label"] if confident else None,
            "confidence": best["confidence"] if status != "no_sign" else float(probs[best_index]),
            "top_k": top,
            "hand_rate": hand_rate,
            "frames_received": len(req.frames),
            "threshold": self.threshold,
            "model": self.name,
            "inference_ms": round((time.perf_counter() - start) * 1000, 2),
        }
