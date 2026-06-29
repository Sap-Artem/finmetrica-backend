import { useState, useEffect, useCallback } from "react";
import { fetchApi } from "../api/client";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(!!token);

    const fetchUser = useCallback(async () => {
        if (!token) return;
        try {
            const data = await fetchApi("/auth/profile").catch(() =>
                fetchApi("/auth/me"),
            );
            setUser(data);
        } catch {
            setToken(null);
            setUser(null);
            localStorage.removeItem("token");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        Promise.resolve().then(() => fetchUser());
    }, [fetchUser]);

    const login = (newToken) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setLoading(true);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        setLoading(false);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                login,
                logout,
                loading,
                refreshUser: fetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
