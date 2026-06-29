import { useState, useEffect, useCallback } from "react";
import { CreditCard, Plus } from "lucide-react";
import { fetchApi } from "../api/client";
import { useToast } from "../hooks/useToast";

export default function Accounts() {
    const [accounts, setAccounts] = useState([]);
    const [form, setForm] = useState({
        name: "",
        type: "CASH",
        currency: "RUB",
        balance: 0,
    });
    const { addToast } = useToast();

    const loadAccounts = useCallback(
        () => fetchApi("/budget/accounts").then(setAccounts),
        [],
    );

    useEffect(() => {
        Promise.resolve().then(() => loadAccounts());
    }, [loadAccounts]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name) return;
        try {
            await fetchApi("/budget/accounts", {
                method: "POST",
                body: JSON.stringify({
                    ...form,
                    balance: Number(form.balance) * 100,
                }),
            });
            addToast("Счет успешно создан!");
            setForm({ name: "", type: "CASH", currency: "RUB", balance: 0 });
            loadAccounts();
        } catch (err) {
            addToast(err.message, "error");
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800">Мои Счета</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col md:flex-row gap-4"
                >
                    <input
                        type="text"
                        placeholder="Название счета"
                        required
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                        className="p-3 flex-1 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                    <select
                        value={form.type}
                        onChange={(e) =>
                            setForm({ ...form, type: e.target.value })
                        }
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    >
                        <option value="CASH">Наличные</option>
                        <option value="DEBIT_CARD">Дебетовая карта</option>
                        <option value="CREDIT_CARD">Кредитная карта</option>
                        <option value="DEPOSIT">Вклад</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Стартовый баланс (₽)"
                        value={form.balance}
                        onChange={(e) =>
                            setForm({ ...form, balance: e.target.value })
                        }
                        className="p-3 w-full md:w-44 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 flex items-center justify-center"
                    >
                        <Plus className="w-5 h-5" /> Создать
                    </button>
                </form>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accounts.map((acc) => (
                    <div
                        key={acc.id}
                        className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden"
                    >
                        <CreditCard className="w-12 h-12 text-white/20 absolute right-4 bottom-4" />
                        <p className="text-indigo-100 text-sm font-medium mb-1">
                            {acc.type}
                        </p>
                        <h4 className="text-xl font-bold mb-6">{acc.name}</h4>
                        <p className="text-3xl font-bold">
                            {(acc.balance / 100).toLocaleString("ru-RU")} ₽
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
