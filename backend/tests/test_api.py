import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_demo_login(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "demo@example.com", "password": "Demo@123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "demo@example.com"

def test_admin_login(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "Admin@123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "admin"

def test_search_jobs(client):
    login_res = client.post("/api/auth/login", json={"email": "demo@example.com", "password": "Demo@123"})
    token = login_res.json()["access_token"]
    
    response = client.get("/api/jobs", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 20
    assert len(data["items"]) > 0
