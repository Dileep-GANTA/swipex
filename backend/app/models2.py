from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Profile fields
    profile_pic = Column(
        String,
        nullable=True,
        default="https://via.placeholder.com/150"
    )
    bio = Column(String, nullable=True)
    skills = Column(JSON, default=list)
    preferred_location = Column(String, nullable=True)
    experience_years = Column(Integer, default=0)

    saved_jobs = relationship(
        "SavedJob",
        back_populates="user",
        cascade="all, delete-orphan"
    )


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    logo_url = Column(String, nullable=True)
    website = Column(String, nullable=True)
    location = Column(String, nullable=False)
    description = Column(String, nullable=True)
    industry = Column(String, nullable=False)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    jobs = relationship(
        "Job",
        back_populates="company",
        cascade="all, delete-orphan"
    )


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)

    company_id = Column(
        Integer,
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False
    )

    title = Column(String, nullable=False)
    salary_min = Column(Integer, nullable=False)
    salary_max = Column(Integer, nullable=False)
    location = Column(String, nullable=False)
    experience_required = Column(Integer, nullable=False)
    skills_required = Column(JSON, default=list)
    job_type = Column(String, default="Full-time")
    description = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    company = relationship(
        "Company",
        back_populates="jobs"
    )


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    job_id = Column(
        Integer,
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False
    )

    saved_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    user = relationship(
        "User",
        back_populates="saved_jobs"
    )


class SwipeHistory(Base):
    __tablename__ = "swipe_history"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    job_id = Column(
        Integer,
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False
    )

    action = Column(
        String,
        nullable=False
    )  # skip / interested

    swiped_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )