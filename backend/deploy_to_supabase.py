import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone

from app.models import Base, User, RecruiterProfile, JobSeekerProfile, Company, Job, SavedJob, SwipeHistory, Application, Notification
from app.routers.auth import hash_password

def deploy_supabase(supabase_db_url: str):
    print("=" * 80)
    print(f"INITIALIZING & SEEDING SUPABASE POSTGRESQL DATABASE...")
    print("=" * 80)

    # 1. Connect to Supabase
    engine = create_engine(supabase_db_url, pool_pre_ping=True)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    print("✓ Successfully connected to Supabase PostgreSQL!")

    # 2. Seed Recruiter 1: Harshitha
    harshitha = db.query(User).filter(User.email.ilike("harshitha07@gmail.com")).first()
    if not harshitha:
        harshitha = User(
            username="harshitha07",
            email="harshitha07@gmail.com",
            hashed_password=hash_password("harshi"),
            full_name="Harshitha",
            role="Recruiter",
            created_at=datetime.now(timezone.utc)
        )
        db.add(harshitha)
        db.flush()
        db.add(RecruiterProfile(user_id=harshitha.id, company_name="Harshitha Enterprise", company_location="Bangalore", company_description="Tech Hiring"))
        print("✓ Created Recruiter: harshitha07@gmail.com")

    # Seed Recruiter 2: Vighnesh Vikki
    vighnesh = db.query(User).filter(User.email.ilike("vighneshvikki567@gmail.com")).first()
    if not vighnesh:
        vighnesh = User(
            username="vighneshvikki567",
            email="vighneshvikki567@gmail.com",
            hashed_password=hash_password("vikki"),
            full_name="Vignesh Vikki",
            role="Recruiter",
            created_at=datetime.now(timezone.utc)
        )
        db.add(vighnesh)
        db.flush()
        db.add(RecruiterProfile(user_id=vighnesh.id, company_name="Vignesh Vikki Enterprise", company_location="Remote", company_description="Global Tech Recruiter"))
        print("✓ Created Recruiter: vighneshvikki567@gmail.com")

    # Seed Candidate: Hema Perumal
    hema = db.query(User).filter(User.email.ilike("perumalhema600@gmail.com")).first()
    if not hema:
        hema = User(
            username="perumalhema600",
            email="perumalhema600@gmail.com",
            hashed_password=hash_password("bfe3"),
            full_name="Hema Perumal",
            phone_number="9347045871",
            role="Job Seeker",
            skills="Python, React, SQL, Data Engineering, FastAPI",
            experience_years=2,
            created_at=datetime.now(timezone.utc)
        )
        db.add(hema)
        db.flush()
        db.add(JobSeekerProfile(user_id=hema.id, education="B.Tech CS", experience="2 Yrs Experience", skills="Python, React, SQL", preferred_location="Remote"))
        print("✓ Created Candidate: perumalhema600@gmail.com")

    db.commit()

    # 3. Seed Companies & All 11 Jobs
    sample_jobs = [
        # Harshitha's 3 Jobs
        {"title": "Frontend Developer (React)", "comp": "Google", "c_type": "Not a Startup", "loc": "Mountain View, CA", "sal": "$110,000 - $150,000", "rec_id": harshitha.id},
        {"title": "Prompt Engineer", "comp": "Manju Technologies", "c_type": "Startup", "loc": "Chennai", "sal": "$300,000 - $400,000", "rec_id": harshitha.id},
        {"title": "Lead Prompt Engineer", "comp": "Manju Startup AI", "c_type": "Startup", "loc": "Remote", "sal": "$120,000 - $180,000", "rec_id": harshitha.id},
        
        # Vighnesh Vikki's 8 Jobs
        {"title": "Python Developer", "comp": "Infosys", "c_type": "Not a Startup", "loc": "Chennai", "sal": "₹30,000/mo", "rec_id": vighnesh.id},
        {"title": "Data Engineer", "comp": "Infosys", "c_type": "Not a Startup", "loc": "Bengaluru", "sal": "₹13.5 Lakhs", "rec_id": vighnesh.id},
        {"title": "Software Engineer", "comp": "Tech Nova Solutions", "c_type": "Startup", "loc": "Hyderabad", "sal": "₹500,000", "rec_id": vighnesh.id},
        {"title": "Frontend Developer", "comp": "PixelSoft Technology", "c_type": "Startup", "loc": "Hyderabad", "sal": "₹500,000", "rec_id": vighnesh.id},
        {"title": "Python Developer", "comp": "Insightt Analytics", "c_type": "Startup", "loc": "Chennai", "sal": "₹30,000/mo", "rec_id": vighnesh.id},
        {"title": "System Engineer", "comp": "Insightt Analytics", "c_type": "Startup", "loc": "Bengaluru", "sal": "₹30,000/mo", "rec_id": vighnesh.id},
        {"title": "AI Solutions Engineer", "comp": "SwipeX Tech", "c_type": "Startup", "loc": "Remote", "sal": "$90,000 - $130,000", "rec_id": vighnesh.id},
        {"title": "Full Stack Software Engineer", "comp": "TechNova Solutions", "c_type": "Startup", "loc": "Remote", "sal": "$90,000 - $130,000", "rec_id": vighnesh.id},
    ]

    for jdata in sample_jobs:
        comp = db.query(Company).filter(Company.name.ilike(jdata["comp"])).first()
        if not comp:
            comp = Company(name=jdata["comp"], location=jdata["loc"], industry="Technology", description=f"{jdata['comp']} Tech Partner")
            db.add(comp)
            db.flush()

        existing_j = db.query(Job).filter(Job.title.ilike(jdata["title"]), Job.company_name.ilike(jdata["comp"])).first()
        if not existing_j:
            new_job = Job(
                company_id=comp.id,
                recruiter_id=jdata["rec_id"],
                title=jdata["title"],
                company_name=jdata["comp"],
                company_type=jdata["c_type"],
                location=jdata["loc"],
                salary=jdata["sal"],
                salary_min=80000,
                salary_max=130000,
                experience_required=2,
                description=f"Exciting {jdata['title']} position at {jdata['comp']}.",
                skills_required="Python, React, SQL, FastAPI",
                is_active=True,
                created_at=datetime.now(timezone.utc)
            )
            db.add(new_job)
            db.flush()
            print(f"  ✓ Created Supabase Job: '{jdata['title']}' at '{jdata['comp']}'")

    db.commit()
    db.close()
    print("=" * 80)
    print("✓ SUPABASE POSTGRESQL DATABASE FULLY MIGRATED & SEEDED!")
    print("=" * 80)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        db_url = sys.argv[1]
    else:
        db_url = os.getenv("DATABASE_URL", "postgresql://postgres:vikkihema@localhost:5432/swipex")
    deploy_supabase(db_url)
