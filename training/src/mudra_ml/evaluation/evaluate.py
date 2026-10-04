"""Evaluate a saved run from its checkpoint alone (what inference will see).

Rebuilds the datasets with the checkpoint's feature config and standardisation stats,
fits temperature on validation, writes reports for val and test, updates summary.json.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import torch
import yaml
from torch.utils.data import DataLoader

from mudra_ml.config import project_path
from mudra_ml.datasets.isl_dataset import FeatureConfig, ISLLandmarkDataset
from mudra_ml.evaluation.metrics import calibration_reliable, fit_temperature, write_report
from mudra_ml.models.sequence_model import ModelConfig, build_model


@torch.no_grad()
def predict(model: torch.nn.Module, loader: DataLoader, device: torch.device, amp: bool) -> tuple[np.ndarray, np.ndarray]:
    model.eval()
    all_logits, all_labels = [], []
    for x, y in loader:
        with torch.autocast(device.type, dtype=torch.float16, enabled=amp and device.type == "cuda"):
            logits = model(x.to(device, non_blocking=True))
        all_logits.append(logits.float().cpu().numpy())
        all_labels.append(y.numpy())
    return np.concatenate(all_logits), np.concatenate(all_labels)


def load_checkpoint_model(ckpt_path: Path, device: torch.device) -> tuple[torch.nn.Module, dict]:
    ckpt = torch.load(ckpt_path, map_location=device, weights_only=False)
    model = build_model(ModelConfig.from_dict(ckpt["model_config"])).to(device)
    model.load_state_dict(ckpt["model_state"])
    model.eval()
    return model, ckpt


def evaluate_run(run_dir: Path, splits: tuple[str, ...] = ("val", "test")) -> dict:
    run_dir = Path(run_dir)
    cfg = yaml.safe_load((run_dir / "config.yaml").read_text(encoding="utf-8"))
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model, ckpt = load_checkpoint_model(run_dir / "best.pt", device)
    classes = ckpt["classes"]
    feature_cfg = FeatureConfig.from_dict(ckpt["feature_config"])
    split_dir = project_path(cfg["data"]["split_dir"])
    amp = bool(ckpt.get("train_config", {}).get("amp", True))

    results: dict[str, tuple[np.ndarray, np.ndarray, list[str]]] = {}
    for split in ("val", *[s for s in splits if s != "val"]):
        ds = ISLLandmarkDataset(split_dir / f"{split}.csv", classes, feature_cfg)
        ds.set_stats(np.asarray(ckpt["feature_mean"]), np.asarray(ckpt["feature_std"]))
        logits, labels = predict(model, DataLoader(ds, batch_size=128), device, amp)
        results[split] = (logits, labels, [r.sample_id for r in ds.rows])

    val_logits, val_labels, _ = results["val"]
    temperature = fit_temperature(val_logits, val_labels)
    calibration_ok = calibration_reliable(val_logits, val_labels)

    reports = run_dir / "reports"
    metrics = {
        split: write_report(reports, split, logits, labels, classes, ids, temperature)
        for split, (logits, labels, ids) in results.items()
    }

    ckpt.update({"temperature": temperature, "calibration_reliable": calibration_ok, "test_metrics": metrics.get("test")})
    torch.save(ckpt, run_dir / "best.pt")

    summary_path = run_dir / "summary.json"
    summary = json.loads(summary_path.read_text(encoding="utf-8")) if summary_path.exists() else {}
    summary.update(
        {
            "experiment": ckpt.get("experiment", run_dir.name),
            "run_dir": str(run_dir),
            "temporal": ckpt["model_config"]["temporal"],
            "best_epoch": ckpt.get("epoch"),
            "temperature": temperature,
            "calibration_reliable": calibration_ok,
            "val": {k: metrics["val"][k] for k in ("accuracy", "macro_f1", "top5_accuracy")},
        }
    )
    if "test" in metrics:
        t = metrics["test"]
        summary["test"] = {k: t[k] for k in ("accuracy", "top5_accuracy", "macro_f1", "weighted_f1", "ece", "uncalibrated_ece")}
        summary["test_samples"] = t["num_samples"]
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    return summary
