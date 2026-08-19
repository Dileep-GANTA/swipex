from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_complete_swipe_module():
    print("Testing GET /api/jobs (Fetch all active PostgreSQL jobs)...")
    jobs_res = client.get("/api/jobs")
    print(f"GET /api/jobs status: {jobs_res.status_code}, total jobs: {len(jobs_res.json())}")
    assert jobs_res.status_code == 200

    print("\nTesting POST /api/swipe/ (Swipe Right to save job)...")
    swipe_right_res = client.post("/api/swipe/", json={"job_id": 1, "action": "right"})
    print(f"Swipe Right status: {swipe_right_res.status_code}, response: {swipe_right_res.json()}")
    assert swipe_right_res.status_code == 200

    print("\nTesting POST /api/saved-jobs (Prevent duplicate saved job)...")
    save_res = client.post("/api/saved-jobs", json={"job_id": 1})
    print(f"Save Job status: {save_res.status_code}, response: {save_res.json()}")
    assert save_res.status_code == 200

    print("\nTesting GET /api/saved-jobs (Saved jobs list)...")
    saved_res = client.get("/api/saved-jobs")
    print(f"Saved Jobs status: {saved_res.status_code}, count: {len(saved_res.json())}")
    assert saved_res.status_code == 200

    print("\nTesting POST /api/applications (Apply Job)...")
    apply_res = client.post("/api/applications", json={"job_id": 1})
    print(f"Apply Job status: {apply_res.status_code}, response: {apply_res.json()}")
    assert apply_res.status_code == 200

    print("\nTesting GET /api/applications (User Applications)...")
    apps_res = client.get("/api/applications")
    print(f"Applications status: {apps_res.status_code}, count: {len(apps_res.json())}")
    assert apps_res.status_code == 200

    print("\nSUCCESS: All PostgreSQL Swipe Jobs module endpoints passed!")

if __name__ == "__main__":
    test_complete_swipe_module()
