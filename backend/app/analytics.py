from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import Counter
from datetime import datetime, timedelta

from .database import get_db
from . import models
from .auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


# ======================================================
# JOB SEEKER DASHBOARD ANALYTICS
# ======================================================

@router.get("/dashboard")
def job_seeker_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Powers the analytics cards + trend chart on the job-seeker
    dashboard: application funnel, best match, resume score trend."""

    applications = db.query(models.Application).filter(
        models.Application.user_id == current_user.id
    ).all()

    status_counts = Counter(a.status for a in applications)

    best_match = max(
        [a.match_percentage for a in applications], default=0
    )

    avg_match = (
        round(sum(a.match_percentage for a in applications) / len(applications))
        if applications else 0
    )

    saved_count = db.query(models.SavedJob).filter(
        models.SavedJob.user_id == current_user.id
    ).count()

    resume_history = db.query(models.ResumeScoreHistory).filter(
        models.ResumeScoreHistory.user_id == current_user.id
    ).order_by(models.ResumeScoreHistory.created_at.asc()).all()

    return {
        "total_applications": len(applications),
        "applied": status_counts.get("applied", 0),
        "shortlisted": status_counts.get("shortlisted", 0),
        "rejected": status_counts.get("rejected", 0),
        "selected": status_counts.get("selected", 0),
        "best_match_percentage": best_match,
        "average_match_percentage": avg_match,
        "saved_jobs_count": saved_count,
        "resume_score_trend": [
            {
                "score": r.ats_score,
                "date": r.created_at.strftime("%Y-%m-%d") if r.created_at else None
            }
            for r in resume_history
        ],
    }


# ======================================================
# RESUME PERFORMANCE RANKING
# ======================================================

@router.get("/resume-performance")
def resume_performance(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """'Resume performance ranking with scale' — the user's latest ATS
    score compared against every other job seeker's latest score."""

    latest_scores = {}

    all_entries = db.query(models.ResumeScoreHistory).order_by(
        models.ResumeScoreHistory.created_at.asc()
    ).all()

    for entry in all_entries:
        # keeping the loop in ascending date order means the last
        # write per user_id is naturally their most recent score
        latest_scores[entry.user_id] = entry.ats_score

    my_score = latest_scores.get(current_user.id, 0)

    all_values = sorted(latest_scores.values())

    if all_values:
        rank_position = sum(1 for v in all_values if v <= my_score)
        percentile = round((rank_position / len(all_values)) * 100)
    else:
        percentile = 0

    if my_score >= 85:
        tier = "Excellent"
    elif my_score >= 70:
        tier = "Strong"
    elif my_score >= 50:
        tier = "Average"
    else:
        tier = "Needs Improvement"

    return {
        "latest_score": my_score,
        "percentile": percentile,
        "tier": tier,
        "total_users_compared": len(all_values),
        "history": [
            {
                "score": e.ats_score,
                "date": e.created_at.strftime("%Y-%m-%d") if e.created_at else None
            }
            for e in all_entries
            if e.user_id == current_user.id
        ],
    }


# ======================================================
# RECRUITER ANALYTICS
# ======================================================

@router.get("/recruiter")
def recruiter_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Application analytics + hiring trend visualization data for the
    recruiter side (applications.html)."""

    job_ids = [
        j.id for j in db.query(models.Job.id).filter(
            models.Job.posted_by == current_user.id
        ).all()
    ]

    app_query = db.query(models.Application)
    job_query = db.query(models.Job)

    if job_ids:
        app_query = app_query.filter(models.Application.job_id.in_(job_ids))
        job_query = job_query.filter(models.Job.id.in_(job_ids))

    applications = app_query.all()
    jobs = job_query.all()

    status_counts = Counter(a.status for a in applications)

    # -------- hiring trend: applications per day, last 14 days --------
    today = datetime.utcnow().date()
    trend = {
        (today - timedelta(days=i)).strftime("%Y-%m-%d"): 0
        for i in range(13, -1, -1)
    }

    for a in applications:
        if a.applied_at:
            key = a.applied_at.strftime("%Y-%m-%d")
            if key in trend:
                trend[key] += 1

    # -------- top skills in demand across posted jobs --------
    skill_counter = Counter()
    for job in jobs:
        for skill in (job.skills or "").split(","):
            skill = skill.strip()
            if skill:
                skill_counter[skill] += 1

    top_skills = [
        {"skill": s, "count": c}
        for s, c in skill_counter.most_common(8)
    ]

    return {
        "total_jobs_posted": len(jobs),
        "total_applications": len(applications),
        "applied": status_counts.get("applied", 0),
        "shortlisted": status_counts.get("shortlisted", 0),
        "rejected": status_counts.get("rejected", 0),
        "selected": status_counts.get("selected", 0),
        "hiring_trend": [
            {"date": d, "applications": c} for d, c in trend.items()
        ],
        "top_skills_in_demand": top_skills,
    }


# ======================================================
# RECOMMENDATION INSIGHTS
# ======================================================

@router.get("/recommendation-insights")
def recommendation_insights(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Simple, explainable insight into why jobs are/aren't matching —
    which skills from the user's resume show up most across all posted
    jobs (in-demand) vs. which required skills are most often missing."""

    resume_text = (current_user.resume_text or "").lower()

    jobs = db.query(models.Job).all()

    matched_counter = Counter()
    missing_counter = Counter()

    for job in jobs:
        for skill in (job.skills or "").split(","):
            skill = skill.strip()
            if not skill:
                continue
            if skill.lower() in resume_text:
                matched_counter[skill] += 1
            else:
                missing_counter[skill] += 1

    return {
        "strong_skills": [
            {"skill": s, "appears_in_jobs": c}
            for s, c in matched_counter.most_common(6)
        ],
        "suggested_skills_to_learn": [
            {"skill": s, "appears_in_jobs": c}
            for s, c in missing_counter.most_common(6)
        ],
    }
