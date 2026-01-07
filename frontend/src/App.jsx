import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UploadContract from "./pages/UploadContract";
import AnalysisResult from "./pages/AnalysisResult";
import BlockchainProof from "./pages/BlockchainProof";
import VerifyContract from "./pages/VerifyContract";
import History from "./pages/History";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Default to login */}
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    {/* Public */}
                    <Route path="/login" element={<Login />} />

                    {/* Dashboard & App Pages (Protected) */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Dashboard />
                            </AppLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/analysis" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <UploadContract />
                            </AppLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/analysis-result" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <AnalysisResult />
                            </AppLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/proof" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <BlockchainProof />
                            </AppLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/verify" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <VerifyContract />
                            </AppLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/history" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <History />
                            </AppLayout>
                        </ProtectedRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
