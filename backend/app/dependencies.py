from fastapi import Header, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timezone

from app import models
from app.database import get_db

# Explicit Enterprise MNC List (Classified as "Not a Startup")
# Microsoft, Alphabet (Google), Apple, Meta Platforms, Oracle, SAP, IBM, Salesforce, Adobe,
# Accenture, Tata Consultancy Services (TCS), Infosys, HCLTech, Wipro, Cognizant, Capgemini,
# Cisco Systems, Intel, VMware, ServiceNow, Workday, Intuit, Autodesk, Synopsys, Cadence Design Systems
ENTERPRISE_NOT_STARTUP_LIST = {
    'microsoft', 'alphabet', 'google', 'apple', 'meta', 'meta platforms', 'facebook',
    'oracle', 'sap', 'ibm', 'salesforce', 'adobe', 'accenture',
    'tata', 'tcs', 'tata consultancy', 'tata consultancy services', 'infosys',
    'hcl', 'hcltech', 'wipro', 'cognizant', 'capgemini', 'cisco', 'cisco systems',
    'intel', 'vmware', 'servicenow', 'workday', 'intuit', 'autodesk', 'synopsys',
    'cadence', 'cadence design', 'cadence design systems'
}

def detect_company_type(company_name: Optional[str] = None, description: Optional[str] = None, experience_required: Optional[int] = 0) -> str:
    """
    Classify company strictly into either 'Not a Startup' or 'Startup'.
    If company matches the explicit Enterprise list -> returns 'Not a Startup'.
    Other than these companies -> returns 'Startup'.
    """
    if not company_name:
        return "Startup"
    
    name_lower = company_name.lower().strip()
    for keyword in ENTERPRISE_NOT_STARTUP_LIST:
        if keyword in name_lower:
            return "Not a Startup"
            
    return "Startup"


def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> models.User:
    """
    Extracts authenticated user strictly from Authorization header (Bearer <session_token>).
    """
    user = None
    if authorization:
        token = authorization.replace("Bearer ", "").strip()
        session = db.query(models.UserSession).filter(models.UserSession.session_token == token).first()
        if session:
            now_utc = datetime.now(timezone.utc)
            if session.expires_at:
                expires_at = session.expires_at
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
                if expires_at < now_utc:
                    db.delete(session)
                    db.commit()
                    session = None

            if session:
                user = db.query(models.User).filter(models.User.id == session.user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token invalid or expired. Please log in."
        )

    return user


def get_optional_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> Optional[models.User]:
    """
    Extracts authenticated user if token is present and valid, else returns None (for guest/public browsing).
    """
    if authorization:
        token = authorization.replace("Bearer ", "").strip()
        session = db.query(models.UserSession).filter(models.UserSession.session_token == token).first()
        if session:
            now_utc = datetime.now(timezone.utc)
            if session.expires_at:
                expires_at = session.expires_at
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
                if expires_at < now_utc:
                    return None
            return db.query(models.User).filter(models.User.id == session.user_id).first()
    return None
