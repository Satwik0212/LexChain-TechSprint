import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [systemStatus, setSystemStatus] = useState("Initializing...");
    const [statusColor, setStatusColor] = useState("bg-yellow-500");

    useEffect(() => {
        const checkBackend = async () => {
            try {
                // Task 4 & 6: Validate session with backend
                // If API is down, this throws.
                await api.getMe();

                // Get health
                const health = await api.getHealth();
                if (health.status === "ok") {
                    setSystemStatus("System Operational");
                    setStatusColor("bg-green-500");
                } else if (health.status === "demo") {
                    setSystemStatus("Demo Operations Mode (Offline)");
                    setStatusColor("bg-blue-500");
                }
            } catch (error) {
                // If getMe itself throws or network error
                console.warn("Dashboard session check failed - switching to Demo Mode", error);
                api.setDemoMode(true); // Force API to demo mode

                // Do NOT logout.
                // Instead, show Demo Mode status
                setSystemStatus("Demo Operations Mode (Offline)");
                setStatusColor("bg-blue-500");
            }
        };

        if (user) {
            checkBackend();
        }
    }, [user]); // Removed logout from deps to avoid loop


    const userName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Counsel');

    return (
        <div className="text-slate-900 dark:text-white font-display flex flex-col transition-colors duration-300">
            {/* Main Content */}
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero / Welcome */}
                <div className="mb-12 animate-fade-in-up">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                Secure Contract Intelligence
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-secondary-text font-normal max-w-2xl">
                                Good morning, {userName}. System integrity verified. Blockchain nodes active.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-[#102a22] border border-green-200 dark:border-green-900/50">
                            <div className={`h-2 w-2 rounded-full ${statusColor} animate-pulse`}></div>
                            <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">{systemStatus}</span>
                        </div>
                    </div>
                </div>
                {/* Action Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Card 1: Analyze */}
                    <Link to="/analysis" className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#192233] border border-gray-200 dark:border-[#324467] p-8 shadow-sm hover:shadow-glow hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 cursor-pointer flex flex-col h-full">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-8xl text-primary">psychology</span>
                        </div>
                        <div className="mb-6 h-14 w-14 rounded-lg bg-blue-50 dark:bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined text-3xl icon-filled">cloud_upload</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Analyze New Contract</h3>
                        <p className="text-slate-500 dark:text-secondary-text text-sm leading-relaxed mb-8 flex-grow">
                            AI-driven risk assessment and clause extraction. Drag and drop your PDF or DOCX files here for instant analysis.
                        </p>
                        <div className="flex items-center text-primary font-bold text-sm group-hover:translate-x-1 transition-transform">
                            Start Analysis <span className="material-symbols-outlined ml-1 text-lg">arrow_forward</span>
                        </div>
                    </Link>
                    {/* Card 2: Verify */}
                    <Link to="/verify" className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#192233] border border-gray-200 dark:border-[#324467] p-8 shadow-sm hover:shadow-glow hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 cursor-pointer flex flex-col h-full">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-8xl text-primary">verified_user</span>
                        </div>
                        <div className="mb-6 h-14 w-14 rounded-lg bg-blue-50 dark:bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined text-3xl icon-filled">policy</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Verify Integrity</h3>
                        <p className="text-slate-500 dark:text-secondary-text text-sm leading-relaxed mb-8 flex-grow">
                            Blockchain-backed proof of immutability. Verify the hash of any document against the LexChain ledger.
                        </p>
                        <div className="flex items-center text-primary font-bold text-sm group-hover:translate-x-1 transition-transform">
                            Check Hash <span className="material-symbols-outlined ml-1 text-lg">arrow_forward</span>
                        </div>
                    </Link>
                    {/* Card 3: Archives */}
                    <Link to="/history" className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#192233] border border-gray-200 dark:border-[#324467] p-8 shadow-sm hover:shadow-glow hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 cursor-pointer flex flex-col h-full">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-8xl text-primary">history_edu</span>
                        </div>
                        <div className="mb-6 h-14 w-14 rounded-lg bg-blue-50 dark:bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined text-3xl icon-filled">folder_open</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">My Analyses</h3>
                        <p className="text-slate-500 dark:text-secondary-text text-sm leading-relaxed mb-8 flex-grow">
                            Access your recent contract reviews, compliance reports, and saved drafts in your secure library.
                        </p>
                        <div className="flex items-center text-primary font-bold text-sm group-hover:translate-x-1 transition-transform">
                            View Library <span className="material-symbols-outlined ml-1 text-lg">arrow_forward</span>
                        </div>
                    </Link>
                </div>
                {/* Trust Indicators */}
                <div className="flex justify-center mb-16">
                    <div className="inline-flex items-center gap-6 px-6 py-3 rounded-full bg-slate-100 dark:bg-[#192233] border border-slate-200 dark:border-[#324467]">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-secondary-text text-xs font-medium uppercase tracking-wider">
                            <span className="material-symbols-outlined text-sm">lock</span>
                            End-to-End Encrypted
                        </div>
                        <div className="h-3 w-px bg-slate-300 dark:bg-[#324467]"></div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-secondary-text text-xs font-medium uppercase tracking-wider">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            SOC2 Compliant
                        </div>
                        <div className="h-3 w-px bg-slate-300 dark:bg-[#324467]"></div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-secondary-text text-xs font-medium uppercase tracking-wider">
                            <span className="material-symbols-outlined text-sm">link</span>
                            Ethereum Mainnet
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
