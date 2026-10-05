"""Landmark sequence container and hand-slot assignment (numpy only).

Shared by offline extraction, training and the inference API, so live predictions
assign hands exactly as the training data did.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np

from mudra_ml import schema


@dataclass
class LandmarkSequence:
    hands: np.ndarray
    hand_present: np.ndarray
    hand_score: np.ndarray
    pose: np.ndarray
    pose_present: np.ndarray
    timestamps_ms: np.ndarray
    meta: dict = field(default_factory=dict)

    @property
    def num_frames(self) -> int:
        return int(self.hands.shape[0])

    def detection_rates(self) -> dict[str, float]:
        if self.num_frames == 0:
            return {"any_hand": 0.0, "left_hand": 0.0, "right_hand": 0.0, "pose": 0.0}
        return {
            "any_hand": float(self.hand_present.any(axis=1).mean()),
            "left_hand": float(self.hand_present[:, schema.LEFT].mean()),
            "right_hand": float(self.hand_present[:, schema.RIGHT].mean()),
            "pose": float(self.pose_present.mean()),
        }

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        np.savez_compressed(
            path,
            hands=self.hands,
            hand_present=self.hand_present,
            hand_score=self.hand_score,
            pose=self.pose,
            pose_present=self.pose_present,
            timestamps_ms=self.timestamps_ms,
            meta=np.array(json.dumps(self.meta)),
        )


def load_sequence(path: Path) -> LandmarkSequence:
    with np.load(path, allow_pickle=False) as data:
        return LandmarkSequence(
            hands=data["hands"],
            hand_present=data["hand_present"],
            hand_score=data["hand_score"],
            pose=data["pose"],
            pose_present=data["pose_present"],
            timestamps_ms=data["timestamps_ms"],
            meta=json.loads(str(data["meta"])),
        )


def assign_hands(
    detected: list[np.ndarray],
    labels: list[str],
    scores: list[float],
    pose_frame: np.ndarray | None,
    mirrored_input: bool,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Place detected hands into fixed [signer-left, signer-right] slots.

    Preferred: match each hand's wrist to the nearest pose wrist (anatomical labels).
    Fallback: MediaPipe handedness, which assumes a mirrored (selfie) image, so labels
    are swapped for ordinary, unmirrored video.
    """
    hands = np.zeros((2, schema.NUM_HAND_LANDMARKS, 3), dtype=np.float32)
    present = np.zeros(2, dtype=bool)
    score = np.zeros(2, dtype=np.float32)
    if not detected:
        return hands, present, score

    slots: list[int]
    if pose_frame is not None:
        pose_wrists = pose_frame[[schema.POSE_LEFT_WRIST, schema.POSE_RIGHT_WRIST], :2]
        dists = np.array([[np.linalg.norm(h[schema.WRIST, :2] - pw) for pw in pose_wrists] for h in detected])
        if len(detected) == 1:
            slots = [int(np.argmin(dists[0]))]
        else:
            straight = dists[0, 0] + dists[1, 1]
            crossed = dists[0, 1] + dists[1, 0]
            slots = [0, 1] if straight <= crossed else [1, 0]
    else:
        slots = []
        for label in labels:
            is_left_label = label.lower() == "left"
            signer_left = is_left_label if mirrored_input else not is_left_label
            slots.append(schema.LEFT if signer_left else schema.RIGHT)
        if len(slots) == 2 and slots[0] == slots[1]:
            slots[1] = 1 - slots[0]

    scores = list(scores) + [1.0] * (len(detected) - len(scores))  # missing scores must not drop hands
    for hand, slot, s in zip(detected[:2], slots, scores):
        if present[slot] and score[slot] >= s:
            continue
        hands[slot], present[slot], score[slot] = hand, True, s
    return hands, present, score
