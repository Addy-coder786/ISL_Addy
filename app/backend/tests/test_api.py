"""API tests against the exported model and real (held-out) INCLUDE test clips."""

from __future__ import annotations

import csv
import sys
from pathlib import Path

import numpy as np
import pytest
from fastapi.testclient import TestClient

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

from mudra_ml.config import PROJECT_ROOT
from mudra_ml.preprocessing.sequence import load_sequence

from mudra_api.app import create_app
from mudra_api.settings import Settings

MODEL_DIR = BACKEND / "models" / "isl_include_bilstm"
TEST_SPLIT = PROJECT_ROOT / "data" / "metadata" / "splits" / "include" / "test.csv"

pytestmark = pytest.mark.skipif(not (MODEL_DIR / "model.pt").exists(), reason="exported model not present")


@pytest.fixture(scope="module")
def client() -> TestClient:
    return TestClient(create_app(Settings(model_dir=MODEL_DIR, device="cpu")))


def clip_to_request(npz_path: Path, top_k: int = 3) -> dict:
    """Turn a stored clip into the JSON the browser sends: detected hands + pose per frame."""
    seq = load_sequence(npz_path)
    frames = []
    for t in range(seq.num_frames):
        hands = [
            {"landmarks": seq.hands[t, h].round(5).tolist(), "score": 1.0}
            for h in range(2)
            if seq.hand_present[t, h]
        ]
        pose = seq.pose[t].round(5).tolist() if seq.pose_present[t] else None
        frames.append({"hands": hands, "pose": pose})
    return {"frames": frames, "width": seq.meta["width"], "height": seq.meta["height"], "top_k": top_k}


def held_out_clips(n: int) -> list[dict]:
    if not TEST_SPLIT.exists():
        pytest.skip("INCLUDE splits not generated")
    with TEST_SPLIT.open(newline="", encoding="utf-8") as f:
        rows = [r for r in csv.DictReader(f) if float(r["any_hand_rate"]) >= 0.9]
    rng = np.random.default_rng(0)
    return [rows[i] for i in rng.choice(len(rows), n, replace=False)]


def test_health_and_labels(client):
    health = client.get("/health").json()
    assert health["model_loaded"] and health["num_signs"] == 262
    labels = client.get("/labels").json()
    assert labels["count"] == 262
    assert {"sign": "GOOD_MORNING", "label": "Good morning"} in labels["labels"]
    card = client.get("/model").json()
    assert "feature_mean" not in card and card["active_threshold"] > 0


def test_predicts_held_out_test_clips(client):
    clips = held_out_clips(25)
    correct_top1 = correct_top3 = 0
    for row in clips:
        body = client.post("/predict", json=clip_to_request(PROJECT_ROOT / row["landmarks_path"])).json()
        top = [c["sign"] for c in body["top_k"]]
        correct_top1 += top[0] == row["label"]
        correct_top3 += row["label"] in top
        assert body["inference_ms"] < 1000
    # Offline test accuracy is 97%; the API path must stay in the same range.
    assert correct_top1 >= 22, f"top-1 {correct_top1}/25"
    assert correct_top3 >= 24, f"top-3 {correct_top3}/25"


def test_no_hands_is_not_a_guess(client):
    frames = [{"hands": [], "pose": None} for _ in range(24)]
    body = client.post("/predict", json={"frames": frames, "width": 640, "height": 480}).json()
    assert body["status"] == "no_hands"
    assert body["sign"] is None and body["label"] is None


@pytest.mark.parametrize(
    "payload",
    [
        {"frames": [{"hands": []}] * 3, "width": 640, "height": 480},  # too few frames
        {"frames": [{"hands": [{"landmarks": [[0, 0, 0]] * 20}]}] * 10, "width": 640, "height": 480},  # 20 points
        {"frames": [{"pose": [[0, 0, 0, 1]] * 10}] * 10, "width": 640, "height": 480},  # short pose
        {"frames": [{"hands": []}] * 10, "width": 0, "height": 480},  # bad size
    ],
)
def test_invalid_payloads_are_rejected(client, payload):
    assert client.post("/predict", json=payload).status_code == 422


def test_missing_model_gives_clear_503(tmp_path):
    c = TestClient(create_app(Settings(model_dir=tmp_path / "nope", device="cpu")))
    assert c.get("/health").json()["model_loaded"] is False
    r = c.post("/predict", json={"frames": [{"hands": []}] * 10, "width": 640, "height": 480})
    assert r.status_code == 503 and "export_model.py" in r.json()["detail"]
