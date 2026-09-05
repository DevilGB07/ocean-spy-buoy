from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base

class SystemEvent(Base):
    __tablename__ = "system_events"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_type = Column(String, nullable=False) # SIMULATION_TRIGGER, WEBSOCKET_CONNECT, ALERT_TRIGGER, etc.
    message = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
