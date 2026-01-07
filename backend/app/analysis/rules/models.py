from enum import Enum
from typing import List, Optional, Dict
from pydantic import BaseModel

class RiskLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class AnalysisVerdict(str, Enum):
    PROCEED = "PROCEED"
    CAUTION = "PROCEED_WITH_CAUTION"
    BLOCK = "DO_NOT_SIGN"

class Recommendation(BaseModel):
    verdict: AnalysisVerdict
    reason: str

class GoverningLawDetail(BaseModel):
    country: str = "India"
    court: str = "Unknown"
    supported: bool = True

class PrecedentData(BaseModel):
    case_name: str
    court: str
    principle: str
    year: str

class Flag(BaseModel):
    layer: int
    clause_id: Optional[str]
    title: str
    description: str
    risk: RiskLevel
    original_text: Optional[str] = None
    # AI Enrichment
    ai_advisory: Optional[str] = None
    ai_confidence: Optional[str] = None # Low/Medium/High
    precedents: Optional[List[PrecedentData]] = []

class LayerResult(BaseModel):
    layer: int
    flags: List[Flag]
    risk: RiskLevel
    positive_findings: List[str] = []

class AISummary(BaseModel):
    status: str # "success" | "failed"
    bullets: List[str]

class RuleEngineResult(BaseModel):
    layer_results: List[LayerResult]
    overall_risk: RiskLevel
    score: float # 0.0 to 1.0 (or 0-100)
    recommendation: Optional[Recommendation] = None
    governing_law: Optional[GoverningLawDetail] = None
    ai_summary: Optional[AISummary] = None # Added here for better encapsulation if needed, or I'll add to FullAnalysisResult

class PrecedentRequest(BaseModel):
    layer: int
    flag_title: str

class RedlineRequest(BaseModel):
    layer: int
    flag_title: str
    original_text: str
