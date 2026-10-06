"""Continuous-stream benchmark: how the app behaves on a live camera.

Held-out clips are joined into streams (smooth 0.3-1.0 s transitions, plus 2-4 s idle
stretches every few signs), with known sign intervals. Two systems are scored:

  baseline  current app logic: 4 s rolling window every 0.25 s, commit after two equal
            confident predictions, reset after 0.8 s without hands
  segment   SignSegmenter (resting -> signing -> ended) + one whole-sign classification

Metrics per source: correct / wrong / missed per true sign, extra words per sign,
false triggers per idle minute, delay from sign end to word.

    python training/scripts/eval_continuous.py --split .../val.csv --tune      # choose segmenter settings
    python training/scripts/eval_continuous.py --split .../test.csv            # report with saved settings
"""

from __future__ import annotations

import argparse
import itertools
import json
from collections import defaultdict
from pathlib import Path

import numpy as np

from mudra_ml.config import project_path
from mudra_ml.data.manifest import read_manifest
from mudra_ml.datasets.distractors import synth_fidget
from mudra_ml.preprocessing.sequence import LandmarkSequence, load_sequence
from mudra_ml.streaming import Frame, ModelBundle, SegmenterConfig, StreamingRecognizer

CFG_PATH = project_path("training/configs/streaming.json")


def build_streams(rows, classes, fps, signs_per_stream=8, seed=0, fidgets=True):
    rng = np.random.default_rng(seed)
    rows = [r for r in rows if r.label in classes]
    order = rng.permutation(len(rows))
    streams = []
    for k in range(0, len(order), signs_per_stream):
        hands, present, pose, pose_p, truth, idle = [], [], [], [], [], []
        prev, prev_seq = None, None
        for j, idx in enumerate(order[k : k + signs_per_stream]):
            r = rows[idx]
            s = load_sequence(Path(r.landmarks_path))
            if prev is not None:  # smooth transition: interpolate last frame of previous clip -> first frame of this one
                n = int(rng.uniform(0.3, 1.0) * fps)
                if j % 3 == 0:  # idle stretch: rest, often with a fidget (face touch / hair), then transition
                    hold = int(rng.uniform(2.0, 4.0) * fps)
                    i0 = len(hands)
                    for _ in range(hold):
                        jit = rng.normal(0, 0.002, prev[0].shape).astype(np.float32)
                        hands.append(prev[0] + jit * prev[1][:, None, None]); present.append(prev[1]); pose.append(prev[2]); pose_p.append(prev[3])
                    if fidgets and rng.random() < 0.7:
                        f = synth_fidget(prev_seq, rng, length=int(rng.uniform(0.8, 1.6) * fps))
                        k = i0 + int(rng.integers(0, max(1, hold - len(f.hands))))
                        for m in range(min(len(f.hands), len(hands) - k)):
                            hands[k + m], present[k + m], pose[k + m] = f.hands[m], f.hand_present[m], f.pose[m]
                    idle.append((i0, len(hands)))
                for a in np.linspace(0, 1, n + 2)[1:-1]:
                    both = prev[1] & s.hand_present[0]
                    h = ((1 - a) * prev[0] + a * s.hands[0]) * both[:, None, None]
                    hands.append(h.astype(np.float32)); present.append(both)
                    pose.append(((1 - a) * prev[2] + a * s.pose[0]).astype(np.float32)); pose_p.append(prev[3] and s.pose_present[0])
            start = len(hands)
            hands += list(s.hands); present += list(s.hand_present); pose += list(s.pose); pose_p += list(s.pose_present)
            truth.append((start / fps, len(hands) / fps, r.label))
            prev = (s.hands[-1], s.hand_present[-1], s.pose[-1], bool(s.pose_present[-1]))
            prev_seq = s
            meta = s.meta
        streams.append({"hands": np.stack(hands), "present": np.stack(present), "pose": np.stack(pose),
                        "pose_present": np.array(pose_p), "truth": truth, "idle": [(a / fps, b / fps) for a, b in idle],
                        "width": int(meta["width"]), "height": int(meta["height"])})
    return streams


def run_segmenter(bundle, cfg, st, fps):
    rec = StreamingRecognizer(bundle, SegmenterConfig(**{**cfg.to_dict(), "provisional_s": 1e9}), st["width"], st["height"])
    words = []
    for i in range(len(st["hands"])):
        ev = rec.push(Frame(i / fps, st["hands"][i], st["present"][i], st["pose"][i], bool(st["pose_present"][i])))
        if ev and ev.get("event") == "sign_ended" and ev["result"]["status"] == "ok":
            words.append((ev["t0"], ev["t1"], i / fps, ev["result"]["sign"]))
    return words


def run_baseline(bundle, st, fps, window_s=4.0, stride_s=0.25):
    n, win, stride = len(st["hands"]), round(window_s * fps), round(stride_s * fps)
    ends = list(range(12, n + 1, stride))
    segs, kept = [], []
    for e in ends:
        a = max(0, e - win)
        if st["present"][a:e].any(axis=1).mean() >= 0.4:
            segs.append(LandmarkSequence(st["hands"][a:e], st["present"][a:e], st["present"][a:e].astype(np.float32),
                                         st["pose"][a:e], st["pose_present"][a:e], np.arange(e - a), {}))
            kept.append(e)
    probs = bundle.probs(segs, st["width"], st["height"]) if segs else []
    words, prev, last_commit, last_hand = [], None, None, 0
    kept_set = dict(zip(kept, range(len(kept))))
    for e in ends:
        if st["present"][e - 1].any():
            last_hand = e
        elif (e - last_hand) / fps > 0.8:
            last_commit, prev = None, None
        if e not in kept_set:
            continue
        d = bundle.decide(probs[kept_set[e]])
        if d["status"] == "ok":
            if d["sign"] == prev and d["sign"] != last_commit:
                words.append((max(0, e - win) / fps, e / fps, e / fps, d["sign"]))
                last_commit = d["sign"]
            prev = d["sign"]
        else:
            prev = None
    return words


def score(streams, outputs):
    c = defaultdict(float)
    delays = []
    for st, words in zip(streams, outputs):
        matched = set()
        for t0, t1, t_commit, sign in words:
            overlaps = [(min(t1, e) - max(t0, s), k) for k, (s, e, _) in enumerate(st["truth"])]
            ov, k = max(overlaps)
            if ov <= 0 or k in matched:
                in_idle = any(a <= t_commit <= b for a, b in st["idle"])
                c["idle_false" if in_idle else "extra"] += 1
                continue
            matched.add(k)
            c["correct" if sign == st["truth"][k][2] else "wrong"] += 1
            delays.append(t_commit - st["truth"][k][1])
        c["signs"] += len(st["truth"])
        c["idle_min"] += sum(b - a for a, b in st["idle"]) / 60
    n = c["signs"]
    return {"signs": int(n), "correct": c["correct"] / n, "wrong": c["wrong"] / n,
            "missed": (n - c["correct"] - c["wrong"]) / n, "extra_per_sign": c["extra"] / n,
            "idle_false_per_min": c["idle_false"] / max(c["idle_min"], 1e-9),
            "median_delay_s": float(np.median(delays)) if delays else None}


def objective(m):
    return m["correct"] - 3 * m["wrong"] - 3 * m["extra_per_sign"] - 0.5 * m["idle_false_per_min"]


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--model", default="app/backend/models/isl_mudra_combined_v2_bilstm")
    ap.add_argument("--split", required=True)
    ap.add_argument("--tune", action="store_true")
    ap.add_argument("--tune-threshold-only", action="store_true", help="keep saved segmenter settings, tune only the threshold")
    ap.add_argument("--default-fps", type=float, default=25.0)
    ap.add_argument("--config-out", default=None, help="where tuned settings are saved (default training/configs/streaming.json)")
    ap.add_argument("--out", default=None)
    args = ap.parse_args()

    bundle = ModelBundle(project_path(args.model))
    rows = read_manifest(project_path(args.split))
    by_src = defaultdict(list)
    for r in rows:
        by_src[r.source].append(r)
    data = {}
    for src, rs in by_src.items():
        fps = float(load_sequence(Path(rs[0].landmarks_path)).meta.get("fps") or 0) or args.default_fps
        data[src] = (fps, build_streams(rs, set(bundle.classes), fps))

    cfg_path = project_path(args.config_out) if args.config_out else CFG_PATH
    cfg = SegmenterConfig.load(cfg_path if cfg_path.exists() else CFG_PATH)
    if args.tune_threshold_only:
        args.tune = True
    if args.tune:
        grid = {} if args.tune_threshold_only else {"raise_y": [0.5, 0.75, 1.0], "speed": [2.0, 3.0, 4.0], "on_s": [0.05, 0.1], "off_s": [0.3, 0.4, 0.5]}
        best = (None, cfg) if not grid else None
        for vals in (itertools.product(*grid.values()) if grid else []):
            trial = SegmenterConfig(**{**cfg.to_dict(), **dict(zip(grid, vals))})
            ms = [score(sts, [run_segmenter(bundle, trial, st, fps) for st in sts]) for fps, sts in data.values()]
            val = float(np.mean([objective(m) for m in ms]))
            if best is None or val > best[0]:
                best = (val, trial)
        cfg = best[1]
        # Stage 2: whole-sign commit threshold (window-tuned card threshold is too strict for full signs)
        best_t = None
        for th, mg, tta in itertools.product((0.6, 0.7, 0.8, 0.9), (0.0, 0.2, 0.4), (1, 3, 5)):
            trial = SegmenterConfig(**{**cfg.to_dict(), "commit_threshold": th, "margin": mg, "tta": tta})
            ms = [score(sts, [run_segmenter(bundle, trial, st, fps) for st in sts]) for fps, sts in data.values()]
            val = float(np.mean([objective(m) for m in ms]))
            if best_t is None or val > best_t[0]:
                best_t = (val, trial)
        cfg = best_t[1]
        print("decision chosen:", {"threshold": cfg.commit_threshold, "margin": cfg.margin, "tta": cfg.tta})
        cfg_path.write_text(json.dumps(cfg.to_dict(), indent=2), encoding="utf-8")
        print("chosen on this split:", {k: getattr(cfg, k) for k in grid}, f"-> {cfg_path.name}")

    report = {"model": bundle.name, "segmenter": cfg.to_dict(), "results": {}}
    for src, (fps, sts) in data.items():
        for name, outs in (("baseline", [run_baseline(bundle, st, fps) for st in sts]),
                           ("segment", [run_segmenter(bundle, cfg, st, fps) for st in sts])):
            m = score(sts, outs)
            report["results"][f"{src}/{name}"] = m
            d = f"{m['median_delay_s']:.2f}s" if m["median_delay_s"] is not None else "-"
            print(f"{src:9s} {name:8s} signs {m['signs']:4d} | correct {m['correct']:6.1%} wrong {m['wrong']:5.1%} "
                  f"missed {m['missed']:5.1%} | extra/sign {m['extra_per_sign']:.3f} idle false/min {m['idle_false_per_min']:.2f} | delay {d}")
    if args.out:
        Path(project_path(args.out)).write_text(json.dumps(report, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
