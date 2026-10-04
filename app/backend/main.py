from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="MUDRA API", version="0.1.0")


class HealthResponse(BaseModel):
    status: str
    message: str


@app.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return {
        "status": "ok",
        "message": "MUDRA unified backend is running.",
    }


@app.get("/")
def root() -> dict:
    return {
        "project": "MUDRA",
        "mode": "unified",
        "status": "initialized",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
