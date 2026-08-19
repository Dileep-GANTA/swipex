"""
Migration script to add company_type column to jobs table.
This script handles the database migration for the new company_type field.
"""

from sqlalchemy import text
from app.database import engine

def migrate_add_company_type():
    """
    Add company_type column to jobs table if it doesn't exist.
    """
    with engine.connect() as conn:
        # Check if column exists
        try:
            result = conn.execute(text(
                "SELECT column_name FROM information_schema.columns WHERE table_name='jobs' AND column_name='company_type'"
            ))
            column_exists = result.fetchone() is not None
            
            if not column_exists:
                print("Adding company_type column to jobs table...")
                conn.execute(text(
                    "ALTER TABLE jobs ADD COLUMN company_type VARCHAR(50) DEFAULT 'Startup'"
                ))
                conn.commit()
                print("✅ company_type column added successfully!")
            else:
                print("✅ company_type column already exists!")
                
        except Exception as e:
            print(f"Note: Using SQLite - automatic schema update via SQLAlchemy")
            # SQLite doesn't support information_schema, just proceed
            # SQLAlchemy will handle the schema creation automatically

if __name__ == "__main__":
    migrate_add_company_type()
