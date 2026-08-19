from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from datetime import datetime, timedelta, timezone
import hashlib
import uuid

from app import models, schemas
from app.database import get_db

router = APIRouter(
    prefix="/api/auth",
    tags=["Milestone 1 - Authentication"]
)

# Password hashing

def hash_password(password: str) -> str:
    salt = uuid.uuid4().hex.encode("utf-8")
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return salt.decode("utf-8") + ":" + digest.hex()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password or ":" not in hashed_password:
        return False
    salt_hex, stored_hash = hashed_password.split(":", 1)
    salt = salt_hex.encode("utf-8")
    digest = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100_000)
    return digest.hex() == stored_hash


# -------------------------
# USER REGISTRATION
# -------------------------
@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    clean_email = user_data.email.strip().lower()
    clean_username = user_data.username.strip()

    existing_user = (
        db.query(models.User)
        .filter(
            or_(
                func.lower(models.User.email) == clean_email,
                func.lower(models.User.username) == clean_username.lower(),
            )
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or Email is already registered."
        )

    new_user = models.User(
        username=clean_username,
        email=clean_email,
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name or clean_username.title(),
        phone_number=user_data.phone_number,
        role=user_data.role or "Job Seeker",
        created_at=datetime.now(timezone.utc)
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User registration failed."
        )

    return {
        "message": "User registered successfully",
        "user_id": new_user.id
    }


# -------------------------
# USER LOGIN
# -------------------------
@router.post("/login")
def login_user(
    login_data: schemas.UserLogin,
    db: Session = Depends(get_db)
):
    clean_email = login_data.email.strip().lower()

    user = (
        db.query(models.User)
        .filter(func.lower(models.User.email) == clean_email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = str(uuid.uuid4())
    expiry = datetime.now(timezone.utc) + timedelta(hours=24)

    session = models.UserSession(
        user_id=user.id,
        session_token=token,
        expires_at=expiry
    )

    try:
        db.add(session)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user session."
        )

    return {
        "message": "Login successful",
        "session_token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name or user.username,
            "role": user.role
        },
        "expires_at": expiry.isoformat()
    }


# -------------------------
# FORGOT PASSWORD
# -------------------------
@router.post("/forgot-password")
@router.post("/forgot-password/")
def forgot_password(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    email = (payload.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email address is required.")

    user = db.query(models.User).filter(func.lower(models.User.email) == email).first()

    reset_token = str(uuid.uuid4())
    
    if user:
        session = models.UserSession(
            user_id=user.id,
            session_token=f"reset_{reset_token}",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
        )
        db.add(session)

        try:
            notif = models.Notification(
                user_id=user.id,
                title="Password Reset Request 🔐",
                message=f"A password reset link was requested for {email}. Use token '{reset_token}' to reset your password.",
                is_read=False,
                created_at=datetime.now(timezone.utc)
            )
            db.add(notif)
        except Exception as e:
            print("Notification error:", e)

        db.commit()

    return {
        "message": f"Password reset instructions have been generated for '{email}'. Click 'Proceed to Set New Password' to enter your new password.",
        "reset_token": reset_token,
        "email": email
    }


# -------------------------
# RESET PASSWORD
# -------------------------
@router.post("/reset-password")
@router.post("/reset-password/")
@router.post("/reset-password/{uidb64}/{token}")
@router.post("/reset-password/{uidb64}/{token}/")
def reset_password(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    email = (payload.get("email") or "").strip().lower()
    token = (payload.get("token") or "").strip()
    new_password = payload.get("new_password") or payload.get("password") or ""

    if not new_password or len(new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters long.")

    user = None
    if email:
        user = db.query(models.User).filter(func.lower(models.User.email) == email).first()
    
    if not user and token:
        sess = db.query(models.UserSession).filter(models.UserSession.session_token == f"reset_{token}").first()
        if sess:
            user = db.query(models.User).filter(models.User.id == sess.user_id).first()

    # If account doesn't exist yet, auto-register the account with the new password
    if not user and email:
        base_username = email.split("@")[0]
        username = base_username
        existing_uname = db.query(models.User).filter(func.lower(models.User.username) == username.lower()).first()
        if existing_uname:
            username = f"{base_username}_{uuid.uuid4().hex[:4]}"

        user = models.User(
            username=username,
            email=email,
            hashed_password=hash_password(new_password),
            full_name=base_username.title(),
            role="Job Seeker",
            created_at=datetime.now(timezone.utc)
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif user:
        user.hashed_password = hash_password(new_password)
        db.commit()
        db.refresh(user)
    else:
        raise HTTPException(status_code=400, detail="Email address is required to reset password.")

    return {"message": f"Password updated successfully for '{email}'! You can now log in with your new password."}