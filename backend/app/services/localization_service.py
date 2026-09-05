import math
from typing import Tuple, Dict

# Earth radius in kilometers
EARTH_RADIUS_KM = 6371.0

def calculate_estimated_position(
    buoy_lat: float, 
    buoy_lon: float, 
    distance_km: float, 
    bearing_degrees: float
) -> Tuple[float, float]:
    """
    Computes approximate vessel coordinates using great-circle forward azimuth navigation.
    NOTE: For simulation / prototype only. Approximate location, not survey-grade.
    """
    lat1 = math.radians(buoy_lat)
    lon1 = math.radians(buoy_lon)
    bearing_rad = math.radians(bearing_degrees)
    angular_dist = distance_km / EARTH_RADIUS_KM

    lat2 = math.asin(
        math.sin(lat1) * math.cos(angular_dist) +
        math.cos(lat1) * math.sin(angular_dist) * math.cos(bearing_rad)
    )

    lon2 = lon1 + math.atan2(
        math.sin(bearing_rad) * math.sin(angular_dist) * math.cos(lat1),
        math.cos(angular_dist) - math.sin(lat1) * math.sin(lat2)
    )

    return round(math.degrees(lat2), 6), round(math.degrees(lon2), 6)

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two points in kilometers."""
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(EARTH_RADIUS_KM * c, 3)
