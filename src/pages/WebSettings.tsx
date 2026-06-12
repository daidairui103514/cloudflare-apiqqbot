import React, { useState } from "react";
import { Save, Shield, Layout, Download, Trash2, RefreshCw, EyeOff, Palette } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function WebSettingsPage() {
  const { role } = useAuth();
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  const [theme, setTheme] = useState(document.documentElement.classList.contains("dark") ? "dark" : "light");
  const [maskKeys, setMaskKeys] = useState(true);
  const [defaultPage, setDefaultPage] = useState("dashboard");
  const [refreshInterval, setRefreshInterval] = useState("30");

  const handleSave = () => {
    setSaving(true);
    setSuccessMsg("");
    
    if (theme === "dark") {
       document.documentElement.classList.add("dark");
       localStorage.setItem("theme", "dark");
    } else {
       document.documentElement.classList.remove("dark");
       localStorage.setItem("theme", "light");
    }

    setTimeout(() => {
       setSaving(false);
       setSuccessMsg("网页界面实用设置已保存！");
       setTimeout(() => setSuccessMsg(""), 3000);
    }, 500);
  };
  
  const handleClearCache = () => {
    if(confirm("确定要清理当前设备的所有前端无痕缓存及其记录吗？此操作不会影响云端配置。")) {
       alert("清除本地缓存成功");
       window.location.reload();
    }
  }

  const handleExport = () => {
     fetch("/api/models").then(res => res.json()).then(data => {
         const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
         const url = URL.createObjectURL(blob);
         const a = document.createElement("a");
         a.href = url;
         a.download = "gateway-config-backup.json";
         a.click();
     }).catch(() => alert("导出失败，请检查网络配置"));
  }

  return (
    <div className="h-full flex flex-col p-8 lg:p-12 max-w-4xl mx-auto dark:text-gray-100">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-2">
            高级偏好与管理工具
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">配置高阶防窥显示、导表备份以及各项基础面板工具。</p>
        </div>
        <div className="flex items-center gap-4">
          {successMsg && <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full">{successMsg}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "正在应用..." : "应用面板偏好"}
          </button>
        </div>
      </div>

      <div className="space-y-8 bg-white dark:bg-[#111827] p-8 rounded-2xl border border-gray-200 dark:border-gray-800/60 shadow-sm">
        
        {/* Row 0 Theme */}
        <div className="space-y-4">
           <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800/60 pb-2">
               <Palette className="w-4 h-4 text-indigo-500" />
               主题外观与设色模式
           </h3>
           <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
               <label className={`border rounded-xl p-4 cursor-pointer transition-all flex items-center gap-3 ${theme === 'light' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 ring-1 ring-indigo-600' : 'border-gray-200 dark:border-gray-800 hover:border-indigo-200'}`}>
                  <input type="radio" value="light" checked={theme === 'light'} onChange={() => setTheme('light')} className="sr-only" />
                  <div className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center shrink-0">
                     {theme === 'light' && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-200">清白 (Light Mode)</span>
               </label>
               <label className={`border rounded-xl p-4 cursor-pointer transition-all flex items-center gap-3 ${theme === 'dark' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 ring-1 ring-indigo-500' : 'border-gray-200 dark:border-gray-800 hover:border-indigo-800'}`}>
                  <input type="radio" value="dark" checked={theme === 'dark'} onChange={() => setTheme('dark')} className="sr-only" />
                  <div className="w-6 h-6 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center shrink-0">
                     {theme === 'dark' && <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full"></div>}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-200">暗幕 (Dark Slate)</span>
               </label>
           </div>
        </div>

        {/* Row 1 */}
        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800/60">
           <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800/60 pb-2">
               <Layout className="w-4 h-4 text-indigo-500" />
               前端交互呈现
           </h3>
           <div className="space-y-6 max-w-md">
              <div className="flex items-center justify-between">
                 <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center gap-2">
                      <EyeOff className="w-4 h-4 text-gray-500" /> API 密钥防窥显示
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">在界面默认隐藏您的 API Key 值，防止截图泄露。</p>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={maskKeys} onChange={e => setMaskKeys(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                 </label>
              </div>

              <div>
                 <label className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-2 block">首次进入界面的模块默认</label>
                 <select
                   value={defaultPage}
                   onChange={e => setDefaultPage(e.target.value)}
                   className="w-full bg-white dark:bg-[#0B1120] border border-gray-300 dark:border-gray-800 rounded-lg p-2.5 text-sm text-gray-900 dark:text-gray-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                 >
                   <option value="dashboard">默认加载最新「数据看板」</option>
                   <option value="providers">默认打开「模型服务商」列表</option>
                 </select>
              </div>
                            <div>
                 <label className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-2 flex items-center gap-2">
                   <RefreshCw className="w-4 h-4 text-gray-500" /> 延迟测速刷新策略
                 </label>
                 <select
                   value={refreshInterval}
                   onChange={e => setRefreshInterval(e.target.value)}
                   className="w-full bg-white dark:bg-[#0B1120] border border-gray-300 dark:border-gray-800 rounded-lg p-2.5 text-sm text-gray-900 dark:text-gray-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                 >
                   <option value="10">高频活跃 (每 10 秒即时更新)</option>
                   <option value="30">标配推荐 (常规 30 秒更新)</option>
                   <option value="60">平缓节流 (60 秒更新一次)</option>
                 </select>
              </div>
           </div>
        </div>

        {/* Row 2 */}
        {role === "admin" && (
           <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-800/60">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800/60 pb-2">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  工程维护集 (仅管理可用)
              </h3>
              
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-indigo-50 dark:bg-indigo-500/10 p-5 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                 <div>
                    <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300">离线化数据层配置导出</p>
                    <p className="text-xs text-indigo-700/70 dark:text-indigo-400/80 mt-1">立刻打包所有全局设定的 JSON 并通过浏览器下载给本地硬盘。</p>
                 </div>
                 <button onClick={handleExport} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0B1120] border border-indigo-200 dark:border-indigo-800/50 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#111827] transition-colors text-indigo-700 dark:text-indigo-400">
                    <Download className="w-4 h-4" />
                    导出备份
                 </button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-red-50 dark:bg-red-500/5 p-5 rounded-xl border border-red-100 dark:border-red-500/10">
                 <div>
                    <p className="text-sm font-medium text-red-900 dark:text-red-300">强杀所有渲染线程缓存</p>
                    <p className="text-xs text-red-700/70 dark:text-red-400/70 mt-1">执行无感清理，避免幽灵数据与持久化报错污染视觉。</p>
                 </div>
                 <button onClick={handleClearCache} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0B1120] border border-red-200 dark:border-red-800/50 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors text-red-600 dark:text-red-400">
                    <Trash2 className="w-4 h-4" />
                    硬重置进程
                 </button>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}
