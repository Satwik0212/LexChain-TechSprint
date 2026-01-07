import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const AppLayout = ({ children }) => {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display transition-colors duration-300">
            <Navbar />
            <div className="flex flex-grow">
                <Sidebar />
                <main className="flex-grow">
                    {children}
                </main>
            </div>
            <footer className="border-t border-gray-200 dark:border-[#232f48] bg-surface-light dark:bg-[#111722] py-10">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-400 dark:text-[#92a4c9]">
                        <span className="text-sm">© 2024 LexChain Inc. All rights reserved.</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8">
                        <a className="text-sm font-medium text-slate-500 hover:text-primary dark:text-[#92a4c9] dark:hover:text-white transition-colors" href="#">Support Center</a>
                        <a className="text-sm font-medium text-slate-500 hover:text-primary dark:text-[#92a4c9] dark:hover:text-white transition-colors" href="#">Security Compliance</a>
                        <a className="text-sm font-medium text-slate-500 hover:text-primary dark:text-[#92a4c9] dark:hover:text-white transition-colors" href="#">Terms of Service</a>
                        <a className="text-sm font-medium text-slate-500 hover:text-primary dark:text-[#92a4c9] dark:hover:text-white transition-colors" href="#">Privacy Policy</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AppLayout;
