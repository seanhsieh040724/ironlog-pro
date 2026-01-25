
import React, { useState, useEffect } from 'react';
import { Timer, X, RotateCcw, Zap } from 'lucide-react';

interface RestTimerProps {
  active: boolean;
  seconds: number;
  onClose: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({ active, seconds: initialSeconds, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [configSeconds, setConfigSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (!active) return;
    setTimeLeft(configSeconds);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [active, configSeconds]);

  if (!active) return null;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, '0')}`;
  };

  const handleQuickSelect = (s: number) => {
    setConfigSeconds(s);
    setTimeLeft(s);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xs glass rounded-[40px] p-8 border-neon-green/20 animate-in zoom-in-95 duration-300 relative">
        <div className="flex flex-col items-center">
          <div className="p-3 bg-neon-green/10 rounded-2xl mb-4 relative">
            <Timer className={`w-8 h-8 text-neon-green ${timeLeft > 0 ? 'animate-pulse' : ''}`} />
            {timeLeft === 0 && (
              <div className="absolute -inset-1 bg-neon-green/20 rounded-2xl animate-ping" />
            )}
          </div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">組間休息中</h3>
          <div className={`text-6xl font-black font-mono italic mb-8 transition-colors ${timeLeft === 0 ? 'text-neon-green' : 'text-white'}`}>
            {formatTime(timeLeft)}
          </div>
          
          <div className="grid grid-cols-4 gap-2 w-full mb-8">
            {[60, 90, 120, 180].map(s => (
              <button 
                key={s} 
                onClick={() => handleQuickSelect(s)}
                className={`py-2 rounded-xl text-[10px] font-black transition-all border ${configSeconds === s ? 'bg-neon-green text-black border-neon-green' : 'bg-slate-800/50 text-slate-500 border-white/5'}`}
              >
                {s}S
              </button>
            ))}
          </div>
          
          <div className="flex space-x-3 w-full">
             <button onClick={() => setTimeLeft(configSeconds)} className="flex-1 bg-slate-800 py-4 rounded-2xl flex items-center justify-center text-slate-400 active:scale-95 transition-all">
               <RotateCcw className="w-5 h-5" />
             </button>
             <button onClick={onClose} className="flex-[2] bg-neon-green text-black font-black py-4 rounded-2xl active:scale-95 transition-all uppercase tracking-tighter flex items-center justify-center gap-2">
               <Zap className="w-4 h-4 fill-current" />
               <span>我準備好了</span>
             </button>
          </div>
        </div>
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-700">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
