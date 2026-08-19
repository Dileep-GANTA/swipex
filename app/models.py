from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    Boolean,
    Text
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from .database import Base


# =====================================================
# USER
# =====================================================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        nullable=False
    )

    password = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        nullable=False
    )


    # =================================================
    # RESUME
    # =================================================

    resume_text = Column(
        Text,
        nullable=True
    )

    resume_filename = Column(
        String,
        nullable=True
    )

    resume_path = Column(
        String,
        nullable=True
    )


    # =================================================
    # RELATIONSHIPS
    # =================================================

    applications = relationship(
        "Application",
        back_populates="user"
    )

    saved_jobs = relationship(
        "SavedJob",
        back_populates="user"
    )

    notifications = relationship(
        "Notification",
        back_populates="user"
    )

    resume_scores = relationship(
        "ResumeScoreHistory",
        back_populates="user"
    )


# =====================================================
# JOB
# =====================================================

class Job(Base):

    __tablename__ = "jobs"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    title = Column(
        String,
        nullable=False
    )


    company = Column(
        String,
        nullable=False
    )


    location = Column(
        String,
        nullable=False
    )


    salary = Column(
        String,
        nullable=True
    )


    experience = Column(
        String,
        nullable=True
    )


    job_type = Column(
        String,
        nullable=True
    )


    category = Column(
        String,
        nullable=True
    )


    skills = Column(
        String,
        nullable=True
    )


    description = Column(
        String,
        nullable=True
    )


    logo = Column(
        String,
        nullable=True
    )


    # =================================================
    # JOB POSTING INFORMATION
    # =================================================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


    # Recruiter who posted this job
    posted_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )


    # =================================================
    # RELATIONSHIPS
    # =================================================

    applications = relationship(
        "Application",
        back_populates="job"
    )

    saved_by = relationship(
        "SavedJob",
        back_populates="job"
    )


# =====================================================
# APPLICATION
# =====================================================

class Application(Base):

    __tablename__ = "applications"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )


    job_id = Column(
        Integer,
        ForeignKey("jobs.id"),
        nullable=False
    )


    # =================================================
    # APPLICATION STATUS
    # =================================================

    status = Column(
        String,
        nullable=False,
        default="applied"
    )


    # =================================================
    # AI MATCH
    # =================================================

    match_percentage = Column(
        Integer,
        default=0
    )


    # =================================================
    # TIMESTAMPS
    # =================================================

    applied_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now()
    )


    # =================================================
    # RELATIONSHIPS
    # =================================================

    user = relationship(
        "User",
        back_populates="applications"
    )

    job = relationship(
        "Job",
        back_populates="applications"
    )


# =====================================================
# SAVED JOB
# =====================================================

class SavedJob(Base):

    __tablename__ = "saved_jobs"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )


    job_id = Column(
        Integer,
        ForeignKey("jobs.id"),
        nullable=False
    )


    saved_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


    # =================================================
    # RELATIONSHIPS
    # =================================================

    user = relationship(
        "User",
        back_populates="saved_jobs"
    )

    job = relationship(
        "Job",
        back_populates="saved_by"
    )


# =====================================================
# NOTIFICATION
# =====================================================

class Notification(Base):

    __tablename__ = "notifications"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )


    # Examples:
    # new_job
    # high_match
    # low_competition
    # status_update

    type = Column(
        String,
        nullable=False
    )


    title = Column(
        String,
        nullable=False
    )


    message = Column(
        String,
        nullable=False
    )


    job_id = Column(
        Integer,
        ForeignKey("jobs.id"),
        nullable=True
    )


    is_read = Column(
        Boolean,
        default=False
    )


    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


    # =================================================
    # RELATIONSHIP
    # =================================================

    user = relationship(
        "User",
        back_populates="notifications"
    )


# =====================================================
# RESUME SCORE HISTORY
# =====================================================

class ResumeScoreHistory(Base):

    __tablename__ = "resume_score_history"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )


    ats_score = Column(
        Integer,
        nullable=False
    )


    filename = Column(
        String,
        nullable=True
    )


    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


    # =================================================
    # RELATIONSHIP
    # =================================================

    user = relationship(
        "User",
        back_populates="resume_scores"
    )