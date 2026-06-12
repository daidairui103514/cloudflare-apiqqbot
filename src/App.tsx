import React from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { Settings, Server, MessageCircle, Layers, Activity, Monitor, LogOut } from "lucide-react";
import { cn } from "./utils";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import ProvidersPage from "./pages/Providers";
import SettingsPage from "./pages/Settings";
import DashboardPage from "./pages/Dashboard";
import WebSettingsPage from "./pages/WebSettings";
import LoginPage from "./pages/Login";
import { ErrorBoundary } from "./components/ErrorBoundary";

function MainApp() {
  const { role, logout, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-500">正在检查登录状态...</div>;
  if (!role) return <LoginPage />;

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      {/* Sidebar Navigation */}
      <nav className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col z-10 shadow-sm">
        <div className="px-6 py-8 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-lg">
            <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-base font-semibold tracking-tight text-gray-900 dark:text-white">AI 聚合网关</h1>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
              )
            }
          >
            <Activity className="w-4 h-4" />
            数据看板
          </NavLink>
          
          {role === "admin" && (
             <NavLink
               to="/providers"
               className={({ isActive }) =>
                 cn(
                   "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                   isActive
                     ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                     : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                 )
               }
             >
               <Server className="w-4 h-4" />
               模型服务商管理
             </NavLink>
          )}

          {role === "admin" && (
             <NavLink
               to="/settings"
               className={({ isActive }) =>
                 cn(
                   "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                   isActive
                     ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                     : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                 )
               }
             >
               <Settings className="w-4 h-4" />
               聚合网关设置
             </NavLink>
          )}

          <NavLink
            to="/web-settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
              )
            }
          >
            <Monitor className="w-4 h-4" />
            网页界面设置
          </NavLink>
        </div>
        
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
           <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors">
              <LogOut className="w-4 h-4" />
              退出登录 ({role === 'admin' ? '管理' : '成员'})
           </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-auto bg-gray-50 dark:bg-gray-950">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          {role === "admin" && (
             <>
               <Route path="/providers" element={<ProvidersPage />} />
               <Route path="/settings" element={<SettingsPage />} />
             </>
          )}
          <Route path="/web-settings" element={<WebSettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
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
