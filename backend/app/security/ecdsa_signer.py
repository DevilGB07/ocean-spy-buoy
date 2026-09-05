import base64
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.exceptions import InvalidSignature
from typing import Tuple

# Module-level single authority key for the buoys in demo mode
_PRIVATE_KEY = ec.generate_private_key(ec.SECP256R1())
_PUBLIC_KEY = _PRIVATE_KEY.public_key()

def get_public_key_pem() -> str:
    """Returns the authority public key in PEM format."""
    return _PUBLIC_KEY.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')

def sign_data(data: str) -> str:
    """
    Signs data using ECDSA (SECP256R1) with SHA256.
    Returns the signature as a base64 encoded string.
    """
    signature = _PRIVATE_KEY.sign(
        data.encode('utf-8'),
        ec.ECDSA(hashes.SHA256())
    )
    return base64.b64encode(signature).decode('utf-8')

def verify_signature(data: str, signature_b64: str, public_key_pem: str = None) -> bool:
    """
    Verifies an ECDSA signature against the provided data and public key.
    """
    try:
        if public_key_pem:
            pub_key = serialization.load_pem_public_key(public_key_pem.encode('utf-8'))
        else:
            pub_key = _PUBLIC_KEY
            
        sig_bytes = base64.b64decode(signature_b64.encode('utf-8'))
        pub_key.verify(
            sig_bytes,
            data.encode('utf-8'),
            ec.ECDSA(hashes.SHA256())
        )
        return True
    except (InvalidSignature, Exception):
        return False
