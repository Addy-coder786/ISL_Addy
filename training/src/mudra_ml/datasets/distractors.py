"""Synthetic non-sign movement ("fidgets"): a hand rises to the face, wiggles, and drops back.

Used as BACKGROUND training samples and as distractors in the continuous benchmark, so the
system learns that touching the face or adjusting hair is not a sign. Synthetic, so it is
a proxy: real recordings of idle movement would be better.
"""

from __future__ import annotations

import numpy as np

from mudra_ml import schema
from mudra_ml.preprocessing.sequence import LandmarkSequence

FACE_POINTS = (0, 9, 10, 7, 8)  # nose, mouth corners, ears


def synth_fidget(seq: LandmarkSequence, rng: np.random.Generator, length: int | None = None) -> LandmarkSequence:
    n = length or int(rng.integers(20, 50))
    pose0 = seq.pose[0].copy()
    side = int(rng.integers(2))
    shoulder = pose0[schema.POSE_LEFT_SHOULDER if side == 0 else schema.POSE_RIGHT_SHOULDER, :2]
    start = np.array([shoulder[0], 1.1], np.float32)  # below the frame: resting hand
    target = pose0[FACE_POINTS[int(rng.integers(len(FACE_POINTS)))], :2] + rng.normal(0, 0.02, 2)

    # hand shape: any detected hand of this clip, expressed relative to its wrist
    frames = np.argwhere(seq.hand_present)
    if len(frames):
        t, h = frames[int(rng.integers(len(frames)))]
        shape = seq.hands[t, h] - seq.hands[t, h, schema.WRIST]
    else:
        shape = rng.normal(0, 0.02, (21, 3)).astype(np.float32)

    hands = np.zeros((n, 2, 21, 3), np.float32)
    present = np.zeros((n, 2), bool)
    pose = np.repeat(pose0[None], n, axis=0)
    wrist_idx = schema.POSE_LEFT_WRIST if side == 0 else schema.POSE_RIGHT_WRIST
    elbow_idx = schema.POSE_LEFT_ELBOW if side == 0 else schema.POSE_RIGHT_ELBOW
    hold = rng.uniform(0.3, 0.6)  # share of the time spent at the face
    for i, u in enumerate(np.linspace(0, 1, n)):
        reach = min(1.0, np.sin(np.pi * u) / np.sin(np.pi * (0.5 - hold / 2))) if 0 < u < 1 else 0.0
        pos = start + (target - start) * reach
        pos = pos + 0.012 * np.array([np.sin(25 * u), np.cos(19 * u)]) * reach  # scratch / adjust wiggle
        if pos[1] < 1.0:
            hands[i, side] = shape
            hands[i, side, :, :2] += pos
            present[i, side] = True
        pose[i, wrist_idx, :2] = pos
        pose[i, elbow_idx, :2] = (pos + shoulder) / 2 + [0, 0.12]
    return LandmarkSequence(hands, present, present.astype(np.float32), pose.astype(np.float32),
                            np.repeat(seq.pose_present[:1], n), np.arange(n), seq.meta)
