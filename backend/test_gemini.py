import sys
import os
sys.path.insert(0, os.getcwd())

from dotenv import load_dotenv
load_dotenv(override=True)

from app.core.gemini import get_gemini_model, GEMINI_API_KEY
print(f"API Key present: {bool(GEMINI_API_KEY)}")

try:
    model = get_gemini_model()
    response = model.generate_content("Say hello")
    print("Response:", response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
