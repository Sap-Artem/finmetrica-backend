import { useState, useEffect, useCallback } from "react";
import { fetchApi } from "../api/client";
import { useToast } from "../hooks/useToast";

export default function Limits() {
    const [categories, setCategories] = useState([]);
    const [progressData, setProgressData] = useState([]);
    const [form, setForm] = useState({ amount: "", category_id: "" });
    const { addToast } = useToast();

    const loadData = useCallback(async () => {
        const cats = await fetchApi("/budget/categories");
        setCategories(cats);
        if (cats.length > 0)
            setForm((prev) =>
                prev.category_id ? prev : { ...prev, category_id: cats[0].id },
            );
        const prog = await fetchApi("/budget/limits/progress");
        setProgressData(prog.progress || []);
    }, []);

    useEffect(() => {
        Promise.resolve().then(() => loadData());
    }, [loadData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.amount || !form.category_id)
            return addToast("Заполните поля", "error");
        const date = new Date();
        try {
            await fetchApi("/budget/limits", {
                method: "POST",
                body: JSON.stringify({
                    amount_limit: Math.round(form.amount * 100),
                    category_id: form.category_id,
                    start_date: new Date(date.getFullYear(), date.getMonth(), 1)
                        .toISOString()
                        .split("T")[0],
                    end_date: new Date(
                        date.getFullYear(),
                        date.getMonth() + 1,
                        0,
                    )
                        .toISOString()
                        .split("T")[0],
                }),
            });
            addToast("Лимит установлен!");
            setForm((prev) => ({ ...prev, amount: "" }));
            loadData();
        } catch (err) {
            addToast(err.message, "error");
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800">
                Бюджетные Лимиты
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col md:flex-row gap-4"
                >
                    <select
                        value={form.category_id}
                        onChange={(e) =>
                            setForm({ ...form, category_id: e.target.value })
                        }
                        className="p-3 bg-slate-50 border rounded-xl outline-none flex-1"
                    >
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        placeholder="Сумма (₽)"
                        required
                        value={form.amount}
                        onChange={(e) =>
                            setForm({ ...form, amount: e.target.value })
                        }
                        className="p-3 flex-1 bg-slate-50 border rounded-xl outline-none"
                    />
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700"
                    >
                        Задать лимит
                    </button>
                </form>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {progressData.map((item) => {
                    const catName =
                        categories.find((c) => c.id === item.category_id)
                            ?.name || "Неизвестно";
                    const percent = Math.min(
                        (item.amount_spent / item.amount_limit) * 100,
                        100,
                    ).toFixed(1);
                    return (
                        <div
                            key={item.limit_id}
                            className={`bg-white rounded-2xl shadow-sm border p-6 ${item.is_exceeded ? "border-rose-300 bg-rose-50/50" : "border-slate-200"}`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold">{catName}</h4>
                                {item.is_exceeded && (
                                    <span className="text-xs bg-rose-100 text-rose-600 px-2 py-1 rounded">
                                        Превышен
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 mb-4">
                                Потрачено{" "}
                                {(item.amount_spent / 100).toLocaleString()} ₽
                                из {(item.amount_limit / 100).toLocaleString()}{" "}
                                ₽
                            </p>
                            <div className="w-full bg-slate-100 rounded-full h-3">
                                <div
                                    className={`${item.is_exceeded ? "bg-rose-500" : "bg-indigo-500"} h-3 rounded-full transition-all`}
                                    style={{ width: `${percent}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
