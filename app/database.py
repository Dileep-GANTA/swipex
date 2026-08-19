import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


# =====================================================
# DATABASE CONFIGURATION
# =====================================================

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    PG_URL = "postgresql://postgres@localhost:5432/jobmatch_ai"
    try:
        from sqlalchemy import text
        temp_engine = create_engine(PG_URL, pool_pre_ping=True)
        with temp_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        DATABASE_URL = PG_URL
        engine = temp_engine
    except Exception as e:
        print("[DATABASE] PostgreSQL fallback to SQLite:", e)
        DATABASE_URL = "sqlite:///./swipex.db"
        connect_args = {"check_same_thread": False}
        engine = create_engine(
            DATABASE_URL,
            connect_args=connect_args,
            pool_pre_ping=True
        )
else:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True
    )


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()


# =====================================================
# DATABASE SESSION
# =====================================================

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()