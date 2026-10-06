"""Simulate live recognition on test clips, the way the Communicate page works.

For every clip, a rolling window (``--window-s`` seconds) slides forward every
``--stride-s`` seconds; each window is classified, and a word is committed after two
consecutive confident predictions of the same sign (the app's rule). We report how often
the FIRST committed word is correct, wrong, or never committed.

This is the metric that matters for the app: test-set accuracy only scores complete,
pre-cut clips, while the live camera mostly sees partial signs and resting hands.

    python training/scripts/eval_streaming.py --model app/backend/models/isl_mudra_combined_v2_bilstm \
        --split data/metadata/splits/combined_words/test.csv
"""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np
import torch

from mudra_ml.config import project_path
from mudra_ml.data.manifest import read_manifest
from mudra_ml.datasets.isl_dataset import FeatureConfig, sequence_features
from mudra_ml.models.sequence_model import ModelConfig, build_model
from mudra_ml.preprocessing.sequence import LandmarkSequence, load_sequence

BACKGROUND = "_BACKGROUND_"


def window(seq: LandmarkSequence, start: int, end: int) -> LandmarkSequence:
    sl = slice(start, end)
    return LandmarkSequence(
        seq.hands[sl], seq.hand_present[sl], seq.hand_score[sl], seq.pose[sl], seq.pose_present[sl],
        seq.timestamps_ms[sl], seq.meta,
    )


class Predictor:
    def __init__(self, model_dir: Path, threshold: float | None):
        card = json.loads((model_dir / "model_card.json").read_text(encoding="utf-8"))
        self.card = card
        self.classes = card["classes"]
        self.cfg = FeatureConfig.from_dict(card["feature_config"])
        self.mean = np.asarray(card["feature_mean"], np.float32)
        self.std = np.asarray(card["feature_std"], np.float32)
        self.temperature = card["temperature"]
        self.threshold = threshold if threshold is not None else card["uncertain_threshold"]
        self.model = build_model(ModelConfig.from_dict(card["model_config"]))
        self.model.load_state_dict(torch.load(model_dir / "model.pt", map_location="cpu", weights_only=True))
        self.model.eval()

    @torch.no_grad()
    def predict_batch(self, windows: list[LandmarkSequence]) -> list[tuple[str, float]]:
        feats = [
            (np.clip(sequence_features(w, self.cfg), -self.cfg.clip_value, self.cfg.clip_value) - self.mean) / self.std
            for w in windows
        ]
        logits = self.model(torch.from_numpy(np.stack(feats))).numpy() / self.temperature
        probs = np.exp(logits - logits.max(axis=1, keepdims=True))
        probs /= probs.sum(axis=1, keepdims=True)
        top = probs.argmax(axis=1)
        return [(self.classes[i], float(probs[k, i])) for k, i in enumerate(top)]


def simulate(pred: Predictor, seq: LandmarkSequence, fps: float, window_s: float, stride_s: float,
             min_hand_share: float = 0.4, min_frames: int = 12) -> str | None:
    """Return the first committed sign for one clip (None if nothing was committed)."""
    n = seq.num_frames
    win = max(min_frames, round(window_s * fps))
    stride = max(1, round(stride_s * fps))
    ends = list(range(min_frames, n + 1, stride))
    if not ends or ends[-1] != n:
        ends.append(n)
    windows, keep = [], []
    for end in ends:
        start = max(0, end - win)
        w = window(seq, start, end)
        if w.hand_present.any(axis=1).mean() >= min_hand_share:  # client skips windows without hands
            windows.append(w)
            keep.append(end)
    if not windows:
        return None
    previous = None
    for sign, conf in pred.predict_batch(windows):
        ok = conf >= pred.threshold and sign != BACKGROUND
        if ok and sign == previous:
            return sign
        previous = sign if ok else None
    return None


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--model", required=True, type=Path)
    parser.add_argument("--split", required=True, type=Path)
    parser.add_argument("--window-s", type=float, default=2.5)
    parser.add_argument("--stride-s", type=float, default=0.25)
    parser.add_argument("--default-fps", type=float, default=25.0, help="for clips without fps metadata (INCLUDE)")
    parser.add_argument("--threshold", type=float, default=None)
    parser.add_argument("--out", type=Path, default=None)
    args = parser.parse_args()

    pred = Predictor(project_path(args.model), args.threshold)
    known = set(pred.classes)
    rows = [r for r in read_manifest(project_path(args.split)) if r.label in known]
    by_source: dict[str, Counter] = defaultdict(Counter)
    wrong_examples: Counter = Counter()
    for r in rows:
        seq = load_sequence(Path(r.landmarks_path))
        fps = float(seq.meta.get("fps") or 0) or args.default_fps
        committed = simulate(pred, seq, fps, args.window_s, args.stride_s)
        outcome = "none" if committed is None else ("correct" if committed == r.label else "wrong")
        by_source[r.source][outcome] += 1
        if outcome == "wrong":
            wrong_examples[f"{r.label} -> {committed}"] += 1

    report = {"model": pred.card["name"], "window_s": args.window_s, "stride_s": args.stride_s,
              "threshold": pred.threshold, "per_source": {}}
    for src, c in sorted(by_source.items()):
        n = sum(c.values())
        report["per_source"][src] = {k: c[k] / n for k in ("correct", "wrong", "none")} | {"clips": n}
        print(f"{src:10s} clips {n:4d} | correct {c['correct'] / n:6.1%} | wrong {c['wrong'] / n:6.1%} | no commit {c['none'] / n:6.1%}")
    report["top_wrong"] = wrong_examples.most_common(10)
    print("most common wrong commits:", ", ".join(f"{k} x{v}" for k, v in wrong_examples.most_common(6)))
    if args.out:
        out = project_path(args.out)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(report, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
