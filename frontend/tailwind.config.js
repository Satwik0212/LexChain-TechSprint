/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#1152d4",
                "primary-hover": "#0e43ad",
                "primary-dark": "#1e40af", // From Login page
                "primary-dark-hover": "#1e3a8a", // From Login page
                "background-light": "#f6f6f8",
                "background-dark": "#101622",
                "surface-dark": "#181b21", // General
                "surface-dark-alt": "#161e2c", // Page 3/4 variant
                "surface-light": "#ffffff",
                "secondary-text": "#92a4c9",
                "accent-success": "#10b981",
                "card-dark": "#161b26",
                "border-dark": "#232f48",
                "success": "#10b981",
                "warning": "#f59e0b",
                "danger": "#ef4444",
            },
            fontFamily: {
                "display": ["Manrope", "sans-serif"],
                "body": ["Noto Sans", "sans-serif"],
                "mono": ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"]
            },
            boxShadow: {
                "premium": "0 20px 40px -10px rgba(0, 0, 0, 0.5)",
                'glow': '0 0 20px -5px rgba(17, 82, 212, 0.3)',
            }
        },
    },
    plugins: [],
}
