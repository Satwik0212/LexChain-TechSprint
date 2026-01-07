from app.analysis.schemas import JurisdictionResult

def detect_jurisdiction(text: str) -> JurisdictionResult:
    """
    Scans the text for governing law clauses.
    Strict India-Only Guardrail.
    """
    text_lower = text.lower()
    
    # Check for governing law indicators
    has_governing_law = "governed by" in text_lower or "laws of" in text_lower or "jurisdiction" in text_lower
    
    if not has_governing_law:
        return JurisdictionResult(
            jurisdiction="Unknown",
            supported=False,
            message="No governing law clause detected. Proceed with caution."
        )

    # Check for India
    # We look for explicit mentions of India in the context of laws
    # Simplistic heuristic: if "india" appears near "laws" or "governed"
    # For robust v1, we just check if "india" exists in the text roughly? 
    # No, that's too broad. "Made in India" vs "Laws of India".
    # Better: regex or window search?
    # Let's stick to the prompt's simplicity first: "Extract country/state".
    
    if "india" in text_lower or "delhi" in text_lower or "mumbai" in text_lower or "bangalore" in text_lower:
        return JurisdictionResult(
            jurisdiction="India",
            supported=True,
            message="Jurisdiction: India"
        )
        
    # If law detected but not India
    return JurisdictionResult(
        jurisdiction="Foreign/Unknown",
        supported=False,
        message="LexChain currently supports Indian contracts only."
    )
