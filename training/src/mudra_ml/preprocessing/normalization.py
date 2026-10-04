"""Landmark normalisation: camera-distance and position invariant, location preserving.

Two complementary views of each hand are produced:

* **shape**: landmarks relative to the wrist, scaled by palm size (what the hand looks like)
* **location**: wrist position relative to the shoulders, scaled by shoulder width
  (where the hand is: temple vs chin vs chest; this distinguishes many ISL signs)

Image-normalised MediaPipe x/y are first converted to the same unit (x scaled by
width/height) so non-square frames do not distort hand geometry.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from mudra_ml import schema

EPS = 1e-6


def aspect_correct(points: np.ndarray, width: int, height: int) -> np.ndarray:
    """Scale x (and z, which MediaPipe expresses in x units) by width/height."""
    if width <= 0 or height <= 0:
        return points.astype(np.float32, copy=True)
    out = points.astype(np.float32, copy=True)
    aspect = width / height
    out[..., 0] *= aspect
    if out.shape[-1] >= 3:
        out[..., 2] *= aspect
    return out


def normalize_hand_shape(hands: np.ndarray, present: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Wrist-relative, palm-scaled hand shape.

    Args:
        hands: [..., 21, 3] aspect-corrected landmarks.
        present: [...] boolean hand-presence mask.

    Returns:
        (shape [..., 21, 3], valid [...]). Absent or degenerate hands are all-zero with valid=False.
    """
    rel = hands - hands[..., schema.WRIST : schema.WRIST + 1, :]
    palm = np.linalg.norm(rel[..., schema.MIDDLE_MCP, :2], axis=-1)
    valid = present & (palm > EPS)
    shape = np.where(valid[..., None, None], rel / np.maximum(palm, EPS)[..., None, None], 0.0)
    return shape.astype(np.float32), valid


@dataclass
class BodyFrame:
    center: np.ndarray  # [T, 3] shoulder midpoint
    scale: np.ndarray  # [T] shoulder width
    reliable: bool  # False when no frame had usable shoulders (fallback frame used)


def _fill_missing(values: np.ndarray, valid: np.ndarray) -> np.ndarray:
    """Forward-fill then back-fill rows of ``values`` where ``valid`` is False."""
    out = values.copy()
    idx = np.where(valid, np.arange(len(valid)), -1)
    np.maximum.accumulate(idx, out=idx)
    first = int(np.argmax(valid))
    idx[idx < 0] = first
    return out[idx]


def body_frame(
    pose: np.ndarray, pose_present: np.ndarray, min_visibility: float = 0.5, aspect: float = 1.0
) -> BodyFrame:
    """Per-frame torso reference built from the shoulders.

    Args:
        pose: [T, 33, 4] aspect-corrected pose (x, y, z, visibility).
        pose_present: [T] pose detected flag.
        aspect: width/height, used for the fallback centre when no shoulders are ever visible.
    """
    left = pose[:, schema.POSE_LEFT_SHOULDER]
    right = pose[:, schema.POSE_RIGHT_SHOULDER]
    center = (left[:, :3] + right[:, :3]) / 2.0
    scale = np.linalg.norm(left[:, :2] - right[:, :2], axis=-1)
    valid = (
        pose_present
        & (left[:, 3] >= min_visibility)
        & (right[:, 3] >= min_visibility)
        & (scale > EPS)
    )

    if not valid.any():
        T = len(pose)
        fallback_center = np.tile(np.array([aspect * 0.5, 0.5, 0.0], dtype=np.float32), (T, 1))
        return BodyFrame(center=fallback_center, scale=np.full(T, 0.3, dtype=np.float32), reliable=False)

    return BodyFrame(
        center=_fill_missing(center, valid).astype(np.float32),
        scale=_fill_missing(scale, valid).astype(np.float32),
        reliable=True,
    )


def build_frame_features(
    hands: np.ndarray,
    hand_present: np.ndarray,
    pose: np.ndarray,
    pose_present: np.ndarray,
    width: int,
    height: int,
) -> np.ndarray:
    """Convert one raw landmark sequence into model features ``[T, schema.FRAME_FEATURE_DIM]``.

    Layout per frame: [left shape 63 | left location 3 | right shape 63 | right location 3 |
    upper-body pose 27 | masks 3 (left, right, pose)].
    """
    T = hands.shape[0]
    aspect = width / height if width > 0 and height > 0 else 1.0
    hands_c = aspect_correct(hands, width, height)
    pose_c = aspect_correct(pose, width, height)
    pose_c[..., 3] = pose[..., 3]  # visibility is not a coordinate

    shape, hand_valid = normalize_hand_shape(hands_c, hand_present.astype(bool))
    frame = body_frame(pose_c, pose_present.astype(bool), aspect=aspect)
    center, scale = frame.center, np.maximum(frame.scale, EPS)

    parts = []
    pose_wrists = (schema.POSE_LEFT_WRIST, schema.POSE_RIGHT_WRIST)
    for side in (schema.LEFT, schema.RIGHT):
        wrist_xy = (hands_c[:, side, schema.WRIST, :2] - center[:, :2]) / scale[:, None]
        wrist_z = (pose_c[:, pose_wrists[side], 2] - center[:, 2]) / scale
        wrist_z = np.where(pose_present, wrist_z, 0.0)
        location = np.concatenate([wrist_xy, wrist_z[:, None]], axis=-1)
        location = np.where(hand_valid[:, side, None], location, 0.0)
        parts += [shape[:, side].reshape(T, -1), location]

    body = (pose_c[:, list(schema.UPPER_BODY_POSE_INDICES), :3] - center[:, None, :]) / scale[:, None, None]
    body = np.where(pose_present[:, None, None], body, 0.0)
    parts.append(body.reshape(T, -1))

    masks = np.stack([hand_valid[:, schema.LEFT], hand_valid[:, schema.RIGHT], pose_present], axis=-1)
    parts.append(masks.astype(np.float32))

    features = np.concatenate(parts, axis=-1).astype(np.float32)
    assert features.shape[1] == schema.FRAME_FEATURE_DIM, features.shape
    return features
