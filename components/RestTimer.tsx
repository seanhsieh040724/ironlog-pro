
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Timer, X, RotateCcw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    // 預載入提示音 (Beep 音效)
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audioRef.current.load();
  }, []);

  const handleTimerEnd = useCallback(() => {
    if (notificationSentRef.current) return;
    notificationSentRef.current = true;

    // 播放音效
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.debug("Audio play blocked by browser policy", e));
    }

    // 震動提醒 (強烈雙重震動)
    if ('vibrate' in navigator) {
      navigator.vibrate([500, 150, 500, 150, 300]);
    }

    // 發送系統通知，確保在通知中心彈出並保持
    if ("Notification" in window && Notification.permission === "granted") {
      const n = new Notification("IronLog: 休息結束！", {
        body: "該開始下一組訓練了。鋼鐵般的意志，不能停下！",
        icon: "https://cdn-icons-png.flaticon.com/512/3043/3043888.png",
        badge: "https://cdn-icons-png.flaticon.com/512/3043/3043888.png",
        tag: 'rest-timer-end',
        requireInteraction: true, // 確保通知在中心停留，直到使用者處理
        silent: false
      });
      
      n.onclick = () => {
        window.focus();
        onClose();
      };
    } else {
      console.warn("Notification permission not granted.");
    }
  }, [onClose]);

  // 核心倒數邏輯：基於時間戳記
  useEffect(() => {
    if (!active) {
      targetTimeRef.current = null;
      notificationSentRef.current = false;
      return;
    }

    // 設定目標結束時間
    if (targetTimeRef.current === null) {
      targetTimeRef.current = Date.now() + (configSeconds * 1000);
    }

    const updateTimer = () => {
      if (!targetTimeRef.current) return;
      
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((targetTimeRef.current - now) / 1000));
      
      setTimeLeft(diff);

      if (diff <= 0) {
        handleTimerEnd();
        clearInterval(interval);
      }
    };

    // 每秒更新一次
    const interval = setInterval(updateTimer, 1000);
    updateTimer(); // 立即執行一次

    // 監聽 App 回到前台的事件
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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

  const resetTimer = () => {
    targetTimeRef.current = Date.now() + (configSeconds * 1000);
    notificationSentRef.current = false;
    setTimeLeft(configSeconds);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-xs glass rounded-[40px] p-8 border-neon-green/20 relative"
      >
        <div className="flex flex-col items-center">
          <div className="p-3 bg-neon-green/10 rounded-2xl mb-4">
            <Timer className={`w-8 h-8 text-neon-green ${timeLeft > 0 ? 'animate-pulse' : ''}`} />
          </div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">組間休息中</h3>
          <div className={`text-6xl font-black font-mono italic mb-8 transition-colors ${timeLeft === 0 ? 'text-neon-green' : 'text-white'}`}>
            {formatTime(timeLeft)}
          </div>
          
          <div className="grid grid-cols-4 gap-2 w-full mb-8">
            {[60, 90, 120, 180].map(s => (
              <button key={s} onClick={() => handleQuickSelect(s)} className={`py-2 rounded-xl text-[10px] font-black transition-all border ${configSeconds === s ? 'bg-neon-green text-black border-neon-green' : 'bg-slate-800/50 text-slate-500 border-white/5'}`}>
                {s}S
              </button>
            ))}
          </div>
          
          <div className="flex space-x-3 w-full">
             <button onClick={resetTimer} className="flex-1 bg-slate-800 py-4 rounded-2xl flex items-center justify-center text-slate-400 active:scale-95 transition-all">
               <RotateCcw className="w-5 h-5" />
             </button>
             <button onClick={onClose} className="flex-[2] bg-neon-green text-black font-black py-4 rounded-2xl active:scale-95 transition-all uppercase tracking-tighter flex items-center justify-center gap-2">
               <Zap className="w-4 h-4 fill-current" />
               <span>我準備好了</span>
             </button>
          </div>
        </div>
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-700 p-2">
          <X className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
};
