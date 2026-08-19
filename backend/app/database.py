import os
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    PG_URL = "postgresql://postgres:vikkihema@localhost:5432/swipex"
    try:
        temp_engine = create_engine(PG_URL, pool_pre_ping=True)
        with temp_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        DATABASE_URL = PG_URL
        engine = temp_engine
        print("[DATABASE] Connected to PostgreSQL in pgAdmin: postgresql://postgres:vikkihema@localhost:5432/swipex")
    except Exception as e:
        print("[DATABASE] PostgreSQL fallback to SQLite:", e)
        DATABASE_URL = "sqlite:///./swipex.db"
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False},
            pool_pre_ping=True
        )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def ensure_schema():
    if not DATABASE_URL or DATABASE_URL.startswith("sqlite"):
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        if "jobs" in tables:
            columns = {column["name"] for column in inspector.get_columns("jobs")}
            job_schema = [
                ("recruiter_id", "INTEGER"),
                ("salary", "VARCHAR"),
                ("company_name", "VARCHAR"),
                ("company_logo", "VARCHAR"),
                ("company_type", "VARCHAR DEFAULT 'Startup'"),
                ("education", "VARCHAR"),
                ("last_date_to_apply", "DATETIME"),
                ("is_active", "BOOLEAN DEFAULT 1"),
                ("created_at", "DATETIME"),
            ]
            for column_name, column_type in job_schema:
                if column_name not in columns:
                    with engine.begin() as connection:
                        try:
                            connection.execute(text(f"ALTER TABLE jobs ADD COLUMN {column_name} {column_type}"))
                        except Exception as e:
                            print(f"Schema migration error for jobs.{column_name}:", e)

        if "users" in tables:
            columns = {column["name"] for column in inspector.get_columns("users")}
            user_schema = [
                ("full_name", "VARCHAR"),
                ("phone_number", "VARCHAR"),
                ("role", "VARCHAR DEFAULT 'Job Seeker'"),
                ("profile_pic", "VARCHAR"),
                ("bio", "VARCHAR"),
                ("skills", "VARCHAR"),
                ("preferred_location", "VARCHAR"),
                ("experience_years", "INTEGER DEFAULT 0"),
            ]
            for column_name, column_type in user_schema:
                if column_name not in columns:
                    with engine.begin() as connection:
                        try:
                            connection.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}"))
                        except Exception as e:
                            print(f"Schema migration error for users.{column_name}:", e)

        if "notifications" in tables:
            columns = {column["name"] for column in inspector.get_columns("notifications")}
            notif_schema = [
                ("type", "VARCHAR DEFAULT 'info'"),
                ("notification_type", "VARCHAR DEFAULT 'info'"),
                ("related_job_id", "INTEGER"),
                ("related_application_id", "INTEGER"),
                ("is_read", "BOOLEAN DEFAULT 0"),
            ]
            for column_name, column_type in notif_schema:
                if column_name not in columns:
                    with engine.begin() as connection:
                        try:
                            connection.execute(text(f"ALTER TABLE notifications ADD COLUMN {column_name} {column_type}"))
                        except Exception as e:
                            print(f"Schema migration error for notifications.{column_name}:", e)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()