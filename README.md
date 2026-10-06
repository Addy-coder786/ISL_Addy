# MUDRA: Indian Sign Language Learning & Real-Time Communication

MUDRA turns Indian Sign Language (ISL) into text and speech from an ordinary webcam, and turns
text or speech into ISL with a 3D avatar. It combines a React web app, a FastAPI recognition
service and a PyTorch landmark model trained on public and team-recorded ISL data.

Only body and hand landmark coordinates leave the browser, never camera images.

## Status (6 Oct 2026)

| Area | State |
|---|---|
| Web app (Home, Learn, Practice, Communicate, Progress) | Working; avatar demonstrates 26 letters and 13 words |
| Live recognition (Communicate) | Working: trained model, 314 words, sign start/end detection; trained on webcam-style landmarks |
| Data pipeline (MediaPipe landmarks, leakage-safe splits) | Working: INCLUDE + team data processed |
| Real-time Phase 1: sign start/end detection | Done |
| Real-time Phase 2: smoothing, commit rules, idle robustness | Done |
| Real-time Phase 3: more data and signers, few-shot new words | Next |

## Results

Live-use benchmark: held-out signs joined into continuous streams with transitions and idle
movement. Settings were chosen on validation streams; these are held-out test numbers.

| Source | Correct | Wrong | Missed | Extra words | False words while idle |
|---|---|---|---|---|---|
| INCLUDE pose release (816 signs) | 91.3% | 1.7% | 7.0% | 0 | 0 |
| INCLUDE original videos, MediaPipe landmarks (498 signs) | 92.6% | 1.8% | 5.6% | 0 | 0 |
| Team words (181 signs) | 97.8% | 0.0% | 2.2% | 0 | 0 |

The second row is the closest proxy for the webcam: the same landmark pipeline the browser runs.
The first model, trained on the pose release only, scored 41.8% correct / 7.0% wrong on that row.

Clip-level accuracy (complete pre-cut clips):
- INCLUDE 263 words, pose release: 96.5%. Published references: 85.6% (original paper),
  93.5% (OpenHands SL-GCN), 97.7% (HWGAT).
- INCLUDE original videos re-extracted with MediaPipe: 97.8% (first model: 71.5%).
- Team words, on a recording day held out from training: 98.0%.
- Earlier rule-based / Random-Forest system: about 44%.

**Limits:**
- No dataset has signer IDs, so none of these numbers measure accuracy on new people.
- The idle movements in the benchmark are synthetic.
- The app's own words NAMASTE, WATER, HELP, YES, NO, GOODBYE, HOME and PERSON have no training data yet.

## How it works

```
Browser                               Backend (FastAPI)                      Model
MediaPipe Tasks hands + pose  --WS--> /stream: SignSegmenter            --> BiLSTM over 24 frames
(on device, ~30 fps)                  resting -> signing -> ended            of hand shape, hand
                                      classify each whole sign once          position vs shoulders,
UI: Signing... / "Looks like X" <---- (3-cut smoothing, threshold,           upper-body pose
    word added / "Did you mean"        cooldown, "no sign" class)
```

1. **Landmarks:** 2 x 21 hand points and 33 pose points per frame. Hands are matched to the
   signer's left/right by the nearest pose wrist.
2. **Features (162 per frame):** wrist-relative hand shape plus hand location relative to the
   shoulders, so chin vs chest signs stay distinct.
3. **Segmentation:** a sign starts when hands are raised or moving, and ends after 0.4 s of rest.
   Tuned on validation streams (`training/configs/streaming.json`).
4. **Decision:** the whole sign is classified once. A "no sign yet" class covers rest, partial
   signs and fidgets; a word is added at 80% confidence or more; otherwise the top 3 are offered.

## Quick start (Windows)

1. Run `start_all.bat`. It creates the Python environment, installs dependencies and starts both servers.
2. Open http://localhost:3000, then **Communicate -> Start Camera**.
3. Sign one word from start to finish, then lower your hands. The word is added when the sign ends.

Backend: http://localhost:8000 (`/docs`, `/health`, `/labels`, `/predict`, WebSocket `/stream`).
Requires Python 3.12+ (tested on 3.14) and Node 20+. An NVIDIA GPU is optional (training only).

## Repository layout

```
app/
  frontend/            React + Vite + Tailwind + Three.js app (pages, 3D avatar, MediaPipe tracker,
                       signRecognizer WebSocket client)
  backend/
    mudra_api/         FastAPI service: /predict, /stream, model loading
    models/            exported models (model.pt + model_card.json with metrics, threshold, licences)
    tests/             API and streaming tests
training/
  src/mudra_ml/        landmark extraction, normalisation, datasets, models, training, evaluation,
                       streaming (segmenter + recogniser)
  scripts/             audit, extract, split, train, ablate, evaluate, export, streaming benchmarks
  configs/             data, experiment and streaming settings
  tests/               unit and end-to-end tests
data/                  metadata and splits (raw videos and landmarks are not committed)
docs/
  MUDRA_MASTER_PLAN.md full analysis, dataset research, roadmap and dated progress log
  architecture.md      system architecture
  planning/            original project review documents
```

## Training workflow

See `training/README.md`. In short:

```powershell
app\backend\.venv\Scripts\activate
python training/scripts/extract_landmarks.py --source own --input data/raw/own
python training/scripts/make_splits.py --manifests data/metadata/manifest_own.csv --name own
python training/scripts/train.py --config ablation_combined.yaml --name my_model
python training/scripts/eval_continuous.py --split data/metadata/splits/<name>/val.csv --tune
python training/scripts/export_model.py --run experiments/runs/<run> --name <model>
```

Tests: `pytest training` (44) and `pytest app/backend/tests` (11).

## Data and licences

- **INCLUDE** (Sridhar et al., ACM MM 2020): pose release via AI4Bharat OpenHands and the original videos (Zenodo), CC-BY-4.0.
- **Team ISL recordings** (61 words, 101 sentences): provided by the MUDRA team. Source and
  licence to be confirmed before any public release.
- Raw videos and extracted landmarks are not committed; see `data/README.md` for the layout.

## Roadmap

Phase 3 (next):
- add datasets with more signers (FDMSE-ISL, CISLR, pre-training on large pose corpora)
- run a signer-independent test
- add few-shot new words from 1-5 example videos
- add fingerspelling from the alphabet images
- build an in-app recording tool for the app's missing words

Details are in `docs/MUDRA_MASTER_PLAN.md`.
