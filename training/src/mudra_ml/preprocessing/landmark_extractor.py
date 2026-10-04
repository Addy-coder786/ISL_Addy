"""MediaPipe Tasks landmark extraction for videos and images.

Produces the raw arrays described in :mod:`mudra_ml.schema`. No frames or face
images are stored, only landmarks (privacy by default).
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

import cv2
import mediapipe as mp
import numpy as np
from mediapipe.tasks.python import BaseOptions, vision

from mudra_ml import schema
from mudra_ml.preprocessing.frame_sampler import resample_step

DEFAULT_ASSET_DIR = Path(__file__).resolve().parents[3] / "assets" / "mediapipe"
EXTRACTOR_VERSION = "mp-tasks-1"


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

    for hand, slot, s in zip(detected[:2], slots, scores):
        if present[slot] and score[slot] >= s:
            continue
        hands[slot], present[slot], score[slot] = hand, True, s
    return hands, present, score


class LandmarkExtractor:
    """Runs MediaPipe HandLandmarker + PoseLandmarker over a clip.

    Create one extractor per process; MediaPipe graphs are not shared across processes.
    """

    def __init__(
        self,
        asset_dir: Path = DEFAULT_ASSET_DIR,
        pose_model: str = "pose_landmarker_full.task",
        min_hand_detection_confidence: float = 0.5,
        min_pose_detection_confidence: float = 0.5,
        max_fps: float = 30.0,
        mirrored_input: bool = False,
    ) -> None:
        self.asset_dir = Path(asset_dir)
        self.pose_model = pose_model
        self.min_hand_conf = min_hand_detection_confidence
        self.min_pose_conf = min_pose_detection_confidence
        self.max_fps = max_fps
        self.mirrored_input = mirrored_input

    def _create(self, running_mode):
        hand = vision.HandLandmarker.create_from_options(
            vision.HandLandmarkerOptions(
                base_options=BaseOptions(model_asset_path=str(self.asset_dir / "hand_landmarker.task")),
                running_mode=running_mode,
                num_hands=2,
                min_hand_detection_confidence=self.min_hand_conf,
            )
        )
        pose = vision.PoseLandmarker.create_from_options(
            vision.PoseLandmarkerOptions(
                base_options=BaseOptions(model_asset_path=str(self.asset_dir / self.pose_model)),
                running_mode=running_mode,
                min_pose_detection_confidence=self.min_pose_conf,
            )
        )
        return hand, pose

    def _process(self, rgb: np.ndarray, hand_lm, pose_lm, timestamp_ms: int | None):
        image = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb))
        if timestamp_ms is None:
            hand_res, pose_res = hand_lm.detect(image), pose_lm.detect(image)
        else:
            hand_res = hand_lm.detect_for_video(image, timestamp_ms)
            pose_res = pose_lm.detect_for_video(image, timestamp_ms)

        pose_arr = np.zeros((schema.NUM_POSE_LANDMARKS, 4), dtype=np.float32)
        pose_ok = bool(pose_res.pose_landmarks)
        if pose_ok:
            pose_arr[:] = [(p.x, p.y, p.z, p.visibility or 0.0) for p in pose_res.pose_landmarks[0]]

        detected = [np.array([(p.x, p.y, p.z) for p in h], dtype=np.float32) for h in hand_res.hand_landmarks]
        labels = [c[0].category_name for c in hand_res.handedness]
        scores = [float(c[0].score) for c in hand_res.handedness]
        hands, present, score = assign_hands(
            detected, labels, scores, pose_arr if pose_ok else None, self.mirrored_input
        )
        return hands, present, score, pose_arr, pose_ok

    def extract_video(self, path: Path) -> LandmarkSequence:
        cap = cv2.VideoCapture(str(path))
        if not cap.isOpened():
            raise OSError(f"Cannot open video: {path}")
        fps = cap.get(cv2.CAP_PROP_FPS) or 0.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        step = resample_step(fps, self.max_fps)

        rows: list[tuple] = []
        timestamps: list[int] = []
        hand_lm, pose_lm = self._create(vision.RunningMode.VIDEO)
        try:
            frame_idx, last_ts = 0, -1
            while True:
                ok, frame = cap.read()
                if not ok:
                    break
                if frame_idx % step == 0:
                    ts = round(frame_idx * 1000.0 / fps) if fps > 0 else frame_idx * 33
                    ts = max(ts, last_ts + 1)  # MediaPipe requires strictly increasing timestamps
                    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    rows.append(self._process(rgb, hand_lm, pose_lm, ts))
                    timestamps.append(ts)
                    last_ts = ts
                frame_idx += 1
        finally:
            hand_lm.close()
            pose_lm.close()
            cap.release()

        if not rows:
            raise ValueError(f"No decodable frames in video: {path}")

        return self._to_sequence(
            rows,
            timestamps,
            meta={
                "source_path": str(path),
                "kind": "video",
                "fps": fps / step if fps > 0 else 0.0,
                "source_fps": fps,
                "decoded_frames": frame_idx,
                "width": width,
                "height": height,
            },
        )

    def extract_image(self, path: Path) -> LandmarkSequence:
        frame = cv2.imread(str(path))
        if frame is None:
            raise OSError(f"Cannot read image: {path}")
        height, width = frame.shape[:2]
        hand_lm, pose_lm = self._create(vision.RunningMode.IMAGE)
        try:
            row = self._process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB), hand_lm, pose_lm, None)
        finally:
            hand_lm.close()
            pose_lm.close()
        return self._to_sequence(
            [row], [0], meta={"source_path": str(path), "kind": "image", "fps": 0.0, "width": width, "height": height}
        )

    def _to_sequence(self, rows: list[tuple], timestamps: list[int], meta: dict) -> LandmarkSequence:
        hands, present, score, pose, pose_ok = (np.stack(col) for col in zip(*rows))
        meta = {
            **meta,
            "schema_version": schema.SCHEMA_VERSION,
            "extractor_version": EXTRACTOR_VERSION,
            "pose_model": self.pose_model,
            "mirrored_input": self.mirrored_input,
        }
        return LandmarkSequence(
            hands=hands.astype(np.float32),
            hand_present=present.astype(bool),
            hand_score=score.astype(np.float32),
            pose=pose.astype(np.float32),
            pose_present=pose_ok.astype(bool),
            timestamps_ms=np.asarray(timestamps, dtype=np.int64),
            meta=meta,
        )
