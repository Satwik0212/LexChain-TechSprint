from typing import List
from app.analysis.schemas import Clause
from app.analysis.rules.models import LayerResult, RiskLevel, Flag

def run_layer3(clauses: List[Clause]) -> LayerResult:
    """
    Layer 3: Liability & Indemnification
    Checks for unlimited liability, consequential damages, and one-sided indemnity.
    """
    flags: List[Flag] = []
    max_risk = RiskLevel.LOW

    for clause in clauses:
        text_lower = clause.text.lower()

        # 1. Unlimited Liability
        # Trigger: "unlimited liability", "without limitation", "no cap on liability"
        # GUARD: "limited to the extent permitted by law" or "except for..." (context)
        # We look for explicit "liability shall be unlimited" or "unlimited" without "not"
        if "unlimited liability" in text_lower or \
           "no cap on liability" in text_lower or \
           ("liability" in text_lower and "unlimited" in text_lower and "not" not in text_lower):
            
            # Additional Guard: "including without limitation" is NOT unlimited liability
            if "including without limitation" in text_lower and "liability" not in text_lower:
                pass
            else:
                flags.append(Flag(
                    layer=3,
                    clause_id=clause.clause_id,
                    title="Unlimited Liability",
                    description="Unlimited liability exposes the individual to unbounded financial risk.",
                    risk=RiskLevel.HIGH
                ))
                max_risk = RiskLevel.HIGH

        # 2. Consequential / Indirect Damages
        # Trigger: "consequential damages", "indirect damages"
        # GUARD: "neither party", "shall not be liable", "excluding"
        
        has_bad_consequential = False
        if "consequential damages" in text_lower or \
           "indirect damages" in text_lower or \
           "special damages" in text_lower:
           
           # Check for negation (Good)
           if "not be liable" in text_lower or \
              "neither party shall be liable" in text_lower or \
              "excluding" in text_lower or \
              "excluded" in text_lower or \
              "waiver of" in text_lower:
                # This is actually GOOD (safe) 
                # Add to Positive Findings? (We need to populate positive_findings list)
                pass 
           else:
                # Likely bad - "shall be liable for consequential..."
                # Or ambiguous. If it just says "including consequential damages", it's bad.
                has_bad_consequential = True
        
        if has_bad_consequential:
            flags.append(Flag(
                layer=3,
                clause_id=clause.clause_id,
                title="Consequential Damages",
                description="Consequential damages can vastly exceed contract value and are high risk.",
                risk=RiskLevel.HIGH
            ))
            max_risk = RiskLevel.HIGH

        # 3. One-Sided Indemnity
        # Trigger: "employee shall indemnify"
        # GUARD: "mutual", "company shall indemnify"
        is_indemnity_obligation = "employee shall indemnify" in text_lower or \
                                  "indemnify the company" in text_lower or \
                                  "hold the company harmless" in text_lower
        
        has_reciprocal = "company shall indemnify" in text_lower or \
                         "mutual indemnity" in text_lower or \
                         "mutually indemnify" in text_lower or \
                         "indemnify the employee" in text_lower

        if is_indemnity_obligation and not has_reciprocal:
             flags.append(Flag(
                layer=3,
                clause_id=clause.clause_id,
                title="One-Sided Indemnity",
                description="One-sided indemnity unfairly shifts legal risk to the individual.",
                risk=RiskLevel.HIGH
            ))
             max_risk = RiskLevel.HIGH

    return LayerResult(
        layer=3,
        flags=flags,
        risk=max_risk
    )
