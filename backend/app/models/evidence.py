from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class EvidenceRecord(Base):
    __tablename__ = "evidence_records"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    detection_id = Column(Integer, ForeignKey("detections.id"), unique=True, nullable=False, index=True)
    canonical_payload = Column(Text, nullable=False)  # Deterministic JSON string
    sha256_hash = Column(String(64), nullable=False, index=True) # 64 hex characters
    signature = Column(Text, nullable=True)           # Base64 encoded ECDSA signature
    public_key = Column(Text, nullable=True)          # Base64/PEM public key for verification
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    detection = relationship("Detection", back_populates="evidence")
