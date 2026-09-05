import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.detection import Detection
from app.schemas import DetectionResponse, HardwareDetectionIngest
from app.services.sensor_fusion_service import process_detection_pipeline

router = APIRouter(prefix="/detections", tags=["Detections"])

@router.get("", response_model=List[DetectionResponse], summary="List physical acoustic detections")
def list_detections(
    status: Optional[str] = Query(None, description="Filter by status (VERIFIED_VESSEL, PHYSICAL_AIS_MISMATCH, POSSIBLE_DARK_VESSEL)"),
    vessel_type: Optional[str] = Query(None, description="Filter by vessel type"),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Detection).order_by(Detection.timestamp.desc())
    if status:
        query = query.filter(Detection.status == status)
    if vessel_type:
        query = query.filter(Detection.vessel_type == vessel_type)
        
    detections = query.limit(limit).all()
    
    # Unpack JSON reasons into list
    results = []
    for d in detections:
        d_resp = DetectionResponse.from_orm(d)
        try:
            d_resp.reasons_list = json.loads(d.reasons) if d.reasons else []
        except Exception:
            d_resp.reasons_list = [d.reasons]
        results.append(d_resp)
        
    return results

@router.get("/{detection_id}", response_model=DetectionResponse, summary="Get detection by ID")
def get_detection(detection_id: int, db: Session = Depends(get_db)):
    detection = db.query(Detection).filter(Detection.id == detection_id).first()
    if not detection:
        raise HTTPException(status_code=404, detail=f"Detection #{detection_id} not found.")
        
    d_resp = DetectionResponse.from_orm(detection)
    try:
        d_resp.reasons_list = json.loads(detection.reasons) if detection.reasons else []
    except Exception:
        d_resp.reasons_list = [detection.reasons]
    return d_resp

@router.post("", summary="Hardware Ingest Pipeline (ESP32-S3 / Hydrophone / GPS)")
async def ingest_hardware_detection(
    payload: HardwareDetectionIngest,
    db: Session = Depends(get_db)
):
    """
    Hardware integration endpoint (Section 33):
    Accepts physical telemetry from ESP32-S3 hydrophone microcontroller
    and runs it through the exact same sensor fusion pipeline.
    """
    result = await process_detection_pipeline(
        db=db,
        buoy_id=payload.buoy_id,
        vessel_type_override=payload.vessel_type_override,
        distance_km=payload.distance_km or 1.2,
        bearing_deg=payload.bearing or 127.0,
        camera_confirmed=payload.camera_confirmed or False
    )
    return result

@router.post("/simulate", summary="Simulate custom detection parameters")
async def simulate_custom_detection(
    buoy_id: str = "OSB-001",
    vessel_type: str = "Tanker",
    confidence: float = 0.91,
    distance_km: float = 1.2,
    bearing_deg: float = 127.0,
    camera_confirmed: bool = True,
    ais_scenario_mode: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Executes the pipeline with custom simulation variables."""
    return await process_detection_pipeline(
        db=db,
        buoy_id=buoy_id,
        vessel_type_override=vessel_type,
        confidence_override=confidence,
        distance_km=distance_km,
        bearing_deg=bearing_deg,
        camera_confirmed=camera_confirmed,
        ais_scenario_mode=ais_scenario_mode
    )
