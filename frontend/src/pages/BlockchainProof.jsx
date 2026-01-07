import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

const BlockchainProof = () => {
    const location = useLocation();

    // Initialize state from location.state or defaults (cleaning away mock data)
    const [proofData, setProofData] = useState(location.state?.proofData || {
        txHash: null,
        timestamp: null,
        blockNumber: null,
        status: "unverified", // 'verified', 'pending', 'unverified'
        contractAddress: null
    });

    // Handler to simulate "View on Explorer"
    const handleViewExplorer = () => {
        if (proofData.txHash) {
            // In a real app, this would open Etherscan
            window.open(`https://sepolia.etherscan.io/tx/${proofData.txHash}`, '_blank');
        } else {
            alert("No transaction hash available to view.");
        }
    };

    // Handler to simulate "Is Download Certificate"
    const handleDownloadCertificate = () => {
        alert("Downloading certificate functionality not yet implemented.");
    };

    const handleVerify = () => {
        // Placeholder for verification logic/button
        // In the future this might call a blockchain verification function
        alert("Verification logic to be connected.");
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased min-h-screen flex flex-col selection:bg-primary selection:text-white font-display" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(17, 82, 212, 0.03) 0%, transparent 50%)' }}>
            {/* Top Navigation */}
            <header className="w-full border-b border-[#e5e7eb] dark:border-border-dark px-6 py-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/dashboard" className="size-8 text-primary flex items-center justify-center hover:opacity-80 transition-opacity">
                            {/* Logo Icon */}
                            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
                            </svg>
                        </Link>
                        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-slate-900 dark:text-white">LexChain</h2>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative w-full max-w-7xl mx-auto">

                {/* Content switching based on status */}
                {proofData.status === 'verified' ? (
                    /* Success Card */
                    <div className="w-full max-w-[640px] bg-white dark:bg-card-dark rounded-xl shadow-glow border border-slate-100 dark:border-border-dark overflow-hidden flex flex-col relative animate-[fadeIn_0.5s_ease-out]">
                        {/* Top Gradient Line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"></div>
                        {/* Header Section */}
                        <div className="flex flex-col items-center text-center px-8 pt-10 pb-6">
                            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary ring-1 ring-primary/20 shadow-[0_0_20px_-5px_rgba(17,82,212,0.3)]">
                                <span className="material-symbols-outlined text-[32px]">verified_user</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                                Verification Successful
                            </h1>
                            <p className="text-slate-500 dark:text-secondary-text text-base font-normal leading-relaxed max-w-md mx-auto">
                                This contract’s integrity is now cryptographically secured on the LexChain network.
                            </p>
                        </div>
                        {/* Divider */}
                        <div className="w-full px-8">
                            <div className="h-px bg-slate-100 dark:bg-border-dark w-full"></div>
                        </div>
                        {/* Details List */}
                        <div className="p-8 space-y-6">
                            {/* Row: Transaction Hash */}
                            <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <span className="text-slate-500 dark:text-secondary-text text-sm font-medium">Transaction Hash</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-700 dark:text-slate-300 text-sm font-mono bg-slate-50 dark:bg-[#0d121c] px-2.5 py-1 rounded border border-slate-200 dark:border-border-dark select-all">
                                        {proofData.txHash || "N/A"}
                                    </span>
                                    <button
                                        className="text-slate-400 hover:text-primary transition-colors p-1 rounded"
                                        title="Copy to clipboard"
                                        onClick={() => { navigator.clipboard.writeText(proofData.txHash); alert("Copied to clipboard") }}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                    </button>
                                </div>
                            </div>
                            {/* Row: Timestamp */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <span className="text-slate-500 dark:text-secondary-text text-sm font-medium">Timestamp</span>
                                <span className="text-slate-900 dark:text-white text-sm">{proofData.timestamp || "N/A"}</span>
                            </div>
                            {/* Row: Block Number */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <span className="text-slate-500 dark:text-secondary-text text-sm font-medium">Block Number</span>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400 dark:text-secondary-text text-[18px]">deployed_code</span>
                                    <span className="text-slate-900 dark:text-white text-sm font-mono">{proofData.blockNumber || "N/A"}</span>
                                </div>
                            </div>
                            {/* Row: Status */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <span className="text-slate-500 dark:text-secondary-text text-sm font-medium">Status</span>
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                    <span className="text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">Verified & Immutable</span>
                                </div>
                            </div>
                        </div>
                        {/* Bottom Actions */}
                        <div className="bg-slate-50 dark:bg-[#121926] p-6 md:p-8 flex flex-col sm:flex-row gap-4 border-t border-slate-100 dark:border-border-dark">
                            <button
                                onClick={handleViewExplorer}
                                className="flex-1 cursor-pointer items-center justify-center rounded-lg h-12 px-5 bg-primary hover:bg-blue-600 text-white text-sm font-bold tracking-wide transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 flex gap-2"
                            >
                                <span>View on Explorer</span>
                                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                            </button>
                            <button
                                onClick={handleDownloadCertificate}
                                className="flex-1 cursor-pointer items-center justify-center rounded-lg h-12 px-5 bg-white dark:bg-[#232f48] border border-slate-200 dark:border-transparent hover:border-primary/30 dark:hover:bg-[#2d3b55] text-slate-700 dark:text-white text-sm font-bold tracking-wide transition-all flex gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                <span>Download Certificate</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Default / Empty / Pending State */
                    <div className="w-full max-w-[640px] bg-white dark:bg-card-dark rounded-xl shadow-glow border border-slate-100 dark:border-border-dark overflow-hidden flex flex-col items-center justify-center p-12 text-center">
                        <div className="size-20 rounded-full bg-[#232f48] flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-[40px] text-slate-400">lock_clock</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Proof Not Yet Generated</h2>
                        <p className="text-slate-500 dark:text-secondary-text mb-8 max-w-sm">
                            This document has not been secured on the blockchain yet, or the proof data is unavailable.
                        </p>
                        <button
                            onClick={handleVerify}
                            className="rounded-lg h-12 px-8 bg-primary hover:bg-blue-600 text-white text-sm font-bold tracking-wide transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">lock</span>
                            Start Verification
                        </button>
                    </div>
                )}

                {/* Trust Indicator Footer */}
                <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-600 opacity-70">
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                    <span className="text-xs font-medium uppercase tracking-widest">Secured by LexChain Protocol v2.1</span>
                </div>
            </main>
        </div>
    );
};

export default BlockchainProof;
