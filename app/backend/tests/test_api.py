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

from mudra_api.app import create_app
from mudra_api.settings import Settings
from mudra_ml.config import PROJECT_ROOT
from mudra_ml.preprocessing.sequence import load_sequence

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


COMBINED_DIR = BACKEND / "models" / "isl_mudra_combined_v3_bilstm"
COMBINED_TEST = PROJECT_ROOT / "data" / "metadata" / "splits" / "combined_words" / "test.csv"


@pytest.mark.skipif(not (COMBINED_DIR / "model.pt").exists() or not COMBINED_TEST.exists(), reason="combined model/data absent")
def test_combined_model_waits_for_the_whole_sign():
    """The start of a sign (rest + first moments) must give no_sign/uncertain, never a wrong word."""
    c = TestClient(create_app(Settings(model_dir=COMBINED_DIR, device="cpu")))
    assert c.get("/health").json()["num_signs"] == 314
    assert all(not item["sign"].startswith("_") for item in c.get("/labels").json()["labels"])
    with COMBINED_TEST.open(newline="", encoding="utf-8") as f:
        rows = [r for r in csv.DictReader(f) if r["source"] == "islwords"][:12]
    waiting = 0
    for r in rows:
        full = clip_to_request(PROJECT_ROOT / r["landmarks_path"])
        opening = {**full, "frames": full["frames"][: max(8, len(full["frames"]) // 6)]}
        body = c.post("/predict", json=opening).json()
        assert body["status"] != "ok" or body["sign"] == r["label"], f"wrong word committed early: {body['sign']}"
        waiting += body["status"] in ("no_sign", "uncertain", "no_hands")
        assert all(not cand["sign"].startswith("_") for cand in body["top_k"])
    assert waiting >= 8


@pytest.mark.skipif(not (COMBINED_DIR / "model.pt").exists() or not COMBINED_TEST.exists(), reason="combined model/data absent")
def test_stream_segments_and_recognises_a_sign():
    c = TestClient(create_app(Settings(model_dir=COMBINED_DIR, device="cpu")))
    with COMBINED_TEST.open(newline="", encoding="utf-8") as f:
        row = next(r for r in csv.DictReader(f) if r["source"] == "islwords" and float(r["any_hand_rate"]) > 0.9)
    req = clip_to_request(PROJECT_ROOT / row["landmarks_path"])
    rest = [{"hands": [], "pose": req["frames"][0]["pose"]}] * 30  # 1 s of resting before and after
    frames = rest + req["frames"] + rest
    # Expected events straight from the shared Python implementation
    from mudra_ml.config import project_path as pp
    from mudra_ml.preprocessing.sequence import assign_hands
    from mudra_ml.streaming import (
        Frame,
        ModelBundle,
        SegmenterConfig,
        StreamingRecognizer,
    )

    local = StreamingRecognizer(ModelBundle(COMBINED_DIR), SegmenterConfig.load(pp("training/configs/streaming.json")),
                                req["width"], req["height"])
    expected = []
    for i, fr in enumerate(frames):
        pose = np.asarray(fr["pose"], np.float32) if fr["pose"] else None
        hands, present, _ = assign_hands([np.asarray(h["landmarks"], np.float32) for h in fr["hands"]],
                                         ["" for _ in fr["hands"]], [1.0 for _ in fr["hands"]], pose, False)
        ev = local.push(Frame(i / 30, hands, present, pose if pose is not None else np.zeros((33, 4), np.float32), pose is not None))
        if ev:
            expected.append(ev)
    assert [e["event"] for e in expected][-1] == "sign_ended"
    assert expected[-1]["result"]["status"] == "ok" and expected[-1]["result"]["sign"] == row["label"]

    with c.websocket_connect("/stream") as ws:
        ws.send_json({"type": "start", "width": req["width"], "height": req["height"]})
        for i, fr in enumerate(frames):
            ws.send_json({"type": "frame", "t": i / 30, **fr})
        got = [ws.receive_json() for _ in expected]
    assert [g["event"] for g in got] == [e["event"] for e in expected]
    assert got[-1]["result"]["sign"] == row["label"] and got[-1]["result"]["label"]


def test_segmenter_states():
    from mudra_ml.streaming import Frame, SegmenterConfig, SignSegmenter

    seg = SignSegmenter(SegmenterConfig(on_s=0.1, off_s=0.2, min_sign_s=0.2, pad_pre_s=0, pad_post_s=0), 640, 480)
    pose = np.zeros((33, 4), np.float32)
    pose[11], pose[12] = [0.6, 0.5, 0, 1], [0.4, 0.5, 0, 1]
    hand_up = np.zeros((2, 21, 3), np.float32)
    hand_up[1, :, :2] = [0.5, 0.45]  # wrist above the shoulder line
    events = []
    for i in range(90):
        t = i / 30
        signing = 30 <= i < 60
        present = np.array([False, signing])
        ev, segment = seg.push(Frame(t, hand_up if signing else np.zeros_like(hand_up), present, pose, True))
        if ev:
            events.append((ev, round(t, 2), None if segment is None else segment.hand_present.shape[0]))
    assert [e[0] for e in events] == ["sign_started", "sign_ended"]
    assert 1.0 <= events[0][1] <= 1.2 and events[1][1] <= 2.3
