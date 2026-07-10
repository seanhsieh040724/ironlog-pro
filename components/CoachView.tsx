import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import { BodyMetric, UserGoal } from '../types';
import { chatWithCoach } from '../services/aiService';
import { 
  Bot, Send, Loader2, Sparkles, User, Dumbbell, Flame, Target, 
  MessageCircle, RefreshCw, Sparkle, ArrowRightLeft, ShieldCheck, HeartPulse
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { lightTheme } from '../themeStyles';
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
  
  const bodyMetrics = context?.bodyMetrics || [];
  const goal: UserGoal = context?.goal || { type: 'maintain', targetWeight: 0, startWeight: 0, activityLevel: 1.55 };

  const latest: BodyMetric = bodyMetrics[0] || { id: '', date: Date.now(), weight: 70, height: 175, age: 25, gender: 'male' };

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('ironlog_coach_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback to initial message
      }
    }
    return [
      {
        id: 'welcome',
        role: 'model',
        text: `你好！我是你的專屬 AI 鋼鐵教練（IronLog AI Coach）。我已經載入了你當前的身體數據：
- **目前體重**：${latest.weight} KG 
- **目標體重**：${goal.targetWeight} KG (${goal.type === 'bulk' ? '積極增肌' : goal.type === 'cut' ? '高效減脂' : '健康維持體態'})

我準備好為你解答所有**重訓課表規劃、重訓動作教學、補劑使用以及專屬健身營養建議**了！
你可以直接在下方輸入訊息，或點擊下方的建議問題來開始我們今天的訓練對話！`,
        timestamp: Date.now()
      }
    ];
  });
  
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    localStorage.setItem('ironlog_coach_chat_history', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Format messages for @google/genai format
    const formattedMessagesForGemini = [...messages, userMsg].map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const aiResponseText = await chatWithCoach(formattedMessagesForGemini, latest, goal);

    const modelMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'model',
      text: aiResponseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, modelMsg]);
    setIsTyping(false);
  };

  const clearChat = () => {
    if (confirm('確定要清除與 AI 教練的所有對話紀錄嗎？')) {
      const initial: ChatMessage[] = [
        {
          id: 'welcome',
          role: 'model',
          text: `對話紀錄已重設。我是你的專屬 AI 鋼鐵教練。已重新載入你當前的身體數據：
- **目前體重**：${latest.weight} KG
- **目標體重**：${goal.targetWeight} KG

今天有什麼我可以幫你的重訓或飲食規劃嗎？`,
          timestamp: Date.now()
        }
      ];
      setMessages(initial);
      localStorage.removeItem('ironlog_coach_chat_history');
    }
  };

  const suggestions = [
    "幫我設計一份一週胸肌特訓課表",
    "減脂期我該怎麼安排三大營養素比例？",
    "如何提升深蹲、臥推、硬舉的力量基底？",
    "推薦一些高性價比的增肌減脂日常食物"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] relative overflow-hidden">
      {/* 頂部教練狀態與藍圖摘要 */}
      <div className="flex-none p-1 pb-4">
        <div style={{ backgroundColor: lightTheme.bg }} className="rounded-[32px] p-5 border border-black/5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-black flex items-center justify-center text-[#CCFF00] shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-black uppercase tracking-tight">AI 鋼鐵教練</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">IRONLOG AI COACH • 24/7 在線</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={clearChat}
              title="清除對話"
              className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-black"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 身體指標與教練同步提示 */}
      <div className="flex-none px-1 pb-3">
        <div className="bg-slate-100 rounded-2xl p-3.5 border border-black/5 flex items-center justify-between text-[11px] font-bold text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>身體指標與專屬建議已即時與 AI 教練完全同步。</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 bg-white rounded-lg border border-black/5 text-[10px] text-black font-black">
            <HeartPulse className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> {latest.weight} KG
          </div>
        </div>
      </div>

      {/* 聊天訊息線索 */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 py-2 px-1">
        {messages.map((m) => {
          const isModel = m.role === 'model';
          return (
            <div
              key={m.id}
              className={`flex gap-3.5 ${isModel ? 'justify-start' : 'justify-end'}`}
            >
              {isModel && (
                <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-[#CCFF00] shrink-0 self-start shadow-sm border border-black/5">
                  <Bot className="w-5 h-5" />
                </div>
              )}
              
              <div
                className={`max-w-[82%] px-5 py-4 rounded-[26px] text-xs leading-relaxed font-medium shadow-sm ${
                  isModel 
                    ? 'bg-white border border-black/5 text-black rounded-tl-sm' 
                    : 'bg-black text-white rounded-tr-sm'
                }`}
              >
                <div className="prose prose-sm text-inherit markdown-body overflow-x-auto text-[11px] leading-relaxed">
                  <Markdown>{m.text}</Markdown>
                </div>
                <div className={`text-[8px] mt-2 font-bold ${isModel ? 'text-slate-400' : 'text-slate-500'} text-right`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {!isModel && (
                <div className="w-9 h-9 rounded-xl bg-[#CCFF00] flex items-center justify-center text-black shrink-0 self-start shadow-sm border border-black/5">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3.5 justify-start">
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-[#CCFF00] shrink-0 self-start shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white border border-black/5 max-w-[80%] px-6 py-4 rounded-[26px] rounded-tl-sm flex items-center gap-2 shadow-sm text-xs text-slate-400 font-bold">
              <Loader2 className="w-4 h-4 animate-spin text-black shrink-0" />
              <span>教練思考並撰寫重訓菜單中...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* 快捷回覆問題氣泡 */}
      {messages.length <= 2 && !isTyping && (
        <div className="flex-none px-1 py-2 overflow-x-auto no-scrollbar flex gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSendMessage(s)}
              className="bg-white hover:bg-slate-50 border border-black/5 py-2 px-4 rounded-xl text-[10px] text-black font-black whitespace-nowrap active:scale-95 transition-all shadow-sm shrink-0 flex items-center gap-1.5"
            >
              <Sparkle className="w-3 h-3 text-amber-500 shrink-0" /> {s}
            </button>
          ))}
        </div>
      )}

      {/* 輸入底部列 */}
      <div className="flex-none p-1 pt-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputMessage);
          }}
          className="flex gap-2.5"
        >
          <input
            type="text"
            placeholder="輸入你想問教練的話..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isTyping}
            style={{ color: '#000000' }}
            className="flex-1 bg-white border border-black/10 rounded-2xl px-5 h-14 text-sm font-bold outline-none focus:border-black transition-all shadow-sm placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            style={{ backgroundColor: '#000000' }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white active:scale-95 transition-all shadow-md disabled:opacity-40 disabled:scale-100 shrink-0"
          >
            <Send className="w-5.5 h-5.5 text-[#CCFF00] stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
};
