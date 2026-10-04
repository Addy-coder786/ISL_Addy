"""Choose which frames of a clip feed the fixed-length sequence model."""

from __future__ import annotations

import numpy as np


def sample_indices(
    num_frames: int,
    seq_len: int,
    mode: str = "uniform",
    rng: np.random.Generator | None = None,
) -> np.ndarray:
    """Return ``seq_len`` frame indices covering a clip of ``num_frames`` frames.

    ``uniform`` is deterministic (evaluation / inference). ``random`` jitters each
    index inside its segment (training-time temporal augmentation). Clips shorter
    than ``seq_len`` repeat frames rather than padding, so every index is valid.
    """
    if num_frames <= 0:
        raise ValueError("num_frames must be positive")
    if seq_len <= 0:
        raise ValueError("seq_len must be positive")

    if mode == "uniform":
        positions = np.linspace(0, num_frames - 1, seq_len)
        return np.round(positions).astype(np.int64)

    if mode == "random":
        rng = rng or np.random.default_rng()
        edges = np.linspace(0, num_frames, seq_len + 1)
        starts = np.floor(edges[:-1]).astype(np.int64)
        ends = np.maximum(starts + 1, np.floor(edges[1:]).astype(np.int64))
        return np.minimum(rng.integers(starts, ends), num_frames - 1).astype(np.int64)

    raise ValueError(f"Unknown sampling mode: {mode!r}")


def resample_step(source_fps: float, max_fps: float) -> int:
    """Keep every n-th decoded frame so extraction runs at most at ``max_fps``."""
    if source_fps <= 0 or max_fps <= 0:
        return 1
    return max(1, round(source_fps / max_fps))
