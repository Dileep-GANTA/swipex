import os
import sqlite3
from sqlalchemy import create_engine, text, func
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone

from app.models import Base, User, RecruiterProfile, JobSeekerProfile, Job
from app.routers.auth import hash_password

def fix_accounts_and_jobs():
    print("=" * 80)
    print("RECTIFYING RECRUITER ROLES, PASSWORDS & JOB OWNERSHIP...")
    print("=" * 80)

    # 1. Remove inspect_past_recruiters.py if it exists
    inspect_file = os.path.join(os.path.dirname(__file__), "inspect_past_recruiters.py")
    if os.path.exists(inspect_file):
        try:
            os.remove(inspect_file)
            print("[CLEANUP] Successfully deleted 'inspect_past_recruiters.py'.")
        except Exception as e:
            print("[CLEANUP WARNING] Could not remove inspect_past_recruiters.py:", e)

    # Target users configuration
    target_accounts = [
        {
            "email": "harshitha7@gmail.com",
            "username": "harshitha7",
            "full_name": "Harshitha",
            "role": "Recruiter",
            "password": "harshi"
        },
        {
            "email": "harshitha07@gmail.com",
            "username": "harshitha07",
            "full_name": "Harshitha",
            "role": "Recruiter",
            "password": "harshi"
        },
        {
            "email": "vighneshvikki567@gmail.com",
            "username": "vighneshvikki567",
            "full_name": "Vignesh Vikki",
            "role": "Recruiter",
            "password": "vikki"
        },
        {
            "email": "perumalhema600@gmail.com",
            "username": "perumalhema600",
            "full_name": "Hema Perumal",
            "role": "Job Seeker",
            "password": "bfe3"
        }
    ]

    target_databases = ["swipex", "swipex_db"]

    for db_name in target_databases:
        pg_url = f"postgresql://postgres:vikkihema@localhost:5432/{db_name}"
        print(f"\nProcessing PostgreSQL Database: '{db_name}'...")

        try:
            engine = create_engine(pg_url, pool_pre_ping=True)
            Base.metadata.create_all(bind=engine)
            Session = sessionmaker(bind=engine)
            db = Session()

            harshitha_user = None
            vikki_user = None

            for acc in target_accounts:
                clean_email = acc["email"].strip().lower()
                role = acc["role"]
                raw_pwd = acc["password"]
                pwd_hash = hash_password(raw_pwd)

                user = db.query(User).filter(func.lower(User.email) == clean_email).first()

                if user:
                    print(f"  -> Updating existing user '{clean_email}': Role -> {role}, Password -> '{raw_pwd}'")
                    user.role = role
                    user.hashed_password = pwd_hash
                    user.full_name = acc["full_name"]
                else:
                    # Ensure username is unique
                    uname = acc["username"]
                    existing_u = db.query(User).filter(func.lower(User.username) == uname.lower()).first()
                    if existing_u:
                        uname = f"{uname}_rec"

                    print(f"  -> Creating user '{clean_email}': Role -> {role}, Password -> '{raw_pwd}'")
                    user = User(
                        username=uname,
                        email=clean_email,
                        hashed_password=pwd_hash,
                        full_name=acc["full_name"],
                        role=role,
                        created_at=datetime.now(timezone.utc)
                    )
                    db.add(user)
                    db.flush()

                if role == "Recruiter":
                    rec_prof = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == user.id).first()
                    if not rec_prof:
                        rec_prof = RecruiterProfile(
                            user_id=user.id,
                            company_name=f"{acc['full_name']} Enterprise",
                            company_location="Bangalore / Remote",
                            company_description="Verified Tech Recruiter"
                        )
                        db.add(rec_prof)
                
                if "harshitha" in clean_email:
                    harshitha_user = user
                elif "vighnesh" in clean_email:
                    vikki_user = user

            db.commit()

            # Job assignments: Prompt Engineering, Frontend Developer, Lead Prompt Engineering -> Harshitha
            if harshitha_user and vikki_user:
                harshitha_job_keywords = ["prompt", "frontend", "lead prompt"]
                all_jobs = db.query(Job).all()

                for j in all_jobs:
                    title_lower = (j.title or "").lower()
                    if any(k in title_lower for k in harshitha_job_keywords):
                        j.recruiter_id = harshitha_user.id
                        print(f"  [JOB ASSIGNMENT] Assigned '{j.title}' to Recruiter Harshitha (ID {harshitha_user.id})")
                    else:
                        j.recruiter_id = vikki_user.id
                        print(f"  [JOB ASSIGNMENT] Assigned '{j.title}' to Recruiter Vighnesh (ID {vikki_user.id})")

                db.commit()

            db.close()
            print(f"[SUCCESS] Database '{db_name}' updated cleanly!")

        except Exception as err:
            print(f"[ERROR] Failed to update PostgreSQL '{db_name}': {err}")

    print("=" * 80)
    print("ALL ACCOUNTS AND RECRUITER JOBS SUCCESSFULLY RECTIFIED!")
    print("=" * 80)

if __name__ == "__main__":
    fix_accounts_and_jobs()
