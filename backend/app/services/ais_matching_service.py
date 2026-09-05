from typing import List, Dict, Any, Optional
from datetime import datetime
from app.services.localization_service import haversine_distance_km
from app.config import settings

def match_detection_with_ais(
    estimated_lat: float,
    estimated_lon: float,
    vessel_type: str,
    detection_time: datetime,
    ais_vessels: List[Any],
    max_distance_km: Optional[float] = None,
    max_time_diff_seconds: Optional[int] = None
) -> Dict[str, Any]:
    """
    Cross-matches an acoustic/physical detection with simulated AIS vessels.
    Evaluates geographical proximity, temporal delta, and classification type congruency.
    
    Status results:
    - VERIFIED: Nearby AIS vessel matches AI acoustic classification.
    - PHYSICAL_AIS_MISMATCH: Nearby AIS vessel broadcast differs from AI acoustic classification.
    - NO_AIS_MATCH: No active AIS transmission found in physical detection range.
    """
    max_dist = max_distance_km if max_distance_km is not None else settings.MAX_DISTANCE_KM
    max_time = max_time_diff_seconds if max_time_diff_seconds is not None else settings.MAX_TIME_DIFFERENCE_SECONDS
    
    closest_vessel = None
    min_distance = float('inf')
    time_diff = 0
    
    for vessel in ais_vessels:
        # Distance calculation
        dist = haversine_distance_km(estimated_lat, estimated_lon, vessel.latitude, vessel.longitude)
        
        # Time difference calculation (in seconds)
        v_time = getattr(vessel, "timestamp", datetime.utcnow())
        delta_sec = abs((detection_time - v_time).total_seconds()) if detection_time and v_time else 0
        
        if dist <= max_dist and delta_sec <= max_time:
            if dist < min_distance:
                min_distance = dist
                time_diff = int(delta_sec)
                closest_vessel = vessel
                
    if not closest_vessel:
        return {
            "status": "NO_AIS_MATCH",
            "matched_vessel_id": None,
            "matched_mmsi": None,
            "matched_name": None,
            "matched_type": None,
            "distance_km": None,
            "time_difference_seconds": None,
            "details": "No active AIS vessel found within physical surveillance perimeter."
        }
        
    # Check type congruency
    type_matches = closest_vessel.vessel_type.lower() == vessel_type.lower()
    
    if type_matches:
        status = "VERIFIED"
        details = f"AIS target {closest_vessel.name} (MMSI: {closest_vessel.mmsi}) matches acoustic type '{vessel_type}'."
    else:
        status = "PHYSICAL_AIS_MISMATCH"
        details = (f"Acoustic classification '{vessel_type}' contradicts AIS broadcast "
                   f"'{closest_vessel.vessel_type}' for target {closest_vessel.name} (MMSI: {closest_vessel.mmsi}).")
        
    return {
        "status": status,
        "matched_vessel_id": getattr(closest_vessel, "id", None),
        "matched_mmsi": closest_vessel.mmsi,
        "matched_name": closest_vessel.name,
        "matched_type": closest_vessel.vessel_type,
        "distance_km": round(min_distance, 2),
        "time_difference_seconds": time_diff,
        "details": details
    }
