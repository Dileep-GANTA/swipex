from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import get_db
from . import models
from .auth import get_current_user


router = APIRouter(
    prefix="/saved-jobs",
    tags=["Saved Jobs"]
)


# =====================================================
# SAVE A JOB
# =====================================================

@router.post("/{job_id}")
def save_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    # Check whether job exists
    job = db.query(models.Job).filter(
        models.Job.id == job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    # Check if already saved
    existing = db.query(models.SavedJob).filter(
        models.SavedJob.user_id == current_user.id,
        models.SavedJob.job_id == job_id
    ).first()

    if existing:
        return {
            "message": "Job already saved ❤️",
            "saved": True,
            "job_id": job_id
        }

    # Create saved-job record
    saved_job = models.SavedJob(
        user_id=current_user.id,
        job_id=job_id
    )

    db.add(saved_job)
    db.commit()
    db.refresh(saved_job)

    print(
        "❤️ JOB SAVED:",
        "User:", current_user.email,
        "| Job:", job_id
    )

    return {
        "message": "Job saved successfully ❤️",
        "saved": True,
        "job_id": job_id
    }


# =====================================================
# GET MY SAVED JOBS
# =====================================================

@router.get("")
def get_saved_jobs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    saved_jobs = db.query(models.SavedJob).filter(
        models.SavedJob.user_id == current_user.id
    ).all()

    result = []

    for saved in saved_jobs:

        job = db.query(models.Job).filter(
            models.Job.id == saved.job_id
        ).first()

        if not job:
            continue

        result.append({
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "salary": job.salary,
            "experience": job.experience,
            "job_type": job.job_type,
            "category": job.category,
            "skills": job.skills,
            "description": job.description,
            "logo": job.logo,
            "saved_id": saved.id,
            "saved_at": saved.saved_at
        })

    return result


# =====================================================
# REMOVE SAVED JOB
# =====================================================

@router.delete("/{job_id}")
def remove_saved_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    saved_job = db.query(models.SavedJob).filter(
        models.SavedJob.user_id == current_user.id,
        models.SavedJob.job_id == job_id
    ).first()

    if not saved_job:

        raise HTTPException(
            status_code=404,
            detail="Saved job not found"
        )

    db.delete(saved_job)
    db.commit()

    print(
        "🗑️ SAVED JOB REMOVED:",
        "User:", current_user.email,
        "| Job:", job_id
    )

    return {
        "message": "Saved job removed successfully",
        "saved": False,
        "job_id": job_id
    }


# =====================================================
# CHECK WHETHER A JOB IS SAVED
# =====================================================

@router.get("/check/{job_id}")
def check_saved_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    saved_job = db.query(models.SavedJob).filter(
        models.SavedJob.user_id == current_user.id,
        models.SavedJob.job_id == job_id
    ).first()

    return {
        "job_id": job_id,
        "saved": saved_job is not None
    }