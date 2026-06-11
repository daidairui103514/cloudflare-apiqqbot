import React from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { Settings, Server, MessageCircle, Layers } from "lucide-react";
import { cn } from "./utils";

import ProvidersPage from "./pages/Providers";
import SettingsPage from "./pages/Settings";
import QQBotPage from "./pages/QQBot";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <div className="flex h-screen w-full bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar Navigation */}
      <nav className="w-64 border-r border-gray-200 bg-white flex flex-col z-10 shadow-sm">
        <div className="px-6 py-8 flex items-center gap-3 border-b border-gray-100">
          <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
            <Layers className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-base font-semibold tracking-tight text-gray-900">API 聚合中控平台</h1>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2">
          <NavLink
            to="/providers"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )
            }
          >
            <Server className="w-4 h-4" />
            服务商管理
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )
            }
          >
            <Settings className="w-4 h-4" />
            全局参数设置
          </NavLink>
          <NavLink
            to="/qq-bot"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )
            }
          >
            <MessageCircle className="w-4 h-4" />
            QQ 机器人连接
          </NavLink>
        </div>
        
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-auto bg-gray-50">
        <Routes>
          <Route path="/" element={<Navigate to="/providers" replace />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/qq-bot" element={<QQBotPage />} />
        </Routes>
      </main>
    </div>
    </ErrorBoundary>
  );
}
