# MUDRA Architecture Overview

This project is organized around a unified product flow:

1. Learn: vocabulary and sentence teaching
2. Practice: real-time sign evaluation with webcam feedback
3. Communicate: translation and speech/sign conversion

## Frontend

The frontend is the user-facing app shell. It contains learning pages, practice flows, and communication views.

## Backend

The backend exposes API endpoints for health checks, inference, and future model interaction.

## Data pipeline

The data pipeline handles raw videos, extraction, normalization, labeled landmarks, and training outputs.

## Training

The training directory stores scripts, baseline models, and evaluation artifacts.
