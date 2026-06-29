import { useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchApi } from "../api/client";
import { useToast } from "../hooks/useToast";

export default function RegisterForm({ onSwitch }) {
    const [form, setForm] = useState({ email: "", username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetchApi("/auth/register", {
                method: "POST",
                body: JSON.stringify(form),
            });
            addToast("Аккаунт создан! Войдите.");
            onSwitch();
        } catch (err) {
            addToast(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    required
                    value={form.email}
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                    type="text"
                    placeholder="Никнейм"
                    required
                    value={form.username}
                    onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    required
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition flex justify-center"
                >
                    {loading ? (
                        <Loader2 className="animate-spin w-6 h-6" />
                    ) : (
                        "Зарегистрироваться"
                    )}
                </button>
            </form>
            <p className="text-center text-slate-500 mt-4">
                Уже с нами?{" "}
                <button
                    onClick={onSwitch}
                    className="text-indigo-600 font-bold hover:underline"
                >
                    Войти
                </button>
            </p>
        </>
    );
}
