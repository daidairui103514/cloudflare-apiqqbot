import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, KeyRound, Server, X, Search } from "lucide-react";
import type { ProviderModel } from "../types";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";

export default function ProvidersPage() {
  const [models, setModels] = useState<ProviderModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  
  // Model detection states
  const [detecting, setDetecting] = useState(false);
  const [detectedModels, setDetectedModels] = useState<any[]>([]);
  const [showModelPicker, setShowModelPicker] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    fetch("/api/models", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
           setModels(data);
        } else if (data.error) {
           setError("加载失败: " + data.error);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("加载提供商配置失败。");
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(models),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "保存更改失败。");
      }
      setSuccessMsg("配置已成功保存！");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addModel = () => {
    const newId = uuidv4();
    setModels([
      ...models,
      {
        id: newId,
        name: "新建自定义模型",
        modelCode: "gpt-3.5-turbo",
        baseUrl: "https://api.openai.com/v1",
        apiKey: "",
      },
    ]);
    setSelectedModelId(newId);
  };

  const removeModel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setModels(models.filter((m) => m.id !== id));
    if (selectedModelId === id) setSelectedModelId(null);
  };

  const updateModel = (id: string, field: keyof ProviderModel, value: string) => {
    setModels(models.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDetectModels = async () => {
    if (!selectedModel || !selectedModel.baseUrl) return;
    setDetecting(true);
    try {
        const res = await fetch("/api/detect-models", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ baseUrl: selectedModel.baseUrl, apiKey: selectedModel.apiKey })
        });
        const data = await res.json();
        if (data.error) {
            throw new Error(data.error?.message || data.error);
        }
        if (data.data && Array.isArray(data.data)) {
            setDetectedModels(data.data);
            setShowModelPicker(true);
        } else {
            alert("未检测到模型列表，请确保填写了正确的 Base URL 和 API Key。");
        }
    } catch(err: any) {
        alert("检测失败: " + err.message);
    } finally {
        setDetecting(false);
    }
  };

  const handleCheckConnectivity = async (model: ProviderModel) => {
    if (!model.baseUrl) {
        showToast("请先配置 Base URL", "error");
        return;
    }
    showToast(`正在连接 [${model.name}]...`, "success");
    try {
        const res = await fetch("/api/detect-models", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ baseUrl: model.baseUrl, apiKey: model.apiKey })
        });
        const data = await res.json();
        if (data.error) {
            throw new Error(data.error?.message || data.error);
        }
        if (data.data && Array.isArray(data.data)) {
            showToast(`连接成功: [${model.name}] 正常工作，获取到 ${data.data.length} 个模型`, "success");
        } else {
            showToast(`连接异常: [${model.name}] 返回的数据格式不正确`, "error");
        }
    } catch(err: any) {
        showToast(`连接失败: [${model.name}] ${err.message}`, "error");
    }
  };

  const selectedModel = models.find(m => m.id === selectedModelId);

  if (loading) {
    return <div className="p-8 text-gray-500">正在加载配置...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="h-full flex flex-col p-8 lg:p-12 max-w-6xl mx-auto relative dark:text-gray-200">
      <AnimatePresence>
      {toast && (
        <motion.div initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }} className={`fixed top-6 left-1/2 z-[100] px-6 py-3 rounded-md shadow-lg font-medium text-sm transition-colors duration-300 ${toast.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>
          {toast.message}
        </motion.div>
      )}
      </AnimatePresence>
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-800/60">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-2">
            API 服务商管理
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">添加和配置多种模型节点的可用终结口以及对应的 API Key。</p>
        </div>
        <div className="flex items-center gap-4">
          {successMsg && <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full">{successMsg}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? "正在保存..." : "保存配置"}
          </button>
        </div>
      </div>

      {error && <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {models.map((model, idx) => (
          <div 
            key={`provider-list-${model.id}-${idx}`} 
            onClick={() => setSelectedModelId(model.id)}
            className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800/60 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all rounded-xl p-6 relative group flex flex-col items-center text-center h-48 justify-center shadow-sm"
          >
            <button
              onClick={(e) => removeModel(model.id, e)}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-md"
              title="移除此提供商"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-500/20">
               <Server className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate w-full px-2">{model.name}</h3>
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-1 truncate w-full px-2">{model.modelCode || "未指定"}</span>
            <button
               onClick={(e) => {
                 e.stopPropagation();
                 handleCheckConnectivity(model);
               }}
               className="mt-4 flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-3 py-1.5 rounded-md transition-colors"
            >
               <Search className="w-3 h-3" />
               一键检测连通性
            </button>
          </div>
        ))}

        <button
          onClick={addModel}
          className="bg-gray-50 dark:bg-gray-800/30 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 h-48 cursor-pointer"
        >
          <Plus className="w-6 h-6 mb-2" />
          <span className="text-sm font-medium">添加 API 节点</span>
        </button>
      </div>

      {/* Modal for Provider Details */}
      <AnimatePresence>
      {selectedModel && (
        <motion.div key="model-details-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => setSelectedModelId(null)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
               <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                     <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                     {selectedModel.name || "配置详情"}
                  </h3>
                  <button onClick={() => setSelectedModelId(null)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors p-1.5 rounded-full">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               
               <div className="overflow-y-auto p-6 space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">显示名称</label>
                      <input
                        type="text"
                        value={selectedModel.name}
                        onChange={(e) => updateModel(selectedModel.id, "name", e.target.value)}
                        className="w-full bg-white dark:bg-[#0B1120] border border-gray-300 dark:border-gray-800 rounded-md p-2.5 text-sm text-gray-900 dark:text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="例如: GPT-4 接口"
                      />
                    </div>
                    <div className="space-y-1.5 relative">
                      <div className="flex items-center justify-between">
                         <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">模型标识符</label>
                         <button 
                           onClick={handleDetectModels}
                           disabled={detecting}
                           className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-50"
                         >
                           <Search className="w-3.5 h-3.5" />
                           {detecting ? "探测中..." : "探测模型"}
                         </button>
                      </div>
                      <input
                        type="text"
                        value={selectedModel.modelCode}
                        onChange={(e) => updateModel(selectedModel.id, "modelCode", e.target.value)}
                        className="w-full bg-white dark:bg-[#0B1120] border border-gray-300 dark:border-gray-800 rounded-md p-2.5 text-sm font-mono text-indigo-600 dark:text-indigo-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">接口 Base URL</label>
                      <input
                        type="text"
                        value={selectedModel.baseUrl}
                        onChange={(e) => updateModel(selectedModel.id, "baseUrl", e.target.value)}
                        className="w-full bg-white dark:bg-[#0B1120] border border-gray-300 dark:border-gray-800 rounded-md p-2.5 text-sm font-mono text-gray-600 dark:text-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">请求 API Key</label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-3" />
                        <input
                          type="password"
                          value={selectedModel.apiKey}
                          onChange={(e) => updateModel(selectedModel.id, "apiKey", e.target.value)}
                          className="w-full bg-white dark:bg-[#0B1120] border border-gray-300 dark:border-gray-800 rounded-md p-2.5 pl-9 text-sm font-mono text-gray-600 dark:text-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="sk-..."
                        />
                      </div>
                    </div>
               </div>

               <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end gap-3">
                  <button onClick={() => setSelectedModelId(null)} className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                     取消
                  </button>
                  <button onClick={() => { handleSave(); setSelectedModelId(null); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm">
                     保存
                  </button>
               </div>
            </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Select Model Global Modal */}
      <AnimatePresence>
      {showModelPicker && selectedModel && (
         <motion.div key="model-picker-modal" className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowModelPicker(false)}></motion.div>
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-sm bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl flex flex-col max-h-[80vh]">
                 <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30 rounded-t-xl">
                     <h4 className="font-semibold text-gray-900 dark:text-white">选择探测到的模型</h4>
                     <button onClick={() => setShowModelPicker(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><X className="w-5 h-5"/></button>
                 </div>
                 <div className="p-2 overflow-y-auto flex-1 space-y-1 min-h-[300px]">
                    {detectedModels.map((m: any, idx) => (
                        <button
                           key={`detected-${m.id}-${idx}`}
                           onClick={() => {
                               updateModel(selectedModel.id, "modelCode", m.id);
                               localStorage.setItem("last_detected_model", m.id);
                               setShowModelPicker(false);
                           }}
                           className="w-full text-left px-4 py-3 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-sm flex items-center justify-between group transition-colors"
                        >
                            <span className="font-medium text-gray-900 dark:text-gray-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">{m.id}</span>
                        </button>
                    ))}
                 </div>
             </motion.div>
         </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}
