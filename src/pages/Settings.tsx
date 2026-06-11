import React, { useState, useEffect } from "react";
import { Save, SlidersHorizontal, Info } from "lucide-react";
import type { GlobalSettings, ProviderModel } from "../types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<GlobalSettings>({
    systemPrompt: "您是一个极具备帮助的智能助理。",
    defaultModelId: "",
    streamEnabled: true,
    contextRounds: 10,
  });
  const [models, setModels] = useState<ProviderModel[]>([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetch("/api/models")
      .then(res => res.json())
      .then(data => {
         if (Array.isArray(data)) {
            setModels(data);
         }
      })
      .catch(() => {});

    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
         if (data && !data.error && Object.keys(data).length > 0) {
            setSettings(prev => ({ ...prev, ...data }));
         }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSuccessMsg("全局参数已保存！");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 lg:p-12 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-2">
            全局参数设置
          </h2>
          <p className="text-sm text-gray-500">配置 QQ 机器人对话行为、多轮对话记忆及聚合网关默认选项。</p>
        </div>
        <div className="flex items-center gap-4">
          {successMsg && <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{successMsg}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "正在保存..." : "保存设置"}
          </button>
        </div>
      </div>

      <div className="space-y-8 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">默认调用模型节点</label>
          <select
            value={settings?.defaultModelId || ""}
            onChange={(e) => setSettings({ ...settings, defaultModelId: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          >
            <option value="">请选择默认模型...</option>
            {Array.isArray(models) && models.filter(Boolean).map(m => (
              <option key={m.id || Math.random()} value={m.id || ""}>{m.name || m.modelCode || "未命名"}</option>
            ))}
          </select>
          <p className="text-xs flex items-center gap-1 text-gray-500 mt-1">
            <Info className="w-3.5 h-3.5" />
            当通过网关接口 (如 `/v1/chat/completions`) 调用未指定模型时，将使用此配置。
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">全局提示词 (System Prompt)</label>
          <textarea
            rows={5}
            value={settings?.systemPrompt || ""}
            onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-md p-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
            placeholder="指引 AI 该以何种身份及语气进行沟通..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
          <div className="space-y-3">
             <label className="text-sm font-semibold text-gray-900 flex justify-between items-center">
                 上下文记忆轮数 
                 <span className="text-indigo-700 font-mono bg-indigo-50 text-xs px-2 py-0.5 rounded-full border border-indigo-100">{settings?.contextRounds ?? 10} 轮</span>
             </label>
             <input
               type="range"
               min="0"
               max="50"
               step="1"
               value={settings?.contextRounds ?? 10}
               onChange={(e) => setSettings({ ...settings, contextRounds: parseInt(e.target.value) || 0 })}
               className="w-full accent-indigo-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-4"
             />
             <p className="text-xs text-gray-500 mt-2">控制传入目标后台前合并多少次历史记录。0 表示单轮无记忆。</p>
          </div>

          <div className="space-y-3 flex flex-col justify-start">
              <label className="text-sm font-semibold text-gray-900">支持流式输出 (Stream)</label>
              <label className="relative inline-flex items-center cursor-pointer mt-3">
                 <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={!!settings?.streamEnabled}
                    onChange={(e) => setSettings({ ...settings, streamEnabled: e.target.checked })}
                 />
                 <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                 <span className="ml-3 text-sm font-medium text-gray-700">开启打字机流式传输</span>
              </label>
              <p className="text-xs text-gray-500 mt-2">部分 QQ 机器人环境需整段接收数据，启用网关接口兼容SSE模式。</p>
          </div>
        </div>

      </div>
    </div>
  );
}
