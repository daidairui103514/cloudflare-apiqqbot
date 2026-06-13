import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Users, Trash2, Shield, Calendar, Key, Plus } from "lucide-react";
import { motion } from "motion/react";

interface APIUser {
  id: string;
  username: string;
  createdAt: string;
}

export default function UsersManagePage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<APIUser[]>([]);
  const [codes, setCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    Promise.all([
      fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      fetch("/api/registration-codes", { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
    ]).then(([usersData, codesData]) => {
      if (Array.isArray(usersData)) setUsers(usersData);
      if (codesData && Array.isArray(codesData.codes)) setCodes(codesData.codes);
      setLoading(false);
    }).catch(console.error);
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleDelete = (id: string, username: string) => {
    if (!confirm(`确定要移除用户「${username}」吗？移除后其 API Key 将立即失效。`)) return;
    fetch(`/api/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.ok) fetchData();
    });
  }

  const handleGenerateCode = () => {
    fetch("/api/registration-codes/generate", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.ok) fetchData();
    });
  }

  const handleDeleteCode = (code: string) => {
    if (!confirm(`确定要删除注册码「${code}」吗？`)) return;
    fetch(`/api/registration-codes/${code}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.ok) fetchData();
    });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="h-full flex flex-col p-8 lg:p-12 max-w-5xl mx-auto dark:text-gray-200">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            普通用户管理
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">查看和管理在此网关注册并使用 API Key 的普通成员。</p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Registration Codes Section */}
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                 <Key className="w-5 h-5 text-indigo-500" />
                 有效注册码管理
              </h3>
              <button onClick={handleGenerateCode} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-medium text-sm rounded-lg transition-colors flex items-center gap-1">
                 <Plus className="w-4 h-4" />
                 生成注册码
              </button>
           </div>
           <div className="p-0">
              {loading ? (
                <div className="p-8 text-center text-sm text-gray-400">加载中...</div>
              ) : codes.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">暂无有效注册码，请点击生成</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
                  {codes.map((code, i) => (
                     <div key={`code-${code}-${i}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-800 rounded-lg group">
                        <code className="text-sm font-bold text-indigo-700 dark:text-indigo-400 font-mono tracking-wider">{code}</code>
                        <button onClick={() => handleDeleteCode(code)} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-all" title="删除注册码">
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  ))}
                </div>
              )}
           </div>
        </div>

        {/* Users Section */}
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                 <Users className="w-5 h-5 text-emerald-500" />
                 已注册用户列表
              </h3>
           </div>
          {loading ? (
               <div className="p-12 text-center text-gray-400 text-sm">加载中...</div>
          ) : users.length === 0 ? (
               <div className="p-16 flex flex-col items-center justify-center text-gray-400 text-sm">
                  <Users className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-700" />
                  <p>暂无普通用户注册。</p>
               </div>
          ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                   {users.map((u, i) => (
                      <motion.div
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ delay: i * 0.05 }}
                         key={`user-${u.id}-${i}`}
                         className="flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group"
                      >
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex flex-shrink-0 items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-lg">
                               {u.username[0].toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                               <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{u.username}</h4>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                     <Shield className="w-3 h-3" />
                                     普通成员 API
                                  </span>
                               </div>
                               <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  <Calendar className="w-3 h-3 opacity-70" />
                                  <span>注册时间：{new Date(u.createdAt).toLocaleString()}</span>
                               </div>
                            </div>
                         </div>
                         <button
                            onClick={() => handleDelete(u.id, u.username)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="移除用户"
                         >
                            <Trash2 className="w-5 h-5" />
                         </button>
                      </motion.div>
                   ))}
                </div>
        )}
      </div>
     </div>
    </motion.div>
  );
}
