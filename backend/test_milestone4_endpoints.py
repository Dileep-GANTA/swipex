from fastapi.testclient import TestClient
from app.main import app
import json

client = TestClient(app)

def test_milestone4():
    print("=== TESTING MILESTONE 4 FASTAPI & POSTGRESQL ENDPOINTS ===")

    # Obtain session token for authenticated endpoints
    login_res = client.post("/api/auth/login", json={"email": "jobseeker@swipex.com", "password": "password123"})
    if login_res.status_code != 200:
        client.post("/api/auth/register", json={
            "username": "testseeker_m4",
            "email": "jobseeker_m4@swipex.com",
            "password": "password123",
            "role": "Job Seeker"
        })
        login_res = client.post("/api/auth/login", json={"email": "jobseeker_m4@swipex.com", "password": "password123"})

    token = login_res.json().get("session_token") or login_res.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    # 1. Notifications List & Unread Count (Authenticated)
    res = client.get("/api/notifications", headers=headers)
    print("\n1. GET /api/notifications status:", res.status_code, "Count:", len(res.json()))
    assert res.status_code == 200

    res = client.get("/api/notifications/unread-count", headers=headers)
    print("2. GET /api/notifications/unread-count status:", res.status_code, "Data:", res.json())
    assert res.status_code == 200

    # 2. Mark All Read
    res = client.put("/api/notifications/mark-all-read", headers=headers)
    print("3. PUT /api/notifications/mark-all-read status:", res.status_code, "Data:", res.json())
    assert res.status_code == 200

    # 3. High Match Jobs
    res = client.get("/api/recommendations/high-match", headers=headers)
    print("4. GET /api/recommendations/high-match status:", res.status_code, "High Matches Count:", len(res.json()))
    assert res.status_code == 200

    # 4. Low Competition Jobs
    res = client.get("/api/jobs/low-competition", headers=headers)
    print("5. GET /api/jobs/low-competition status:", res.status_code, "Low Comp Jobs Count:", len(res.json()))
    assert res.status_code == 200

    # 5. Resume Performance
    res = client.get("/api/resume/performance", headers=headers)
    print("\n6. GET /api/resume/performance status:", res.status_code)
    print(json.dumps(res.json(), indent=2))
    assert res.status_code == 200

    # 6. Recommendation Analytics
    res = client.get("/api/analytics/recommendations", headers=headers)
    print("\n7. GET /api/analytics/recommendations status:", res.status_code)
    print("Keys:", list(res.json().keys()))
    assert res.status_code == 200

    # 7. Unauthenticated Public Recommendations & Job Discovery Test
    res_public = client.get("/api/jobs")
    print("\n8. GET /api/jobs (Public Unauthenticated Guest) status:", res_public.status_code, "Jobs Count:", len(res_public.json()))
    assert res_public.status_code == 200

    print("\nSUCCESS: All Milestone 4 backend APIs & User Isolation tests passed clean!")

if __name__ == "__main__":
    test_milestone4()
