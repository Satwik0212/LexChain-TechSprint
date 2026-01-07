from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.analysis.text_extractor import extract_text
import shutil
import os
import uuid
import json
from typing import Optional, Dict, List
from pydantic import BaseModel

from app.auth.routes import get_current_user
from app.analysis.jurisdiction import detect_jurisdiction
from app.analysis.clause_segmenter import segment_clauses
from app.analysis.schemas import ClauseSegmentationResult
from app.analysis.rules.engine import run_risk_engine
from app.analysis.rules.models import RuleEngineResult, GoverningLawDetail, AISummary, RiskLevel, PrecedentRequest, RedlineRequest
from app.analysis.ai_summary import generate_summary, generate_batch_advisories
from app.analysis.verification_schemas import VerificationResult
from app.analysis.legal_knowledge.precedents import get_precedents
from app.analysis.legal_knowledge.redlines import get_redline

router = APIRouter()

# Temporary storage path
UPLOAD_DIR = "tmp"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class SegmentRequest(BaseModel):
    text: str
    verify: bool = False

class FullAnalysisResult(BaseModel):
    rule_engine: RuleEngineResult
    verification: Optional[VerificationResult] = None

@router.post("/analyze")
async def analyze_contract(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in [".pdf", ".docx"]:
         raise HTTPException(status_code=400, detail="Unsupported file format.")

    temp_filename = f"{uuid.uuid4()}{file_ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        raw_text = extract_text(temp_path)
        return {
            "filename": file.filename,
            "extracted_text": raw_text,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.post("/segment", response_model=ClauseSegmentationResult)
async def segment_contract(request: SegmentRequest, current_user: dict = Depends(get_current_user)):
    jurisdiction_result = detect_jurisdiction(request.text)
    clauses = []
    if jurisdiction_result.supported or jurisdiction_result.jurisdiction == "Unknown":
         clauses = segment_clauses(request.text)
    
    return ClauseSegmentationResult(
        jurisdiction_result=jurisdiction_result,
        clauses=clauses
    )

@router.post("/evaluate", response_model=FullAnalysisResult)
async def evaluate_contract(request: SegmentRequest, current_user: dict = Depends(get_current_user)):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Contract text cannot be empty")

    # 1. Pipeline: Jurisdiction -> Segmentation -> Risk Engine
    jurisdiction_result = detect_jurisdiction(request.text)
    clauses = segment_clauses(request.text)
    result = run_risk_engine(clauses)
    
    print("🚀 Starting AI Enrichment Pipeline...")

    # A. Global Summary (1 API Call)
    summary_data = generate_summary(request.text)
    result.ai_summary = AISummary(
        status=summary_data.get("status", "failed"),
        bullets=summary_data.get("summary", [])
    )

    # B. Flag Enrichment (Optimized Batching - 1 API Call)
    clause_text_map = {c.clause_id: c.text for c in clauses}
    flags_to_enrich = []
    
    # First pass: Link text and collect risks for batching
    for layer in result.layer_results:
        for flag in layer.flags:
            if flag.clause_id in clause_text_map:
                flag.original_text = clause_text_map[flag.clause_id]
            
            # Collect Medium/High risks to send to Gemini in one go
            if flag.risk in [RiskLevel.HIGH, RiskLevel.MEDIUM] and flag.original_text:
                flags_to_enrich.append({
                    "clause_text": flag.original_text[:1500],
                    "risk_type": flag.title
                })

    # Execute Batch Advisory
    if flags_to_enrich:
        advisories = generate_batch_advisories(flags_to_enrich)
        # Create a lookup map for the results
        adv_lookup = {a.get("risk_type"): a for a in advisories}
        
        # Second pass: Apply AI data and add precedents
        for layer in result.layer_results:
            for flag in layer.flags:
                if flag.title in adv_lookup:
                    match = adv_lookup[flag.title]
                    flag.ai_advisory = match.get("advisory", "Review carefully.")
                    flag.ai_confidence = match.get("confidence", "High")
                
                if flag.risk in [RiskLevel.HIGH, RiskLevel.MEDIUM]:
                    flag.precedents = get_precedents(flag.title)

    # 3. Final Metadata
    result.governing_law = GoverningLawDetail(
        country=jurisdiction_result.jurisdiction if jurisdiction_result.jurisdiction != "Unknown" else "India",
        court="New Delhi" if jurisdiction_result.jurisdiction == "India" else "Unknown",
        supported=jurisdiction_result.supported
    )
    
    verification_result = None
    if request.verify:
        try:
            from app.analysis.verifier import verify_analysis
            verification_result = verify_analysis(request.text, result)
        except Exception as e:
            print(f"Verification skipped: {e}")
    
    return FullAnalysisResult(rule_engine=result, verification=verification_result)

@router.post("/precedents")
async def fetch_precedents(request: PrecedentRequest, current_user: dict = Depends(get_current_user)):
    return get_precedents(request.flag_title)

@router.post("/redline")
async def generate_redline(request: RedlineRequest, current_user: dict = Depends(get_current_user)):
    suggestion = get_redline(request.flag_title, request.original_text)
    return {"suggested_redline": suggestion or "Consult legal counsel."}

# --- AI ASSISTANT ENDPOINTS ---
class SummaryRequest(BaseModel):
    text: str

class ChatRequest(BaseModel):
    text: str
    question: str

@router.post("/summary")
async def get_contract_summary(request: SummaryRequest, current_user: dict = Depends(get_current_user)):
    from app.analysis.verifier import summarize_contract
    return {"summary": summarize_contract(request.text)}

@router.post("/chat")
async def chat_contract(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    from app.analysis.verifier import chat_about_contract
    return chat_about_contract(request.text, request.question)