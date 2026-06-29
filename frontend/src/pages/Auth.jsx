import { useState } from "react";
import { Wallet } from "lucide-react";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 text-center bg-indigo-600 text-white">
                    <Wallet className="w-12 h-12 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold">ФинМетрика</h1>
                </div>
                <div className="p-8">
                    {isLogin ? (
                        <LoginForm onSwitch={() => setIsLogin(false)} />
                    ) : (
                        <RegisterForm onSwitch={() => setIsLogin(true)} />
                    )}
                </div>
            </div>
        </div>
    );
}
