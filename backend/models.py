from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import DateTime
from sqlalchemy.sql import func
from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, Boolean
from sqlalchemy import UniqueConstraint
# Ensure your declarative base is imported here, usually:
# from database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, nullable=False)
    salary = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    tags = Column(JSON, default=[])
    recruiter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # NEW COLUMNS FOR EXTENDED JOB DETAILS
    openings = Column(Integer, default=1)
    contact = Column(String, nullable=True)
    work_type = Column(String, default="Full-time") # Full-time, Part-time, Internship
    duration = Column(String, nullable=True) # E.g., "6 Months" for internships
    work_mode = Column(String, default="On Location") # WFH, On Location, Hybrid
    experience = Column(String, nullable=True) # E.g., "0-2 years"

    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String)

    # Establish relationships to the new profile tables
    job_seeker_profile = relationship("JobSeekerProfile", back_populates="user", uselist=False)
    recruiter_profile = relationship("RecruiterProfile", back_populates="user", uselist=False)
    applications = relationship("Application", back_populates="applicant", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class JobSeekerProfile(Base):
    __tablename__ = "job_seeker_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # CHANGED: Now using JSON to store arrays of data
    education = Column(JSON, default=[]) 
    skills = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    resume_path = Column(String, nullable=True) 
    
    # NEW: Store an array of achievements
    achievements = Column(JSON, default=[])

    user = relationship("User", back_populates="job_seeker_profile")
class RecruiterProfile(Base):
    __tablename__ = "recruiter_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    company_name = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    company_website = Column(String, nullable=True)

    user = relationship("User", back_populates="recruiter_profile")


    # --- Add this new model at the bottom ---
class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    applicant_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # Note: To be ultra space-optimal in PostgreSQL, you could change this String 
    # to an Enum or Integer in the future, but a UniqueConstraint is the most critical step right now.
    status = Column(String, default="pending") 
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    verdict = Column(String, default="to be reviewed")
    job = relationship("Job", back_populates="applications")
    applicant = relationship("User", back_populates="applications")

    # ADD THIS: Forces PostgreSQL to reject any duplicate interactions, saving space.
    __table_args__ = (
        UniqueConstraint("job_id", "applicant_id", name="uix_one_interaction_per_user"),
    )

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    message = Column(Text, nullable=False)
    notification_type = Column(String, nullable=False) # e.g. "startup", "match", "openings", "competition"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_read = Column(Boolean, default=False)

    user = relationship("User", back_populates="notifications")
    job = relationship("Job")