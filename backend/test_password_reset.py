from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_password_reset_flow():
    print("=" * 65)
    print("TESTING PASSWORD RESET AND LOGIN VERIFICATION FLOW...")
    print("=" * 65)

    test_email = "ram@gmail.com"
    new_pass = "newpassword123"

    # Step 1: Call reset-password with ram@gmail.com
    reset_res = client.post("/api/auth/reset-password", json={
        "email": test_email,
        "new_password": new_pass
    })
    print("1. POST /api/auth/reset-password status:", reset_res.status_code)
    print("   Response:", reset_res.json())
    assert reset_res.status_code == 200

    # Step 2: Attempt Login with ram@gmail.com and new_pass
    login_res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": new_pass
    })
    print("\n2. POST /api/auth/login with new password status:", login_res.status_code)
    print("   Response:", login_res.json())
    assert login_res.status_code == 200
    assert "session_token" in login_res.json()

    print("\n✓ SUCCESS: Password reset and login verified clean for ram@gmail.com!")

if __name__ == "__main__":
    test_password_reset_flow()
