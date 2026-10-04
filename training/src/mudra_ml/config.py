"""Project paths and YAML config loading."""

from __future__ import annotations

from pathlib import Path

import yaml

PROJECT_ROOT = Path(__file__).resolve().parents[3]
CONFIG_DIR = PROJECT_ROOT / "training" / "configs"


def load_config(name_or_path: str | Path = "data.yaml") -> dict:
    path = Path(name_or_path)
    if not path.is_absolute() and not path.exists():
        path = CONFIG_DIR / path
    with path.open(encoding="utf-8") as f:
        return yaml.safe_load(f)


def project_path(relative: str | Path) -> Path:
    path = Path(relative)
    return path if path.is_absolute() else PROJECT_ROOT / path
