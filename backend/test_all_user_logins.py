from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_logins():
    print("=" * 80)
    print("VERIFYING LOGIN & ROLES FOR ALL 4 ACCOUNTS...")
    print("=" * 80)

    test_cases = [
        {"email": "harshitha7@gmail.com", "password": "harshi", "expected_role": "Recruiter"},
        {"email": "harshitha07@gmail.com", "password": "harshi", "expected_role": "Recruiter"},
        {"email": "vighneshvikki567@gmail.com", "password": "vikki", "expected_role": "Recruiter"},
        {"email": "perumalhema600@gmail.com", "password": "bfe3", "expected_role": "Job Seeker"},
    ]

    for tc in test_cases:
        res = client.post("/api/auth/login", json={
            "email": tc["email"],
            "password": tc["password"]
        })
        print(f"\nLogin Test for '{tc['email']}':")
        print(f"  Status Code: {res.status_code}")
        data = res.json()
        if res.status_code == 200:
            user = data.get("user", {})
            print(f"  [SUCCESS] Role: {user.get('role')} | User ID: {user.get('id')} | Session Token Issued: {bool(data.get('session_token'))}")
            assert user.get("role") == tc["expected_role"], f"Expected role {tc['expected_role']} but got {user.get('role')}"
        else:
            print(f"  [FAILED] {data.get('detail')}")
            assert False, f"Login failed for {tc['email']}"

    print("\n" + "=" * 80)
    print("SUCCESS: ALL 4 ACCOUNTS PASSED LOGIN AND ROLE VERIFICATION CLEANLY!")
    print("=" * 80)

if __name__ == "__main__":
    test_logins()
