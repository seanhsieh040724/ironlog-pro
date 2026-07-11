import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Clock, Flame, Copy, Check, X, Share2, Sparkles, Award, Star, ListCollapse 
} from 'lucide-react';
import { WorkoutSession } from '../types';
import { lightTheme } from '../themeStyles';

interface WorkoutSummaryModalProps {
  session: WorkoutSession | null;
  onClose: () => void;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({ session, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showTextPreview, setShowTextPreview] = useState(false);

  if (!session) return null;

  // Calculate stats
  const stats = useMemo(() => {
    let totalVolume = 0;
    let totalSets = 0;
    const completedExCount = session.exercises.filter(ex => 
      ex.sets.some(s => s.completed)
    ).length;

    session.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed) {
          totalVolume += (set.weight * set.reps);
          totalSets += 1;
        }
      });
    });

    const durationMs = session.endTime 
      ? (session.endTime - (session.timerStartedAt || session.startTime))
      : 0;
    const totalMinutes = Math.max(1, Math.round(durationMs / 60000));

    return {
      totalVolume,
      totalSets,
      completedExCount,
      totalMinutes
    };
  }, [session]);

  // Generate Mood Journal Text
  const journalText = useMemo(() => {
    const dateStr = new Date(session.endTime || Date.now()).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });

    let text = `🏋️‍♂️ 【IronLog 鋼鐵日記】 ${session.title}\n`;
    text += `📅 日期：${dateStr}\n`;
    text += `⏱️ 訓練時間：${stats.totalMinutes} 分鐘\n`;
    text += `💪 累計起重：${stats.totalVolume.toLocaleString()} kg | 總組數：${stats.totalSets} 組\n\n`;
    text += `📋 訓練成果細節：\n`;

    session.exercises.forEach((ex, idx) => {
      const completedSets = ex.sets.filter(s => s.completed);
      if (completedSets.length > 0) {
        text += `${idx + 1}. ${ex.name} (${completedSets.length} 組)\n`;
        completedSets.forEach((set, sIdx) => {
          text += `   [組 ${sIdx + 1}] ${set.weight} kg × ${set.reps} 次\n`;
        });
      }
    });

    return text;
  }, [session, stats]);

  // Copy to Clipboard with fallback for restricted iframe environments
  const handleCopy = () => {
    const success = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(journalText)
        .then(success)
        .catch(() => fallbackCopy(journalText, success));
    } else {
      fallbackCopy(journalText, success);
    }
  };

  const fallbackCopy = (text: string, cb: () => void) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      // Prevent scrolling to bottom
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) cb();
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-md bg-white rounded-[40px] border border-black/10 overflow-hidden shadow-[0_24px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-black/5 flex justify-between items-center bg-gradient-to-r from-slate-550/5 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#CCFF00] text-black rounded-2xl shadow-sm border border-black/5">
              <Trophy className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-black">訓練大功告成！</h3>
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mt-0.5">WORKOUT ACCOMPLISHED</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 active:scale-90 rounded-full transition-all text-slate-450"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="p-6 space-y-6 overflow-y-auto no-scrollbar flex-1">
          {/* Card Layout */}
          <div className="bg-[#111111] text-white rounded-[32px] p-6 relative overflow-hidden shadow-xl border border-white/5">
            {/* Dynamic decorative backdrop circles */}
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#CCFF00]/10 rounded-full blur-2xl" />
            <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-[#82CC00]/15 rounded-full blur-2xl" />
            
            {/* Banner info */}
            <div className="flex justify-between items-start mb-6 relative">
              <div>
                <span className="text-[9px] font-black tracking-[0.2em] bg-[#CCFF00] text-black px-2.5 py-1 rounded-full uppercase leading-none block w-fit mb-2">
                  每日鋼鐵成就
                </span>
                <h4 className="text-2xl font-black tracking-tight leading-tight uppercase">
                  {session.title}
                </h4>
              </div>
              <Sparkles className="w-6 h-6 text-[#CCFF00] animate-pulse" />
            </div>

            {/* Core Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6 relative">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center text-center shadow-inner">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Flame className="w-4 h-4 text-orange-400 fill-current" />
                  <span className="text-[10px] font-black uppercase tracking-wider">總起重量</span>
                </div>
                <span className="text-2xl font-black text-[#CCFF00]">
                  {stats.totalVolume.toLocaleString()} <span className="text-xs text-white">kg</span>
                </span>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center text-center shadow-inner">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-wider">訓練時間</span>
                </div>
                <span className="text-2xl font-black text-white">
                  {stats.totalMinutes} <span className="text-xs text-slate-400">分鐘</span>
                </span>
              </div>
            </div>

            {/* Multi-stats banner */}
            <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 flex justify-around items-center text-center">
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">完成動作</p>
                <p className="text-lg font-black text-white">{stats.completedExCount} 個</p>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">完成組數</p>
                <p className="text-lg font-black text-[#CCFF00]">{stats.totalSets} 組</p>
              </div>
            </div>
          </div>

          {/* Collapsible Diary Preview */}
          <div className="space-y-3">
            <button 
              onClick={() => setShowTextPreview(!showTextPreview)}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 border border-black/5 hover:bg-slate-100 transition-all rounded-2xl"
            >
              <div className="flex items-center gap-2.5">
                <ListCollapse className="w-4 h-4 text-black" />
                <span className="text-[12px] font-black text-black uppercase tracking-wider">預覽心情日記格式</span>
              </div>
              <span className="text-[11px] font-black text-[#82CC00] uppercase">
                {showTextPreview ? '收合' : '展開'}
              </span>
            </button>

            <AnimatePresence>
              {showTextPreview && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-slate-50 border border-black/5 rounded-2xl p-4 font-mono text-[11px] text-slate-600 whitespace-pre-wrap leading-relaxed shadow-inner max-h-48 overflow-y-auto">
                    {journalText}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-black/5 bg-slate-50/50 flex flex-col gap-3.5 shrink-0">
          <button
            onClick={handleCopy}
            className={`w-full font-black h-12 rounded-2xl uppercase text-[13px] tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-[0.98] ${copied ? 'bg-emerald-500 text-white shadow-emerald-500/10' : 'bg-[#CCFF00] text-black hover:bg-[#b5e000]'}`}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 stroke-[3]" /> 已複製到剪貼簿！
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" /> 複製今日心情日誌
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="w-full font-black h-12 bg-black text-white hover:bg-black/90 active:scale-[0.98] rounded-2xl uppercase text-[13px] tracking-wider transition-all flex items-center justify-center"
          >
            關閉並返回首頁
          </button>
        </div>
      </motion.div>
    </div>
  );
};
