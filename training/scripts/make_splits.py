"""Create leakage-safe train/val/test splits from one or more manifests.

Groups (signers, or individual videos when signers are unknown) never cross splits.
Official splits already present in a manifest (e.g. INCLUDE) are preserved.

    python training/scripts/make_splits.py --manifests data/metadata/manifest_own.csv --name own
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from mudra_ml.config import load_config, project_path
from mudra_ml.data.manifest import read_manifest, write_manifest
from mudra_ml.data.splits import SPLITS, assign_splits, check_no_leakage, split_report


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--manifests", nargs="+", required=True, type=Path)
    parser.add_argument("--name", required=True, help="name of the split set, e.g. own, include, combined")
    parser.add_argument("--config", default="data.yaml")
    parser.add_argument("--include-flagged", action="store_true", help="keep clips with quality flags")
    parser.add_argument(
        "--signer-regex", default=None,
        help=r"regex with one capture group applied to file names lacking a signer ID, e.g. '\((\d+)\)$'",
    )
    parser.add_argument(
        "--ratios", nargs=3, type=float, default=None, metavar=("TRAIN", "VAL", "TEST"),
        help="override config ratios; they apply only to rows without an official split",
    )
    args = parser.parse_args()

    cfg = load_config(args.config)
    rows = [r for m in args.manifests for r in read_manifest(project_path(m))]
    usable = [r for r in rows if r.landmarks_path and not r.quality_flag.startswith("failed")]
    if not args.include_flagged:
        # Low-quality clips are dropped from training only; an official test set stays intact
        # so reported results are not inflated by removing hard examples.
        usable = [r for r in usable if not r.quality_flag or r.split == "test"]
    print(f"{len(usable)}/{len(rows)} rows usable ({len(rows) - len(usable)} failed or flagged excluded)")

    if args.signer_regex:
        pattern = re.compile(args.signer_regex)
        tagged = 0
        for r in usable:
            m = pattern.search(Path(r.raw_path).stem)
            if m and not r.signer_id and not r.split:
                r.signer_id = f"{r.source}:{m.group(1)}"
                r.group_id = f"{r.source}:signer:{m.group(1)}"
                tagged += 1
        print(f"signer-regex grouped {tagged} rows into {len({r.group_id for r in usable if r.signer_id})} signer groups")

    ratios = tuple(args.ratios) if args.ratios else tuple(cfg["splits"]["ratios"])
    assign_splits(usable, ratios=ratios, seed=cfg["splits"]["seed"])
    check_no_leakage(usable)
    report = split_report(usable)

    out_dir = project_path(cfg["paths"]["metadata_root"]) / "splits" / args.name
    for split in SPLITS:
        write_manifest([r for r in usable if r.split == split], out_dir / f"{split}.csv")
    labels = sorted({r.label for r in usable})
    (out_dir / "classes.json").write_text(json.dumps(labels, indent=2), encoding="utf-8")
    (out_dir / "split_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")

    print(json.dumps(report, indent=2))
    if not report["signer_independent"]:
        print("WARNING: signer IDs missing for some rows; test results will not be signer-independent.")
    print(f"Splits written to {out_dir}")


if __name__ == "__main__":
    main()
