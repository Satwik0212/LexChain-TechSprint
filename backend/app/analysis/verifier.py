from typing import List
import json
import os
from app.analysis.verification_schemas import VerificationResult
from app.analysis.rules.models import RuleEngineResult

# --- CONFIGURATION ---
from app.core.gemini import get_gemini_model

def _get_gemini_model():
    return get_gemini_model(MODEL_NAME)

MODEL_NAME = "gemini-2.0-flash"

PROMPT_TEMPLATE = """
You are a Legal Consistency Check AI. 
Your role is to REVIEW the findings of a Rule-Based Legal Engine.
You MUST NOT override the rule engine or provide legal advice.

INPUT CONTEXT:
1. RAW CONTRACT TEXT (Partial/Full):
{contract_text}

2. DETECTED RULE ENGINE FLAGS:
{detected_flags}

YOUR TASK:
1. Check Consistency: Do the detected flags make sense given the text?
2. Identify Missed Areas: Are there major risky clauses (e.g. Indemnity, Termination, Non-compete) that seem present in text but missing from flags?
3. Ambiguities: List 1-2 phrases that are highly vague or ambiguous (e.g. "commercially reasonable", "mutually agreed").

OUTPUT FORMAT:
Return PURE JSON matching this schema:
{
  "confidence": "High" | "Medium" | "Low",
  "consistency_check": "Consistent" | "Potential mismatch",
  "possible_missed_areas": ["..."],
  "ambiguities": ["..."]
}

CONSTRAINTS:
- Do not add markdown formatting.
- Do not add explanations outside JSON.
- If text is too short, return Low confidence.
"""

def verify_analysis(contract_text: str, engine_result: RuleEngineResult) -> VerificationResult:
    """
    Calls Gemini to provide a second-opinion verification.
    Fail-safe: Returns default object on any error.
    """
    try:
        flags_desc = []
        for layer in engine_result.layer_results:
            for flag in layer.flags:
                flags_desc.append(f"- [{flag.risk}] {flag.title}: {flag.description}")
        
        flags_text = "\n".join(flags_desc) if flags_desc else "No flags detected."
        
        prompt = PROMPT_TEMPLATE.format(
            contract_text=contract_text[:50000], 
            detected_flags=flags_text
        )

        model = _get_gemini_model()
        if not model:
            return VerificationResult(
                confidence="None",
                consistency_check="Disabled",
                possible_missed_areas=["AI Verification disabled in public demo."],
                ambiguities=[]
            )
        
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        data = json.loads(response.text)
        
        return VerificationResult(
            confidence=data.get("confidence", "Medium"),
            consistency_check=data.get("consistency_check", "Consistent"),
            possible_missed_areas=data.get("possible_missed_areas", []),
            ambiguities=data.get("ambiguities", [])
        )

    except Exception as e:
        print(f"Gemini Verification Failed: {e}")
        return VerificationResult(
            confidence="Unknown",
            consistency_check="Not available",
            possible_missed_areas=[],
            ambiguities=[]
        )

# --- SUMMARY ---

SUMMARY_PROMPT = """
Summarize this Indian contract in 5 concise bullet points.
Focus on:
- Termination rights
- Liability exposure
- IP ownership
- Confidentiality duration
- Overall fairness to an individual signer

Do NOT give legal advice.
Do NOT mention statutes.
Be neutral and factual.

CONTRACT TEXT:
{text}
"""

CHAT_PROMPT = """
You are a Legal Assistant AI helping a user understand a contract.
Answer the user's question based ONLY on the contract text provided.
If the answer is not in the text, say you don't know.
Do not provide legal advice. Be concise.

CONTRACT TEXT:
{text}

USER QUESTION:
{question}
"""

def summarize_contract(contract_text: str) -> List[str]:
    if not contract_text or len(contract_text.strip()) < 100:
        return ["Text too short for analysis."]
        
    try:
        model = _get_gemini_model()
        if not model:
             return [
                "AI Summaries are disabled in this public demo.",
                "To enable: Add a valid GEMINI_API_KEY to the backend.",
                "All rule-based legal flags are still active below."
             ]

        prompt = SUMMARY_PROMPT.format(text=contract_text[:50000])
        response = model.generate_content(prompt)
        
        raw_text = response.text
        
        lines = []
        for line in raw_text.split('\n'):
            line = line.strip()
            if not line:
                continue
            
            clean_line = line
            if line.startswith(('-', '*', '•')):
                clean_line = line[1:].strip()
            elif line[0].isdigit() and line[1] in ('.', ')'):
                clean_line = line[2:].strip()
            
            if len(clean_line) > 10:
                lines.append(clean_line)
        
        return lines[:6]
        
    except Exception as e:
        print(f"CRITICAL GEMINI ERROR: {e}")
        return [
            "AI Summary unavailable due to connection error.",
            "Please rely on the Rule Engine flags below."
        ]

def chat_about_contract(contract_text: str, question: str) -> dict:
    try:
        model = _get_gemini_model()
        if not model:
             return {"answer": "AI Chat is disabled in this public demo.", "confidence": "None"}

        prompt = CHAT_PROMPT.format(
            text=contract_text[:50000],
            question=question
        )
        response = model.generate_content(prompt)
        return {
            "answer": response.text,
            "confidence": "Medium" 
        }
    except Exception as e:
        print(f"Chat failed: {e}")
        return {"answer": "AI assistant temporarily unavailable.", "confidence": "Low"}
