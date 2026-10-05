# MUDRA Claude Handoff Package

This folder contains a cleaned, zip-ready version of the unified MUDRA project along with the key planning and summary documents created during the project review.

## Included content

- Unified app structure for frontend, backend, shared config, data, and training
- Project achievements summary
- SWOT analysis
- Improvement roadmap
- Unified project blueprint
- One-click startup script for local development

## Project structure

- `app/frontend` — React + Vite MUDRA front-end
- `app/backend` — FastAPI recognition service (`mudra_api/`) serving the exported model in `models/`
- `app/shared` — shared config and common values
- `data` — raw recordings, public datasets, extracted landmarks and splits (see `data/README.md`)
- `training` — `mudra_ml` package: landmark extraction, normalisation, splits, models, training, evaluation, export (see `training/README.md`)
- `docs` — architecture notes and `MUDRA_MASTER_PLAN.md` (analysis, datasets, roadmap)

## Quick start

1. Open this folder in Windows Explorer.
2. Run `start_all.bat`.
3. The backend starts on `http://localhost:8000` (API docs at `/docs`, health at `/health`).
4. The frontend starts on `http://localhost:3000`.
5. Open **Communicate**, start the camera and sign. The pill under "Detected sign" shows
   whether the trained model is connected; without the backend the page falls back to the
   rule-based matcher for 8 static signs.

## How recognition works (Phase 3)

Browser (MediaPipe Tasks hands + pose, on-device) → rolling 2.5 s window of landmarks →
`POST /predict` → `mudra_ml` features (same code as training) → BiLSTM → calibrated
confidence. Predictions below the validation-chosen threshold are shown as "Uncertain";
a word is added to the sentence once it is recognised twice in a row. Only landmark
coordinates leave the browser, never camera images.

Current model: `app/backend/models/isl_include_bilstm` — 262 INCLUDE words, 97.1% top-1 on
the INCLUDE test set (not signer-independent). See its `model_card.json` for metrics,
threshold, data licence (CC-BY-4.0) and limitations.

## Included markdown files

- `MUDRA_PROJECT_ACHIEVEMENTS.md`
- `MUDRA_SWOT_ANALYSIS.md`
- `MUDRA_IMPROVEMENT_PLAN.md`
- `MUDRA_UNIFIED_PROJECT_BLUEPRINT.md`

## Notes

- This package was prepared for easy zipping and sending to another AI assistant or collaborator.
- Generated folders like `node_modules` and build outputs were removed to keep the zip smaller and cleaner.
- Add your training videos under `data/raw/<source>/videos/<LABEL>/` and follow `training/README.md`.
