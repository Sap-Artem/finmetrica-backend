import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { fetchApi } from "../api/client";
import { useToast } from "../hooks/useToast";
import TransactionRow from "../components/TransactionRow";

export default function Transactions() {
    const [data, setData] = useState({
        transactions: [],
        accounts: [],
        categories: [],
    });
    const [form, setForm] = useState({
        amount: "",
        type: "EXPENSE",
        note: "",
        account_id: "",
        category_id: "",
    });
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const loadData = useCallback(async () => {
        const [txs, accs, cats] = await Promise.all([
            fetchApi("/budget/transactions"),
            fetchApi("/budget/accounts"),
            fetchApi("/budget/categories"),
        ]);
        setData({ transactions: txs, accounts: accs, categories: cats });
        setForm((prev) =>
            prev.account_id
                ? prev
                : { ...prev, account_id: accs.length > 0 ? accs[0].id : "" },
        );
    }, []);

    useEffect(() => {
        Promise.resolve().then(() => loadData());
    }, [loadData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.amount || form.amount <= 0)
            return addToast("Некорректная сумма", "error");
        if (!form.account_id)
            return addToast("Сначала создайте счет!", "error");

        setLoading(true);
        try {
            await fetchApi("/budget/transactions", {
                method: "POST",
                body: JSON.stringify({
                    amount: Math.round(form.amount * 100),
                    type: form.type,
                    note: form.note,
                    account_id: form.account_id,
                    category_id: form.category_id || null,
                }),
            });
            addToast("Транзакция добавлена");
            setForm((prev) => ({ ...prev, amount: "", note: "" }));
            loadData();
        } catch (err) {
            addToast(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await fetchApi(`/budget/transactions/${id}`, { method: "DELETE" });
            addToast("Транзакция удалена");
            loadData();
        } catch (err) {
            addToast(err.message, "error");
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800">Транзакции</h2>
            {data.accounts.length === 0 ? (
                <div className="bg-amber-50 text-amber-800 p-4 rounded-xl">
                    Создайте счет для добавления транзакций.
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex flex-col md:flex-row gap-4">
                            <select
                                value={form.type}
                                onChange={(e) =>
                                    setForm({ ...form, type: e.target.value })
                                }
                                className="p-3 bg-slate-50 border rounded-xl outline-none"
                            >
                                <option value="EXPENSE">Расход</option>
                                <option value="INCOME">Доход</option>
                            </select>
                            <select
                                value={form.account_id}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        account_id: e.target.value,
                                    })
                                }
                                className="p-3 bg-slate-50 border rounded-xl outline-none flex-1"
                            >
                                {data.accounts.map((acc) => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.name} ({acc.balance / 100} ₽)
                                    </option>
                                ))}
                            </select>
                            <select
                                value={form.category_id}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        category_id: e.target.value,
                                    })
                                }
                                className="p-3 bg-slate-50 border rounded-xl outline-none flex-1"
                            >
                                <option value="">Без категории</option>
                                {data.categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Сумма (₽)"
                                required
                                value={form.amount}
                                onChange={(e) =>
                                    setForm({ ...form, amount: e.target.value })
                                }
                                className="p-3 w-full md:w-1/3 bg-slate-50 border rounded-xl outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Описание"
                                value={form.note}
                                onChange={(e) =>
                                    setForm({ ...form, note: e.target.value })
                                }
                                className="p-3 flex-1 bg-slate-50 border rounded-xl outline-none"
                            />
                            <button
                                disabled={loading}
                                type="submit"
                                className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 flex justify-center"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin w-5 h-5" />
                                ) : (
                                    <Plus />
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {data.transactions.map((tx) => (
                    <div
                        key={tx.id}
                        className="flex items-center justify-between hover:bg-slate-50 pr-4"
                    >
                        <TransactionRow tx={tx} />
                        <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-2 text-slate-400 hover:text-rose-600"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
