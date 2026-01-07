from typing import List
from app.analysis.schemas import Clause
from app.analysis.rules.models import LayerResult, RiskLevel, Flag

def run_layer4(clauses: List[Clause]) -> LayerResult:
    """
    Layer 4: Employment Risks (India Specific Context)
    Focuses on non-competes, bonds, and restrictive covenants.
    Reference: Section 27 of Indian Contract Act.
    """
    flags: List[Flag] = []
    max_risk = RiskLevel.LOW

    for clause in clauses:
        text_lower = clause.text.lower()
        
        # 1. Post-Employment Non-Compete
        # Logic: "non-compete" AND ("after termination" OR "post termination")
        # Or broad "restraint of trade"
        is_non_compete = "non-compete" in text_lower or "non compete" in text_lower or "restraint of trade" in text_lower
        is_post_term = "after termination" in text_lower or "post termination" in text_lower or "post-termination" in text_lower
        
        if is_non_compete and is_post_term:
            flags.append(Flag(
                layer=4,
                clause_id=clause.clause_id,
                title="Post-Employment Non-Compete",
                description="Post-employment non-compete clauses are generally void under Section 27 of the Indian Contract Act.",
                risk=RiskLevel.HIGH
            ))
            max_risk = RiskLevel.HIGH

        # 2. Internship / Service Bonds / Exit Penalties
        # Logic: "bond" OR "liquidated damages" OR "penalty" in context of exit
        if "bond" in text_lower or "service bond" in text_lower or \
           ("penalty" in text_lower and "exit" in text_lower) or \
           ("liquidated damages" in text_lower and "employment" in text_lower):
             
             flags.append(Flag(
                layer=4,
                clause_id=clause.clause_id,
                title="Employment Bond / Exit Penalty",
                description="Employment bonds and exit penalties may be coercive and unenforceable under Indian law.",
                risk=RiskLevel.HIGH
            ))
             max_risk = RiskLevel.HIGH

        # 3. Post-Termination Exclusivity
        # Logic: "exclusive" AND "termination"
        if ("exclusive services" in text_lower or "shall not engage" in text_lower) and \
           ("after termination" in text_lower or "post termination" in text_lower):
            
            flags.append(Flag(
                layer=4,
                clause_id=clause.clause_id,
                title="Post-Termination Exclusivity",
                description="Restrictions on professional activity after termination may be invalid under Indian law.",
                risk=RiskLevel.HIGH
            ))
            max_risk = RiskLevel.HIGH

    return LayerResult(
        layer=4,
        flags=flags,
        risk=max_risk
    )
