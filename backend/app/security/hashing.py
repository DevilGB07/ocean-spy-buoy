import json
import hashlib
from typing import Any, Dict

def canonicalize_payload(data: Dict[str, Any]) -> str:
    """
    Deterministically serializes a dictionary into a canonical JSON string.
    Ensures identical keys and subkeys are ordered alphabetically,
    eliminating whitespace differences.
    """
    return json.dumps(data, sort_keys=True, separators=(',', ':'), ensure_ascii=False)

def compute_sha256(canonical_payload: str) -> str:
    """
    Generates the SHA-256 hex digest for a given canonical JSON string.
    """
    payload_bytes = canonical_payload.encode('utf-8')
    return hashlib.sha256(payload_bytes).hexdigest()
