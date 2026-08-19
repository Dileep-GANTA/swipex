from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_new_enrolled_user_data_isolation():
    print("=" * 80)
    print("TESTING NEW ENROLLED USER DATA ISOLATION & FRESH PROFILE STATE...")
    print("=" * 80)

    # 1. Register a NEW Job Seeker
    new_seeker_email = "newenrolled_seeker@swipex.com"
    reg_seeker = client.post("/api/auth/register", json={
        "username": "newenrolled_seeker",
        "email": new_seeker_email,
        "password": "Password123!",
        "role": "Job Seeker",
        "full_name": "New Enrolled Candidate"
    })
    print(f"\n1. New Job Seeker Registration ({new_seeker_email}): Status {reg_seeker.status_code}")

    login_seeker = client.post("/api/auth/login", json={
        "email": new_seeker_email,
        "password": "Password123!"
    })
    assert login_seeker.status_code == 200
    token_seeker = login_seeker.json()["session_token"]
    headers_seeker = {"Authorization": f"Bearer {token_seeker}"}

    # Verify Saved Jobs & Applications are 100% empty for new seeker
    saved_res = client.get("/api/saved-jobs", headers=headers_seeker)
    apps_res = client.get("/api/applications/my-applications", headers=headers_seeker)

    print(f"   [CHECK] New Seeker Saved Jobs Count: {len(saved_res.json())} (Expected 0)")
    print(f"   [CHECK] New Seeker Applications Count: {len(apps_res.json())} (Expected 0)")
    assert len(saved_res.json()) == 0, "New Job Seeker must start with 0 saved jobs!"
    assert len(apps_res.json()) == 0, "New Job Seeker must start with 0 applications!"

    # 2. Register a NEW Recruiter
    new_rec_email = "newenrolled_recruiter@swipex.com"
    reg_rec = client.post("/api/auth/register", json={
        "username": "newenrolled_recruiter",
        "email": new_rec_email,
        "password": "Password123!",
        "role": "Recruiter",
        "full_name": "New Enrolled Recruiter"
    })
    print(f"\n2. New Recruiter Registration ({new_rec_email}): Status {reg_rec.status_code}")

    login_rec = client.post("/api/auth/login", json={
        "email": new_rec_email,
        "password": "Password123!"
    })
    assert login_rec.status_code == 200
    token_rec = login_rec.json()["session_token"]
    headers_rec = {"Authorization": f"Bearer {token_rec}"}

    # Verify Recruiter Jobs & Applications are 100% empty for new recruiter
    rec_jobs_res = client.get("/api/recruiter/jobs", headers=headers_rec)
    rec_apps_res = client.get("/api/recruiter/applications", headers=headers_rec)
    rec_analytics_res = client.get("/api/analytics/recruiter", headers=headers_rec)

    print(f"   [CHECK] New Recruiter Posted Jobs Count: {len(rec_jobs_res.json())} (Expected 0)")
    print(f"   [CHECK] New Recruiter Applications Received: {len(rec_apps_res.json())} (Expected 0)")
    print(f"   [CHECK] New Recruiter Total Jobs in Analytics: {rec_analytics_res.json().get('total_jobs')} (Expected 0)")

    assert len(rec_jobs_res.json()) == 0, "New Recruiter must start with 0 posted jobs!"
    assert len(rec_apps_res.json()) == 0, "New Recruiter must start with 0 applications!"
    assert rec_analytics_res.json().get('total_jobs') == 0, "Analytics must reflect 0 jobs for new recruiter!"

    print("\n" + "=" * 80)
    print("SUCCESS: NEW ENROLLED USER DATA ISOLATION FULLY VERIFIED CLEAN!")
    print("=" * 80)

if __name__ == "__main__":
    test_new_enrolled_user_data_isolation()
