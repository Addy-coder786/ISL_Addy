import numpy as np

from mudra_ml import schema
from mudra_ml.preprocessing.normalization import (
    aspect_correct,
    body_frame,
    build_frame_features,
    normalize_hand_shape,
)


def make_hand(rng, center=(0.5, 0.5), size=0.1):
    hand = rng.normal(size=(21, 3)).astype(np.float32) * size
    hand[schema.WRIST] = 0
    hand[schema.MIDDLE_MCP] = [0, -size, 0]  # palm points up with known length
    hand[:, :2] += center
    return hand


def make_pose(shoulder_center=(0.5, 0.6), shoulder_width=0.3):
    pose = np.zeros((33, 4), dtype=np.float32)
    cx, cy = shoulder_center
    pose[schema.POSE_LEFT_SHOULDER] = [cx + shoulder_width / 2, cy, 0, 1]
    pose[schema.POSE_RIGHT_SHOULDER] = [cx - shoulder_width / 2, cy, 0, 1]
    pose[schema.POSE_NOSE] = [cx, cy - 0.2, 0, 1]
    return pose


def test_hand_shape_is_translation_and_scale_invariant():
    rng = np.random.default_rng(0)
    base = make_hand(rng)
    moved = (base - base[schema.WRIST]) * 2.5 + np.array([0.2, 0.7, 0.0], dtype=np.float32)
    a, va = normalize_hand_shape(base[None], np.array([True]))
    b, vb = normalize_hand_shape(moved[None], np.array([True]))
    assert va[0] and vb[0]
    np.testing.assert_allclose(a, b, atol=1e-5)
    np.testing.assert_allclose(a[0, schema.WRIST], 0, atol=1e-7)
    assert np.isclose(np.linalg.norm(a[0, schema.MIDDLE_MCP, :2]), 1.0)


def test_missing_or_degenerate_hand_is_zero_and_invalid():
    hands = np.zeros((2, 21, 3), dtype=np.float32)
    shape, valid = normalize_hand_shape(hands, np.array([False, True]))
    assert not valid.any()  # second hand is present but has zero palm size
    assert np.all(shape == 0)


def test_aspect_correction_scales_x_and_z_only():
    pts = np.array([[[0.5, 0.5, 0.1]]], dtype=np.float32)
    out = aspect_correct(pts, width=1920, height=1080)
    np.testing.assert_allclose(out[0, 0], [0.5 * 1920 / 1080, 0.5, 0.1 * 1920 / 1080], rtol=1e-6)


def test_body_frame_fills_frames_without_shoulders():
    pose = np.stack([make_pose(), make_pose(), make_pose((0.4, 0.6))])
    present = np.array([False, True, True])
    frame = body_frame(pose, present)
    assert frame.reliable
    np.testing.assert_allclose(frame.center[0], frame.center[1])  # back-filled from frame 1
    np.testing.assert_allclose(frame.scale, 0.3, rtol=1e-6)


def test_body_frame_fallback_when_never_visible():
    frame = body_frame(np.zeros((4, 33, 4), dtype=np.float32), np.zeros(4, dtype=bool))
    assert not frame.reliable
    assert frame.center.shape == (4, 3)


def test_frame_features_shape_and_masks():
    rng = np.random.default_rng(1)
    T = 5
    hands = np.zeros((T, 2, 21, 3), dtype=np.float32)
    hands[:, schema.RIGHT] = make_hand(rng, center=(0.45, 0.4))
    hand_present = np.zeros((T, 2), dtype=bool)
    hand_present[:, schema.RIGHT] = True
    pose = np.tile(make_pose(), (T, 1, 1))
    feats = build_frame_features(hands, hand_present, pose, np.ones(T, bool), width=640, height=480)

    assert feats.shape == (T, schema.FRAME_FEATURE_DIM)
    assert feats.dtype == np.float32
    np.testing.assert_array_equal(feats[:, -3:], np.tile([0, 1, 1], (T, 1)))
    left_block = feats[:, : schema.HAND_SHAPE_DIM + schema.HAND_LOCATION_DIM]
    assert np.all(left_block == 0)  # absent left hand contributes zeros


def test_hand_location_distinguishes_chin_from_chest():
    T = 1
    pose = make_pose()[None]
    feats = []
    for y in (0.35, 0.75):  # near face vs below shoulders
        hands = np.zeros((T, 2, 21, 3), dtype=np.float32)
        hands[:, schema.RIGHT] = make_hand(np.random.default_rng(3), center=(0.5, y))
        present = np.array([[False, True]])
        feats.append(build_frame_features(hands, present, pose, np.ones(T, bool), 480, 480))
    start = schema.HAND_SHAPE_DIM + schema.HAND_LOCATION_DIM + schema.HAND_SHAPE_DIM
    loc_high, loc_low = feats[0][0, start : start + 3], feats[1][0, start : start + 3]
    # Same hand shape, different location -> shape identical, location y differs in sign
    assert loc_high[1] < 0 < loc_low[1]
    np.testing.assert_allclose(feats[0][0, start - schema.HAND_SHAPE_DIM : start], feats[1][0, start - schema.HAND_SHAPE_DIM : start], atol=1e-5)


def test_mirror_twice_is_identity_and_swaps_hands():
    from mudra_ml.preprocessing.sequence import LandmarkSequence, mirror_sequence

    rng = np.random.default_rng(5)
    T = 4
    hands = rng.random((T, 2, 21, 3)).astype(np.float32)
    present = np.array([[True, False]] * T)
    hands[:, 1] = 0
    seq = LandmarkSequence(hands, present, present.astype(np.float32), rng.random((T, 33, 4)).astype(np.float32),
                           np.ones(T, bool), np.arange(T), {"width": 640, "height": 480})
    once = mirror_sequence(seq)
    assert once.hand_present[:, 1].all() and not once.hand_present[:, 0].any()  # left hand became right
    np.testing.assert_allclose(once.hands[:, 1, :, 0], 1 - seq.hands[:, 0, :, 0], atol=1e-6)
    np.testing.assert_allclose(once.pose[:, 12, 0], 1 - seq.pose[:, 11, 0], atol=1e-6)
    twice = mirror_sequence(once)
    np.testing.assert_allclose(twice.hands, seq.hands, atol=1e-6)
    np.testing.assert_allclose(twice.pose, seq.pose, atol=1e-6)
