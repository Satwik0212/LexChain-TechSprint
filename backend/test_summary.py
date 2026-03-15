import requests

url = "http://localhost:8000/analysis/summary"
headers = {
    "Authorization": "Bearer dev-token-bypass",
    "Content-Type": "application/json"
}
data = {
    "text": "This is a contract between Alice and Bob. Alice will pay Bob 100 dollars for painting her house. Termination requires 30 days notice. The work must be completed by December 2025."
}

try:
    response = requests.post(url, json=data, headers=headers)
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(response.json())
except Exception as e:
    print(f"Error: {e}")
