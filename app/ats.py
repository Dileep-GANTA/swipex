from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from .database import get_db
from . import models
from .auth import get_current_user_optional

router = APIRouter()


# ==========================================
# Skills Used for ATS Analysis
# ==========================================

skills_list = [
    "Python",
    "Java",
    "C",
    "C++",
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Node.js",
    "SQL",
    "PostgreSQL",
    "MongoDB",
    "Git",
    "GitHub",
    "FastAPI",
    "REST API",
    "Machine Learning",
    "Data Structures",
    "Algorithms",
    "Docker",
    "AWS",
    "Linux"
]


# ==========================================
# ATS SCORE
# ==========================================

@router.post("/ats-score")
def ats_score(
    resume: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_optional)
):

    resume_text = resume.get("resume_text", "")

    if not resume_text:

        raise HTTPException(
            status_code=400,
            detail="Resume text is required."
        )

    text = resume_text.lower()

    skills_found = []
    missing_skills = []

    # --------------------------------------
    # Check Skills
    # --------------------------------------

    for skill in skills_list:

        if skill.lower() in text:

            skills_found.append(skill)

        else:

            missing_skills.append(skill)

    # --------------------------------------
    # Skill Score
    # --------------------------------------

    skill_score = int(
        (len(skills_found) / len(skills_list)) * 60
    )

    # --------------------------------------
    # Resume Sections
    # --------------------------------------

    sections = {

        "Education": "education",

        "Experience": "experience",

        "Projects": "project",

        "Skills": "skills",

        "Certifications": "certification"

    }

    sections_found = []

    for section, keyword in sections.items():

        if keyword in text:

            sections_found.append(section)

    section_score = int(
        (len(sections_found) / len(sections)) * 25
    )

    # --------------------------------------
    # Contact Information
    # --------------------------------------

    contact_score = 0

    if "@" in text:

        contact_score += 5

    if any(
        char.isdigit()
        for char in text
    ):

        contact_score += 5

    # --------------------------------------
    # Final ATS Score
    # --------------------------------------

    ats = (
        skill_score
        + section_score
        + contact_score
    )

    ats = min(ats, 100)

    # --------------------------------------
    # Recommendations
    # --------------------------------------

    recommendations = []

    if len(skills_found) < 5:

        recommendations.append(
            "Add more relevant technical skills."
        )

    if "project" not in text:

        recommendations.append(
            "Add strong technical projects."
        )

    if "experience" not in text:

        recommendations.append(
            "Add internship or practical experience."
        )

    if "github" not in text:

        recommendations.append(
            "Add your GitHub profile."
        )

    if "certification" not in text:

        recommendations.append(
            "Add relevant certifications."
        )

    if ats >= 80:

        recommendations.append(
            "Your resume has strong ATS compatibility."
        )

    elif ats >= 60:

        recommendations.append(
            "Your resume is moderately ATS compatible. "
            "Add more relevant keywords and achievements."
        )

    else:

        recommendations.append(
            "Your resume needs improvement for ATS systems."
        )

    # --------------------------------------
    # Milestone 4: log this score for the resume performance
    # ranking / trend chart when the visitor is logged in.
    # --------------------------------------

    if current_user:

        db.add(models.ResumeScoreHistory(
            user_id=current_user.id,
            ats_score=ats
        ))

        db.commit()

    # --------------------------------------
    # Response
    # --------------------------------------

    return {

        "ATS Score": ats,

        "Skills Found": skills_found,

        "Missing Skills": missing_skills,

        "Sections Found": sections_found,

        "Recommendations": recommendations

    }