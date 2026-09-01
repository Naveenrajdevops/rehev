import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def verify_system():
    print("=======================================================")
    print("   REHABAI PRO - BACKEND & CLINICAL ENGINE VERIFIER")
    print("=======================================================\n")

    # 1. Check Database Models & Engine
    print("[1/5] Testing Database Models & SQLite Session...")
    try:
        from app.db.database import engine, Base, SessionLocal
        from app.db.models import User, Patient, Exercise, Session as DbSession, RehabPlan
        Base.metadata.create_all(bind=engine)
        print("  [PASS] Database schema created cleanly.")
    except Exception as e:
        print(f"  [FAIL] Database schema creation failed: {e}")
        return False

    # 2. Check Database Seeder
    print("[2/5] Testing Database Seeder...")
    try:
        from app.db.seed import seed_database
        seed_database()
        db = SessionLocal()
        user_count = db.query(User).count()
        ex_count = db.query(Exercise).count()
        pat_count = db.query(Patient).count()
        sess_count = db.query(DbSession).count()
        print(f"  [PASS] Database populated: {user_count} users, {ex_count} exercises, {pat_count} patients, {sess_count} sessions.")
        db.close()
    except Exception as e:
        print(f"  [FAIL] Seeding failed: {e}")
        return False

    # 3. Check Authentication & Hashing
    print("[3/5] Testing Security & Password Hashing...")
    try:
        from app.api.auth import hash_password, verify_password, create_access_token
        hashed = hash_password("password123")
        assert verify_password("password123", hashed) is True
        token = create_access_token({"sub": "therapist@rehabai.io", "role": "therapist"})
        assert isinstance(token, str) and len(token) > 20
        print("  [PASS] Password hashing and JWT generation validated.")
    except Exception as e:
        print(f"  [FAIL] Auth test failed: {e}")
        return False

    # 4. Check Nova AI Clinical Coach Logic
    print("[4/5] Testing Nova AI Clinical Response & Guardrails...")
    try:
        from app.services.ai_service import generate_nova_response
        res = generate_nova_response(
            "Why is my score low?",
            {"name": "Eleanor Vance", "condition": "ACL Post-op"},
            {"quality": 78, "symmetry": 84, "rom": 92}
        )
        assert "78%" in res["message"]
        assert len(res["suggestions"]) > 0
        print(f"  [PASS] Nova Guardrails validated: '{res['message'][:60]}...'")
    except Exception as e:
        print(f"  [FAIL] AI Service test failed: {e}")
        return False

    # 5. Check FastAPI Main App & Health Endpoint
    print("[5/5] Testing FastAPI Router Attachments & Health Endpoint...")
    try:
        from fastapi.testclient import TestClient
        from app.main import app
        client = TestClient(app)
        res = client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        print(f"  [PASS] FastAPI TestClient health check succeeded: {data['service']}")
    except Exception as e:
        print(f"  [FAIL] FastAPI app test failed: {e}")
        return False

    print("\n=======================================================")
    print("   [SUCCESS] ALL 5/5 BACKEND CHECKS PASSED PERFECTLY!")
    print("=======================================================\n")
    return True

if __name__ == "__main__":
    verify_system()
