import { useState } from "react";
import { BrainCircuit, Loader2, Lock } from "lucide-react";
import { fetchApi } from "../api/client";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

export default function AIAdvisor() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [advice, setAdvice] = useState(null);
    const { addToast } = useToast();

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const data = await fetchApi(
                "/invest/recommendation/generate?force=true",
            );
            setAdvice(data);
            addToast("Анализ завершен!");
        } catch (err) {
            addToast(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    if (!user?.risk_profile || user.risk_profile === "UNASSIGNED") {
        return (
            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <BrainCircuit className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            ИИ Советник
                        </h2>
                        <p className="text-slate-500">
                            Персональная финансовая стратегия
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center shadow-sm max-w-2xl mx-auto">
                    <Lock className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-bounce" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                        Доступ к ИИ временно ограничен
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                        Наш инвестиционный ИИ-ассистент не может рассчитать
                        подходящую стратегию, пока не определен ваш тип
                        инвестора и отношение к рискам.
                    </p>
                    <Link
                        to="/profile"
                        className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-md hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                    >
                        Пройти риск-тест в профиле
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <BrainCircuit className="w-7 h-7" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        ИИ Советник
                    </h2>
                    <p className="text-slate-500">Финансовая стратегия</p>
                </div>
            </div>

            {!advice && !loading && (
                <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center shadow-sm">
                    <BrainCircuit className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">
                        Готовы оптимизировать финансы?
                    </h3>
                    <button
                        onClick={handleGenerate}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 mt-6"
                    >
                        Сгенерировать стратегию
                    </button>
                </div>
            )}

            {loading && (
                <div className="bg-white rounded-3xl p-10 border text-center shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                    <Loader2 className="animate-spin w-12 h-12 text-indigo-600 mb-4" />
                    <h3 className="text-lg font-bold">Анализируем...</h3>
                </div>
            )}

            {advice && !loading && (
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6 pb-6 border-b">
                        <div>
                            <p className="text-sm font-semibold text-indigo-600 uppercase mb-1">
                                Профицит
                            </p>
                            <p className="text-3xl font-bold">
                                {(advice.surplus / 100).toLocaleString("ru-RU")}{" "}
                                ₽
                            </p>
                        </div>
                        <button
                            onClick={handleGenerate}
                            className="text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg font-medium"
                        >
                            Обновить
                        </button>
                    </div>
                    <div className="prose max-w-none">
                        {advice.ai_text.split("\n").map((para, idx) => (
                            <p key={idx} className="text-slate-700 mb-4">
                                {para}
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
