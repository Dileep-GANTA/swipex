from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

import shutil
import os
import fitz
import re
import uuid

from .database import get_db
from . import models
from .auth import get_current_user_optional


router = APIRouter()


# =====================================================
# RESUME STORAGE
# =====================================================

# =====================================================
# RESUME STORAGE
# =====================================================

# Vercel has a read-only filesystem.
# /tmp is the writable directory available during execution.
UPLOAD_FOLDER = "/tmp/resumes"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

# =====================================================
# RESUME ANALYSIS
# =====================================================

def analyze_resume(resume_text: str):

    text = resume_text.lower()

    suggestions = []
    skills_found = []

    # -------------------------------------------------
    # COMMON SKILLS
    # -------------------------------------------------

    skills = [

        "python",
        "java",
        "c",
        "c++",
        "javascript",
        "html",
        "css",
        "react",
        "node.js",
        "fastapi",
        "sql",
        "postgresql",
        "mongodb",
        "git",
        "github",
        "aws",
        "machine learning",
        "data structures",
        "docker"

    ]


    for skill in skills:

        if skill in text:

            skills_found.append(
                skill
            )


    # -------------------------------------------------
    # IMPORTANT RESUME SECTIONS
    # -------------------------------------------------

    sections = {

        "education":
            "education",

        "experience":
            "experience",

        "projects":
            "project",

        "skills":
            "skill",

        "certifications":
            "certification"

    }


    sections_found = []


    for section, keyword in sections.items():

        if keyword in text:

            sections_found.append(
                section
            )


    # -------------------------------------------------
    # BASIC ATS SCORE
    # -------------------------------------------------

    score = 40


    score += min(
        len(skills_found) * 3,
        20
    )


    score += min(
        len(sections_found) * 5,
        25
    )


    # -------------------------------------------------
    # CONTACT INFORMATION
    # -------------------------------------------------

    if re.search(
        r"\b[\w.-]+@[\w.-]+\.\w+\b",
        text
    ):

        score += 5

    else:

        suggestions.append(
            "Add a professional email address."
        )


    # -------------------------------------------------
    # SUGGESTIONS
    # -------------------------------------------------

    if "project" not in text:

        suggestions.append(
            "Add 2–3 strong technical projects "
            "with measurable results."
        )


    if (
        "experience" not in text
        and
        "internship" not in text
    ):

        suggestions.append(
            "Add internship or practical "
            "experience when available."
        )


    if "github" not in text:

        suggestions.append(
            "Add your GitHub profile "
            "to showcase your projects."
        )


    if "linkedin" not in text:

        suggestions.append(
            "Add your LinkedIn profile."
        )


    if "certification" not in text:

        suggestions.append(
            "Add relevant technical certifications."
        )


    if len(skills_found) < 5:

        suggestions.append(
            "Add more relevant technical skills."
        )


    score = min(
        score,
        100
    )


    return {

        "ats_score":
            score,

        "skills_found":
            skills_found,

        "sections_found":
            sections_found,

        "suggestions":
            suggestions

    }


# =====================================================
# UPLOAD RESUME
# =====================================================

@router.post("/upload-resume")
async def upload_resume(

    file: UploadFile = File(...),

    db: Session = Depends(get_db),

    current_user: models.User =
        Depends(get_current_user_optional)

):

    # =================================================
    # VALIDATE FILE
    # =================================================

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No resume file selected."
        )


    if not file.filename.lower().endswith(".pdf"):

        raise HTTPException(
            status_code=400,
            detail="Only PDF resumes are supported."
        )


    # =================================================
    # CREATE SAFE UNIQUE FILE NAME
    # =================================================

    original_filename = file.filename


    safe_filename = (
        f"{uuid.uuid4().hex}_"
        f"{os.path.basename(original_filename)}"
    )


    file_path = os.path.join(
        UPLOAD_FOLDER,
        safe_filename
    )


    try:

        # =============================================
        # SAVE PDF
        # =============================================

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )


        # =============================================
        # READ PDF
        # =============================================

        doc = fitz.open(
            file_path
        )


        resume_text = ""


        for page in doc:

            resume_text += page.get_text()


        doc.close()


        # =============================================
        # ANALYZE RESUME
        # =============================================

        analysis = analyze_resume(
            resume_text
        )


        # =============================================
        # SAVE INFORMATION FOR LOGGED-IN USER
        # =============================================

        if current_user:

            current_user.resume_text = (
                resume_text
            )

            current_user.resume_filename = (
                original_filename
            )

            # Store URL-style path so frontend
            # can open the PDF directly.
            current_user.resume_path = (
                f"/resumes/{safe_filename}"
            )


            db.add(
                current_user
            )


            # =========================================
            # SAVE ATS SCORE HISTORY
            # =========================================

            db.add(
                models.ResumeScoreHistory(

                    user_id =
                        current_user.id,

                    ats_score =
                        analysis["ats_score"],

                    filename =
                        original_filename

                )
            )


            db.commit()

            db.refresh(
                current_user
            )


        # =============================================
        # RESPONSE
        # =============================================

        return {

            "message":
                "Resume Uploaded Successfully ✅",

            "filename":
                original_filename,

            "stored_filename":
                safe_filename,

            "resume_path":
                (
                    f"/resumes/{safe_filename}"
                ),

            "resume_text":
                resume_text,

            "ats_score":
                analysis["ats_score"],

            "skills_found":
                analysis["skills_found"],

            "sections_found":
                analysis["sections_found"],

            "suggestions":
                analysis["suggestions"]

        }


    except Exception as e:

        # =============================================
        # REMOVE FILE IF PROCESSING FAILED
        # =============================================

        if os.path.exists(file_path):

            try:

                os.remove(
                    file_path
                )

            except Exception:

                pass


        raise HTTPException(

            status_code=500,

            detail=
                f"Resume processing failed: {str(e)}"

        )