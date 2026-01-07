import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-[#232f48] bg-surface-light/80 dark:bg-[#111722]/80 backdrop-blur-md">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <div className="size-8 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl">gavel</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">LexChain</h2>
                    </Link>

                    {/* Navigation - Added */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/dashboard" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">Dashboard</Link>
                        <Link to="/analysis" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">Analysis</Link>
                        <Link to="/verify" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">Integrity Proofs</Link>
                        <Link to="/history" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">History</Link>
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-6">
                        <button className="flex items-center justify-center text-slate-500 hover:text-primary dark:text-secondary-text dark:hover:text-white transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <div className="h-8 w-px bg-gray-200 dark:bg-[#232f48]"></div>
                        <div className="flex items-center gap-3 cursor-pointer group relative">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold leading-none text-slate-900 dark:text-white">
                                    {user?.displayName || (user?.email ? user.email.split('@')[0] : 'User')}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-secondary-text mt-1">
                                    {user?.email || 'N/A'}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-[#232f48] overflow-hidden border border-gray-200 dark:border-[#324467] relative">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="User" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-500">
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-xs text-red-500 hover:text-red-600 font-semibold ml-2"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
