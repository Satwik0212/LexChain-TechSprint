import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const AIContractSummary = ({ contractText, initialSummary }) => {
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            // Optimization: Use pre-fetched summary if available to save API calls
            if (initialSummary && initialSummary.length > 0) {
                setSummary(initialSummary);
                setLoading(false);
                return;
            }

            if (!contractText) return;
            try {
                setLoading(true);
                const data = await api.getSummary(contractText);
                setSummary(data.summary);
            } catch (err) {
                console.error("AI Summary failed:", err);
                setError("AI Summary unavailable at this time.");
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [contractText, initialSummary]);

    if (error) {
        return (
            <div className="bg-surface-dark border border-blue-500/20 rounded-xl p-6 relative overflow-hidden flex flex-col items-center text-center gap-3">
                <span className="material-symbols-outlined text-slate-500 text-3xl">cloud_off</span>
                <p className="text-slate-400 text-sm font-medium">AI Summary Temporarily Unavailable</p>
                <p className="text-xs text-slate-600">Please rely on the detailed Rule Engine flags below.</p>
            </div>
        );
    }

    return (
        <div className="bg-surface-dark border border-blue-500/20 rounded-xl p-6 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[24px]">auto_awesome</span>
                    <h3 className="text-lg font-bold text-white">AI Contract Summary</h3>
                </div>
                <span className="bg-blue-500/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                    AI-Generated
                </span>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col gap-3 animate-pulse">
                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                </div>
            ) : (
                summary.length > 0 && summary[0].includes("disabled") ? (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-blue-200 font-bold text-sm">
                            <span className="material-symbols-outlined">info</span>
                            <span>AI Features Disabled</span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            To prevent API quota exhaustion in this public deployment, generative AI features are disabled.
                            <br />
                            <span className="opacity-75 italic block mt-1">Rule-based legal analysis proceeds as normal.</span>
                        </p>
                    </div>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {summary.map((point, idx) => (
                            <li key={idx} className="flex gap-3 text-slate-300 text-sm leading-relaxed">
                                <span className="text-primary mt-1.5 text-[6px] material-symbols-outlined">circle</span>
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                )
            )}

            {/* Footer / Disclaimer */}
            <div className="mt-4 pt-4 border-t border-dashed border-blue-500/20">
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">info</span>
                    <span>Generative AI summary. May miss details. Verify with Rule Flags below.</span>
                </p>
            </div>
        </div>
    );
};

export default AIContractSummary;
