import json
import time
from typing import Dict, List
from app.core.llm_router import generate

# --- CONFIGURATION ---
# SET THIS TO False TO SKIP API CALLS AND SAVE YOUR RATE LIMIT
# SET TO True ONLY WHEN YOU WANT TO DEMO THE REAL AI
USE_GEMINI_FOR_SUMMARY = True 

# --- PROMPTS ---
SUMMARY_PROMPT = """
You are a senior Indian Legal Expert. 
Summarize the following contract in 4-6 concise bullet points for a non-lawyer.
Focus on: Termination, Liability, Dispute Resolution, and Non-compete.
Strictly fact-based. 

OUTPUT CONSTRAINTS:
- Return ONLY valid JSON.
- No markdown formatting (no ```json).
- No explanations or filler text.

Contract Text: {text}

JSON Format Examples:
{{
  "summary": ["Point 1", "Point 2", "Point 3"],
  "status": "success"
}}
"""

async def generate_summary(text: str) -> Dict:
    """
    Summarizes the contract. Skips API if USE_GEMINI_FOR_SUMMARY is False.
    """
    if not USE_GEMINI_FOR_SUMMARY:
        print("AI Summary: Running in Mock Mode (Quota Protection Active)")
        return {
            "summary": [
                "Contract structure follows standard Indian Service Agreement norms.",
                "Termination requires a 30-day written notice from either party.",
                "Liability is capped at the total fees paid in the last 6 months.",
                "Dispute resolution is set to New Delhi arbitration under ICA 1872."
            ],
            "status": "mock_success"
        }

    # --- REAL LLM LOGIC
    print("LLM Router: Requesting REAL Summary via Sarvam...")
    safe_text = text[:10000] 

    try:
        prompt = SUMMARY_PROMPT.format(text=safe_text)
        response_dict = await generate(prompt, task="summary")
        raw_text = response_dict.get("text", "")
        
        # Debug Log
        print(f"DEBUG: Raw Summary Response (first 100 chars): {raw_text[:100]}...")

        try:
            data = json.loads(raw_text)
            return {"summary": data.get("summary", []), "status": "success"}
        except json.JSONDecodeError:
            print(f"JSON Decode Error in Summary. Raw Response: {raw_text}")
            # Dynamic fallback: if it looks like a list or has text, try to extract items
            lines = [line.strip("- *•").strip() for line in raw_text.split("\n") if len(line.strip()) > 10]
            if lines:
                return {"summary": lines[:6], "status": "partial_success"}
            return {"summary": ["Summary generation produced malformed output."], "status": "failed"}

    except Exception as e:
        print(f"Summary Failed: {e}")
        return {"summary": ["AI service temporarily unavailable."], "status": "failed"}

# --- ADVISORY PROMPT ---
ADVISORY_PROMPT = """
You are a legal expert specializing in Indian contract law under the Indian Contract Act, 1872.

Analyze the following contract clause and provide a legal risk assessment.

Clause type: {clause_type}
Clause text: "{clause_text}"

Based on established legal principles and precedents in Indian law, provide:
1. The specific legal risks (be specific, not generic)
2. Why this clause is problematic under Indian law (cite relevant sections of the Contract Act)
3. Practical implications for the party accepting this clause

Format your response as a JSON object with these fields:
- "risk_summary": Brief 1-line summary
- "detailed_analysis": Paragraph explaining the legal issues
- "legal_basis": Specific Indian Contract Act sections or principles that apply
- "practical_impact": What this means for the user

Return ONLY valid JSON, no markdown, no explanations outside the JSON.
"""

async def generate_batch_advisories(issues: List[Dict]) -> List[Dict]:
    """
    Generates legal advisories for a list of detected issues.
    """
    if not issues:
        return []
        
    if not USE_GEMINI_FOR_SUMMARY:
        return [
            {
                "risk_type": issue['risk_type'], 
                "advisory": "Standard legal risk identified. Indian Contract Act Section 27 may apply.", 
                "confidence": "High"
            } for issue in issues
        ]

    results = []
    print(f"LLM Router: Generating {len(issues)} advisories...")

    for issue in issues:
        clause_type = issue.get("risk_type", "General")
        clause_text = issue.get("clause_text", "")
        
        try:
            prompt = ADVISORY_PROMPT.format(
                clause_type=clause_type,
                clause_text=clause_text[:2000] # Truncate clause text
            )
            
            response_dict = await generate(prompt, task="advisory")
            raw_text = response_dict.get("text", "")
            
            try:
                data = json.loads(raw_text)
                # Combine parts into a single advisory string for the UI to display easily
                combined_advisory = (
                    f"Risk: {data.get('risk_summary')}\n\n"
                    f"Analysis: {data.get('detailed_analysis')}\n\n"
                    f"Legal Basis: {data.get('legal_basis')}\n\n"
                    f"Impact: {data.get('practical_impact')}"
                )
                
                results.append({
                    "risk_type": clause_type,
                    "advisory": combined_advisory,
                    "confidence": "High",
                    "raw_data": data # Keep raw data for advanced UI usage
                })
            except json.JSONDecodeError:
                print(f"Advisory JSON Parse Error for {clause_type}. Raw: {raw_text[:100]}")
                results.append({
                    "risk_type": clause_type,
                    "advisory": raw_text if raw_text else "Legal review recommended.",
                    "confidence": "Medium"
                })
        except Exception as e:
            print(f"Advisory generation failed for {clause_type}: {e}")
            results.append({
                "risk_type": clause_type,
                "advisory": "AI service temporarily unavailable for this clause.",
                "confidence": "Low"
            })
            
    return results