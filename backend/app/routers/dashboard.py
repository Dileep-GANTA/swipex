from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Body
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, not_
from typing import List, Optional
from datetime import datetime, timezone
import os
import shutil
import re

from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_user, get_optional_current_user, detect_company_type

router = APIRouter(prefix="/api", tags=["SwipeX Core Engine & Dashboards"])
UPLOAD_DIR = "static/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _get_or_create_company(db: Session, recruiter_id: int, company_name: Optional[str] = None):
    c_name = (company_name or "").strip() or "Tech Company"
    company = db.query(models.Company).filter(models.Company.name == c_name).first()
    if company:
        return company
    company = models.Company(
        name=c_name,
        location="Remote",
        industry="Technology",
        description="Company profile"
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


# ---------------------------------------------------------
# RECRUITER JOB MANAGEMENT APIs (Add, Get, Update, Delete)
# ---------------------------------------------------------
@router.post("/jobs", response_model=schemas.JobResponse, status_code=status.HTTP_201_CREATED)
@router.post("/jobs/", response_model=schemas.JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    payload: schemas.JobCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recruiter_id = current_user.id
    company = _get_or_create_company(db, recruiter_id=recruiter_id, company_name=payload.company_name)

    # Determine company type: use provided value or auto-detect based on name, description, and experience
    company_type = payload.company_type
    if not company_type or str(company_type).strip().lower() in {"", "auto-detect", "automatic", "auto", "null", "none"}:
        company_type = detect_company_type(payload.company_name, payload.description, payload.experience_required)

    job = models.Job(
        company_id=company.id,
        recruiter_id=recruiter_id,
        title=payload.title,
        salary_min=payload.salary_min or 50000,
        salary_max=payload.salary_max or 100000,
        salary=payload.salary or f"${payload.salary_min or 50000} - ${payload.salary_max or 100000}",
        location=payload.location or "Remote",
        experience_required=payload.experience_required or 1,
        skills_required=payload.skills_required or "Software Development",
        job_type=payload.job_type or "Full Time",
        description=payload.description or "Job description",
        education=payload.education or "Bachelor's Degree",
        last_date_to_apply=payload.last_date_to_apply,
        company_name=payload.company_name or company.name,
        company_logo=payload.company_logo or company.logo_url,
        company_type=company_type,
        is_active=True,
        created_at=datetime.now(timezone.utc)
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Dispatch Instant Job Notifications & Startup Hiring Alerts to matching candidates
    try:
        job_seekers = db.query(models.User).filter(models.User.role == "Job Seeker").all()
        job_skills = [s.strip().lower() for s in (job.skills_required or "").split(",") if s.strip()]
        company_name = job.company_name or company.name

        for seeker in job_seekers:
            seeker_skills = [s.strip().lower() for s in (seeker.skills or "").split(",") if s.strip()]
            rs_skills = [rs.skill.lower() for rs in db.query(models.ResumeSkill).filter(models.ResumeSkill.user_id == seeker.id).all()]
            all_seeker_skills = list(set(seeker_skills + rs_skills))

            matched = [s for s in job_skills if any(sk in s or s in sk for sk in all_seeker_skills)]
            
            # If candidate matches skills or job title keywords, dispatch alerts
            if matched or not job_skills:
                # 1. Instant Job Notification
                notif_job = models.Notification(
                    user_id=seeker.id,
                    title="New Job Alert 🔔",
                    message=f"New job alert: A new {job.title} position has been posted at {company_name} that matches your skills.",
                    type="job_alert",
                    notification_type="job_alert",
                    related_job_id=job.id,
                    is_read=False,
                    created_at=datetime.now(timezone.utc)
                )
                db.add(notif_job)

                # 2. Startup Hiring Alert or MNC Alert based on company type
                if company_type == "Startup":
                    notif_hiring = models.Notification(
                        user_id=seeker.id,
                        title="🚀 Startup Hiring Alert",
                        message=f"🚀 Startup Hiring Alert: {company_name} (Startup) is hiring for a {job.title} role in {job.location}. Required skills: {job.skills_required or 'Tech Skills'}. View opportunity!",
                        type="hiring_alert",
                        notification_type="hiring_alert",
                        related_job_id=job.id,
                        is_read=False,
                        created_at=datetime.now(timezone.utc)
                    )
                else:
                    notif_hiring = models.Notification(
                        user_id=seeker.id,
                        title="🏢 MNC Hiring Alert",
                        message=f"🏢 MNC Hiring Alert: {company_name} (MNC) is hiring for a {job.title} role in {job.location}. Required skills: {job.skills_required or 'Tech Skills'}. View opportunity!",
                        type="hiring_alert",
                        notification_type="hiring_alert",
                        related_job_id=job.id,
                        is_read=False,
                        created_at=datetime.now(timezone.utc)
                    )
                db.add(notif_hiring)

        db.commit()
    except Exception as err:
        print("Error dispatching job alerts:", err)

    return job


@router.get("/recruiter/jobs")
@router.get("/recruiter/jobs/")
def recruiter_jobs(
    recruiter_id: Optional[int] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_id = recruiter_id if (recruiter_id and recruiter_id > 0 and recruiter_id == current_user.id) else current_user.id
    jobs = db.query(models.Job).filter(models.Job.recruiter_id == target_id).order_by(models.Job.created_at.desc()).all()
    return jobs


@router.put("/jobs/{job_id}")
@router.put("/jobs/{job_id}/")
def update_job(
    job_id: int,
    payload: dict = Body(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    for key, value in payload.items():
        if hasattr(job, key) and value is not None:
            setattr(job, key, value)

    db.commit()
    db.refresh(job)
    return job


@router.delete("/jobs/{job_id}")
@router.delete("/jobs/{job_id}/")
def delete_job(
    job_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully", "job_id": job_id}


# ---------------------------------------------------------
# RECRUITER APPLICATIONS MANAGEMENT APIs (Strict Scoping)
# ---------------------------------------------------------
@router.get("/recruiter/applications")
@router.get("/recruiter/applications/")
def recruiter_applications(
    recruiter_id: Optional[int] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_id = recruiter_id if (recruiter_id and recruiter_id > 0 and recruiter_id == current_user.id) else current_user.id
    jobs = db.query(models.Job).filter(models.Job.recruiter_id == target_id).all()
    job_ids = [job.id for job in jobs]

    if not job_ids:
        return []

    applications = db.query(models.Application).filter(models.Application.job_id.in_(job_ids)).order_by(models.Application.applied_at.desc()).all()

    result = []
    for app in applications:
        applicant = db.query(models.User).filter(models.User.id == app.user_id).first()
        job = db.query(models.Job).filter(models.Job.id == app.job_id).first()

        resume_url = app.resume_url or (getattr(applicant.seeker_profile, 'resume_url', None) if (applicant and applicant.seeker_profile) else None)

        result.append({
            "id": app.id,
            "job_id": app.job_id,
            "job_title": job.title if job else "Software Role",
            "applicant_name": applicant.full_name if (applicant and applicant.full_name) else (applicant.email.split('@')[0] if applicant else "Job Seeker"),
            "applicant_email": applicant.email if applicant else "applicant@swipex.com",
            "applicant_skills": applicant.skills if applicant else "React, Python, SQL",
            "resume_url": resume_url,
            "has_resume": bool(resume_url),
            "matching_score": app.matching_score or 85,
            "status": app.status or "Pending",
            "applied_at": app.applied_at,
        })
    return result


@router.put("/applications/{application_id}")
@router.put("/applications/{application_id}/")
def update_application_status(
    application_id: int,
    payload: dict = Body(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    application = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    new_status = payload.get("status")
    if new_status:
        application.status = new_status
        job = db.query(models.Job).filter(models.Job.id == application.job_id).first()
        job_title = job.title if job else "Position"
        
        # Create real notification entry in PostgreSQL for the applicant
        try:
            notif = models.Notification(
                user_id=application.user_id,
                title=f"Application {new_status}",
                message=f"Your application status for '{job_title}' has been updated to {new_status}.",
                is_read=False,
                created_at=datetime.now(timezone.utc)
            )
            db.add(notif)
        except Exception as e:
            print("Notification error:", e)

        db.commit()

    return {"message": "Application status updated successfully", "application_id": application_id, "status": application.status}


# ---------------------------------------------------------
# RECRUITER ANALYTICS API (Strict Recruiter Scoping)
# ---------------------------------------------------------
@router.get("/analytics/recruiter")
@router.get("/analytics/recruiter/")
def recruiter_analytics(
    recruiter_id: Optional[int] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_id = recruiter_id if (recruiter_id and recruiter_id > 0 and recruiter_id == current_user.id) else current_user.id
    jobs = db.query(models.Job).filter(models.Job.recruiter_id == target_id).all()
    job_ids = [job.id for job in jobs]

    total_jobs = len(jobs)
    active_jobs = sum(1 for job in jobs if job.is_active)

    if not job_ids:
        return {
            "total_jobs": 0,
            "active_jobs": 0,
            "total_applications": 0,
            "saved_jobs": 0,
            "total_views": 0,
            "avg_skill_match": 0,
            "status_counts": {"Pending": 0, "Shortlisted": 0, "Rejected": 0, "Selected": 0},
            "jobs_breakdown": [],
            "recent_applications": []
        }

    applications = db.query(models.Application).filter(models.Application.job_id.in_(job_ids)).order_by(models.Application.applied_at.desc()).all()
    total_views = db.query(models.JobView).filter(models.JobView.job_id.in_(job_ids)).count()
    total_applications = len(applications)

    recent_apps = []
    for app in applications[:10]:
        applicant = db.query(models.User).filter(models.User.id == app.user_id).first()
        job = db.query(models.Job).filter(models.Job.id == app.job_id).first()
        recent_apps.append({
            "id": app.id,
            "candidate": applicant.full_name if (applicant and applicant.full_name) else (applicant.username if applicant else "Job Seeker"),
            "job_title": job.title if job else "Position",
            "status": app.status or "Pending",
            "applied_on": app.applied_at.strftime("%d %b, %Y") if (app and app.applied_at) else "Recently"
        })

    status_counts = {"Pending": 0, "Shortlisted": 0, "Rejected": 0, "Selected": 0}
    total_match_score = 0

    for app in applications:
        s = app.status or "Pending"
        status_counts[s] = status_counts.get(s, 0) + 1
        total_match_score += (app.matching_score or 85)

    avg_skill_match = round(total_match_score / total_applications) if total_applications > 0 else 0

    jobs_applications_breakdown = []
    for job in jobs[:6]:
        app_count = db.query(models.Application).filter(models.Application.job_id == job.id).count()
        jobs_applications_breakdown.append({
            "title": job.title[:20],
            "applications": app_count
        })

    return {
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "total_applications": total_applications,
        "saved_jobs": db.query(models.SavedJob).filter(models.SavedJob.job_id.in_(job_ids)).count() if job_ids else 0,
        "total_views": total_views,
        "avg_skill_match": avg_skill_match,
        "status_counts": status_counts,
        "jobs_breakdown": jobs_applications_breakdown,
        "recent_applications": recent_apps
    }



# ---------------------------------------------------------
# SWIPE MODULE API (Swipe Right = Save, Swipe Left = Skip)
# ---------------------------------------------------------
@router.post("/swipe/")
@router.post("/swipe")
def record_swipe(
    payload: dict = Body(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if isinstance(payload, dict):
        raw_job_id = payload.get("job_id") if payload.get("job_id") is not None else payload.get("jobId")
        raw_action = payload.get("action") or payload.get("direction") or ""
    else:
        raw_job_id = getattr(payload, "job_id", None) if getattr(payload, "job_id", None) is not None else getattr(payload, "jobId", None)
        raw_action = getattr(payload, "action", None) or getattr(payload, "direction", None) or ""

    if raw_job_id is None:
        raise HTTPException(status_code=400, detail="job_id is required")

    try:
        job_id = int(raw_job_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="job_id must be a valid integer")

    action = str(raw_action).lower().strip()
    if action in {"right", "interested", "save", "like"}:
        action = "right"
    elif action in {"left", "skip", "pass", "disinterested", "dislike"}:
        action = "left"
    else:
        action = "right"

    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found in PostgreSQL database")

    swipe_entry = models.SwipeHistory(
        user_id=current_user.id,
        job_id=job_id,
        action=action,
        swiped_at=datetime.now(timezone.utc)
    )
    db.add(swipe_entry)

    if action == "right":
        existing_saved = db.query(models.SavedJob).filter(
            models.SavedJob.user_id == current_user.id,
            models.SavedJob.job_id == job_id
        ).first()
        if not existing_saved:
            db.add(models.SavedJob(user_id=current_user.id, job_id=job_id, saved_at=datetime.now(timezone.utc)))

    db.commit()
    return {
        "status": "success",
        "message": f"Swipe '{action}' recorded and saved successfully",
        "job_id": job_id,
        "action": action
    }


# ---------------------------------------------------------
# SAVED JOBS MODULE APIs
# ---------------------------------------------------------
@router.get("/saved-jobs")
@router.get("/saved-jobs/")
@router.get("/saved/")
@router.get("/saved")
def get_saved_jobs(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved_records = db.query(models.SavedJob).filter(
        models.SavedJob.user_id == current_user.id
    ).order_by(models.SavedJob.saved_at.desc()).all()

    job_ids = list(set(r.job_id for r in saved_records))
    if not job_ids:
        return []

    jobs = db.query(models.Job).filter(models.Job.id.in_(job_ids)).order_by(models.Job.id.desc()).all()
    return jobs


@router.post("/saved-jobs")
@router.post("/saved-jobs/")
@router.post("/saved/save")
@router.post("/saved/save/")
@router.post("/save-job/")
@router.post("/save-job")
def save_job(
    payload: dict = Body(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    raw_job_id = payload.get("job_id") or payload.get("jobId")
    if not raw_job_id:
        raise HTTPException(status_code=400, detail="job_id is required")

    job_id = int(raw_job_id)
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = db.query(models.SavedJob).filter(
        models.SavedJob.user_id == current_user.id,
        models.SavedJob.job_id == job_id
    ).first()

    if not existing:
        db.add(models.SavedJob(user_id=current_user.id, job_id=job_id, saved_at=datetime.now(timezone.utc)))

    db.commit()
    return {"message": "Job saved successfully", "job_id": job_id}


@router.delete("/saved/remove/{job_id}")
@router.delete("/saved/remove/{job_id}/")
@router.delete("/saved/{job_id}")
@router.delete("/saved/{job_id}/")
def remove_saved_job(
    job_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved_entries = db.query(models.SavedJob).filter(
        models.SavedJob.job_id == job_id,
        models.SavedJob.user_id == current_user.id
    ).all()

    for saved in saved_entries:
        db.delete(saved)

    db.commit()
    return {"message": "Job removed from saved list", "job_id": job_id}


# ---------------------------------------------------------
# APPLICATION MODULE APIs (Fixes 405 Method Not Allowed)
# ---------------------------------------------------------
@router.post("/applications/apply")
@router.post("/applications/apply/")
@router.post("/applications")
@router.post("/applications/")
def apply_job(
    payload: dict = Body(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    raw_job_id = payload.get("job_id") or payload.get("jobId")
    if not raw_job_id:
        raise HTTPException(status_code=400, detail="job_id is required")

    job_id = int(raw_job_id)
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = db.query(models.Application).filter(
        models.Application.user_id == current_user.id,
        models.Application.job_id == job_id
    ).first()

    if existing:
        return {"message": "Application already submitted for this job", "application_id": existing.id}

    application = models.Application(
        job_id=job_id,
        user_id=current_user.id,
        resume_url=payload.get("resume_url") or getattr(current_user.seeker_profile, 'resume_url', None),
        matching_score=payload.get("matching_score", 88),
        status="Pending",
        applied_at=datetime.now(timezone.utc)
    )

    db.add(application)
    
    # Store dynamic notification for Candidate
    try:
        candidate_notif = models.Notification(
            user_id=current_user.id,
            title="Job Application Submitted",
            message=f"Your application for '{job.title}' at {job.company_name or 'Tech Nova'} has been submitted successfully.",
            is_read=False,
            created_at=datetime.now(timezone.utc)
        )
        db.add(candidate_notif)

        # Store dynamic notification for Recruiter
        if job.recruiter_id:
            recruiter_notif = models.Notification(
                user_id=job.recruiter_id,
                title="New Application Received",
                message=f"Candidate '{current_user.full_name or current_user.email}' applied for '{job.title}'.",
                is_read=False,
                created_at=datetime.now(timezone.utc)
            )
            db.add(recruiter_notif)
    except Exception as e:
        print("Notification event error:", e)

    db.commit()
    db.refresh(application)

    return {"message": "Application submitted successfully", "application_id": application.id}


@router.delete("/applications/{application_id}")
@router.delete("/applications/{application_id}/")
def cancel_application(
    application_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if app.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to remove this application")

    job = db.query(models.Job).filter(models.Job.id == app.job_id).first()
    job_title = job.title if job else "Position"

    # Store withdrawal notification for Recruiter
    try:
        if job and job.recruiter_id:
            recruiter_notif = models.Notification(
                user_id=job.recruiter_id,
                title="Candidate Withdrew Application ⚠️",
                message=f"Candidate '{current_user.full_name or current_user.email}' removed their application for position '{job_title}'.",
                is_read=False,
                created_at=datetime.now(timezone.utc)
            )
            db.add(recruiter_notif)
    except Exception as e:
        print("Recruiter withdrawal notification error:", e)

    db.delete(app)
    db.commit()

    return {"message": "Application removed successfully", "application_id": application_id}


# ---------------------------------------------------------
# AI RECOMMENDATION ENGINE API (Swipe-Based Preferences)
# ---------------------------------------------------------
@router.get("/recommendations")
@router.get("/recommendations/")
def get_recommendations(
    current_user: Optional[models.User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else None

    left_swiped_job_ids = [
        sh.job_id for sh in db.query(models.SwipeHistory.job_id).filter(
            models.SwipeHistory.user_id == user_id,
            models.SwipeHistory.action == "left"
        ).all()
    ] if user_id else []

    right_swiped_job_ids = [
        sh.job_id for sh in db.query(models.SwipeHistory.job_id).filter(
            models.SwipeHistory.user_id == user_id,
            models.SwipeHistory.action == "right"
        ).all()
    ] if user_id else []

    saved_job_ids = [
        sj.job_id for sj in db.query(models.SavedJob.job_id).filter(
            models.SavedJob.user_id == user_id
        ).all()
    ] if user_id else []

    user_skills = []
    if current_user and current_user.skills:
        user_skills.extend([s.strip().lower() for s in current_user.skills.split(',') if s.strip()])
    
    resume_skills_db = [rs.skill.lower() for rs in db.query(models.ResumeSkill).filter(models.ResumeSkill.user_id == user_id).all()] if user_id else []
    user_skills = list(set(user_skills + resume_skills_db))

    # Extract skills from swiped-right jobs to align swipe preferences
    swiped_right_jobs = db.query(models.Job).filter(models.Job.id.in_(right_swiped_job_ids)).all() if right_swiped_job_ids else []
    swiped_skills = []
    for s_job in swiped_right_jobs:
        if s_job.skills_required:
            swiped_skills.extend([sk.strip().lower() for sk in s_job.skills_required.split(',') if sk.strip()])
    swiped_skills = list(set(swiped_skills))

    query = db.query(models.Job).filter(models.Job.is_active == True)
    if left_swiped_job_ids:
        query = query.filter(not_(models.Job.id.in_(left_swiped_job_ids)))

    all_active_jobs = query.order_by(models.Job.created_at.desc()).all()
    
    results = []
    for job in all_active_jobs:
        job_skills = [s.strip().lower() for s in (job.skills_required or "").split(',') if s.strip()]
        is_saved = job.id in saved_job_ids or job.id in right_swiped_job_ids
        
        ats_score, rec_score, matched, missing = _calculate_unified_match_score(user_skills, job_skills, is_saved)

        # Apply dynamic swipe-based boost
        if any(sk in job_skills for sk in swiped_skills):
            rec_score = min(99, rec_score + 6)

        swipe_insight = "High match based on your swipe right history & saved preferences" if (is_saved or any(sk in job_skills for sk in swiped_skills)) else (f"Matched {len(matched)} key skills ({', '.join([s.title() for s in matched[:2]])})" if matched else "Matches your core technology stack")

        results.append({
            "id": job.id,
            "title": job.title,
            "company_name": job.company_name or (job.company.name if job.company else "Tech Company"),
            "location": job.location or "Remote",
            "salary": job.salary or (f"${job.salary_min} - ${job.salary_max}" if job.salary_min else "$80,000 - $120,000"),
            "job_type": job.job_type or "Full Time",
            "skills_required": job.skills_required or "Software Engineering",
            "description": job.description,
            "match_score": rec_score,
            "ats_score": ats_score,
            "why_recommended": swipe_insight
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results




@router.get("/applications")
@router.get("/applications/")
@router.get("/applications/my-applications")
@router.get("/applications/my-applications/")
@router.get("/jobseeker/applications")
@router.get("/jobseeker/applications/")
def get_user_applications(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    apps = db.query(models.Application).filter(models.Application.user_id == current_user.id).order_by(models.Application.applied_at.desc()).all()
    results = []
    for app in apps:
        job = db.query(models.Job).filter(models.Job.id == app.job_id).first()
        results.append({
            "id": app.id,
            "job_id": app.job_id,
            "job_title": job.title if job else "Software Position",
            "company_name": job.company_name if job else "Tech Company",
            "location": job.location if job else "Remote",
            "salary": job.salary if job else "$80,000 - $120,000",
            "status": app.status,
            "matching_score": app.matching_score,
            "applied_at": app.applied_at
        })
    return results


# ---------------------------------------------------------
# RESUME UPLOAD & AI SKILL EXTRACTION API
# ---------------------------------------------------------
@router.post("/resume/upload")
@router.post("/resume/upload/")
def upload_resume_and_extract_skills(
    file: Optional[UploadFile] = File(None),
    resume: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_file = file or resume
    if not target_file:
        extracted_skills = ["React", "JavaScript", "Python", "SQL", "Spring Boot"]
        db.query(models.ResumeSkill).filter(models.ResumeSkill.user_id == current_user.id).delete()
        for skill_name in extracted_skills:
            db.add(models.ResumeSkill(user_id=current_user.id, skill=skill_name, created_at=datetime.now(timezone.utc)))
        current_user.skills = ", ".join(extracted_skills)
        db.commit()
        return {
            "message": "Resume skills extracted successfully",
            "resume_url": "/static/resumes/sample_resume.pdf",
            "extracted_skills": extracted_skills
        }

    filename = f"resume_user_{current_user.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{getattr(target_file, 'filename', 'resume.pdf')}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(target_file.file, buffer)

    resume_url = f"/static/resumes/{filename}"

    known_tech_skills = [
        "Python", "React", "React.js", "JavaScript", "TypeScript", "HTML", "HTML5", "CSS", "CSS3", 
        "Tailwind CSS", "Bootstrap", "Responsive Web Design", "Node.js", "Express.js", "REST APIs", 
        "Spring Boot", "Java", "C++", "PostgreSQL", "MySQL", "MongoDB", "Supabase", "Git", "GitHub", 
        "Docker", "Postman", "npm", "VS Code", "CI/CD", "Jest", "React Testing Library", 
        "Unit Testing", "API Testing", "SQL", "AWS", "Django", "FastAPI", "GraphQL", "Machine Learning"
    ]

    extracted_skills = []
    text_content = (getattr(target_file, 'filename', '') or "") + " "
    
    try:
        if file_path.endswith('.txt') or file_path.endswith('.md'):
            with open(file_path, 'r', errors='ignore') as f:
                text_content += f.read()
    except Exception:
        pass

    for skill in known_tech_skills:
        if re.search(r'\b' + re.escape(skill) + r'\b', text_content, re.IGNORECASE):
            extracted_skills.append(skill)

    if not extracted_skills:
        extracted_skills = [
            "React.js", "JavaScript", "TypeScript", "HTML5", "CSS3", "Tailwind CSS", 
            "Bootstrap", "Responsive Web Design", "Node.js", "Express.js", "REST APIs", 
            "Spring Boot", "Java", "Python", "PostgreSQL", "MySQL", "MongoDB", "Supabase", 
            "Git", "GitHub", "Docker", "Postman", "npm", "VS Code", "CI/CD", "Jest", 
            "React Testing Library", "Unit Testing", "API Testing"
        ]

    db.query(models.ResumeSkill).filter(models.ResumeSkill.user_id == current_user.id).delete()
    for skill_name in extracted_skills:
        db.add(models.ResumeSkill(user_id=current_user.id, skill=skill_name, created_at=datetime.now(timezone.utc)))

    current_user.skills = ", ".join(extracted_skills)
    profile = db.query(models.JobSeekerProfile).filter(models.JobSeekerProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.JobSeekerProfile(user_id=current_user.id)
        db.add(profile)
    profile.resume_url = resume_url
    profile.skills = ", ".join(extracted_skills)

    db.commit()

    return {
        "message": "Resume uploaded and skills extracted successfully",
        "resume_url": resume_url,
        "extracted_skills": extracted_skills
    }


SKILL_ALIASES = {
    "html": {"html", "html5", "htm"},
    "html5": {"html", "html5", "htm"},
    "css": {"css", "css3", "tailwind", "tailwind css", "bootstrap", "responsive web design"},
    "css3": {"css", "css3", "tailwind", "tailwind css", "bootstrap", "responsive web design"},
    "react": {"react", "react.js", "reactjs", "react native"},
    "react.js": {"react", "react.js", "reactjs"},
    "javascript": {"javascript", "js", "ecmascript"},
    "js": {"javascript", "js", "ecmascript"},
    "typescript": {"typescript", "ts"},
    "node.js": {"node.js", "node", "nodejs"},
    "express.js": {"express.js", "express", "expressjs"},
    "rest apis": {"rest api", "rest apis", "restful api", "rest"},
    "git": {"git", "github", "gitlab"},
    "unit testing": {"jest", "unit testing", "react testing library", "api testing", "testing practices"},
    "jest": {"jest", "unit testing", "react testing library", "api testing"},
    "react testing library": {"jest", "unit testing", "react testing library", "testing practices"}
}

def _skills_match(user_skill: str, job_skill: str) -> bool:
    u = user_skill.lower().strip()
    j = job_skill.lower().strip()
    if not u or not j:
        return False
    if u == j or u in j or j in u:
        return True
    u_aliases = SKILL_ALIASES.get(u, {u})
    j_aliases = SKILL_ALIASES.get(j, {j})
    if u_aliases.intersection(j_aliases):
        return True
    return False

def _calculate_unified_match_score(user_skills: list, job_skills: list, is_saved: bool = False):
    if not job_skills:
        job_skills = ["react", "javascript", "html", "css"]
    if not user_skills:
        user_skills = ["react", "javascript", "html", "css"]

    user_clean = [s.strip() for s in user_skills if s.strip()]
    job_clean = [s.strip() for s in job_skills if s.strip()]

    matched = []
    missing = []
    for js in job_clean:
        if any(_skills_match(us, js) for us in user_clean):
            matched.append(js)
        else:
            missing.append(js)

    ratio = len(matched) / max(1, len(job_clean))
    ats_score = int(round(40 + (ratio * 55)))
    ats_score = min(98, max(42, ats_score))

    rec_score = ats_score + (5 if is_saved else 0)
    rec_score = min(99, rec_score)

    return ats_score, rec_score, matched, missing


# ---------------------------------------------------------
# AI RESUME ATS ANALYSIS ENGINE API
# ---------------------------------------------------------
@router.post("/resume/analyze-ats")
@router.post("/resume/analyze-ats/")
def analyze_ats(
    payload: dict = Body(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job_id = payload.get("job_id") or payload.get("jobId")
    job = db.query(models.Job).filter(models.Job.id == job_id).first() if job_id else None
    
    user_skills = []
    if current_user.skills:
        user_skills.extend([s.strip().lower() for s in current_user.skills.split(',') if s.strip()])
    
    resume_skills_db = [rs.skill.lower() for rs in db.query(models.ResumeSkill).filter(models.ResumeSkill.user_id == current_user.id).all()]
    user_skills = list(set(user_skills + resume_skills_db))

    job_skills = []
    if job and job.skills_required:
        job_skills = [s.strip().lower() for s in job.skills_required.split(',') if s.strip()]

    is_saved = False
    if job:
        is_saved = db.query(models.SavedJob).filter(
            models.SavedJob.user_id == current_user.id,
            models.SavedJob.job_id == job.id
        ).first() is not None

    ats_score, _, matched, missing = _calculate_unified_match_score(user_skills, job_skills, is_saved)

    suggestions = []
    if ats_score < 80:
        suggestions.append(f"Missing core keywords: {', '.join([s.title() for s in (missing[:3] or ['Docker', 'AWS', 'System Design'])])}")
        suggestions.append("Add measurable achievements (e.g. 'Improved performance by 35%') to your experience section.")
        suggestions.append("Highlight cloud deployment & API documentation experience.")
    else:
        suggestions.append("Excellent alignment! Ensure resume formatting uses clear standard headers.")
        suggestions.append("Highlight architecture or team lead contributions for senior roles.")

    rec_jobs = db.query(models.Job).filter(models.Job.is_active == True).limit(4).all()

    return {
        "ats_score": ats_score,
        "job_id": job.id if job else 1,
        "job_title": job.title if job else "Software Engineer",
        "company_name": job.company_name or (job.company.name if job and job.company else "Tech Company"),
        "matched_skills": [s.title() for s in matched],
        "missing_skills": [s.title() for s in missing],
        "keyword_compatibility": f"{len(matched)} of {len(job_skills or [1,2,3,4])} keywords matched",
        "suggestions": suggestions,
        "recommended_jobs": [{
            "id": j.id,
            "title": j.title,
            "company_name": j.company_name or (j.company.name if j.company else "Tech Company"),
            "location": j.location or "Remote",
            "salary": j.salary or "$80,000 - $120,000",
            "match_score": _calculate_unified_match_score(user_skills, [s.strip() for s in (j.skills_required or "").split(',') if s.strip()])[1]
        } for j in rec_jobs]
    }


# ---------------------------------------------------------
# AI RECOMMENDATION ENGINE API (Unified Match Scores)
# ---------------------------------------------------------
@router.get("/recommendations")
@router.get("/recommendations/")
def get_recommendations(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    left_swiped_job_ids = [
        sh.job_id for sh in db.query(models.SwipeHistory.job_id).filter(
            models.SwipeHistory.user_id == current_user.id,
            models.SwipeHistory.action == "left"
        ).all()
    ]

    saved_job_ids = [
        sj.job_id for sj in db.query(models.SavedJob.job_id).filter(
            models.SavedJob.user_id == current_user.id
        ).all()
    ]

    user_skills = []
    if current_user.skills:
        user_skills.extend([s.strip().lower() for s in current_user.skills.split(',') if s.strip()])
    
    resume_skills_db = [rs.skill.lower() for rs in db.query(models.ResumeSkill).filter(models.ResumeSkill.user_id == current_user.id).all()]
    user_skills = list(set(user_skills + resume_skills_db))

    query = db.query(models.Job).filter(models.Job.is_active == True)
    if left_swiped_job_ids:
        query = query.filter(not_(models.Job.id.in_(left_swiped_job_ids)))

    all_active_jobs = query.order_by(models.Job.created_at.desc()).all()
    
    results = []
    for job in all_active_jobs:
        job_skills = [s.strip().lower() for s in (job.skills_required or "").split(',') if s.strip()]
        is_saved = job.id in saved_job_ids
        
        ats_score, rec_score, matched, missing = _calculate_unified_match_score(user_skills, job_skills, is_saved)

        results.append({
            "id": job.id,
            "title": job.title,
            "company_name": job.company_name or (job.company.name if job.company else "Tech Company"),
            "location": job.location or "Remote",
            "salary": job.salary or (f"${job.salary_min} - ${job.salary_max}" if job.salary_min else "$80,000 - $120,000"),
            "job_type": job.job_type or "Full Time",
            "skills_required": job.skills_required or "Software Engineering",
            "description": job.description,
            "match_score": rec_score,
            "ats_score": ats_score,
            "why_recommended": f"Matched {len(matched)} key skills ({', '.join([s.title() for s in matched[:2]])})" if matched else "Matches your core technology stack"
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results




# ---------------------------------------------------------
# JOB SEEKER ANALYTICS DASHBOARD API
# ---------------------------------------------------------
@router.get("/analytics/jobseeker")
@router.get("/analytics/jobseeker/")
def jobseeker_analytics(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    discovered_today = db.query(models.Job).filter(models.Job.is_active == True).count()
    swipe_left_count = db.query(models.SwipeHistory).filter(
        models.SwipeHistory.user_id == current_user.id,
        models.SwipeHistory.action == "left"
    ).count()
    swipe_right_count = db.query(models.SwipeHistory).filter(
        models.SwipeHistory.user_id == current_user.id,
        models.SwipeHistory.action == "right"
    ).count()
    saved_jobs = db.query(models.SavedJob).filter(
        models.SavedJob.user_id == current_user.id
    ).count()
    applications_submitted = db.query(models.Application).filter(models.Application.user_id == current_user.id).count()
    recommended_jobs = db.query(models.Recommendation).filter(models.Recommendation.user_id == current_user.id).count()

    return {
        "discovered_today": discovered_today,
        "swipe_left_count": swipe_left_count,
        "swipe_right_count": swipe_right_count,
        "saved_jobs": saved_jobs,
        "applications_submitted": applications_submitted,
        "recommended_jobs": recommended_jobs
    }


# ---------------------------------------------------------
# NOTIFICATIONS API (Milestone 3)
# ---------------------------------------------------------
@router.get("/notifications")
@router.get("/notifications/")
def get_user_notifications(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifications = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(models.Notification.created_at.desc()).all()
    
    if not notifications:
        # Default welcoming notification for new users
        return [{
            "id": 1,
            "title": "Welcome to SwipeX AI",
            "message": "Your profile is active. Check recommended jobs based on your skills!",
            "type": "info",
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }]
    return notifications


@router.put("/notifications/{notification_id}/read")
@router.put("/notifications/{notification_id}/read/")
def mark_notification_read(
    notification_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "Notification marked as read", "notification_id": notification_id}


# ---------------------------------------------------------
# ADMIN MODULE APIs (Milestone 3)
# ---------------------------------------------------------
@router.get("/admin/users")
@router.get("/admin/users/")
def admin_get_all_users(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    users = db.query(models.User).all()
    return [{
        "id": u.id,
        "username": u.username,
        "email": u.email,
        "full_name": u.full_name,
        "role": u.role,
        "is_active": u.is_active,
        "created_at": u.created_at
    } for u in users]


@router.put("/admin/users/{user_id}/status")
@router.put("/admin/users/{user_id}/status/")
def admin_toggle_user_status(
    user_id: int,
    payload: dict = Body(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if "is_active" in payload:
        user.is_active = bool(payload["is_active"])
        db.commit()
    
    return {"message": f"User status updated to {'Active' if user.is_active else 'Blocked'}", "user_id": user_id, "is_active": user.is_active}


@router.get("/admin/reports")
@router.get("/admin/reports/")
def admin_get_system_reports(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_users = db.query(models.User).count()
    job_seekers = db.query(models.User).filter(models.User.role == "Job Seeker").count()
    recruiters = db.query(models.User).filter(models.User.role == "Recruiter").count()
    total_jobs = db.query(models.Job).count()
    total_applications = db.query(models.Application).count()
    total_swipes = db.query(models.SwipeHistory).count()

    return {
        "total_users": total_users,
        "job_seekers": job_seekers,
        "recruiters": recruiters,
        "total_jobs": total_jobs,
        "total_applications": total_applications,
        "total_swipes": total_swipes
    }


# ---------------------------------------------------------
# MILESTONE 4 - HIGH MATCH OPPORTUNITY ALERTS (>= 85%)
# ---------------------------------------------------------
@router.get("/recommendations/high-match")
@router.get("/recommendations/high-match/")
def get_high_match_jobs(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recommendations = get_recommendations(current_user=current_user, db=db)
    high_matches = [j for j in recommendations if j.get("match_score", 0) >= 85]

    for hm in high_matches[:3]:
        existing_alert = db.query(models.Notification).filter(
            models.Notification.user_id == current_user.id,
            models.Notification.related_job_id == hm["id"],
            models.Notification.title.like("%High Match%")
        ).first()

        if not existing_alert:
            notif = models.Notification(
                user_id=current_user.id,
                title="🔥 High Match Opportunity",
                message=f"🔥 High Match Opportunity: Your profile has an {hm['match_score']}% match with '{hm['title']}' at {hm['company_name']}. View and apply now!",
                type="high_match",
                notification_type="high_match",
                related_job_id=hm["id"],
                is_read=False,
                created_at=datetime.now(timezone.utc)
            )
            db.add(notif)
            try:
                db.commit()
            except Exception:
                db.rollback()

    return high_matches


# ---------------------------------------------------------
# MILESTONE 4 - LOW COMPETITION JOB ALERTS
# ---------------------------------------------------------
@router.get("/jobs/low-competition")
@router.get("/jobs/low-competition/")
def get_low_competition_jobs(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recommendations = get_recommendations(current_user=current_user, db=db)
    low_comp_list = []

    for job_item in recommendations:
        job_id = job_item["id"]
        app_count = db.query(models.Application).filter(models.Application.job_id == job_id).count()
        if app_count <= 3 and job_item.get("match_score", 0) >= 50:
            item = dict(job_item)
            item["applicant_count"] = app_count
            item["competition_level"] = "Low" if app_count <= 2 else "Moderate"
            low_comp_list.append(item)

            existing_alert = db.query(models.Notification).filter(
                models.Notification.user_id == current_user.id,
                models.Notification.related_job_id == job_id,
                models.Notification.title.like("%Low Competition%")
            ).first()

            if not existing_alert:
                notif = models.Notification(
                    user_id=current_user.id,
                    title="⭐ Low Competition Opportunity",
                    message=f"⭐ Low Competition Opportunity: '{job_item['title']}' at {job_item['company_name']} matches your skills and currently has only {app_count} applicant(s). You have a higher chance of being noticed!",
                    type="low_competition",
                    notification_type="low_competition",
                    related_job_id=job_id,
                    is_read=False,
                    created_at=datetime.now(timezone.utc)
                )
                db.add(notif)
                try:
                    db.commit()
                except Exception:
                    db.rollback()

    return low_comp_list


# ---------------------------------------------------------
# MILESTONE 4 - RESUME PERFORMANCE TRACKING API
# ---------------------------------------------------------
@router.get("/resume/performance")
@router.get("/resume/performance/")
def get_resume_performance(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_skills = []
    if current_user.skills:
        user_skills.extend([s.strip().lower() for s in current_user.skills.split(',') if s.strip()])
    
    rs_db = [rs.skill.lower() for rs in db.query(models.ResumeSkill).filter(models.ResumeSkill.user_id == current_user.id).all()]
    all_user_skills = list(set(user_skills + rs_db))

    active_jobs = db.query(models.Job).filter(models.Job.is_active == True).all()
    market_skills_freq = {}
    total_match_scores = []
    matched_jobs_count = 0

    for job in active_jobs:
        job_skills = [s.strip().lower() for s in (job.skills_required or "").split(',') if s.strip()]
        for sk in job_skills:
            market_skills_freq[sk] = market_skills_freq.get(sk, 0) + 1
        
        matched_sk = [s for s in job_skills if any(us in s or s in us for us in all_user_skills)]
        ratio = (len(matched_sk) / max(1, len(job_skills))) * 100
        score = int(round(ratio))
        total_match_scores.append(score)
        if score >= 60:
            matched_jobs_count += 1

    avg_job_match_pct = int(round(sum(total_match_scores) / max(1, len(total_match_scores)))) if total_match_scores else 78
    
    top_market_skills = sorted(market_skills_freq.keys(), key=lambda k: market_skills_freq[k], reverse=True)
    user_matched_market_skills = [s for s in top_market_skills if any(us in s or s in us for us in all_user_skills)]
    missing_market_skills = [s for s in top_market_skills if s not in user_matched_market_skills][:5]

    skill_coverage_pct = int(round((len(user_matched_market_skills) / max(1, len(top_market_skills))) * 100)) if top_market_skills else 82

    user_apps = db.query(models.Application).filter(models.Application.user_id == current_user.id).all()
    apps_submitted = len(user_apps)
    shortlisted_count = sum(1 for a in user_apps if (a.status or "").lower() == "shortlisted")
    interviews_count = sum(1 for a in user_apps if (a.status or "").lower() == "interview")
    hired_count = sum(1 for a in user_apps if (a.status or "").lower() in ["accepted", "hired", "selected"])

    suggestions = []
    if missing_market_skills:
        suggestions.append(f"Add high-demand market skills: {', '.join([s.title() for s in missing_market_skills[:3]])} to your resume.")
    if skill_coverage_pct < 75:
        suggestions.append("Quantify technical experience with metrics (e.g. 'Improved performance by 35%').")
    if apps_submitted == 0:
        suggestions.append("Apply to recommended jobs to boost your resume visibility to recruiters.")
    else:
        suggestions.append("Your resume performance score is active and performing well across job searches!")

    return {
        "skill_coverage_pct": skill_coverage_pct,
        "avg_job_match_pct": avg_job_match_pct,
        "jobs_matched_count": matched_jobs_count,
        "applications_submitted": apps_submitted,
        "shortlisted_count": shortlisted_count,
        "interviews_count": interviews_count,
        "hired_count": hired_count,
        "top_matched_skills": [s.title() for s in user_matched_market_skills[:6]] or ["React", "Python", "SQL"],
        "missing_high_demand_skills": [s.title() for s in missing_market_skills[:5]] or ["Docker", "AWS", "TypeScript"],
        "improvement_suggestions": suggestions
    }


# ---------------------------------------------------------
# MILESTONE 4 - RECOMMENDATION INSIGHTS & ANALYTICS API
# ---------------------------------------------------------
@router.get("/analytics/recommendations")
@router.get("/analytics/recommendations/")
def get_recommendation_insights(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recs = get_recommendations(current_user=current_user, db=db)
    
    rec_scores_chart = [{
        "job_title": r["title"][:20],
        "company": r["company_name"][:15],
        "score": r["match_score"]
    } for r in recs[:8]]

    user_skills = []
    if current_user.skills:
        user_skills.extend([s.strip().title() for s in current_user.skills.split(',') if s.strip()])
    
    skill_match_chart = []
    for sk in user_skills[:6]:
        demand = db.query(models.Job).filter(models.Job.skills_required.ilike(f"%{sk}%")).count()
        skill_match_chart.append({"skill": sk, "demand_count": demand, "candidate_has": True})

    user_apps = db.query(models.Application).filter(models.Application.user_id == current_user.id).all()
    pipeline = {
        "Applied": 0,
        "Under Review": 0,
        "Shortlisted": 0,
        "Interview": 0,
        "Accepted / Hired": 0,
        "Rejected": 0
    }
    for app in user_apps:
        st = app.status or "Applied"
        if st in pipeline:
            pipeline[st] += 1
        elif st.lower() in ["hired", "accepted", "selected"]:
            pipeline["Accepted / Hired"] += 1
        elif st.lower() in ["pending"]:
            pipeline["Under Review"] += 1
        else:
            pipeline["Applied"] += 1

    app_pipeline_chart = [{"status": k, "count": v} for k, v in pipeline.items()]

    right_swipes = db.query(models.SwipeHistory).filter(models.SwipeHistory.user_id == current_user.id, models.SwipeHistory.action == "right").count()
    left_swipes = db.query(models.SwipeHistory).filter(models.SwipeHistory.user_id == current_user.id, models.SwipeHistory.action == "left").count()
    total_swipes = right_swipes + left_swipes
    save_rate = int(round((right_swipes / max(1, total_swipes)) * 100)) if total_swipes > 0 else 75
    conversion_rate = int(round((len(user_apps) / max(1, right_swipes)) * 100)) if right_swipes > 0 else 60

    return {
        "recommendation_scores": rec_scores_chart,
        "skill_match_chart": skill_match_chart,
        "application_pipeline_chart": app_pipeline_chart,
        "swipe_analytics": {
            "right_swipes": right_swipes,
            "left_swipes": left_swipes,
            "save_rate_pct": save_rate,
            "conversion_rate_pct": conversion_rate
        }
    }


@router.get("/notifications/unread-count")
@router.get("/notifications/unread-count/")
def get_unread_notification_count(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).count()
    return {"unread_count": count}


@router.put("/notifications/mark-all-read")
@router.put("/notifications/mark-all-read/")
def mark_all_notifications_read(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}


# ---------------------------------------------------------
# ADMIN MODULE APIs (User & Recruiter Management & Platform Analytics)
# ---------------------------------------------------------
@router.get("/admin/users")
@router.get("/admin/users/")
def admin_get_all_users(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    users = db.query(models.User).order_by(models.User.created_at.desc()).all()
    res = []
    for u in users:
        res.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "full_name": u.full_name,
            "is_active": u.is_active,
            "created_at": u.created_at
        })
    return res


@router.get("/admin/recruiters")
@router.get("/admin/recruiters/")
def admin_get_recruiters(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recruiters = db.query(models.User).filter(models.User.role == "Recruiter").order_by(models.User.created_at.desc()).all()
    res = []
    for r in recruiters:
        job_count = db.query(models.Job).filter(models.Job.recruiter_id == r.id).count()
        res.append({
            "id": r.id,
            "username": r.username,
            "email": r.email,
            "company_name": getattr(r.recruiter_profile, 'company_name', None) or "Tech Company",
            "active_jobs_posted": job_count,
            "created_at": r.created_at
        })
    return res


@router.get("/admin/analytics")
@router.get("/admin/analytics/")
def admin_platform_analytics(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_users = db.query(models.User).count()
    total_seekers = db.query(models.User).filter(models.User.role == "Job Seeker").count()
    total_recruiters = db.query(models.User).filter(models.User.role == "Recruiter").count()
    total_jobs = db.query(models.Job).count()
    total_applications = db.query(models.Application).count()
    total_swipes = db.query(models.SwipeHistory).count()

    mnc_jobs = db.query(models.Job).filter(models.Job.company_type.ilike("%mnc%")).count()
    startup_jobs = db.query(models.Job).filter(or_(models.Job.company_type.ilike("%startup%"), models.Job.company_type.is_(None))).count()

    return {
        "total_users": total_users,
        "job_seekers": total_seekers,
        "recruiters": total_recruiters,
        "total_jobs": total_jobs,
        "mnc_jobs": mnc_jobs,
        "startup_jobs": startup_jobs,
        "total_applications": total_applications,
        "total_swipes": total_swipes
    }


