import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant", content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      // Use SSE streaming
      const res = await fetch("/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          model: "web-ai", // This triggers the backend to use webAiModelId
          messages: [...messages, { role: "user", content: userMessage }],
          stream: true,
        }),
      });

      if (!res.ok) {
         setMessages(prev => [...prev, { role: "assistant", content: "抱歉，请求模型失败，请检查设置中的模型是否可用。" }]);
         setLoading(false);
         return;
      }

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
           if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                 const data = JSON.parse(line.slice(6));
                 const content = data.choices[0]?.delta?.content || "";
                 setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content += content;
                    return newMessages;
                 });
              } catch (e) {
                 // ignore parse err for incomplete chunks
              }
           }
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "请求出错，请重试。" }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
     setMessages([]);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-transform hover:scale-110 z-40"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{ height: "500px", maxHeight: "calc(100vh - 120px)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white">
              <div className="flex items-center gap-2 font-medium">
                <Bot className="w-5 h-5" />
                AI 助手
              </div>
              <div className="flex items-center gap-2">
                 {messages.length > 0 && (
                    <button onClick={clearChat} className="p-1.5 hover:bg-white/20 rounded transition-colors" title="清除对话">
                       <Trash2 className="w-4 h-4" />
                    </button>
                 )}
                 <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded transition-colors">
                   <X className="w-5 h-5" />
                 </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                  <Bot className="w-12 h-12 mb-3 opacity-50" />
                  <p>你好！我是您的 AI 助手。</p>
                  <p className="mt-1">您可以问我任何问题。</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={`${m.role}-${i}`} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center text-white ${m.role === "user" ? "bg-indigo-500" : "bg-emerald-500"}`}>
                    {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm ${
                    m.role === "user" 
                    ? "bg-indigo-600 text-white rounded-tr-sm" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm w-full"
                  }`}>
                     <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                  </div>
                </div>
              ))}
              {loading && messages[messages.length - 1]?.role !== "assistant" && (
                 <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                      <Bot className="w-4 h-4" />
                   </div>
                   <div className="px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 rounded-tl-sm flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="p-3 bg-gray-50 dark:bg-[#0B1120] border-t border-gray-200 dark:border-gray-800 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="输入消息..."
                className="flex-1 bg-white dark:bg-[#111827] border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
