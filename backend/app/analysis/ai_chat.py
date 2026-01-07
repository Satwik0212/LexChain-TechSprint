import json
from app.core.gemini import get_gemini_model

MODEL_NAME = "gemini-2.0-flash"

def answer_question(text: str, question: str):
    """
    REAL Gemini Chat: This is the ONLY part calling the API to ensure 
    stable performance within Free Tier limits.
    """
    try:
        model = get_gemini_model(MODEL_NAME)
        
        # TRUNCATION: Keeping text under 20k chars (~5k tokens) 
        # saves 75% of your TPM (Tokens Per Minute) quota per message.
        safe_text = text[:20000] 
        
        prompt = f"Answer based ONLY on this text: {safe_text}. Question: {question}"

        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )

        return json.loads(response.text)

    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg:
            return {
                "answer": "AI is temporarily busy (Rate Limit). Please wait 60 seconds.",
                "confidence": "Low",
                "disclaimer": "Free Tier quota limit reached."
            }
        
        print(f"❌ Chat Failed: {e}")
        return {"answer": "AI Assistant error.", "confidence": "Low"}