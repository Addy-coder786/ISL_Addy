"""Discovering raw media and describing processed samples in a manifest CSV.

Raw layout convention (label = parent folder name, any nesting above it is allowed)::

    data/raw/<source>/videos/<LABEL>/<clip>.mp4
    data/raw/<source>/images/<LABEL>/<image>.jpg
    data/raw/<source>/signers.csv        optional: relative_path,signer_id

If no signer information exists, splits fall back to video-level grouping and the
audit report says so (signer-independent evaluation is then not possible).
"""

from __future__ import annotations

import csv
import hashlib
import re
from dataclasses import asdict, dataclass, fields
from pathlib import Path

from mudra_ml.config import PROJECT_ROOT

VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm", ".m4v", ".mpg", ".mpeg"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


@dataclass
class ManifestRow:
    sample_id: str
    label: str
    source: str
    kind: str  # video | image
    signer_id: str  # "" when unknown
    group_id: str  # unit that must never cross splits (signer, else video)
    raw_path: str
    landmarks_path: str = ""
    num_frames: int = 0
    fps: float = 0.0
    duration_s: float = 0.0
    any_hand_rate: float = 0.0
    pose_rate: float = 0.0
    quality_flag: str = ""  # "", low_hand_detection, no_pose, failed:<reason>
    split: str = ""


def normalize_label(name: str) -> str:
    """Folder name -> canonical gloss, e.g. 'thank you' / 'Thank-You' -> 'THANK_YOU'."""
    label = re.sub(r"^\d+[\.\-_ ]+", "", name.strip())  # drop numeric prefixes like '12. '
    label = re.sub(r"[\s\-]+", "_", label)
    return re.sub(r"[^\w]", "", label).upper()


def stable_id(*parts: str) -> str:
    return hashlib.sha1("|".join(parts).encode("utf-8")).hexdigest()[:12]


def read_signer_map(source_root: Path) -> dict[str, str]:
    path = source_root / "signers.csv"
    if not path.exists():
        return {}
    with path.open(newline="", encoding="utf-8") as f:
        return {row["relative_path"].replace("\\", "/"): row["signer_id"] for row in csv.DictReader(f)}


def discover_media(source_root: Path, source: str) -> list[ManifestRow]:
    """Find all videos/images under ``source_root`` and build unprocessed manifest rows."""
    signer_map = read_signer_map(source_root)
    rows: list[ManifestRow] = []
    for path in sorted(source_root.rglob("*")):
        ext = path.suffix.lower()
        if not path.is_file() or ext not in VIDEO_EXTENSIONS | IMAGE_EXTENSIONS:
            continue
        rel = path.relative_to(source_root).as_posix()
        kind = "video" if ext in VIDEO_EXTENSIONS else "image"
        signer = signer_map.get(rel, "")
        sample_id = stable_id(source, rel)
        rows.append(
            ManifestRow(
                sample_id=sample_id,
                label=normalize_label(path.parent.name),
                source=source,
                kind=kind,
                signer_id=signer,
                group_id=f"{source}:signer:{signer}" if signer else f"{source}:clip:{sample_id}",
                raw_path=str(path),
            )
        )
    return rows


def portable_path(value: str) -> str:
    """Store paths inside the project as project-relative POSIX paths so manifests work on any machine."""
    if not value:
        return value
    try:
        return Path(value).resolve().relative_to(PROJECT_ROOT).as_posix()
    except ValueError:
        return value


def write_manifest(rows: list[ManifestRow], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[fl.name for fl in fields(ManifestRow)])
        writer.writeheader()
        for row in rows:
            record = asdict(row)
            record["raw_path"] = portable_path(row.raw_path)
            record["landmarks_path"] = portable_path(row.landmarks_path)
            writer.writerow(record)


def read_manifest(path: Path) -> list[ManifestRow]:
    types = {fl.name: fl.type for fl in fields(ManifestRow)}
    rows = []
    with path.open(newline="", encoding="utf-8") as f:
        for raw in csv.DictReader(f):
            values = {}
            for key, value in raw.items():
                if types[key] in ("int", int):
                    values[key] = int(float(value or 0))
                elif types[key] in ("float", float):
                    values[key] = float(value or 0.0)
                else:
                    values[key] = value or ""
            for key in ("raw_path", "landmarks_path"):
                if values[key] and not Path(values[key]).is_absolute():
                    values[key] = str(PROJECT_ROOT / values[key])
            rows.append(ManifestRow(**values))
    return rows
