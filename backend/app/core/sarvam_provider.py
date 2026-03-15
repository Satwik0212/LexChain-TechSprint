import os
import httpx

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
SARVAM_API_URL = "https://api.sarvam.ai/v1/chat/completions"
MODEL = "sarvam-m"  # Free chat model


class SarvamProvider:
    def __init__(self):
        self.provider_name = "Sarvam"

    async def generate(self, prompt: str, task: str = "chat") -> dict:
        if not SARVAM_API_KEY:
            raise RuntimeError("SARVAM_API_KEY is not set")

        messages = [
            {
                "role": "system",
                "content": "You are a helpful legal assistant specializing in Indian contract law under the Indian Contract Act, 1872."
            },
            {"role": "user", "content": prompt}
        ]

        # Use high reasoning effort for complex tasks
        reasoning_effort = "high" if task in ["verification", "summary"] else None

        payload = {
            "model": MODEL,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 4096,
        }
        if reasoning_effort:
            payload["reasoning_effort"] = reasoning_effort

        async with httpx.AsyncClient() as client:
            response = await client.post(
                SARVAM_API_URL,
                headers={
                    "Authorization": f"Bearer {SARVAM_API_KEY}",
                    "Content-Type": "application/json"
                },
                json=payload,
                timeout=60.0,
            )

        if response.status_code == 401:
            raise RuntimeError("Sarvam API error: 401 - Invalid API key")
        elif response.status_code == 429:
            raise RuntimeError("Sarvam API error: 429 - Rate limit exceeded")

        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        return {"text": content, "provider": self.provider_name}
