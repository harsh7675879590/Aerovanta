from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "AEROVANTA"

def test_evaluation_endpoint_validation():
    # Valid date format
    response = client.get("/api/procurement/evaluation?date=2026-01-10&cutoff_preset=day_ahead_11am")
    assert response.status_code == 200
    data = response.json()
    assert data["target_date"] == "2026-01-10"
    assert data["cutoff_preset"] == "day_ahead_11am"
    assert len(data["intervals"]) == 48

def test_evaluation_endpoint_invalid_date():
    response = client.get("/api/procurement/evaluation?date=invalid-date")
    assert response.status_code == 422

def test_status_endpoint():
    response = client.get("/api/procurement/status")
    assert response.status_code == 200
    data = response.json()
    assert "database_records" in data

