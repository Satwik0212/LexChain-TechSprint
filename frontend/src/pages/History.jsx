import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const History = () => {
    // State for history data (defaulting to empty array to remove mock data)
    const [historyData, setHistoryData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRisk, setFilterRisk] = useState("All"); // 'All', 'High', 'Medium', 'Low'

    // Simple manual refresh/add handler placeholder
    const handleNewAnalysis = () => {
        // In a real app this might navigate to /upload or trigger a fetch
        console.log("Trigger new analysis");
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display antialiased h-screen overflow-hidden flex">
            {/* Sidebar Navigation */}
            <aside className="w-64 flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-border-dark bg-white dark:bg-[#111722] transition-colors duration-300">
                <div className="p-6 flex flex-col h-full">
                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-10">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>gavel</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold leading-none tracking-tight">LexChain</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">Legal Integrity Protocol</p>
                        </div>
                    </div>
                    {/* Navigation Links */}
                    <nav className="flex flex-col gap-2 flex-1">
                        <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group">
                            <span className="material-symbols-outlined group-hover:text-primary transition-colors">dashboard</span>
                            <span className="text-sm font-medium">Dashboard</span>
                        </Link>
                        <Link to="/analysis" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group">
                            <span className="material-symbols-outlined group-hover:text-primary transition-colors">add_circle</span>
                            <span className="text-sm font-medium">New Analysis</span>
                        </Link>
                        {/* Active Link */}
                        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400">
                            <span className="material-symbols-outlined fill-1">history</span>
                            <span className="text-sm font-bold">History</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group">
                            <span className="material-symbols-outlined group-hover:text-primary transition-colors">settings</span>
                            <span className="text-sm font-medium">Settings</span>
                        </a>
                    </nav>
                    {/* User Profile Snippet */}
                    <div className="mt-auto pt-6 border-t border-slate-200 dark:border-border-dark">
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0" data-alt="Profile picture of user">
                                {/* Placeholder Avatar */}
                                <div className="w-full h-full bg-slate-400 flex items-center justify-center text-white font-bold">A</div>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">Admin User</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">admin@lexchain.io</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Top Bar / Header */}
                <header className="flex-shrink-0 px-8 py-6 border-b border-slate-200 dark:border-border-dark bg-white/50 dark:bg-[#101622]/95 backdrop-blur-sm z-10">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Analysis History</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Review past contract audits and blockchain verification records.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">cloud_download</span>
                                <span>Export CSV</span>
                            </button>
                            <Link to="/analysis" className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                                <span className="material-symbols-outlined text-[20px]">add</span>
                                <span>New Analysis</span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto flex flex-col gap-6">
                        {/* Filters & Search */}
                        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                            {/* Search Bar */}
                            <div className="w-full max-w-md">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                                    </div>
                                    <input
                                        className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg leading-5 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm shadow-sm"
                                        placeholder="Search by document name, hash, or ID..."
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            {/* Filter Chips */}
                            <div className="flex flex-wrap gap-2">
                                {/* Placeholders for filters */}
                                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                    <span>All Time</span>
                                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                                </button>
                                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
                                    <span>Status: All</span>
                                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                                </button>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-border-dark overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                                    <thead className="bg-slate-50 dark:bg-[#161b26]">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" scope="col">Document Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" scope="col">Date Analyzed</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" scope="col">Risk Score</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" scope="col">Integrity Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/4" scope="col">AI Summary</th>
                                            <th className="relative px-6 py-4" scope="col">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {historyData.length === 0 ? (
                                            /* Empty State */
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <span className="material-symbols-outlined text-[48px] opacity-20">history_edu</span>
                                                        <p className="text-lg font-medium">No Analysis History Found</p>
                                                        <p className="text-sm opacity-70">Start a new analysis to see records here.</p>
                                                        <Link to="/analysis" className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors">
                                                            Start New Analysis
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            /* Data Skeleton - Mapping would go here */
                                            historyData.map((item, index) => (
                                                <tr key={index}>
                                                    {/* Render row cells based on item data */}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default History;
