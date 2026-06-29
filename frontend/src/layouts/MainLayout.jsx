import { Outlet, NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Receipt,
    Target,
    BrainCircuit,
    LogOut,
    Wallet,
    CreditCard,
    PieChart,
    UserCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function MainLayout() {
    const { user, logout } = useAuth();

    const navItems = [
        { to: "/", icon: LayoutDashboard, label: "Дашборд" },
        { to: "/accounts", icon: CreditCard, label: "Счета" },
        { to: "/transactions", icon: Receipt, label: "Транзакции" },
        { to: "/limits", icon: PieChart, label: "Лимиты" },
        { to: "/goals", icon: Target, label: "Цели" },
        { to: "/ai", icon: BrainCircuit, label: "ИИ Советник" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Боковое меню (десктоп) */}
            <div className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-6 flex items-center gap-3 text-indigo-600">
                    <Wallet className="w-8 h-8" />
                    <span className="text-xl font-bold text-slate-800">
                        ФинМетрика
                    </span>
                </div>
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`
                            }
                        >
                            <item.icon className="w-5 h-5" /> {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-200">
                    <NavLink
                        to="/profile"
                        className="flex items-center gap-3 mb-4 px-2 hover:bg-slate-50 p-2 rounded-xl transition"
                    >
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                            {user?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                                {user?.username}
                            </p>
                            <p className="text-xs text-indigo-600 truncate font-semibold uppercase">
                                {user?.risk_profile || "UNASSIGNED"}
                            </p>
                        </div>
                    </NavLink>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />{" "}
                        <span className="font-medium">Выйти</span>
                    </button>
                </div>
            </div>

            {/* Нижнее меню (мобильные устройства) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-50 overflow-x-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `p-3 rounded-xl transition flex shrink-0 ${isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-500"}`
                        }
                    >
                        <item.icon className="w-6 h-6" />
                    </NavLink>
                ))}
                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        `p-3 rounded-xl transition flex shrink-0 ${isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-500"}`
                    }
                >
                    <UserCircle className="w-6 h-6" />
                </NavLink>
            </div>
            <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
