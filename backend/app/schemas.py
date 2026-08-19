from pydantic import BaseModel, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    role: Optional[str] = "Job Seeker"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: Optional[str] = None
    full_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CompanyBase(BaseModel):
    name: str
    logo_url: Optional[str] = None
    website: Optional[str] = None
    location: str
    description: Optional[str] = None
    industry: str


class CompanyResponse(CompanyBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class JobBase(BaseModel):
    title: str
    company_name: Optional[str] = None
    company_logo: Optional[str] = None
    company_type: Optional[str] = None
    salary_min: int
    salary_max: int
    salary: Optional[str] = None
    location: str
    experience_required: int
    skills_required: str
    job_type: str
    description: str
    education: Optional[str] = None
    last_date_to_apply: Optional[datetime] = None
    recruiter_id: Optional[int] = None


class JobResponse(JobBase):
    id: int
    company_id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class JobCreate(JobBase):
    pass


class JobUpdate(JobBase):
    pass


class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    user_id: int
    applicant_name: Optional[str] = None
    resume_url: Optional[str] = None
    matching_score: Optional[int] = None
    status: str
    applied_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SavedJobResponse(BaseModel):
    id: int
    job_id: int
    title: str
    company_id: int
    company_name: str
    saved_at: datetime

    model_config = ConfigDict(from_attributes=True)


from typing import Any, List, Optional

class SwipeRequest(BaseModel):
    job_id: Optional[Any] = None
    jobId: Optional[Any] = None
    action: Optional[str] = None
    direction: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class SaveJobRequest(BaseModel):
    job_id: int


class ProfileUpdateRequest(BaseModel):
    bio: Optional[str] = None
    skills: List[str]
    preferred_location: Optional[str] = None
    experience_years: int


class RecruiterProfileUpdateRequest(BaseModel):
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    company_location: Optional[str] = None
    company_description: Optional[str] = None
    company_logo: Optional[str] = None


class JobSeekerProfileUpdateRequest(BaseModel):
    bio: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    skills: Optional[List[str]] = None
    preferred_location: Optional[str] = None
    resume_url: Optional[str] = None


class ResumeUploadRequest(BaseModel):
    resume_url: str


class UserProfileResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    profile_pic: Optional[str] = None
    bio: Optional[str] = None
    skills: List[str]
    preferred_location: Optional[str] = None
    experience_years: int

    model_config = ConfigDict(from_attributes=True)


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    notification_type: Optional[str] = None
    related_job_id: Optional[int] = None
    related_application_id: Optional[int] = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationCountResponse(BaseModel):
    unread_count: int


class ResumePerformanceResponse(BaseModel):
    skill_coverage_pct: int
    avg_job_match_pct: int
    jobs_matched_count: int
    applications_submitted: int
    shortlisted_count: int
    interviews_count: int
    hired_count: int
    top_matched_skills: List[str]
    missing_high_demand_skills: List[str]
    improvement_suggestions: List[str]


class HighMatchJobResponse(BaseModel):
    id: int
    title: str
    company_name: str
    company_logo: Optional[str] = None
    location: str
    salary: Optional[str] = None
    job_type: str
    match_score: int
    matching_skills: List[str]
    missing_skills: List[str]


class LowCompetitionJobResponse(BaseModel):
    id: int
    title: str
    company_name: str
    location: str
    salary: Optional[str] = None
    job_type: str
    match_score: int
    applicant_count: int
    competition_level: str
