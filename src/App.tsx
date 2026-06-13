import React from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { Settings, Server, MessageCircle, Layers, Activity, Monitor, LogOut, Users } from "lucide-react";
import { cn } from "./utils";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import ProvidersPage from "./pages/Providers";
import SettingsPage from "./pages/Settings";
import DashboardPage from "./pages/Dashboard";
import WebSettingsPage from "./pages/WebSettings";
import LoginPage from "./pages/Login";
import UsersManagePage from "./pages/Users";
import { ErrorBoundary } from "./components/ErrorBoundary";
import AIChatbot from "./components/AIChatbot";

function MainApp() {
  const { role, logout, loading, username } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0B1120] text-gray-500">正在检查状态...</div>;
  if (!role) return <LoginPage />;

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 font-sans">
      {/* Sidebar Navigation */}
      <nav className="w-64 border-r border-gray-200 dark:border-gray-800/60 bg-white dark:bg-[#111827] flex flex-col z-10 shadow-sm relative">
        <div className="px-6 py-8 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800/60">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-lg">
            <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">AI Proxy Gateway</h1>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
              )
            }
          >
            <Activity className="w-4 h-4" />
            数据看板概览
          </NavLink>
          
          {role === "admin" && (
             <NavLink
               to="/providers"
               className={({ isActive }) =>
                 cn(
                   "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                   isActive
                     ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                     : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
                 )
               }
             >
               <Server className="w-4 h-4" />
               模型节点管理
             </NavLink>
          )}

          {role === "admin" && (
             <NavLink
               to="/users"
               className={({ isActive }) =>
                 cn(
                   "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                   isActive
                     ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                     : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
                 )
               }
             >
               <Users className="w-4 h-4" />
               普通用户管理
             </NavLink>
          )}

          {role === "admin" && (
             <NavLink
               to="/settings"
               className={({ isActive }) =>
                 cn(
                   "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                   isActive
                     ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                     : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
                 )
               }
             >
               <Settings className="w-4 h-4" />
               聚合基础设置
             </NavLink>
          )}

          <NavLink
            to="/web-settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
              )
            }
          >
            <Monitor className="w-4 h-4" />
            前台界面偏好
          </NavLink>
        </div>
        
        <div className="p-4 border-t border-gray-100 dark:border-gray-800/60">
           <div className="mb-3 px-3 text-xs text-gray-500 dark:text-gray-500 truncate text-center">
              Logged in as: {username}
           </div>
           <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-800/30 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent dark:border-gray-800">
              <LogOut className="w-4 h-4" />
              断开连接退出
           </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-auto bg-gray-50 dark:bg-[#0B1120]">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          {role === "admin" && (
             <>
               <Route path="/providers" element={<ProvidersPage />} />
               <Route path="/settings" element={<SettingsPage />} />
               <Route path="/users" element={<UsersManagePage />} />
             </>
          )}
          <Route path="/web-settings" element={<WebSettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* Floating AI Chatbot */}
      <AIChatbot />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}
