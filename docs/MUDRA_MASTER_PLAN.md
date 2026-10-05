# MUDRA — Master Analysis & Implementation Plan

Date: 2026-10-04
Sources analysed: this handoff package, GitHub `aryanhinge20-dot/Mudra_ISL_Platform` (6 commits, last push 2026-08-21), `MUDRA_ISL_HYBRID_IMPLEMENTATION.md`, `MUDRA_ISL_CONTEXT_AWARE_IMPLEMENTATION.md`, architecture diagrams.

---

## 1. Where the project actually stands

### 1.1 What is genuinely done (and good)

| Area | Evidence | Quality |
|---|---|---|
| Product shell & brand | React 18 + Vite + Tailwind, 5 pages, glass design system, intro loader | Strong — keep it |
| 3D avatar (text → sign) | `src/avatar/` — Three.js + `ybot.glb`, 26 alphabet + 13 word keyframe animations, fingerspelling fallback | Strong — the most finished subsystem |
| Learn page | Sentence parser → word-by-word avatar playback, EN/HI/MR templates | Working |
| Live hand tracking | MediaPipe Hands in browser, skeleton overlay | Working |
| Practice coach UX | 4-dimension feedback UI with coaching tips | Good UX, weak engine (see below) |
| Accessibility | Contrast, text scale, reduced motion, speech rate | Good |
| Multilingual TTS | Web Speech API `en-IN / hi-IN / mr-IN` | Working |

### 1.2 What is claimed but NOT actually in either codebase

The achievement/SWOT docs describe a dataset extraction pipeline, Random-Forest models, `.pkl` bridge, template library and a 44 % accuracy experiment. **None of these exist in the handoff package or the GitHub repo.** The GitHub repo is frontend-only (88 files).

| Claimed | Reality |
|---|---|
| "Dataset extraction pipeline (.npy/.npz, shoulder-normalised, velocity features)" | Not present. `data/` folders are empty |
| ~794 videos, ~1,090 images | Not present anywhere |
| Random Forest / template matching / `.pkl` bridge | Not present. `pythonRecognizer.js` posts to `127.0.0.1:8765/predict` — no such server exists |
| "Real-time recognition / ISL classifier" | **Hand-written if/else rules** for 8 signs, single frame (`islClassifier.js`). No machine learning |
| Backend "inference layer" | `main.py` has only `/` and `/health` |
| Training pipeline | `train_baseline.py` is a 10-line placeholder |
| Progress dashboard "87 % accuracy, 5-day streak" | **Hard-coded fake numbers** in `ProgressPage.jsx` (and includes SORRY/PLEASE which don't exist in the lexicon) |

→ **Action needed from the team:** locate the original extraction scripts, the 794 videos / 1,090 images and the RF experiment. If they are lost, the plan below still works using public datasets.

### 1.3 Bugs and technical debt found

| # | Issue | Location | Severity |
|---|---|---|---|
| B1 | Recognition is rule-based, 8 of 13 words, static single frame — dynamic signs (THANK YOU, GOODBYE, HELP) cannot be recognised by design | `services/islClassifier.js` | Critical |
| B2 | `classifyISLSign` picks the max rule score with a 68 % threshold; unknown signs `default:` score 75/80/80 → false positives | `islClassifier.js:232` | High |
| B3 | Progress page shows fabricated metrics — contradicts the project's own "zero fake confidence" principle | `pages/ProgressPage.jsx:16-60` | High (trust) |
| B4 | `expressionAnalyzer.js` labels users "Angry", "Sad" from hand-tuned blendshape weights calibrated on one camera — conflicts with the context-aware spec's safety rule (non-manual cues ≠ emotions) | `services/expressionAnalyzer.js` | High (ethics) |
| B5 | Python bridge: wrong port (8765 vs 8000), endpoint missing, window = 1 frame, pose always `null` | `services/pythonRecognizer.js` | Medium |
| B6 | Handoff package was missing `public/wasm`, `public/models/face_landmarker.task`, `public/assets/mudra-intro.mp4` → face tracking & intro broken | **Fixed during this session** (copied from GitHub) | — |
| B7 | Two MediaPipe stacks: legacy `@mediapipe/hands` (deprecated, CDN-loaded) + `@mediapipe/tasks-vision` | `handTracker.js`, `faceExpressionTracker.js` | Medium |
| B8 | README says frontend on :5173, Vite config uses :3000 | `vite.config.js`, `README.md` | Low |
| B9 | `requirements.txt` pins (mediapipe 0.10.18, numpy 2.1.2 …) have no wheels for this machine's Python 3.14; bundled `.venv` was from another PC | **Fixed during this session** | — |
| B10 | No git repo in handoff, no tests, no lint, no CI, 1.2 MB single JS bundle, tab state instead of router (no deep links / back button) | project-wide | Medium |
| B11 | `expressiveTone.js` empty file; `ishaara-react` broken gitlink in GitHub repo | misc | Low |

---

## 2. Target architecture (refined from your hybrid + context specs)

Your two specs are well-designed (staged build, ablations, signer-independent splits, no fake metrics, confirmation UI for urgency). Four refinements:

1. **Landmark-first, RGB second.** With < 1k own videos, an RGB CNN learns backgrounds/clothes/signer identity. Published ISL results (INCLUDE) show pose/landmark models at 91–98 % top-1. Build the landmark model first; add the CNN branch as ablation **E** and keep it only if it measurably helps on unseen signers.
2. **Don't lose hand location.** Wrist-relative normalisation (spec §4) deletes *where* the hand is (chin vs chest vs temple), which distinguishes many ISL signs. Feed both: (a) wrist-relative hand shape, and (b) hand position relative to shoulders/nose (pose landmarks). Use MediaPipe Holistic-style input: 2×21 hand + upper-body pose + a few face anchors (≈ 27–75 keypoints).
3. **CNN on hand crops, not full frames**, if/when added. Cache frozen-CNN features to disk so training fits the 8 GB RTX 5060.
4. **Inference split for privacy & latency:** browser does MediaPipe (already does) → sends a 24–32-frame landmark window (not video) to FastAPI `/predict` → PyTorch model. Later export to ONNX and run in-browser (onnxruntime-web) so no camera data leaves the device.

```
Browser (MediaPipe Tasks: hands + pose + face)
   └─ landmark window [T × K × 3] + presence masks ──► FastAPI /predict
                                                        ├─ Landmark encoder (MLP/GCN per frame)
                                                        ├─ [optional] hand-crop CNN features
                                                        ├─ BiLSTM (baseline) → Transformer (comparison)
                                                        └─ logits → calibrated score, "Uncertain" below threshold
   ◄── {sign, score, top-k, uncertain} ──────────────────┘
SignSequenceMemory → Context Engine (later phases) → Confirmation UI for possible urgency
```

---

## 3. Datasets — what to use to maximise accuracy

### 3.1 Recommended stack (in order)

| Tier | Dataset | Size | Use | License | Notes |
|---|---|---|---|---|---|
| 1 | **INCLUDE** (AI4Bharat, ACM MM 2020) | 4,287 videos, 263 words, 15 categories, 7 signers | Main ISL training set | CC-BY-4.0 (Zenodo 4010759) | 56.8 GB RGB, **or 0.6 GB pose version via OpenHands**. Reported: 85.6 % (orig. paper), SL-GCN 93.5 % (OpenHands), HWGAT 97.67 % |
| 1 | **INCLUDE-50** | 50-word subset | Fast experiments/ablations | CC-BY-4.0 | 94.5 % in original paper |
| 1 | **Google ISLR "asl-signs"** (Kaggle 2023) | ~94k sequences, 250 signs, 21 signers | **Pretrain** landmark encoder — already MediaPipe Holistic format | Kaggle competition rules (check) | Different language → pretraining only |
| 2 | **Own 794 videos + 1,090 images** | — | Fine-tune on MUDRA vocabulary | yours | Must locate first |
| 2 | **Kaggle ISL alphabet/digit sets** (e.g. prathumarikeri "Indian Sign Language (ISL)", atharvadumbre "ISLRTC referred") | ~30–42k images, A–Z / 0–9 | Static fingerspelling classifier (extract landmarks) | Kaggle per-dataset | 1–3 signers, plain backgrounds → overfit risk |
| 3 | **FDMSE-ISL** (Patra et al. 2025) | 40,033 videos, 2,002 words, 20 deaf signers | Large ISL pretraining | Research use, on request | Best ISL-specific pretraining source if granted |
| 3 | **ISL-CSLTR** | 700 videos, 100 sentences, 7 signers | Sentence-level / continuous | CC-BY-4.0 (Mendeley) | For phase 6+ |
| 3 | **iSign / ISLTranslate / CISLR** | 118k / 31k pairs / 4.7k words (1-shot) | Sentence translation, SSL pretraining | **Non-commercial** (NC / NC-ND) | OK for research; **not** for a commercial startup build |
| — | WLASL, MS-ASL, AUTSL | 21k / 25k / 38k videos | Optional pretraining | WLASL C-UDA non-commercial | Lower priority than asl-signs |
| — | ISLRTC dictionary videos | ~10k signs | Reference / validation only | No published license — treat as copyrighted | Don't redistribute |

### 3.2 Own data collection (the real accuracy lever)

Public data won't contain every MUDRA word (NAMASTE, WATER, HELP may need own recordings). Signer diversity matters more than video count.

- Target per sign: **≥ 10 signers × ≥ 5 repetitions**, varied lighting/background/distance, both dominant hands.
- Build an in-app **Record mode** (consent screen → store landmarks only, optional video) to collect this quickly.
- Validate signs with an ISL instructor / Deaf community member; record `signer_id` in metadata for signer-independent splits.

### 3.3 Training recipe for top accuracy

1. Pretrain encoder on asl-signs (self-supervised masked-landmark or supervised), 2. train on INCLUDE, 3. fine-tune on MUDRA vocab.
2. Landmark augmentation: rotation ±15°, scale, shear, temporal resampling (0.8–1.2× speed), frame dropout, Gaussian jitter, mirroring **with handedness swap** (careful: only for signs that are symmetric).
3. Signer-independent split, class-weighted CE + label smoothing, AdamW, cosine LR, early stop on val macro-F1.
4. Ensemble 2–3 seeds/architectures for the final model; calibrate with temperature scaling.
5. Models to compare: Landmark-MLP+BiLSTM (spec baseline) → 1D-CNN+Transformer (Kaggle winner style) → SL-GCN → +hand-crop CNN.

**Realistic targets (to be measured, not claimed):** INCLUDE test ≥ 90 % top-1 (literature range 85–98 %); MUDRA vocab on *unseen signers* ≥ 85 % macro-F1; live latency < 150 ms.

---

## 4. Phased roadmap

Each phase has an exit criterion. Don't start the next until it's met.

### Phase 0 — Foundation & honesty (≈ 1 week)
- `git init`, merge with GitHub history, `.gitignore`, pre-commit (ruff, eslint/prettier).
- Replace fake Progress data with real local session tracking (or "No data yet").
- Rename emotion output to "non-manual cues (experimental)" or hide it behind a flag; remove "Angry/Sad" labels.
- Fix port/README mismatches, remove dead files, React Router for deep links.
- **Exit:** clean repo, app runs via `start_all.bat`, no fabricated numbers in UI.

### Phase 1 — Data pipeline (≈ 1–2 weeks)
- `training/src/preprocessing`: frame sampler, MediaPipe Tasks landmark extractor (hands + pose + face subset), normalisation (wrist-relative + shoulder-relative), presence masks, `.npz` per clip + `manifest.csv` (clip, label, signer, source, quality).
- Dataset audit script (counts/class, durations, corrupt files, detection rate).
- Signer-/video-level split generator. Unit tests for normalisation & sampling.
- Download INCLUDE (pose version first), extract own data.
- **Exit:** reproducible `data/processed` + audit report.

### Phase 2 — Baselines & hybrid model (≈ 2 weeks)
- PyTorch models: LandmarkMLP, BiLSTM classifier, Transformer classifier, (later) ResNet18/MobileNetV3 hand-crop encoder.
- Training loop (AMP on RTX 5060, checkpoints save weights + class map + preprocessing config), evaluation (macro-F1, confusion matrix, per-class, predictions CSV).
- Ablation runner for spec models A–E; results table auto-generated.
- **Exit:** measured ablation table on INCLUDE + MUDRA vocab.

### Phase 3 — Serve the model in the app (≈ 1 week)
- FastAPI `/predict` (landmark window in, top-k + score + uncertain out), `/labels`, `/health`, model registry folder.
- Frontend: replace rule classifier in Communicate with the model; keep rule engine only for Practice *coaching tips*; sliding window + majority smoothing; "Uncertain" state; latency display.
- Migrate `@mediapipe/hands` → `tasks-vision` HandLandmarker + PoseLandmarker.
- **Exit:** live demo of model recognition with measured latency and threshold chosen on validation data.

### Phase 4 — Sequence memory & non-manual cues (≈ 2 weeks)
- `SignSequenceMemory` (raw + smoothed predictions, timestamps, serialisation, tests).
- `DynamicsFeatureExtractor` & `NonManualCueExtractor` (eyes, brows, mouth, head yaw/pitch/roll + derivatives) — features only, no emotion labels.
- **Exit:** unit-tested extractors; ablation shows whether face/pose help sign accuracy.

### Phase 5 — Context engine & urgency (research, ≈ 3+ weeks)
- Requires an annotated context dataset (annotation protocol per spec §21).
- Multi-task model (context head + urgency head), calibration (Brier, reliability diagram), confirmation UI, no automatic emergency actions.
- **Exit:** urgency PR-AUC/F1 on held-out signers; calibrated scores.

### Phase 6 — Product & scale
- Learn: levels, categories, mastery tracking. Practice: model-based scoring + dynamic sign support.
- Expand avatar vocabulary (target 100+ words), continuous sentence recognition (ISL-CSLTR), ONNX in-browser inference, PWA/mobile, Docker, CI, pilot with Deaf users & ISL instructors.

---

## 5. Proposed repository layout (merge of both specs)

```
Mudra_Claude_Handoff/
├── app/
│   ├── frontend/                # existing React app (unchanged look & feel)
│   └── backend/
│       ├── main.py              # FastAPI app factory
│       ├── api/predict.py       # /predict, /labels
│       ├── inference/           # model loading, smoothing, calibration
│       └── requirements.txt
├── training/
│   ├── configs/                 # yaml per experiment
│   ├── src/mudra_ml/
│   │   ├── preprocessing/       # frame_sampler, landmark_extractor, normalization
│   │   ├── datasets/            # isl_dataset, augmentations
│   │   ├── models/              # landmark_mlp, cnn_encoder, temporal (bilstm/transformer), hybrid
│   │   ├── context/             # sequence_memory, dynamics, nonmanual, context_engine (later)
│   │   ├── training/            # train, losses, callbacks
│   │   └── evaluation/          # metrics, confusion_matrix, ablation report
│   ├── scripts/                 # audit_dataset, extract_landmarks, make_splits, train, evaluate
│   ├── tests/
│   └── assets/mediapipe/        # .task models (downloaded)
├── data/{raw,processed,metadata}/
├── checkpoints/  experiments/
└── docs/
```

---

## 6. Environment set up during this session

| Item | State |
|---|---|
| Machine | i7-13620H, 16 GB RAM, **RTX 5060 Laptop 8 GB** (needs CUDA 12.8+ PyTorch builds), 388 GB free |
| Python | 3.14.7 (only version installed). MediaPipe 1.0.1 provides universal wheels → works |
| Backend/ML venv | `app/backend/.venv` rebuilt (old one pointed to another PC's Python) |
| Frontend | `npm install` OK, production build OK |
| Frontend assets | `public/wasm`, `public/models/face_landmarker.task`, `public/assets/mudra-intro.mp4` merged from GitHub |
| MediaPipe models (Python) | `training/assets/mediapipe/`: hand, pose (lite/full), face, holistic |

---

## 7. Progress log

### 2026-10-04: Phase 0 done
- Progress page now uses real on-device practice sessions (no fabricated numbers); Practice records sessions.
- Classifier no longer gives signs without rules a default 77.5% score (that caused false GOODBYE detections in Communicate).
- Facial "emotion" labels replaced by descriptions of facial movement (experimental, uncalibrated).
- Python bridge pointed at FastAPI with a 24-frame window; port/README fixes; git initialised.

### 2026-10-04: Phase 1 done (public data); waiting on the team's own data
- `training/src/mudra_ml`: schema, frame sampler, MediaPipe Tasks extractor (hands + pose, anatomical hand slots),
  normalisation (shape + body-relative location, 162-dim frames), manifests, grouped splits. 28 unit tests pass.
- Scripts: `audit_dataset.py`, `extract_landmarks.py`, `make_splits.py`, `convert_include_pose.py`.
- INCLUDE pose (CC-BY-4.0) downloaded and converted: 263 classes, 4,284 clips, split 2,908 / 523 / 816 (official test kept).
  INCLUDE-50: 646 / 118 / 192.
- Found and corrected a scaling quirk in the OpenHands INCLUDE release (x and y multipliers swapped); without the fix
  bodies were stretched ~3x vertically and a model would not transfer to webcam input.
- Next: run audit + extraction on the original 794 videos / 1,090 images once their location is known, then Phase 2.

### 2026-10-04: Phase 2 results on public data (landmark models)
Official INCLUDE test sets, single seed, not signer-independent (INCLUDE has no signer IDs).

| Model | INCLUDE-50 acc / macro-F1 | INCLUDE (263) acc / macro-F1 | Params |
|---|---|---|---:|
| Landmark MLP + pooling | 97.9% / 0.974 | 96.5% / 0.968 | 150k |
| Landmark MLP + BiLSTM (spec default) | 96.4% / 0.951 | 96.6% / 0.964 | 2.6M |
| Landmark MLP + Transformer | 99.0% / 0.990 | 96.9% / 0.971 | 1.4M |
| BiLSTM without velocity features | 99.5% / 0.990 | 97.1% / 0.971 | 2.6M |
| BiLSTM without augmentation | 96.4% / 0.963 | 95.2% / 0.950 | 2.6M |

Published INCLUDE (263) references: 85.6% (original paper), 93.5% (OpenHands SL-GCN), 97.7% (HWGAT).
Findings: augmentation helps (+1.4 pts on INCLUDE); velocity features are not needed; temporal models
(BiLSTM / Transformer) are within ~0.5 pt of each other, which is inside single-seed noise.
INCLUDE-50 validation is too small to calibrate confidence; full-INCLUDE calibration is usable (ECE 0.01-0.02).
Tables: `experiments/ablations/include*_summary.md`. CNN ablations (A, D, E) still need RGB video.

Seed check (3 seeds each, full INCLUDE test): BiLSTM without velocity 96.73% ± 0.57 (macro-F1 0.967 ± 0.007, ECE 0.013);
Transformer 96.45% ± 0.75 (macro-F1 0.966 ± 0.007, ECE 0.018). The difference is inside run-to-run spread: a statistical tie.
Phase 3 candidate: BiLSTM without velocity (best mean, best calibration); MLP+pool (150k params, 96.5%) as the in-browser/ONNX option.

### 2026-10-05: Phase 3 done (model in the app, INCLUDE vocabulary)
- Exported `include_C_bilstm_no_velocity` (chosen on validation macro-F1 0.976) to `app/backend/models/isl_include_bilstm`
  with a model card. "Uncertain" threshold 0.95 chosen on validation: keeps 92.9% of clips at 98.6% accuracy.
- FastAPI `mudra_api`: `/health`, `/labels`, `/model`, `/predict`; reuses `mudra_ml` feature code. Through the API the
  816 INCLUDE test clips score 97.06% top-1 (identical to offline evaluation); CPU inference 15 ms median.
- Browser moved from legacy `@mediapipe/hands` to MediaPipe Tasks hands + pose (local models, GPU with CPU fallback).
- Communicate uses the model (rule engine only as offline fallback); shows Uncertain / no-hands states, latency, and
  commits a word after two consecutive confident windows. Removed a hard-coded "94% confidence" on manual chips.
- Streaming replay of 8 held-out clips through the browser client: 7/8 committed correctly, 0 wrong commits, 25 ms median round trip.
- Headless-browser check: Communicate, Practice, Progress load and track with no console errors.
- Not yet verified: live signing by a real person in front of a webcam (needs a human); expect lower accuracy than INCLUDE.

### 2026-10-05: Team data from C:\ISL processed and trained
- Inventory: 61 isolated words (1,210 recordings + 2 rotated copies each), 101 sentences (687 videos),
  ISLVT 78 sentences with Marathi (152 videos, not yet used), alphabet images (12,637, not yet used). No signer IDs anywhere.
- Unseen-signer check: INCLUDE-only model on the team's 9 shared words = 8.3% top-1 (sign variants / handedness differ).
- Pipeline fixes: rotated copies grouped with their original; byte-identical duplicates removed (3 pairs had leaked
  across splits); run_ablation ignored shared settings (invalid sentence runs deleted, test added); threshold floor 0.5.
- Combined model (INCLUDE + 61 words, 314 words): INCLUDE test 96.2%; team words held-out recording day 98.0%.
- Streaming evaluator added: the first combined model committed a wrong word on 89.5% of team clips (it read the
  start of a sign as STILL). Added a "no sign yet" background class (25% of training samples) and a 4 s window,
  both chosen on validation: team words 94.5% correct / 0.6% wrong; INCLUDE 92.6% / 2.3% (held-out test).
  Browser-client replay at 30 fps: 23/24 correct, 0 wrong.
- Sentence model (101 phrases, ~4.5 clips per class): 57% top-1, 76% top-5; transfer from the word model did not help
  (51.6%, within noise). Needs more recordings per sentence.
