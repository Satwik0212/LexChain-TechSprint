import os
from dotenv import load_dotenv

load_dotenv()

# Network Details
POLYGON_AMOY_RPC = os.getenv("POLYGON_RPC_URL")
CHAIN_ID = int(os.getenv("NETWORK_CHAIN_ID", 80002))

# Contract Details
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")

# Wallet Details (Loaded securely)
PRIVATE_KEY = os.getenv("WALLET_PRIVATE_KEY")
