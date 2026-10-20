import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import { BodyMetric, UserGoal } from '../types';
import { chatWithCoach } from '../services/aiService';
import { useEntitlement } from '../services/storeKitBridge';
import { ProPaywall } from './ProPaywall';
import { 
  Send, Sparkles, Trash2, Copy, Check, Lock, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

/**
 * 自訂 ChatGPT iOS 風格的 Markdown 排版元件
 * 移除厚重卡片，提供舒適行高、段落間距、層級標題與清晰清單
 */
const markdownComponents = {
  h1: ({ children }: any) => (
    <h1 className="text-base sm:text-lg font-black text-slate-900 mt-3.5 mb-1.5 first:mt-0 tracking-tight">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-sm sm:text-base font-black text-slate-900 mt-3 mb-1 first:mt-0 tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-sm font-bold text-slate-900 mt-2 mb-1 first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }: any) => (
    <p className="text-slate-800 text-sm leading-relaxed mb-2.5 last:mb-0">
      {children}
    </p>
  ),
  strong: ({ children }: any) => (
    <strong className="font-black text-slate-950">
      {children}
    </strong>
  ),
  ul: ({ children }: any) => (
    <ul className="my-2 space-y-1.5 pl-4 list-disc marker:text-[#82CC00] text-sm text-slate-800">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="my-2 space-y-1.5 pl-4 list-decimal marker:text-slate-500 marker:font-bold text-sm text-slate-800">
      {children}
    </ol>
  ),
  li: ({ children }: any) => (
    <li className="leading-relaxed">
      {children}
    </li>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-2 border-[#82CC00] pl-3 my-2 text-slate-600 italic bg-slate-50/80 py-1 rounded-r-lg">
      {children}
    </blockquote>
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-3 rounded-xl border border-slate-200">
      <table className="w-full text-xs text-left border-collapse">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: any) => (
    <th className="bg-slate-100 font-bold text-slate-900 px-3 py-1.5 border-b border-slate-200">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-3 py-1.5 border-b border-slate-100 text-slate-700">
      {children}
    </td>
  ),
  code: ({ children, inline }: any) => (
    inline ? (
      <code className="bg-slate-100 text-slate-900 px-1 py-0.5 rounded text-xs font-mono font-bold">
        {children}
      </code>
    ) : (
      <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl overflow-x-auto my-2 text-xs font-mono">
        <code>{children}</code>
      </pre>
    )
  ),
};

export const CoachView: React.FC = () => {
  const context = useContext(AppContext);
  const entitlement = useEntitlement();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const bodyMetrics = context?.bodyMetrics || [];
  const goal: UserGoal = context?.goal || { type: 'maintain', targetWeight: 0, startWeight: 0, activityLevel: 1.55 };
  const latest: BodyMetric = bodyMetrics[0] || { id: '', date: Date.now(), weight: 75, height: 178, age: 26, gender: 'male' };

  const [inputMessage, setInputMessage] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);

  // 當使用者訂閱為 Pro 時，自動關閉 Paywall
  useEffect(() => {
    if (entitlement.isPro) {
      setShowPaywall(false);
    }
  }, [entitlement.isPro]);

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

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    // 嚴格 Pro 權限檢驗：未訂閱者完全不能呼叫 /api/coach，直接開啟 Paywall 並結束
    if (!entitlement.isPro) {
      setShowPaywall(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: textToSend.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // 過濾歷史中的錯誤提示訊息，避免錯誤紀錄干擾後續 AI 生成
    const ERROR_PHRASES = [
      '正在跑步機上狂奔',
      '連線繁忙',
      '無法回應',
      '請檢查網路',
      '暫時無法使用'
    ];

    const validHistory = messages.filter(
      m => !ERROR_PHRASES.some(phrase => m.text.includes(phrase))
    );

    // 格式化對話紀錄，確保 Gemini API 規範：第一則必為 user 且嚴格交替
    const cleanHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
    for (const msg of [...validHistory, userMsg]) {
      if (cleanHistory.length === 0 && msg.role === 'model') {
        continue;
      }
      const last = cleanHistory[cleanHistory.length - 1];
      if (last && last.role === msg.role) {
        last.parts[0].text += `\n${msg.text}`;
      } else {
        cleanHistory.push({
          role: msg.role,
          parts: [{ text: msg.text }]
        });
      }
    }

    try {
      const aiResponseText = await chatWithCoach(cleanHistory, latest, goal, 'taiwanese');

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
        text: 'AI 鋼鐵教練正在跑步機上狂奔，暫時無法回應，請確認網路連線並稍候再試。',
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

  // 保留原有 4 個快捷問題按鈕
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
    <div className="flex flex-col h-[calc(100vh-175px)] relative overflow-hidden bg-white/70 rounded-[28px] border border-black/5 p-2 sm:p-3 shadow-xs">
      {/* 頂部標題列 (極簡乾淨的 ChatGPT 頂欄風格) */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-black/5 flex-none">
        <div className="w-8" />
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🤖</span>
          <h1 className="text-base font-black text-slate-900 tracking-tight">IronLog 教練</h1>
        </div>
        <button
          onClick={() => {
            if (messages.length > 0) {
              setShowClearConfirm(true);
            }
          }}
          disabled={messages.length === 0}
          title="清除聊天紀錄"
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4 stroke-[1.8]" />
        </button>
      </div>

      {/* 主內容區：訊息滾動顯示對話 (ChatGPT iOS 垂直節奏) */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-2 sm:px-3 py-4 space-y-6">
        {messages.length === 0 ? (
          /* 空狀態：簡約教練引導畫面 */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col items-center justify-center text-center px-4 py-8 space-y-3"
          >
            <div className="w-20 h-20 rounded-full bg-[#F0FDF4] border border-[#82CC00]/30 flex items-center justify-center text-4xl shadow-2xs">
              <span>🤖</span>
            </div>

            <div className="space-y-1.5 max-w-xs">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                IronLog AI 鋼鐵教練
              </h2>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                我是你的專屬健身助手，關於訓練排程、重量突破、飲食菜單或運動恢復，隨時問我！
              </p>
            </div>
          </motion.div>
        ) : (
          /* 對話訊息列表 (ChatGPT iOS 式：右側淡色氣泡，左側無框排版) */
          <div className="space-y-6 pt-1">
            {messages.map((m) => {
              const isModel = m.role === 'model';
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex ${isModel ? 'justify-start' : 'justify-end'}`}
                >
                  {isModel ? (
                    /* AI 教練回覆：ChatGPT 式無框排版，專注文字閱讀 */
                    <div className="flex gap-2.5 sm:gap-3 items-start max-w-[96%] sm:max-w-[92%]">
                      <div className="w-6 h-6 rounded-full bg-[#F0FDF4] border border-[#82CC00]/30 flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                        🤖
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-800 text-sm leading-relaxed overflow-x-auto selection:bg-[#CCFF00] selection:text-black">
                          <Markdown components={markdownComponents}>{m.text}</Markdown>
                        </div>

                        <div className="flex items-center gap-3 mt-2.5 text-slate-400 text-[10px] select-none">
                          <span>
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          {(m.text.includes('正在跑步機上狂奔') || m.text.includes('連線繁忙') || m.text.includes('稍候再試')) && (
                            <button
                              onClick={() => {
                                const msgIndex = messages.findIndex(msg => msg.id === m.id);
                                const prevUserMsg = [...messages.slice(0, msgIndex)].reverse().find(msg => msg.role === 'user');
                                if (prevUserMsg) {
                                  setMessages(prev => prev.filter(msg => msg.id !== m.id));
                                  handleSendMessage(prevUserMsg.text);
                                }
                              }}
                              className="text-amber-700 hover:text-amber-900 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1 font-bold transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>重試</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleCopyMessage(m.id, m.text)}
                            className="hover:text-slate-700 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                          >
                            {copiedMessageId === m.id ? (
                              <>
                                <Check className="w-3 h-3 text-[#10B981]" />
                                <span className="text-[#10B981]">已複製</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>複製建議</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* 使用者提問：簡潔右側淡色氣泡 */
                    <div className="max-w-[82%] sm:max-w-[76%] rounded-[20px] rounded-br-xs bg-[#F4F4F6] border border-slate-200/50 text-slate-900 px-4 py-2.5 shadow-2xs">
                      <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap break-words text-slate-900">
                        {m.text}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium text-right mt-1 select-none">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* 思考中狀態 (ChatGPT 呼吸圓點微動態) */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2.5 sm:gap-3 items-center justify-start"
              >
                <div className="w-6 h-6 rounded-full bg-[#F0FDF4] border border-[#82CC00]/30 flex items-center justify-center text-xs shrink-0 shadow-2xs">
                  🤖
                </div>
                <div className="flex items-center gap-2 py-1 text-xs text-slate-500 font-medium">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>教練正在思考建議...</span>
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* 底部功能區 (2x2 快捷按鈕 + 會員狀態標示 + 簡潔輸入框) */}
      <div className="flex-none pt-2 border-t border-black/5 space-y-2 px-1">
        {/* 4 個快捷問題按鈕 (2x2 網格，輕巧低彩度) */}
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (!entitlement.isPro) {
                  setShowPaywall(true);
                  return;
                }
                handleSendMessage(action.prompt);
              }}
              disabled={isTyping}
              className="py-2.5 px-3 rounded-2xl border border-slate-200/90 hover:border-slate-300 bg-slate-50/80 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <span className="text-sm">{action.icon}</span>
              <span className="truncate">{action.label}</span>
              {!entitlement.isPro && (
                <Lock className="w-3 h-3 text-slate-400 shrink-0 ml-0.5" />
              )}
            </button>
          ))}
        </div>

        {/* AI 教練會員狀態標示 */}
        <div className="flex items-center justify-between px-1 text-[11px] font-bold">
          {entitlement.isPro ? (
            <span className="text-[#82CC00] font-black flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#82CC00]" />
              <span>Pro 尊榮版：AI 鋼鐵教練無限次對話使用中</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setShowPaywall(true)}
              className="flex items-center justify-between w-full text-slate-500 hover:text-black transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-600" />
                <span>AI 鋼鐵教練為 Pro 專屬功能</span>
              </span>
              <span className="text-black bg-[#CCFF00] hover:bg-[#b8e600] px-2.5 py-0.5 rounded-full font-black text-[10px] flex items-center gap-1 shadow-2xs transition-all active:scale-95">
                <Sparkles className="w-2.5 h-2.5 text-black" />
                <span>升級 Pro 解鎖</span>
              </span>
            </button>
          )}
        </div>

        {/* 簡潔的輸入框與發送按鈕 (ChatGPT 淺灰膠囊風格) */}
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
              placeholder={entitlement.isPro ? "問教練任何問題..." : "升級 Pro 解鎖向教練提問..."}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isTyping}
              style={{ color: '#000000' }}
              className="w-full bg-[#F4F4F6] hover:bg-[#EEEEF1] focus:bg-white border border-slate-200/80 focus:border-slate-400 rounded-full pl-4 pr-10 h-11 text-sm text-slate-900 font-medium outline-none transition-all placeholder:text-slate-400 placeholder:font-normal shadow-2xs"
            />
            {inputMessage && (
              <button
                type="button"
                onClick={() => setInputMessage('')}
                className="absolute right-3.5 text-slate-400 hover:text-black text-xs font-black p-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="w-11 h-11 rounded-full bg-slate-900 hover:bg-black active:scale-95 disabled:opacity-30 disabled:scale-100 flex items-center justify-center text-white shadow-sm transition-all shrink-0 cursor-pointer"
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
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleClearChat}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer"
                >
                  確認清除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 共用 IronLog Pro Paywall */}
      <ProPaywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        featureTitle="AI 鋼鐵教練"
        featureDescription="升級 IronLog Pro 即可享受無限次即時 AI 教練對話與專屬指導。"
      />
    </div>
  );
};
