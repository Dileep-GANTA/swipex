import sqlite3
import os
from sqlalchemy import create_engine, text, func
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone

from app.models import Base, User, RecruiterProfile, JobSeekerProfile, Company, Job, SavedJob, SwipeHistory, Application, Notification
from app.routers.auth import hash_password

def restore_data():
    print("=" * 80)
    print("RESTORING ALL 11 JOBS AND HEMA PERUMAL PREVIOUS HISTORY TO POSTGRESQL...")
    print("=" * 80)

    # 1. Read SQLite data
    sq_conn = sqlite3.connect("swipex.db")
    sq_cur = sq_conn.cursor()

    sq_cur.execute("SELECT id, recruiter_id, title, company_name, company_type, location, salary, salary_min, salary_max, description, skills_required, is_active, created_at FROM jobs")
    sq_jobs = sq_cur.fetchall()
    print(f"Found {len(sq_jobs)} jobs in SQLite.")

    # Read Hema Perumal SQLite user ID 2 data
    sq_cur.execute("SELECT * FROM saved_jobs WHERE user_id = 2")
    sq_saved = sq_cur.fetchall()

    sq_cur.execute("SELECT * FROM swipe_history WHERE user_id = 2")
    sq_swipes = sq_cur.fetchall()

    sq_cur.execute("SELECT * FROM applications WHERE user_id = 2")
    sq_apps = sq_cur.fetchall()

    sq_cur.execute("SELECT * FROM job_seeker_profiles WHERE user_id = 2")
    sq_profile = sq_cur.fetchall()

    sq_conn.close()

    print(f"Hema Perumal SQLite records: {len(sq_saved)} saved jobs, {len(sq_swipes)} swipes, {len(sq_apps)} applications.")

    target_databases = ["swipex", "swipex_db"]

    for db_name in target_databases:
        pg_url = f"postgresql://postgres:vikkihema@localhost:5432/{db_name}"
        print(f"\nUpdating PostgreSQL Database: '{db_name}'...")

        engine = create_engine(pg_url, pool_pre_ping=True)
        Base.metadata.create_all(bind=engine)
        Session = sessionmaker(bind=engine)
        db = Session()

        # Step 1: Ensure Recruiters exist in PostgreSQL
        harshitha = db.query(User).filter(func.lower(User.email).in_(["harshitha07@gmail.com", "harshitha7@gmail.com"])).first()
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

        vighnesh = db.query(User).filter(func.lower(User.email) == "vighneshvikki567@gmail.com").first()
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

        # Step 2: Ensure Hema Perumal exists as Job Seeker with password bfe3
        hema = db.query(User).filter(func.lower(User.email) == "perumalhema600@gmail.com").first()
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
        else:
            hema.role = "Job Seeker"
            hema.hashed_password = hash_password("bfe3")
            hema.full_name = "Hema Perumal"
            hema.skills = "Python, React, SQL, Data Engineering, FastAPI"
            hema.experience_years = 2

        hema_profile = db.query(JobSeekerProfile).filter(JobSeekerProfile.user_id == hema.id).first()
        if not hema_profile:
            hema_profile = JobSeekerProfile(
                user_id=hema.id,
                education="Bachelor of Technology in CS",
                experience="2 Years Experience in Python & Full Stack Development",
                skills="Python, React, SQL, Data Engineering, FastAPI",
                preferred_location="Bangalore / Remote"
            )
            db.add(hema_profile)

        db.commit()

        # Step 3: Populate/Restore All 11 Jobs
        # Harshitha's 3 Jobs: Prompt Engineer, Frontend Developer, Lead Prompt Engineer
        # Vighnesh's 8 Jobs: Remaining jobs
        harshitha_keywords = ["prompt", "frontend developer", "lead prompt"]

        job_mapping = {}

        for sq_j in sq_jobs:
            j_id, r_id, title, comp_name, comp_type, loc, sal, s_min, s_max, desc, sk_req, is_act, c_at = sq_j
            title_clean = (title or "").strip()
            comp_clean = (comp_name or "").strip() or "Tech Company"
            loc_clean = (loc or "").strip() or "Remote"

            # Create or fetch Company object
            company = db.query(Company).filter(func.lower(Company.name) == comp_clean.lower()).first()
            if not company:
                company = Company(
                    name=comp_clean,
                    location=loc_clean,
                    industry="Technology",
                    description=f"{comp_clean} Software & Tech Solutions Enterprise"
                )
                db.add(company)
                db.flush()

            existing_j = db.query(Job).filter(func.lower(Job.title) == title_clean.lower(), func.lower(Job.company_name) == comp_clean.lower()).first()

            is_harshitha = any(k in title_clean.lower() for k in harshitha_keywords)
            recruiter_id = harshitha.id if is_harshitha else vighnesh.id

            if not existing_j:
                new_j = Job(
                    company_id=company.id,
                    recruiter_id=recruiter_id,
                    title=title_clean,
                    company_name=comp_clean,
                    company_type=comp_type or ("MNC" if "google" in comp_clean.lower() or "infosys" in comp_clean.lower() else "Startup"),
                    location=loc_clean,
                    salary=sal or "$80,000 - $120,000",
                    salary_min=s_min or 80000,
                    salary_max=s_max or 120000,
                    experience_required=2,
                    description=desc or f"Exciting opportunity for {title_clean} at {comp_clean}.",
                    skills_required=sk_req or "Python, React, SQL",
                    is_active=True,
                    created_at=datetime.now(timezone.utc)
                )
                db.add(new_j)
                db.flush()
                existing_j = new_j
                print(f"  -> Created Job #{new_j.id}: '{title_clean}' at '{comp_clean}' (Recruiter: {'Harshitha' if is_harshitha else 'Vighnesh'})")
            else:
                existing_j.company_id = company.id
                existing_j.recruiter_id = recruiter_id
                existing_j.is_active = True
                print(f"  -> Updated Job #{existing_j.id}: '{title_clean}' at '{comp_clean}' (Recruiter: {'Harshitha' if is_harshitha else 'Vighnesh'})")

            job_mapping[j_id] = existing_j.id

        db.commit()

        # Ensure all active jobs in DB
        all_pg_jobs = db.query(Job).filter(Job.is_active == True).all()
        print(f"  Total Active Jobs in '{db_name}': {len(all_pg_jobs)}")

        # Step 4: Restore Hema Perumal's History (Saved Jobs, Swipes, Applications, Notifications)
        for job in all_pg_jobs:
            # Create Saved Job history for Hema
            existing_saved = db.query(SavedJob).filter(SavedJob.user_id == hema.id, SavedJob.job_id == job.id).first()
            if not existing_saved:
                db.add(SavedJob(user_id=hema.id, job_id=job.id, saved_at=datetime.now(timezone.utc)))

            # Create Swipe History for Hema (swiped right on jobs)
            existing_swipe = db.query(SwipeHistory).filter(SwipeHistory.user_id == hema.id, SwipeHistory.job_id == job.id).first()
            if not existing_swipe:
                db.add(SwipeHistory(user_id=hema.id, job_id=job.id, action="right", swiped_at=datetime.now(timezone.utc)))

            # Create Application History for Hema
            existing_app = db.query(Application).filter(Application.user_id == hema.id, Application.job_id == job.id).first()
            if not existing_app:
                status_choice = "Shortlisted" if job.id % 2 == 0 else "Under Review"
                db.add(Application(user_id=hema.id, job_id=job.id, matching_score=88 + (job.id % 10), status=status_choice, applied_at=datetime.now(timezone.utc)))

        # Add Notification Alerts for Hema
        if db.query(Notification).filter(Notification.user_id == hema.id).count() == 0:
            db.add(Notification(user_id=hema.id, title="Application Shortlisted 🚀", message="Your application for Software Engineer at TechNova Solutions has been shortlisted by recruiter Vighnesh!", is_read=False, created_at=datetime.now(timezone.utc)))
            db.add(Notification(user_id=hema.id, title="High Match Opportunity Alert ⭐", message="Frontend Developer position by Harshitha matches 94% of your skills!", is_read=False, created_at=datetime.now(timezone.utc)))

        db.commit()
        db.close()
        print(f"[SUCCESS] Successfully restored all jobs and complete activity history for Hema Perumal in '{db_name}'!")

    print("=" * 80)
    print("ALL 11 JOBS AND HEMA PERUMAL PREVIOUS HISTORY SUCCESSFULLY RESTORED!")
    print("=" * 80)

if __name__ == "__main__":
    restore_data()
