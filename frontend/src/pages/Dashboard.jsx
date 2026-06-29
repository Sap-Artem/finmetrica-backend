import { useState, useEffect, useCallback } from "react";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Loader2,
    Sparkles,
    HeartPulse,
    CheckCircle,
    AlertTriangle,
} from "lucide-react";
import { fetchApi } from "../api/client";
import StatCard from "../components/StatCard";
import PieChart from "../components/PieChart";

export default function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("month");
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [aiRecommendation, setAiRecommendation] = useState(null);

    const loadTransactionsByPeriod = useCallback(async (selectedPeriod) => {
        const today = new Date();
        let dateFrom = null;

        if (selectedPeriod === "today") dateFrom = today;
        if (selectedPeriod === "week") {
            dateFrom = new Date();
            dateFrom.setDate(today.getDate() - 7);
        }
        if (selectedPeriod === "month")
            dateFrom = new Date(today.getFullYear(), today.getMonth(), 1);

        const params = {};
        if (dateFrom) params.date_from = dateFrom.toISOString().slice(0, 10);
        if (selectedPeriod !== "all")
            params.date_to = today.toISOString().slice(0, 10);

        const query = new URLSearchParams(params).toString();
        try {
            const txs = await fetchApi(
                `/budget/transactions${query ? `?${query}` : ""}`,
            );
            setFilteredTransactions(txs);
        } catch {
            /* Игнорируем */
        }
    }, []);

    const loadDashboardData = useCallback(async () => {
        try {
            const [dash, ai] = await Promise.all([
                fetchApi("/budget/dashboard"),
                fetchApi("/invest/recommendation/generate").catch(() => null),
            ]);
            setDashboard(dash);
            if (ai) setAiRecommendation(ai);
        } catch {
            /* Игнорируем */
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        Promise.resolve().then(() => {
            loadDashboardData();
            loadTransactionsByPeriod(period);
        });
    }, [loadDashboardData, loadTransactionsByPeriod, period]);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-slate-500 gap-3">
                <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
                <span className="font-medium text-sm">
                    Сборка финансового дашборда...
                </span>
            </div>
        );
    }

    // Сортировка лимитов: превышенные вверх для привлечения внимания
    const exceededLimits =
        dashboard?.limits_progress?.filter((l) => l.is_exceeded) || [];
    const normalLimits =
        dashboard?.limits_progress?.filter((l) => !l.is_exceeded) || [];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800">
                Обзор финансов
            </h2>

            {/* Статистика */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Баланс"
                    amount={(dashboard?.total_balance || 0) / 100}
                    icon={Wallet}
                    color="text-indigo-600"
                    bg="bg-indigo-50"
                />
                <StatCard
                    title="Доход (мес)"
                    amount={(dashboard?.month_income || 0) / 100}
                    icon={TrendingUp}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
                <StatCard
                    title="Расход (мес)"
                    amount={(dashboard?.month_expense || 0) / 100}
                    icon={TrendingDown}
                    color="text-rose-600"
                    bg="bg-rose-50"
                />
                <StatCard
                    title="Профицит"
                    amount={(dashboard?.month_surplus || 0) / 100}
                    icon={Sparkles}
                    color="text-violet-600"
                    bg="bg-violet-50"
                />
            </div>

            {/* Оценка финансового здоровья */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-50/30 rounded-bl-full pointer-events-none" />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <HeartPulse className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">
                                Финансовое благополучие
                            </h3>
                            <p className="text-xs text-slate-400">
                                Интеллектуальный индекс стабильности вашего
                                личного бюджета.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-2 shrink-0">
                        <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
                            Индекс:
                        </span>
                        <strong className="text-3xl font-extrabold text-indigo-600">
                            {aiRecommendation?.analysis?.financial_score ?? "—"}
                        </strong>
                        <span className="text-xs text-indigo-400">/100</span>
                    </div>
                </div>

                {aiRecommendation?.analysis ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 border-t border-slate-100 pt-4 text-sm">
                        <div className="space-y-2">
                            <h4 className="font-bold text-emerald-600 flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4" /> Сильные
                                стороны
                            </h4>
                            {aiRecommendation.analysis.score_reasons_positive.map(
                                (item) => (
                                    <p
                                        className="text-slate-600 pl-5 relative before:content-['•'] before:absolute before:left-1 before:text-emerald-500"
                                        key={item}
                                    >
                                        {item}
                                    </p>
                                ),
                            )}
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-amber-600 flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4" /> Что
                                улучшить
                            </h4>
                            {aiRecommendation.analysis.score_reasons_negative.map(
                                (item) => (
                                    <p
                                        className="text-slate-600 pl-5 relative before:content-['•'] before:absolute before:left-1 before:text-amber-500"
                                        key={item}
                                    >
                                        {item}
                                    </p>
                                ),
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-500 text-sm mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                        Пройдите детальный опрос во вкладке «Профиль» и
                        сгенерируйте стратегию во вкладке «ИИ Советник», чтобы
                        сформировать финансовый отчет.
                    </p>
                )}
            </div>

            {/* Графики и Расходы */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">
                        Расходы по категориям
                    </h3>
                    <PieChart data={dashboard?.expenses_by_category || []} />
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                        Лимиты бюджета
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                        Текущий прогресс установленных ежемесячных лимитов.
                    </p>
                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[350px] pr-1">
                        {exceededLimits.map((limit) => (
                            <div
                                key={limit.limit_id}
                                className="bg-rose-50/50 border border-rose-100 rounded-xl p-3.5 space-y-1.5"
                            >
                                <div className="flex justify-between text-sm font-semibold">
                                    <span className="text-rose-700">
                                        {limit.category_name}
                                    </span>
                                    <span className="text-rose-600">
                                        {(
                                            limit.amount_spent / 100
                                        ).toLocaleString()}{" "}
                                        ₽ /{" "}
                                        {(
                                            limit.amount_limit / 100
                                        ).toLocaleString()}{" "}
                                        ₽
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5">
                                    <div
                                        className="h-2.5 rounded-full transition-all bg-rose-500"
                                        style={{
                                            width: `${Math.min(limit.progress_percent, 100)}%`,
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-rose-500 font-bold flex items-center gap-1">
                                    Лимит превышен на{" "}
                                    {(
                                        (limit.amount_spent -
                                            limit.amount_limit) /
                                        100
                                    ).toLocaleString()}{" "}
                                    ₽!
                                </p>
                            </div>
                        ))}

                        {/* Затем нормальные */}
                        {normalLimits.map((limit) => (
                            <div
                                key={limit.limit_id}
                                className="space-y-1.5 p-2 border border-transparent"
                            >
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-slate-700 font-semibold">
                                        {limit.category_name}
                                    </span>
                                    <span className="text-slate-500">
                                        {(
                                            limit.amount_spent / 100
                                        ).toLocaleString()}{" "}
                                        ₽ /{" "}
                                        {(
                                            limit.amount_limit / 100
                                        ).toLocaleString()}{" "}
                                        ₽
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full transition-all bg-indigo-500"
                                        style={{
                                            width: `${Math.min(limit.progress_percent, 100)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}

                        {(!dashboard?.limits_progress ||
                            dashboard.limits_progress.length === 0) && (
                            <p className="text-slate-400 text-sm italic text-center py-10">
                                Лимиты еще не настроены.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Операции и Цели */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800">
                            Транзакции за период
                        </h3>
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="p-2 border border-slate-200 rounded-xl text-sm bg-slate-50"
                        >
                            <option value="today">Сегодня</option>
                            <option value="week">За неделю</option>
                            <option value="month">За месяц</option>
                            <option value="all">Все транзакции</option>
                        </select>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
                        {filteredTransactions.map((t) => {
                            const isIncome = t.type === "INCOME";
                            return (
                                <div
                                    className="flex justify-between items-center py-3"
                                    key={t.id}
                                >
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">
                                            {t.note ||
                                                (isIncome
                                                    ? "Пополнение баланса"
                                                    : "Расход без описания")}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(
                                                t.date,
                                            ).toLocaleDateString("ru-RU")}
                                        </p>
                                    </div>
                                    <b
                                        className={`text-sm ${isIncome ? "text-emerald-600" : "text-slate-800"}`}
                                    >
                                        {isIncome ? "+" : "-"}
                                        {(t.amount / 100).toLocaleString(
                                            "ru-RU",
                                        )}{" "}
                                        ₽
                                    </b>
                                </div>
                            );
                        })}
                        {filteredTransactions.length === 0 && (
                            <p className="text-slate-400 text-sm text-center py-8">
                                Нет операций за выбранный период.
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">
                        Финансовые цели
                    </h3>
                    <div className="space-y-4">
                        {dashboard?.goals?.map((g) => (
                            <div key={g.id} className="space-y-1">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-slate-700 font-semibold">
                                        {g.title}
                                    </span>
                                    <span className="text-slate-500">
                                        {(
                                            g.current_amount / 100
                                        ).toLocaleString()}{" "}
                                        ₽ /{" "}
                                        {(
                                            g.target_amount / 100
                                        ).toLocaleString()}{" "}
                                        ₽
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div
                                        className="bg-emerald-500 h-2 rounded-full transition-all"
                                        style={{
                                            width: `${Math.min(g.progress_percent, 100)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                        {(!dashboard?.goals ||
                            dashboard.goals.length === 0) && (
                            <p className="text-slate-400 text-sm italic text-center py-8">
                                Инвестиционные цели еще не добавлены.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
