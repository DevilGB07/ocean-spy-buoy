from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.risk_engine import calculate_risk_score

router = APIRouter(prefix="/risk", tags=["Risk Engine"])

class RiskCalcRequest(BaseModel):
    vessel_type: str = "Tanker"
    ai_confidence: float = 0.91
    camera_confirmed: bool = True
    ais_status: str = "NO_AIS_MATCH"  # VERIFIED, PHYSICAL_AIS_MISMATCH, NO_AIS_MATCH
    distance_km: float = 1.2

@router.post("/calculate", summary="Calculate explainable risk score")
def calculate_risk(payload: RiskCalcRequest):
    """
    Computes explainable investigation priority (0-100).
    Never claims proof of illegal activity.
    """
    return calculate_risk_score(
        vessel_type=payload.vessel_type,
        ai_confidence=payload.ai_confidence,
        camera_confirmed=payload.camera_confirmed,
        ais_status=payload.ais_status,
        distance_km=payload.distance_km
    )
