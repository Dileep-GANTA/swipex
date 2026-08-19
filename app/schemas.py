from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str

class UserLogin(BaseModel):
    email: str
    password: str

from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str


class UserLogin(BaseModel):
    email: str
    password: str


# -------------------------
# Job Schemas
# -------------------------

class JobCreate(BaseModel):
    title: str
    company: str
    location: str
    salary: str
    experience: str
    job_type: str
    category: str
    skills: str
    description: str
    logo: str


class JobResponse(JobCreate):
    id: int

    class Config:
        from_attributes = True


# -------------------------
# Milestone 4 Schemas
# -------------------------

from datetime import datetime
from typing import Optional, List


class ApplicationCreate(BaseModel):
    job_id: int
    match_percentage: Optional[int] = 0


class ApplicationStatusUpdate(BaseModel):
    status: str  # applied | shortlisted | rejected | selected


class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    user_id: int
    status: str
    match_percentage: int
    applied_at: datetime

    # convenience fields joined in from the related Job / User
    job_title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    skills: Optional[str] = None
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None

    class Config:
        from_attributes = True


class SavedJobCreate(BaseModel):
    job_id: int


class SavedJobResponse(BaseModel):
    id: int
    job_id: int
    saved_at: datetime

    class Config:
        from_attributes = True


class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    job_id: Optional[int] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ResumeScoreEntry(BaseModel):
    ats_score: int
    created_at: datetime

    class Config:
        from_attributes = True

class CandidateProfileResponse(BaseModel):

    id: int
    name: str
    email: str
    role: str

    resume_text: Optional[str] = None

    application_id: int
    job_id: int
    status: str
    match_percentage: int
    applied_at: datetime

    job_title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    experience: Optional[str] = None
    job_type: Optional[str] = None
    category: Optional[str] = None
    skills: Optional[str] = None

    class Config:
        from_attributes = True