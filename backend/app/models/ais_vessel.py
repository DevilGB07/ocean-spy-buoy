from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.database import Base

class AISVessel(Base):
    __tablename__ = "ais_vessels"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    mmsi = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    vessel_type = Column(String, nullable=False)  # Tanker, Cargo, Fishing, Passenger
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed = Column(Float, default=12.0)  # knots
    heading = Column(Float, default=0.0) # degrees
    timestamp = Column(DateTime, default=datetime.utcnow)
