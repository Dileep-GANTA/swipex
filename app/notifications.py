# ============================================================
# SWIPEX - NOTIFICATION SYSTEM
# ============================================================

from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .database import get_db
from . import models, schemas
from .auth import get_current_user


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# ============================================================
# CREATE NOTIFICATION
# ============================================================

def create_notification(
    db: Session,
    user_id: int,
    type: str,
    title: str,
    message: str,
    job_id: Optional[int] = None
):
    """
    Create and save one notification.
    """

    notification = models.Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        job_id=job_id
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    print(
        "🔔 NOTIFICATION CREATED:",
        notification.id,
        "| User:",
        notification.user_id,
        "| Type:",
        notification.type,
        "| Title:",
        notification.title
    )

    return notification


# ============================================================
# CALCULATE MATCH
# ============================================================

def calculate_match(
    resume_text: str,
    job_skills: str
) -> int:
    """
    Lightweight keyword-overlap match calculation.

    Example:

    Resume:
        Python, AI, Machine Learning

    Job:
        Python, AI, Machine Learning

    Result:
        100
    """

    if not resume_text or not job_skills:
        return 0

    resume_text = resume_text.lower()

    skills = [
        skill.strip().lower()
        for skill in job_skills.split(",")
        if skill.strip()
    ]

    if not skills:
        return 0

    matched = sum(
        1
        for skill in skills
        if skill in resume_text
    )

    match_percentage = int(
        (matched / len(skills)) * 100
    )

    return match_percentage


# ============================================================
# NOTIFY JOB SEEKERS WHEN NEW JOB IS POSTED
# ============================================================

def notify_job_seekers_of_new_job(
    db: Session,
    job: "models.Job"
):
    """
    Creates notifications when a recruiter posts a new job.

    Notifications:

    1. New job alert
    2. Personalized recommendation >= 50%
    3. High AI match alert >= 80%
    4. Low competition alert
       - Match >= 50%
       - Applicants < 5
    """

    # ========================================================
    # FIND JOB SEEKERS
    # ========================================================

    job_seekers = db.query(
        models.User
    ).filter(
        models.User.role.in_([
            "jobseeker",
            "job_seeker",
            "Job Seeker"
        ])
    ).all()

    print(
        "🔔 NOTIFICATION DEBUG - JOB SEEKERS:",
        [
            (
                user.id,
                user.email,
                user.role
            )
            for user in job_seekers
        ]
    )

    # ========================================================
    # COUNT APPLICANTS
    # ========================================================

    applicant_count = db.query(
        models.Application
    ).filter(
        models.Application.job_id == job.id
    ).count()

    print(
        "👥 APPLICANT COUNT:",
        applicant_count
    )

    # ========================================================
    # PROCESS EVERY JOB SEEKER
    # ========================================================

    for seeker in job_seekers:

        print(
            "👤 PROCESSING USER:",
            seeker.email
        )

        # ====================================================
        # 1. NEW JOB ALERT
        # ====================================================

        create_notification(
            db=db,
            user_id=seeker.id,
            type="new_job",
            title="New job posted",
            message=(
                f"{job.title} at {job.company} "
                f"was just posted."
            ),
            job_id=job.id
        )

        print(
            "🆕 NEW JOB ALERT CREATED:",
            seeker.email
        )

        # ====================================================
        # 2. CHECK RESUME
        # ====================================================

        has_resume = bool(
            seeker.resume_text
        )

        print(
            "📄 RESUME DEBUG:",
            seeker.email,
            "| Has resume:",
            has_resume
        )

        if not has_resume:

            print(
                "⚠️ NO RESUME FOUND:",
                seeker.email
            )

            continue

        # ====================================================
        # 3. CALCULATE MATCH
        # ====================================================

        match = calculate_match(
            seeker.resume_text,
            job.skills or ""
        )

        print(
            "🎯 MATCH DEBUG:",
            seeker.email,
            "| Job:",
            job.title,
            "| Job Skills:",
            job.skills,
            "| Match:",
            match
        )

        # ====================================================
        # 4. PERSONALIZED RECOMMENDATION
        # ====================================================

        if match >= 50:

            print(
                "🤖 PERSONALIZED RECOMMENDATION:",
                seeker.email,
                "| Match:",
                match
            )

            create_notification(
                db=db,
                user_id=seeker.id,
                type="personalized_recommendation",
                title="Recommended job for you",
                message=(
                    f"{job.title} at {job.company} "
                    f"matches your profile by {match}%. "
                    f"This job is recommended based on your skills."
                ),
                job_id=job.id
            )

            print(
                "✅ PERSONALIZED NOTIFICATION CREATED:",
                seeker.email
            )

        # ====================================================
        # 5. HIGH MATCH ALERT
        # ====================================================

        if match >= 80:

            print(
                "🚨 HIGH MATCH ALERT:",
                seeker.email,
                "| Match:",
                match
            )

            create_notification(
                db=db,
                user_id=seeker.id,
                type="high_match",
                title=f"{match}% match found",
                message=(
                    f"{job.title} at {job.company} "
                    f"is a {match}% match "
                    f"for your resume."
                ),
                job_id=job.id
            )

            print(
                "✅ HIGH MATCH NOTIFICATION CREATED:",
                seeker.email
            )

        # ====================================================
        # 6. LOW COMPETITION ALERT
        # ====================================================

        if (
            match >= 50
            and applicant_count < 5
        ):

            print(
                "🟢 LOW COMPETITION ALERT:",
                seeker.email,
                "| Match:",
                match,
                "| Applicants:",
                applicant_count
            )

            create_notification(
                db=db,
                user_id=seeker.id,
                type="low_competition",
                title="Low competition opportunity",
                message=(
                    f"{job.title} at {job.company} "
                    f"has very few applicants so far "
                    f"— a good time to apply."
                ),
                job_id=job.id
            )

            print(
                "✅ LOW COMPETITION NOTIFICATION CREATED:",
                seeker.email
            )

    # ========================================================
    # FINISHED
    # ========================================================

    print(
        "✅ ALL JOB SEEKER NOTIFICATIONS PROCESSED"
    )


# ============================================================
# GET MY NOTIFICATIONS
# ============================================================

@router.get(
    "/me",
    response_model=list[schemas.NotificationResponse]
)
def get_my_notifications(
    unread_only: bool = False,
    limit: int = 30,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    query = db.query(
        models.Notification
    ).filter(
        models.Notification.user_id ==
        current_user.id
    )

    if unread_only:

        query = query.filter(
            models.Notification.is_read == False
        )

    notifications = (
        query
        .order_by(
            models.Notification.created_at.desc()
        )
        .limit(limit)
        .all()
    )

    return notifications


# ============================================================
# GET UNREAD COUNT
# ============================================================

@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    count = db.query(
        models.Notification
    ).filter(
        models.Notification.user_id ==
        current_user.id,
        models.Notification.is_read == False
    ).count()

    return {
        "unread_count": count
    }


# ============================================================
# MARK ONE NOTIFICATION AS READ
# ============================================================

@router.post(
    "/mark-read/{notification_id}"
)
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    notification = db.query(
        models.Notification
    ).filter(
        models.Notification.id ==
        notification_id,
        models.Notification.user_id ==
        current_user.id
    ).first()

    if notification:

        notification.is_read = True

        db.commit()

    return {
        "message":
            "Notification marked as read"
    }


# ============================================================
# MARK ALL NOTIFICATIONS AS READ
# ============================================================

@router.post("/mark-all-read")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    db.query(
        models.Notification
    ).filter(
        models.Notification.user_id ==
        current_user.id,
        models.Notification.is_read == False
    ).update(
        {
            "is_read": True
        }
    )

    db.commit()

    return {
        "message":
            "All notifications marked as read"
    }