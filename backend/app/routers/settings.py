from fastapi import APIRouter
from app.config import settings
from app.schemas import SystemSettingsModel

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=SystemSettingsModel, summary="Get system operational thresholds")
def get_settings():
    return SystemSettingsModel(
        MAX_DISTANCE_KM=settings.MAX_DISTANCE_KM,
        MAX_TIME_DIFFERENCE_SECONDS=settings.MAX_TIME_DIFFERENCE_SECONDS,
        ALERT_HIGH_THRESHOLD=settings.ALERT_HIGH_THRESHOLD,
        ALERT_CRITICAL_THRESHOLD=settings.ALERT_CRITICAL_THRESHOLD,
        MODE=settings.MODE
    )

@router.patch("", response_model=SystemSettingsModel, summary="Update system operational thresholds")
def update_settings(new_settings: SystemSettingsModel):
    settings.MAX_DISTANCE_KM = new_settings.MAX_DISTANCE_KM
    settings.MAX_TIME_DIFFERENCE_SECONDS = new_settings.MAX_TIME_DIFFERENCE_SECONDS
    settings.ALERT_HIGH_THRESHOLD = new_settings.ALERT_HIGH_THRESHOLD
    settings.ALERT_CRITICAL_THRESHOLD = new_settings.ALERT_CRITICAL_THRESHOLD
    settings.MODE = new_settings.MODE
    
    return get_settings()
