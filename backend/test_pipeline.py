import pytest
import asyncio
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.buoy import Buoy
from app.models.detection import Detection
from app.models.alert import Alert
from app.models.evidence import EvidenceRecord
from app.services.localization_service import calculate_estimated_position, haversine_distance_km
from app.services.risk_engine import calculate_risk_score
from app.services.evidence_service import generate_evidence_record, verify_evidence_record
from app.simulation.simulation_engine import (
    seed_initial_data,
    trigger_normal_scenario,
    trigger_mismatch_scenario,
    trigger_dark_vessel_scenario
)

# In-memory SQLite for testing
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_localization_math():
    """Verify great circle forward calculation."""
    buoy_lat, buoy_lon = 19.0760, 72.8777
    est_lat, est_lon = calculate_estimated_position(buoy_lat, buoy_lon, 1.2, 127.0)
    
    # Distance back to buoy should match 1.2 km within 0.05 km
    dist = haversine_distance_km(buoy_lat, buoy_lon, est_lat, est_lon)
    assert abs(dist - 1.2) < 0.05

def test_risk_scoring_engine():
    """Verify explainable risk scoring rules."""
    # Scenario 1: Tanker, AIS matched, low risk
    norm = calculate_risk_score(
        vessel_type="Tanker",
        ai_confidence=0.91,
        camera_confirmed=True,
        ais_status="VERIFIED",
        distance_km=0.8
    )
    assert norm["risk_score"] < 30
    assert norm["status"] == "VERIFIED_VESSEL"
    assert norm["severity"] == "LOW"
    
    # Scenario 2: AIS Mismatch
    mismatch = calculate_risk_score(
        vessel_type="Tanker",
        ai_confidence=0.91,
        camera_confirmed=True,
        ais_status="PHYSICAL_AIS_MISMATCH",
        distance_km=1.1
    )
    assert mismatch["risk_score"] >= 60
    assert mismatch["status"] == "PHYSICAL_AIS_MISMATCH"

def test_evidence_hashing_and_tamper_detection():
    """Verify SHA-256 canonical hashing and tamper-evident detection."""
    now = datetime.utcnow()
    evidence = generate_evidence_record(
        detection_id=999,
        buoy_id="OSB-001",
        timestamp=now,
        vessel_type="Tanker",
        confidence=0.91,
        latitude=19.0760,
        longitude=72.8777,
        distance_km=1.2,
        bearing=127.0,
        ais_status="NO_AIS_MATCH",
        camera_confirmed=True,
        risk_score=82,
        alert_type="POSSIBLE_DARK_VESSEL"
    )
    
    assert len(evidence["sha256_hash"]) == 64
    assert evidence["signature"] is not None
    
    # Verify authentic payload
    verify_result = verify_evidence_record(
        canonical_payload=evidence["canonical_payload"],
        stored_sha256=evidence["sha256_hash"],
        stored_signature=evidence["signature"],
        public_key_pem=evidence["public_key"]
    )
    assert verify_result["valid"] is True
    assert "✓ EVIDENCE INTEGRITY VERIFIED" in verify_result["status_message"]
    
    # Tamper test: Alter one character in canonical JSON payload
    tampered_payload = evidence["canonical_payload"].replace("Tanker", "Cargo")
    tampered_result = verify_evidence_record(
        canonical_payload=tampered_payload,
        stored_sha256=evidence["sha256_hash"],
        stored_signature=evidence["signature"],
        public_key_pem=evidence["public_key"]
    )
    assert tampered_result["valid"] is False
    assert "✕ EVIDENCE MODIFIED" in tampered_result["status_message"]

def test_full_pipeline_scenarios():
    """Test full database simulation scenarios: Normal, Mismatch, Dark Vessel."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        seed_initial_data(db)
        
        # Test 1: Normal Scenario
        res_normal = asyncio.run(trigger_normal_scenario(db))
        assert res_normal["detection"]["status"] == "VERIFIED_VESSEL"
        assert res_normal["detection"]["ais_status"] == "VERIFIED"
        assert res_normal["detection"]["risk_score"] < 30
        
        # Test 2: Mismatch Scenario
        res_mismatch = asyncio.run(trigger_mismatch_scenario(db))
        assert res_mismatch["detection"]["status"] == "PHYSICAL_AIS_MISMATCH"
        assert res_mismatch["detection"]["ais_status"] == "PHYSICAL_AIS_MISMATCH"
        assert res_mismatch["alert"] is not None
        
        # Test 3: Dark Vessel Scenario (The 3-Minute Demo Benchmark)
        res_dark = asyncio.run(trigger_dark_vessel_scenario(db))
        assert res_dark["detection"]["status"] == "POSSIBLE_DARK_VESSEL"
        assert res_dark["detection"]["ais_status"] == "NO_AIS_MATCH"
        assert res_dark["detection"]["confidence"] == 0.91
        assert res_dark["detection"]["risk_score"] == 82
        assert res_dark["evidence"]["sha256_hash"] is not None
        assert res_dark["alert"]["severity"] == "CRITICAL"
        
    finally:
        db.close()

if __name__ == "__main__":
    test_localization_math()
    test_risk_scoring_engine()
    test_evidence_hashing_and_tamper_detection()
    test_full_pipeline_scenarios()
    print("ALL TESTS PASSED SUCCESSFULLY!")
