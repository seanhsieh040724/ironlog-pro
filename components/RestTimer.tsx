import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Timer, X, RotateCcw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { lightTheme } from '../themeStyles';

interface RestTimerProps {
  active: boolean;
  seconds: number;
  onClose: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({ active, seconds: initialSeconds, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [configSeconds, setConfigSeconds] = useState(initialSeconds);
  const targetTimeRef = useRef<number | null>(null);
  const notificationSentRef = useRef<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audioRef.current.load();
  }, []);

  const handleTimerEnd = useCallback(() => {
    if (notificationSentRef.current) return;
    notificationSentRef.current = true;
    if (audioRef.current) audioRef.current.play().catch(e => console.debug("Audio play blocked", e));
    if ('vibrate' in navigator) navigator.vibrate([500, 150, 500, 150, 300]);
    if ("Notification" in window && Notification.permission === "granted") {
      const n = new Notification("IronLog: 休息結束！", {
        body: "該開始下一組訓練了。鋼鐵般的意志，不能停下！",
        tag: 'rest-timer-end',
        requireInteraction: true,
        silent: false
      });
      n.onclick = () => { window.focus(); onClose(); };
    }
  }, [onClose]);

  useEffect(() => {
    if (!active) { targetTimeRef.current = null; notificationSentRef.current = false; return; }
    if (targetTimeRef.current === null) targetTimeRef.current = Date.now() + (configSeconds * 1000);
    const updateTimer = () => {
      if (!targetTimeRef.current) return;
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((targetTimeRef.current - now) / 1000));
      setTimeLeft(diff);
      if (diff <= 0) { handleTimerEnd(); clearInterval(interval); }
    };
    const interval = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(interval);
  }, [active, configSeconds, handleTimerEnd]);

  if (!active) return null;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, '0')}`;
  };

  const handleQuickSelect = (s: number) => {
    setConfigSeconds(s);
    targetTimeRef.current = Date.now() + (s * 1000);
    notificationSentRef.current = false;
    setTimeLeft(s);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ backgroundColor: lightTheme.bg }} className="w-full max-w-xs rounded-[40px] p-8 border border-black/5 shadow-2xl relative">
        <div className="flex flex-col items-center">
          <div style={{ backgroundColor: lightTheme.card }} className="p-3 rounded-2xl mb-4 border border-black/5 shadow-inner">
            <Timer className={`w-8 h-8 text-black ${timeLeft > 0 ? 'animate-pulse' : ''}`} />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-300">組間休息中</h3>
          <div style={{ color: lightTheme.text }} className="text-6xl font-black font-mono italic mb-8 transition-colors">
            {formatTime(timeLeft)}
          </div>
          
          <div className="grid grid-cols-4 gap-2 w-full mb-8">
            {[60, 90, 120, 180].map(s => (
              <button key={s} onClick={() => handleQuickSelect(s)} className={`py-2 rounded-xl text-[10px] font-black transition-all border ${configSeconds === s ? 'bg-black text-white border-black' : 'bg-slate-50 text-slate-400 border-black/5 shadow-inner'}`}>
                {s}S
              </button>
            ))}
          </div>
          
          <div className="flex space-x-3 w-full">
             <button onClick={() => { targetTimeRef.current = Date.now() + (configSeconds * 1000); notificationSentRef.current = false; setTimeLeft(configSeconds); }} style={{ backgroundColor: lightTheme.card }} className="flex-1 border border-black/5 py-4 rounded-2xl flex items-center justify-center text-slate-200 active:scale-95 transition-all shadow-sm">
               <RotateCcw className="w-5 h-5" />
             </button>
             <button onClick={onClose} style={{ backgroundColor: lightTheme.accent }} className="flex-[2] text-black font-black py-4 rounded-2xl active:scale-95 transition-all uppercase tracking-tighter flex items-center justify-center gap-2 shadow-lg shadow-[#CCFF00]/10">
               <Zap className="w-4 h-4 fill-current" />
               <span>我準備好了</span>
             </button>
          </div>
        </div>
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-200 hover:text-slate-400 p-2 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
};