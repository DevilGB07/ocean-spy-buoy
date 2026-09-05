from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.evidence import EvidenceRecord
from app.schemas import EvidenceResponse, EvidenceVerifyResponse
from app.services.evidence_service import verify_evidence_record

router = APIRouter(prefix="/evidence", tags=["Evidence"])

@router.get("", response_model=List[EvidenceResponse], summary="List all cryptographic evidence records")
def list_evidence(db: Session = Depends(get_db)):
    return db.query(EvidenceRecord).order_by(EvidenceRecord.created_at.desc()).all()

@router.get("/{evidence_id}", response_model=EvidenceResponse, summary="Get evidence record by ID")
def get_evidence(evidence_id: int, db: Session = Depends(get_db)):
    record = db.query(EvidenceRecord).filter(EvidenceRecord.id == evidence_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Evidence record #{evidence_id} not found.")
    return record

@router.post("/{evidence_id}/verify", response_model=EvidenceVerifyResponse, summary="Verify evidence cryptographic integrity")
def verify_evidence(evidence_id: int, db: Session = Depends(get_db)):
    """
    Independently recomputes SHA-256 hash from canonical payload and validates ECDSA digital signature.
    """
    record = db.query(EvidenceRecord).filter(EvidenceRecord.id == evidence_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Evidence record #{evidence_id} not found.")
        
    result = verify_evidence_record(
        canonical_payload=record.canonical_payload,
        stored_sha256=record.sha256_hash,
        stored_signature=record.signature,
        public_key_pem=record.public_key
    )
    return result
