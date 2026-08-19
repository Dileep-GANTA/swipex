from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import get_db
from . import models, schemas
from .auth import get_current_user
from .notifications import notify_job_seekers_of_new_job

router = APIRouter()


# =====================================================
# CREATE JOB
# =====================================================

@router.post("/jobs")
def create_job(
    job: schemas.JobCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    # -------------------------------------------------
    # ONLY RECRUITERS CAN POST JOBS
    # -------------------------------------------------

    if str(current_user.role).lower() != "recruiter":
        raise HTTPException(
            status_code=403,
            detail="Only recruiters can post jobs."
        )


    # -------------------------------------------------
    # CREATE JOB WITH RECRUITER ID
    # -------------------------------------------------

    new_job = models.Job(
        title=job.title,
        company=job.company,
        location=job.location,
        salary=job.salary,
        experience=job.experience,
        job_type=job.job_type,
        category=job.category,
        skills=job.skills,
        description=job.description,
        logo=job.logo,

        # IMPORTANT:
        # Store the recruiter who posted this job
        posted_by=current_user.id
    )


    db.add(new_job)

    db.commit()

    db.refresh(new_job)


    print(
        "✅ JOB CREATED:",
        new_job.id,
        new_job.title
    )

    print(
        "👤 JOB POSTED BY USER ID:",
        current_user.id
    )

    print(
        "📧 RECRUITER EMAIL:",
        current_user.email
    )

    print(
        "🔔 CALLING NOTIFICATION FUNCTION..."
    )


    # -------------------------------------------------
    # NOTIFY JOB SEEKERS
    # -------------------------------------------------

    notify_job_seekers_of_new_job(
        db,
        new_job
    )


    print(
        "✅ NOTIFICATION FUNCTION FINISHED"
    )


    return {
        "message": "Job Added Successfully ✅",
        "job": new_job
    }


# =====================================================
# APPLICANT COUNT / COMPETITION LEVEL
# =====================================================

@router.get("/jobs/{job_id}/competition")
def job_competition(
    job_id: int,
    db: Session = Depends(get_db)
):

    job = db.query(
        models.Job
    ).filter(
        models.Job.id == job_id
    ).first()


    if not job:

        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )


    applicant_count = db.query(
        models.Application
    ).filter(
        models.Application.job_id == job_id
    ).count()


    if applicant_count < 5:

        level = "Low"

    elif applicant_count < 20:

        level = "Medium"

    else:

        level = "High"


    return {

        "job_id":
            job_id,

        "applicant_count":
            applicant_count,

        "competition_level":
            level,

        "posted_at":
            job.created_at

    }


# =====================================================
# GET ALL JOBS
# =====================================================

@router.get(
    "/jobs",
    response_model=list[schemas.JobResponse]
)
def get_jobs(
    db: Session = Depends(get_db)
):

    jobs = db.query(
        models.Job
    ).all()


    return jobs


# =====================================================
# GET JOB BY ID
# =====================================================

@router.get(
    "/jobs/{job_id}",
    response_model=schemas.JobResponse
)
def get_job(
    job_id: int,
    db: Session = Depends(get_db)
):

    job = db.query(
        models.Job
    ).filter(
        models.Job.id == job_id
    ).first()


    if not job:

        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )


    return job


# =====================================================
# UPDATE JOB
# =====================================================

@router.put("/jobs/{job_id}")
def update_job(
    job_id: int,
    job: schemas.JobCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    # -------------------------------------------------
    # ONLY RECRUITERS CAN UPDATE JOBS
    # -------------------------------------------------

    if str(current_user.role).lower() != "recruiter":

        raise HTTPException(
            status_code=403,
            detail="Only recruiters can update jobs."
        )


    existing_job = db.query(
        models.Job
    ).filter(
        models.Job.id == job_id
    ).first()


    if not existing_job:

        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )


    # -------------------------------------------------
    # ONLY JOB OWNER CAN UPDATE
    # -------------------------------------------------

    if existing_job.posted_by != current_user.id:

        raise HTTPException(
            status_code=403,
            detail="You can only update jobs posted by you."
        )


    existing_job.title = job.title
    existing_job.company = job.company
    existing_job.location = job.location
    existing_job.salary = job.salary
    existing_job.experience = job.experience
    existing_job.job_type = job.job_type
    existing_job.category = job.category
    existing_job.skills = job.skills
    existing_job.description = job.description
    existing_job.logo = job.logo


    db.commit()

    db.refresh(
        existing_job
    )


    print(
        "✏️ JOB UPDATED:",
        existing_job.id
    )


    return {

        "message":
            "Job Updated Successfully ✅",

        "job":
            existing_job

    }


# =====================================================
# DELETE JOB
# =====================================================

@router.delete("/jobs/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    # -------------------------------------------------
    # ONLY RECRUITERS CAN DELETE
    # -------------------------------------------------

    if str(current_user.role).lower() != "recruiter":

        raise HTTPException(
            status_code=403,
            detail="Only recruiters can delete jobs."
        )


    job = db.query(
        models.Job
    ).filter(
        models.Job.id == job_id
    ).first()


    if not job:

        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )


    # -------------------------------------------------
    # ONLY JOB OWNER CAN DELETE
    # -------------------------------------------------

    if job.posted_by != current_user.id:

        raise HTTPException(
            status_code=403,
            detail="You can only delete jobs posted by you."
        )


    db.delete(
        job
    )

    db.commit()


    print(
        "🗑️ JOB DELETED:",
        job_id
    )


    return {

        "message":
            "Job Deleted Successfully ✅"

    }