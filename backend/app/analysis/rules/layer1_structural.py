from typing import List
from app.analysis.schemas import Clause
from app.analysis.rules.models import LayerResult, RiskLevel, Flag

def run_layer1(clauses: List[Clause]) -> LayerResult:
    """
    Layer 1: Structural Analysis
    Checks for clause length, absolute language, and obligation asymmetry.
    """
    flags: List[Flag] = []
    max_risk = RiskLevel.LOW
    
    company_obligation_count = 0
    employee_obligation_count = 0

    for clause in clauses:
        text_lower = clause.text.lower()
        word_count = len(clause.text.split())

        # 1. Clause Length > 300 words
        if word_count > 300:
             flags.append(Flag(
                layer=1,
                clause_id=clause.clause_id,
                title="Excessively Long Clause",
                description=f"Clause contains {word_count} words, which reduces readability and hides risks.",
                risk=RiskLevel.MEDIUM
            ))
             if max_risk == RiskLevel.LOW: max_risk = RiskLevel.MEDIUM

        # 2. Absolute Words
        # "solely", "irrevocably", "at its sole discretion"
        # GUARD: Administrative terms (e.g. "internship duration", "tasks") -> ignore
        # GUARD: Context -> Only flag if affects "termination", "salary", "payment", "rights".
        if "solely" in text_lower or \
           "irrevocably" in text_lower or \
           "sole discretion" in text_lower:
             
             # Check Context
             is_critical_context = "termination" in text_lower or \
                                   "salary" in text_lower or \
                                   "payment" in text_lower or \
                                   "intellectual property" in text_lower or \
                                   "rights" in text_lower
            
             is_administrative = "evaluation" in text_lower or \
                                 "assessment" in text_lower or \
                                 "duties" in text_lower or \
                                 "assignment of tasks" in text_lower

             if is_critical_context or not is_administrative:
                 flags.append(Flag(
                    layer=1,
                    clause_id=clause.clause_id,
                    title="Absolute/Unilateral Language",
                    description="Use of terms like 'solely' or 'sole discretion' indicates lack of negotiation power.",
                    risk=RiskLevel.MEDIUM
                ))
                 if max_risk == RiskLevel.LOW: max_risk = RiskLevel.MEDIUM

        # Count obligations for Global Check
        company_obligation_count += text_lower.count("company shall")
        employee_obligation_count += text_lower.count("employee shall") + text_lower.count("you shall")

    # 3. Obligation Asymmetry (Global Check)
    if employee_obligation_count > 0:
        ratio = employee_obligation_count / (company_obligation_count if company_obligation_count > 0 else 1)
        if ratio > 2 and employee_obligation_count > 5: # Threshold to avoid short flags
             flags.append(Flag(
                layer=1,
                clause_id=None, # Global flag
                title="Obligation Asymmetry",
                description=f"Employee has significantly more obligations ({employee_obligation_count}) than the Company ({company_obligation_count}).",
                risk=RiskLevel.MEDIUM
            ))
             if max_risk == RiskLevel.LOW: max_risk = RiskLevel.MEDIUM

    return LayerResult(
        layer=1,
        flags=flags,
        risk=max_risk
    )
