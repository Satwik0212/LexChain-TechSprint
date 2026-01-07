import hashlib

def hash_text(text: str) -> str:
    """
    Computes a deterministic SHA-256 hash of the input text.
    Returns a hex string with '0x' prefix (bytes32 format).
    """
    if text is None:
        raise ValueError("Text cannot be None")
    
    # Normalize text if needed (e.g. utf-8)
    encoded_text = text.encode("utf-8")
    sha256_hash = hashlib.sha256(encoded_text).hexdigest()
    
    return f"0x{sha256_hash}"
