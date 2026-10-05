"""FastAPI application factory."""

from __future__ import annotations

import logging

import numpy as np
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from mudra_ml import schema
from mudra_ml.config import project_path
from mudra_ml.preprocessing.sequence import assign_hands
from mudra_ml.streaming import Frame, ModelBundle, SegmenterConfig, StreamingRecognizer

from mudra_api import __version__
from mudra_api.recognizer import SignRecognizer, readable
from mudra_api.schemas import PredictRequest, PredictResponse
from mudra_api.settings import Settings

log = logging.getLogger("mudra_api")


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()
    app = FastAPI(title="MUDRA API", version=__version__)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    recognizer: SignRecognizer | None = None
    bundle: ModelBundle | None = None
    load_error: str | None = None
    segmenter_cfg = SegmenterConfig.load(project_path("training/configs/streaming.json"))
    try:
        recognizer = SignRecognizer(settings.model_dir, settings.device, settings.uncertain_threshold)
        bundle = ModelBundle(settings.model_dir, str(recognizer.device))
        bundle.threshold = recognizer.threshold
        log.info("Loaded model %s (%d signs) on %s", recognizer.name, len(recognizer.classes), recognizer.device)
    except FileNotFoundError as exc:
        load_error = f"Model files not found in {settings.model_dir}: {exc.filename}"
        log.warning(load_error)

    def require_model() -> SignRecognizer:
        if recognizer is None:
            raise HTTPException(
                status_code=503,
                detail=f"{load_error}. Export one with training/scripts/export_model.py.",
            )
        return recognizer

    @app.get("/")
    def root() -> dict:
        return {"project": "MUDRA", "api_version": __version__, "docs": "/docs"}

    @app.get("/health")
    def health() -> dict:
        return {
            "status": "ok",
            "model_loaded": recognizer is not None,
            "model": recognizer.name if recognizer else None,
            "num_signs": len([c for c in recognizer.classes if not c.startswith("_")]) if recognizer else 0,
            "device": str(recognizer.device) if recognizer else None,
            "error": load_error,
        }

    @app.get("/labels")
    def labels() -> dict:
        rec = require_model()
        signs = [c for c in rec.classes if not c.startswith("_")]
        return {"count": len(signs), "labels": [{"sign": c, "label": readable(c)} for c in signs]}

    @app.get("/model")
    def model_card() -> dict:
        rec = require_model()
        card = {k: v for k, v in rec.card.items() if k not in ("feature_mean", "feature_std", "classes")}
        card["num_signs"] = len([c for c in rec.classes if not c.startswith("_")])
        card["active_threshold"] = rec.threshold
        return card

    @app.websocket("/stream")
    async def stream(ws: WebSocket) -> None:
        """Live recognition. Client sends {"type":"start","width","height"} then
        {"type":"frame","t":seconds,"hands":[{landmarks,handedness,score}],"pose":[[x,y,z,v]]|null}.
        Server replies only on changes: sign_started, sign_ended (+result), too_short."""
        await ws.accept()
        if bundle is None:
            await ws.send_json({"event": "error", "detail": load_error})
            await ws.close()
            return
        session: StreamingRecognizer | None = None
        try:
            while True:
                msg = await ws.receive_json()
                if msg.get("type") == "start":
                    session = StreamingRecognizer(bundle, segmenter_cfg, int(msg["width"]), int(msg["height"]))
                    continue
                if msg.get("type") != "frame" or session is None:
                    continue
                pose = np.asarray(msg["pose"], np.float32) if msg.get("pose") else None
                if pose is not None and pose.shape[1] == 3:
                    pose = np.concatenate([pose, np.ones((len(pose), 1), np.float32)], axis=1)
                detected = [np.asarray(h["landmarks"], np.float32) for h in msg.get("hands", [])][:2]
                hands, present, _ = assign_hands(
                    detected, [h.get("handedness") or "" for h in msg.get("hands", [])],
                    [h.get("score", 1.0) for h in msg.get("hands", [])], pose, False,
                )
                frame = Frame(float(msg["t"]), hands, present,
                              pose if pose is not None else np.zeros((schema.NUM_POSE_LANDMARKS, 4), np.float32),
                              pose is not None)
                event = session.push(frame)
                if event:
                    if "guess" in event:
                        event["guess"]["label"] = readable(event["guess"]["sign"])
                    if "result" in event:
                        for item in event["result"]["top_k"]:
                            item["label"] = readable(item["sign"])
                        sign = event["result"]["sign"]
                        event["result"]["label"] = readable(sign) if sign else None
                    await ws.send_json(event)
        except WebSocketDisconnect:
            return

    @app.post("/predict", response_model=PredictResponse)
    def predict(req: PredictRequest) -> dict:
        return require_model().predict(req, settings.min_hand_rate)

    return app
