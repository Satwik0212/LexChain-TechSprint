from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.auth.routes import router as auth_router
from app.core import startup
import os

# --- STRICT STARTUP ---
# This will HALT execution if requirements are not met.
startup.run_strict_startup()

app = FastAPI(title="LexChain Backend")

# Debug Endpoint used for verification
from google import genai
from fastapi.responses import JSONResponse

@app.get("/debug/gemini-test")
async def debug_gemini_test():
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
             return JSONResponse(status_code=500, content={"error": "Missing API Key"})
        
        genai.configure(api_key=api_key)
        # FORCE 1.5 Flash as requested for verification
        model = genai.GenerativeModel("gemini-1.0-pro")
        
        print("🧪 Sending Test Prompt to Gemini...")
        response = model.generate_content("Summarize this contract in 3 bullets: 'This is a test contract for software development.'")
        
        return {
            "status": "success", 
            "model": "gemini-1.0-pro", 
            "response": response.text
        }
    except Exception as e:
        print(f"❌ Gemini Test Failed: {e}")
        return JSONResponse(status_code=500, content={"status": "failed", "error": str(e)})

# --- CORS ---
origins_str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
origins = [origin.strip() for origin in origins_str.split(",")]
# Explicitly allow local dev just in case
origins.extend(["http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:5174"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.analysis.routes import router as analysis_router
from app.blockchain.routes import router as blockchain_router

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(analysis_router, prefix="/analysis", tags=["Analysis"])
app.include_router(blockchain_router, prefix="/blockchain", tags=["Blockchain"])

@app.get("/")
def root():
    return {"status": "ok", "mode": "strict"}

# --- DATABASE INIT REMOVED (Using Firestore Only) ---

@app.get("/health")
def health_check():
    """
    Health Check. Returns 200 even if some subsystems are down.
    """
    return {
        "status": "ok",
        "subsystems": startup.HEALTH_STATE
    }
