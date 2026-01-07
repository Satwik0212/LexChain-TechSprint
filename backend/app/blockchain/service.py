from web3 import Web3
from app.blockchain.config import CHAIN_ID, PRIVATE_KEY
from app.blockchain.contract import get_web3_provider, get_contract
from app.blockchain.hashing import hash_text
import time

import os

def store_proof(text: str) -> dict:
    """
    Hashes text, signs transaction, sends to Polygon Amoy.
    Returns transaction metadata.
    """
    # Demo Mode Bypass
    if os.getenv("DEMO_MODE", "false").lower() == "true":
        print("--- DEMO MODE: Skipping Blockchain Transaction ---")
        import time
        import random
        time.sleep(1.5) # Simulate latency
        document_hash = hash_text(text)
        return {
            "tx_hash": f"0x{os.urandom(32).hex()}",
            "timestamp": int(time.time()),
            "submitted_by": "0xDemoWalletAddressForPresentation123456",
            "document_hash": document_hash,
            "block_number": 12345678
        }

    w3 = get_web3_provider()
    # Hardening: Set timeout for RPC
    w3.provider.timeout = 30 # seconds
    
    if not w3.is_connected():
        raise ConnectionError("Failed to connect to Polygon RPC")

    # Safety Check: If no private key, warn and fallback to mock or error
    if not PRIVATE_KEY or "567c" in PRIVATE_KEY: # Example check, but let's rely on standard
         if not PRIVATE_KEY:
              raise ValueError("Wallet Private Key missing.")
              
    contract = get_contract(w3)
    account = w3.eth.account.from_key(PRIVATE_KEY)
    
    # 1. Compute Hash
    document_hash = hash_text(text)
    
    # 2. Build Transaction
    # Estimate gas or use fixed buffer. Simple transaction.
    nonce = w3.eth.get_transaction_count(account.address)
    
    # Build tx logic
    tx = contract.functions.storeProof(document_hash).build_transaction({
        'chainId': CHAIN_ID,
        'gas': 200000, # Sufficient limit
        'gasPrice': w3.eth.gas_price, # Dynamic gas price
        'nonce': nonce,
        'from': account.address
    })
    
    # 3. Sign & Send
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    
    # 4. Wait for Receipt (Optional, but good for confirmation)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    if receipt.status != 1:
        raise Exception("Transaction failed on-chain")
        
    # Get block timestamp
    block = w3.eth.get_block(receipt.blockNumber)
    
    return {
        "tx_hash": w3.to_hex(tx_hash),
        "timestamp": block.timestamp,
        "submitted_by": account.address,
        "document_hash": document_hash,
        "block_number": receipt.blockNumber
    }

def verify_proof(text: str) -> dict:
    """
    Verifies if a proof for the text exists on-chain.
    Uses Event Logs for efficient lookup.
    """
    # Demo Mode Bypass
    if os.getenv("DEMO_MODE", "false").lower() == "true":
        import time
        document_hash = hash_text(text)
        return {
             "exists": True,
             "document_hash": document_hash,
             "submitted_by": "0xDemoWalletAddressForPresentation123456",
             "on_chain_timestamp": int(time.time()) - 3600, # 1 hour ago
             "tx_hash": "0xdemohash1234567890abcdef1234567890abcdef1234567890abcdef12345678"
        }

    w3 = get_web3_provider()
    # Hardening: Set timeout for RPC
    w3.provider.timeout = 30 # seconds

    if not w3.is_connected():
        # Fail gracefully, don't crash the demo
        print("RPC Connection Failed. Returning standard error.")
        return { "exists": False, "error": "RPC Connection Failed" }
        
    contract = get_contract(w3)
    document_hash = hash_text(text)
    
    # Filter for ProofStored events with this specific hash
    # topic0 = event signature, topic1 = documentHash (indexed)
    event_signature_hash = w3.keccak(text="ProofStored(bytes32,address,uint256)").hex()
    
    # Get logs
    try:
        # Optimization: We only care IF it exists.
        events = contract.events.ProofStored.get_logs(
            from_block=0, # Amoy started recently enough or use specific block if known
            argument_filters={'documentHash': document_hash}
        )
        
        if events:
            # Found it
            latest_event = events[-1] # Most recent
            args = latest_event['args']
            return {
                "exists": True,
                "document_hash": args['documentHash'].hex() if isinstance(args['documentHash'], bytes) else args['documentHash'],
                "submitted_by": args['submittedBy'],
                "on_chain_timestamp": args['timestamp'],
                "tx_hash": latest_event['transactionHash'].hex()
            }
            
    except Exception as e:
        print(f"Verification lookup failed: {e}")
        # Soft fail
        return {
            "exists": False,
            "error": str(e)
        }
    
    return {
        "exists": False,
        "on_chain_timestamp": None
    }
