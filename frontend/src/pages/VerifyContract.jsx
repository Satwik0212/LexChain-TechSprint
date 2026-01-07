import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const VerifyContract = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => {
        setIsDemo(api.isDemo());
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await api.getBlockchainHistory();
            setHistory(data);
        } catch (e) {
            console.error("Failed to load history", e);
        }
    };

    const handleHistoryClick = (item) => {
        setResult({
            exists: true,
            document_hash: item.document_hash,
            tx_hash: item.tx_hash,
            on_chain_timestamp: item.timestamp || item.created_at, // Handle potential key diffs
            submitted_by: "You (History)",
            message: "Viewing historical proof.",
            network: "Polygon Amoy"
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFile = async (selectedFile) => {
        if (!selectedFile) return;
        setFile(selectedFile);
        setLoading(true);
        setResult(null);

        try {
            const data = await api.verifyFile(selectedFile);
            setResult(data);
        } catch (e) {
            console.error(e);
            alert("Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const onDragLeave = (e) => {
        e.preventDefault();
        setDragActive(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased min-h-screen flex flex-col">
            <div className="flex-1 flex flex-col w-full h-full">
                {/* Header removed as per user request to avoid duplication with global layout */}

                <main className="flex-1 flex justify-center py-8 px-4 sm:px-8 lg:px-12">
                    <div className="flex flex-col w-full max-w-[1200px] gap-8">
                        {/* Header Section */}
                        <div className="flex flex-col gap-3">
                            <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Verify Contract Integrity</h1>
                            <p className="text-slate-500 dark:text-[#92a4c9] text-lg font-normal leading-relaxed max-w-2xl">
                                Upload your legal document to instantaneously validate its authenticity against the LexChain immutable ledger.
                            </p>
                        </div>

                        {/* Demo Mode Banner */}
                        {isDemo && (
                            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 p-4 rounded-xl flex items-center gap-3">
                                <span className="material-symbols-outlined">wifi_off</span>
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm">Demo Mode (Offline)</span>
                                    <span className="text-xs opacity-80">Backend is unreachable. Using simulated verification data.</span>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4 items-start">
                            {/* LEFT: Upload */}
                            <div className="lg:col-span-7 flex flex-col gap-6">
                                <div
                                    className={`group relative flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed ${dragActive ? 'border-primary bg-primary/5' : 'border-slate-300 dark:border-[#324467]'} bg-white dark:bg-[#161e2c] px-6 py-16 transition-all duration-300 shadow-sm`}
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    onDrop={onDrop}
                                >
                                    <div className="size-16 rounded-full bg-slate-100 dark:bg-[#232f48] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-[#92a4c9] group-hover:text-primary">cloud_upload</span>
                                    </div>
                                    <div className="flex max-w-[480px] flex-col items-center gap-2 text-center">
                                        <p className="text-slate-900 dark:text-white text-xl font-bold leading-tight">
                                            {file ? file.name : "Drag & Drop PDF or DOCX here"}
                                        </p>
                                        <p className="text-slate-500 dark:text-[#92a4c9] text-sm">Max file size 25MB. Securely encrypted.</p>
                                    </div>
                                    <input
                                        type="file"
                                        id="fileInput"
                                        className="hidden"
                                        onChange={(e) => handleFile(e.target.files[0])}
                                        accept=".pdf,.docx,.txt"
                                    />
                                    <button onClick={() => document.getElementById('fileInput').click()} className="flex items-center justify-center h-10 px-6 bg-slate-100 dark:bg-[#232f48] hover:bg-slate-200 dark:hover:bg-[#324467] text-slate-900 dark:text-white text-sm font-bold rounded-lg transition-colors cursor-pointer shadow-sm">
                                        <span className="mr-2 material-symbols-outlined text-[18px]">folder_open</span>
                                        {file ? "Change File" : "Browse Files"}
                                    </button>
                                </div>

                                {loading && (
                                    <div className="bg-blue-500/10 border border-blue-500/20 text-blue-200 p-4 rounded-xl flex items-center justify-center gap-3 animate-pulse">
                                        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                        <span className="font-bold">Verifying integrity against blockchain...</span>
                                    </div>
                                )}
                            </div>

                            {/* RIGHT: Results & History */}
                            <div className="lg:col-span-5 flex flex-col gap-6">

                                {/* RESULT PANEL */}
                                {result && (
                                    <div className={`rounded-xl border ${result.exists ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-blue-500/30 bg-blue-500/5'} overflow-hidden shadow-lg animate-fade-in`}>
                                        <div className={`p-5 border-b ${result.exists ? 'border-emerald-500/20' : 'border-blue-500/20'} flex items-center justify-between`}>
                                            <span className="text-white font-bold text-sm uppercase tracking-wider">Verification Result</span>
                                            {result.exists && (
                                                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                                    VERIFIED
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-6 flex flex-col gap-6">
                                            {/* Status Header */}
                                            <div className="flex items-start gap-4">
                                                <div className={`size-12 rounded-full ${result.exists ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-400'} flex items-center justify-center shrink-0`}>
                                                    <span className="material-symbols-outlined text-2xl">
                                                        {result.exists ? 'check_circle' : 'info'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="text-white text-lg font-bold">
                                                        {result.exists ? "Integrity Verified" : "No integrity proof found"}
                                                    </h3>
                                                    <p className={`text-sm font-medium ${result.exists ? 'text-emerald-400' : 'text-blue-300'}`}>
                                                        {result.exists
                                                            ? "This document matches a previously secured blockchain proof."
                                                            : "This document has not been previously secured or does not match any stored proof."}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Data Grid */}
                                            <div className="space-y-4">
                                                <div className="group flex flex-col gap-1 p-3 rounded-lg bg-[#111722] border border-slate-700/50">
                                                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Document Hash (SHA-256)</span>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <code className="text-slate-300 text-xs font-mono break-all">{result.document_hash}</code>
                                                        <button
                                                            onClick={() => navigator.clipboard.writeText(result.document_hash)}
                                                            className="text-slate-400 hover:text-white transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {result.exists && (
                                                    <>
                                                        <div className="flex flex-col gap-1 p-3 rounded-lg bg-[#111722] border border-slate-700/50">
                                                            <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Timestamp</span>
                                                            <p className="text-slate-300 text-sm font-mono">
                                                                {new Date(result.on_chain_timestamp * 1000).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-col gap-1 p-3 rounded-lg bg-[#111722] border border-slate-700/50">
                                                            <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Network</span>
                                                            <div className="flex items-center gap-2">
                                                                <img src="https://cryptologos.cc/logos/polygon-matic-logo.png" className="h-4 w-4" alt="Polygon" />
                                                                <p className="text-slate-300 text-sm font-bold">Polygon Amoy</p>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            {result.exists ? (
                                                <a
                                                    href={`https://amoy.polygonscan.com/tx/${result.tx_hash}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="w-full py-2.5 rounded-lg border border-slate-700 bg-[#161e2c] text-slate-300 text-sm font-bold hover:bg-[#232f48] hover:text-primary transition-all flex items-center justify-center gap-2"
                                                >
                                                    View on Explorer
                                                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                                </a>
                                            ) : (
                                                <Link
                                                    to="/dashboard"
                                                    className="w-full py-3 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                                                >
                                                    <span className="material-symbols-outlined">lock</span>
                                                    Secure This Document
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* HISTORY PANEL */}
                                <div className="bg-white dark:bg-[#161e2c] rounded-xl border border-slate-200 dark:border-[#232f48] overflow-hidden shadow-lg flex-1">
                                    <div className="p-4 border-b border-slate-100 dark:border-[#232f48] flex items-center justify-between bg-slate-50/50 dark:bg-[#111722]/50">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-slate-400">history</span>
                                            <span className="text-slate-900 dark:text-white font-bold text-sm">Verification History</span>
                                        </div>
                                        <span className="text-xs text-slate-500">{history.length} Records</span>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {history.length === 0 ? (
                                            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm flex flex-col items-center gap-2">
                                                <span className="material-symbols-outlined text-3xl opacity-50">content_paste_off</span>
                                                No verification history found.
                                            </div>
                                        ) : (
                                            <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                                                {history.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => handleHistoryClick(item)}
                                                        className="p-4 hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors flex items-center justify-between group cursor-pointer"
                                                    >
                                                        <div className="flex flex-col gap-1 overflow-hidden">
                                                            <div className="flex items-center gap-2">
                                                                <span className="truncate text-slate-900 dark:text-slate-200 font-medium text-sm max-w-[150px]" title={item.filename}>
                                                                    {item.filename || "Document"}
                                                                </span>
                                                                <span className="text-xs text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold uppercase">
                                                                    {item.status || "Stored"}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                                                                <span>{new Date((item.timestamp || item.created_at) * 1000).toLocaleDateString()}</span>
                                                                <span>•</span>
                                                                <span className="truncate max-w-[80px]">{item.document_hash.substring(0, 8)}...</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-primary opacity-0 group-hover:opacity-100 font-bold transition-opacity">Compare</span>
                                                            <a
                                                                href={`https://amoy.polygonscan.com/tx/${item.tx_hash}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="p-2 text-slate-400 hover:text-primary transition-all rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">open_in_new</span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="mt-auto border-t border-slate-200 dark:border-[#232f48] py-8 bg-white dark:bg-[#0b0f17]">
                    <div className="flex flex-col items-center justify-center gap-4 text-center px-4">
                        <div className="flex items-center gap-2 text-slate-400 dark:text-[#92a4c9]">
                            <span className="material-symbols-outlined text-lg">gavel</span>
                            <span className="text-sm font-semibold">LexChain LegalTech Solutions</span>
                        </div>
                        <p className="text-slate-400 dark:text-[#64748b] text-xs">
                            © 2024 LexChain. Only cryptographic hashes are stored. No document content is ever saved.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default VerifyContract;
