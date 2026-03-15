# TechSprint - AI Contract Analysis Platform

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Python 3.11](https://img.shields.io/badge/python-3.11-blue.svg)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)

TechSprint is an advanced AI-powered contract analysis platform designed to help users understand legal documents instantly. It combines rule-based logic with Generative AI (Google Gemini) to provide risk assessments, summaries, and interactive Q&A.

## 🚀 Features

*   **AI Summary**: Instantly get a 4-6 bullet point summary of complex contracts.
*   **Risk Analysis**: Rule-based engine identifies high/medium/low risks (Termination, Liability, Dispute Resolution, etc.).
*   **Smart Advisory**: AI explains *why* a clause is risky under Indian law and suggests safer alternatives.
*   **Interactive Chat**: Ask questions about your contract and get answers grounded in the document text.
*   **Blockchain Verification**: Store contract hashes on the Polygon blockchain for immutable proof of existence.

## 📂 File Structure

```
d:\projects\techsprint\
├── backend/                # FastAPI Backend
│   ├── app/                # Application Source
│   │   ├── analysis/       # AI & Rules Logic
│   │   ├── blockchain/     # Web3 Integration
│   │   ├── core/           # Config & Startup
│   │   └── auth/           # Authentication
│   ├── run_server.py       # Entry Point
│   └── requirements.txt    # Python Dependencies
├── frontend/               # React (Vite) Frontend
│   ├── src/                # UI Components & Pages
│   └── package.json        # JS Dependencies
└── README.md               # Project Documentation
```

## 🛠️ Setup Instructions

### Backend (Python/FastAPI)

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create a virtual environment:
    ```bash
    python -m venv .venv
    ```
3.  Activate the environment:
    *   Windows: `.\.venv\Scripts\activate`
    *   Mac/Linux: `source .venv/bin/activate`
4.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5.  Configure Environment:
    *   Copy `.env.example` to `.env`.
    *   Fill in your `GEMINI_API_KEY`, `WALLET_PRIVATE_KEY` and other credentials.
6.  Run the server:
    ```bash
    python run_server.py
    ```

### Frontend (React/Vite)

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```

## 💻 Tech Stack

*   **Backend**: FastAPI, Python 3.11
*   **AI**: Google Gemini 2.0 Flash
*   **Blockchain**: Polygon (Amoy Testnet), Web3.py
*   **Frontend**: React, Vite, TailwindCSS
*   **Database**: Firebase (Auth & Firestore)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
