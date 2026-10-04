import pytest

from mudra_ml.data.manifest import ManifestRow, normalize_label
from mudra_ml.data.splits import assign_splits, check_no_leakage, split_report


def make_rows(n_signers=10, labels=("HELLO", "WATER", "HELP"), reps=3, signer_ids=True):
    rows = []
    for s in range(n_signers):
        for label in labels:
            for r in range(reps):
                sid = f"S{s:02d}" if signer_ids else ""
                clip = f"{label}_{s}_{r}"
                rows.append(
                    ManifestRow(
                        sample_id=clip,
                        label=label,
                        source="own",
                        kind="video",
                        signer_id=sid,
                        group_id=f"own:signer:{sid}" if sid else f"own:clip:{clip}",
                        raw_path=f"/raw/{clip}.mp4",
                        landmarks_path=f"/lm/{clip}.npz",
                    )
                )
    return rows


def test_signers_never_cross_splits():
    rows = assign_splits(make_rows(), ratios=(0.6, 0.2, 0.2), seed=0)
    check_no_leakage(rows)
    signer_splits = {}
    for r in rows:
        signer_splits.setdefault(r.signer_id, set()).add(r.split)
    assert all(len(s) == 1 for s in signer_splits.values())
    assert {r.split for r in rows} == {"train", "val", "test"}
    assert split_report(rows)["signer_independent"]


def test_split_is_deterministic():
    a = [r.split for r in assign_splits(make_rows(), seed=7)]
    b = [r.split for r in assign_splits(make_rows(), seed=7)]
    assert a == b


def test_existing_official_split_is_preserved_and_ratios_apply_to_the_rest():
    rows = make_rows(n_signers=1, labels=("A", "B"), reps=20, signer_ids=False)
    for r in rows[:8]:
        r.split = "test"
    assign_splits(rows, ratios=(0.8, 0.2, 0.0), seed=0)
    assert all(r.split == "test" for r in rows[:8])
    rest = rows[8:]
    assert {r.split for r in rest} == {"train", "val"}
    val_share = sum(r.split == "val" for r in rest) / len(rest)
    assert 0.1 <= val_share <= 0.3


def test_leakage_is_detected():
    rows = make_rows(n_signers=2, labels=("A",), reps=2)
    for i, r in enumerate(rows):
        r.split = "train" if i % 2 else "test"  # same signer in both splits
    with pytest.raises(AssertionError):
        check_no_leakage(rows)


def test_ratios_must_sum_to_one():
    with pytest.raises(ValueError):
        assign_splits(make_rows(), ratios=(0.5, 0.2, 0.2))


@pytest.mark.parametrize(
    "raw,expected",
    [("4. sad", "SAD"), ("4.sad", "SAD"), ("Thank you", "THANK_YOU"), ("thank-you", "THANK_YOU"), ("10. Mean", "MEAN")],
)
def test_normalize_label(raw, expected):
    assert normalize_label(raw) == expected
