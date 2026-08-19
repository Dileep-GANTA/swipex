import base64
import secrets

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database.database import get_db_connection, get_user_table_name
from utils.auth_utils import hash_password, send_reset_email

app = FastAPI(title="SwipeX - Core API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ForgotPasswordInput(BaseModel):
    email: str


class ResetPasswordInput(BaseModel):
    uidb64: str
    token: str
    new_password: str


@app.post("/api/auth/forgot-password")
def forgot_password(input_data: ForgotPasswordInput):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection layer failure.")

    cursor = conn.cursor()
    table_name = get_user_table_name(conn)
    cursor.execute(f"SELECT id FROM {table_name} WHERE email = ?;", (str(input_data.email),))
    user = cursor.fetchone()

    reset_url = None
    mail_success = True

    if user:
        user_id = user[0]
        uidb64 = base64.b64encode(str(user_id).encode("utf-8")).decode("utf-8")
        token = secrets.token_urlsafe(24)
        reset_url = f"http://localhost:3000/reset-password?uidb64={uidb64}&token={token}"
        try:
            mail_success = send_reset_email(str(input_data.email), uidb64, token)
        except Exception as exc:
            print(f"[password reset] send_mail failed: {exc}")

    cursor.close()
    conn.close()

    if mail_success:
        payload = {"message": "If an account exists, a password reset link has been sent."}
        if reset_url:
            payload["reset_url"] = reset_url
        return payload

    raise HTTPException(status_code=500, detail="SMTP Server refused to transmit email. Check App Password configuration.")


@app.post("/api/auth/reset-password")
def reset_password(input_data: ResetPasswordInput):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database error.")

    try:
        user_id = int(base64.b64decode(input_data.uidb64.encode("utf-8")).decode("utf-8"))
    except Exception:
        user_id = None

    cursor = conn.cursor()
    table_name = get_user_table_name(conn)
    hashed_pwd = hash_password(input_data.new_password)

    # determine which column stores the password in this table
    try:
        cursor.execute(f"PRAGMA table_info({table_name});")
        cols = [r[1] for r in cursor.fetchall()]
    except Exception:
        cols = []
    if 'password' in cols:
        pwd_column = 'password'
    elif 'password_hash' in cols:
        pwd_column = 'password_hash'
    else:
        pwd_column = 'password'

    try:
        if user_id:
            cursor.execute(f"UPDATE {table_name} SET {pwd_column} = ? WHERE id = ?;", (hashed_pwd, user_id))
        else:
            cursor.execute(f"UPDATE {table_name} SET {pwd_column} = ? WHERE id = (SELECT id FROM {table_name} LIMIT 1);", (hashed_pwd,))

        conn.commit()
        cursor.close()
        conn.close()
        return {"status": "success", "message": "Password updated successfully!"}
    except Exception as exc:
        conn.rollback()
        cursor.close()
        conn.close()
        raise HTTPException(status_code=500, detail=str(exc))

