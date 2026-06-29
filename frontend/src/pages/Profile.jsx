import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { fetchApi } from "../api/client";
import { useToast } from "../hooks/useToast";
import {
    ShieldAlert,
    Activity,
    Flame,
    User,
    ShieldCheck,
    Landmark,
    CheckCircle,
} from "lucide-react";

export default function Profile() {
    const { user, refreshUser } = useAuth();
    const { addToast } = useToast();

    // Активная вкладка: "test" (риск-тест) или "info" (детальная анкета)
    const [activeTab, setActiveTab] = useState("test");

    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
        age: "",
        employment_confidence: "",
        income_stability: "",
        risk_tolerance: "",
        investment_horizon: "",
        investment_experience: "",
        dependents_count: "",
        has_emergency_fund: false,
        preferred_assets: "",
    });

    useEffect(() => {
        if (user) {
            Promise.resolve().then(() => {
                setProfile({
                    first_name: user.first_name || "",
                    last_name: user.last_name || "",
                    age: user.age || "",
                    employment_confidence: user.employment_confidence || "",
                    income_stability: user.income_stability || "",
                    risk_tolerance: user.risk_tolerance || "",
                    investment_horizon: user.investment_horizon || "",
                    investment_experience: user.investment_experience || "",
                    dependents_count:
                        user.dependents_count !== null
                            ? user.dependents_count
                            : "",
                    has_emergency_fund: user.has_emergency_fund || false,
                    preferred_assets: user.preferred_assets || "",
                });
            });
        }
    }, [user]);

    const saveProfile = async (e) => {
        e.preventDefault();
        try {
            await fetchApi("/auth/profile", {
                method: "PUT",
                body: JSON.stringify({
                    first_name: profile.first_name || null,
                    last_name: profile.last_name || null,
                    age: profile.age ? Number(profile.age) : null,
                    employment_confidence: profile.employment_confidence
                        ? Number(profile.employment_confidence)
                        : null,
                    risk_tolerance: profile.risk_tolerance
                        ? Number(profile.risk_tolerance)
                        : null,
                    investment_horizon: profile.investment_horizon || null,
                    investment_experience:
                        profile.investment_experience || null,
                    income_stability: profile.income_stability
                        ? Number(profile.income_stability)
                        : null,
                    dependents_count:
                        profile.dependents_count !== ""
                            ? Number(profile.dependents_count)
                            : null,
                    has_emergency_fund:
                        profile.has_emergency_fund === true ||
                        profile.has_emergency_fund === "true",
                    preferred_assets: profile.preferred_assets || null,
                }),
            });
            addToast("Профиль успешно сохранен!");
            refreshUser();
        } catch (err) {
            addToast(err.message, "error");
        }
    };

    const handleTestSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const score =
            parseInt(formData.get("q1")) +
            parseInt(formData.get("q2")) +
            parseInt(formData.get("q3"));
        let determinedProfile = "MODERATE";
        if (score <= 4) determinedProfile = "CONSERVATIVE";
        if (score >= 8) determinedProfile = "AGGRESSIVE";

        try {
            await fetchApi("/invest/risk-test", {
                method: "POST",
                body: JSON.stringify({
                    answers_json: JSON.stringify(Object.fromEntries(formData)),
                    score,
                    determined_profile: determinedProfile,
                }),
            });
            addToast(`Новый риск-профиль сохранен: ${determinedProfile}`);
            refreshUser();
        } catch (err) {
            addToast(err.message, "error");
        }
    };

    const getProfileInfo = (p) => {
        switch (p) {
            case "CONSERVATIVE":
                return {
                    icon: ShieldCheck,
                    color: "text-emerald-500",
                    bg: "bg-emerald-50",
                    border: "border-emerald-200",
                    text: "Консервативный инвестор. Приоритет — гарантированное сбережение средств и нулевые просадки.",
                };
            case "AGGRESSIVE":
                return {
                    icon: Flame,
                    color: "text-rose-500",
                    bg: "bg-rose-50",
                    border: "border-rose-200",
                    text: "Агрессивный инвестор. Стремление к сверхдоходам, готовность к временным рыночным колебаниям.",
                };
            case "MODERATE":
                return {
                    icon: Activity,
                    color: "text-amber-500",
                    bg: "bg-amber-50",
                    border: "border-amber-200",
                    text: "Умеренный инвестор. Сбалансированный портфель, оптимальная пропорция риска и роста.",
                };
            default:
                return {
                    icon: ShieldAlert,
                    color: "text-slate-500",
                    bg: "bg-slate-50",
                    border: "border-slate-200",
                    text: "Риск-профиль еще не определен. Пройдите опрос на вкладке ниже!",
                };
        }
    };

    const pInfo = getProfileInfo(user?.risk_profile);
    const PIcon = pInfo.icon;

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <h2 className="text-2xl font-bold text-slate-800">
                Профиль инвестора
            </h2>

            {/* Информационная визитка пользователя */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-20 h-24 md:h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-4xl shrink-0">
                    {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 w-full text-center md:text-left">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-800">
                            {user?.username}
                        </h3>
                        <p className="text-slate-400 text-sm mt-0.5">
                            {user?.email}
                        </p>
                    </div>

                    <div
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center sm:items-start gap-4 text-left ${pInfo.bg} ${pInfo.border}`}
                    >
                        <div
                            className={`p-3 rounded-lg shrink-0 bg-white shadow-sm ${pInfo.color}`}
                        >
                            <PIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                                Ваш Риск-Профиль
                            </p>
                            <p className="font-extrabold text-slate-800 text-lg">
                                {user?.risk_profile || "НЕ ОПРЕДЕЛЕН"}
                            </p>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                {pInfo.text}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Профессиональные Переключатели (Вкладки) */}
            <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-4 border-t border-x">
                <button
                    onClick={() => setActiveTab("test")}
                    className={`pb-4 px-6 font-bold text-sm border-b-2 transition-all duration-200 ${activeTab === "test" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                >
                    Шаг 1: Тест на риск-профиль
                </button>
                <button
                    onClick={() => setActiveTab("info")}
                    className={`pb-4 px-6 font-bold text-sm border-b-2 transition-all duration-200 ${activeTab === "info" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                >
                    Шаг 2: Детальная анкета
                </button>
            </div>

            {/* Контент Вкладок */}
            {activeTab === "test" && (
                <div className="bg-white rounded-b-2xl border-x border-b p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
                    <div className="border-b pb-4 border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800">
                            Калькулятор инвестиционного риска
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Субъективный психологический опрос для определения
                            вашей готовности к рыночной волатильности.
                        </p>
                    </div>

                    {user?.risk_profile &&
                        user.risk_profile !== "UNASSIGNED" && (
                            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-4 text-sm font-medium flex items-center gap-2">
                                <CheckCircle className="text-emerald-600 shrink-0" />
                                <span>
                                    Риск-профиль успешно определен! Вы можете в
                                    любой момент перепройти тест ниже.
                                </span>
                            </div>
                        )}

                    <form onSubmit={handleTestSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">
                                1. Какова ваша главная финансовая цель?
                            </label>
                            <select
                                name="q1"
                                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none text-slate-700 focus:ring-1 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Выберите ответ...</option>
                                <option value="1">
                                    Сохранить накопления от обесценивания
                                    инфляцией
                                </option>
                                <option value="2">
                                    Получать стабильный пассивный доход на
                                    долгосрок
                                </option>
                                <option value="3">
                                    Добиться максимальной прибыли при любом
                                    риске
                                </option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">
                                2. Как вы поступите, если ваши активы подешевеют
                                на 20% за неделю?
                            </label>
                            <select
                                name="q2"
                                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none text-slate-700 focus:ring-1 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Выберите ответ...</option>
                                <option value="1">
                                    Срочно закрою позиции, чтобы спасти остаток
                                    капитала
                                </option>
                                <option value="2">
                                    Ничего не буду делать, дождусь
                                    восстановления рынка
                                </option>
                                <option value="3">
                                    Воспользуюсь моментом и докуплю подешевевшие
                                    активы
                                </option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">
                                3. На какой срок вы планируете размещать свои
                                инвестиции?
                            </label>
                            <select
                                name="q3"
                                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none text-slate-700 focus:ring-1 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Выберите ответ...</option>
                                <option value="1">
                                    Краткосрочный период (до 1 года)
                                </option>
                                <option value="2">
                                    Среднесрочный период (от 1 до 3 лет)
                                </option>
                                <option value="3">
                                    Долгосрочный горизонт (более 3 лет)
                                </option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition shadow-sm"
                        >
                            Сохранить риск-профиль
                        </button>
                    </form>
                </div>
            )}

            {activeTab === "info" && (
                <div className="bg-white rounded-b-2xl border-x border-b p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
                    <div className="border-b pb-4 border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800">
                            Детальная анкета инвестора
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Объективные финансовые и личные параметры,
                            необходимые ИИ-советнику для проведения скоринга.
                        </p>
                    </div>

                    <form onSubmit={saveProfile} className="space-y-6">
                        {/* Блок 1. Личные данные */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <User className="w-4 h-4" /> Личные данные
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <label className="block text-sm font-semibold text-slate-600">
                                    Имя
                                    <input
                                        type="text"
                                        value={profile.first_name}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                first_name: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 font-normal"
                                    />
                                </label>
                                <label className="block text-sm font-semibold text-slate-600">
                                    Фамилия
                                    <input
                                        type="text"
                                        value={profile.last_name}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                last_name: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 font-normal"
                                    />
                                </label>
                                <label className="block text-sm font-semibold text-slate-600">
                                    Возраст
                                    <input
                                        type="number"
                                        value={profile.age}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                age: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 font-normal"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Блок 2. Финансовые параметры */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Landmark className="w-4 h-4" /> Финансовое
                                положение
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <label className="block text-sm font-semibold text-slate-600">
                                    Уверенность в работе (1-5)
                                    <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={profile.employment_confidence}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                employment_confidence:
                                                    e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 font-normal"
                                    />
                                </label>
                                <label className="block text-sm font-semibold text-slate-600">
                                    Стабильность дохода (1-5)
                                    <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={profile.income_stability}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                income_stability:
                                                    e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 font-normal"
                                    />
                                </label>
                                <label className="block text-sm font-semibold text-slate-600">
                                    Иждивенцы (человек)
                                    <input
                                        type="number"
                                        min="0"
                                        value={profile.dependents_count}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                dependents_count:
                                                    e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 font-normal"
                                    />
                                </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="block text-sm font-semibold text-slate-600">
                                    Личная переносимость рисков (1-5)
                                    <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={profile.risk_tolerance}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                risk_tolerance: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 font-normal"
                                    />
                                </label>
                                <label className="block text-sm font-semibold text-slate-600">
                                    Наличие финансовой подушки
                                    <select
                                        value={profile.has_emergency_fund}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                has_emergency_fund:
                                                    e.target.value === "true" ||
                                                    e.target.value === true,
                                            })
                                        }
                                        className="mt-1 block w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 font-normal"
                                    >
                                        <option value="false">
                                            Нет подушки безопасности
                                        </option>
                                        <option value="true">
                                            Да, есть подушка безопасности
                                        </option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        {/* Блок 3. Инвестиционный Профиль */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Activity className="w-4 h-4" /> Параметры
                                инвестирования
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="block text-sm font-semibold text-slate-600">
                                    Горизонт инвестирования
                                    <select
                                        value={profile.investment_horizon}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                investment_horizon:
                                                    e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 font-normal"
                                    >
                                        <option value="">Не указано</option>
                                        <option value="SHORT">
                                            Короткий (до 1 года)
                                        </option>
                                        <option value="MEDIUM">
                                            Средний (1-3 года)
                                        </option>
                                        <option value="LONG">
                                            Долгий (более 3 лет)
                                        </option>
                                    </select>
                                </label>
                                <label className="block text-sm font-semibold text-slate-600">
                                    Опыт инвестирования
                                    <select
                                        value={profile.investment_experience}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                investment_experience:
                                                    e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 font-normal"
                                    >
                                        <option value="">Не указано</option>
                                        <option value="NONE">Нет опыта</option>
                                        <option value="BEGINNER">
                                            Новичок
                                        </option>
                                        <option value="INTERMEDIATE">
                                            Средний уровень
                                        </option>
                                        <option value="ADVANCED">
                                            Продвинутый уровень
                                        </option>
                                    </select>
                                </label>
                            </div>
                            <label className="block text-sm font-semibold text-slate-600">
                                Предпочитаемые инвестиционные активы (через
                                запятую)
                                <input
                                    type="text"
                                    placeholder="например, bonds, stocks, gold"
                                    value={profile.preferred_assets}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            preferred_assets: e.target.value,
                                        })
                                    }
                                    className="mt-1 block w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 font-normal"
                                />
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition shadow-sm"
                        >
                            Сохранить анкету
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
