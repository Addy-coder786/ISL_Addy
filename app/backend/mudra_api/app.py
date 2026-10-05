"""FastAPI application factory."""

from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

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
    load_error: str | None = None
    try:
        recognizer = SignRecognizer(settings.model_dir, settings.device, settings.uncertain_threshold)
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
            "num_signs": len(recognizer.classes) if recognizer else 0,
            "device": str(recognizer.device) if recognizer else None,
            "error": load_error,
        }

    @app.get("/labels")
    def labels() -> dict:
        rec = require_model()
        return {"count": len(rec.classes), "labels": [{"sign": c, "label": readable(c)} for c in rec.classes]}

    @app.get("/model")
    def model_card() -> dict:
        rec = require_model()
        card = {k: v for k, v in rec.card.items() if k not in ("feature_mean", "feature_std", "classes")}
        card["num_signs"] = len(rec.classes)
        card["active_threshold"] = rec.threshold
        return card

    @app.post("/predict", response_model=PredictResponse)
    def predict(req: PredictRequest) -> dict:
        return require_model().predict(req, settings.min_hand_rate)

    return app
