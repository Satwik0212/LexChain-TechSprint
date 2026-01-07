from typing import Optional

# Static Map: Clause Title -> Safe Redline Text
REDLINE_DB = {
    "Post-Employment Non-Compete": (
        "During the term of employment, the Employee shall not engage in any competing business. "
        "Upon termination, the Employee shall not use the Company's specific trade secrets "
        "but shall ideally be free to join any competitor without restriction."
    ),
    "Employment Bond / Exit Penalty": (
        "The Company invests in the Employee's training. In the event of resignation within 12 months, "
        "the Employee agrees to reimburse only the actual, proven costs of external training certifications, "
        "if any, provided by the Company."
    ),
    "Untitled Liability": (
        "The Employee's total liability under this Agreement shall be limited to the professional fees paid "
        "or payable to the Employee in the preceding three (3) months. This cap does not apply to fraud or willful misconduct."
    ),
    "Consequential Damages": (
        "Neither Party shall be liable to the other for any indirect, special, or consequential damages, "
        "including loss of profits or revenue, arising out of this Agreement."
    ),
    "One-Sided Indemnity": (
        "Each Party shall indemnify, defend, and hold harmless the other Party against third-party claims "
        "arising from its own gross negligence or willful misconduct."
    ),
    "Immediate Termination": (
        "Either Party may terminate this Agreement for cause upon providing seven (7) days written notice "
        "if the breach remains uncured."
    ),
    "Unilateral Termination": (
        "Either Party may terminate this Agreement by providing thirty (30) days prior written notice to the other Party."
    ),
    "Perpetual Confidentiality": (
        "The confidentiality obligations shall apply during employment and for a period of two (2) years thereafter. "
        "Information in the public domain or independently developed shall be excluded."
    ),
    "Sole Arbitrator": (
        "Any dispute shall be referred to a sole arbitrator mutually appointed by both Parties. "
        "If parties fail to agree, the arbitrator shall be appointed in accordance with the Arbitration and Conciliation Act, 1996."
    ),
    "Foreign Arbitration": (
        "The seat and venue of arbitration shall be New Delhi, India. The arbitration proceedings shall be conducted in English."
    ),
    "Unilateral Amendment": (
        "This Agreement may be amended or modified only by a written instrument signed by both the Company and the Employee."
    ),
    "Absolte/Unilateral Language": (
        "The Company shall act reasonably and in good faith when exercising its discretion under this Agreement."
    )
}

def get_redline(flag_title: str, original_text: str) -> Optional[str]:
    # Simple keyword matching or exact title matching
    for key, template in REDLINE_DB.items():
        if key.lower() in flag_title.lower():
            return template
    return None
