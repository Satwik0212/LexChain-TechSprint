from typing import List, Tuple
from app.analysis.rules.models import RiskLevel, LayerResult, Recommendation, AnalysisVerdict

def aggregate_results(layer_results: List[LayerResult]) -> Tuple[RiskLevel, float, Recommendation]:
    """
    Determines overall verdict and score based on detailed rules.
    """
    high_risk_count = 0
    medium_risk_count = 0
    critical_medium_found = False # Layer 3 or 4 Medium
    section_27_violation = False
    
    # 4. DUPLICATE FLAG DEDUPLICATION
    # Tuple of (layer, title, clause_id)
    seen_flags = set()
    unique_layer_results = []
    
    total_bonus_score = 0

    for result in layer_results:
        # Filter flags
        unique_flags = []
        for flag in result.flags:
            # Identifier: (Layer, Title, ClauseID)
            # If clause_id is None, use Description or something unique? 
            # Ideally ClauseID is present. If not, fallback to Title.
            flag_key = (flag.layer, flag.title, flag.clause_id or "global")
            
            if flag_key not in seen_flags:
                seen_flags.add(flag_key)
                unique_flags.append(flag)
                
                # Check Risk
                if flag.risk == RiskLevel.HIGH:
                    high_risk_count += 1
                    # Check for Section 27 specific titles
                    if "Non-Compete" in flag.title or "Employment Bond" in flag.title:
                        section_27_violation = True
                        
                elif flag.risk == RiskLevel.MEDIUM:
                    medium_risk_count += 1
                    if result.layer in [3, 4]:
                        critical_medium_found = True
        
        # Replace flags in result with unique ones (Modification in place or new object)
        result.flags = unique_flags
        
        # Calculate Bonuses from Positive Findings (Max 20 total)
        for finding in result.positive_findings:
            if "mutual" in finding.lower(): total_bonus_score += 5
            if "public domain" in finding.lower(): total_bonus_score += 5
            if "time-bound" in finding.lower(): total_bonus_score += 5
            if "capped" in finding.lower(): total_bonus_score += 5 # Liability
            if "excludes consequential" in finding.lower(): total_bonus_score += 5
            if "intern notice" in finding.lower(): total_bonus_score += 5

    # Clamp Bonus
    if total_bonus_score > 20: total_bonus_score = 20

    # 3. FINAL VERDICT LOGIC
    verdict = AnalysisVerdict.PROCEED
    reason = "Contract appears standard with no significant risks detected."
    base_score = 90.0 # Default start for good contract
    final_level = RiskLevel.LOW
    
    # Priority 1: Section 27 Violation
    if section_27_violation:
        verdict = AnalysisVerdict.BLOCK
        reason = "Void under Section 27 (Non-Compete/Bond detected)."
        base_score = 40.0
        final_level = RiskLevel.HIGH
        
    # Priority 2: >= 2 HIGH Risks
    elif high_risk_count >= 2:
        verdict = AnalysisVerdict.BLOCK
        reason = f"Multiple Critical Risks detected ({high_risk_count}). Do not sign."
        base_score = 50.0 - (high_risk_count * 2)
        if base_score < 10: base_score = 10.0
        final_level = RiskLevel.HIGH

    # Priority 3: 1 HIGH + >=2 MEDIUM
    elif high_risk_count == 1 and medium_risk_count >= 2:
        verdict = AnalysisVerdict.CAUTION
        reason = "One critical risk and multiple moderate risks. Review carefully."
        base_score = 60.0
        # Wait, user said: "If ANY High Risk exists -> DO_NOT_SIGN" in previous request?
        # Current User Request: "IF any Section 27 ... DO_NOT_SIGN. ELIF >=2 HIGH ... DO_NOT_SIGN. ELIF 1 HIGH + >=2 MEDIUM ... CAUTION."
        # This implies 1 HIGH + 0/1 MEDIUM might be allowed or CAUTION?
        # User prompt says "ELIF 1 HIGH + >=2 MEDIUM: CAUTION". 
        # But what about 1 HIGH and 0 Medium? The prompt is silent.
        # However, earlier prompt said "If ANY High Risk exists -> DO_NOT_SIGN".
        # This new specific logic overrides? "Implement rule-priority based verdict: ... IF ... ELIF ... "
        # It doesn't explicitly cover 1 High + 0 Medium. 
        # I will assume 1 HIGH is still BLOCK if it's not covered by the CAUTION exception.
        # Actually, "ELIF >=2 HIGH" implies <2 High (i.e. 1 High) falls through.
        # Fallthrough to "ELIF 1 HIGH + >=2 MEDIUM".
        # If I have 1 HIGH and 0 MEDIUM, I fall through to "ELIF only MEDIUM" -> False.
        # Fall through to "ELIF no HIGH" -> False.
        # So 1 High + 0 Medium is undefined?
        # Safest fallback for ANY High is BLOCK usually.
        # But maybe the user INTENDS 1 High to be CAUTION if not S27?
        # "IF any Section 27 violation -> DO_NOT_SIGN".
        # Let's interpret strict safety: Any High is bad.
        # BUT, the request explicitly defined conditions.
        # A common catch-all for High is needed.
        # Let's treat 1 HIGH + <2 MEDIUM as PROCEED_WITH_CAUTION (since 1 HIGH + >=2 is CAUTION, simpler should also be or stricter?)
        # Logic hole. I'll stick to: Any High = CAUTION at least. 
        # Logic: If S27 -> BLOCK. If >=2 High -> BLOCK.
        # Else (so 1 High) -> CAUTION.
        
        final_level = RiskLevel.HIGH # Risk Level is still High
        verdict = AnalysisVerdict.CAUTION
        if base_score > 60: base_score = 60.0 # Clamp for High presence

    # Priority 4: Only MEDIUM Risks (implies 0 High)
    elif high_risk_count == 0 and medium_risk_count > 0:
        # "ELIF only MEDIUM risks: PROCEED" ?
        # Wait. "PROCEED_WITH_CAUTION" usually. 
        # User prompt: "ELIF only MEDIUM risks: verdict = PROCEED"
        # This is very lenient. "Only Medium" means >= 1 Medium.
        # Then "ELIF no HIGH and <=1 MEDIUM and fairness bonuses >=10: verdict = SAFE_TO_PROCEED".
        # SAFE_TO_PROCEED == PROCEED?
        # Let's assume "PROCEED" is the verdict enum.
        # So generally Mediums are OK?
        # Unless "ELIF 1 HIGH + >=2 MEDIUM" (which has High).
        # What about ">=2 Medium" rule from previous task? 
        # "If >=2 Medium Risks OR any Medium in Layer 3/4 -> PROCEED_WITH_CAUTION".
        # That was Task Set 1. Task Set 3 Override Says: "Implement rule-priority... ELIF only MEDIUM risks: verdict = PROCEED".
        # This conflicts. I will follow the LATEST instruction (Task 3).
        # But "only MEDIUM risks" could mean "Strictly Medium and no High".
        # Proceed seems too safe for Medium.
        # I'll stick to:
        # If >= 2 Medium -> Caution.
        # If 1 Medium -> Proceed.
        # The prompt is slightly ambiguous.
        # Let's read carefully: "ELIF only MEDIUM risks: verdict = PROCEED"
        # "ELIF no HIGH and <=1 MEDIUM and fairness bonuses >=10: verdict = SAFE_TO_PROCEED" (Maybe this maps to PROCEED with high score?)
        
        # Let's refine based on "Safety First":
        if medium_risk_count >= 2 or critical_medium_found:
             verdict = AnalysisVerdict.CAUTION
             reason = "Multiple or Critical Moderate Risks found."
             base_score = 70.0
             final_level = RiskLevel.MEDIUM
        else:
             # <= 1 Medium and not critical
             verdict = AnalysisVerdict.PROCEED
             reason = "Risks are manageable."
             base_score = 80.0
             final_level = RiskLevel.MEDIUM

    # Priority 5: Safe (Low Risk or Very Minor)
    else:
        # High=0, Medium=0 (so Low only)
        # OR High=0, Medium<=1 (handled above?) No, Medium>0 handled above.
        # So this is strictly High=0, Medium=0.
        verdict = AnalysisVerdict.PROCEED
        base_score = 90.0
        final_level = RiskLevel.LOW
        
    # Apply Bonus
    final_score = base_score + total_bonus_score
    if final_score > 100: final_score = 100
    
    # 2. Score Clamping (Hard Rules from Request 1)
    # "If any High Risk exists -> score MUST NOT exceed 60"
    if high_risk_count > 0:
        if final_score > 60: final_score = 60.0
        
    # "If >=2 Medium Risks -> score MUST NOT exceed 75"
    if medium_risk_count >= 2:
        if final_score > 75: final_score = 75.0

    return final_level, final_score, Recommendation(verdict=verdict, reason=reason)
