from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import get_db
from . import models

router = APIRouter()


@router.post("/match-job")
def match_job(
    data: dict,
    db: Session = Depends(get_db)
):

    # ==========================
    # GET RESUME
    # ==========================

    resume_text = data.get("resume_text", "").lower().strip()

    if not resume_text:

        raise HTTPException(
            status_code=400,
            detail="Resume text is required."
        )


    # ==========================
    # SPECIFIC JOB SKILLS MODE
    # ==========================

    requested_skills = data.get(
        "job_skills",
        ""
    )

    if requested_skills:

        job_skills = [
            skill.strip().lower()
            for skill in requested_skills.split(",")
            if skill.strip()
        ]

        matched_skills = []
        missing_skills = []

        for skill in job_skills:

            if skill in resume_text:

                matched_skills.append(skill)

            else:

                missing_skills.append(skill)


        percentage = 0

        if job_skills:

            percentage = int(
                (len(matched_skills) /
                 len(job_skills)) * 100
            )


        return {

            "Match Percentage": percentage,

            "Matched Skills": matched_skills,

            "Missing Skills": missing_skills,

            "Job Skills": job_skills

        }


    # ==========================
    # AUTOMATIC JOB MATCHING
    # ==========================

    jobs = db.query(models.Job).all()

    recommendations = []


    for job in jobs:

        job_skills = [
            skill.strip().lower()
            for skill in job.skills.split(",")
            if skill.strip()
        ]


        matched_skills = []
        missing_skills = []


        # ==========================
        # CHECK EACH SKILL
        # ==========================

        for skill in job_skills:

            if skill in resume_text:

                matched_skills.append(skill)

            else:

                missing_skills.append(skill)


        # ==========================
        # CALCULATE MATCH %
        # ==========================

        percentage = 0

        if job_skills:

            percentage = int(
                (len(matched_skills) /
                 len(job_skills)) * 100
            )


        # ==========================
        # CREATE RECOMMENDATION
        # ==========================

        recommendations.append({

            "id": job.id,

            "company": job.company,

            "title": job.title,

            "location": job.location,

            "salary": job.salary,

            "job_type": job.job_type,

            "experience": job.experience,

            "skills": job.skills,

            "description": job.description,

            "logo": job.logo,

            "match_percentage": percentage,

            "matched_skills": matched_skills,

            "missing_skills": missing_skills

        })


    # ==========================
    # SORT BY BEST MATCH
    # ==========================

    recommendations.sort(
        key=lambda x: x["match_percentage"],
        reverse=True
    )


    # ==========================
    # RETURN RESULTS
    # ==========================

    return {

        "recommendations": recommendations,

        "total_jobs": len(recommendations)

    }