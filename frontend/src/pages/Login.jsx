import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from "firebase/auth";

const Login = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [googleLoading, setGoogleLoading] = useState(false);
    const [devLoading, setDevLoading] = useState(false);
    const loading = googleLoading || devLoading;

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        if (currentYear > 2025) {
            setError(`System Warning: Your date is set to ${currentYear}. Google Auth will likely fail. Please use the Developer Login button below.`);
        }
    }, []);

    // Health Check on Mount
    useEffect(() => {
        const checkHealth = async () => {
            try {
                const res = await fetch("http://localhost:8000/health");
                if (!res.ok) throw new Error("Health check failed");
            } catch (e) {
                console.warn("Backend health check failed.", e);
                // Keep error state clean unless we specifically want to block UI
                // setError("Warning: Backend unreachable. Features may be limited.");
            }
        };
        checkHealth();
    }, []);

    const { setUser } = useAuth();

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError('');
        try {
            const provider = new GoogleAuthProvider();

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("Login timed out. use Developer Login.")), 25000);
            });

            const result = await Promise.race([
                signInWithPopup(auth, provider),
                timeoutPromise
            ]);

            const token = await result.user.getIdToken();

            // Explicit fetch handling
            try {
                const response = await fetch("http://localhost:8000/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id_token: token })
                });

                if (!response.ok) {
                    const data = await response.json();
                    await signOut(auth);
                    throw new Error(data.detail || 'Backend Google authentication failed.');
                }
            } catch (networkErr) {
                console.error("Backend unreachable:", networkErr);
                throw new Error("Backend unreachable. Ensure server is running on port 8000.");
            }

            navigate("/dashboard");
        } catch (err) {
            console.error("Google auth error:", err);
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Login cancelled.');
            } else {
                setError(err.message);
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleDevLogin = async () => {
        setDevLoading(true);
        if (!error.includes("Demo Mode")) setError('');

        try {
            // Attempt real backend login first
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

            const response = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_token: "dev-token-bypass" }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error("Dev Login Failed");

            const data = await response.json();
            console.log("Dev Bypass Success:", data);

            setUser({
                uid: data.uid,
                email: data.email,
                bypass: true
            });

            navigate("/dashboard");
        } catch (err) {
            console.error("Backend Dev Login failed:", err);
            setError("Backend unreachable. Developer Login requires local server (port 8000).");
        } finally {
            setDevLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-row overflow-hidden bg-background-light dark:bg-background-dark font-display text-[#1e293b] dark:text-white transition-colors duration-300">
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between bg-[#0B1120] p-16 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1120] via-[#0B1120]/95 to-[#1e40af]/10 z-10"></div>
                    <div
                        className="h-full w-full bg-cover bg-center opacity-30 mix-blend-overlay grayscale"
                        data-alt="Abstract dark blue blockchain network connection nodes and geometric shapes"
                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBnCy4ErgaMCJqIcaKy5E8AtEMratq_1hOZBhdSroW9ZuE4ttZj_4GRW0qBRCk0CDslpNT_BARH6KCyCQw7-wFJU0XRpQKCLtjzWnsjX0w-EPAivtJVr6EQFa_S6OQV7KTghbGn53XY3KKH_569f6f0utYq4OzRM6xxKy6I4Vi29mTXUGhtsLlCZ8Ui5xGx3r7EI_mb-DpZhi49CSe6d0Q9QZD7MVcslYdnyozU6J8RBboKUdXE7rfkWpjyV9tMMredj2snIauNpg')" }}
                    ></div>
                </div>
                <div className="relative z-10 flex items-center gap-3">
                    <div className="size-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm text-white">
                        <span className="material-symbols-outlined text-2xl">balance</span>
                    </div>
                    <h2 className="text-white text-xl font-bold tracking-wide uppercase">LexChain</h2>
                </div>
                <div className="relative z-10 flex flex-col gap-6 max-w-xl">
                    <h1 className="text-white text-5xl font-extrabold tracking-tight leading-tight">
                        Know what you’re signing.<br /><span className="text-blue-400">Before it’s too late.</span>
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                        Our AI deciphers complex legalese instantly, while blockchain immutability guarantees that what you sign is exactly what stays signed.
                    </p>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 text-slate-500 text-xs font-semibold uppercase tracking-widest mb-4">
                        Trusted by industry leaders
                    </div>
                    <div className="flex gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="h-8 w-24 bg-white/10 rounded flex items-center justify-center text-xs text-white/50">FINCORP</div>
                        <div className="h-8 w-24 bg-white/10 rounded flex items-center justify-center text-xs text-white/50">LEGAL.IO</div>
                        <div className="h-8 w-24 bg-white/10 rounded flex items-center justify-center text-xs text-white/50">BLOCKSEC</div>
                    </div>
                </div>
            </div>
            <div className="flex w-full lg:w-1/2 flex-col justify-center items-center bg-white dark:bg-[#0f141f] px-6 py-12 lg:px-24 overflow-y-auto border-l border-slate-200 dark:border-slate-800/50">
                <div className="w-full max-w-[420px] flex flex-col gap-8 text-center">
                    <div className="flex lg:hidden items-center justify-center gap-2 text-slate-900 dark:text-white mb-4">
                        <div className="size-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-xl">balance</span>
                        </div>
                        <h2 className="text-lg font-bold uppercase tracking-wide">LexChain</h2>
                    </div>

                    <div className="flex flex-col gap-3">
                        <h2 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">
                            Welcome Back
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Access your secure legal dashboard.
                        </p>
                    </div>

                    {error && (
                        <div className={`${error.includes("Demo Mode") || error.includes("Warning") ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-red-500/10 border-red-500/20 text-red-500"} border rounded p-4 text-sm animate-fade-in text-left`}>
                            <div className="flex gap-3 items-start">
                                <span className="material-symbols-outlined text-[20px] shrink-0">{error.includes("Demo Mode") ? "wifi_off" : "error"}</span>
                                <div>
                                    <span className="font-bold block mb-1">{error.includes("Demo Mode") ? "Offline Mode" : "Login Error"}</span>
                                    <span className="opacity-90 leading-tight">{error}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-4 mt-4">
                        <button
                            className="flex w-full items-center justify-center gap-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151b28] py-4 px-6 text-slate-700 dark:text-white font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-[1.01] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                        >
                            {googleLoading ? (
                                <>
                                    <div className="size-5 border-2 border-slate-300 border-t-[#4285F4] rounded-full animate-spin"></div>
                                    <span>Connecting to Workspace...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                                    </svg>
                                    Continue with Google Workspace
                                </>
                            )}
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Developers</span>
                            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                        </div>

                        <button
                            className="flex w-full items-center justify-center gap-3 rounded bg-[#0B1120] border border-slate-700 hover:border-amber-500/50 hover:bg-[#111827] py-4 px-6 text-slate-300 hover:text-white font-medium text-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group"
                            type="button"
                            onClick={handleDevLogin}
                            disabled={loading}
                        >
                            {devLoading ? (
                                <>
                                    <div className="size-5 border-2 border-slate-500 border-t-amber-500 rounded-full animate-spin"></div>
                                    <span>Bypassing Security...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px] group-hover:text-amber-500 transition-colors">terminal</span>
                                    Developer Login (Bypass)
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800/50 flex flex-col items-center gap-3 opacity-60">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5" title="Privacy-First">
                                <span className="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span>
                                <span className="text-[11px] font-semibold uppercase tracking-wider">Zero-Knowledge</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Security">
                                <span className="material-symbols-outlined text-[16px] text-emerald-500">lock</span>
                                <span className="text-[11px] font-semibold uppercase tracking-wider">AES-256</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-500 max-w-xs leading-relaxed">
                            Secured by LexChain Immutable Ledger Technology.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
