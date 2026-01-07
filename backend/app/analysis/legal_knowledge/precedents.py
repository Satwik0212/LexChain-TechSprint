from typing import List
from pydantic import BaseModel
import random

class Precedent(BaseModel):
    case_name: str
    court: str
    principle: str
    year: str

# Enhanced Precedents DB with categories
PRECEDENTS_POOL = {
    "termination": [
        Precedent(case_name="Delhi Transport Corp v. D.T.C. Mazdoor Congress", court="SC", year="1991", principle="Termination without reason is arbitrary."),
        Precedent(case_name="Central Inland Water v. Brojo Nath", court="SC", year="1986", principle="Unconscionable terms in standard contracts are void."),
        Precedent(case_name="West Bengal State Electricity v. Desh Bandhu", court="SC", year="1985", principle="Notice period must be reasonable.")
    ],
    "non-compete": [
        Precedent(case_name="Percept D'Mark v. Zaheer Khan", court="SC", year="2006", principle="Post-term non-compete is void (Sec 27)."),
        Precedent(case_name="Niranjan Shankar Golikari v. Century Spinning", court="SC", year="1967", principle="Non-compete valid solely during employment term."),
        Precedent(case_name="Superintendence Co. v. Krishan Murgai", court="SC", year="1980", principle="Restraint of trade doctrine applies even after termination.")
    ],
    "arbitration": [
        Precedent(case_name="Perkins Eastman v. HSCC", court="SC", year="2019", principle="Unilateral appointment of sole arbitrator is invalid."),
        Precedent(case_name="TRF Ltd. v. Energo Engineering", court="SC", year="2017", principle="Ineligible person cannot nominate arbitrator."),
        Precedent(case_name="Bharat Broadband v. United Telecoms", court="SC", year="2019", principle="Parties cannot waive Sec 12(5) invalidity by agreement.")
    ],
    "liability": [
        Precedent(case_name="Bharathi Knitting v. DHL", court="SC", year="1996", principle="Liability caps in signed contracts are generally binding unless unconscionable."),
        Precedent(case_name="ONGC v. Saw Pipes", court="SC", year="2003", principle="Liquidated damages must be reasonable pre-estimate of loss.")
    ],
    "ip": [
        Precedent(case_name="V.T. Thomas v. Malayala Manorama", court="Kerala HC", year="1989", principle="Employees own copyright in work done outside course of employment."),
        Precedent(case_name="Burlington Home Shopping v. Rajnish", court="Delhi HC", year="1995", principle="Customer lists can be trade secrets.")
    ]
}

def get_precedents(flag_title: str) -> List[Precedent]:
    """
    Dynamic selector for precedents.
    Returns 1-3 unique precedents relevant to the risk.
    """
    key = "termination" # Default
    
    t = flag_title.lower()
    if "compete" in t or "bond" in t or "garden" in t:
        key = "non-compete"
    elif "arbitrat" in t or "dispute" in t or "law" in t:
        key = "arbitration"
    elif "liab" in t or "indemni" in t or "damages" in t:
        key = "liability"
    elif "intellectual" in t or "confident" in t or "project" in t:
        key = "ip"
    elif "term" in t or "notice" in t:
        key = "termination"

    # Select samples
    pool = PRECEDENTS_POOL.get(key, PRECEDENTS_POOL["termination"])
    count = random.randint(1, min(3, len(pool)))
    return random.sample(pool, count)
