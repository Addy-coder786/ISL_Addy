"""Leakage-safe train/val/test splitting.

Everything sharing a ``group_id`` (a signer, or a single video when signers are
unknown) lands in exactly one split. Frames are never split. Groups are assigned
greedily so each label is spread across splits as evenly as the groups allow.
"""

from __future__ import annotations

from collections import Counter, defaultdict

import numpy as np

from mudra_ml.data.manifest import ManifestRow

SPLITS = ("train", "val", "test")


def assign_splits(
    rows: list[ManifestRow],
    ratios: tuple[float, float, float] = (0.7, 0.15, 0.15),
    seed: int = 42,
    keep_existing: bool = True,
) -> list[ManifestRow]:
    """Set ``row.split`` for every row, never letting a group cross splits.

    Rows that already carry a split (e.g. an official dataset split) are kept when
    ``keep_existing`` is True; their groups are then locked to that split. ``ratios``
    apply only to the remaining rows, so ``(0.85, 0.15, 0.0)`` carves a validation
    set out of rows that have no official split.
    """
    if abs(sum(ratios) - 1.0) > 1e-6:
        raise ValueError("ratios must sum to 1")

    rng = np.random.default_rng(seed)
    groups: dict[str, list[ManifestRow]] = defaultdict(list)
    for row in rows:
        groups[row.group_id].append(row)

    locked: dict[str, str] = {}
    if keep_existing:
        for gid, members in groups.items():
            existing = {m.split for m in members if m.split}
            if len(existing) > 1:
                raise ValueError(f"Group {gid} already spans several splits: {existing}")
            if existing:
                locked[gid] = existing.pop()

    for gid, split in locked.items():
        for m in groups[gid]:
            m.split = split

    free = [g for g in groups if g not in locked]
    free_rows = [m for g in free for m in groups[g]]
    target = dict(zip(SPLITS, ratios))
    totals: Counter = Counter()
    per_label: dict[str, Counter] = defaultdict(Counter)
    label_totals: Counter = Counter(r.label for r in free_rows)

    def place(gid: str, split: str) -> None:
        for m in groups[gid]:
            m.split = split
            totals[split] += 1
            per_label[m.label][split] += 1

    rng.shuffle(free)
    free.sort(key=lambda g: -len(groups[g]))  # big groups first, random among ties (stable sort)

    n_total = len(free_rows)
    for gid in free:
        labels = Counter(m.label for m in groups[gid])

        def deficit(split: str, labels: Counter = labels) -> float:
            overall = target[split] * n_total - totals[split]
            label_gap = sum(
                target[split] * label_totals[lab] - per_label[lab][split] for lab in labels
            ) / max(1, len(labels))
            return overall / max(1, n_total) + label_gap / max(1, max(label_totals.values()))

        best = max((s for s in SPLITS if target[s] > 0), key=deficit)
        place(gid, best)

    return rows


def check_no_leakage(rows: list[ManifestRow]) -> None:
    """Raise if any group or raw file appears in more than one split."""
    by_group: dict[str, set] = defaultdict(set)
    by_file: dict[str, set] = defaultdict(set)
    for r in rows:
        by_group[r.group_id].add(r.split)
        by_file[r.raw_path].add(r.split)
    leaks = [g for g, s in by_group.items() if len(s) > 1] + [f for f, s in by_file.items() if len(s) > 1]
    if leaks:
        raise AssertionError(f"Train/test leakage across splits for: {leaks[:5]}")


def split_report(rows: list[ManifestRow]) -> dict:
    counts = Counter(r.split for r in rows)
    labels_per_split = {s: len({r.label for r in rows if r.split == s}) for s in SPLITS}
    groups_per_split = {s: len({r.group_id for r in rows if r.split == s}) for s in SPLITS}
    all_labels = {r.label for r in rows}
    missing_in_test = sorted(all_labels - {r.label for r in rows if r.split == "test"})
    signer_independent = all(r.signer_id for r in rows)
    return {
        "samples": dict(counts),
        "labels_per_split": labels_per_split,
        "groups_per_split": groups_per_split,
        "labels_missing_from_test": missing_in_test,
        "signer_independent": signer_independent,
    }
