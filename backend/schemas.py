from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class ApplicantDetail(BaseModel):
    application_id: int
    status: str
    verdict: str = "to be reviewed" 
    applied_at: datetime
    applicant_name: str
    applicant_email: str
    
    # NEW FIELDS FOR RECRUITER
    education: Optional[List[Dict[str, Any]]] = []
    skills: Optional[str] = ""
    achievements: Optional[List[str]] = []
    resume_url: Optional[str] = None
    portfolio_url: Optional[str] = None

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str

    class Config:
        from_attributes = True # Allows Pydantic to read SQLAlchemy models

class Token(BaseModel):
    access_token: str
    token_type: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str

# 1. Update JobSeekerUpdate to accept lists
class JobSeekerUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    education: Optional[List[Dict[str, Any]]] = []
    skills: Optional[str] = None
    portfolio_url: Optional[str] = None
    achievements: Optional[List[str]] = []

class RecruiterUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    company_name: Optional[str] = None
    designation: Optional[str] = None
    company_website: Optional[str] = None

# --- Nested Profile Responses for /me ---
class JobSeekerProfileBase(BaseModel):
    # CHANGED: These now expect lists/JSON arrays instead of strings
    education: Optional[List[Dict[str, Any]]] = []
    achievements: Optional[List[str]] = []
    
    # Kept as strings
    skills: Optional[str] = None
    portfolio_url: Optional[str] = None
    resume_path: Optional[str] = None 

    class Config:
        from_attributes = True


class RecruiterProfileBase(BaseModel):
    company_name: Optional[str] = None
    designation: Optional[str] = None
    company_website: Optional[str] = None
    class Config:
        from_attributes = True

# --- Updated User Response ---
class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    # Automatically attach the relational profile data
    job_seeker_profile: Optional[JobSeekerProfileBase] = None
    recruiter_profile: Optional[RecruiterProfileBase] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class JobCreate(BaseModel):
    title: str
    company: str
    location: str
    salary: Optional[str] = ""
    description: str
    tags: List[str] = []
    
    # NEW FIELDS
    openings: int = 1
    contact: Optional[str] = None
    work_type: str = "Full-time"
    duration: Optional[str] = None
    work_mode: str = "On Location"
    experience: Optional[str] = None

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    job_id: Optional[int] = None
    message: str
    notification_type: str
    created_at: datetime
    is_read: bool

    class Config:
        from_attributes = True