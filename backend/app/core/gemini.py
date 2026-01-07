import os
from google import genai
from google.genai import types  # Added for configuration types

# SINGLE SOURCE OF TRUTH
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

_client = None
_gemini_initialized = False

class GeminiModelAdapter:
    """
    Adapter to make google.genai SDK compatible with 
    legacy model.generate_content(...) calls.
    """
    def __init__(self, client, model_name: str):
        self.client = client
        self.model_name = model_name

    def generate_content(self, prompt, generation_config=None):
        # Handle the case where generation_config might be a dict or None
        config = generation_config
        if isinstance(generation_config, dict):
            config = types.GenerateContentConfig(**generation_config)

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=config
        )
        return response

def init_gemini():
    global _client, _gemini_initialized

    if _gemini_initialized:
        return

    print("--- 🤖 Initializing Gemini AI Service ---")

    if not GEMINI_API_KEY:
        print("❌ Gemini Configuration Failed: GEMINI_API_KEY missing")
        raise RuntimeError("❌ GEMINI_API_KEY missing")

    masked = f"{GEMINI_API_KEY[:6]}...{GEMINI_API_KEY[-4:]}"
    print(f"🔑 Gemini Key Loaded: {masked}")

    try:
        # Fixed: Using the Client class for the new google-genai SDK
        _client = genai.Client(api_key=GEMINI_API_KEY)
        _gemini_initialized = True
        print("✅ Gemini initialized successfully")
    except Exception as e:
        print(f"❌ Gemini Startup Failed: {e}")
        raise RuntimeError(f"Gemini init failed: {e}")

def get_gemini_model(model_name: str = "gemini-2.0-flash"):
    # Updated default to 1.5-flash as 1.0-pro is being deprecated
    if not _gemini_initialized:
        init_gemini()
    
    return GeminiModelAdapter(_client, model_name)