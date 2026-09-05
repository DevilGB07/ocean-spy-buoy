from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.simulation.simulation_engine import (
    trigger_normal_scenario,
    trigger_mismatch_scenario,
    trigger_dark_vessel_scenario,
    seed_initial_data
)

router = APIRouter(prefix="/simulation", tags=["Simulation Engine"])

@router.post("/normal", summary="Trigger Scenario 1: Verified Vessel")
async def simulate_normal(db: Session = Depends(get_db)):
    """
    Executes Scenario 1:
    Acoustic: Tanker (91% confidence)
    AIS: Matching Tanker nearby
    Camera: Confirmed
    Result: VERIFIED VESSEL (Low Risk)
    """
    return await trigger_normal_scenario(db)

@router.post("/mismatch", summary="Trigger Scenario 2: AIS Mismatch")
async def simulate_mismatch(db: Session = Depends(get_db)):
    """
    Executes Scenario 2:
    Acoustic: Tanker (91% confidence)
    AIS: Cargo vessel nearby
    Camera: Confirmed
    Result: PHYSICAL/AIS DISCREPANCY (Medium/High Risk)
    """
    return await trigger_mismatch_scenario(db)

@router.post("/dark-vessel", summary="Trigger Scenario 3: Possible Dark Vessel")
async def simulate_dark_vessel(db: Session = Depends(get_db)):
    """
    Executes Scenario 3 (The 3-Minute Demo Core):
    Acoustic: Tanker (91% confidence)
    AIS: No matching vessel found
    Camera: Vessel confirmed on surface
    Result: POSSIBLE DARK VESSEL (Risk 82/100, High/Critical Alert, SHA-256 evidence)
    """
    return await trigger_dark_vessel_scenario(db)

@router.post("/seed", summary="Reset and re-seed sample telemetry")
def seed_demo_data(db: Session = Depends(get_db)):
    """Re-seeds simulated buoys, AIS vessels, and historical telemetry."""
    seed_initial_data(db)
    return {"status": "success", "message": "Simulation data successfully seeded"}
