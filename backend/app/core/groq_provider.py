import os
from groq import AsyncGroq

# --- CONFIGURATION ---
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL = "llama-3.3-70b-versatile"


class GroqProvider:
    def __init__(self):
        self.provider_name = "Groq"
        self._client = None

    def _ensure_client(self):
        if self._client is None:
            if not GROQ_API_KEY:
                raise RuntimeError("GROQ_API_KEY is not set")
            self._client = AsyncGroq(api_key=GROQ_API_KEY)

    async def generate(self, prompt: str) -> dict:
        self._ensure_client()
        completion = await self._client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        return {"text": completion.choices[0].message.content, "provider": self.provider_name}
