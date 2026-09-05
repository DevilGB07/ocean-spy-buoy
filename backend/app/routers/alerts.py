import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.alert import Alert
from app.schemas import AlertResponse

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse], summary="List all security alerts")
def list_alerts(
    severity: Optional[str] = Query(None, description="Filter by severity (CRITICAL, HIGH, MEDIUM, LOW)"),
    type: Optional[str] = Query(None, description="Filter by alert type (POSSIBLE_DARK_VESSEL, PHYSICAL_AIS_MISMATCH)"),
    acknowledged: Optional[bool] = Query(None, description="Filter by acknowledgment state"),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Alert).order_by(Alert.created_at.desc())
    if severity:
        query = query.filter(Alert.severity == severity)
    if type:
        query = query.filter(Alert.type == type)
    if acknowledged is not None:
        query = query.filter(Alert.acknowledged == acknowledged)
        
    alerts = query.limit(limit).all()
    results = []
    for a in alerts:
        a_resp = AlertResponse.from_orm(a)
        try:
            a_resp.reasons_list = json.loads(a.reasons) if a.reasons else []
        except Exception:
            a_resp.reasons_list = [a.reasons]
        results.append(a_resp)
        
    return results

@router.get("/{alert_id}", response_model=AlertResponse, summary="Get alert by ID")
def get_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert #{alert_id} not found.")
        
    a_resp = AlertResponse.from_orm(alert)
    try:
        a_resp.reasons_list = json.loads(alert.reasons) if alert.reasons else []
    except Exception:
        a_resp.reasons_list = [alert.reasons]
    return a_resp

@router.patch("/{alert_id}/acknowledge", response_model=AlertResponse, summary="Acknowledge an alert")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert #{alert_id} not found.")
        
    alert.acknowledged = True
    db.commit()
    db.refresh(alert)
    
    a_resp = AlertResponse.from_orm(alert)
    try:
        a_resp.reasons_list = json.loads(alert.reasons) if alert.reasons else []
    except Exception:
        a_resp.reasons_list = [alert.reasons]
    return a_resp
