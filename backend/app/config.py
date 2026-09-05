from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "Ocean Spy-Buoy"
    TAGLINE: str = "Don't Ask the Ship Where It Is. Ask the Ocean."
    VERSION: str = "1.0.0"
    MODE: str = "SIMULATION"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite:///./ocean_spy_buoy.db"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # AIS Correlation Thresholds
    MAX_DISTANCE_KM: float = 5.0
    MAX_TIME_DIFFERENCE_SECONDS: int = 120
    
    # Risk Engine Weights
    RISK_ACOUSTIC_DETECTION: int = 20
    RISK_HIGH_AI_CONFIDENCE: int = 20
    RISK_CAMERA_CONFIRMATION: int = 15
    RISK_AIS_MISMATCH: int = 20
    RISK_NO_AIS_MATCH: int = 30
    RISK_LOCALIZATION_CONFIDENCE: int = 10
    
    # Alert Thresholds
    ALERT_HIGH_THRESHOLD: int = 60
    ALERT_CRITICAL_THRESHOLD: int = 80
    
    # Default Buoy coordinates (fictional coastal area around Arabian Sea / Mumbai offshore)
    DEFAULT_BUOY_LAT: float = 19.0760
    DEFAULT_BUOY_LON: float = 72.8777
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
