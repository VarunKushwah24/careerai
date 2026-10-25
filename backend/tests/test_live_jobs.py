import os
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.services.job_api_service import RealTimeJobService, clean_html

client = TestClient(app)

def test_clean_html_utility():
    sample_html = "<p>We are looking for a <strong>Senior Engineer</strong>.</p><ul><li>Python</li><li>Docker</li></ul>"
    cleaned = clean_html(sample_html)
    assert "We are looking for a Senior Engineer." in cleaned
    assert "Python" in cleaned
    assert "<p>" not in cleaned
    assert "<ul>" not in cleaned

def test_live_providers_metadata():
    providers = RealTimeJobService.get_providers_status()
    assert len(providers) >= 2
    ids = [p["id"] for p in providers]
    assert "remotive" in ids
    assert "arbeitnow" in ids

def test_sync_live_jobs_endpoint():
    # Login as demo user
    login_res = client.post("/api/auth/login", json={"email": "demo@example.com", "password": "Demo@123"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Mock fetch_remotive_jobs to return mock items
    mock_remotive = [
        {
            "title": "Staff AI Platform Engineer (Real-Time)",
            "company": "LiveTech Global Labs",
            "location": "Remote - Worldwide",
            "description": "Looking for a Staff AI Engineer with Python, PyTorch, Kubernetes, and FastAPI.",
            "required_skills": ["Python", "PyTorch", "Kubernetes", "FastAPI"],
            "experience_required": 4,
            "salary_range": "$160,000 - $190,000",
            "job_type": "Full-time",
            "remote_status": "Remote",
            "source": "Remotive",
            "external_url": "https://remotive.com/job/test-1",
            "is_realtime": True,
        }
    ]

    with patch.object(RealTimeJobService, "fetch_remotive_jobs", return_value=mock_remotive), \
         patch.object(RealTimeJobService, "fetch_arbeitnow_jobs", return_value=[]):
        res = client.post("/api/jobs/sync-live?limit_per_source=5", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert any("Remotive" in s for s in data["sources"])

        # Verify job is in database and searchable
        search_res = client.get("/api/jobs?q=LiveTech", headers=headers)
        assert search_res.status_code == 200
        items = search_res.json()["items"]
        assert len(items) >= 1
        assert items[0]["company"] == "LiveTech Global Labs"
        assert items[0]["is_realtime"] is True
        assert items[0]["external_url"] == "https://remotive.com/job/test-1"

def test_get_live_providers_endpoint():
    login_res = client.post("/api/auth/login", json={"email": "demo@example.com", "password": "Demo@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/jobs/live-providers", headers=headers)
    assert res.status_code == 200
    providers = res.json()
    assert len(providers) >= 2

def test_fetch_india_market_jobs():
    jobs = RealTimeJobService.fetch_india_market_jobs(limit=10)
    assert len(jobs) >= 5
    first_job = jobs[0]
    assert "company" in first_job
    assert "title" in first_job
    assert "₹" in first_job["salary_range"]
    assert len(first_job["required_skills"]) > 0

def test_sync_india_jobs_endpoint():
    login_res = client.post("/api/auth/login", json={"email": "demo@example.com", "password": "Demo@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/api/jobs/sync-india?limit=10", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["region"] == "india"

    # Search for Indian jobs
    search_res = client.get("/api/jobs?india_only=true", headers=headers)
    assert search_res.status_code == 200
    items = search_res.json()["items"]
    assert len(items) >= 1
    assert any("India" in (j.get("location") or "") or "Bengaluru" in (j.get("location") or "") for j in items)
