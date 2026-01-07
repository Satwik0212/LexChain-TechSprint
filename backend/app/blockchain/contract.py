from web3 import Web3
from app.blockchain.config import CONTRACT_ADDRESS
from app.core.startup import W3_INSTANCE

# Minimal ABI for required functions and events
CONTRACT_ABI = [
	{
		"anonymous": False,
		"inputs": [
			{
				"indexed": True,
				"internalType": "bytes32",
				"name": "documentHash",
				"type": "bytes32"
			},
			{
				"indexed": True,
				"internalType": "address",
				"name": "submittedBy",
				"type": "address"
			},
			{
				"indexed": False,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "ProofStored",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getProof",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "proofs",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "documentHash",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "submittedBy",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_documentHash",
				"type": "bytes32"
			}
		],
		"name": "storeProof",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]

def get_web3_provider():
    """Returns the globally initialized Web3 instance."""
    if W3_INSTANCE is None:
        raise RuntimeError("Blockchain not initialized. Run strict startup first.")
    return W3_INSTANCE

def get_contract(w3):
    """Returns the contract instance."""
    contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)
    return contract
