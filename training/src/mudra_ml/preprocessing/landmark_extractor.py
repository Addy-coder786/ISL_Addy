"""MediaPipe Tasks landmark extraction for videos and images.

Produces the raw arrays described in :mod:`mudra_ml.schema`. No frames or face
images are stored, only landmarks (privacy by default).
"""

from __future__ import annotations

from pathlib import Path

import cv2
import mediapipe as mp
import numpy as np
from mediapipe.tasks.python import BaseOptions, vision

from mudra_ml import schema
from mudra_ml.preprocessing.frame_sampler import resample_step
from mudra_ml.preprocessing.sequence import LandmarkSequence, assign_hands, load_sequence

__all__ = ["DEFAULT_ASSET_DIR", "LandmarkExtractor", "LandmarkSequence", "assign_hands", "load_sequence"]

DEFAULT_ASSET_DIR = Path(__file__).resolve().parents[3] / "assets" / "mediapipe"
EXTRACTOR_VERSION = "mp-tasks-1"


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
        hand_crop: bool = False,
        crop_scale: float = 3.2,
        crop_size: int = 640,
    ) -> None:
        """``hand_crop``: find the body first, then look for hands in a zoomed crop around the upper body.

        In full-body videos the hands are small and blurred in motion, so the hand detector often loses them
        mid-sign. The crop (``crop_scale`` shoulder widths square, resized to ``crop_size`` px) makes them large,
        like a webcam sees them; landmarks are mapped back to full-frame coordinates.
        """
        self.asset_dir = Path(asset_dir)
        self.pose_model = pose_model
        self.min_hand_conf = min_hand_detection_confidence
        self.min_pose_conf = min_pose_detection_confidence
        self.max_fps = max_fps
        self.mirrored_input = mirrored_input
        self.hand_crop = hand_crop
        self.crop_scale = crop_scale
        self.crop_size = crop_size
        self._box: np.ndarray | None = None  # smoothed crop box (cx, cy, side) in pixels, per video

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

    def _crop_box(self, pose_arr: np.ndarray, width: int, height: int) -> np.ndarray | None:
        ls, rs = pose_arr[schema.POSE_LEFT_SHOULDER], pose_arr[schema.POSE_RIGHT_SHOULDER]
        if min(ls[3], rs[3]) < 0.3:
            return self._box
        sw = float(np.linalg.norm((ls[:2] - rs[:2]) * [width, height]))
        if sw < 8:
            return self._box
        centre = (ls[:2] + rs[:2]) / 2 * [width, height] + [0, 0.35 * sw]  # signing space: head to waist
        box = np.array([centre[0], centre[1], self.crop_scale * sw], np.float32)
        self._box = box if self._box is None else 0.7 * self._box + 0.3 * box  # steady crop for hand tracking
        return self._box

    def _detect_hands(self, rgb: np.ndarray, hand_lm, timestamp_ms: int | None, pose_arr, pose_ok):
        """Hands in the full frame, or in a zoomed upper-body crop mapped back to full-frame coordinates."""
        height, width = rgb.shape[:2]
        box = self._crop_box(pose_arr, width, height) if (self.hand_crop and pose_ok) else (self._box if self.hand_crop else None)
        if box is None:
            image = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb))
            res = hand_lm.detect(image) if timestamp_ms is None else hand_lm.detect_for_video(image, timestamp_ms)
            return res, None
        cx, cy, side = (float(v) for v in box)
        x0, y0 = int(round(cx - side / 2)), int(round(cy - side / 2))
        s = int(round(side))
        crop = np.zeros((s, s, 3), np.uint8)  # out-of-frame parts stay black
        sx0, sy0, sx1, sy1 = max(x0, 0), max(y0, 0), min(x0 + s, width), min(y0 + s, height)
        if sx1 > sx0 and sy1 > sy0:
            crop[sy0 - y0:sy1 - y0, sx0 - x0:sx1 - x0] = rgb[sy0:sy1, sx0:sx1]
        crop = cv2.resize(crop, (self.crop_size, self.crop_size), interpolation=cv2.INTER_AREA if s > self.crop_size else cv2.INTER_LINEAR)
        image = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(crop))
        res = hand_lm.detect(image) if timestamp_ms is None else hand_lm.detect_for_video(image, timestamp_ms)
        return res, (x0, y0, s, width, height)

    def _process(self, rgb: np.ndarray, hand_lm, pose_lm, timestamp_ms: int | None):
        image = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb))
        pose_res = pose_lm.detect(image) if timestamp_ms is None else pose_lm.detect_for_video(image, timestamp_ms)

        pose_arr = np.zeros((schema.NUM_POSE_LANDMARKS, 4), dtype=np.float32)
        pose_ok = bool(pose_res.pose_landmarks)
        if pose_ok:
            pose_arr[:] = [(p.x, p.y, p.z, p.visibility or 0.0) for p in pose_res.pose_landmarks[0]]

        hand_res, crop = self._detect_hands(rgb, hand_lm, timestamp_ms, pose_arr, pose_ok)
        detected = [np.array([(p.x, p.y, p.z) for p in h], dtype=np.float32) for h in hand_res.hand_landmarks]
        if crop is not None:
            x0, y0, s, width, height = crop
            for d in detected:
                d[:, 0] = (d[:, 0] * s + x0) / width
                d[:, 1] = (d[:, 1] * s + y0) / height
                d[:, 2] = d[:, 2] * s / width  # MediaPipe z uses the image width's scale
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
        self._box = None
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
            "hand_crop": self.hand_crop,
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
