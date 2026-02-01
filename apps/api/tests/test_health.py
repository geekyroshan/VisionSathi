"""
Tests for health endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_endpoint():
    """Test that health endpoint returns 200."""
    response = client.get("/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "version" in data
    assert "model_loaded" in data


def test_ready_endpoint():
    """Test readiness endpoint."""
    response = client.get("/ready")
    assert response.status_code == 200

    data = response.json()
    assert "ready" in data


def test_root_endpoint():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200

    data = response.json()
    assert data["name"] == "VisionSathi API"
    assert data["status"] == "running"
