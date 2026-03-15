import requests
import json
import time

url = "http://localhost:8000/analysis/evaluate"
headers = {
    "Authorization": "Bearer dev-token-bypass",
    "Content-Type": "application/json"
}

loan_agreement = """
LOAN AGREEMENT

This Loan Agreement is made on Jan 10, 2024, between:
LENDER: QuickCash Finance Ltd.
BORROWER: Mr. Sunil Kumar

1. LOAN AMOUNT: Rs. 5,00,000 (Five Lakhs)
2. INTEREST RATE: 24% per annum, compounded monthly
3. REPAYMENT: 12 equal monthly installments of Rs. 47,500
4. LATE PAYMENT: Penalty of Rs. 500 per day of delay
5. COLLATERAL: Borrower's car (MH-01-AB-1234) is pledged as security
6. DEFAULT: In case of default, Lender has the right to seize the car WITHOUT notice
7. PRE-PAYMENT: Borrower cannot pre-pay the loan before 6 months
8. LEGAL COSTS: Borrower shall pay all legal costs of the Lender in case of dispute
9. JURISDICTION: Disputes under Singapore law and courts
10. AMENDMENTS: Lender can change interest rate at any time without consent

Signed: QuickCash (Lender)
Signed: Sunil Kumar (Borrower)
"""

data = {
    "text": loan_agreement,
    "verify": True
}

print(f"Sending request to {url}...")
try:
    response = requests.post(url, json=data, headers=headers, timeout=120)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print("\n=== RULE ENGINE OUTPUT ===")
        rule_engine = result.get("rule_engine", {})
        layers = rule_engine.get("layer_results", [])
        flag_count = sum(len(layer.get("flags", [])) for layer in layers)
        print(f"Total Flags: {flag_count}")
        for layer in layers:
            for flag in layer.get("flags", []):
                print(f"- {flag.get('title')}: {flag.get('risk')}")
        
        print("\n=== AI DEEP ANALYSIS (The New Fallback) ===")
        ai_deep = rule_engine.get("ai_deep_analysis", {})
        if ai_deep:
            print(json.dumps(ai_deep, indent=2))
        else:
            print("AI Deep Analysis not triggered or failed.")
            
        print("\n=== AI SUMMARY ===")
        print(json.dumps(rule_engine.get("ai_summary", {}), indent=2))
        
    else:
        print("Response Error:")
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
