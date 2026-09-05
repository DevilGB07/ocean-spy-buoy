from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.buoy import Buoy
from app.schemas import BuoyResponse, BuoyCreate, BuoyUpdate

router = APIRouter(prefix="/buoys", tags=["Buoys"])

@router.get("", response_model=List[BuoyResponse], summary="List all buoys")
def list_buoys(db: Session = Depends(get_db)):
    return db.query(Buoy).all()

@router.get("/{buoy_id}", response_model=BuoyResponse, summary="Get buoy by ID")
def get_buoy(buoy_id: str, db: Session = Depends(get_db)):
    buoy = db.query(Buoy).filter(Buoy.id == buoy_id).first()
    if not buoy:
        raise HTTPException(status_code=404, detail=f"Buoy '{buoy_id}' not found.")
    return buoy

@router.post("", response_model=BuoyResponse, status_code=201, summary="Register a new buoy")
def create_buoy(buoy_in: BuoyCreate, db: Session = Depends(get_db)):
    existing = db.query(Buoy).filter(Buoy.id == buoy_in.id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Buoy '{buoy_in.id}' already exists.")
    
    buoy = Buoy(**buoy_in.dict(), last_seen=datetime.utcnow())
    db.add(buoy)
    db.commit()
    db.refresh(buoy)
    return buoy

@router.patch("/{buoy_id}", response_model=BuoyResponse, summary="Update buoy telemetry")
def update_buoy(buoy_id: str, buoy_in: BuoyUpdate, db: Session = Depends(get_db)):
    buoy = db.query(Buoy).filter(Buoy.id == buoy_id).first()
    if not buoy:
        raise HTTPException(status_code=404, detail=f"Buoy '{buoy_id}' not found.")
        
    update_data = buoy_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(buoy, field, value)
    buoy.last_seen = datetime.utcnow()
    
    db.commit()
    db.refresh(buoy)
    return buoy
