from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.models import Job
from app.dependencies import detect_company_type

def update_company_types():
    print("=" * 75)
    print("UPDATING ALL POSTGRESQL JOBS TO EITHER 'Not a Startup' OR 'Startup'...")
    print("=" * 75)

    target_databases = ["swipex", "swipex_db"]

    for db_name in target_databases:
        pg_url = f"postgresql://postgres:vikkihema@localhost:5432/{db_name}"
        engine = create_engine(pg_url, pool_pre_ping=True)
        Session = sessionmaker(bind=engine)
        db = Session()

        print(f"\nProcessing PostgreSQL Database: '{db_name}'...")
        jobs = db.query(Job).all()

        for j in jobs:
            new_type = detect_company_type(j.company_name, j.description, j.experience_required)
            j.company_type = new_type
            print(f"  Job #{j.id}: '{j.title}' @ '{j.company_name}' -> Classed as '{new_type}'")

        db.commit()
        db.close()
        print(f"[SUCCESS] Database '{db_name}' company types updated!")

    print("=" * 75)
    print("ALL POSTGRESQL JOBS UP-TO-DATE WITH 2-OPTION CLASSIFICATION!")
    print("=" * 75)

if __name__ == "__main__":
    update_company_types()
