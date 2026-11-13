"""Integration tests for FastAPI REST endpoints."""

import io
import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_api_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["qubits"] == 4
    assert data["quantum_params"] == 12


def test_api_benchmarks():
    res = client.get("/benchmarks")
    assert res.status_code == 200


def test_api_hardware_endpoints():
    res_ibm = client.get("/hardware/ibm-brisbane")
    assert res_ibm.status_code == 200
    assert "hardware_metrics" in res_ibm.json()

    res_noise = client.get("/hardware/noise-sweep")
    assert res_noise.status_code == 200
    assert "sweep_results" in res_noise.json()


def test_predict_features():
    dummy_feat = [0.05] * 512
    res = client.post("/predict/features", json={"features": dummy_feat})
    assert res.status_code == 200
    data = res.json()

    assert 0 <= data["grade"] <= 4
    assert len(data["probabilities"]) == 5
    assert len(data["angles_rad"]) == 4
    assert len(data["bloch_vectors"]) == 4
    assert data["latency_ms"] > 0


def test_predict_image():
    # Synthetic fundus circle
    img = np.zeros((224, 224, 3), dtype=np.uint8)
    cv2.circle(img, (112, 112), 90, (20, 60, 180), -1)

    success, buf = cv2.imencode(".png", img)
    assert success
    img_bytes = io.BytesIO(buf.tobytes())

    res = client.post("/predict/image", files={"file": ("fundus.png", img_bytes, "image/png")})
    assert res.status_code == 200
    data = res.json()

    assert 0 <= data["grade"] <= 4
    assert data["clahe_image_b64"].startswith("data:image/png;base64,")
    assert len(data["angles_rad"]) == 4


def test_predict_image_rejects_ood():
    # Synthetic out-of-distribution image (e.g. white ID card / document)
    doc_img = np.full((224, 224, 3), 240, dtype=np.uint8)
    # Add fake black text
    cv2.putText(doc_img, "ID CARD", (30, 100), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 0), 2)

    success, buf = cv2.imencode(".png", doc_img)
    assert success
    img_bytes = io.BytesIO(buf.tobytes())

    res = client.post("/predict/image", files={"file": ("id_card.png", img_bytes, "image/png")})
    assert res.status_code == 422
    assert "Out-of-Distribution Image Rejected" in res.json()["detail"]


