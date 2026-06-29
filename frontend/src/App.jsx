import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { ToastProvider } from "./context/ToastProvider";
import { useAuth } from "./hooks/useAuth";

import MainLayout from "./layouts/MainLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Limits from "./pages/Limits";
import Goals from "./pages/Goals";
import AIAdvisor from "./pages/AIAdvisor";
import Profile from "./pages/Profile";

const PrivateRoute = ({ children }) => {
    const { token, loading } = useAuth();
    if (loading) return null;
    return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
    const { token, loading } = useAuth();
    if (loading) return null;
    return !token ? children : <Navigate to="/" replace />;
};

export default function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <Auth />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/"
                            element={
                                <PrivateRoute>
                                    <MainLayout />
                                </PrivateRoute>
                            }
                        >
                            <Route index element={<Dashboard />} />
                            <Route path="accounts" element={<Accounts />} />
                            <Route
                                path="transactions"
                                element={<Transactions />}
                            />
                            <Route path="limits" element={<Limits />} />
                            <Route path="goals" element={<Goals />} />
                            <Route path="ai" element={<AIAdvisor />} />
                            <Route path="profile" element={<Profile />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ToastProvider>
    );
}
