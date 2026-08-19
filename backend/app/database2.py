from sqlalchemy import create_all, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# నీ లోకల్ PostgreSQL క్రెడెన్షియల్స్ ఇక్కడ మార్చుకో master (Port: 5432)
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/swipex_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
