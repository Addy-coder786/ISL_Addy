"""PyTorch dataset: landmark .npz clips -> standardised [T, D] feature sequences."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path

import numpy as np
import torch
from torch.utils.data import Dataset

from mudra_ml import schema
from mudra_ml.data.manifest import read_manifest
from mudra_ml.datasets.augment import AugmentConfig, affine_jitter, temporal_window
from mudra_ml.preprocessing.frame_sampler import sample_indices
from mudra_ml.preprocessing.normalization import build_frame_features
from mudra_ml.preprocessing.sequence import LandmarkSequence, load_sequence, mirror_sequence

# Coordinate blocks inside a frame feature vector and the mask column that gates each one.
_LEFT = slice(0, schema.HAND_SHAPE_DIM + schema.HAND_LOCATION_DIM)
_RIGHT = slice(_LEFT.stop, _LEFT.stop * 2)
_POSE = slice(_RIGHT.stop, _RIGHT.stop + schema.POSE_DIM)
_COORD_DIM = _POSE.stop
_BLOCK_MASK = ((_LEFT, -3), (_RIGHT, -2), (_POSE, -1))


BACKGROUND_LABEL = "_BACKGROUND_"


@dataclass
class BackgroundConfig:
    """Synthetic "no sign yet" samples for live use.

    With probability ``prob`` a training sample is replaced by a piece of a random clip that is
    too short to contain the whole sign: either its opening (rest + start of the sign) or a
    random short span. The model learns to answer BACKGROUND until it has seen most of a sign.
    """

    prob: float = 0.0
    min_fraction: float = 0.1
    max_fraction: float = 0.4
    onset_share: float = 0.5  # share of background samples taken from the start of a clip
    fidget_share: float = 0.0  # share of background samples that are synthetic face-touch / hair movements

    @classmethod
    def from_dict(cls, values: dict | None) -> BackgroundConfig:
        return cls(**(values or {}))


@dataclass
class FeatureConfig:
    seq_len: int = 24
    use_velocity: bool = True
    clip_value: float = 10.0
    schema_version: int = schema.SCHEMA_VERSION

    @property
    def feature_dim(self) -> int:
        return schema.FRAME_FEATURE_DIM + (_COORD_DIM if self.use_velocity else 0)

    @classmethod
    def from_dict(cls, values: dict | None) -> FeatureConfig:
        values = dict(values or {})
        values.pop("feature_dim", None)
        return cls(**values)

    def to_dict(self) -> dict:
        return {**asdict(self), "feature_dim": self.feature_dim}


def feature_groups(feature_cfg: FeatureConfig) -> list[slice]:
    """Blocks that share one scale during standardisation (masks are left unscaled).

    Scaling per block rather than per dimension keeps relative magnitudes inside a block,
    so near-constant dimensions (sensor jitter) are not blown up to the strength of real signals.
    """
    hand = schema.HAND_SHAPE_DIM
    groups = [
        slice(0, hand),  # left shape
        slice(hand, _LEFT.stop),  # left location
        slice(_RIGHT.start, _RIGHT.start + hand),  # right shape
        slice(_RIGHT.start + hand, _RIGHT.stop),  # right location
        _POSE,
    ]
    if feature_cfg.use_velocity:
        base = schema.FRAME_FEATURE_DIM
        groups += [slice(base + g.start, base + g.stop) for g in groups]
    return groups


def add_velocity(features: np.ndarray) -> np.ndarray:
    """Append first-order temporal differences of the coordinate blocks.

    Velocity is zeroed wherever the block is missing in the current or previous frame,
    so a hand appearing/disappearing does not create a fake jump.
    """
    coords = features[:, :_COORD_DIM]
    vel = np.diff(coords, axis=0, prepend=coords[:1])
    for block, mask_col in _BLOCK_MASK:
        mask = features[:, mask_col] > 0
        valid = mask & np.concatenate([[False], mask[:-1]])
        vel[:, block] *= valid[:, None]
    return np.concatenate([features, vel], axis=1)


def sequence_features(
    seq: LandmarkSequence,
    feature_cfg: FeatureConfig,
    rng: np.random.Generator | None = None,
    augment: AugmentConfig | None = None,
) -> np.ndarray:
    """Sample ``seq_len`` frames, optionally augment, and build unstandardised features."""
    if augment is not None and rng is not None and augment.mirror_prob > 0 and rng.random() < augment.mirror_prob:
        seq = mirror_sequence(seq)
    width, height = int(seq.meta.get("width", 0)), int(seq.meta.get("height", 0))
    n = seq.num_frames
    if augment is not None and rng is not None:
        start, length = temporal_window(n, augment, rng)
        idx = start + sample_indices(length, feature_cfg.seq_len, mode="random", rng=rng)
    else:
        idx = sample_indices(n, feature_cfg.seq_len, mode="uniform")

    hands, hand_present = seq.hands[idx], seq.hand_present[idx]
    pose, pose_present = seq.pose[idx], seq.pose_present[idx]
    if augment is not None and rng is not None:
        hands, hand_present, pose = affine_jitter(hands, hand_present, pose, width, height, augment, rng)

    feats = build_frame_features(hands, hand_present, pose, pose_present, width, height)
    if feature_cfg.use_velocity:
        feats = add_velocity(feats)
    return feats.astype(np.float32)


class ISLLandmarkDataset(Dataset):
    """Loads all clips of one split into memory (landmarks are small)."""

    def __init__(
        self,
        split_csv: Path,
        classes: list[str],
        feature_cfg: FeatureConfig,
        augment: AugmentConfig | None = None,
        seed: int = 0,
        background: BackgroundConfig | None = None,
    ) -> None:
        self.rows = read_manifest(Path(split_csv))
        self.classes = classes
        self.background = background if background and background.prob > 0 else None
        if self.background and BACKGROUND_LABEL not in classes:
            raise ValueError(f"background samples need '{BACKGROUND_LABEL}' in the class list")
        self.class_to_idx = {c: i for i, c in enumerate(classes)}
        unknown = sorted({r.label for r in self.rows} - set(self.class_to_idx))
        if unknown:
            raise ValueError(f"Labels not in class list: {unknown[:10]}")
        self.feature_cfg = feature_cfg
        self.augment = augment
        self.rng = np.random.default_rng(seed)
        self.sequences = [load_sequence(Path(r.landmarks_path)) for r in self.rows]
        self.labels = np.array([self.class_to_idx[r.label] for r in self.rows], dtype=np.int64)
        self.mean = np.zeros(feature_cfg.feature_dim, dtype=np.float32)
        self.std = np.ones(feature_cfg.feature_dim, dtype=np.float32)

    def compute_stats(self) -> tuple[np.ndarray, np.ndarray]:
        """Per-feature mean and per-block std from un-augmented clips (training split only)."""
        stacked = np.concatenate([sequence_features(s, self.feature_cfg) for s in self.sequences])
        stacked = np.clip(stacked, -self.feature_cfg.clip_value, self.feature_cfg.clip_value)
        mean = stacked.mean(axis=0)
        std = np.ones(stacked.shape[1], dtype=np.float32)
        for group in feature_groups(self.feature_cfg):
            std[group] = max(float((stacked[:, group] - mean[group]).std()), 1e-3)
        mask_cols = slice(schema.FRAME_FEATURE_DIM - schema.MASK_DIM, schema.FRAME_FEATURE_DIM)
        mean[mask_cols] = 0.0  # presence flags stay 0/1
        return mean.astype(np.float32), std

    def set_stats(self, mean: np.ndarray, std: np.ndarray) -> None:
        self.mean, self.std = mean.astype(np.float32), std.astype(np.float32)

    def __len__(self) -> int:
        return len(self.sequences)

    def _background_window(self) -> LandmarkSequence:
        cfg = self.background
        seq = self.sequences[int(self.rng.integers(len(self.sequences)))]
        if cfg.fidget_share > 0 and self.rng.random() < cfg.fidget_share:
            from mudra_ml.datasets.distractors import synth_fidget

            return synth_fidget(seq, self.rng)
        n = seq.num_frames
        length = max(4, round(n * self.rng.uniform(cfg.min_fraction, cfg.max_fraction)))
        length = min(length, n)
        start = 0 if self.rng.random() < cfg.onset_share else int(self.rng.integers(0, n - length + 1))
        sl = slice(start, start + length)
        return LandmarkSequence(
            seq.hands[sl], seq.hand_present[sl], seq.hand_score[sl], seq.pose[sl], seq.pose_present[sl],
            seq.timestamps_ms[sl], seq.meta,
        )

    def __getitem__(self, i: int) -> tuple[torch.Tensor, int]:
        if self.background is not None and self.rng.random() < self.background.prob:
            seq, label = self._background_window(), self.class_to_idx[BACKGROUND_LABEL]
            feats = sequence_features(seq, self.feature_cfg, self.rng, self.augment)
            feats = np.clip(feats, -self.feature_cfg.clip_value, self.feature_cfg.clip_value)
            return torch.from_numpy((feats - self.mean) / self.std), label
        feats = sequence_features(self.sequences[i], self.feature_cfg, self.rng, self.augment)
        feats = np.clip(feats, -self.feature_cfg.clip_value, self.feature_cfg.clip_value)
        feats = (feats - self.mean) / self.std
        return torch.from_numpy(feats), int(self.labels[i])


def load_classes(split_dir: Path) -> list[str]:
    return json.loads((Path(split_dir) / "classes.json").read_text(encoding="utf-8"))
