from typing import List
from app.analysis.schemas import Clause
from app.analysis.rules.models import LayerResult, RiskLevel, Flag

def run_layer6(clauses: List[Clause]) -> LayerResult:
    """
    Layer 6: Dispute Resolution
    Checks for foreign arbitration, biased arbitrator selection, and cost bearing.
    """
    flags: List[Flag] = []
    max_risk = RiskLevel.LOW

    for clause in clauses:
        text_lower = clause.text.lower()
        
        if "arbitration" in text_lower or "dispute" in text_lower or "jurisdiction" in text_lower:
            
            # 1. Arbitration Seat Outside India -> MEDIUM
            # Look for common foreign hubs
            foreign_seats = ["singapore", "london", "new york", "usa", "dubai", "paris"]
            found_seat = next((seat for seat in foreign_seats if seat in text_lower), None)
            
            if found_seat:
                 flags.append(Flag(
                    layer=6,
                    clause_id=clause.clause_id,
                    title="Foreign Arbitration Seat",
                    description=f"Arbitration/Jurisdiction is in {found_seat.title()}. Expensive for Indian employees.",
                    risk=RiskLevel.MEDIUM
                ))
                 if max_risk == RiskLevel.LOW: max_risk = RiskLevel.MEDIUM
            
            # 2. Sole Arbitrator Appointed by Company -> HIGH
            if "sole arbitrator" in text_lower and \
               ("appointed by the company" in text_lower or "selected by the company" in text_lower):
                 flags.append(Flag(
                    layer=6,
                    clause_id=clause.clause_id,
                    title="Biased Arbitrator Appointment",
                    description="Company has sole right to appoint the arbitrator.",
                    risk=RiskLevel.HIGH
                ))
                 max_risk = RiskLevel.HIGH

            # 3. Employee Bears All Costs -> MEDIUM
            if ("bear all costs" in text_lower or "pay all costs" in text_lower) and \
               ("employee" in text_lower or "service provider" in text_lower):
                 flags.append(Flag(
                    layer=6,
                    clause_id=clause.clause_id,
                    title="Unfair Cost Burden",
                    description="Clause requires you to pay all legal/arbitration costs.",
                    risk=RiskLevel.MEDIUM
                ))
                 if max_risk == RiskLevel.LOW: max_risk = RiskLevel.MEDIUM

    return LayerResult(
        layer=6,
        flags=flags,
        risk=max_risk
    )
