import { useState, useEffect, useCallback } from "react";
import { fetchApi } from "../api/client";
import { useToast } from "../hooks/useToast";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState("");
    const { addToast } = useToast();

    const loadData = useCallback(
        () => fetchApi("/budget/categories").then(setCategories),
        [],
    );
    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) return;
        try {
            await fetchApi("/budget/categories", {
                method: "POST",
                body: JSON.stringify({ name }),
            });
            addToast("Категория добавлена");
            setName("");
            loadData();
        } catch (err) {
            addToast(err.message, "error");
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800">Категории</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <form onSubmit={handleSubmit} className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Название категории"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="p-3 flex-1 bg-slate-50 border rounded-xl outline-none"
                    />
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
                    >
                        Добавить
                    </button>
                </form>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {categories.map((c) => (
                    <div key={c.id} className="p-4 font-medium text-slate-700">
                        {c.name}{" "}
                        {c.is_system && (
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded ml-2">
                                Системная
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
