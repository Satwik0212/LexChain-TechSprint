from typing import List
import re
from app.analysis.schemas import Clause
from app.analysis.rules.models import LayerResult, RiskLevel, Flag

def run_layer2(clauses: List[Clause]) -> LayerResult:
    """
    Layer 2: Termination
    Checks for 'without notice', unilateral termination, and short notice periods.
    """
    flags: List[Flag] = []
    max_risk = RiskLevel.LOW

    # Regex for notice period findings: "7 days", "10 days notice"
    notice_regex = re.compile(r'(\d+)\s*days?\s*notice')

    for clause in clauses:
        text_lower = clause.text.lower()
        
        # Only analyze if related to termination/notice
        if "terminat" not in text_lower and "notice" not in text_lower:
            continue

        # 1. Without Notice -> HIGH
        if "without notice" in text_lower or "immediate termination" in text_lower:
             flags.append(Flag(
                layer=2,
                clause_id=clause.clause_id,
                title="Immediate Termination",
                description="Right to terminate without notice creates instability.",
                risk=RiskLevel.HIGH
            ))
             max_risk = RiskLevel.HIGH

        # 2. Unilateral Termination Rights -> HIGH
        # "company may terminate" AND NOT "employee may terminate"
        if "company may terminate" in text_lower and "employee may terminate" not in text_lower:
             flags.append(Flag(
                layer=2,
                clause_id=clause.clause_id,
                title="Unilateral Termination",
                description="Only the company has the right to terminate, which is unfair.",
                risk=RiskLevel.HIGH
            ))
             max_risk = RiskLevel.HIGH

        # 3. Notice Period < 15 days -> MEDIUM
        matches = notice_regex.findall(text_lower)
        for days_str in matches:
            try:
                days = int(days_str)
                if 0 < days < 15:
                    flags.append(Flag(
                        layer=2,
                        clause_id=clause.clause_id,
                        title="Short Notice Period",
                        description=f"Notice period of {days} days is dangerously short.",
                        risk=RiskLevel.MEDIUM
                    ))
                    if max_risk == RiskLevel.LOW: max_risk = RiskLevel.MEDIUM
            except ValueError:
                pass

        # 4. Termination for Convenience (Company Only) -> MEDIUM
        if "termination for convenience" in text_lower or "terminate for convenience" in text_lower:
            if "company" in text_lower and "employee" not in text_lower:
                 flags.append(Flag(
                    layer=2,
                    clause_id=clause.clause_id,
                    title="Termination for Convenience",
                    description="Company can fire you for no reason at any time.",
                    risk=RiskLevel.MEDIUM
                ))
                 if max_risk == RiskLevel.LOW: max_risk = RiskLevel.MEDIUM

    return LayerResult(
        layer=2,
        flags=flags,
        risk=max_risk
    )
