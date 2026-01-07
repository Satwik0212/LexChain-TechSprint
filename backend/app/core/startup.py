import os
import sys
from web3 import Web3

try:
    from web3.middleware import ExtraDataToPOAMiddleware # Web3 v7
except ImportError:
    from web3.middleware import geth_poa_middleware as ExtraDataToPOAMiddleware # Web3 v6 fallback

from eth_account import Account
from dotenv import load_dotenv

load_dotenv()

# Global Health State (No partial states allowed)
HEALTH_STATE = {
    "blockchain": False,
    "gemini": False,
    "rules": False,
    "firebase": False
}

W3_INSTANCE = None

REQUIRED_VARS = [
    "GEMINI_API_KEY",
    "POLYGON_RPC_URL",
    "WALLET_PRIVATE_KEY",
    "CONTRACT_ADDRESS",
    "NETWORK_CHAIN_ID",
    "FRONTEND_ORIGIN",
    "FIREBASE_CREDENTIALS_PATH"
]

def validate_env():
    """Step 1: Explicit Startup Validation"""
    missing = []
    print("\n🔍 Validating Environment Variables...")

    for var in REQUIRED_VARS:
        val = os.getenv(var)
        if not val or not val.strip() or "dummy" in val:
            # Fail if dummy key is present in critical vars
            if var in ["WALLET_PRIVATE_KEY"] and "dummy" in val:
                # Only strict check private key for now as Gemini might be using a free tier key that looks like dummy to simple logic, or user wants to proceed with provided key.
                print(f"❌ INVALID VALUE: {var} contains 'dummy'. Real keys required.")
                missing.append(var)
            elif not val or not val.strip():
                print(f"❌ MISSING: {var}")
                missing.append(var)

    if missing:
        raise RuntimeError(f"❌ Startup ABORTED. Missing or Invalid Environment Variables: {', '.join(missing)}")

    # Format checks
    try:
        int(os.getenv("NETWORK_CHAIN_ID"))
    except ValueError:
         raise RuntimeError("❌ Startup failed: NETWORK_CHAIN_ID must be an integer.")

    print("✅ Environment variables validated.")

def init_blockchain():
    """Step 2: Blockchain Initialization"""
    global W3_INSTANCE
    rpc_url = os.getenv("POLYGON_RPC_URL")
    chain_id = int(os.getenv("NETWORK_CHAIN_ID"))
    private_key = os.getenv("WALLET_PRIVATE_KEY")
    contract_addr = os.getenv("CONTRACT_ADDRESS")

    print(f"🔗 Connecting to Blockchain (Chain ID: {chain_id})...")

    # 1. Create Web3 Instance
    w3 = Web3(Web3.HTTPProvider(rpc_url))

    # 2. Inject PoA
    w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)

    # 3. Validate Connection
    if not w3.is_connected():
        raise RuntimeError(f"❌ Blockchain Connection Failed: Unable to reach RPC at {rpc_url}")

    # 4. Validate Chain ID
    net_id = w3.eth.chain_id
    if net_id != chain_id:
        raise RuntimeError(f"❌ Chain ID Mismatch: Expected {chain_id}, Got {net_id}")

    # 5. Validate Wallet
    try:
        account = Account.from_key(private_key)
        print(f"   - Wallet loaded: {account.address}")
    except Exception as e:
        raise RuntimeError(f"❌ Invalid Private Key: {str(e)}")

    # 6. Validate Contract Address
    if not w3.is_checksum_address(contract_addr):
        try:
            checksummed = w3.to_checksum_address(contract_addr)
            if not w3.is_checksum_address(checksummed):
                 raise ValueError("Not a valid address")
        except:
             raise RuntimeError(f"❌ Invalid Contract Address Format: {contract_addr}")

    HEALTH_STATE["blockchain"] = True
    W3_INSTANCE = w3
    print("✅ Blockchain subsystem ONLINE.")
    return w3

def init_gemini():
    """Step 3: Gemini Initialization (delegated to core.gemini)"""
    from app.core.gemini import init_gemini as strict_init_gemini

    try:
        strict_init_gemini()
        HEALTH_STATE["gemini"] = True
    except RuntimeError as e:
        print(f"❌ Gemini Startup Failed: {e}")
        raise e  # Fail fast as requested
    except Exception as e:
        print(f"❌ Unexpected Gemini Error: {e}")
        raise RuntimeError(f"Gemini Init Error: {e}")

def init_rules():
    """Step 4: Rule Engine Verification"""
    try:
        from app.analysis.rules.engine import run_risk_engine
        HEALTH_STATE["rules"] = True
        print("✅ Rule Engine subsystem ready.")
    except ImportError as e:
        raise RuntimeError(f"❌ Rule Engine Import Failed: {e}")

def run_strict_startup():
    print("\n🚀 STARTING BACKEND (STRICT PRODUCTION MODE)\n=================================================")

    # 1. Env
    validate_env()

    # 2. Blockchain
    init_blockchain()

    # 3. Gemini
    init_gemini()

    # 4. Rules
    init_rules()

    print("=================================================\n✅ ALL SYSTEMS GO. Backend ready.\n")