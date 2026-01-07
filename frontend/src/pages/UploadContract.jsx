import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const UploadContract = () => {
    const [file, setFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const clearFile = () => {
        setFile(null);
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        console.log("👆 [UploadContract] handleAnalyze clicked. File:", file?.name);
        if (!file) {
            console.warn("⚠️ [UploadContract] No file selected.");
            return;
        }

        setIsAnalyzing(true);
        try {
            console.log("🔄 [UploadContract] Calling api.analyzeContract...");
            const result = await api.analyzeContract(file);
            console.log("✅ [UploadContract] Analysis result received:", result);

            navigate('/analysis-result', {
                state: {
                    fileName: file.name,
                    fileSize: file.size,
                    extractedText: result.extracted_text
                }
            });
        } catch (error) {
            console.error("❌ [UploadContract] Analysis failed", error);
            alert("Analysis failed: " + error.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased h-full flex flex-col overflow-x-hidden font-display">
            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center p-4 py-12">
                <div className="w-full max-w-3xl flex flex-col gap-8">
                    {/* Page Heading */}
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Contract Integrity Analysis
                        </h1>
                        <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                            Upload your contract before signing. LexChain uses AI and blockchain verification to ensure document integrity and analyze potential risks.
                        </p>
                    </div>
                    {/* Upload Card */}
                    <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-200 dark:border-border-dark overflow-hidden">
                        {/* Header of Card */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-border-dark flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">File Upload</span>
                            <div className="flex items-center gap-2 text-emerald-500">
                                <span className="material-symbols-outlined text-sm">lock</span>
                                <span className="text-xs font-bold">End-to-End Encrypted</span>
                            </div>
                        </div>
                        <div className="p-6 md:p-8 space-y-6">
                            {/* Drop Zone */}
                            <div className="group relative flex flex-col items-center justify-center w-full h-64 rounded-xl border-2 border-dashed border-gray-300 dark:border-border-dark hover:border-primary/50 dark:hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-border-dark/30 transition-all cursor-pointer">
                                <div className="flex flex-col items-center gap-4 text-center p-6">
                                    <div className="size-16 rounded-full bg-blue-50 dark:bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                                        <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-base font-semibold text-slate-900 dark:text-white">
                                            Drag & drop your PDF or DOCX here
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Max file size 50MB. Secure transfer.
                                        </p>
                                    </div>
                                    <button className="mt-2 px-4 py-2 bg-white dark:bg-border-dark border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                        Browse Files
                                    </button>
                                </div>
                                {/* Invisible Input */}
                                <input
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.docx,.doc"
                                />
                            </div>
                            {/* Uploaded File Item (Conditional) */}
                            {file && (
                                <div className="space-y-3">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 px-1">Recent Selection</p>
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[#111722] border border-gray-200 dark:border-border-dark transition-colors hover:border-primary/30">
                                        {/* Icon Type */}
                                        <div className="shrink-0 size-12 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500">
                                            <span className="material-symbols-outlined">description</span>
                                        </div>
                                        {/* File Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{file.name}</p>
                                                <span className="material-symbols-outlined text-green-500 text-sm" title="Verified">check_circle</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                <p className="text-xs text-emerald-500 font-medium">Ready for analysis</p>
                                            </div>
                                        </div>
                                        {/* Actions */}
                                        <button
                                            onClick={clearFile}
                                            className="shrink-0 p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-border-dark"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Footer / CTA Area */}
                        <div className="px-6 py-6 bg-gray-50 dark:bg-[#131a26] border-t border-gray-100 dark:border-border-dark flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex flex-col gap-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 dark:text-slate-400 text-sm">
                                    <span className="material-symbols-outlined text-lg">verified_user</span>
                                    <span>Blockchain Integrity Check</span>
                                </div>
                                <p className="text-xs text-slate-400 dark:text-slate-500">LexChain ID: 0x8f...4e2a</p>
                            </div>
                            <button
                                onClick={handleAnalyze}
                                disabled={!file || isAnalyzing}
                                className={`w-full md:w-auto min-w-[200px] h-12 flex items-center justify-center gap-2 font-bold rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95 ${file && !isAnalyzing
                                    ? 'bg-primary hover:bg-blue-700 text-white'
                                    : 'bg-gray-300 dark:bg-slate-700 cursor-not-allowed text-gray-500 dark:text-slate-400'
                                    }`}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Analyzing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">analytics</span>
                                        <span>Analyze Contract</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    {/* Trust Indicators */}
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-slate-400 dark:text-slate-500">
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
                            <span className="material-symbols-outlined text-lg">shield</span>
                            <span>AES-256 Encryption</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
                            <span className="material-symbols-outlined text-lg">history_edu</span>
                            <span>GDPR Compliant</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
                            <span className="material-symbols-outlined text-lg">account_balance</span>
                            <span>Legal Grade</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UploadContract;
