import os
import sys
from datetime import datetime, timezone, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Configure PostgreSQL connection
PG_URL = os.getenv("DATABASE_URL", "postgresql://postgres:vikkihema@localhost:5432/swipex")

try:
    engine = create_engine(PG_URL, pool_pre_ping=True)
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print(f"[SUCCESS] Connected to PostgreSQL in pgAdmin: {PG_URL}")
except Exception as e:
    print(f"[FALLBACK] PostgreSQL connection error, falling back to SQLite: {e}")
    PG_URL = "sqlite:///./swipex.db"
    engine = create_engine(PG_URL, connect_args={"check_same_thread": False}, pool_pre_ping=True)

from app.models import Base, User, RecruiterProfile, JobSeekerProfile, Company, Job, Application, SavedJob, SwipeHistory, Notification, ResumeSkill
from app.routers.auth import hash_password

def initialize_database():
    print("=" * 75)
    print("INITIALIZING POSTGRESQL TABLES & SCHEMAS FOR PGADMIN...")
    print("=" * 75)

    # Create all tables in PostgreSQL / database
    Base.metadata.create_all(bind=engine)
    print("1. Created PostgreSQL Schemas & Tables: users, recruiter_profiles, job_seeker_profiles, companies, jobs, applications, saved_jobs, swipe_history, notifications.")

    Session = sessionmaker(bind=engine)
    db = Session()

    try:
        # Seed Initial Recruiter & Candidate Accounts if table empty
        if db.query(User).count() == 0:
            print("2. Seeding initial accounts into PostgreSQL 'users' table...")
            
            # Recruiter User 1
            recruiter = User(
                username="recruiter1",
                email="recruiter@swipex.com",
                hashed_password=hash_password("password123"),
                full_name="Tech Recruiter",
                role="Recruiter",
                created_at=datetime.now(timezone.utc)
            )
            db.add(recruiter)
            db.flush()

            rec_prof = RecruiterProfile(
                user_id=recruiter.id,
                company_name="TechNova Solutions",
                company_website="https://technova.io",
                company_location="Hyderabad, India",
                company_description="Leading Cloud & Full Stack Solutions Enterprise"
            )
            db.add(rec_prof)

            # Job Seeker User 1
            seeker1 = User(
                username="jobseeker1",
                email="jobseeker@swipex.com",
                hashed_password=hash_password("password123"),
                full_name="Alex Johnson",
                role="Job Seeker",
                skills="React, Python, SQL, REST APIs",
                experience_years=2,
                created_at=datetime.now(timezone.utc)
            )
            db.add(seeker1)
            db.flush()

            seeker_prof1 = JobSeekerProfile(
                user_id=seeker1.id,
                education="Bachelor of Technology in CS",
                experience="2 Years Software Engineer",
                skills="React, Python, SQL, REST APIs",
                preferred_location="Remote"
            )
            db.add(seeker_prof1)

            # Seed Company
            company1 = Company(
                name="TechNova Solutions",
                location="Hyderabad, India",
                industry="Technology",
                description="Enterprise Cloud & Software Development"
            )
            db.add(company1)
            db.flush()

            # Seed Jobs
            job1 = Job(
                company_id=company1.id,
                recruiter_id=recruiter.id,
                title="Full Stack Software Engineer",
                company_name="TechNova Solutions",
                company_type="Startup",
                salary="$90,000 - $130,000",
                salary_min=90000,
                salary_max=130000,
                location="Remote",
                experience_required=2,
                skills_required="React, Python, SQL, FastAPI",
                job_type="Full Time",
                description="Join our engineering team to build modern scalable cloud web apps.",
                is_active=True,
                created_at=datetime.now(timezone.utc)
            )

            job2 = Job(
                company_id=company1.id,
                recruiter_id=recruiter.id,
                title="Frontend Developer (React)",
                company_name="Google",
                company_type="MNC",
                salary="$110,000 - $150,000",
                salary_min=110000,
                salary_max=150000,
                location="Mountain View, CA",
                experience_required=3,
                skills_required="React, TypeScript, HTML, CSS",
                job_type="Full Time",
                description="Build intuitive high-performance UI interfaces.",
                is_active=True,
                created_at=datetime.now(timezone.utc)
            )

            db.add(job1)
            db.add(job2)
            db.flush()

            # Seed Swipes & Applications
            swipe = SwipeHistory(
                user_id=seeker1.id,
                job_id=job1.id,
                action="right",
                swiped_at=datetime.now(timezone.utc)
            )
            db.add(swipe)

            saved = SavedJob(
                user_id=seeker1.id,
                job_id=job1.id,
                saved_at=datetime.now(timezone.utc)
            )
            db.add(saved)

            app = Application(
                user_id=seeker1.id,
                job_id=job1.id,
                matching_score=92,
                status="Shortlisted",
                applied_at=datetime.now(timezone.utc)
            )
            db.add(app)

            db.commit()
            print("[SUCCESS] Successfully seeded initial users, jobs, applications, and swipe history in PostgreSQL!")

    except Exception as err:
        db.rollback()
        print(f"[ERROR] Database seeding error: {err}")
    finally:
        db.close()

    print("=" * 75)
    print("SUCCESSFULLY INITIALIZED POSTGRESQL (PGADMIN) DATABASE SCHEMAS!")
    print("=" * 75)

if __name__ == "__main__":
    initialize_database()
