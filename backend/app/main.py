from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, FileResponse
import os

from app.database import engine, ensure_schema
from app import models
from app.routers import auth as auth_router
from app.routers import jobs as jobs_router
from app.routers import dashboard as dashboard_router
from app.routers import db_viewer as db_viewer_router

# Create database tables if they don't exist
models.Base.metadata.create_all(bind=engine)
ensure_schema()
ensure_schema()

app = FastAPI(
    title="SwipeX Core Engine",
    version="1.0.0"
)

# Enable CORS for all local origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    favicon_path = os.path.join("static", "favicon.ico")
    if os.path.exists(favicon_path):
        return FileResponse(favicon_path)
    return Response(status_code=204)

@app.get("/")
def root():
    return {
        "message": "SwipeX Backend is Running Successfully"
    }

app.include_router(auth_router.router)
app.include_router(dashboard_router.router)
app.include_router(jobs_router.router)
app.include_router(db_viewer_router.router)

app.mount("/static", StaticFiles(directory="static"), name="static")
