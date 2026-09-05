from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Detection(Base):
    __tablename__ = "detections"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    buoy_id = Column(String, ForeignKey("buoys.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    vessel_type = Column(String, nullable=False)  # Tanker, Cargo, Fishing, Passenger, Background
    confidence = Column(Float, nullable=False)    # e.g., 0.91
    latitude = Column(Float, nullable=False)      # estimated vessel latitude
    longitude = Column(Float, nullable=False)     # estimated vessel longitude
    distance_km = Column(Float, nullable=False)   # distance from buoy
    bearing = Column(Float, nullable=False)       # bearing degrees (0-360)
    audio_source = Column(String, default="Hydrophone Array A (48kHz)")
    audio_level_db = Column(Float, default=-32.4)
    dominant_frequency_hz = Column(Float, default=142.5)
    camera_confirmed = Column(Boolean, default=False)
    camera_image_url = Column(String, nullable=True)
    ais_status = Column(String, nullable=False)   # VERIFIED, PHYSICAL_AIS_MISMATCH, NO_AIS_MATCH
    ais_matched_mmsi = Column(String, nullable=True)
    ais_matched_type = Column(String, nullable=True)
    risk_score = Column(Integer, nullable=False)  # 0 - 100
    status = Column(String, nullable=False)       # VERIFIED_VESSEL, PHYSICAL_AIS_MISMATCH, POSSIBLE_DARK_VESSEL
    reasons = Column(Text, nullable=False)        # JSON string of reasons list
    recommendation = Column(String, nullable=False)
    
    # Relationships
    buoy = relationship("Buoy")
    alerts = relationship("Alert", back_populates="detection", cascade="all, delete-orphan")
    evidence = relationship("EvidenceRecord", back_populates="detection", uselist=False, cascade="all, delete-orphan")
