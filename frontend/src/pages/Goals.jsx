import { useState, useEffect, useCallback } from "react";
import { fetchApi } from "../api/client";
import { useToast } from "../hooks/useToast";
import { Target, Coins } from "lucide-react";

export default function Goals() {
    const [goals, setGoals] = useState([]);
    const [form, setForm] = useState({ title: "", amount: "", date: "" });
    const [fundingGoalId, setFundingGoalId] = useState(null); // ID цели для которой открыто поле ввода
    const [fundAmount, setFundAmount] = useState("");
    const { addToast } = useToast();

    const loadGoals = useCallback(
        () => fetchApi("/budget/goals").then(setGoals),
        [],
    );

    useEffect(() => {
        Promise.resolve().then(() => loadGoals());
    }, [loadGoals]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.amount || !form.date) return;
        try {
            await fetchApi("/budget/goals", {
                method: "POST",
                body: JSON.stringify({
                    title: form.title,
                    target_amount: Math.round(form.amount * 100),
                    target_date: form.date,
                }),
            });
            addToast("Цель успешно добавлена!");
            setForm({ title: "", amount: "", date: "" });
            loadGoals();
        } catch (err) {
            addToast(err.message, "error");
        }
    };

    const handleFundSubmit = async (e, id) => {
        e.preventDefault();
        if (!fundAmount || isNaN(fundAmount) || Number(fundAmount) <= 0)
            return addToast("Некорректная сумма", "error");

        const goal = goals.find((g) => g.id === id);
        if (!goal) return;

        // Рассчитываем новую сумму в копейках
        const addedCents = Math.round(Number(fundAmount) * 100);
        const updatedCurrentAmount =
            Number(goal.current_amount || 0) + addedCents;

        try {
            // ИСПРАВЛЕНО: Вместо несуществующего на бэкенде /fund, используем стандартный PUT /goals/{id}
            // и передаем обновленный объект с инкрементированным current_amount. Это решает ошибку 404!
            await fetchApi(`/budget/goals/${id}`, {
                method: "PUT",
                body: JSON.stringify({
                    title: goal.title,
                    target_amount: goal.target_amount,
                    current_amount: updatedCurrentAmount,
                    target_date: goal.target_date,
                }),
            });
            addToast("Копилка успешно пополнена!");
            setFundAmount("");
            setFundingGoalId(null);
            loadGoals();
        } catch (err) {
            addToast(
                err.message || "Ошибка пополнения. Попробуйте снова.",
                "error",
            );
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить цель?")) return;
        try {
            await fetchApi(`/budget/goals/${id}`, { method: "DELETE" });
            addToast("Цель удалена");
            loadGoals();
        } catch (err) {
            addToast(err.message, "error");
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <h2 className="text-2xl font-bold text-slate-800">
                Финансовые цели
            </h2>

            {/* Создание цели */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                    <Target className="text-indigo-600" /> На что откладываем?
                </h3>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col lg:flex-row gap-4"
                >
                    <input
                        type="text"
                        placeholder="Название цели (например, Квартира)"
                        required
                        value={form.title}
                        onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                        }
                        className="p-3 flex-1 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                        type="number"
                        placeholder="Целевая сумма (₽)"
                        required
                        value={form.amount}
                        onChange={(e) =>
                            setForm({ ...form, amount: e.target.value })
                        }
                        className="p-3 w-full lg:w-48 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                        type="date"
                        required
                        value={form.date}
                        onChange={(e) =>
                            setForm({ ...form, date: e.target.value })
                        }
                        className="p-3 w-full lg:w-48 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition font-medium"
                    >
                        Создать
                    </button>
                </form>
            </div>

            {/* Список целей */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map((goal) => {
                    const progress = Math.min(
                        (goal.current_amount / goal.target_amount) * 100,
                        100,
                    ).toFixed(1);
                    const isFunding = fundingGoalId === goal.id;

                    return (
                        <div
                            key={goal.id}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col relative group transition-all duration-300 hover:shadow-md"
                        >
                            <button
                                onClick={() => handleDelete(goal.id)}
                                className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 hidden group-hover:block transition"
                            >
                                ✕
                            </button>

                            <div className="flex justify-between items-start mb-4 pr-6">
                                <h4 className="font-bold text-lg text-slate-800">
                                    {goal.title}
                                </h4>
                                <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md">
                                    До {goal.target_date}
                                </span>
                            </div>

                            <div className="mb-2 flex justify-between text-sm">
                                <span className="text-slate-500">
                                    Собрано:{" "}
                                    <strong className="text-slate-800">
                                        {(
                                            goal.current_amount / 100
                                        ).toLocaleString()}{" "}
                                        ₽
                                    </strong>
                                </span>
                                <span className="text-slate-500">
                                    Цель:{" "}
                                    <strong className="text-slate-800">
                                        {(
                                            goal.target_amount / 100
                                        ).toLocaleString()}{" "}
                                        ₽
                                    </strong>
                                </span>
                            </div>

                            <div className="w-full bg-slate-100 rounded-full h-3 mb-6">
                                <div
                                    className="bg-emerald-500 h-3 rounded-full transition-all duration-500 animate-pulse"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>

                            {/* Интерактивное пополнение внутри карточки */}
                            {isFunding ? (
                                <form
                                    onSubmit={(e) =>
                                        handleFundSubmit(e, goal.id)
                                    }
                                    className="space-y-3 animate-in slide-in-from-top-2 duration-200"
                                >
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Сумма (₽)"
                                            required
                                            value={fundAmount}
                                            onChange={(e) =>
                                                setFundAmount(e.target.value)
                                            }
                                            className="p-2 flex-1 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm focus:ring-1 focus:ring-indigo-500"
                                        />
                                        <button
                                            type="submit"
                                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
                                        >
                                            Внести
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFundingGoalId(null)
                                            }
                                            className="bg-slate-100 text-slate-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200"
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <button
                                    onClick={() => {
                                        setFundingGoalId(goal.id);
                                        setFundAmount("");
                                    }}
                                    className="mt-auto w-full py-2.5 bg-slate-50 hover:bg-indigo-50 text-indigo-600 font-semibold rounded-xl border border-slate-100 hover:border-indigo-100 transition flex items-center justify-center gap-1.5"
                                >
                                    <Coins className="w-5 h-5" /> Пополнить
                                    копилку
                                </button>
                            )}
                        </div>
                    );
                })}
                {goals.length === 0 && (
                    <p className="text-slate-400 text-sm italic col-span-2 text-center py-10">
                        Финансовые цели не установлены.
                    </p>
                )}
            </div>
        </div>
    );
}
