import os
from sqlalchemy import create_engine
from app.database import engine, Base, ensure_schema
from app import models
from app.database import SessionLocal

def test_db_setup():
    print("Creating all database tables via SQLAlchemy metadata...")
    Base.metadata.create_all(bind=engine)
    ensure_schema()

    db = SessionLocal()
    try:
        user_count = db.query(models.User).count()
        job_count = db.query(models.Job).count()
        print(f"Users in DB: {user_count}")
        print(f"Jobs in DB: {job_count}")

        # Seed sample jobs if empty
        if job_count == 0:
            print("Seeding sample jobs into database...")
            company = models.Company(
                name="TechCorp Solutions",
                location="Remote",
                industry="Software Development",
                description="Leading software innovations"
            )
            db.add(company)
            db.commit()

            sample_jobs = [
                models.Job(
                    company_id=company.id,
                    title="Full Stack React & Python Engineer",
                    company_name="TechCorp Solutions",
                    salary_min=90000,
                    salary_max=120000,
                    salary="$90,000 - $120,000",
                    location="Remote",
                    experience_required=2,
                    skills_required="React, Python, PostgreSQL, REST APIs",
                    job_type="Full Time",
                    description="Build full-stack web applications using React, Python, and PostgreSQL.",
                    is_active=True
                ),
                models.Job(
                    company_id=company.id,
                    title="Backend Python FastAPI Developer",
                    company_name="SwipeX AI",
                    salary_min=100000,
                    salary_max=130000,
                    salary="$100,000 - $130,000",
                    location="New York, NY",
                    experience_required=3,
                    skills_required="Python, FastAPI, Docker, SQL",
                    job_type="Full Time",
                    description="Design scalable microservices and recommendation engines.",
                    is_active=True
                ),
                models.Job(
                    company_id=company.id,
                    title="Frontend React UI/UX Specialist",
                    company_name="DesignCraft",
                    salary_min=85000,
                    salary_max=110000,
                    salary="$85,000 - $110,000",
                    location="San Francisco, CA",
                    experience_required=2,
                    skills_required="React, JavaScript, CSS, HTML",
                    job_type="Contract",
                    description="Craft intuitive user interfaces and sleek animations.",
                    is_active=True
                )
            ]
            db.add_all(sample_jobs)
            db.commit()
            print("Seeded 3 sample jobs successfully!")

    finally:
        db.close()

if __name__ == "__main__":
    test_db_setup()
