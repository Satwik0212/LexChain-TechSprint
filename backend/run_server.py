import uvicorn
import os
import sys
from dotenv import load_dotenv

# 1. FORCE LOAD ENV VARS (STRICT REQUIREMENT)
load_dotenv(override=True)

# Ensure we can find the app module
sys.path.insert(0, os.getcwd())

if __name__ == "__main__":
    print("Starting Uvicorn Server via script...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
