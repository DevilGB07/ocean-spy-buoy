from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.ais_vessel import AISVessel
from app.schemas import AISVesselResponse, AISVesselCreate
from app.services.ais_matching_service import match_detection_with_ais

router = APIRouter(prefix="/ais", tags=["AIS"])

@router.get("/vessels", response_model=List[AISVesselResponse], summary="List all simulated AIS vessels")
def list_ais_vessels(db: Session = Depends(get_db)):
    """
    Returns simulated AIS broadcast positions.
    DISCLAIMER: This data is simulated for demo purposes and does NOT represent real-time AIS.
    """
    return db.query(AISVessel).all()

@router.post("/vessels", response_model=AISVesselResponse, status_code=201, summary="Register an AIS vessel")
def create_ais_vessel(vessel_in: AISVesselCreate, db: Session = Depends(get_db)):
    existing = db.query(AISVessel).filter(AISVessel.mmsi == vessel_in.mmsi).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Vessel with MMSI '{vessel_in.mmsi}' already exists.")
        
    vessel = AISVessel(**vessel_in.dict(), timestamp=datetime.utcnow())
    db.add(vessel)
    db.commit()
    db.refresh(vessel)
    return vessel

@router.post("/match", summary="Test physical detection correlation with AIS targets")
def match_ais(
    latitude: float,
    longitude: float,
    vessel_type: str,
    db: Session = Depends(get_db)
):
    all_ais = db.query(AISVessel).all()
    return match_detection_with_ais(
        estimated_lat=latitude,
        estimated_lon=longitude,
        vessel_type=vessel_type,
        detection_time=datetime.utcnow(),
        ais_vessels=all_ais
    )
