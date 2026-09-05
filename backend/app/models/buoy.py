from sqlalchemy import Column, String, Float, DateTime
from datetime import datetime
from app.database import Base

class Buoy(Base):
    __tablename__ = "buoys"
    
    id = Column(String, primary_key=True, index=True)  # e.g., "OSB-001"
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String, default="ONLINE")  # ONLINE, OFFLINE, WARNING
    battery_level = Column(Float, default=98.0)  # percentage
    last_seen = Column(DateTime, default=datetime.utcnow)
    firmware_version = Column(String, default="v1.4.2-tinyML")
    detection_radius_km = Column(Float, default=5.0)
    hydrophone_health = Column(String, default="OPTIMAL")
