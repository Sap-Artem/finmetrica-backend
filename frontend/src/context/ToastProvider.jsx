import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ToastContext } from "./ToastContext";

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = "success") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(
            () => setToasts((prev) => prev.filter((t) => t.id !== id)),
            3000,
        );
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right-8 bg-white ${t.type === "error" ? "border-rose-200" : "border-emerald-200"}`}
                    >
                        {t.type === "error" ? (
                            <AlertCircle className="w-5 h-5 text-rose-500" />
                        ) : (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        )}
                        <p className="text-sm font-medium text-slate-800">
                            {t.message}
                        </p>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
