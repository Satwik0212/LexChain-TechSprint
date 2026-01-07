
export const MOCK_USER = {
    uid: "demo-user",
    email: "demo@lexchain.ai",
    displayName: "Demo User",
    photoURL: "https://lh3.googleusercontent.com/a/ACg8ocL-f5",
    role: "admin",
    bypass: true
};

export const MOCK_DASHBOARD_STATS = {
    totalContracts: 12,
    riskScore: 85,
    pendingReviews: 3,
    recentActivity: [
        { id: 1, name: "NDA_Vendor_v2.pdf", date: "2 mins ago", status: "Analyzed" },
        { id: 2, name: "Service_Agreement_Q1.docx", date: "1 hour ago", status: "Verified" },
        { id: 3, name: "Employment_Offer.pdf", date: "Yesterday", status: "Flagged" }
    ]
};

export const MOCK_ANALYSIS_RESULT = {
    rule_engine: {
        score: 72,
        risk_level: "Medium",
        governing_law: { country: "India", court: "New Delhi", supported: true },
        layer_results: [
            {
                layer_name: "Liability",
                score: 60,
                flags: [
                    { title: "Unlimited Liability", risk: "High", description: "Clause suggests uncapped liability for the service provider.", clause_id: "c1", original_text: "The Service Provider shall be liable for all damages..." }
                ]
            },
            {
                layer_name: "Termination",
                score: 80,
                flags: [
                    { title: "Termination for Convenience", risk: "Medium", description: "Client may terminate with 30 days notice.", clause_id: "c2", original_text: "Client may terminate this agreement..." }
                ]
            }
        ]
    }
};

export const MOCK_BLOCKCHAIN_PROOF = {
    tx_hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    document_hash: "hash_of_document_content",
    network: "Polygon Amoy",
    timestamp: Date.now()
};

export const MOCK_AI_SUMMARY = [
    "This is a mocked summary for Demo Mode.",
    "The backend appears to be unreachable.",
    "The contract is an Employment Agreement.",
    "Termination requires 30 days notice.",
    "Governing law is set to India."
];
