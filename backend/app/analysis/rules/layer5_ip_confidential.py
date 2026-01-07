from typing import List
from app.analysis.schemas import Clause
from app.analysis.rules.models import LayerResult, RiskLevel, Flag

def run_layer5(clauses: List[Clause]) -> LayerResult:
    """
    Layer 5: IP & Confidentiality
    Checks for overreaching IP assignment and perpetual confidentiality.
    """
    flags: List[Flag] = []
    max_risk = RiskLevel.LOW

    for clause in clauses:
        text_lower = clause.text.lower()
        
        # IP CHECKS
        is_ip_clause = "intellectual property" in text_lower or "invention" in text_lower or "assignment" in text_lower

        if is_ip_clause:
            # 1. "All inventions past present future" -> HIGH
            if ("past" in text_lower and "future" in text_lower) or "prior to employment" in text_lower:
                flags.append(Flag(
                    layer=5,
                    clause_id=clause.clause_id,
                    title="Overreaching IP Assignment",
                    description="Clause claims ownership of inventions created BEFORE or AFTER employment.",
                    risk=RiskLevel.HIGH
                ))
                max_risk = RiskLevel.HIGH
            
            # 2. IP includes personal projects -> HIGH
            if "personal project" in text_lower or "private work" in text_lower or "on own time" in text_lower:
                 # Check if it CLAIMS them. "shall belong to company"
                 if "belong to the company" in text_lower or "property of the company" in text_lower:
                    flags.append(Flag(
                        layer=5,
                        clause_id=clause.clause_id,
                        title="Claim on Personal Projects",
                        description="Company claims ownership of work done on your own time/equipment.",
                        risk=RiskLevel.HIGH
                    ))
                    max_risk = RiskLevel.HIGH

        # CONFIDENTIALITY CHECKS
        if "confidential" in text_lower or "non-disclosure" in text_lower:
             
             flagged_perpetual = False

             # 3. Perpetual Confidentiality -> MEDIUM/HIGH
             # GUARD: Check if it's time-bound (e.g. "for a period of 2 years")
             is_time_bound = "period of" in text_lower or \
                             "years from" in text_lower or \
                             "years after" in text_lower or \
                             "term of this agreement" in text_lower
            
             if ("perpetual" in text_lower or "indefinite" in text_lower or "forever" in text_lower) and not is_time_bound:
                flags.append(Flag(
                    layer=5,
                    clause_id=clause.clause_id,
                    title="Perpetual Confidentiality",
                    description="Confidentiality obligation has no end date. Standard is 2-5 years.",
                    risk=RiskLevel.MEDIUM 
                ))
                if max_risk == RiskLevel.LOW: max_risk = RiskLevel.MEDIUM
                flagged_perpetual = True
            
             # 4. Missing Public Domain Carve-out -> MEDIUM
             # GUARD: "exceptions", "exclusions", "shall not apply to"
             # OR if logic is time-bound (less critical)
             # Deduplication: If already flagged perpetual, maybe skip this or verify strictly?
             # User Request: If same clause triggers both, show ONLY stronger one.
             # Perpetual is Medium. Missing PD is Medium.
             # Let's check both but suppress PD if Perpetual is present to avoid noise.
             
             if not flagged_perpetual:
                 has_exception_header = "exceptions" in text_lower or "exclusions" in text_lower
                 if "public domain" not in text_lower and \
                    "publicly available" not in text_lower and \
                    not has_exception_header:
                      flags.append(Flag(
                        layer=5,
                        clause_id=clause.clause_id,
                        title="Missing Public Domain Exception",
                        description="Confidentiality does not exclude information already in the public domain.",
                        risk=RiskLevel.MEDIUM
                    ))
                      if max_risk == RiskLevel.LOW: max_risk = RiskLevel.MEDIUM

    return LayerResult(
        layer=5,
        flags=flags,
        risk=max_risk
    )
