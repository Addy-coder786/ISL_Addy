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
- `app/backend` — Python API and inference layer
- `app/shared` — shared config and common values
- `data/raw_videos` — source training videos
- `data/extracted_landmarks` — processed landmark sequences
- `training` — training scripts and model work
- `docs` — architecture and project notes

## Quick start

1. Open this folder in Windows Explorer.
2. Run `start_all.bat`.
3. The backend should start on `http://localhost:8000`.
4. The frontend should start on `http://localhost:3000`.

## Included markdown files

- `MUDRA_PROJECT_ACHIEVEMENTS.md`
- `MUDRA_SWOT_ANALYSIS.md`
- `MUDRA_IMPROVEMENT_PLAN.md`
- `MUDRA_UNIFIED_PROJECT_BLUEPRINT.md`

## Notes

- This package was prepared for easy zipping and sending to another AI assistant or collaborator.
- Generated folders like `node_modules` and build outputs were removed to keep the zip smaller and cleaner.
- Add your real training data into `data/raw_videos` when ready.
