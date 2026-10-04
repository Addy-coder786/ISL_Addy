import numpy as np
import pytest

from mudra_ml.preprocessing.frame_sampler import resample_step, sample_indices


def test_uniform_covers_first_and_last_frame():
    idx = sample_indices(100, 24)
    assert len(idx) == 24
    assert idx[0] == 0 and idx[-1] == 99
    assert np.all(np.diff(idx) >= 0)


def test_uniform_is_deterministic():
    assert np.array_equal(sample_indices(57, 24), sample_indices(57, 24))


def test_short_clip_repeats_frames_instead_of_padding():
    idx = sample_indices(5, 24)
    assert len(idx) == 24
    assert idx.min() == 0 and idx.max() == 4


def test_random_mode_stays_in_bounds_and_ordered():
    rng = np.random.default_rng(0)
    for n in (1, 7, 24, 300):
        idx = sample_indices(n, 24, mode="random", rng=rng)
        assert len(idx) == 24
        assert idx.min() >= 0 and idx.max() <= n - 1
        assert np.all(np.diff(idx) >= 0)


def test_random_mode_is_reproducible_with_seed():
    a = sample_indices(90, 24, mode="random", rng=np.random.default_rng(1))
    b = sample_indices(90, 24, mode="random", rng=np.random.default_rng(1))
    assert np.array_equal(a, b)


@pytest.mark.parametrize("n,t", [(0, 24), (10, 0)])
def test_invalid_arguments(n, t):
    with pytest.raises(ValueError):
        sample_indices(n, t)


def test_resample_step():
    assert resample_step(60, 30) == 2
    assert resample_step(25, 30) == 1
    assert resample_step(0, 30) == 1
