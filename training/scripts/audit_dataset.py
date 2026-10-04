"""Audit a raw ISL dataset before any training. Read-only: never modifies the data.

Reports: sample counts (videos/images), classes and samples per class, corrupt or
unreadable files, video durations / frame counts / fps / resolution, image sizes,
signer information availability and exact duplicate files.

    python training/scripts/audit_dataset.py --source own --input data/raw/own
"""

from __future__ import annotations

import argparse
import hashlib
import json
import statistics
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

import cv2
from tqdm import tqdm

from mudra_ml.config import load_config, project_path
from mudra_ml.data.manifest import discover_media


def file_hash(path: Path, chunk: int = 1 << 20) -> str:
    h = hashlib.sha1()
    with path.open("rb") as f:
        while block := f.read(chunk):
            h.update(block)
    return h.hexdigest()


def probe_video(path: Path) -> dict:
    cap = cv2.VideoCapture(str(path))
    try:
        if not cap.isOpened():
            return {"ok": False, "error": "cannot open"}
        fps = cap.get(cv2.CAP_PROP_FPS) or 0.0
        frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        width, height = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        ok, _ = cap.read()
        if not ok:
            return {"ok": False, "error": "no decodable frame"}
        return {
            "ok": True,
            "fps": fps,
            "frames": frames,
            "duration_s": frames / fps if fps > 0 else 0.0,
            "resolution": f"{width}x{height}",
        }
    finally:
        cap.release()


def probe_image(path: Path) -> dict:
    img = cv2.imread(str(path))
    if img is None:
        return {"ok": False, "error": "cannot read"}
    return {"ok": True, "resolution": f"{img.shape[1]}x{img.shape[0]}"}


def summarize(values: list[float]) -> dict:
    if not values:
        return {}
    return {
        "min": round(min(values), 2),
        "median": round(statistics.median(values), 2),
        "mean": round(statistics.fmean(values), 2),
        "max": round(max(values), 2),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--input", required=True, type=Path, help="raw source folder")
    parser.add_argument("--source", required=True, help="short source name, e.g. own, include")
    parser.add_argument("--config", default="data.yaml")
    args = parser.parse_args()

    cfg = load_config(args.config)
    rows = discover_media(project_path(args.input), args.source)
    if not rows:
        raise SystemExit(f"No videos or images found under {args.input}")

    per_class: dict[str, Counter] = defaultdict(Counter)
    corrupt, durations, frame_counts, fps_values = [], [], [], []
    resolutions: Counter = Counter()
    hashes: dict[str, list[str]] = defaultdict(list)

    for row in tqdm(rows, desc="Auditing"):
        path = Path(row.raw_path)
        per_class[row.label][row.kind] += 1
        hashes[file_hash(path)].append(row.raw_path)
        info = probe_video(path) if row.kind == "video" else probe_image(path)
        if not info["ok"]:
            corrupt.append({"path": row.raw_path, "error": info["error"]})
            continue
        resolutions[info["resolution"]] += 1
        if row.kind == "video":
            durations.append(info["duration_s"])
            frame_counts.append(info["frames"])
            fps_values.append(info["fps"])

    class_sizes = {label: sum(c.values()) for label, c in per_class.items()}
    duplicates = [paths for paths in hashes.values() if len(paths) > 1]
    signers = {r.signer_id for r in rows if r.signer_id}
    report = {
        "source": args.source,
        "input": str(args.input),
        "generated_at": datetime.now().astimezone().isoformat(timespec="seconds"),
        "num_videos": sum(r.kind == "video" for r in rows),
        "num_images": sum(r.kind == "image" for r in rows),
        "num_classes": len(per_class),
        "samples_per_class": {k: dict(v) for k, v in sorted(per_class.items())},
        "class_size_stats": summarize(list(class_sizes.values())),
        "smallest_classes": sorted(class_sizes.items(), key=lambda kv: kv[1])[:10],
        "video_duration_s": summarize(durations),
        "video_frame_count": summarize(frame_counts),
        "video_fps": summarize(fps_values),
        "resolutions": dict(resolutions.most_common(10)),
        "corrupt_files": corrupt,
        "exact_duplicates": duplicates,
        "signer_info_available": bool(signers),
        "num_signers": len(signers),
        "rows_missing_signer": sum(not r.signer_id for r in rows),
    }

    out_dir = project_path(cfg["paths"]["reports_root"])
    out_dir.mkdir(parents=True, exist_ok=True)
    json_path = out_dir / f"audit_{args.source}.json"
    json_path.write_text(json.dumps(report, indent=2), encoding="utf-8")

    md = [
        f"# Dataset audit: {args.source}",
        "",
        f"Generated {report['generated_at']} from `{args.input}`.",
        "",
        "| Item | Value |",
        "|---|---|",
        f"| Videos | {report['num_videos']} |",
        f"| Images | {report['num_images']} |",
        f"| Classes | {report['num_classes']} |",
        (
            f"| Samples per class (min / median / max) | {report['class_size_stats'].get('min')} / "
            f"{report['class_size_stats'].get('median')} / {report['class_size_stats'].get('max')} |"
        ),
        (
            f"| Video duration s (min / median / max) | {report['video_duration_s'].get('min', '-')} / "
            f"{report['video_duration_s'].get('median', '-')} / {report['video_duration_s'].get('max', '-')} |"
        ),
        f"| Corrupt / unreadable files | {len(corrupt)} |",
        f"| Exact duplicate groups | {len(duplicates)} |",
        f"| Signer IDs available | {'yes (' + str(len(signers)) + ' signers)' if signers else 'NO: only video-level splits possible'} |",
        "",
        "## Smallest classes",
        "",
        *[f"- {label}: {n}" for label, n in report["smallest_classes"]],
    ]
    if not signers:
        md += [
            "",
            "> Without signer IDs the test set may contain people seen in training, so accuracy will be",
            "> optimistic. Add `signers.csv` (relative_path,signer_id) to enable signer-independent splits.",
        ]
    md_path = out_dir / f"audit_{args.source}.md"
    md_path.write_text("\n".join(md) + "\n", encoding="utf-8")
    print(f"Audit written to {md_path} and {json_path}")


if __name__ == "__main__":
    main()
