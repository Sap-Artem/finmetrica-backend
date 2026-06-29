export default function PieChart({ data }) {
    const total = data.reduce((sum, item) => sum + Number(item.total || 0), 0);

    if (!data.length || total === 0) {
        return (
            <p className="text-slate-400 text-sm italic text-center py-6">
                Нет данных для построения диаграммы расходов
            </p>
        );
    }

    const colors = [
        "#4f46e5",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#06b6d4",
        "#64748b",
        "#ec4899",
    ];

    const gradient = data
        .map((item, index) => {
            const prevSum = data
                .slice(0, index)
                .reduce((sum, d) => sum + Number(d.total || 0), 0);
            const start = (prevSum / total) * 100;
            const percent = (Number(item.total || 0) / total) * 100;
            const end = start + percent;
            return `${colors[index % colors.length]} ${start}% ${end}%`;
        })
        .join(", ");

    return (
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center my-6">
            <div
                className="w-44 h-44 rounded-full flex items-center justify-center relative shadow-inner shrink-0"
                style={{ background: `conic-gradient(${gradient})` }}
            >
                <div className="absolute w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center text-center shadow-sm">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Всего
                    </span>
                    <strong className="text-lg font-bold text-slate-800">
                        {(total / 100).toLocaleString("ru-RU")} ₽
                    </strong>
                </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
                {data.map((item, index) => {
                    const percent = (
                        (Number(item.total || 0) / total) *
                        100
                    ).toFixed(1);
                    return (
                        <div
                            className="flex items-center justify-between text-sm font-medium text-slate-600"
                            key={item.category || item.category_id || index}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{
                                        background:
                                            colors[index % colors.length],
                                    }}
                                />
                                <span className="truncate max-w-[150px]">
                                    {item.category ||
                                        item.category_name ||
                                        "Категория"}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-slate-400 font-normal">
                                    ({percent}%)
                                </span>
                                <span className="text-slate-800">
                                    {(
                                        Number(item.total || 0) / 100
                                    ).toLocaleString("ru-RU")}{" "}
                                    ₽
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
