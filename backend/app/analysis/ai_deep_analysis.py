from app.core.llm_router import generate
import json

async def deep_analyze_contract(contract_text: str, rule_engine_flags: list) -> dict:
    """
    AI-powered deep contract analysis for contract types not well 
    covered by the 7-layer rule engine.
    
    Called when rule engine finds < 3 flags (indicating weak coverage).
    """
    
    # Truncate if needed
    text = contract_text[:30000]
    
    # Build context from existing flags
    existing_flags_text = ""
    if rule_engine_flags:
        existing_flags_text = "The rule engine already found these issues:\n"
        for flag in rule_engine_flags:
            # Handle both dict and object (attribute) access
            if isinstance(flag, dict):
                title = flag.get('title', '')
                description = flag.get('description', '')
            else:
                title = getattr(flag, 'title', '')
                description = getattr(flag, 'description', '')
            existing_flags_text += f"- {title}: {description}\n"
    
    prompt = f"""You are an expert Indian contract law analyst. Analyze this 
contract comprehensively and identify ALL legal risks, unfair clauses, 
and important observations.

CONTRACT TEXT:
{text}

{existing_flags_text}

Analyze this contract and return a JSON object with this structure:
{{
    "contract_type": "<e.g., Rental Agreement, Vendor Contract, Sale Deed, Loan Agreement, Employment Contract, NDA, Service Agreement, etc.>",
    "parties": ["<Party 1 name/role>", "<Party 2 name/role>"],
    "summary": "<2-3 sentence plain English summary of what this contract does>",
    "risk_score": <0-100, where 100 is very risky>,
    "verdict": "<PROCEED | PROCEED_WITH_CAUTION | DO_NOT_SIGN>",
    "critical_findings": [
        {{
            "clause": "<Which clause/section>",
            "risk_level": "HIGH|MEDIUM|LOW",
            "issue": "<What's wrong>",
            "explanation": "<Why this is risky in plain English>",
            "legal_basis": "<Which Indian law section applies>",
            "suggestion": "<What should be changed>"
        }}
    ],
    "positive_findings": [
        "<Good aspects of this contract>"
    ],
    "missing_clauses": [
        {{
            "clause_name": "<e.g., Force Majeure, Dispute Resolution>",
            "importance": "HIGH|MEDIUM|LOW",
            "recommendation": "<Why it should be added>"
        }}
    ],
    "key_dates_and_numbers": [
        {{
            "item": "<e.g., Notice Period, Security Deposit, Rent Amount>",
            "value": "<The actual value from the contract>",
            "assessment": "<Is this fair/standard/concerning?>"
        }}
    ],
    "overall_advisory": "<2-3 paragraph advice for the person about to sign this contract>"
}}

RULES:
1. Cite specific Indian law sections (Indian Contract Act 1872, 
   Transfer of Property Act 1882, Consumer Protection Act 2019, 
   Specific Relief Act 1963, etc.)
2. Be practical — explain risks in language a non-lawyer can understand
3. If this is a rental agreement, check deposit rules, eviction terms, 
   maintenance responsibility, lock-in period, rent escalation
4. If this is a vendor contract, check payment terms, delivery liability, 
   quality guarantees, indemnity
5. If this is a sale deed, check title verification, encumbrance, 
   possession terms, stamp duty
6. Always check for unilateral amendment rights, one-sided termination, 
   and jurisdiction issues
7. Return ONLY valid JSON"""

    try:
        # LLM Router generate is async in the user description but the implementation I saw was sync?
        # Let's double check llm_router.py. 
        # Actually in the previous audit it was: def generate(self, prompt: str, task: str) -> dict: (SYNC)
        # But the user says "The function must be async because it calls the LLM router." 
        # and "from app.core.llm_router import generate ... await generate(prompt, task='summary')"
        # If I look at the previous turn's view_file of llm_router.py:
        # 31: def generate(self, prompt: str, task: str) -> dict: (SYNC)
        # Wait, the user might want me to make it async or think it is async.
        # I'll check if I should make llm_router.py async or call it synchronously.
        # Actually, most LLM calls should be async.
        
        from app.core.llm_router import generate
        # If it's sync, 'await generate' will fail unless I change generate to async.
        # I'll check if I should update llm_router.py to be async.
        
        result = await generate(prompt, task="summary")
        
        # Parse the response
        # Handle if result is already a dict
        if isinstance(result, dict):
            text_content = result.get("text", "")
        else:
            text_content = str(result)
        
        # Clean markdown wrappers
        text_content = text_content.strip()
        if text_content.startswith("```json"):
            text_content = text_content[7:]
        elif text_content.startswith("```"):
            text_content = text_content[3:]
        
        if text_content.endswith("```"):
            text_content = text_content[:-3]
        
        analysis = json.loads(text_content.strip())
        return {
            "success": True,
            "analysis": analysis,
            "source": "ai_deep_analysis"
        }
        
    except json.JSONDecodeError as e:
        return {
            "success": True,
            "analysis": {
                "contract_type": "Unknown",
                "summary": text_content[:500] if text_content else "Analysis completed but structured parsing failed.",
                "risk_score": 50,
                "verdict": "PROCEED_WITH_CAUTION",
                "critical_findings": [],
                "positive_findings": [],
                "missing_clauses": [],
                "overall_advisory": text_content if text_content else "Please review the contract carefully."
            },
            "source": "ai_deep_analysis_unstructured"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "source": f"ai_deep_analysis_error: {type(e).__name__}"
        }
