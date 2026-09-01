import math
import pytest
from app.api.auth import verify_password, hash_password
from app.services.ai_service import generate_nova_response

def test_password_hashing():
    pw = "clinicalPassword2026"
    hashed = hash_password(pw)
    assert verify_password(pw, hashed) is True
    assert verify_password("wrongPassword", hashed) is False

def test_nova_clinical_response_rules():
    # Test response to low score without diagnosing
    res = generate_nova_response("Why is my movement score low?", None, {"quality": 78, "symmetry": 85})
    assert "78%" in res["message"]
    assert "diagnostic" not in res["message"].lower() or "not" in res["message"].lower()
    assert len(res["suggestions"]) > 0

def test_nova_pain_safety_notice():
    # Test response when user mentions stiffness/pain
    res = generate_nova_response("My knee is feeling stiff and painful today.", None, None)
    assert "physiotherapist" in res["message"].lower() or "clinician" in res["message"].lower()
    assert "pause" in res["message"].lower() or "stop" in res["message"].lower()
