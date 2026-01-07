from pydantic import BaseModel
from typing import List, Optional

class JurisdictionResult(BaseModel):
    jurisdiction: str
    supported: bool
    message: Optional[str] = None

class Clause(BaseModel):
    clause_id: str
    clause_type: str
    text: str
    
class ClauseSegmentationResult(BaseModel):
    jurisdiction_result: JurisdictionResult
    clauses: List[Clause]
