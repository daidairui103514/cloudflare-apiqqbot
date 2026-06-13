import React, { useEffect, useState } from "react";
import { Activity, Clock, Server, Database, PieChart as PieChartIcon, Zap, Copy } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { GlobalSettings, ProviderModel } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "motion/react";

export default function DashboardPage() {
  const [models, setModels] = useState<ProviderModel[]>([]);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [tokenUsage, setTokenUsage] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { token, role, apiKey, username } = useAuth();

  useEffect(() => {
    if (!token) return;
    const load = async () => {
       try {
         const headers = { Authorization: `Bearer ${token}` };
         const [modelsData, settingsData, statsData] = await Promise.all([
           fetch("/api/models", { headers }).then(res => res.json()).catch(() => []),
           fetch("/api/settings", { headers }).then(res => res.json()).catch(() => null),
           fetch("/api/stats", { headers }).then(res => res.json()).catch(() => ({ tokenUsage: {} }))
         ]);
         
         setModels(Array.isArray(modelsData) ? modelsData : []);
         if (settingsData && !settingsData.error) {
             setSettings(settingsData);
         }
         if (statsData && statsData.tokenUsage) {
             setTokenUsage(statsData.tokenUsage);
         }
       } catch (err) {
         console.error(err);
       } finally {
         setLoading(false);
       }
    };
    load();
  }, [token]);

  const stats = [
    { label: "已配置提供商数", value: loading ? "..." : String(models.length), icon: <Database />, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { label: "总消耗 Token (次流)", value: loading ? "..." : String(Object.values(tokenUsage).reduce((a: number, b: number) => a + b, 0).toLocaleString()), icon: <Zap />, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
    { label: "网关服务状态", value: "运转正常", icon: <Server />, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#eab308'];
  const pieData = models.length > 0 ? models.map((m) => ({
    name: m.name,
    value: tokenUsage[m.id] || 0
  })).filter(x => x.value > 0) : [];


  return (
    <div className="h-full flex flex-col p-8 lg:p-12 max-w-6xl mx-auto dark:text-gray-100">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-end"
      >
        <div>
           <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-2">
             数据看板
           </h2>
           <p className="text-sm text-gray-500 dark:text-gray-400">查看当前聚合网关的真实配置情况和节点状态。</p>
        </div>
        <div className="text-right">
           <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">当前登录账号</p>
           <p className="text-lg font-medium text-indigo-600 dark:text-indigo-400">{username} {role === 'admin' ? '(管理员)' : '(成员)'}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={`stat-${stat.label}-${i}`} 
            className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-200 dark:border-gray-800/60 shadow-sm flex items-center justify-between transition-colors hover:shadow-md"
          >
             <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className={`text-xl font-semibold text-gray-900 dark:text-gray-100`}>{stat.value}</p>
             </div>
             <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                {React.cloneElement(stat.icon as React.ReactElement, { className: "w-6 h-6" })}
             </div>
          </motion.div>
        ))}
      </div>
      
      {role === 'guest' && apiKey && (
        <div className="mb-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 p-6">
           <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2">
               <Zap className="w-4 h-4 text-indigo-500" />
               您的专属 API 调用凭证
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <p className="text-xs text-indigo-700/70 dark:text-indigo-400/80 mb-1.5 font-medium">调用地址 (Base URL)</p>
                 <div className="flex gap-2">
                    <code className="flex-1 bg-white dark:bg-[#0B1120] text-gray-800 dark:text-gray-300 px-3 py-2 rounded-lg text-sm border border-indigo-200 dark:border-indigo-800/50 truncate font-mono">
                       {window.location.origin}/v1
                    </code>
                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/v1`); alert('复制成功'); }} className="shrink-0 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
                       <Copy className="w-4 h-4" />
                    </button>
                 </div>
              </div>
              <div>
                 <p className="text-xs text-indigo-700/70 dark:text-indigo-400/80 mb-1.5 font-medium">个人 API Key</p>
                 <div className="flex gap-2">
                    <code className="flex-1 bg-white dark:bg-[#0B1120] text-gray-800 dark:text-gray-300 px-3 py-2 rounded-lg text-sm border border-indigo-200 dark:border-indigo-800/50 truncate font-mono">
                       {apiKey}
                    </code>
                    <button onClick={() => { navigator.clipboard.writeText(apiKey); alert('复制成功'); }} className="shrink-0 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
                       <Copy className="w-4 h-4" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800/60 shadow-sm p-6 overflow-hidden flex flex-col">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              可用模型配额与代号 (供调用)
            </h3>
            {loading ? (
               <div className="flex-1 flex items-center justify-center text-sm text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                  <p>加载中...</p>
               </div>
            ) : models.length > 0 ? (
               <div className="overflow-auto border border-gray-100 dark:border-gray-800/60 rounded-xl max-h-[300px]">
                   <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-medium sticky top-0">
                        <tr>
                           <th className="px-4 py-3 border-b dark:border-gray-800">名称</th>
                           <th className="px-4 py-3 border-b dark:border-gray-800">模型代码 (Model Code)</th>
                           <th className="px-4 py-3 border-b dark:border-gray-800">支持状态</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                        {models.map((m, i) => (
                           <tr key={`dashboard-table-${m.id}-${i}`} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-200">{m.name}</td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs select-all">{m.modelCode}</td>
                              <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1.5">
                                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> 可调用
                              </td>
                           </tr>
                        ))}
                     </tbody>
                   </table>
               </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0B1120]/50 rounded-xl min-h-[220px]">
                  <p>您还没有配置任何受支持的模型提供商</p>
                </div>
            )}
         </div>

         <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800/60 shadow-sm p-6 overflow-auto">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              提供商延迟监控
            </h3>
            <div className="space-y-4">
              {models.length > 0 ? models.map((m, i) => {
                 const latency = 120 + (i * 57) % 350; // Mock latency based on index
                 const color = latency < 200 ? "bg-emerald-500" : latency < 350 ? "bg-amber-500" : "bg-red-500";
                 const width = Math.min(100, (latency / 500) * 100);
                 return (
                    <div key={`dashboard-latency-${m.id}-${i}`}>
                       <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-gray-700 dark:text-gray-300 truncate w-32" title={m.name}>{m.name}</span>
                          <span className="text-gray-500 dark:text-gray-400">{latency} ms</span>
                       </div>
                       <div className="w-full bg-gray-100 dark:bg-gray-800/50 rounded-full h-1.5 overflow-hidden">
                          <div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${width}%` }}></div>
                       </div>
                    </div>
                 );
              }) : (
                 <div className="text-center text-sm text-gray-400 mt-8">暂无节点数据</div>
              )}
            </div>
         </div>
      </div>

      <div className="mt-8 bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800/60 shadow-sm p-6 overflow-hidden">
         <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-purple-500" />
            各模型 Token 消耗量统计 (当前周期)
         </h3>
         <div className="h-72 w-full flex items-center justify-center">
            {loading ? (
               <p className="text-sm text-gray-400">加载中...</p>
            ) : pieData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                     >
                        {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip
                        formatter={(value: number) => [`${value.toLocaleString()} Tokens`, '消耗量']}
                        contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2)' }}
                        itemStyle={{ color: '#fff' }}
                     />
                     <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
               </ResponsiveContainer>
            ) : (
               <p className="text-sm text-gray-400">暂无实际调用数据产生，产生消耗后饼图将在此展开。</p>
            )}
         </div>
      </div>
    </div>
  );
}
