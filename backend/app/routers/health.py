from fastapi import APIRouter
from app.config import settings

router = APIRouter(tags=["System"])

@router.get("/health", summary="System Health and Status")
def get_health():
    """
    Returns system status, active operation mode, and release version.
    """
    return {
        "status": "online",
        "mode": settings.MODE.lower(),
        "version": settings.VERSION,
        "tagline": settings.TAGLINE,
        "active_buoy": "OSB-001"
    }
