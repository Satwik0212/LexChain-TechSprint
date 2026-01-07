export default function AuthLayout({ children }) {
    return (
        <div className="flex min-h-screen w-full overflow-hidden">

            {/* LEFT PANEL */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between bg-[#0B1120] p-16 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1120] via-[#0B1120]/95 to-[#1e40af]/10 z-10" />
                    <div
                        className="h-full w-full bg-cover bg-center opacity-30 mix-blend-overlay grayscale"
                        style={{
                            backgroundImage:
                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBnCy4ErgaMCJqIcaKy5E8AtEMratq_1hOZBhdSroW9ZuE4ttZj_4GRW0qBRCk0CDslpNT_BARH6KCyCQw7-wFJU0XRpQKCLtjzWnsjX0w-EPAivtJVr6EQFa_S6OQV7KTghbGn53XY3KKH_569f6f0utYq4OzRM6xxKy6I4Vi29mTXUGhtsLlCZ8Ui5xGx3r7EI_mb-DpZhi49CSe6d0Q9QZD7MVcslYdnyozU6J8RBboKUdXE7rfkWpjyV9tMMredj2snIauNpg')",
                        }}
                    />
                </div>

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="size-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm text-white">
                        <span className="material-symbols-outlined text-2xl">balance</span>
                    </div>
                    <h2 className="text-white text-xl font-bold tracking-wide uppercase">
                        LexChain
                    </h2>
                </div>

                {/* Hero Text */}
                <div className="relative z-10 flex flex-col gap-6 max-w-xl">
                    <h1 className="text-white text-5xl font-extrabold leading-tight">
                        Know what you’re signing.<br />
                        <span className="text-blue-400">Before it’s too late.</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-md">
                        Our AI deciphers complex legalese instantly, while blockchain
                        immutability guarantees that what you sign is exactly what stays
                        signed.
                    </p>
                </div>

                {/* Trust Logos */}
                <div className="relative z-10">
                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-4">
                        Trusted by industry leaders
                    </div>
                    <div className="flex gap-8 opacity-60 grayscale">
                        {["FINCORP", "LEGAL.IO", "BLOCKSEC"].map((name) => (
                            <div
                                key={name}
                                className="h-8 w-24 bg-white/10 rounded flex items-center justify-center text-xs text-white/50"
                            >
                                {name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            {children}
        </div>
    );
}
