from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def verify_hema_full_history():
    print("=" * 80)
    print("VERIFYING HEMA PERUMAL LOGIN & HISTORY RETRIEVAL...")
    print("=" * 80)

    # Step 1: Login with Hema Perumal
    login_res = client.post("/api/auth/login", json={
        "email": "perumalhema600@gmail.com",
        "password": "bfe3"
    })
    print("1. Login status:", login_res.status_code)
    assert login_res.status_code == 200, f"Login failed: {login_res.json()}"
    
    token = login_res.json()["session_token"]
    user_info = login_res.json()["user"]
    headers = {"Authorization": f"Bearer {token}"}

    print(f"   [SUCCESS] Logged in as Hema Perumal ({user_info['email']}) | Role: {user_info['role']}")

    # Step 2: Retrieve Saved Jobs
    saved_res = client.get("/api/saved-jobs", headers=headers)
    print(f"\n2. GET /api/saved-jobs status: {saved_res.status_code} | Total Saved Jobs: {len(saved_res.json())}")
    assert saved_res.status_code == 200

    # Step 3: Retrieve Applications Pipeline
    app_res = client.get("/api/applications/my-applications", headers=headers)
    print(f"3. GET /api/applications/my-applications status: {app_res.status_code} | Total Applied Jobs: {len(app_res.json())}")
    assert app_res.status_code == 200

    # Step 4: Retrieve Notifications
    notif_res = client.get("/api/notifications", headers=headers)
    print(f"4. GET /api/notifications status: {notif_res.status_code} | Total Notifications: {len(notif_res.json())}")
    assert notif_res.status_code == 200

    # Step 5: Retrieve Recommendations
    rec_res = client.get("/api/recommendations", headers=headers)
    print(f"5. GET /api/recommendations status: {rec_res.status_code} | Recommended Jobs: {len(rec_res.json())}")
    assert rec_res.status_code == 200

    print("\n" + "=" * 80)
    print("SUCCESS: HEMA PERUMAL DATA & ACTIVITY HISTORY FULLY RETRIEVED AND VERIFIED!")
    print("=" * 80)

if __name__ == "__main__":
    verify_hema_full_history()
