from typing import List
from app.analysis.schemas import Clause
from app.analysis.rules.models import LayerResult, RiskLevel, Flag

def run_layer7(clauses: List[Clause]) -> LayerResult:
    """
    Layer 7: Fairness & Transparency
    Checks for unilateral amendments, waiver of rights, and unfair force majeure.
    """
    flags: List[Flag] = []
    max_risk = RiskLevel.LOW

    for clause in clauses:
        text_lower = clause.text.lower()

        # 1. Unilateral Amendment Rights -> HIGH
        if "amend" in text_lower or "modify" in text_lower:
            if "sole discretion" in text_lower or "unilaterally" in text_lower:
                flags.append(Flag(
                    layer=7,
                    clause_id=clause.clause_id,
                    title="Unilateral Amendment",
                    description="Company can change the contract terms at any time without your consent.",
                    risk=RiskLevel.HIGH
                ))
                max_risk = RiskLevel.HIGH

        # 2. Waiver of Statutory Rights -> HIGH
        if "waive" in text_lower and \
           ("statutory rights" in text_lower or "legal rights" in text_lower or "claims under law" in text_lower):
            flags.append(Flag(
                layer=7,
                clause_id=clause.clause_id,
                title="Waiver of Rights",
                description="Clause attempts to waive your fundamental legal/statutory rights.",
                risk=RiskLevel.HIGH
            ))
            max_risk = RiskLevel.HIGH

        # 3. Force Majeure (Company Only) -> MEDIUM
        # Heuristic: "Force Majeure" clause that only excuses the "Company"
        if "force majeure" in text_lower:
             if "company shall not be liable" in text_lower and "employee" not in text_lower:
                 flags.append(Flag(
                    layer=7,
                    clause_id=clause.clause_id,
                    title="One-Sided Force Majeure",
                    description="Force Majeure only protects the company from non-performance.",
                    risk=RiskLevel.MEDIUM
                ))
                 if max_risk == RiskLevel.LOW: max_risk = RiskLevel.MEDIUM

    return LayerResult(
        layer=7,
        flags=flags,
        risk=max_risk
    )
