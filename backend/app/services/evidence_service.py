from typing import Dict, Any, Tuple
from datetime import datetime
from app.security.hashing import canonicalize_payload, compute_sha256
from app.security.ecdsa_signer import sign_data, verify_signature, get_public_key_pem

def generate_evidence_record(
    detection_id: int,
    buoy_id: str,
    timestamp: datetime,
    vessel_type: str,
    confidence: float,
    latitude: float,
    longitude: float,
    distance_km: float,
    bearing: float,
    ais_status: str,
    camera_confirmed: bool,
    risk_score: int,
    alert_type: str
) -> Dict[str, Any]:
    """
    Creates a tamper-evident canonical evidence record hashed with SHA-256
    and digitally signed with NIST P-256 ECDSA.
    """
    canonical_dict = {
        "ais_status": ais_status,
        "alert_type": alert_type,
        "bearing_deg": round(bearing, 1),
        "buoy_id": buoy_id,
        "camera_confirmed": camera_confirmed,
        "confidence": round(confidence, 4),
        "detection_id": detection_id,
        "distance_km": round(distance_km, 2),
        "latitude": round(latitude, 6),
        "longitude": round(longitude, 6),
        "risk_score": risk_score,
        "timestamp": timestamp.isoformat() if isinstance(timestamp, datetime) else str(timestamp),
        "vessel_type": vessel_type
    }
    
    # 1. Deterministic Canonical Serialization
    canonical_payload = canonicalize_payload(canonical_dict)
    
    # 2. SHA-256 Digest
    sha256_hash = compute_sha256(canonical_payload)
    
    # 3. ECDSA Digital Signature
    signature = sign_data(canonical_payload)
    public_key = get_public_key_pem()
    
    return {
        "detection_id": detection_id,
        "canonical_payload": canonical_payload,
        "sha256_hash": sha256_hash,
        "signature": signature,
        "public_key": public_key
    }

def verify_evidence_record(
    canonical_payload: str,
    stored_sha256: str,
    stored_signature: str = None,
    public_key_pem: str = None
) -> Dict[str, Any]:
    """
    Independently verifies evidence integrity by recalculating the SHA-256 hash
    and checking the ECDSA signature.
    """
    computed_hash = compute_sha256(canonical_payload)
    hash_valid = (computed_hash == stored_sha256)
    
    sig_valid = True
    if stored_signature:
        sig_valid = verify_signature(canonical_payload, stored_signature, public_key_pem)
        
    is_fully_valid = hash_valid and sig_valid
    
    if is_fully_valid:
        msg = "✓ EVIDENCE INTEGRITY VERIFIED (SHA-256 & ECDSA Signature Match)"
    elif not hash_valid:
        msg = "✕ EVIDENCE MODIFIED: SHA-256 hash mismatch detected!"
    else:
        msg = "✕ SIGNATURE INVALID: Cryptographic digital signature check failed!"
        
    return {
        "valid": is_fully_valid,
        "status_message": msg,
        "computed_sha256": computed_hash,
        "stored_sha256": stored_sha256,
        "signature_valid": sig_valid,
        "verified_at": datetime.utcnow().isoformat()
    }
