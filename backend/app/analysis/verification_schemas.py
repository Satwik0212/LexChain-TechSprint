from pydantic import BaseModel
from typing import List, Optional

class VerificationResult(BaseModel):
    confidence: str # "High", "Medium", "Low", "Unknown"
    consistency_check: str # "Consistent", "Potential mismatch", "Not available"
    possible_missed_areas: List[str]
    ambiguities: List[str]
