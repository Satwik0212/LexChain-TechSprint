from typing import List
import json
import os
from app.analysis.verification_schemas import VerificationResult
from app.analysis.rules.models import RuleEngineResult
from app.core.llm_router import generate

# --- CONFIGURATION ---

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
{{
  "confidence": "High" | "Medium" | "Low",
  "consistency_check": "Consistent" | "Potential mismatch",
  "possible_missed_areas": ["..."],
  "ambiguities": ["..."]
}}

CONSTRAINTS:
- Return ONLY valid JSON.
- Do not add markdown formatting (no ```json).
- Do not add explanations outside JSON.
- If text is too short, return Low confidence.
"""

async def verify_analysis(contract_text: str, engine_result: RuleEngineResult) -> VerificationResult:
    """
    Calls LLM Router to provide a second-opinion verification.
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

        response_dict = await generate(prompt, task="verification")
        raw_text = response_dict.get("text", "")

        # Debug Log
        print(f"DEBUG: Raw Verification Response (first 100 chars): {raw_text[:100]}...")
        
        try:
            data = json.loads(raw_text)
            return VerificationResult(
                confidence=data.get("confidence", "Medium"),
                consistency_check=data.get("consistency_check", "Consistent"),
                possible_missed_areas=data.get("possible_missed_areas", []),
                ambiguities=data.get("ambiguities", [])
            )
        except json.JSONDecodeError:
            print(f"JSON Decode Error in Verification. Raw Response: {raw_text}")
            return VerificationResult(
                confidence="Low",
                consistency_check="Error parsing AI response",
                possible_missed_areas=["System was unable to parse AI consistency check."],
                ambiguities=[]
            )

    except Exception as e:
        print(f"Verification Failed: {e}")
        return VerificationResult(
            confidence="Unknown",
            consistency_check="Not available",
            possible_missed_areas=["AI service temporarily unavailable."],
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



async def summarize_contract(contract_text: str) -> List[str]:
    if not contract_text or len(contract_text.strip()) < 100:
        return ["Text too short for analysis."]
        
    try:
        prompt = SUMMARY_PROMPT.format(text=contract_text[:50000])
        response = await generate(prompt, task="summary")
        
        raw_text = response["text"]
        
        lines = []
        for line in raw_text.split('\n'):
            line = line.strip()
            if not line:
                continue
            
            clean_line = line
            if line.startswith(('-', '*', '•')):
                clean_line = line[1:].strip()
            elif len(line) > 1 and line[0].isdigit() and line[1] in ('.', ')'):
                clean_line = line[2:].strip()
            
            if len(clean_line) > 10:
                lines.append(clean_line)
        
        return lines[:6]
        
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        return [
            "AI service temporarily unavailable."
        ]


