import { auth } from './firebase';
import { MOCK_USER, MOCK_DASHBOARD_STATS, MOCK_ANALYSIS_RESULT, MOCK_BLOCKCHAIN_PROOF, MOCK_AI_SUMMARY } from './mockData';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

let isDemoMode = false;

const getHeaders = async () => {
    if (isDemoMode) return {};

    let token;
    const user = auth.currentUser;

    if (user) {
        token = await user.getIdToken().catch(() => "demo-token");
    } else {
        console.warn("No Firebase user found. Attempting Dev Bypass token...");
        token = "dev-token-bypass";
    }

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
};

export const api = {
    setDemoMode: (enabled) => {
        isDemoMode = enabled;
        console.warn(`API switched to ${enabled ? 'DEMO MODE (Offline)' : 'Live Mode'}`);
    },

    isDemo: () => isDemoMode,

    getMe: async () => {
        if (isDemoMode) return MOCK_USER;
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_URL}/auth/me`, { method: "GET", headers });
            if (!response.ok) throw new Error("Failed");
            return response.json();
        } catch (e) {
            console.warn("getMe failed, falling back to mock");
            return MOCK_USER;
        }
    },

    getHealth: async () => {
        try {
            // Short timeout for health check
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 2000);
            const response = await fetch(`${API_URL}/health`, { signal: controller.signal });
            clearTimeout(id);
            if (response.ok) {
                isDemoMode = false;
                return { status: "ok" };
            }
        } catch (e) {
            // silent fail
        }
        // If we reach here, backend is down
        isDemoMode = true;
        return { status: "demo" };
    },

    analyzeContract: async (file) => {
        console.log("🚀 [API] analyzeContract called with file:", file.name);
        if (isDemoMode) {
            console.log("⚠️ [API] Demo Mode - Returning mock Text.");
            // Simulate delay
            await new Promise(r => setTimeout(r, 1500));
            return {
                filename: file.name,
                extracted_text: "This is a simulated contract text for the Demo Mode. The backend analysis service is currently offline. \n\n1. Confidentiality: The recipient shall keep all information confidential.\n2. Term: This agreement shall be effective for 12 months.\n3. Termination: Either party may terminate with 30 days notice.",
                status: "success",
                file_size: 1024
            };
        }
        const user = auth.currentUser;
        if (!user) {
            console.error("❌ [API] check: No user logged in");
            throw new Error("No user logged in");
        }
        const token = await user.getIdToken().catch(() => "demo-token");

        const formData = new FormData();
        formData.append("file", file);

        console.log(`📡 [API] POST ${API_URL}/analysis/analyze...`);
        const response = await fetch(`${API_URL}/analysis/analyze`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        if (!response.ok) {
            console.error("❌ [API] analyzeContract failed:", response.status);
            throw new Error("Analysis failed");
        }

        const data = await response.json();
        console.log("✅ [API] analyzeContract success:", data);
        return data;
    },

    evaluateContract: async (text) => {
        console.log("🚀 [API] evaluateContract called. Text length:", text?.length);
        if (isDemoMode) {
            console.log("⚠️ [API] Demo Mode - Returning mock Evaluation.");
            await new Promise(r => setTimeout(r, 2000));
            return MOCK_ANALYSIS_RESULT;
        }

        try {
            const user = auth.currentUser;
            const token = user ? await user.getIdToken() : "demo-token";

            console.log(`📡 [API] POST ${API_URL}/analysis/evaluate...`);
            const response = await fetch(`${API_URL}/analysis/evaluate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ text, verify: true })
            });

            if (!response.ok) throw new Error("Evaluation failed");

            const data = await response.json();
            console.log("✅ [API] evaluateContract success. Score:", data?.rule_engine?.score);
            return data;
        } catch (e) {
            console.warn("Evaluation failed, using mock data for stability.", e);
            return MOCK_ANALYSIS_RESULT;
        }
    },

    getSummary: async (text) => {
        console.log("🚀 [API] getSummary called.");
        if (isDemoMode) return { summary: MOCK_AI_SUMMARY };
        try {
            const headers = await getHeaders();
            console.log(`📡 [API] POST ${API_URL}/analysis/summary...`);
            const response = await fetch(`${API_URL}/analysis/summary`, {
                method: "POST",
                headers,
                body: JSON.stringify({ text })
            });
            if (!response.ok) throw new Error("Summary failed");

            const data = await response.json();
            console.log("✅ [API] getSummary success:", data);
            return data;
        } catch (e) {
            console.error("❌ [API] getSummary failed:", e);
            return { summary: MOCK_AI_SUMMARY };
        }
    },

    chatContract: async (text, question) => {
        if (isDemoMode) return { answer: "I am running in Demo Mode (Offline). I cannot process live questions right now, but normally I would answer: " + question, confidence: "High" };
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_URL}/analysis/chat`, {
                method: "POST",
                headers,
                body: JSON.stringify({ text, question })
            });
            if (!response.ok) throw new Error("Chat failed");
            return response.json();
        } catch (e) {
            return { answer: "AI Chat unavailable in Demo/Offline mode.", confidence: "Low" };
        }
    },

    getPrecedents: async (layer, flag_title) => {
        if (isDemoMode) return { precedents: ["Mock precedent 1", "Mock precedent 2"] };
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/analysis/precedents`, {
            method: "POST",
            headers,
            body: JSON.stringify({ layer, flag_title })
        });
        if (!response.ok) throw new Error("Failed to fetch precedents");
        return response.json();
    },

    generateRedline: async (layer, flag_title, original_text) => {
        if (isDemoMode) return { suggested_redline: "Mock redline: " + original_text };
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/analysis/redline`, {
            method: "POST",
            headers,
            body: JSON.stringify({ layer, flag_title, original_text })
        });
        if (!response.ok) throw new Error("Failed to generate redline");
        return response.json();
    },

    storeBlockchainProof: async (text, filename) => {
        if (isDemoMode) throw new Error("Blockchain unavailable in Demo Mode (Backend Offline)");
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/blockchain/store-proof`, {
            method: "POST",
            headers,
            body: JSON.stringify({ text, filename })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Failed to store proof");
        }
        return response.json();
    },

    verifyBlockchainProof: async (text) => {
        if (isDemoMode) return { exists: false };
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/blockchain/verify-proof`, {
            method: "POST",
            headers,
            body: JSON.stringify({ text })
        });
        if (!response.ok) throw new Error("Failed to verify proof");
        return response.json();
    },

    getBlockchainHistory: async () => {
        if (isDemoMode) return [
            { document_hash: "0xMockHash1...", tx_hash: "0xTx1...", timestamp: Date.now() / 1000, status: "stored", filename: "Contract_A.pdf" },
            { document_hash: "0xMockHash2...", tx_hash: "0xTx2...", timestamp: (Date.now() / 1000) - 86400, status: "verified", filename: "Agreement_B.docx" }
        ];
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/blockchain/history`, {
            method: "GET",
            headers
        });
        if (!response.ok) return []; // Fail safe
        return response.json();
    },

    verifyFile: async (file) => {
        if (isDemoMode) {
            await new Promise(r => setTimeout(r, 1500));
            return {
                exists: true,
                document_hash: "0xDEMOHASH123456789",
                tx_hash: "0xDEMOTX123456789",
                on_chain_timestamp: Date.now() / 1000,
                message: "Demo Verified Match"
            };
        }

        const user = auth.currentUser;
        if (!user) throw new Error("No user logged in");
        const token = await user.getIdToken();

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_URL}/blockchain/verify-file`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        if (!response.ok) throw new Error("Verification failed");
        return response.json();
    }
};
