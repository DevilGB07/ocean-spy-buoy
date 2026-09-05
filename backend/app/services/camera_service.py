from typing import Dict, Any, Optional

def verify_camera_feed(
    camera_confirmed: bool = False,
    vessel_type: str = "Tanker",
    bearing_deg: float = 127.0
) -> Dict[str, Any]:
    """
    Simulates optical verification via mast-mounted camera or drone reconnaissance.
    Provides visual validation layer to confirm physical presence on surface.
    """
    if camera_confirmed:
        return {
            "status": "VESSEL DETECTED",
            "confirmed": True,
            "description": f"Optical signature confirmed surface vessel at bearing {bearing_deg:.1f}°.",
            "image_url": f"/static/camera/snapshot_{vessel_type.lower()}_confirmed.jpg",
            "confidence": 0.95
        }
    else:
        return {
            "status": "NO VISUAL CONFIRMATION",
            "confirmed": False,
            "description": "No visual contact established (range, weather, or obscured horizon).",
            "image_url": None,
            "confidence": 0.0
        }
