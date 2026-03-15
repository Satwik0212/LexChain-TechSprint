import os
import google.generativeai as genai

# --- CONFIGURATION ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = "gemini-2.0-flash"


class GeminiProvider:
    def __init__(self):
        self.provider_name = "Gemini"
        self._configured = False

    def _ensure_configured(self):
        if not self._configured:
            if not GEMINI_API_KEY:
                raise RuntimeError("GEMINI_API_KEY is not set")
            genai.configure(api_key=GEMINI_API_KEY)
            self._configured = True

    async def generate(self, prompt: str) -> dict:
        self._ensure_configured()
        model = genai.GenerativeModel(MODEL_NAME)
        response = await model.generate_content_async(prompt)
        return {"text": response.text, "provider": self.provider_name}
