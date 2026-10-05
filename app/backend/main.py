"""MUDRA backend entry point.

    python main.py            (from app/backend, with the .venv active)
    uvicorn main:app --reload
"""

import logging

from mudra_api.app import create_app

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
