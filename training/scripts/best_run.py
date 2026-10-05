"""Print the run directory with the best VALIDATION macro-F1 among runs matching a pattern.

Selection never looks at test scores.

    python training/scripts/best_run.py "combined_*"
"""

from __future__ import annotations

import json
import sys

from mudra_ml.config import project_path


def main() -> None:
    pattern = sys.argv[1]
    best = None
    for summary_path in project_path("experiments/runs").glob(f"{pattern}/summary.json"):
        s = json.loads(summary_path.read_text(encoding="utf-8"))
        score = s["val"]["macro_f1"]
        if best is None or score > best[0]:
            best = (score, summary_path.parent, s["temporal"])
    if best is None:
        raise SystemExit(f"no finished runs match {pattern}")
    print(f"{best[1].as_posix()}\t{best[2]}\t{best[0]:.4f}")


if __name__ == "__main__":
    main()
