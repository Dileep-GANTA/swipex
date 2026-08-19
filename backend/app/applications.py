from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import get_db
from . import models, schemas
from .auth import get_current_user
from .notifications import create_notification


# ======================================================
# ROUTER
# ======================================================

router = APIRouter(
    tags=["Applications & Saved Jobs"]
)


# ======================================================
# VALID STATUSES
# ======================================================

VALID_STATUSES = [
    "applied",
    "shortlisted",
    "rejected",
    "selected"
]


# ======================================================
# JOB FIELDS HELPER
# ======================================================

def _job_fields(job: models.Job) -> dict:
    return {
        "job_title": job.title,
        "company": job.company,
        "location": job.location,
        "salary": job.salary,
        "skills": job.skills
    }


# ======================================================
# APPLY FOR A JOB
# ======================================================

@router.post(
    "/applications",
    response_model=schemas.ApplicationResponse
)
def apply_to_job(
    data: schemas.ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    job = db.query(models.Job).filter(
        models.Job.id == data.job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    existing = db.query(models.Application).filter(
        models.Application.user_id == current_user.id,
        models.Application.job_id == data.job_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="You have already applied for this job."
        )

    application = models.Application(
        user_id=current_user.id,
        job_id=data.job_id,
        status="applied",
        match_percentage=data.match_percentage or 0
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    # Notify recruiter
    if job.posted_by:
        create_notification(
            db,
            user_id=job.posted_by,
            type="status_update",
            title="New application received",
            message=f"{current_user.name} applied for {job.title}.",
            job_id=job.id
        )

    response = schemas.ApplicationResponse.model_validate(
        application
    )

    for key, value in _job_fields(job).items():
        setattr(response, key, value)

    return response


# ======================================================
# JOB SEEKER: MY APPLICATIONS
# ======================================================

@router.get(
    "/applications/me",
    response_model=list[schemas.ApplicationResponse]
)
def my_applications(
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    query = db.query(models.Application).filter(
        models.Application.user_id == current_user.id
    )

    if status:
        query = query.filter(
            models.Application.status == status.strip().lower()
        )

    applications = query.order_by(
        models.Application.applied_at.desc()
    ).all()

    results = []

    for application in applications:

        job = db.query(models.Job).filter(
            models.Job.id == application.job_id
        ).first()

        item = schemas.ApplicationResponse.model_validate(
            application
        )

        if job:
            for key, value in _job_fields(job).items():
                setattr(item, key, value)

        results.append(item)

    return results


# ======================================================
# RECRUITER: APPLICANTS FOR ONE JOB
# ======================================================

@router.get(
    "/applications/job/{job_id}",
    response_model=list[schemas.ApplicationResponse]
)
def applicants_for_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    job = db.query(models.Job).filter(
        models.Job.id == job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    # Security check
    if (
        job.posted_by is not None
        and job.posted_by != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to view these applicants."
        )

    applications = db.query(models.Application).filter(
        models.Application.job_id == job_id
    ).order_by(
        models.Application.applied_at.desc()
    ).all()

    results = []

    for application in applications:

        candidate = db.query(models.User).filter(
            models.User.id == application.user_id
        ).first()

        item = schemas.ApplicationResponse.model_validate(
            application
        )

        if candidate:
            item.candidate_name = candidate.name
            item.candidate_email = candidate.email

        for key, value in _job_fields(job).items():
            setattr(item, key, value)

        results.append(item)

    return results


# ======================================================
# RECRUITER: ALL APPLICATIONS
# ======================================================

@router.get(
    "/applications/recruiter",
    response_model=list[schemas.ApplicationResponse]
)
def recruiter_applications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    job_ids = [
        job_id
        for job_id, in db.query(
            models.Job.id
        ).filter(
            models.Job.posted_by == current_user.id
        ).all()
    ]

    query = db.query(models.Application)

    # Keep backward compatibility with existing jobs
    # whose posted_by may still be NULL.
    if job_ids:
        query = query.filter(
            models.Application.job_id.in_(job_ids)
        )

    applications = query.order_by(
        models.Application.applied_at.desc()
    ).all()

    results = []

    for application in applications:

        job = db.query(models.Job).filter(
            models.Job.id == application.job_id
        ).first()

        candidate = db.query(models.User).filter(
            models.User.id == application.user_id
        ).first()

        item = schemas.ApplicationResponse.model_validate(
            application
        )

        if job:
            for key, value in _job_fields(job).items():
                setattr(item, key, value)

        if candidate:
            item.candidate_name = candidate.name
            item.candidate_email = candidate.email

        results.append(item)

    return results


# ======================================================
# RECRUITER: UPDATE APPLICATION STATUS
# ======================================================

@router.put(
    "/applications/{application_id}/status"
)
def update_application_status(
    application_id: int,
    data: schemas.ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    status = data.status.strip().lower()

    if status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Status must be one of {VALID_STATUSES}"
        )

    application = db.query(models.Application).filter(
        models.Application.id == application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    job = db.query(models.Job).filter(
        models.Job.id == application.job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    # Security check
    if (
        job.posted_by is not None
        and job.posted_by != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to update this application."
        )

    application.status = status

    db.commit()
    db.refresh(application)

    # Notify candidate
    create_notification(
        db,
        user_id=application.user_id,
        type="status_update",
        title="Application status updated",
        message=(
            f"Your application for {job.title} "
            f"is now '{status}'."
        ),
        job_id=application.job_id
    )

    return {
        "message": f"Application status updated to '{status}'"
    }


# ======================================================
# RECRUITER: VIEW CANDIDATE PROFILE
# ======================================================

@router.get(
    "/applications/{application_id}/candidate",
    response_model=schemas.CandidateProfileResponse
)
def candidate_profile(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    # --------------------------------------------------
    # FIND APPLICATION
    # --------------------------------------------------

    application = db.query(models.Application).filter(
        models.Application.id == application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    # --------------------------------------------------
    # FIND JOB
    # --------------------------------------------------

    job = db.query(models.Job).filter(
        models.Job.id == application.job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    # --------------------------------------------------
    # SECURITY
    # --------------------------------------------------

    if (
        job.posted_by is not None
        and job.posted_by != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to view this candidate."
        )

    # --------------------------------------------------
    # FIND CANDIDATE
    # --------------------------------------------------

    candidate = db.query(models.User).filter(
        models.User.id == application.user_id
    ).first()

    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )

    # --------------------------------------------------
    # RETURN PROFILE
    # --------------------------------------------------

    return {
        "id": candidate.id,
        "name": candidate.name,
        "email": candidate.email,
        "role": candidate.role,
        "resume_text": candidate.resume_text,

        "application_id": application.id,
        "job_id": application.job_id,
        "status": application.status,
        "match_percentage": application.match_percentage or 0,
        "applied_at": application.applied_at,

        "job_title": job.title,
        "company": job.company,
        "location": job.location,
        "salary": job.salary,
        "experience": job.experience,
        "job_type": job.job_type,
        "category": job.category,
        "skills": job.skills
    }


# ======================================================
# SAVED JOBS: SAVE
# ======================================================

@router.post(
    "/saved-jobs",
    response_model=schemas.SavedJobResponse
)
def save_job(
    data: schemas.SavedJobCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    job = db.query(models.Job).filter(
        models.Job.id == data.job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    existing = db.query(models.SavedJob).filter(
        models.SavedJob.user_id == current_user.id,
        models.SavedJob.job_id == data.job_id
    ).first()

    if existing:
        return existing

    saved = models.SavedJob(
        user_id=current_user.id,
        job_id=data.job_id
    )

    db.add(saved)
    db.commit()
    db.refresh(saved)

    return saved


# ======================================================
# SAVED JOBS: MY SAVED JOBS
# ======================================================

@router.get(
    "/saved-jobs/me",
    response_model=list[schemas.JobResponse]
)
def my_saved_jobs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    saved_job_ids = [
        saved.job_id
        for saved in db.query(models.SavedJob).filter(
            models.SavedJob.user_id == current_user.id
        ).all()
    ]

    if not saved_job_ids:
        return []

    return db.query(models.Job).filter(
        models.Job.id.in_(saved_job_ids)
    ).all()


# ======================================================
# SAVED JOBS: REMOVE
# ======================================================

@router.delete(
    "/saved-jobs/{job_id}"
)
def unsave_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    deleted = db.query(models.SavedJob).filter(
        models.SavedJob.user_id == current_user.id,
        models.SavedJob.job_id == job_id
    ).delete(
        synchronize_session=False
    )

    db.commit()

    if deleted == 0:
        return {
            "message": "Job was not in your saved list"
        }

    return {
        "message": "Job removed from saved list"
    }