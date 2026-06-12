import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Users, Trash2, Shield, Calendar, Key, Plus } from "lucide-react";

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
    <div className="h-full flex flex-col p-8 lg:p-12 max-w-5xl mx-auto dark:text-gray-200">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            普通用户管理
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">查看和管理在此网关注册并使用 API Key 的普通成员。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white dark:bg-[#111827] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden h-fit">
           <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                 <Key className="w-5 h-5 text-indigo-500" />
                 有效注册码
              </h3>
              <button onClick={handleGenerateCode} className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors" title="生成注册码">
                 <Plus className="w-5 h-5" />
              </button>
           </div>
           <div className="p-6">
              {loading ? (
                <div className="text-center text-sm text-gray-400">加载中...</div>
              ) : codes.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-4">暂无有效注册码，请生成</div>
              ) : (
                <ul className="space-y-3">
                  {codes.map(code => (
                     <li key={code} className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-800 rounded-lg group">
                        <div className="flex justify-between items-center w-full">
                          <code className="text-sm font-bold text-indigo-700 dark:text-indigo-400 font-mono tracking-wider">{code}</code>
                          <button onClick={() => handleDeleteCode(code)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-all">
                             <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                     </li>
                  ))}
                </ul>
              )}
           </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden min-h-[400px]">
          {loading ? (
               <div className="p-8 text-center text-gray-400 text-sm">加载中...</div>
          ) : users.length === 0 ? (
               <div className="p-16 flex flex-col items-center justify-center text-gray-400 text-sm">
                  <Users className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-700" />
                  <p>暂无普通用户注册。</p>
               </div>
          ) : (
               <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-medium">
                   <tr>
                      <th className="px-6 py-4">登录账号</th>
                      <th className="px-6 py-4">注册时间</th>
                      <th className="px-6 py-4">用户角色</th>
                      <th className="px-6 py-4 text-right">操作</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                   {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-indigo-900/10 transition-colors">
                         <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold">
                               {u.username[0].toUpperCase()}
                            </div>
                            {u.username}
                         </td>
                         <td className="px-6 py-4 text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <Calendar className="w-4 h-4 opacity-70" />
                            {new Date(u.createdAt).toLocaleDateString()}
                         </td>
                         <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                               <Shield className="w-3.5 h-3.5" />
                               普通成员 API
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button
                               onClick={() => handleDelete(u.id, u.username)}
                               className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                            >
                               <Trash2 className="w-4 h-4" /> 移除访问
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
        )}
      </div>
     </div>
    </div>
  );
}
