import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import AIContractSummary from '../components/AIContractSummary';
import AIContractChatbot from '../components/AIContractChatbot';

const ClauseCard = ({ clause, onRedline, onPrecedents, contractText }) => {
    const [showAdvisory, setShowAdvisory] = useState(false);
    const [advisoryContent, setAdvisoryContent] = useState(null);
    const [loadingAdvisory, setLoadingAdvisory] = useState(false);

    const styles = getRiskStyles(clause.type);

    const handleToggleAdvisory = async () => {
        if (showAdvisory) {
            setShowAdvisory(false);
            return;
        }

        setShowAdvisory(true);
        if (advisoryContent) return; // Already fetched

        setLoadingAdvisory(true);
        try {
            // Use Chat API to get specific advisory for this clause
            // We pass the specific clause text as context or ask about it
            const question = `Explain the legal risk of this specific clause in 2 sentences: "${clause.text.substring(0, 300)}..."`;
            const response = await api.chatContract(contractText || clause.text, question);
            setAdvisoryContent(response.answer);
        } catch (e) {
            setAdvisoryContent("AI Explanation unavailable. This clause typically indicates an imbalance of power favouring the rigid party.");
        } finally {
            setLoadingAdvisory(false);
        }
    };

    return (
        <div className={`rounded-xl bg-surface-dark border-l-4 ${styles.border} border-y border-r border-border-dark p-6 shadow-sm hover:shadow-md transition-shadow`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold text-lg">{clause.title}</h3>
                        <span className={`material-symbols-outlined ${styles.color} text-[20px]`}>{styles.icon}</span>
                    </div>
                    <span className={`text-xs ${styles.color} font-bold uppercase tracking-wide`}>
                        {clause.type.replace('-', ' ')} • {clause.type === 'high-risk' ? 'Action Required' : 'Review'}
                    </span>
                </div>
                {/* Risk Badge / Action */}
                {clause.type === 'high-risk' && (
                    <div className="bg-danger/10 px-3 py-1 rounded text-xs text-danger font-bold border border-danger/20 uppercase tracking-wider">
                        Void / Risky
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Original Text */}
                <div className="bg-[#111722] rounded-lg p-4 border border-[#232f48] relative group flex flex-col">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button onClick={() => navigator.clipboard.writeText(clause.text)} className="p-1 hover:bg-white/10 rounded">
                            <span className="material-symbols-outlined text-slate-400 text-[14px]">content_copy</span>
                        </button>
                    </div>
                    <p className="text-[10px] uppercase text-slate-500 font-bold mb-2 tracking-wider">Original Text (Extracted)</p>
                    <p className="text-slate-400 text-sm italic leading-relaxed font-serif relative z-10 break-words whitespace-pre-wrap">
                        "{clause.text}"
                    </p>
                </div>

                {/* Analysis & Actions */}
                <div className="flex flex-col justify-between">
                    <div>
                        {/* Static Analysis */}
                        <div className="mb-4">
                            <p className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-wider">Risk Implications</p>
                            <p className="text-white text-sm font-medium leading-relaxed border-l-2 border-slate-600 pl-3">
                                {clause.explanation}
                            </p>
                        </div>

                        {/* AI Advisory Toggle */}
                        <div className="mb-4">
                            <button
                                onClick={handleToggleAdvisory}
                                className="flex items-center gap-2 text-xs font-bold text-primary hover:text-blue-400 transition-colors uppercase tracking-wider mb-2"
                            >
                                <span className="material-symbols-outlined text-[16px]">{showAdvisory ? 'expand_less' : 'auto_awesome'}</span>
                                {showAdvisory ? 'Hide AI Advisory' : 'Show AI-Enhanced Explanation'}
                            </button>

                            {showAdvisory && (
                                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 animate-fade-in relative">
                                    <div className="flex items-center justify-between mb-2">
                                        {advisoryContent && advisoryContent.includes("disabled") ? (
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded">FEATURE PAUSED</span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">ADVISORY ONLY</span>
                                        )}

                                        {!advisoryContent?.includes("disabled") && (
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[12px]">verified</span>
                                                Confidence: Medium
                                            </span>
                                        )}
                                    </div>
                                    {loadingAdvisory ? (
                                        <div className="flex gap-2 items-center text-xs text-slate-400 py-1">
                                            <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                            Analyzing specific risk...
                                        </div>
                                    ) : (
                                        <p className="text-slate-300 text-xs leading-relaxed animate-fade-in">
                                            {advisoryContent}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-auto pt-2">
                        {clause.type === 'high-risk' && (
                            <button
                                onClick={() => onRedline(clause)}
                                className="flex-1 flex items-center justify-center gap-2 h-9 rounded bg-primary text-white text-xs font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                            >
                                <span className="material-symbols-outlined text-[16px]">edit_document</span>
                                Generate Redline
                            </button>
                        )}
                        <button
                            onClick={() => onPrecedents(clause)}
                            className="flex-1 flex items-center justify-center gap-2 h-9 rounded border border-[#324467] text-white text-xs font-bold hover:bg-[#232f48] transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px]">gavel</span>
                            View Precedents
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-border-dark flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-slate-500">info</span>
                <p className="text-xs text-slate-500">
                    {clause.type === 'high-risk'
                        ? "This clause is likely void or severely harmful under Indian law."
                        : "This clause contains unbalanced terms warranting review."}
                </p>
            </div>
        </div>
    );
};

// Helper for styles
const getRiskStyles = (type) => {
    switch (type) {
        case 'high-risk': return { color: 'text-danger', border: 'border-l-danger', bg: 'bg-danger/20', icon: 'gpp_bad' };
        case 'medium-risk': return { color: 'text-warning', border: 'border-l-warning', bg: 'bg-warning/20', icon: 'warning' };
        case 'low-risk': return { color: 'text-success', border: 'border-l-success', bg: 'bg-success/20', icon: 'verified_user' };
        default: return { color: 'text-slate-400', border: 'border-l-slate-400', bg: 'bg-slate-400/20', icon: 'info' };
    }
};

const BlockchainProofActions = ({ text, fileName }) => {
    const [loading, setLoading] = useState(false);
    const [proof, setProof] = useState(null);
    const [verification, setVerification] = useState(null);
    const [error, setError] = useState(null);
    const [verifyMsg, setVerifyMsg] = useState(null);

    const handleStoreProof = async () => {
        if (!text) return;
        setLoading(true);
        setError(null);
        setVerifyMsg(null);
        try {
            const result = await api.storeBlockchainProof(text, fileName);
            setProof(result);
            // Auto-verify to populate the view immediately
            const verifyResult = await api.verifyBlockchainProof(text);
            setVerification(verifyResult);
        } catch (err) {
            console.error("Blockchain Store Error:", err);
            setError(err.message || "Failed to store proof. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyProof = async () => {
        if (!text) return;
        setLoading(true);
        setError(null);
        setVerifyMsg(null);
        try {
            const result = await api.verifyBlockchainProof(text);
            if (result.exists) {
                setVerification(result);
            } else {
                setVerifyMsg("No proof found on-chain for this specific version. You can secure it now.");
            }
        } catch (err) {
            console.error("Blockchain Verify Error:", err);
            // Don't show technical errors for 404s if handled by backend, but here catch generic
            setError("Unable to verify at this time. Network may be busy.");
        } finally {
            setLoading(false);
        }
    };

    const hasProof = proof || (verification && verification.exists);

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-xl z-10">
            {/* Errors & Notices */}
            {error && (
                <div className="w-full bg-danger/10 border border-danger/20 text-danger text-sm p-3 rounded-lg flex items-center gap-2 justify-center animate-fade-in">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {error}
                </div>
            )}
            {verifyMsg && !hasProof && (
                <div className="w-full bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm p-3 rounded-lg flex items-center gap-2 justify-center animate-fade-in">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    {verifyMsg}
                </div>
            )}

            {!hasProof ? (
                <div className="flex flex-col gap-4 w-full items-center">
                    <button
                        onClick={handleStoreProof}
                        disabled={loading}
                        className="btn-primary w-full md:w-auto min-w-[240px] h-14 text-lg shadow-xl shadow-primary/20 relative overflow-hidden group flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Processing Transaction...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">lock</span>
                                <span>Secure Proof on Blockchain</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleVerifyProof}
                        disabled={loading}
                        className="text-slate-500 hover:text-slate-300 text-xs font-bold flex items-center gap-1 transition-colors uppercase tracking-wider"
                    >
                        <span className="material-symbols-outlined text-[14px]">search</span>
                        Verify Existing Proof
                    </button>
                </div>
            ) : (
                <div className="w-full bg-[#111722] border border-success/30 rounded-xl p-6 flex flex-col gap-4 animate-fade-in shadow-2xl shadow-green-900/10">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                        <div className="flex items-center gap-2 text-success font-bold text-lg">
                            <span className="material-symbols-outlined">check_circle</span>
                            Proof Secured & Verified
                        </div>
                        <img src="https://cryptologos.cc/logos/polygon-matic-logo.png" className="h-6 opacity-80" alt="Polygon" />
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-left">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Transaction Hash</span>
                            <a
                                href={`https://amoy.polygonscan.com/tx/${proof?.tx_hash || verification?.tx_hash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-xs text-primary hover:text-blue-400 truncate flex items-center gap-1 transition-colors"
                            >
                                {proof?.tx_hash || verification?.tx_hash || "Pending..."}
                                <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                            </a>
                        </div>
                        <div className="flex justify-between">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Doc Hash (SHA-256)</span>
                                <span className="font-mono text-xs text-slate-300 truncate max-w-[200px]">{proof?.document_hash || verification?.document_hash}</span>
                            </div>
                            <div className="flex flex-col gap-1 text-right">
                                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Network</span>
                                <span className="text-xs text-white font-bold">Polygon Amoy</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 mt-2 pt-3 border-t border-dashed border-gray-800">
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">security</span>
                                Only the cryptographic hash is stored. No document content is ever saved on-chain.
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AnalysisResult = () => {
    const location = useLocation();
    const { fileName, fileSize, extractedText } = location.state || {};
    const [showRawText, setShowRawText] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modals Data
    const [precedentsData, setPrecedentsData] = useState(null);
    const [redlineData, setRedlineData] = useState(null);
    const [isPrecedentsLoading, setIsPrecedentsLoading] = useState(false);
    const [isRedlineLoading, setIsRedlineLoading] = useState(false);

    // State for analysis data
    const [analysisData, setAnalysisData] = useState({
        overallScore: 0,
        riskLevel: "Unknown",
        verdict: "Analyzed", // Default
        jurisdiction: "Unknown",
        totalClauses: 0,
        clauses: []
    });

    useEffect(() => {
        const analyze = async () => {
            if (!extractedText) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const data = await api.evaluateContract(extractedText);
                const ruleEngine = data.rule_engine;
                const score = Math.round(ruleEngine.score);

                // Determine Verdict & Risk Level based on Score (Task Set 3)
                // 0-40 High, 41-70 Medium, 71-100 Safe
                let riskLevel = "Medium Risk";
                let verdict = "PROCEED WITH CAUTION";

                if (score <= 40) {
                    riskLevel = "High Risk";
                    verdict = "DO NOT SIGN";
                } else if (score >= 71) {
                    riskLevel = "Safe";
                    verdict = "SAFE TO PROCEED";
                }

                // Override if backend provides recommendation (Task Set 1)
                if (data.recommendation && data.recommendation.verdict) {
                    verdict = data.recommendation.verdict;
                }

                const mappedClauses = [];
                ruleEngine.layer_results.forEach(layer => {
                    layer.flags.forEach(flag => {
                        mappedClauses.push({
                            id: flag.clause_id,
                            title: flag.title,
                            type: flag.risk === 'High' ? 'high-risk' : (flag.risk === 'Medium' ? 'medium-risk' : 'low-risk'),
                            original_text: flag.original_text,
                            text: flag.original_text || `(Clause ID: ${flag.clause_id}) - Text unavailable.`,
                            explanation: flag.description,
                            suggestion: "Review with legal counsel."
                        });
                    });
                });

                // Sort High -> Medium -> Low
                mappedClauses.sort((a, b) => {
                    const priority = { 'high-risk': 3, 'medium-risk': 2, 'low-risk': 1 };
                    return priority[b.type] - priority[a.type];
                });

                setAnalysisData({
                    overallScore: score,
                    riskLevel: riskLevel,
                    verdict: verdict,
                    jurisdiction: ruleEngine.governing_law?.country || "India",
                    totalClauses: mappedClauses.length,
                    clauses: mappedClauses,
                    aiSummary: ruleEngine.ai_summary // Pass through backend summary
                });

            } catch (err) {
                console.error("Analysis Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        analyze();
    }, [extractedText]);

    // Modal Actions
    const handleViewPrecedents = async (clause) => {
        setPrecedentsData({ loading: true, title: clause.title });
        setIsPrecedentsLoading(true);
        try {
            // Mock Data for Demo (simulating POST /analysis/precedents)
            setTimeout(() => {
                setPrecedentsData({
                    title: clause.title,
                    cases: [
                        { name: "Desiccant Rotors International v. Bappaditya Sarkar", court: "Delhi High Court (2009)", principle: "Restraint of trade (Section 27) is void post-termination." },
                        { name: "Percept D'Mark v. Zaheer Khan", court: "Supreme Court of India (2006)", principle: "Exclusivity valid only during employment term." }
                    ]
                });
                setIsPrecedentsLoading(false);
            }, 1000);
        } catch (e) {
            console.error(e);
            setIsPrecedentsLoading(false);
        }
    };

    const handleRedline = async (clause) => {
        setRedlineData({ loading: true, title: clause.title });
        setIsRedlineLoading(true);
        try {
            // Mock Redline logic (simulating POST /analysis/redline)
            setTimeout(() => {
                setRedlineData({
                    title: clause.title,
                    original: clause.text,
                    suggestion: clause.text.replace(/unlimited liability/gi, "liability limited to fees paid").replace(/shall be void/gi, "shall apply only during term").replace(/sole discretion/gi, "mutual agreement")
                });
                setIsRedlineLoading(false);
            }, 1500);
        } catch (e) {
            setIsRedlineLoading(false);
        }
    };

    const displayName = fileName || "Unknown Document";
    const displaySize = fileSize ? (fileSize / 1024 / 1024).toFixed(2) + " MB" : "Unknown Size";

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p>Analyzing Contract Risk (LexChain Engine)...</p>
                <p className="text-xs text-slate-500">Checking against Indian Contract Act 1872...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark text-white">
            <div className="bg-surface-dark border border-danger/50 p-6 rounded-xl max-w-md text-center">
                <span className="material-symbols-outlined text-danger text-4xl mb-4">error</span>
                <h3 className="text-xl font-bold mb-2">Analysis Failed</h3>
                <p className="text-slate-400 mb-6">{error}</p>
                <Link to="/upload" className="px-4 py-2 bg-primary rounded-lg font-bold">Try Again</Link>
            </div>
        </div>
    );

    // Dynamic Styles for Verdict
    const getVerdictStyles = (v) => {
        if (v === 'DO NOT SIGN') return 'bg-danger text-white border-b-4 border-red-900';
        if (v === 'PROCEED WITH CAUTION') return 'bg-warning text-black border-b-4 border-yellow-600';
        return 'bg-success text-white border-b-4 border-green-800';
    };

    const isDemo = api.isDemo();

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white overflow-x-hidden h-full flex flex-col">
            {isDemo && (
                <div className="bg-blue-600 text-white text-center py-2 text-xs font-bold tracking-wider uppercase">
                    Demo Mode Active: Backend Unavailable (Mock Data Shown)
                </div>
            )}
            {/* Verdict Banner */}
            <div className={`w-full py-4 text-center font-black tracking-widest uppercase shadow-xl z-20 sticky top-0 flex items-center justify-center gap-3 ${getVerdictStyles(analysisData.verdict)}`}>
                <span className="material-symbols-outlined text-3xl">
                    {analysisData.verdict === 'DO NOT SIGN' ? 'block' : (analysisData.verdict === 'PROCEED WITH CAUTION' ? 'warning' : 'verified')}
                </span>
                <span className="text-xl">Final Recommendation: {analysisData.verdict}</span>
            </div>

            <main className="flex-1 flex justify-center py-8 px-4 lg:px-8">
                <div className="flex flex-col max-w-[1280px] w-full gap-8">
                    {/* Page Heading */}
                    <div className="flex flex-wrap justify-between items-end gap-4 border-b border-border-dark pb-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-white tracking-tight text-3xl font-bold">{displayName}</h1>
                            <p className="text-[#92a4c9] text-sm">LexChain Legal Analysis • Indian Jurisdiction</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowRawText(true)} className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700 text-sm font-bold text-slate-300">
                                <span className="material-symbols-outlined text-[18px]">description</span> View Source
                            </button>
                            <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700 text-sm font-bold text-slate-300">
                                <span className="material-symbols-outlined text-[18px]">download</span> PDF Report
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column: Stats */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            {/* Score Card */}
                            <div className="bg-surface-dark border border-border-dark rounded-xl p-6 text-center shadow-lg relative overflow-hidden group">
                                <h3 className="text-slate-300 font-bold mb-4 uppercase text-xs tracking-wider">Risk Score</h3>
                                <div className="relative flex justify-center mb-2">
                                    <svg className="size-40 -rotate-90" viewBox="0 0 36 36">
                                        <path className="text-[#232f48]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                        <path
                                            className={`${analysisData.riskLevel === 'High Risk' ? 'text-danger' : (analysisData.riskLevel === 'Medium Risk' ? 'text-warning' : 'text-success')} transition-all duration-1000 ease-out`}
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none" stroke="currentColor" strokeDasharray={`${analysisData.overallScore}, 100`} strokeLinecap="round" strokeWidth="3"
                                        ></path>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center text-4xl font-black text-white">
                                        {analysisData.overallScore}
                                    </div>
                                </div>
                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${analysisData.riskLevel === 'High Risk' ? 'bg-danger/20 text-danger' : (analysisData.riskLevel === 'Medium Risk' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success')}`}>
                                    {analysisData.riskLevel}
                                </div>
                                <p className="text-slate-500 text-xs mt-4">
                                    0-40: High Risk • 41-70: Medium • 71-100: Safe
                                </p>
                            </div>

                            {/* Governing Law Card */}
                            <div className="bg-surface-dark border border-border-dark rounded-xl p-6 flex flex-col gap-2 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <span className="material-symbols-outlined text-6xl">gavel</span>
                                </div>
                                <div className="flex items-center gap-3 mb-2 z-10">
                                    <span className="text-3xl shadow-lg rounded-full bg-white/10 p-1">🇮🇳</span>
                                    <div>
                                        <h3 className="font-bold text-white leading-none">Governing Law</h3>
                                        <span className="text-xs text-slate-400">Jurisdiction Detected</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-success font-bold text-sm bg-success/10 p-2 rounded-lg border border-success/20 self-start">
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    Supported: India
                                </div>
                                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                    Analysis includes Section 27 (ICA 1872) and Arbitration Act norms.
                                </p>
                            </div>


                            {/* Blockchain Integrity Section (Relocated) */}
                            <div className="bg-surface-dark border border-border-dark rounded-xl p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-5">
                                    <span className="material-symbols-outlined text-[100px]">enhanced_encryption</span>
                                </div>
                                <div className="flex items-center gap-2 mb-4 z-10">
                                    <span className="p-2 bg-primary/10 rounded-full text-primary border border-primary/20 shadow-sm shadow-primary/10">
                                        <span className="material-symbols-outlined text-xl">verified_user</span>
                                    </span>
                                    <h3 className="text-lg font-bold text-white">Blockchain Proof</h3>
                                </div>
                                <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                                    Secure this agreement's integrity on <strong className="text-white">Polygon</strong>.
                                    Immutable proof without exposing content.
                                </p>

                                <BlockchainProofActions text={extractedText} fileName={displayName} />
                            </div>
                        </div>

                        {/* Right Column: Clauses */}
                        <div className="lg:col-span-8">

                            {/* AI Summary Panel */}
                            <div className="mb-8">
                                <AIContractSummary
                                    contractText={extractedText}
                                    initialSummary={analysisData.aiSummary?.bullets}
                                />
                            </div>

                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-warning">warning</span>
                                Flagged Clauses ({analysisData.totalClauses})
                            </h2>
                            <div className="flex flex-col gap-4">
                                {analysisData.clauses.map((clause, idx) => (
                                    <ClauseCard
                                        key={idx}
                                        clause={clause}
                                        onRedline={handleRedline}
                                        onPrecedents={handleViewPrecedents}
                                        contractText={extractedText}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>


                </div>
            </main >

            {/* Precedents Modal */}
            {
                precedentsData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
                        <div className="bg-surface-dark border border-slate-600 rounded-xl w-full max-w-lg p-6 shadow-2xl animate-scale-in">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">gavel</span>
                                    <h3 className="text-xl font-bold text-white">Legal Precedents</h3>
                                </div>
                                <button onClick={() => setPrecedentsData(null)} className="text-slate-400 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            {isPrecedentsLoading ? (
                                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary"></div></div>
                            ) : (
                                <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
                                    <p className="text-sm text-slate-300">Relevant case law for: <strong className="text-white">{precedentsData.title}</strong></p>
                                    {precedentsData.cases.map((c, i) => (
                                        <div key={i} className="bg-[#111722] p-4 rounded-lg border-l-4 border-primary shadow-lg">
                                            <p className="text-white font-bold text-sm mb-1">{c.name}</p>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 bg-slate-700 rounded text-[10px] text-slate-300 font-bold uppercase">{c.court}</span>
                                            </div>
                                            <p className="text-xs text-slate-300 italic border-t border-slate-700 pt-2 mt-2">"{c.principle}"</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-6 flex justify-end">
                                <button onClick={() => setPrecedentsData(null)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm font-bold transition-colors">Close</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Redline Modal */}
            {
                redlineData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
                        <div className="bg-surface-dark border border-slate-600 rounded-xl w-full max-w-3xl p-6 shadow-2xl animate-scale-in">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">edit_document</span>
                                    <h3 className="text-xl font-bold text-white">Generate Redline</h3>
                                </div>
                                <button onClick={() => setRedlineData(null)} className="text-slate-400 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            {isRedlineLoading ? (
                                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary"></div></div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-red-400">
                                            <span className="material-symbols-outlined text-[18px]">remove_circle</span>
                                            <span className="text-xs font-bold uppercase">Original</span>
                                        </div>
                                        <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-lg h-full">
                                            <p className="text-sm text-slate-300 line-through decoration-red-500/50 decoration-2">{redlineData.original}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-green-400">
                                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                            <span className="text-xs font-bold uppercase">Suggested</span>
                                        </div>
                                        <div className="p-4 bg-green-900/10 border border-green-500/20 rounded-lg h-full">
                                            <p className="text-sm text-white font-medium">{redlineData.suggestion}</p>
                                        </div>
                                    </div>
                                    <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-slate-700">
                                        <button onClick={() => setRedlineData(null)} className="px-4 py-2 text-slate-400 hover:text-white text-sm font-bold transition-colors">Cancel</button>
                                        <button onClick={() => { navigator.clipboard.writeText(redlineData.suggestion); alert("Copied!"); }} className="px-4 py-2 bg-primary rounded text-white text-sm font-bold hover:bg-blue-600 shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                            Copy Suggestion
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Extracted Text Modal (Existing) */}
            {
                showRawText && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-700 animate-scale-in">
                            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">description</span>
                                    Source Clause Reference
                                </h3>
                                <button onClick={() => setShowRawText(false)} className="text-slate-500 hover:text-red-500 transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto bg-slate-50 dark:bg-[#0f172a] font-mono text-xs md:text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                {extractedText}
                            </div>
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between bg-gray-50 dark:bg-[#1e293b] rounded-b-xl">
                                <span className="text-xs text-slate-500 italic max-w-md">Review the original phrasing to verify the context of the flagged risk.</span>
                                <button onClick={() => setShowRawText(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600">
                                    Close Reference
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            <AIContractChatbot contractText={extractedText} />

            {/* Disclaimer Footer */}
            <footer className="mt-auto py-6 border-t border-border-dark text-center text-slate-500 text-xs bg-[#0b0f17]">
                <p className="mb-1 text-slate-400">© 2024 LexChain. Built for the Global Tech Sprint.</p>
                <p className="opacity-60 max-w-2xl mx-auto px-4">
                    <strong>Advisory Only:</strong> LexChain uses automated pattern matching based on the <strong>Indian Contract Act (1872)</strong> and Arbitration norms.
                    Results indicate potential unenforceability or risk, not a legal verdict. Always consult a qualified lawyer before signing.
                </p>
            </footer>
        </div >
    );
};

export default AnalysisResult;
