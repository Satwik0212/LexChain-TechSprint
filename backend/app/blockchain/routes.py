from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from app.blockchain.service import store_proof, verify_proof
from app.auth.routes import get_current_user
from typing import Optional, List
from app.blockchain.hashing import hash_text
from app.analysis.text_extractor import extract_text
from app.core.firebase import db
from datetime import datetime
import os
import shutil
import uuid
from google.cloud.firestore import Query

router = APIRouter()

# Temporary storage for extraction
UPLOAD_DIR = "tmp"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ProofRequest(BaseModel):
    text: str
    filename: Optional[str] = None

class ProofResponse(BaseModel):
    tx_hash: str
    timestamp: int
    submitted_by: str
    document_hash: str
    block_number: int
    network: str = "Polygon Amoy"
    contract_address: str = "0xfE0ED936D92AA844A06B8a4279330FE747f55420"
    message: str = "Proof stored immutably on blockchain"

class VerifyResponse(BaseModel):
    status: str = "not_verified" # verified | not_verified
    match: bool
    exists: bool # Legacy support
    document_hash: Optional[str] = None
    submitted_by: Optional[str] = None
    on_chain_timestamp: Optional[int] = None
    blockchain_tx_hash: Optional[str] = None
    tx_hash: Optional[str] = None # Legacy support
    block_number: Optional[int] = None
    network: Optional[str] = None
    message: str
    privacy_note: str = "No personal data stored on-chain"
    filename: Optional[str] = None

class HistoryItem(BaseModel):
    document_hash: str
    blockchain_tx_hash: str
    created_at: datetime
    network: str
    filename: Optional[str] = "Document"

@router.post("/store-proof", response_model=ProofResponse)
async def store_document_proof(
    request: ProofRequest, 
    current_user: dict = Depends(get_current_user)
):
    """
    Hashes the text and stores the proof on the Polygon blockchain.
    Persists metadata in Firestore (User-Scoped).
    """
    if not request.text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    doc_hash = hash_text(request.text)
    user_id = current_user.get("uid")

    if not user_id:
        raise HTTPException(status_code=401, detail="User ID not found")

    # 1. Idempotency Check (Firestore)
    # Query: proofs/{uid}/records where document_hash == doc_hash
    docs_ref = db.collection("proofs").document(user_id).collection("records")
    query = docs_ref.where("document_hash", "==", doc_hash).limit(1).stream()
    
    existing = None
    for d in query:
        existing = d.to_dict()
        break

    if existing:
        return {
            "tx_hash": existing.get("tx_hash"),
            "timestamp": existing.get("timestamp"),
            "submitted_by": "You (Previous)",
            "document_hash": existing.get("document_hash"),
            "block_number": existing.get("block_number", 0),
            "network": existing.get("network", "Polygon Amoy"),
            "contract_address": existing.get("contract_address"),
            "message": "Proof already exists for this document."
        }

    try:
        # 2. Store on Blockchain
        result = store_proof(request.text)
        
        # 3. Store in Firestore
        record_data = {
            "document_hash": result["document_hash"],
            "tx_hash": result["tx_hash"],
            "timestamp": result["timestamp"], # int timestamp
            "block_number": result["block_number"],
            "submitted_by": result["submitted_by"],
            "contract_address": "0xfE0ED936D92AA844A06B8a4279330FE747f55420",
            "network": "Polygon Amoy",
            "created_at": datetime.utcnow(),
            "filename": request.filename
        }
        
        docs_ref.add(record_data)

        # Enrich Result
        result["network"] = "Polygon Amoy"
        result["contract_address"] = "0xfE0ED936D92AA844A06B8a4279330FE747f55420"
        result["message"] = "Proof stored immutably on blockchain"
        return result
    except Exception as e:
        print(f"Blockchain Error: {e}")
        raise HTTPException(status_code=500, detail=f"Blockchain transaction failed: {str(e)}")

@router.post("/verify-document", response_model=VerifyResponse)
async def verify_document_endpoint(
    request: ProofRequest, 
    current_user: dict = Depends(get_current_user)
):
    """
    Verifies document against user's history in Firestore.
    """
    return await _verify_logic(request.text, current_user)

@router.post("/verify-proof", response_model=VerifyResponse)
async def verify_proof_legacy(
    request: ProofRequest, 
    current_user: dict = Depends(get_current_user)
):
    """
    Legacy endpoint alias for verify-document.
    """
    return await _verify_logic(request.text, current_user)

async def _verify_logic(text: str, current_user: dict):
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    doc_hash = hash_text(text)
    user_id = current_user.get("uid")

    # 1. Check Firestore (Fastest / User Specific)
    docs_ref = db.collection("proofs").document(user_id).collection("records")
    query = docs_ref.where("document_hash", "==", doc_hash).limit(1).stream()
    
    record = None
    for d in query:
        record = d.to_dict()
        break

    if record:
        return {
            "status": "verified",
            "match": True,
            "exists": True,
            "document_hash": record.get("document_hash"),
            "submitted_by": "You",
            "on_chain_timestamp": record.get("timestamp"),
            "blockchain_tx_hash": record.get("tx_hash"),
            "tx_hash": record.get("tx_hash"),
            "network": record.get("network"),
            "message": "Document verified via personal history.",
            "privacy_note": "No personal data stored on-chain."
        }

    # 2. Return No Match
    return {
        "status": "not_verified",
        "match": False,
        "exists": False,
        "document_hash": doc_hash,
        "message": "No matching integrity proof found for this account."
    }

@router.post("/verify-file", response_model=VerifyResponse)
async def verify_uploaded_file(
    file: UploadFile = File(...), 
    current_user: dict = Depends(get_current_user)
):
    # 1. Save & Extract
    file_ext = os.path.splitext(file.filename)[1].lower()
    temp_filename = f"{uuid.uuid4()}{file_ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        raw_text = extract_text(temp_path)
        
        # 2. Verify Logic
        result = await _verify_logic(raw_text, current_user)
        result["filename"] = file.filename
        return result

    except Exception as e:
        print(f"Verify File Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass

@router.get("/history", response_model=List[HistoryItem])
async def get_proof_history(
    current_user: dict = Depends(get_current_user)
):
    """
    Returns the user's proof history ordered by newest first.
    """
    user_id = current_user.get("uid")
    docs_ref = db.collection("proofs").document(user_id).collection("records")
    
    try:
        # Order by created_at desc
        query = docs_ref.order_by("created_at", direction=Query.DESCENDING).stream()
        
        history = []
        for d in query:
            data = d.to_dict()
            # Handle potential missing CreatedAt in legacy data
            created_at = data.get("created_at")
            if not created_at:
                # Fallback to current time or skip? Fallback for robustness
                created_at = datetime.utcnow()
            
            # If timestamp comes as int from some legacy write?
            if isinstance(created_at, int): # Shouldn't happen if we write datetime
                created_at = datetime.fromtimestamp(created_at)

            history.append(HistoryItem(
                document_hash=data.get("document_hash"),
                blockchain_tx_hash=data.get("tx_hash"),
                created_at=created_at,
                network=data.get("network", "Polygon Amoy"),
                filename=data.get("filename", "Document")
            ))
            
        return history
    except Exception as e:
        print(f"History Fetch Error: {e}")
        # Return empty list on error (e.g. collection doesn't exist yet)
        return []
