from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Dict, Any

from app.database import get_db
from app.models.detection import Detection
from app.models.alert import Alert
from app.schemas import AnalyticsResponse

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsResponse, summary="Get aggregate surveillance statistics")
def get_analytics(db: Session = Depends(get_db)):
    total_detections = db.query(Detection).count()
    verified_count = db.query(Detection).filter(Detection.status == "VERIFIED_VESSEL").count()
    mismatch_count = db.query(Detection).filter(Detection.status == "PHYSICAL_AIS_MISMATCH").count()
    dark_vessel_count = db.query(Detection).filter(Detection.status == "POSSIBLE_DARK_VESSEL").count()
    
    active_alerts = db.query(Alert).filter(Alert.acknowledged == False).count()
    high_risk = db.query(Detection).filter(Detection.risk_score >= 60).count()
    
    avg_conf = db.query(func.avg(Detection.confidence)).scalar() or 0.89
    
    # Vessel type distribution
    vessel_types = db.query(Detection.vessel_type, func.count(Detection.id)).group_by(Detection.vessel_type).all()
    vessel_dist = {v_type: count for v_type, count in vessel_types}
    
    # Risk buckets
    risk_low = db.query(Detection).filter(Detection.risk_score < 30).count()
    risk_med = db.query(Detection).filter(Detection.risk_score >= 30, Detection.risk_score < 60).count()
    risk_high = db.query(Detection).filter(Detection.risk_score >= 60, Detection.risk_score < 80).count()
    risk_crit = db.query(Detection).filter(Detection.risk_score >= 80).count()
    
    risk_dist = {
        "Low (0-29)": risk_low,
        "Medium (30-59)": risk_med,
        "High (60-79)": risk_high,
        "Critical (80-100)": risk_crit
    }
    
    # Timeline stats for past 24 hours (grouped into 4h intervals)
    now = datetime.utcnow()
    timeline = []
    for i in range(6, -1, -1):
        slot_time = now - timedelta(hours=i * 4)
        slot_label = slot_time.strftime("%H:00")
        
        slot_detections = db.query(Detection).filter(
            Detection.timestamp >= slot_time - timedelta(hours=4),
            Detection.timestamp <= slot_time
        ).count()
        
        slot_alerts = db.query(Alert).filter(
            Alert.created_at >= slot_time - timedelta(hours=4),
            Alert.created_at <= slot_time
        ).count()
        
        timeline.append({
            "time": slot_label,
            "detections": max(1, slot_detections),
            "alerts": slot_alerts
        })
        
    return AnalyticsResponse(
        total_detections=total_detections,
        verified_count=verified_count,
        mismatch_count=mismatch_count,
        dark_vessel_count=dark_vessel_count,
        active_alerts_count=active_alerts,
        high_risk_count=high_risk,
        average_confidence=round(float(avg_conf), 2),
        vessel_distribution=vessel_dist,
        risk_distribution=risk_dist,
        timeline_stats=timeline
    )
