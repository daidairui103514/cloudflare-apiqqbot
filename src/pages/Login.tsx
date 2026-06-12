import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registrationCode, setRegistrationCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      if (isLogin) {
        const res = await fetch("/api/login", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        
        if (!res.ok) {
           throw new Error(data.error || "登录失败");
        }
        
        login(data.token, data.role, username, data.apiKey);
      } else {
        const res = await fetch("/api/register", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ username, password, registrationCode })
        });
        const data = await res.json();
        
        if (!res.ok) {
           throw new Error(data.error || "注册失败");
        }
        
        setSuccess("注册成功，请使用新账号登录");
        setIsLogin(true);
        setPassword("");
        setRegistrationCode("");
      }
    } catch(err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 px-4">
      <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl shadow-xl dark:shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="p-8">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 mx-auto border border-indigo-100 dark:border-indigo-500/20">
            <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-2">{isLogin ? "欢迎回来" : "创建账号"}</h2>
          <p className="text-sm text-center text-gray-500 dark:text-indigo-200/60 mb-8">
             {isLogin ? "请登录以管理聚合网关" : "填写账号信息以注册普通用户"}
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-lg text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-lg text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                 <User className="w-4 h-4 text-gray-400 dark:text-gray-500" /> 用户名
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-white dark:bg-[#0B1120] border border-gray-300 dark:border-gray-800 rounded-lg p-3 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-400 dark:placeholder-gray-600"
                placeholder="在此输入账号"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                 <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500" /> 密码
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-[#0B1120] border border-gray-300 dark:border-gray-800 rounded-lg p-3 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-400 dark:placeholder-gray-600"
                placeholder="在此输入密码"
              />
            </div>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                   <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500" /> 注册码
                </label>
                <input
                  type="text"
                  required
                  value={registrationCode}
                  onChange={e => setRegistrationCode(e.target.value)}
                  className="w-full bg-white dark:bg-[#0B1120] border border-gray-300 dark:border-gray-800 rounded-lg p-3 text-sm font-mono uppercase text-gray-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-400 dark:placeholder-gray-600"
                  placeholder="在此输入由管理员提供的注册码"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-[#111827] shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {loading ? "处理中..." : (isLogin ? "登录统管后台" : "立即注册")}
            </button>
            <div className="text-center mt-4">
              <button 
                 type="button" 
                 onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }} 
                 className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
               >
                 {isLogin ? "没有账号？点击注册" : "已有账号？去登录"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
