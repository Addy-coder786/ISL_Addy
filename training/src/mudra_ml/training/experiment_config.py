"""Experiment config composition: base YAML + overrides (deep merge)."""

from __future__ import annotations

import copy
from pathlib import Path

import yaml

from mudra_ml.config import CONFIG_DIR

EXPERIMENT_DIR = CONFIG_DIR / "experiments"


def deep_merge(base: dict, override: dict) -> dict:
    """Recursively merge ``override`` into a copy of ``base``. ``None`` values replace (e.g. augment: null)."""
    out = copy.deepcopy(base)
    for key, value in override.items():
        if isinstance(value, dict) and isinstance(out.get(key), dict):
            out[key] = deep_merge(out[key], value)
        else:
            out[key] = copy.deepcopy(value)
    return out


def load_yaml(path: str | Path) -> dict:
    p = Path(path)
    if not p.exists():
        p = EXPERIMENT_DIR / p
    with p.open(encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def resolve(path: str | Path) -> dict:
    """Load a config, following its optional ``base:`` key."""
    cfg = load_yaml(path)
    base_name = cfg.pop("base", None)
    return deep_merge(resolve(base_name), cfg) if base_name else cfg


def parse_overrides(pairs: list[str]) -> dict:
    """['train.epochs=5', 'model.temporal=none'] -> nested dict (values parsed as YAML)."""
    out: dict = {}
    for pair in pairs:
        key, _, raw = pair.partition("=")
        node = out
        parts = key.split(".")
        for part in parts[:-1]:
            node = node.setdefault(part, {})
        node[parts[-1]] = yaml.safe_load(raw)
    return out


def ablation_base(spec: dict) -> dict:
    """Config shared by every variant: the ``base:`` file, then the spec's own top-level keys."""
    shared = {k: v for k, v in spec.items() if k not in ("base", "variants")}
    return deep_merge(resolve(spec["base"]) if spec.get("base") else {}, shared)
