"""Placeholder training script for the unified MUDRA project.

This script can later be expanded to load extracted landmark sequences,
train a baseline classifier, and evaluate performance.
"""

from pathlib import Path


def main() -> None:
    data_dir = Path(__file__).resolve().parents[1]
    print(f"MUDRA training scaffold ready at: {data_dir}")
    print("Add your extracted landmark data and replace this placeholder with the real training pipeline.")


if __name__ == "__main__":
    main()
