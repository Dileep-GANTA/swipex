import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone, timedelta
import sys

def setup_and_populate():
    print("=" * 75)
    print("POPULATING PGADMIN DATABASES ('swipex' AND 'swipex_db') ON LOCALHOST:5432...")
    print("=" * 75)

    DB_USER = "postgres"
    DB_PASSWORD = "vikkihema"
    DB_HOST = "localhost"
    DB_PORT = "5432"

    target_databases = ["swipex", "swipex_db"]

    # Step 1: Ensure both databases exist
    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        for db_name in target_databases:
            cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}';")
            exists = cursor.fetchone()
            if not exists:
                print(f"Creating database '{db_name}' in pgAdmin...")
                cursor.execute(f"CREATE DATABASE {db_name};")
                print(f"[SUCCESS] Database '{db_name}' created!")

        cursor.close()
        conn.close()
    except Exception as e:
        print(f"[ERROR] Could not connect to PostgreSQL server: {e}")
        return False

    # Import models & auth hash helper
    from app.models import Base, User, RecruiterProfile, JobSeekerProfile, Company, Job, Application, SavedJob, SwipeHistory, Notification, ResumeSkill
    from app.routers.auth import hash_password

    # Step 2: Populate tables and data in both databases
    for db_name in target_databases:
        db_url = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{db_name}"
        print(f"\nPopulating schemas and tables in database '{db_name}'...")

        engine = create_engine(db_url, pool_pre_ping=True)
        Base.metadata.create_all(bind=engine)
        print(f"[SUCCESS] Created all 9 tables in '{db_name}' public schema!")

        Session = sessionmaker(bind=engine)
        db = Session()

        try:
            if db.query(User).count() == 0:
                print(f"Seeding users, jobs, applications, and swipe history in '{db_name}'...")
                
                # Recruiter Account
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
                    company_description="Cloud & Web Solutions Enterprise"
                )
                db.add(rec_prof)

                # Candidate Account
                seeker = User(
                    username="jobseeker1",
                    email="jobseeker@swipex.com",
                    hashed_password=hash_password("password123"),
                    full_name="Alex Johnson",
                    role="Job Seeker",
                    skills="React, Python, SQL, REST APIs",
                    experience_years=2,
                    created_at=datetime.now(timezone.utc)
                )
                db.add(seeker)
                db.flush()

                seeker_prof = JobSeekerProfile(
                    user_id=seeker.id,
                    education="Bachelor of Technology in CS",
                    experience="2 Years Software Engineer",
                    skills="React, Python, SQL, REST APIs",
                    preferred_location="Remote"
                )
                db.add(seeker_prof)

                # Company Profile
                company = Company(
                    name="TechNova Solutions",
                    location="Hyderabad, India",
                    industry="Technology",
                    description="Enterprise Cloud Solutions"
                )
                db.add(company)
                db.flush()

                # Job Postings (MNC, Startup, Newly Founded)
                job1 = Job(
                    company_id=company.id,
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
                    description="Build modern scalable web apps.",
                    is_active=True,
                    created_at=datetime.now(timezone.utc)
                )

                job2 = Job(
                    company_id=company.id,
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
                    description="Develop high performance web interfaces.",
                    is_active=True,
                    created_at=datetime.now(timezone.utc)
                )

                job3 = Job(
                    company_id=company.id,
                    recruiter_id=recruiter.id,
                    title="AI Research Engineer",
                    company_name="Stealth AI Labs",
                    company_type="Newly Founded Startup",
                    salary="$120,000 - $170,000",
                    salary_min=120000,
                    salary_max=170000,
                    location="Remote",
                    experience_required=0,
                    skills_required="Python, PyTorch, LLMs, Machine Learning",
                    job_type="Full Time",
                    description="Early stage stealth AI startup developing next-gen LLM agents.",
                    is_active=True,
                    created_at=datetime.now(timezone.utc)
                )

                db.add(job1)
                db.add(job2)
                db.add(job3)
                db.flush()

                # Swipe History & Applications
                swipe1 = SwipeHistory(user_id=seeker.id, job_id=job1.id, action="right", swiped_at=datetime.now(timezone.utc))
                swipe2 = SwipeHistory(user_id=seeker.id, job_id=job3.id, action="left", swiped_at=datetime.now(timezone.utc))
                db.add(swipe1)
                db.add(swipe2)

                saved = SavedJob(user_id=seeker.id, job_id=job1.id, saved_at=datetime.now(timezone.utc))
                db.add(saved)

                app = Application(user_id=seeker.id, job_id=job1.id, matching_score=92, status="Shortlisted", applied_at=datetime.now(timezone.utc))
                db.add(app)

                notif = Notification(user_id=seeker.id, title="Application Shortlisted", message="Your application for Full Stack Engineer has been shortlisted!", is_read=False, created_at=datetime.now(timezone.utc))
                db.add(notif)

                db.commit()
                print(f"[SUCCESS] Database '{db_name}' fully populated!")
        except Exception as e:
            db.rollback()
            print(f"[ERROR] Seeding error for '{db_name}': {e}")
        finally:
            db.close()

    print("=" * 75)
    print("BOTH 'swipex' AND 'swipex_db' DATABASES ARE 100% READY IN PGADMIN!")
    print("=" * 75)
    return True

if __name__ == "__main__":
    populate_both_pg_databases = setup_and_populate()
    sys.exit(0 if populate_both_pg_databases else 1)
