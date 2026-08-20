from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from jose import jwt, JWTError
import models, schemas, auth, database
from fastapi import Body
from pydantic import BaseModel
from typing import List
from database import get_db 
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from typing import Optional # (Ensure this is imported if not already)
# Also ensure your Job model and auth dependencies are imported!
from models import Job  # Or wherever your auth logic lives
from fastapi import File, UploadFile, Form
import PyPDF2
from google import genai
from google.genai import types
from openai import OpenAI
import json
import os
import time
import io
from fastapi.staticfiles import StaticFiles
import shutil
from typing import Optional
 # Add this at the top of main.py


# Configure your Gemini API Key
gemini_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
openai_client = OpenAI(api_key="YOUR_OPENAI_API_KEY")



models.Base.metadata.create_all(bind=database.engine)

def sync_notifications_for_user(user_id: int, db: Session):
    import os
    import PyPDF2
    
    # Fetch job seeker
    seeker = db.query(models.User).filter(models.User.id == user_id).first()
    if not seeker or seeker.role.lower() != "job seeker":
        return

    profile = db.query(models.JobSeekerProfile).filter(models.JobSeekerProfile.user_id == user_id).first()
    
    # Read resume text if exists
    resume_text = ""
    if profile and profile.resume_path and os.path.exists(profile.resume_path):
        try:
            with open(profile.resume_path, "rb") as f:
                pdf_reader = PyPDF2.PdfReader(f)
                for page in pdf_reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        resume_text += extracted.lower() + "\n"
        except Exception as e:
            print(f"Error reading resume for user {user_id}: {e}")
            
    # Fetch all active jobs in the DB
    jobs = db.query(models.Job).all()
    
    # Fetch all applications/swipes for this user
    swipes = db.query(models.Application).filter(models.Application.applicant_id == user_id).all()
    swiped_job_ids = {s.job_id for s in swipes}
    
    # Fetch existing notifications for this user
    existing_notifs = db.query(models.Notification).filter(models.Notification.user_id == user_id).all()
    existing_keys = {(n.job_id, n.notification_type) for n in existing_notifs}
    
    new_notifications = []
    
    for job in jobs:
        if job.id in swiped_job_ids:
            continue
            
        # 1. Startup Job Check
        is_startup = (
            "startup" in job.company.lower() or 
            "startup" in job.description.lower() or 
            any("startup" in t.lower() for t in job.tags)
        )
        
        # 2. More Openings Check (e.g. openings >= 5)
        has_more_openings = job.openings >= 5
        
        # 3. Resume matching check
        matches_more = False
        match_score = 0
        if resume_text:
            job_keywords = set([tag.lower() for tag in job.tags] + job.title.lower().split())
            match_score = sum(1 for kw in job_keywords if kw in resume_text)
            matches_more = match_score >= 3 # Match threshold = 3 keywords overlap
            
        # 4. Less Competition Check
        app_count = db.query(models.Application).filter(
            models.Application.job_id == job.id,
            models.Application.status != "skipped"
        ).count()
        has_less_competition = (app_count < 3) and (match_score >= 1)
        
        if is_startup and (job.id, "startup") not in existing_keys:
            new_notifications.append(
                models.Notification(
                    user_id=user_id,
                    job_id=job.id,
                    message=f"🚀 Startup Opportunity: '{job.title}' at {job.company} is hiring!",
                    notification_type="startup"
                )
            )
            
        if matches_more and (job.id, "match") not in existing_keys:
            new_notifications.append(
                models.Notification(
                    user_id=user_id,
                    job_id=job.id,
                    message=f"🎯 High Resume Match: Your profile matches '{job.title}' at {job.company}!",
                    notification_type="match"
                )
            )
            
        if has_more_openings and (job.id, "openings") not in existing_keys:
            new_notifications.append(
                models.Notification(
                    user_id=user_id,
                    job_id=job.id,
                    message=f"🔥 High Openings: '{job.title}' at {job.company} has {job.openings} open positions!",
                    notification_type="openings"
                )
            )
            
        if has_less_competition and (job.id, "competition") not in existing_keys:
            new_notifications.append(
                models.Notification(
                    user_id=user_id,
                    job_id=job.id,
                    message=f"⚡ Low Competition: '{job.title}' at {job.company} has less competition ({app_count} applicant{'s' if app_count != 1 else ''} so far). Apply now!",
                    notification_type="competition"
                )
            )
            
    if new_notifications:
        db.add_all(new_notifications)
        db.commit()

def sync_notifications_for_all_seekers(db: Session):
    seekers = db.query(models.User).filter(models.User.role.lower() == "job seeker").all()
    for seeker in seekers:
        try:
            sync_notifications_for_user(seeker.id, db)
        except Exception as e:
            print(f"Error syncing notifications for seeker {seeker.id}: {e}")




app = FastAPI()

# 2. MOUNT STATIC FILES FOR RESUMES
os.makedirs("uploads/resumes", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to extract and verify the token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Enforce role validation
    if user.role not in ["job seeker", "recruiter"]:
        raise HTTPException(status_code=400, detail="Invalid role selected")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email, 
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = auth.create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# Existing login route remains exactly the same...
@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    # ... (Keep your existing login code here) ...
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# NEW ROUTE: Fetch the current logged-in user
@app.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user




@app.post("/jobs/ats-score")
async def get_ats_score(
    job_description: str = Form(...),
    resume_pdf: Optional[UploadFile] = File(None), # Made optional!
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        resume_text = ""
        
        # 1. Check if user uploaded a NEW file right now
        if resume_pdf:
            pdf_bytes = await resume_pdf.read()
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted:
                    resume_text += extracted + "\n"
                    
        # 2. If no new file, grab the default resume from their Profile
        else:
            profile = db.query(models.JobSeekerProfile).filter(models.JobSeekerProfile.user_id == current_user.id).first()
            if not profile or not profile.resume_path or not os.path.exists(profile.resume_path):
                raise HTTPException(status_code=400, detail="No saved resume found. Please upload one in your profile or attach a file.")
            
            with open(profile.resume_path, "rb") as f:
                pdf_reader = PyPDF2.PdfReader(f)
                for page in pdf_reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        resume_text += extracted + "\n"

        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Unable to extract readable text from PDF.")
        # 2. Build Standard Prompt
        prompt = f"""
        You are an advanced Applicant Tracking System (ATS).
        Compare the following candidate resume against the provided job description.

        Job Description:
        {job_description}

        Resume Content:
        {resume_text}

        Return ONLY a JSON object with this exact structure:
        {{
            "score": <number between 0 and 100 representing match percentage>,
            "matched": [<array of key skills/keywords present in both resume and JD>],
            "missing": [<array of key skills/keywords from JD missing in resume>]
        }}
        """

        # 3. PRIMARY PIPELINE: Gemini API (2 Attempts)
        for attempt in range(2):
            try:
                response = gemini_client.models.generate_content(
                    model='gemini-3.5-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json"
                    )
                )
                return json.loads(response.text)
            except Exception as e:
                print(f"Gemini attempt {attempt + 1} failed: {str(e)}")
                if attempt == 0:
                    await asyncio.sleep(2) # Pause 2 seconds before second attempt

        # 4. FALLBACK PIPELINE: OpenAI API (2 Attempts)
        for attempt in range(2):
            try:
                response = openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are a specialized ATS analyzer outputting raw JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.2
                )
                return json.loads(response.choices[0].message.content)
            except Exception as e:
                print(f"OpenAI attempt {attempt + 1} failed: {str(e)}")
                if attempt == 0:
                    await asyncio.sleep(2)

        # 5. TOTAL FAILURE: Catch-all Error Handling
        # If we reach this line, all 4 attempts (2 Gemini, 2 OpenAI) have completely failed
        raise HTTPException(
            status_code=503, 
            detail="AI models are currently experiencing extremely high demand. Please try again in a few moments."
        )

    except HTTPException as http_ex:
        # Properly pass 400 and 503 exceptions to React
        raise http_ex
    except Exception as e:
        # Fallback for completely unexpected non-LLM crashes (e.g., PyPDF2 breaking)
        print(f"Server Error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="An unexpected server error occurred. Please check your document and try again."
        )



@app.get("/jobs/matched")
def get_matched_jobs(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role.lower() != "job seeker":
        raise HTTPException(status_code=403, detail="Unauthorized")

    profile = db.query(models.JobSeekerProfile).filter(models.JobSeekerProfile.user_id == current_user.id).first()
    if not profile or not profile.resume_path or not os.path.exists(profile.resume_path):
        raise HTTPException(status_code=400, detail="Please upload a resume to your profile to see matched jobs.")

    # 1. Read the saved resume text
    resume_text = ""
    try:
        with open(profile.resume_path, "rb") as f:
            pdf_reader = PyPDF2.PdfReader(f)
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted: resume_text += extracted.lower() + "\n"
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to read profile resume.")

    # 2. Fetch jobs and user status
    all_jobs = db.query(models.Job).all()
    user_apps = db.query(models.Application).filter(models.Application.applicant_id == current_user.id).all()
    app_status_map = {app.job_id: app.status for app in user_apps}

    scored_jobs = []
    
    # 3. Score each job against the resume text
    for job in all_jobs:
        # Create a pool of keywords for the job (tags + title words)
        job_keywords = set([tag.lower() for tag in job.tags] + job.title.lower().split())
        
        # Count how many of those keywords exist in the resume
        match_score = sum(1 for kw in job_keywords if kw in resume_text)
        current_status = app_status_map.get(job.id, "none")
        app = next((a for a in user_apps if a.job_id == job.id), None)
        verdict = app.verdict if app else None

        # Only include it if there is at least some overlap
        if match_score > 0:
            scored_jobs.append({
                "id": job.id, 
                "title": job.title, 
                "company": job.company, 
                "location": job.location, 
                "salary": job.salary,
                "description": job.description,
                "tags": job.tags,
                "application_status": current_status,
                "verdict": verdict,
                "match_score": match_score 
            })

    # Sort the list so the highest matched jobs appear first
    scored_jobs.sort(key=lambda x: x["match_score"], reverse=True)
    return scored_jobs



        
@app.post("/profile/job-seeker")
def update_job_seeker_profile(profile_data: schemas.JobSeekerUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    if current_user.role.lower() != "job seeker":
        raise HTTPException(status_code=403, detail="Only job seekers can access this endpoint")
    
    if profile_data.full_name: current_user.full_name = profile_data.full_name
    if profile_data.email: current_user.email = profile_data.email
    
    profile = db.query(models.JobSeekerProfile).filter(models.JobSeekerProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.JobSeekerProfile(user_id=current_user.id)
        db.add(profile)
    
    profile.education = profile_data.education
    profile.achievements = profile_data.achievements
    profile.skills = profile_data.skills
    profile.portfolio_url = profile_data.portfolio_url
    
    db.commit()
    return {"message": "Job Seeker profile updated successfully"}

@app.post("/profile/job-seeker/resume")
async def upload_job_seeker_resume(
    resume_pdf: UploadFile = File(...), 
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(database.get_db)
):
    if current_user.role.lower() != "job seeker":
        raise HTTPException(status_code=403, detail="Only job seekers can upload resumes")
        
    if not resume_pdf.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Fetch the profile first to check for existing resumes
    profile = db.query(models.JobSeekerProfile).filter(models.JobSeekerProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.JobSeekerProfile(user_id=current_user.id)
        db.add(profile)
        
    # --- NEW: Delete the old resume from the server to save space ---
    if profile.resume_path and os.path.exists(profile.resume_path):
        try:
            os.remove(profile.resume_path)
        except Exception as e:
            print(f"Error removing old resume: {e}")

    # --- NEW: Standardize filename so it overwrites naturally ---
    file_location = f"uploads/resumes/user_{current_user.id}_resume.pdf"
    
    # Securely save the new file
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(resume_pdf.file, file_object)
        
    profile.resume_path = file_location
    db.commit()
    try:
        sync_notifications_for_user(current_user.id, db)
    except Exception as e:
        print(f"Error triggering resume sync: {e}")
    
    # Format path cleanly for URLs (handles Windows backslashes)
    clean_path = file_location.replace("\\", "/")
    return {"message": "Resume uploaded successfully", "resume_url": f"http://localhost:8000/{clean_path}"}




@app.post("/profile/recruiter")
def update_recruiter_profile(profile_data: schemas.RecruiterUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    # Make role check case-insensitive
    if current_user.role.lower() != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can access this endpoint")
    
    # Update core user details
    if profile_data.full_name: current_user.full_name = profile_data.full_name
    if profile_data.email: current_user.email = profile_data.email
    
    profile = db.query(models.RecruiterProfile).filter(models.RecruiterProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.RecruiterProfile(user_id=current_user.id)
        db.add(profile)
    
    profile.company_name = profile_data.company_name
    profile.designation = profile_data.designation
    profile.company_website = profile_data.company_website
    
    db.commit()
    return {"message": "Recruiter profile updated successfully"}



# --- Schemas for Job Feed ---
class JobCard(BaseModel):
    id: int
    title: str
    company: str
    location: str
    salary: str
    description: str
    tags: List[str]

class SwipeAction(BaseModel):
    job_id: int
    action: str # "right" (save/apply) or "left" (skip)



class JobCreate(BaseModel):  # Must inherit from BaseModel!
    title: str
    company: str
    location: str
    salary: str | None = None
    description: str
    tags: list[str] = []
# --- Mock Database for Jobs ---
# In production, recruiters will POST these to the database.


class JobResponse(BaseModel):
    id: int
    title: str
    company: str
    location: str
    salary: str | None = None
    description: str
    tags: list[str] = []

    # If you are using Pydantic v2 (most likely):
    model_config = {"from_attributes": True}
    # If you are using older Pydantic v1, use this instead:
    # class Config:
    #     orm_mode = True
MOCK_JOBS = [
    {
        "id": 1, "title": "Senior Frontend Developer", "company": "TechNova",
        "location": "Remote", "salary": "$120k - $150k",
        "description": "Looking for a React expert to build next-gen UI components with a focus on performance and accessibility.",
        "tags": ["React", "TypeScript", "Tailwind"]
    },
    {
        "id": 2, "title": "Backend Systems Engineer", "company": "DataFlow Systems",
        "location": "New York, NY", "salary": "$130k - $160k",
        "description": "Join our core team optimizing database architectures and scaling high-throughput FastAPI microservices.",
        "tags": ["Python", "FastAPI", "PostgreSQL"]
    },
    {
        "id": 3, "title": "Full Stack Developer", "company": "Inversion AI",
        "location": "San Francisco, CA", "salary": "$140k - $175k",
        "description": "End-to-end product development integrating deep learning models into consumer-facing web applications.",
        "tags": ["Node.js", "React", "Machine Learning"]
    }
]

# --- Endpoints ---
# 1. THE FEED ROUTE
# 1. THE FEED ROUTE (Updated with Search & Filters)
# 1. THE FEED ROUTE (Updated with Extended Filters)
@app.get("/jobs/feed")
def get_job_feed(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role.lower() != "job seeker":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")
        
    all_jobs = db.query(models.Job).all()
    
    # 1. Fetch all previous interactions (applications, saves, skips) for THIS specific user
    user_apps = db.query(models.Application).filter(models.Application.applicant_id == current_user.id).all()
    app_status_map = {app.job_id: app.status for app in user_apps}
    
    # Filter out jobs that the user has already swiped on (applied, skipped, applied_and_saved)
    filtered_jobs = []
    for job in all_jobs:
        status = app_status_map.get(job.id, "none")
        if status not in ["applied", "applied_and_saved", "skipped"]:
            filtered_jobs.append(job)
            
    # 2. Extract profile details of Liked & Disliked jobs to build the profile
    liked_jobs = [db.query(models.Job).filter(models.Job.id == app.job_id).first() for app in user_apps if app.status in ["applied", "saved", "applied_and_saved"]]
    disliked_jobs = [db.query(models.Job).filter(models.Job.id == app.job_id).first() for app in user_apps if app.status == "skipped"]
    
    liked_tags = set()
    liked_titles = set()
    liked_companies = set()
    for j in liked_jobs:
        if j:
            if j.tags:
                liked_tags.update(t.lower() for t in j.tags)
            if j.title:
                liked_titles.update(w.lower() for w in j.title.split())
            if j.company:
                liked_companies.add(j.company.lower())
                
    disliked_tags = set()
    disliked_titles = set()
    for j in disliked_jobs:
        if j:
            if j.tags:
                disliked_tags.update(t.lower() for t in j.tags)
            if j.title:
                disliked_titles.update(w.lower() for w in j.title.split())

    formatted_jobs = []
    for job in filtered_jobs:
        current_status = app_status_map.get(job.id, "none")
        
        # Calculate recommendation score
        score = 0.0
        
        # Liked factors
        if job.tags:
            score += sum(2.5 for t in job.tags if t.lower() in liked_tags)
        if job.title:
            score += sum(1.5 for w in job.title.split() if w.lower() in liked_titles)
        if job.company and job.company.lower() in liked_companies:
            score += 3.0
            
        # Disliked factors
        if job.tags:
            score -= sum(1.0 for t in job.tags if t.lower() in disliked_tags)
        if job.title:
            score -= sum(0.5 for w in job.title.split() if w.lower() in disliked_titles)
            
        # Normalize score into a compatibility percentage between 50% and 99%
        compatibility_score = 75.0 + (score * 5.0)
        compatibility_score = max(50.0, min(99.0, compatibility_score))
        
        app = next((a for a in user_apps if a.job_id == job.id), None)
        verdict = app.verdict if app else None

        formatted_jobs.append({
            "id": job.id, 
            "title": job.title, 
            "company": job.company, 
            "location": job.location, 
            "salary": job.salary,
            "description": job.description,
            "tags": job.tags,
            "openings": job.openings,
            "contact": job.contact,
            "work_type": job.work_type,
            "duration": job.duration,
            "work_mode": job.work_mode,
            "experience": job.experience,
            "application_status": current_status,
            "verdict": verdict,
            "rec_score": round(compatibility_score)
        })
        
    # Sort feed: highest recommendation score first
    formatted_jobs.sort(key=lambda x: x["rec_score"], reverse=True)
    
    return formatted_jobs





# 2. THE SWIPE ROUTE
# 1. THE SWIPE ROUTE (Updated State Machine)
@app.post("/jobs/swipe")
def record_swipe(
    swipe: SwipeAction, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    target_status = "pending"
    if swipe.action == "right": target_status = "applied"
    elif swipe.action == "save": target_status = "saved"
    elif swipe.action == "left": target_status = "skipped"

    existing_app = db.query(models.Application).filter(
        models.Application.job_id == swipe.job_id,
        models.Application.applicant_id == current_user.id
    ).first()

    if existing_app:
        # Handle the combined status
        if existing_app.status == "applied_and_saved":
            if target_status == "applied": return {"message": "Job already applied"}
            elif target_status == "saved": return {"message": "Job already saved"}
            elif target_status == "skipped": return {"message": "Job kept in your pipeline."}
            
        # Handle currently Applied
        elif existing_app.status == "applied":
            if target_status == "applied": return {"message": "Job already applied"}
            elif target_status == "saved": existing_app.status = "applied_and_saved" # Upgrade it!
            elif target_status == "skipped": return {"message": "Job kept in applied jobs."}
            
        # Handle currently Saved
        elif existing_app.status == "saved":
            if target_status == "saved": return {"message": "Job already saved"}
            elif target_status == "applied": existing_app.status = "applied_and_saved" # Upgrade it!
            elif target_status == "skipped": return {"message": "Job kept in saved jobs."}
            
        # Handle currently Skipped
        elif existing_app.status == "skipped":
            existing_app.status = target_status
    else:
        new_app = models.Application(
            job_id=swipe.job_id,
            applicant_id=current_user.id,
            status=target_status
        )
        db.add(new_app)
    
    db.commit()
    return {"message": "Success"}

@app.put("/jobs/{job_id}", status_code=status.HTTP_200_OK)
def update_job(job_id: int, job_update: schemas.JobCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role.lower() != "recruiter":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")

    # Find the job and ensure it belongs to the current recruiter
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.recruiter_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found or unauthorized")

    # Update fields
    job.title = job_update.title
    job.company = job_update.company
    job.location = job_update.location
    job.salary = job_update.salary
    job.description = job_update.description
    job.tags = job_update.tags 
    job.openings = job_update.openings
    job.contact = job_update.contact
    job.work_type = job_update.work_type
    job.duration = job_update.duration
    job.work_mode = job_update.work_mode
    job.experience = job_update.experience

    db.commit()
    db.refresh(job)
    return {"message": "Job updated successfully", "job_id": job.id}


@app.delete("/jobs/{job_id}", status_code=status.HTTP_200_OK)
def delete_job(job_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role.lower() != "recruiter":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")

    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.recruiter_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found or unauthorized")

    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}



@app.post("/jobs", status_code=status.HTTP_201_CREATED)
def create_job(job: schemas.JobCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role.lower() != "recruiter":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")
        
    new_job = models.Job(
        title=job.title,
        company=job.company,
        location=job.location,
        salary=job.salary,
        description=job.description,
        tags=job.tags, 
        openings=job.openings,           # <--- NEW
        contact=job.contact,             # <--- NEW
        work_type=job.work_type,         # <--- NEW
        duration=job.duration,           # <--- NEW
        work_mode=job.work_mode,         # <--- NEW
        experience=job.experience,       # <--- NEW
        recruiter_id=current_user.id 
    )
    
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    try:
        sync_notifications_for_all_seekers(db)
    except Exception as e:
        print(f"Error triggering background sync: {e}")
    return {"message": "Job posted successfully", "job_id": new_job.id}



# 1. Job Seeker Action: Apply for a job
@app.post("/jobs/{job_id}/apply")
def apply_to_job(
    job_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # Check if already applied to avoid duplicates
    existing_application = db.query(models.Application).filter(
        models.Application.job_id == job_id,
        models.Application.applicant_id == current_user.id
    ).first()

    if not existing_application:
        new_application = models.Application(
            job_id=job_id,
            applicant_id=current_user.id,
            status="applied" # Or "saved" depending on the action
        )
        db.add(new_application)
        db.commit()
    
    return {"message": "Successfully applied"}


# 2. Recruiter Action: View applicants for a specific job
# 2. Recruiter Action: View applicants for a specific job
@app.get("/jobs/{job_id}/applicants", response_model=List[schemas.ApplicantDetail])
def get_job_applicants(job_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.recruiter_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or unauthorized")
    
    # 🐛 THE FIX: Filter applications by status to exclude "skipped" or "saved"
    applications = db.query(models.Application).filter(
        models.Application.job_id == job_id,
        models.Application.status.in_(["applied", "pending", "applied_and_saved"])
    ).all()
    
    if not applications:
        return []
        
    applicant_details = []
    for app in applications:
        seeker = db.query(models.User).filter(models.User.id == app.applicant_id).first()
        
        # PULL THE JOB SEEKER PROFILE
        profile = db.query(models.JobSeekerProfile).filter(models.JobSeekerProfile.user_id == app.applicant_id).first()
        
        # Safely format the resume URL (fixes Windows backslash issues)
        resume_link = None
        if profile and profile.resume_path:
            clean_path = profile.resume_path.replace("\\", "/") # Convert Windows paths to web paths
            resume_link = f"http://localhost:8000/{clean_path}"

        applicant_details.append({
            "application_id": app.id,
            "applicant_name": seeker.full_name if seeker else "Unknown",
            "applicant_email": seeker.email if seeker else "Unknown",
            "status": app.status if hasattr(app, "status") else "Applied",
            "verdict": app.verdict if hasattr(app, "verdict") and app.verdict is not None else "to be reviewed",
            "applied_at": app.applied_at if hasattr(app, "applied_at") else None,
            
            # ATTACH THE ACTUAL PROFILE DATA TO THE RESPONSE
            "education": profile.education if profile and profile.education else [],
            "skills": profile.skills if profile else "",
            "achievements": profile.achievements if profile and profile.achievements else [],
            "resume_url": resume_link,
            "portfolio_url": profile.portfolio_url if profile else None
        })

    return applicant_details






@app.get("/jobs/posted")
def get_posted_jobs(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # Ensure only recruiters can access this
    if current_user.role.lower() != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can view posted jobs")
    
    # Query the database for jobs matching this recruiter's ID
    posted_jobs = db.query(models.Job).filter(models.Job.recruiter_id == current_user.id).all()
    
    results = []
    for job in posted_jobs:
        app_count = db.query(models.Application).filter(
            models.Application.job_id == job.id,
            models.Application.status.in_(["applied", "pending", "applied_and_saved"])
        ).count()
        
        accepted_count = db.query(models.Application).filter(
            models.Application.job_id == job.id,
            models.Application.verdict == "accepted"
        ).count()

        results.append({
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "salary": job.salary,
            "description": job.description,
            "tags": job.tags,
            "openings": job.openings,
            "contact": job.contact,
            "work_type": job.work_type,
            "duration": job.duration,
            "work_mode": job.work_mode,
            "experience": job.experience,
            "application_count": app_count,
            "accepted_count": accepted_count
        })
        
    return results



@app.get("/my-applications")
def get_my_applications(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # Join the Application table with the Job table to get job details
    applied_jobs = db.query(models.Job).join(models.Application).filter(
        models.Application.user_id == current_user.id,
        models.Application.status == "applied"
    ).all()
    
    # Format for React
    return [{"id": job.id, "title": job.title, "company": job.company} for job in applied_jobs]


# 3. GET APPLIED JOBS
# 2. GET APPLIED JOBS (Updated to return the status string)
# Update your existing get_applied_jobs route in main.py
@app.get("/jobs/applied")
def get_applied_jobs(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # ADD models.Application.verdict to the query
    results = db.query(models.Job, models.Application.status, models.Application.verdict).join(
        models.Application, models.Job.id == models.Application.job_id
    ).filter(
        models.Application.applicant_id == current_user.id,
        models.Application.status.in_(["applied", "pending", "applied_and_saved"])
    ).all()
    
    # Map the verdict into the returned dictionary
    return [{"id": job.id, "title": job.title, "company": job.company, "location": job.location, "salary": job.salary, "status": status, "verdict": verdict if verdict is not None else "to be reviewed"} for job, status, verdict in results]
@app.get("/jobs/saved")
def get_saved_jobs(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    results = db.query(models.Job, models.Application.status, models.Application.verdict).join(
        models.Application, models.Job.id == models.Application.job_id
    ).filter(
        models.Application.applicant_id == current_user.id,
        models.Application.status.in_(["saved", "applied_and_saved"])
    ).all()
    
    return [{"id": job.id, "title": job.title, "company": job.company, "location": job.location, "salary": job.salary, "status": status, "verdict": verdict if verdict is not None else "to be reviewed"} for job, status, verdict in results]

# 5. REMOVE SAVED JOB
@app.delete("/jobs/{job_id}/save")
def remove_saved_job(job_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    app = db.query(models.Application).filter(
        models.Application.job_id == job_id,
        models.Application.applicant_id == current_user.id,
        models.Application.status.in_(["saved", "applied_and_saved"])
    ).first()
    
    if app:
        if app.status == "applied_and_saved":
            app.status = "applied" # Just downgrade it, don't delete!
        else:
            db.delete(app)
        db.commit()
    return {"message": "Saved job removed"}

# 5. WITHDRAW APPLICATION (Downgrade instead of delete if saved)
@app.delete("/jobs/{job_id}/apply")
def withdraw_application(job_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    app = db.query(models.Application).filter(
        models.Application.job_id == job_id,
        models.Application.applicant_id == current_user.id,
        models.Application.status.in_(["applied", "pending", "applied_and_saved"])
    ).first()
    
    if app:
        if app.status == "applied_and_saved":
            app.status = "saved" # Just downgrade it, don't delete!
        else:
            db.delete(app)
        db.commit()
    return {"message": "Application withdrawn"}


class VerdictUpdate(BaseModel):
    verdict: str

@app.put("/applications/{application_id}/verdict")
def update_application_verdict(
    application_id: int, 
    verdict_update: VerdictUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role.lower() != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can update verdicts")
    
    application = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
        
    job = db.query(models.Job).filter(
        models.Job.id == application.job_id, 
        models.Job.recruiter_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(status_code=403, detail="Not authorized to update this application")
        
    if verdict_update.verdict not in ["accepted", "rejected", "to be reviewed"]:
        raise HTTPException(status_code=400, detail="Invalid verdict value")
        
    application.verdict = verdict_update.verdict
    
    # Create notification for job seeker
    if verdict_update.verdict in ["accepted", "rejected"]:
        verdict_text = "accepted" if verdict_update.verdict == "accepted" else "rejected"
        msg = f"Your application for the '{job.title}' role at '{job.company}' has been {verdict_text}."
        
        # Check if notification already exists to keep it idempotent
        existing_notif = db.query(models.Notification).filter(
            models.Notification.user_id == application.applicant_id,
            models.Notification.job_id == job.id,
            models.Notification.message == msg
        ).first()
        
        if not existing_notif:
            new_notif = models.Notification(
                user_id=application.applicant_id,
                job_id=job.id,
                message=msg,
                notification_type="verdict",
                is_read=False
            )
            db.add(new_notif)

    db.commit()
    return {"message": f"Verdict updated to {verdict_update.verdict}"}

# --- NOTIFICATIONS ENDPOINTS ---

@app.get("/notifications", response_model=List[schemas.NotificationResponse])
def get_notifications(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role.lower() != "job seeker":
        raise HTTPException(status_code=403, detail="Only job seekers can fetch notifications")
    
    # Sync first to ensure new jobs / competition / match statuses are processed
    sync_notifications_for_user(current_user.id, db)
    
    notifications = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(models.Notification.created_at.desc()).all()
    
    return notifications

@app.get("/jobs/{job_id}", response_model=schemas.JobCreate)
def get_job_details(job_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    # Return the job details - we format to match the Job schema returned
    return {
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "salary": job.salary,
        "description": job.description,
        "tags": job.tags,
        "openings": job.openings,
        "contact": job.contact,
        "work_type": job.work_type,
        "duration": job.duration,
        "work_mode": job.work_mode,
        "experience": job.experience
    }

@app.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int, 
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}

@app.put("/notifications/read-all")
def mark_all_notifications_read(
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role.lower() != "job seeker":
        raise HTTPException(status_code=403, detail="Only job seekers can modify notifications")
        
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).update({models.Notification.is_read: True}, synchronize_session=False)
    
    db.commit()
    return {"message": "All notifications marked as read"}

@app.delete("/notifications/{notification_id}")
def delete_notification(
    notification_id: int, 
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    db.delete(notification)
    db.commit()
    return {"message": "Notification deleted"}