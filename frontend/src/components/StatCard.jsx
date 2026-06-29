export default function StatCard({ title, amount, icon: Icon, color, bg }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${bg} ${color}`}
            >
                <Icon className="w-7 h-7" />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">
                    {title}
                </p>
                <h3 className="text-2xl font-bold text-slate-800">
                    {amount.toLocaleString("ru-RU")} ₽
                </h3>
            </div>
        </div>
    );
}
