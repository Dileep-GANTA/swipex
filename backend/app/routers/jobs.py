import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy import or_, func
from sqlalchemy.orm import Session
from typing import List, Optional
from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api", tags=["SwipeX Core Engine"])
UPLOAD_DIR = "static/profile_pics"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/jobs/", response_model=List[schemas.JobResponse])
@router.get("/jobs", response_model=List[schemas.JobResponse])
def get_all_jobs(
    search: Optional[str] = None,
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    company_type: Optional[str] = None,
    fresher_friendly: Optional[bool] = None,
    experience_level: Optional[int] = None,
    low_competition: Optional[bool] = None,
    min_salary: Optional[int] = None,
    max_salary: Optional[int] = None,
    skills: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Job).filter(models.Job.is_active == True)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Job.title.ilike(search_term),
                models.Job.company_name.ilike(search_term),
                models.Job.description.ilike(search_term),
                models.Job.location.ilike(search_term)
            )
        )
    if location:
        query = query.filter(models.Job.location.ilike(f"%{location}%"))
    if job_type:
        query = query.filter(models.Job.job_type.ilike(f"%{job_type}%"))
    if company_type and company_type.strip().lower() not in {"all", ""}:
        query = query.filter(models.Job.company_type.ilike(f"%{company_type.strip()}%"))
    if fresher_friendly:
        query = query.filter(models.Job.experience_required <= 1)
    if experience_level is not None:
        query = query.filter(models.Job.experience_required <= experience_level)
    if min_salary is not None:
        query = query.filter(models.Job.salary_max >= min_salary)
    if max_salary is not None:
        query = query.filter(models.Job.salary_min <= max_salary)
    if skills:
        for skill in [s.strip() for s in skills.split(',') if s.strip()]:
            query = query.filter(models.Job.skills_required.ilike(f"%{skill}%"))

    jobs = query.order_by(models.Job.created_at.desc()).all()

    if low_competition:
        filtered = []
        for j in jobs:
            app_count = db.query(models.Application).filter(models.Application.job_id == j.id).count()
            if app_count <= 3:
                filtered.append(j)
        return filtered

    return jobs


@router.get("/jobs/{job_id}", response_model=schemas.JobResponse)
def get_job_details(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.is_active == True).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/company/", response_model=List[schemas.CompanyResponse])
@router.get("/company", response_model=List[schemas.CompanyResponse])
def get_companies(db: Session = Depends(get_db)):
    return db.query(models.Company).all()


@router.get("/company/{company_id}", response_model=schemas.CompanyResponse)
def get_company(company_id: int, db: Session = Depends(get_db)):
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company
