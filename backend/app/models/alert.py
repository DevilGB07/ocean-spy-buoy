from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    detection_id = Column(Integer, ForeignKey("detections.id"), nullable=False, index=True)
    type = Column(String, nullable=False)        # POSSIBLE_DARK_VESSEL, PHYSICAL_AIS_MISMATCH, HIGH_RISK_DETECTION
    severity = Column(String, nullable=False)    # LOW, MEDIUM, HIGH, CRITICAL
    risk_score = Column(Integer, nullable=False) # 0 - 100
    message = Column(String, nullable=False)
    reasons = Column(Text, nullable=False)       # JSON string or bullet points
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    acknowledged = Column(Boolean, default=False)
    
    detection = relationship("Detection", back_populates="alerts")
