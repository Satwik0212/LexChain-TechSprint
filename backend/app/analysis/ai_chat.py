import logging
from app.core.llm_router import generate

logger = logging.getLogger(__name__)

async def chat_about_contract(contract_text: str, user_question: str) -> dict:
    """
    Enhanced legal chatbot that can reason about ANY Indian contract type.
    """
    
    SYSTEM_PROMPT = """
    You are an expert Indian Legal Assistant with deep knowledge of ALL contract types including:
    - Employment & NDA Agreements
    - Rental, Lease, and Leave & License Agreements
    - Vendor, Service, and Supply Contracts
    - Sale Deeds and Property MOUs
    - Loan & Partnership Deeds
    
    You reason based on the Indian Contract Act 1872, Transfer of Property Act 1882, 
    Specific Relief Act 1963, and other applicable Indian laws.
    
    Your goal is to answer questions about the provided contract by:
    1. Inferring risks even if not explicitly stated.
    2. Citing relevant sections of Indian law.
    3. Providing practical, plain-English advice.
    
    If the question is not about the contract, politely steer the user back.
    Answer in plain, helpful language. Do not use markdown or JSON formatting.
    """
    
    # Truncate to fit context window
    truncated_text = contract_text[:15000]
    
    chat_prompt = f"""
    {SYSTEM_PROMPT}
    
    CONTRACT TEXT:
    {truncated_text}
    
    USER QUESTION:
    {user_question}
    """
    
    try:
        # Use Groq for low-latency chat
        result = await generate(chat_prompt, task="chat")
        answer = result.get("text", "")
        
        # Fallback for empty or too short responses
        if not answer or len(answer.strip()) < 10:
            answer = "I couldn't generate a detailed answer based on the current context. Please try rephrasing your question."

        logger.info(f"Chat response received from {result.get('provider')}")
        
        return {
            "answer": answer,
            "confidence": "High" if len(answer) > 100 else "Medium",
            "provider": result.get("provider", "Groq")
        }
    except Exception as e:
        logger.error(f"Chat failed: {e}")
        return {
            "answer": "The AI chat service is temporarily unavailable. Please try again later.",
            "confidence": "Low"
        }