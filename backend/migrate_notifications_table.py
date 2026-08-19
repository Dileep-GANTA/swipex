from app.database import engine
from sqlalchemy import text

def migrate():
    print("Migrating notifications table columns...")
    with engine.connect() as conn:
        # Check SQLite or PostgreSQL columns
        try:
            conn.execute(text("ALTER TABLE notifications ADD COLUMN notification_type VARCHAR DEFAULT 'info'"))
            print("Added column notification_type")
        except Exception as e:
            print("notification_type column already exists or skipped:", e)

        try:
            conn.execute(text("ALTER TABLE notifications ADD COLUMN related_job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL"))
            print("Added column related_job_id")
        except Exception as e:
            print("related_job_id column already exists or skipped:", e)

        try:
            conn.execute(text("ALTER TABLE notifications ADD COLUMN related_application_id INTEGER REFERENCES applications(id) ON DELETE SET NULL"))
            print("Added column related_application_id")
        except Exception as e:
            print("related_application_id column already exists or skipped:", e)

        conn.commit()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
