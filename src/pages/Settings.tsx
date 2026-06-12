import React, { useState, useEffect } from "react";
import { Save, SlidersHorizontal, Info } from "lucide-react";
import type { GlobalSettings, ProviderModel } from "../types";
import { useAuth } from "../contexts/AuthContext";

export default function SettingsPage() {
  const [settings, setSettings] = useState<GlobalSettings>({
    systemPrompt: "您是一个极具备帮助的智能助理。",
    defaultModelId: "",
    streamEnabled: true,
    contextRounds: 10,
    gatewayApiKey: "",
  });
  const [models, setModels] = useState<ProviderModel[]>([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const { token, role, apiKey } = useAuth();
  
  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    fetch("/api/models", { headers })
      .then(res => res.json())
      .then(data => {
         if (Array.isArray(data)) {
            setModels(data);
         }
      })
      .catch(() => {});

    fetch("/api/settings", { headers })
      .then(res => res.json())
      .then(data => {
         if (data && !data.error && Object.keys(data).length > 0) {
            setSettings(prev => ({ ...prev, ...data }));
         }
      })
      .catch(() => {});
  }, [token]);

  const generateKey = () => {
    const key = "sk-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setSettings(prev => ({ ...prev, gatewayApiKey: key }));
  };

  const clearKey = () => {
    setSettings(prev => ({ ...prev, gatewayApiKey: "" }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
         throw new Error(data?.error || "保存失败");
      }
      setSuccessMsg("全局参数已保存！");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      alert(err.message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 lg:p-12 max-w-4xl mx-auto dark:text-gray-200">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-800/60">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-2">
            全局参数设置
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">配置多轮对话记忆及聚合网关默认选型。</p>
        </div>
        <div className="flex items-center gap-4">
          {successMsg && <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full">{successMsg}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "正在保存..." : "保存设置"}
          </button>
        </div>
      </div>

      <div className="space-y-8 bg-white dark:bg-[#111827] p-8 rounded-2xl border border-gray-200 dark:border-gray-800/60 shadow-sm">
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900 dark:text-white">默认调用模型节点</label>
          <select
            value={settings?.defaultModelId || ""}
            onChange={(e) => setSettings({ ...settings, defaultModelId: e.target.value })}
            className="w-full bg-white dark:bg-[#0B1120] border border-gray-300 dark:border-gray-800 rounded-lg p-2.5 text-sm text-gray-900 dark:text-gray-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          >
            <option value="">请选择默认模型...</option>
            {Array.isArray(models) && models.filter(Boolean).map(m => (
              <option key={m.id || Math.random()} value={m.id || ""}>{m.name || m.modelCode || "未命名"}</option>
            ))}
          </select>
          <p className="text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400 mt-1">
            <Info className="w-3.5 h-3.5" />
            当通过网关接口调用未指定模型时，将使用此配置。
          </p>
        </div>

        <div className="space-y-2">
          {role === "admin" ? (
            <>
              <label className="text-sm font-semibold text-gray-900 dark:text-white flex justify-between items-center">
                <span>全局网关访问密钥 (API Key)</span>
                <div className="flex gap-3">
                  <button onClick={clearKey} className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 transition-colors">清除</button>
                  <button onClick={generateKey} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors">随机生成</button>
                </div>
              </label>
              <input
                type="text"
                value={settings?.gatewayApiKey || ""}
                onChange={(e) => setSettings({ ...settings, gatewayApiKey: e.target.value })}
                className="w-full bg-white dark:bg-[#0B1120] border border-gray-300 dark:border-gray-800 rounded-lg p-2.5 text-sm font-mono text-gray-900 dark:text-gray-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:font-sans"
                placeholder="网关全局 API Key (例如 sk-my-custom-key)，留空则不限制"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">设置后，客户端调用网关时需在 Header 中携带此 Authorization Bearer Token。</p>
            </>
          ) : (
            <>
              <label className="text-sm font-semibold text-gray-900 dark:text-white flex justify-between items-center">
                <span>您的专属访问密钥 (API Key)</span>
              </label>
              <input
                type="text"
                value={apiKey || "尚无 API Key，请联系管理员"}
                readOnly
                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-800 rounded-lg p-2.5 text-sm font-mono text-gray-600 dark:text-gray-400 outline-none transition-all cursor-copy"
                onClick={(e) => {
                  if (apiKey) {
                    navigator.clipboard.writeText(apiKey);
                    alert("已复制 API Key");
                  }
                }}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">点击输入框即可复制您的专属 API Key。</p>
            </>
          )}

          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-800/60 rounded-xl">
             <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">网关调用地址 (Base URL)</p>
             <div className="flex items-center gap-2">
               <code className="text-sm bg-white dark:bg-[#0B1120] px-3 py-1.5 rounded-lg text-indigo-700 dark:text-indigo-400 border border-gray-300 dark:border-gray-800/60 flex-1 overflow-x-auto shadow-sm select-all cursor-pointer" onClick={(e) => {
                 navigator.clipboard.writeText(`${window.location.origin}/v1`);
                 const target = e.currentTarget;
                 const originalText = target.innerText;
                 target.innerText = "已复制！";
                 setTimeout(() => target.innerText = originalText, 1000);
               }}>
                 {window.location.origin}/v1
               </code>
               <button 
                 onClick={() => {
                   navigator.clipboard.writeText(`${window.location.origin}/v1`);
                   alert("复制成功");
                 }}
                 className="px-3 py-1.5 bg-white dark:bg-[#0B1120] border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
               >
                 复制
               </button>
             </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900 dark:text-white">全局提示词 (System Prompt)</label>
          <textarea
            rows={5}
            value={settings?.systemPrompt || ""}
            onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
            readOnly={role !== "admin"}
            className="w-full bg-white dark:bg-[#0B1120] border border-gray-300 dark:border-gray-800 rounded-lg p-3 text-sm text-gray-900 dark:text-gray-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
            placeholder="指引 AI 该以何种身份及语气进行沟通..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100 dark:border-gray-800/60">
          <div className="space-y-3">
             <label className="text-sm font-semibold text-gray-900 dark:text-white flex justify-between items-center">
                 上下文记忆轮数 
                 <span className="text-indigo-700 dark:text-indigo-400 font-mono bg-indigo-50 dark:bg-indigo-500/10 text-xs px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-500/20">{settings?.contextRounds ?? 10} 轮</span>
             </label>
             <input
               type="range"
               min="0"
               max="50"
               step="1"
               value={settings?.contextRounds ?? 10}
               onChange={(e) => setSettings({ ...settings, contextRounds: parseInt(e.target.value) || 0 })}
               disabled={role !== "admin"}
               className="w-full accent-indigo-600 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer mt-4"
             />
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">控制传入目标后台前合并多少次历史记录。0 表示单轮无记忆。</p>
          </div>

          <div className="space-y-3 flex flex-col justify-start pt-1">
              <label className="text-sm font-semibold text-gray-900 dark:text-white">流式传输开关 (Stream)</label>
              <div className="flex items-center gap-3 pt-3">
                 <button 
                    type="button"
                    onClick={() => role === "admin" && setSettings({ ...settings, streamEnabled: !settings?.streamEnabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${settings?.streamEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                 >
                    <span 
                       className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings?.streamEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                 </button>
                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">启用打字机流式输出</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">开启后在流式调用时体验更佳，部分特殊客户端可能不兼容 SSE。</p>
          </div>
        </div>

      </div>
    </div>
  );
}
