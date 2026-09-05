from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Buoy Schemas ---
class BuoyBase(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    status: str = "ONLINE"
    battery_level: float = 98.0
    firmware_version: str = "v1.4.2-tinyML"
    detection_radius_km: float = 5.0
    hydrophone_health: str = "OPTIMAL"

class BuoyCreate(BuoyBase):
    pass

class BuoyUpdate(BaseModel):
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[str] = None
    battery_level: Optional[float] = None
    detection_radius_km: Optional[float] = None

class BuoyResponse(BuoyBase):
    last_seen: datetime

    class Config:
        from_attributes = True

# --- AIS Vessel Schemas ---
class AISVesselBase(BaseModel):
    mmsi: str
    name: str
    vessel_type: str
    latitude: float
    longitude: float
    speed: float = 12.0
    heading: float = 0.0

class AISVesselCreate(AISVesselBase):
    pass

class AISVesselResponse(AISVesselBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# --- Hardware Ingest & Detection Schemas ---
class GPSPoint(BaseModel):
    latitude: float
    longitude: float

class HardwareDetectionIngest(BaseModel):
    """
    Hardware integration ready payload (Section 33):
    ESP32-S3 / Hydrophone / GPS can submit this directly.
    """
    buoy_id: str = "OSB-001"
    timestamp: Optional[datetime] = None
    audio_window: Optional[str] = None  # Base64 raw audio or FFT feature vector
    gps: Optional[GPSPoint] = None
    bearing: Optional[float] = 127.0
    distance_km: Optional[float] = 1.2
    camera_confirmed: Optional[bool] = False
    vessel_type_override: Optional[str] = None  # if TinyML on-device classified it

class DetectionBase(BaseModel):
    buoy_id: str
    vessel_type: str
    confidence: float
    latitude: float
    longitude: float
    distance_km: float
    bearing: float
    audio_source: str = "Hydrophone Array A (48kHz)"
    audio_level_db: float = -32.4
    dominant_frequency_hz: float = 142.5
    camera_confirmed: bool = False
    camera_image_url: Optional[str] = None
    ais_status: str
    ais_matched_mmsi: Optional[str] = None
    ais_matched_type: Optional[str] = None
    risk_score: int
    status: str
    reasons: str
    recommendation: str

class DetectionResponse(DetectionBase):
    id: int
    timestamp: datetime
    buoy: Optional[BuoyResponse] = None
    reasons_list: Optional[List[str]] = None

    class Config:
        from_attributes = True

# --- Alert Schemas ---
class AlertResponse(BaseModel):
    id: int
    detection_id: int
    type: str
    severity: str
    risk_score: int
    message: str
    reasons: str
    reasons_list: Optional[List[str]] = None
    created_at: datetime
    acknowledged: bool
    detection: Optional[DetectionResponse] = None

    class Config:
        from_attributes = True

# --- Evidence Schemas ---
class EvidenceResponse(BaseModel):
    id: int
    detection_id: int
    canonical_payload: str
    sha256_hash: str
    signature: Optional[str] = None
    public_key: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class EvidenceVerifyResponse(BaseModel):
    valid: bool
    status_message: str
    computed_sha256: str
    stored_sha256: str
    signature_valid: bool
    verified_at: datetime

# --- AI Classification Schemas ---
class AIClassifyRequest(BaseModel):
    audio_data: Optional[str] = None
    sample_rate: Optional[int] = 48000
    features: Optional[Dict[str, float]] = None

class AIClassifyResponse(BaseModel):
    vessel_type: str
    confidence: float
    model: str = "OceanSpy-TinyML-Demo"
    dominant_frequency_hz: float = 142.5
    audio_level_db: float = -32.4

# --- Settings & Analytics Schemas ---
class SystemSettingsModel(BaseModel):
    MAX_DISTANCE_KM: float = 5.0
    MAX_TIME_DIFFERENCE_SECONDS: int = 120
    ALERT_HIGH_THRESHOLD: int = 60
    ALERT_CRITICAL_THRESHOLD: int = 80
    MODE: str = "SIMULATION"

class AnalyticsResponse(BaseModel):
    total_detections: int
    verified_count: int
    mismatch_count: int
    dark_vessel_count: int
    active_alerts_count: int
    high_risk_count: int
    average_confidence: float
    vessel_distribution: Dict[str, int]
    risk_distribution: Dict[str, int]
    timeline_stats: List[Dict[str, Any]]
