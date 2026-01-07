import re
from typing import List, Dict
from app.analysis.schemas import Clause
from app.analysis.clause_taxonomy import CLAUSE_KEYWORDS

def segment_clauses(text: str) -> List[Clause]:
    """
    3-Pass Clause Segmentation Engine.
    Deterministic, rule-based approach.
    """
    lines = text.split('\n')
    clauses: List[Clause] = []
    
    current_clause_lines = []
    current_clause_type = "Unclassified"
    current_clause_index = 1
    
    # regex for common contract headings: "1. Term", "ARTICLE I", "Section 2.1"
    # Or strict ALL CAPS line of short length
    heading_regex = re.compile(r"^(ARTICLE|SECTION|CLAUSE)?\s*[0-9]+(\.[0-9]+)*\.?\s+([A-Z\s]+)$", re.IGNORECASE)

    def flush_clause():
        nonlocal current_clause_lines, current_clause_type, current_clause_index
        if current_clause_lines:
            full_text = "\n".join(current_clause_lines).strip()
            if full_text:
                clauses.append(Clause(
                    clause_id=str(current_clause_index),
                    clause_type=current_clause_type,
                    text=full_text
                ))
                current_clause_index += 1
            current_clause_lines = []
            current_clause_type = "Unclassified"

    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # PASS 1: Heading Detection
        is_heading = False
        # Heuristic: Short line + All Uppercase (at least 4 chars) usually a header
        if line.isupper() and len(line) < 100 and len(line) > 3:
            is_heading = True
        elif heading_regex.match(line):
            is_heading = True
            
        if is_heading:
            flush_clause()
            current_clause_lines.append(line)
            
            # PASS 2: Keyword Anchoring (Immediate Type Assignment)
            found_type = "Unclassified"
            line_lower = line.lower()
            for c_type, keywords in CLAUSE_KEYWORDS.items():
                for kw in keywords:
                    if kw in line_lower:
                        found_type = c_type
                        break
                if found_type != "Unclassified":
                    break
            current_clause_type = found_type
            
        else:
            # PASS 3: Fallback Grouping (Scanning)
            # If we are in the middle of a clause, append.
            # ALSO check keywords if type is still Unclassified (Lazy Classification)
            current_clause_lines.append(line)
            
            if current_clause_type == "Unclassified":
                for c_type, keywords in CLAUSE_KEYWORDS.items():
                    for kw in keywords:
                        if kw in line.lower():
                            current_clause_type = c_type
                            break

    flush_clause() # Flush last buffer
    return clauses
