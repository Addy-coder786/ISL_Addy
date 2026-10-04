"""Classification metrics, calibration and report artefacts. Only measured values, never placeholders."""

from __future__ import annotations

import csv
import json
from itertools import pairwise
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import torch
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    precision_recall_fscore_support,
)

# Temperature is only identifiable when validation contains errors; with a perfectly classified
# validation set the NLL optimum runs to T -> 0 (one-hot, NaN-prone). Bound it to a sane range.
TEMPERATURE_BOUNDS = (0.25, 5.0)


def softmax(logits: np.ndarray, temperature: float = 1.0) -> np.ndarray:
    z = logits.astype(np.float64) / max(temperature, 1e-6)
    z = z - z.max(axis=1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=1, keepdims=True)


def topk_accuracy(scores: np.ndarray, labels: np.ndarray, k: int) -> float:
    """Top-k from raw logits (ranking is temperature-independent and free of softmax ties)."""
    k = min(k, scores.shape[1])
    topk = np.argsort(-scores, axis=1)[:, :k]
    return float(np.mean([labels[i] in topk[i] for i in range(len(labels))]))


def expected_calibration_error(probs: np.ndarray, labels: np.ndarray, bins: int = 15) -> float:
    conf = probs.max(axis=1)
    correct = probs.argmax(axis=1) == labels
    edges = np.linspace(0, 1, bins + 1)
    ece = 0.0
    for lo, hi in pairwise(edges):
        in_bin = (conf > lo) & (conf <= hi)
        if in_bin.any():
            ece += in_bin.mean() * abs(correct[in_bin].mean() - conf[in_bin].mean())
    return float(ece)


def fit_temperature(logits: np.ndarray, labels: np.ndarray) -> float:
    """Temperature scaling on validation logits (Guo et al., 2017), clamped to TEMPERATURE_BOUNDS."""
    logits_t = torch.tensor(logits, dtype=torch.float64)
    labels_t = torch.tensor(labels, dtype=torch.long)
    log_t = torch.zeros(1, dtype=torch.float64, requires_grad=True)
    opt = torch.optim.LBFGS([log_t], lr=0.1, max_iter=200)

    def closure():
        opt.zero_grad()
        loss = torch.nn.functional.cross_entropy(logits_t / log_t.exp(), labels_t)
        loss.backward()
        return loss

    opt.step(closure)
    t = float(log_t.exp().item())
    if not np.isfinite(t):
        t = 1.0
    return float(np.clip(t, *TEMPERATURE_BOUNDS))


def calibration_reliable(val_logits: np.ndarray, val_labels: np.ndarray, min_errors: int = 5) -> bool:
    """Temperature needs enough validation mistakes to be estimated."""
    return int((val_logits.argmax(axis=1) != val_labels).sum()) >= min_errors


def compute_metrics(logits: np.ndarray, labels: np.ndarray, temperature: float = 1.0) -> dict:
    probs = softmax(logits, temperature)
    preds = logits.argmax(axis=1)  # temperature never changes the predicted class
    present = np.unique(labels)
    p, r, f1, _ = precision_recall_fscore_support(labels, preds, labels=present, average="macro", zero_division=0)
    _, _, wf1, _ = precision_recall_fscore_support(labels, preds, labels=present, average="weighted", zero_division=0)
    return {
        "num_samples": len(labels),
        "num_classes_evaluated": len(present),
        "accuracy": float(accuracy_score(labels, preds)),
        "top5_accuracy": topk_accuracy(logits, labels, 5),
        "macro_precision": float(p),
        "macro_recall": float(r),
        "macro_f1": float(f1),
        "weighted_f1": float(wf1),
        "ece": expected_calibration_error(probs, labels),
        "temperature": float(temperature),
    }


def coverage_curve(probs: np.ndarray, labels: np.ndarray, thresholds=(0.3, 0.5, 0.7, 0.9)) -> list[dict]:
    """Accuracy on predictions kept above a confidence threshold, and how many are kept.

    Basis for choosing the app's "Uncertain" threshold from validation data.
    """
    conf, correct = probs.max(axis=1), probs.argmax(axis=1) == labels
    rows = []
    for t in thresholds:
        keep = conf >= t
        rows.append(
            {
                "threshold": t,
                "coverage": float(keep.mean()),
                "accuracy_on_kept": float(correct[keep].mean()) if keep.any() else None,
            }
        )
    return rows


def write_report(
    out_dir: Path,
    split: str,
    logits: np.ndarray,
    labels: np.ndarray,
    classes: list[str],
    sample_ids: list[str],
    temperature: float,
) -> dict:
    """Save metrics JSON, classification report, predictions CSV, confusion matrix and reliability plot."""
    out_dir.mkdir(parents=True, exist_ok=True)
    probs = softmax(logits, temperature)
    preds = logits.argmax(axis=1)

    metrics = compute_metrics(logits, labels, temperature)
    metrics["uncalibrated_ece"] = compute_metrics(logits, labels, 1.0)["ece"]
    metrics["coverage"] = coverage_curve(probs, labels)

    present = np.unique(np.concatenate([labels, preds]))
    report = classification_report(
        labels, preds, labels=present, target_names=[classes[i] for i in present], zero_division=0, digits=3
    )
    (out_dir / f"{split}_classification_report.txt").write_text(report, encoding="utf-8")

    cm = confusion_matrix(labels, preds, labels=np.arange(len(classes)))
    np.save(out_dir / f"{split}_confusion_matrix.npy", cm)
    off = cm.copy()
    np.fill_diagonal(off, 0)
    pairs = np.dstack(np.unravel_index(np.argsort(-off, axis=None)[:15], off.shape))[0]
    metrics["top_confusions"] = [
        {"true": classes[i], "predicted": classes[j], "count": int(off[i, j])} for i, j in pairs if off[i, j] > 0
    ]
    _plot_confusion(cm, classes, out_dir / f"{split}_confusion_matrix.png")
    _plot_reliability(probs, labels, out_dir / f"{split}_reliability.png")

    with (out_dir / f"{split}_predictions.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["sample_id", "true", "predicted", "confidence", "correct"])
        for sid, y, yhat, pr in zip(sample_ids, labels, preds, probs):
            writer.writerow([sid, classes[y], classes[yhat], f"{pr[yhat]:.4f}", int(y == yhat)])

    (out_dir / f"{split}_metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    return metrics


def _plot_confusion(cm: np.ndarray, classes: list[str], path: Path) -> None:
    n = len(classes)
    size = min(24, max(6, n * 0.25))
    fig, ax = plt.subplots(figsize=(size, size))
    norm = cm / np.maximum(cm.sum(axis=1, keepdims=True), 1)
    ax.imshow(norm, cmap="Blues", vmin=0, vmax=1)
    if n <= 60:
        ax.set_xticks(range(n), classes, rotation=90, fontsize=6)
        ax.set_yticks(range(n), classes, fontsize=6)
    ax.set_xlabel("Predicted")
    ax.set_ylabel("True")
    ax.set_title("Row-normalised confusion matrix")
    fig.tight_layout()
    fig.savefig(path, dpi=120)
    plt.close(fig)


def _plot_reliability(probs: np.ndarray, labels: np.ndarray, path: Path, bins: int = 10) -> None:
    conf, correct = probs.max(axis=1), probs.argmax(axis=1) == labels
    edges = np.linspace(0, 1, bins + 1)
    centers, accs = [], []
    for lo, hi in pairwise(edges):
        m = (conf > lo) & (conf <= hi)
        if m.any():
            centers.append(conf[m].mean())
            accs.append(correct[m].mean())
    fig, ax = plt.subplots(figsize=(4.5, 4.5))
    ax.plot([0, 1], [0, 1], "--", color="gray", label="perfect calibration")
    ax.plot(centers, accs, "o-", label="model")
    ax.set_xlabel("Confidence")
    ax.set_ylabel("Accuracy")
    ax.set_title("Reliability diagram")
    ax.legend()
    fig.tight_layout()
    fig.savefig(path, dpi=120)
    plt.close(fig)
