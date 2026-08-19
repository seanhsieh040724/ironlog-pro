import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import { BodyMetric, UserGoal } from '../types';
import { chatWithCoach } from '../services/aiService';
import { 
  Send, Loader2, Sparkles, User, Trash2, Copy, Check, Sparkle, Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export const CoachView: React.FC = () => {
  const context = useContext(AppContext);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const bodyMetrics = context?.bodyMetrics || [];
  const goal: UserGoal = context?.goal || { type: 'maintain', targetWeight: 0, startWeight: 0, activityLevel: 1.55 };
  const latest: BodyMetric = bodyMetrics[0] || { id: '', date: Date.now(), weight: 75, height: 178, age: 26, gender: 'male' };

  const [inputMessage, setInputMessage] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // AI 剩餘額度 (預設 10 次，支援持久化)
  const [aiQuota, setAiQuota] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ironlog_coach_ai_quota');
      return saved !== null ? Number(saved) : 10;
    } catch {
      return 10;
    }
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('ironlog_coach_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('ironlog_coach_chat_history', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('ironlog_coach_ai_quota', String(aiQuota));
  }, [aiQuota]);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: textToSend.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // 扣除額度 (最低保留 0，不鎖死使用)
    setAiQuota(prev => Math.max(0, prev - 1));

    const formattedMessagesForGemini = [...messages, userMsg].map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    try {
      const aiResponseText = await chatWithCoach(formattedMessagesForGemini, latest, goal, 'taiwanese');

      const modelMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: aiResponseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: '教練目前連線繁忙，請稍後再試一次！',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('ironlog_coach_chat_history');
    setShowClearConfirm(false);
  };

  // 截圖中的 4 個快捷按鈕
  const quickActions = [
    {
      icon: '💪',
      label: '幫我安排今日課表',
      prompt: '請根據我目前的身體數據與目標，幫我安排一份高效的今日訓練課表（包含熱身、正式組動作、重量組數與次數建議）。'
    },
    {
      icon: '📈',
      label: '查看近期進度',
      prompt: '請幫我分析我目前的訓練數據與身體指標進度，並評估目前的成效與後續調整方向。'
    },
    {
      icon: '🥩',
      label: '今天吃什麼好？',
      prompt: '請根據我的體態目標與每日熱量需求，推薦我今天健康又高蛋白的三餐與點心選擇（包含超商或外食選項）。'
    },
    {
      icon: '🎯',
      label: '動作指導建議',
      prompt: '請為我提供重量訓練核心動作（如深蹲、硬舉、臥推、划船等）的標準發力要領、常見代償錯誤與受傷預防指導建議！'
    }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-175px)] relative overflow-hidden bg-white/50 rounded-[32px] p-2 md:p-3">
      {/* 頂部標題列 (與截圖完全一致：🤖 IronLog 教練 + 垃圾桶圖示) */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-black/5 flex-none">
        <div className="w-8" /> {/* 佔位保持標題置中 */}
        <div className="flex items-center gap-1.5">
          <span className="text-xl">🤖</span>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">IronLog 教練</h1>
        </div>
        <button
          onClick={() => {
            if (messages.length > 0) {
              setShowClearConfirm(true);
            }
          }}
          disabled={messages.length === 0}
          title="清除聊天紀錄"
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors"
        >
          <Trash2 className="w-5 h-5 stroke-[1.8]" />
        </button>
      </div>

      {/* 主內容區：訊息為空時顯示置中機器人，有訊息時滾動顯示對話 */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-2 py-3 space-y-4">
        {messages.length === 0 ? (
          /* 空狀態：與截圖 100% 一致的置中教練頭像與歡迎詞 */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col items-center justify-center text-center px-4 py-8 space-y-4"
          >
            {/* 置中圓形機器人頭像 (淡綠色圓底) */}
            <div className="w-24 h-24 rounded-full bg-[#EAF7D7] border border-[#82CC00]/25 flex items-center justify-center text-4xl shadow-sm">
              <span>🤖</span>
            </div>

            {/* 教練名稱與副標題 */}
            <div className="space-y-2 max-w-xs">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                IronLog 教練
              </h2>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                關於訓練、飲食或恢復，隨時打字問我吧！
              </p>
            </div>
          </motion.div>
        ) : (
          /* 對話訊息列表 */
          <div className="space-y-4 pt-1">
            {messages.map((m) => {
              const isModel = m.role === 'model';
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${isModel ? 'justify-start' : 'justify-end'}`}
                >
                  {isModel && (
                    <div className="w-8 h-8 rounded-full bg-[#EAF7D7] border border-[#82CC00]/30 flex items-center justify-center text-base shrink-0 self-start shadow-2xs mt-0.5">
                      <span>🤖</span>
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-[24px] text-xs md:text-sm leading-relaxed font-medium shadow-2xs relative group ${
                      isModel
                        ? 'bg-white border border-black/8 text-slate-900 rounded-tl-xs px-4 py-3.5'
                        : 'bg-[#18392B] text-white rounded-tr-xs px-4 py-3'
                    }`}
                  >
                    <div className="prose prose-sm text-inherit markdown-body overflow-x-auto text-xs md:text-sm leading-relaxed">
                      <Markdown>{m.text}</Markdown>
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-black/5">
                      <span className="text-[9px] font-bold text-slate-400">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {isModel && (
                        <button
                          onClick={() => handleCopyMessage(m.id, m.text)}
                          className="text-[10px] text-slate-400 hover:text-black flex items-center gap-1 font-bold transition-colors"
                        >
                          {copiedMessageId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#82CC00]" />
                              <span className="text-[#82CC00]">已複製</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>複製建議</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {!isModel && (
                    <div className="w-8 h-8 rounded-full bg-[#CCFF00] flex items-center justify-center text-black font-black text-xs shrink-0 self-start shadow-2xs mt-0.5">
                      <User className="w-4 h-4 text-black" />
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* 思考中狀態 */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2.5 justify-start"
              >
                <div className="w-8 h-8 rounded-full bg-[#EAF7D7] border border-[#82CC00]/30 flex items-center justify-center text-base shrink-0 self-start shadow-2xs mt-0.5">
                  <span>🤖</span>
                </div>
                <div className="bg-white border border-black/8 max-w-[85%] px-4 py-3 rounded-[24px] rounded-tl-xs flex items-center gap-2.5 shadow-2xs text-xs text-slate-600 font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#18392B] shrink-0" />
                  <span>教練正在思考並整理建議...</span>
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* 底部功能區 (2x2 快捷按鈕 + 額度標示 + 輸入框) */}
      <div className="flex-none pt-2 border-t border-black/5 space-y-2.5 px-1">
        {/* 4 個快捷問題按鈕 (2x2 網格，與截圖完全一致) */}
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(action.prompt)}
              disabled={isTyping}
              className="py-3 px-3 rounded-2xl border border-slate-300 hover:border-[#18392B] bg-white hover:bg-[#CCFF00]/10 text-slate-900 font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-2xs disabled:opacity-50"
            >
              <span className="text-sm">{action.icon}</span>
              <span className="truncate">{action.label}</span>
            </button>
          ))}
        </div>

        {/* 剩餘 AI 額度標示 (與截圖完全一致) */}
        <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-400">
          <span>剩餘 AI 額度：{aiQuota}</span>
          {aiQuota <= 2 && (
            <button
              onClick={() => setAiQuota(10)}
              className="text-[#82CC00] hover:underline font-black"
            >
              補充額度
            </button>
          )}
        </div>

        {/* 輸入框與發送按鈕 (圓角長條 + 右側墨綠色圓形發送鍵) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputMessage);
          }}
          className="flex items-center gap-2"
        >
          <div className="flex-1 relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              placeholder="問教練任何問題..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isTyping}
              style={{ color: '#000000' }}
              className="w-full bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-black rounded-full px-5 h-12 text-xs md:text-sm font-bold outline-none transition-all placeholder:text-slate-400 placeholder:font-medium shadow-2xs"
            />
            {inputMessage && (
              <button
                type="button"
                onClick={() => setInputMessage('')}
                className="absolute right-3.5 text-slate-400 hover:text-black text-xs font-black p-1"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="w-12 h-12 rounded-full bg-[#18392B] hover:bg-[#122c21] active:scale-95 disabled:opacity-40 disabled:scale-100 flex items-center justify-center text-white shadow-md transition-all shrink-0"
          >
            <Send className="w-4 h-4 text-white fill-white ml-0.5" />
          </button>
        </form>
      </div>

      {/* 清除對話確認彈窗 */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-5 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[28px] p-6 max-w-xs w-full shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">清除對話紀錄？</h3>
              <p className="text-xs text-slate-500 font-medium">
                這將清空與教練的聊天記錄並回到初始引導畫面。
              </p>
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
                >
                  取消
                </button>
                <button
                  onClick={handleClearChat}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md"
                >
                  確認清除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
