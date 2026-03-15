import os
from huggingface_hub import InferenceClient

# --- CONFIGURATION ---
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
MODEL = "mistralai/Mistral-7B-Instruct-v0.2"


class HuggingFaceProvider:
    def __init__(self):
        self.provider_name = "HuggingFace"
        self._client = None

    def _ensure_client(self):
        if self._client is None:
            if not HUGGINGFACE_API_KEY:
                raise RuntimeError("HUGGINGFACE_API_KEY is not set")
            self._client = InferenceClient(token=HUGGINGFACE_API_KEY)

    def generate(self, prompt: str) -> dict:
        self._ensure_client()
        response = self._client.text_generation(prompt, model=MODEL, max_new_tokens=500)
        return {"text": response, "provider": self.provider_name}
