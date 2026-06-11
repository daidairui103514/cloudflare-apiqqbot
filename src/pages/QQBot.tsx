import React, { useState, useEffect } from "react";
import { Save, BotMessageSquare, Link2, Copy, CheckCircle2, Cloud } from "lucide-react";
import type { QQBotConfig } from "../types";

export default function QQBotPage() {
  const [config, setConfig] = useState<QQBotConfig>({
    appId: "",
    appSecret: "",
    token: "",
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/qqbot")
      .then(res => res.json())
      .then(data => {
         if (Object.keys(data).length > 0) {
            setConfig(data);
         }
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");
    try {
      await fetch("/api/qqbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setSuccessMsg("QQ 机器人配置已保存！");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.pages.dev';
  const webhookUrl = `${currentHost}/api/qq-webhook`;
  const gatewayUrl = `${currentHost}/v1/chat/completions`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(type);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="h-full flex flex-col p-8 lg:p-12 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-2">
            连接参数 & API 网关
          </h2>
          <p className="text-sm text-gray-500">配置 QQ 频道 Bot 以及本聚合端的公网接口地址。</p>
        </div>
        <div className="flex items-center gap-4">
          {successMsg && <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{successMsg}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? "处理中..." : "保存绑定"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                   <BotMessageSquare className="w-5 h-5 text-indigo-500" />
                   QQ 开放平台验证信息
                </h3>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Bot AppID</label>
                  <input
                    type="text"
                    value={config.appId}
                    onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-sm font-mono text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="请输入 10 位数 AppID"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Bot AppSecret</label>
                  <input
                    type="password"
                    value={config.appSecret}
                    onChange={(e) => setConfig({ ...config, appSecret: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-sm font-mono text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="请输入 AppSecret"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Bot Token</label>
                  <input
                    type="password"
                    value={config.token}
                    onChange={(e) => setConfig({ ...config, token: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-md p-2.5 text-sm font-mono text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="请输入鉴权 Token"
                  />
                </div>
            </div>
         </div>

         <div className="lg:col-span-1 space-y-6">
             <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl shadow-sm">
                 <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-indigo-500" />
                    OpenAI 格式网关调用
                 </h3>
                 <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    部署至 Cloudflare 后，您可直接将本应用作为 OpenAI 兼容网关使用。在本地代码中请求此地址，即可通过这里配置的模型节点路由。
                 </p>
                 
                 <div className="bg-white border border-gray-200 rounded-md p-2 flex items-center justify-between mt-2">
                    <span className="text-xs font-mono text-gray-600 truncate mr-2" >
                       {gatewayUrl}
                    </span>
                    <button 
                      onClick={() => copyToClipboard(gatewayUrl, 'gateway')}
                      className="text-gray-400 hover:text-indigo-600 transition-colors p-1 bg-gray-50 rounded"
                    >
                      {copiedUrl === 'gateway' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                 </div>
             </div>

             <div className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-xl">
                 <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-indigo-500" />
                    QQ Webhook 订阅地址
                 </h3>
                 <p className="text-xs text-indigo-700 mb-4 leading-relaxed">
                    将下方地址填入 QQ 开放平台开发者后台的事件订阅回调 (Webhook) 中。无需手动输入，直接复制即可。
                 </p>
                 
                 <div className="bg-white border border-indigo-200 rounded-md p-2 flex items-center justify-between">
                    <span className="text-xs font-mono text-indigo-600 truncate mr-2" >
                       {webhookUrl}
                    </span>
                    <button 
                      onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                      className="text-indigo-400 hover:text-indigo-600 transition-colors p-1 bg-indigo-50 rounded"
                    >
                      {copiedUrl === 'webhook' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
}
