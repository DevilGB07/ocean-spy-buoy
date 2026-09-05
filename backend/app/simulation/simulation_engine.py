import random
import json
from datetime import datetime, timedelta
from typing import Dict, Any
from sqlalchemy.orm import Session

from app.models.buoy import Buoy
from app.models.ais_vessel import AISVessel
from app.models.detection import Detection
from app.models.alert import Alert
from app.models.evidence import EvidenceRecord
from app.models.system_event import SystemEvent
from app.services.sensor_fusion_service import process_detection_pipeline
from app.services.evidence_service import generate_evidence_record
from app.config import settings

def seed_initial_data(db: Session):
    """
    Seeds realistic simulation data:
    - 3 buoys (OSB-001, OSB-002, OSB-003)
    - 8 AIS vessels with fictional names
    - 20+ historical detections
    - 10+ historical alerts
    """
    # 1. Seed Buoys
    if db.query(Buoy).count() == 0:
        buoys = [
            Buoy(
                id="OSB-001",
                name="Sentinel Alpha - Harbor Approach",
                latitude=19.0760,
                longitude=72.8777,
                status="ONLINE",
                battery_level=98.5,
                firmware_version="v1.4.2-tinyML",
                detection_radius_km=5.0,
                hydrophone_health="OPTIMAL"
            ),
            Buoy(
                id="OSB-002",
                name="Sentinel Bravo - Deep Channel Gate",
                latitude=18.9850,
                longitude=72.7600,
                status="ONLINE",
                battery_level=94.2,
                firmware_version="v1.4.2-tinyML",
                detection_radius_km=6.0,
                hydrophone_health="OPTIMAL"
            ),
            Buoy(
                id="OSB-003",
                name="Sentinel Charlie - Coastal Reef Line",
                latitude=19.1450,
                longitude=72.9200,
                status="ONLINE",
                battery_level=87.0,
                firmware_version="v1.4.0-tinyML",
                detection_radius_km=4.5,
                hydrophone_health="OPTIMAL"
            )
        ]
        db.add_all(buoys)
        db.commit()
        
    # 2. Seed AIS Vessels (Fictional vessels in simulation perimeter)
    if db.query(AISVessel).count() == 0:
        ais_vessels = [
            AISVessel(
                mmsi="563912000",
                name="MV Ocean Star",
                vessel_type="Tanker",
                latitude=19.0832,
                longitude=72.8845,
                speed=12.4,
                heading=127.0,
                timestamp=datetime.utcnow()
            ),
            AISVessel(
                mmsi="235891040",
                name="Pacific Falcon",
                vessel_type="Cargo",
                latitude=19.0795,
                longitude=72.8720,
                speed=14.1,
                heading=210.0,
                timestamp=datetime.utcnow()
            ),
            AISVessel(
                mmsi="412890123",
                name="Sea Harvester VII",
                vessel_type="Fishing",
                latitude=19.0550,
                longitude=72.8550,
                speed=7.2,
                heading=45.0,
                timestamp=datetime.utcnow()
            ),
            AISVessel(
                mmsi="319200889",
                name="Arabian Breeze",
                vessel_type="Passenger",
                latitude=19.0980,
                longitude=72.8950,
                speed=18.5,
                heading=180.0,
                timestamp=datetime.utcnow()
            ),
            AISVessel(
                mmsi="636015789",
                name="Global Trader",
                vessel_type="Cargo",
                latitude=18.9700,
                longitude=72.7400,
                speed=11.8,
                heading=315.0,
                timestamp=datetime.utcnow()
            ),
            AISVessel(
                mmsi="538004123",
                name="Neptune Explorer",
                vessel_type="Tanker",
                latitude=19.1200,
                longitude=72.9100,
                speed=10.5,
                heading=90.0,
                timestamp=datetime.utcnow()
            ),
            AISVessel(
                mmsi="211456000",
                name="Coral Wave",
                vessel_type="Fishing",
                latitude=19.1550,
                longitude=72.9350,
                speed=6.0,
                heading=270.0,
                timestamp=datetime.utcnow()
            ),
            AISVessel(
                mmsi="477234900",
                name="Oriental Highway",
                vessel_type="Cargo",
                latitude=18.9950,
                longitude=72.7750,
                speed=13.2,
                heading=140.0,
                timestamp=datetime.utcnow()
            )
        ]
        db.add_all(ais_vessels)
        db.commit()
        
    # 3. Seed Historical Detections and Alerts (24 historical points)
    if db.query(Detection).count() == 0:
        base_time = datetime.utcnow() - timedelta(hours=24)
        sample_scenarios = [
            ("Tanker", 0.92, 1.1, 125.0, True, "VERIFIED", 18, "VERIFIED_VESSEL", "563912000", "Tanker"),
            ("Cargo", 0.89, 2.3, 210.0, True, "VERIFIED", 22, "VERIFIED_VESSEL", "235891040", "Cargo"),
            ("Fishing", 0.86, 3.4, 45.0, False, "VERIFIED", 20, "VERIFIED_VESSEL", "412890123", "Fishing"),
            ("Tanker", 0.91, 1.4, 130.0, True, "PHYSICAL_AIS_MISMATCH", 68, "PHYSICAL_AIS_MISMATCH", "235891040", "Cargo"),
            ("Cargo", 0.90, 1.8, 310.0, True, "VERIFIED", 15, "VERIFIED_VESSEL", "636015789", "Cargo"),
            ("Tanker", 0.91, 1.2, 127.0, True, "NO_AIS_MATCH", 82, "POSSIBLE_DARK_VESSEL", None, None),
            ("Passenger", 0.88, 2.8, 185.0, True, "VERIFIED", 19, "VERIFIED_VESSEL", "319200889", "Passenger"),
            ("Fishing", 0.84, 1.9, 280.0, False, "PHYSICAL_AIS_MISMATCH", 62, "PHYSICAL_AIS_MISMATCH", "563912000", "Tanker"),
            ("Cargo", 0.93, 2.1, 140.0, True, "VERIFIED", 14, "VERIFIED_VESSEL", "477234900", "Cargo"),
            ("Tanker", 0.91, 1.5, 95.0, True, "VERIFIED", 16, "VERIFIED_VESSEL", "538004123", "Tanker"),
            ("Tanker", 0.91, 1.3, 128.0, True, "NO_AIS_MATCH", 82, "POSSIBLE_DARK_VESSEL", None, None),
            ("Cargo", 0.87, 3.1, 330.0, False, "VERIFIED", 24, "VERIFIED_VESSEL", "636015789", "Cargo"),
        ]
        
        for i, s in enumerate(sample_scenarios):
            v_type, conf, dist, bearing, cam, ais_st, risk, status, mmsi, m_type = s
            det_time = base_time + timedelta(hours=i * 2)
            
            det = Detection(
                buoy_id="OSB-001" if i % 2 == 0 else "OSB-002",
                timestamp=det_time,
                vessel_type=v_type,
                confidence=conf,
                latitude=19.0760 + (dist * 0.008),
                longitude=72.8777 + (dist * 0.008),
                distance_km=dist,
                bearing=bearing,
                audio_source="Hydrophone Array A (48kHz)",
                audio_level_db=-31.5,
                dominant_frequency_hz=142.5,
                camera_confirmed=cam,
                camera_image_url=f"/static/camera/snapshot_{v_type.lower()}.jpg" if cam else None,
                ais_status=ais_st,
                ais_matched_mmsi=mmsi,
                ais_matched_type=m_type,
                risk_score=risk,
                status=status,
                reasons=json.dumps([
                    f"Acoustic classification identified {v_type}",
                    f"AIS cross-match returned '{ais_st}'",
                    f"Visual camera confirmation: {'Confirmed' if cam else 'None'}"
                ]),
                recommendation="Investigate physical/AIS discrepancy" if risk >= 60 else "Standard routine tracking"
            )
            db.add(det)
            db.commit()
            db.refresh(det)
            
            # Add Evidence Record
            ev = generate_evidence_record(
                detection_id=det.id,
                buoy_id=det.buoy_id,
                timestamp=det.timestamp,
                vessel_type=det.vessel_type,
                confidence=det.confidence,
                latitude=det.latitude,
                longitude=det.longitude,
                distance_km=det.distance_km,
                bearing=det.bearing,
                ais_status=det.ais_status,
                camera_confirmed=det.camera_confirmed,
                risk_score=det.risk_score,
                alert_type=det.status
            )
            ev_rec = EvidenceRecord(
                detection_id=det.id,
                canonical_payload=ev["canonical_payload"],
                sha256_hash=ev["sha256_hash"],
                signature=ev["signature"],
                public_key=ev["public_key"],
                created_at=det_time
            )
            db.add(ev_rec)
            
            # Add Alert if high risk
            if risk >= 60:
                alert = Alert(
                    detection_id=det.id,
                    type=status,
                    severity="CRITICAL" if risk >= 80 else "HIGH",
                    risk_score=risk,
                    message=f"{status.replace('_', ' ')} detected: {v_type} with AIS status '{ais_st}'.",
                    reasons=det.reasons,
                    created_at=det_time,
                    acknowledged=(i < 6) # older alerts marked acknowledged
                )
                db.add(alert)
                
            db.commit()
            
        sys_event = SystemEvent(
            event_type="SYSTEM_INITIALIZED",
            message="Database initialized with simulated buoys, AIS vessels, and historical telemetry.",
            created_at=datetime.utcnow()
        )
        db.add(sys_event)
        db.commit()

async def trigger_normal_scenario(db: Session) -> Dict[str, Any]:
    """
    SCENARIO 1 — VERIFIED VESSEL:
    Acoustic: Tanker (91%)
    AIS: Matching tanker nearby
    Camera: Confirmed
    Result: VERIFIED VESSEL, Risk: LOW
    """
    return await process_detection_pipeline(
        db=db,
        buoy_id="OSB-001",
        vessel_type_override="Tanker",
        confidence_override=0.91,
        distance_km=0.8,
        bearing_deg=127.0,
        camera_confirmed=True,
        ais_scenario_mode="NORMAL"
    )

async def trigger_mismatch_scenario(db: Session) -> Dict[str, Any]:
    """
    SCENARIO 2 — AIS MISMATCH:
    Acoustic: Tanker (91%)
    AIS: Cargo vessel nearby
    Camera: Confirmed
    Result: PHYSICAL/AIS DISCREPANCY, Risk: MEDIUM/HIGH (~68)
    """
    return await process_detection_pipeline(
        db=db,
        buoy_id="OSB-001",
        vessel_type_override="Tanker",
        confidence_override=0.91,
        distance_km=1.1,
        bearing_deg=135.0,
        camera_confirmed=True,
        ais_scenario_mode="MISMATCH"
    )

async def trigger_dark_vessel_scenario(db: Session) -> Dict[str, Any]:
    """
    SCENARIO 3 — POSSIBLE DARK VESSEL (The 3-Minute Demo Core):
    Acoustic: Tanker (91%)
    AIS: No matching vessel
    Camera: Confirmed
    Result: POSSIBLE DARK VESSEL, Risk: 82 / 100, Evidence: SHA-256 Verified
    """
    return await process_detection_pipeline(
        db=db,
        buoy_id="OSB-001",
        vessel_type_override="Tanker",
        confidence_override=0.91,
        distance_km=1.2,
        bearing_deg=127.0,
        camera_confirmed=True,
        ais_scenario_mode="DARK"
    )
