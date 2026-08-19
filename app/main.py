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
# FRONTEND ROUTES
# ======================================================

@app.get("/")
def home():

    return FileResponse(
        str(FRONTEND_DIR / "index.html")
    )


@app.get("/login")
def login_page():

    return FileResponse(
        str(FRONTEND_DIR / "login.html")
    )


@app.get("/register")
def register_page():

    return FileResponse(
        str(FRONTEND_DIR / "register.html")
    )


@app.get("/dashboard")
def dashboard_page():

    return FileResponse(
        str(FRONTEND_DIR / "dashboard.html")
    )


@app.get("/upload")
def upload_page():

    return FileResponse(
        str(FRONTEND_DIR / "upload.html")
    )


@app.get("/jobs-page")
def jobs_page():

    return FileResponse(
        str(FRONTEND_DIR / "jobs.html")
    )


@app.get("/companies")
def companies_page():

    return FileResponse(
        str(FRONTEND_DIR / "companies.html")
    )


@app.get("/saved")
def saved_page():

    return FileResponse(
        str(FRONTEND_DIR / "saved.html")
    )


@app.get("/profile")
def profile_page():

    return FileResponse(
        str(FRONTEND_DIR / "profile.html")
    )


@app.get("/match")
def match_page():

    return FileResponse(
        str(FRONTEND_DIR / "match.html")
    )


@app.get("/recruiter")
def recruiter_page():

    return FileResponse(
        str(FRONTEND_DIR / "recruiter.html")
    )


@app.get("/candidates")
def candidates_page():

    return FileResponse(
        str(FRONTEND_DIR / "candidates.html")
    )


@app.get("/applications")
def applications_page():

    return FileResponse(
        str(FRONTEND_DIR / "applications.html")
    )


@app.get("/track")
def track_page():

    return FileResponse(
        str(FRONTEND_DIR / "track.html")
    )


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