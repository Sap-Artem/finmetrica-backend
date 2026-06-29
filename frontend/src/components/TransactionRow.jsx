import { TrendingUp, TrendingDown } from "lucide-react";

export default function TransactionRow({ tx }) {
    const isIncome = tx.type === "INCOME";

    const displayNote =
        tx.note || (isIncome ? "Пополнение баланса" : "Расход без описания");

    return (
        <div className="flex items-center gap-4 p-4">
            <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${isIncome ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
            >
                {isIncome ? (
                    <TrendingUp className="w-6 h-6" />
                ) : (
                    <TrendingDown className="w-6 h-6" />
                )}
            </div>
            <div className="flex-1">
                <p className="font-semibold text-slate-800 text-sm md:text-base">
                    {displayNote}
                </p>
                <p className="text-xs text-slate-400">
                    {new Date(tx.date).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </p>
            </div>
            <div
                className={`font-bold text-base md:text-lg shrink-0 ${isIncome ? "text-emerald-600" : "text-slate-800"}`}
            >
                {isIncome ? "+" : "-"}
                {(tx.amount / 100).toLocaleString("ru-RU")} ₽
            </div>
        </div>
    );
}
