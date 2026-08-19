import sqlite3
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone

def migrate_all():
    print("=" * 75)
    print("MIGRATING ALL PAST RECRUITERS & JOBS FROM SQLITE TO POSTGRESQL (PGADMIN)...")
    print("=" * 75)

    if not os.path.exists("swipex.db"):
        print("sqlite swipex.db not found!")
        return

    # Read from SQLite
    conn_sq = sqlite3.connect("swipex.db")
    cur_sq = conn_sq.cursor()

    cur_sq.execute("SELECT id, username, email, hashed_password, full_name, phone_number, role, created_at FROM users WHERE role = 'Recruiter'")
    recruiter_rows = cur_sq.fetchall()

    cur_sq.execute("SELECT id, recruiter_id, title, company_name, company_type, location, salary, salary_min, salary_max, description, skills_required, is_active, created_at FROM jobs")
    job_rows = cur_sq.fetchall()

    conn_sq.close()

    from app.models import Base, User, RecruiterProfile, Job
    from app.routers.auth import hash_password

    # Write to both PostgreSQL databases
    for db_name in ["swipex", "swipex_db"]:
        pg_url = f"postgresql://postgres:vikkihema@localhost:5432/{db_name}"
        engine = create_engine(pg_url)
        Session = sessionmaker(bind=engine)
        db = Session()

        print(f"\nImporting into PostgreSQL database '{db_name}'...")

        for r in recruiter_rows:
            old_id, uname, email, hpass, fname, phone, role, created = r
            clean_email = (email or "").strip().lower()

            existing = db.query(User).filter(User.email.ilike(clean_email)).first()
            if not existing:
                new_u = User(
                    username=uname or clean_email.split("@")[0],
                    email=clean_email,
                    hashed_password=hpass if (hpass and ":" in hpass) else hash_password("password123"),
                    full_name=fname or uname or "Recruiter",
                    phone_number=phone,
                    role="Recruiter",
                    created_at=datetime.now(timezone.utc)
                )
                db.add(new_u)
                db.flush()

                rec_p = RecruiterProfile(
                    user_id=new_u.id,
                    company_name="Enterprise Hiring Partner",
                    company_location="India",
                    company_description="Verified SwipeX Recruiter Partner"
                )
                db.add(rec_p)
                print(f"[SUCCESS] Imported Recruiter: {clean_email} (Username: {uname}, Name: {fname})")

        db.commit()

        # Import past jobs
        for j in job_rows:
            j_id, r_id, title, comp_name, comp_type, loc, sal, s_min, s_max, desc, sk_req, is_act, c_at = j
            if title and comp_name:
                existing_j = db.query(Job).filter(Job.title == title, Job.company_name == comp_name).first()
                if not existing_j:
                    rec_user = db.query(User).filter(User.role == "Recruiter").first()
                    new_j = Job(
                        recruiter_id=rec_user.id if rec_user else 1,
                        title=title,
                        company_name=comp_name,
                        company_type=comp_type or "Startup",
                        location=loc or "Remote",
                        salary=sal or "$80,000 - $120,000",
                        salary_min=s_min or 80000,
                        salary_max=s_max or 120000,
                        description=desc or f"{title} opportunity at {comp_name}.",
                        skills_required=sk_req or "Software Engineering",
                        is_active=bool(is_act) if is_act is not None else True,
                        created_at=datetime.now(timezone.utc)
                    )
                    db.add(new_j)
                    print(f"  ✓ Imported Job: '{title}' at '{comp_name}'")

        db.commit()
        db.close()

    print("=" * 75)
    print("ALL PAST RECRUITERS & JOBS SUCCESSFULLY RESTORED IN PGADMIN!")
    print("=" * 75)

if __name__ == "__main__":
    migrate_all()
