from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from .saved import router as saved_router

import os
from pathlib import Path

from .database import engine, Base
from . import models

from .auth import router as auth_router
from .resume import router as resume_router
from .ats import router as ats_router
from .jobs import router as jobs_router
from .matching import router as matching_router
from . import ai_suggestions

# Milestone 4
from .applications import router as applications_router
from .notifications import router as notifications_router
from .analytics import router as analytics_router


# ======================================================
# PATH CONFIGURATION
# ======================================================

# backend/
BASE_DIR = Path(__file__).resolve().parent.parent

FRONTEND_DIR = BASE_DIR / "frontend"
RESUMES_DIR = BASE_DIR / "resumes"


# Make sure resume folder exists
RESUMES_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ======================================================
# CORS
# ======================================================

allowed_origins_env = os.getenv(
    "ALLOWED_ORIGINS",
    "*"
)

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in allowed_origins_env.split(",")
    if origin.strip()
]

# Authorization header is used by the application.
# Cookies are not required.
USE_CREDENTIALS = "*" not in ALLOWED_ORIGINS


# ======================================================
# DATABASE
# ======================================================

Base.metadata.create_all(
    bind=engine
)


# ======================================================
# FASTAPI APP
# ======================================================

app = FastAPI(
    title="SwipeX API",
    version="2.0.0"
)


# ======================================================
# CORS
# ======================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=ALLOWED_ORIGINS,

    allow_credentials=USE_CREDENTIALS,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ======================================================
# STATIC FILES
# ======================================================

app.mount(
    "/resumes",
    StaticFiles(
        directory=str(RESUMES_DIR)
    ),
    name="resumes"
)


app.mount(
    "/css",
    StaticFiles(
        directory=str(FRONTEND_DIR / "css")
    ),
    name="css"
)


app.mount(
    "/js",
    StaticFiles(
        directory=str(FRONTEND_DIR / "js")
    ),
    name="js"
)


app.mount(
    "/images",
    StaticFiles(
        directory=str(FRONTEND_DIR / "images")
    ),
    name="images"
)


# ======================================================
# API ROUTERS
# ======================================================

app.include_router(
    auth_router
)

app.include_router(
    resume_router
)

app.include_router(
    ats_router
)

app.include_router(
    jobs_router
)

app.include_router(
    matching_router
)

app.include_router(
    ai_suggestions.router
)

app.include_router(
    saved_router
)


# ======================================================
# MILESTONE 4 ROUTERS
# ======================================================

app.include_router(
    applications_router
)

app.include_router(
    notifications_router
)

app.include_router(
    analytics_router
)


# ======================================================
# HEALTH CHECK
# ======================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy",
        "service": "SwipeX API",
        "version": "2.0.0"
    }


# ======================================================
# FRONTEND ROUTES & HEALTH
# ======================================================

def _serve_file_or_json(file_path: Path, page_name: str):
    if file_path.exists():
        return FileResponse(str(file_path))
    legacy_path = FRONTEND_DIR / "legacy_static_html_backup" / file_path.name
    if legacy_path.exists():
        return FileResponse(str(legacy_path))
    return {
        "status": "online",
        "service": "SwipeX Backend API",
        "page": page_name,
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/")
def home():
    index_file = FRONTEND_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    public_index = FRONTEND_DIR / "public" / "index.html"
    if public_index.exists():
        return FileResponse(str(public_index))
    return {
        "status": "healthy",
        "message": "SwipeX Backend API is running successfully!",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/login")
def login_page():
    return _serve_file_or_json(FRONTEND_DIR / "login.html", "login")

@app.get("/register")
def register_page():
    return _serve_file_or_json(FRONTEND_DIR / "register.html", "register")

@app.get("/dashboard")
def dashboard_page():
    return _serve_file_or_json(FRONTEND_DIR / "dashboard.html", "dashboard")

@app.get("/upload")
def upload_page():
    return _serve_file_or_json(FRONTEND_DIR / "upload.html", "upload")

@app.get("/jobs-page")
def jobs_page():
    return _serve_file_or_json(FRONTEND_DIR / "jobs.html", "jobs")

@app.get("/companies")
def companies_page():
    return _serve_file_or_json(FRONTEND_DIR / "companies.html", "companies")

@app.get("/saved")
def saved_page():
    return _serve_file_or_json(FRONTEND_DIR / "saved.html", "saved")

@app.get("/profile")
def profile_page():
    return _serve_file_or_json(FRONTEND_DIR / "profile.html", "profile")

@app.get("/match")
def match_page():
    return _serve_file_or_json(FRONTEND_DIR / "match.html", "match")

@app.get("/recruiter")
def recruiter_page():
    return _serve_file_or_json(FRONTEND_DIR / "recruiter.html", "recruiter")

@app.get("/candidates")
def candidates_page():
    return _serve_file_or_json(FRONTEND_DIR / "candidates.html", "candidates")

@app.get("/applications")
def applications_page():
    return _serve_file_or_json(FRONTEND_DIR / "applications.html", "applications")

@app.get("/track")
def track_page():
    return _serve_file_or_json(FRONTEND_DIR / "track.html", "track")


# ======================================================
# DATABASE TEST
# ======================================================

@app.get("/db-test")
def db_test():

    try:

        connection = engine.connect()

        connection.close()

        return {
            "message":
                "Database Connected Successfully ✅"
        }

    except Exception as e:

        return {
            "error":
                str(e)
        }