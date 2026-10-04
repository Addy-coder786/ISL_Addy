"""Keypoint layout shared by extraction, training and (later) browser inference.

A landmark sequence is stored per clip as an ``.npz`` with these arrays
(T = number of extracted frames, coordinates in MediaPipe image-normalised units):

    hands          float32 [T, 2, 21, 3]   index 0 = signer's LEFT hand, 1 = signer's RIGHT hand
    hand_present   bool    [T, 2]
    hand_score     float32 [T, 2]          handedness/detection score (0 when absent)
    pose           float32 [T, 33, 4]      x, y, z, visibility (MediaPipe Pose, anatomical left/right)
    pose_present   bool    [T]
    timestamps_ms  int64   [T]
    meta           JSON string             fps, width, height, source path, extractor version

Hands are stored raw so normalisation can change without re-extracting videos.
"""

from __future__ import annotations

SCHEMA_VERSION = 1

NUM_HAND_LANDMARKS = 21
NUM_POSE_LANDMARKS = 33
LEFT, RIGHT = 0, 1

# Hand landmark indices (MediaPipe Hands)
WRIST = 0
MIDDLE_MCP = 9
INDEX_MCP = 5
PINKY_MCP = 17

# Pose landmark indices (MediaPipe Pose, anatomical: "left" = signer's left)
POSE_NOSE = 0
POSE_LEFT_EYE = 2
POSE_RIGHT_EYE = 5
POSE_LEFT_SHOULDER = 11
POSE_RIGHT_SHOULDER = 12
POSE_LEFT_ELBOW = 13
POSE_RIGHT_ELBOW = 14
POSE_LEFT_WRIST = 15
POSE_RIGHT_WRIST = 16

# Upper-body subset used as model input (hand location relative to face/torso matters in ISL).
UPPER_BODY_POSE_INDICES: tuple[int, ...] = (
    POSE_NOSE,
    POSE_LEFT_EYE,
    POSE_RIGHT_EYE,
    POSE_LEFT_SHOULDER,
    POSE_RIGHT_SHOULDER,
    POSE_LEFT_ELBOW,
    POSE_RIGHT_ELBOW,
    POSE_LEFT_WRIST,
    POSE_RIGHT_WRIST,
)

# Per-frame feature layout produced by normalization.build_frame_features
HAND_SHAPE_DIM = NUM_HAND_LANDMARKS * 3  # wrist-relative, palm-scaled
HAND_LOCATION_DIM = 3  # wrist position relative to shoulders
POSE_DIM = len(UPPER_BODY_POSE_INDICES) * 3
MASK_DIM = 3  # left present, right present, pose present
FRAME_FEATURE_DIM = 2 * (HAND_SHAPE_DIM + HAND_LOCATION_DIM) + POSE_DIM + MASK_DIM
