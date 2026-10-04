"""End-to-end smoke tests for MediaPipe extraction (no real signer needed)."""

import cv2
import numpy as np
import pytest

from mudra_ml import schema
from mudra_ml.preprocessing.landmark_extractor import (
    DEFAULT_ASSET_DIR,
    LandmarkExtractor,
    assign_hands,
    load_sequence,
)

pytestmark = pytest.mark.skipif(
    not (DEFAULT_ASSET_DIR / "hand_landmarker.task").exists(), reason="MediaPipe models not downloaded"
)


def test_blank_video_yields_empty_masks_and_roundtrips(tmp_path):
    path = tmp_path / "blank.mp4"
    writer = cv2.VideoWriter(str(path), cv2.VideoWriter_fourcc(*"mp4v"), 30, (320, 240))
    for _ in range(12):
        writer.write(np.full((240, 320, 3), 127, np.uint8))
    writer.release()

    seq = LandmarkExtractor().extract_video(path)
    assert seq.num_frames == 12
    assert seq.hands.shape == (12, 2, schema.NUM_HAND_LANDMARKS, 3)
    assert seq.pose.shape == (12, schema.NUM_POSE_LANDMARKS, 4)
    assert not seq.hand_present.any() and not seq.pose_present.any()
    assert np.all(np.diff(seq.timestamps_ms) > 0)

    out = tmp_path / "blank.npz"
    seq.save(out)
    loaded = load_sequence(out)
    np.testing.assert_array_equal(loaded.hands, seq.hands)
    assert loaded.meta["width"] == 320 and loaded.meta["schema_version"] == schema.SCHEMA_VERSION


def test_hand_assignment_uses_pose_wrists():
    pose = np.zeros((33, 4), np.float32)
    pose[schema.POSE_LEFT_WRIST, :2] = [0.7, 0.5]  # signer's left appears on image right
    pose[schema.POSE_RIGHT_WRIST, :2] = [0.3, 0.5]
    near_right = np.zeros((21, 3), np.float32)
    near_right[schema.WRIST, :2] = [0.31, 0.5]
    near_left = np.zeros((21, 3), np.float32)
    near_left[schema.WRIST, :2] = [0.69, 0.5]
    # Handedness labels deliberately misleading: pose geometry must win
    hands, present, _ = assign_hands([near_right, near_left], ["Right", "Right"], [0.9, 0.8], pose, False)
    assert present.all()
    assert hands[schema.RIGHT, schema.WRIST, 0] == pytest.approx(0.31)
    assert hands[schema.LEFT, schema.WRIST, 0] == pytest.approx(0.69)


def test_hand_assignment_fallback_swaps_labels_for_unmirrored_video():
    hand = np.zeros((21, 3), np.float32)
    _, present, _ = assign_hands([hand], ["Left"], [0.9], None, mirrored_input=False)
    assert present[schema.RIGHT] and not present[schema.LEFT]
    _, present, _ = assign_hands([hand], ["Left"], [0.9], None, mirrored_input=True)
    assert present[schema.LEFT]
