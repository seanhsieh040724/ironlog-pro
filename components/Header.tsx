
import React from 'react';

interface HeaderProps {
  totalSets: number;
}

export const Header: React.FC<HeaderProps> = ({ totalSets }) => {
  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-TW', { day: 'numeric' });
  const monthStr = today.toLocaleDateString('zh-TW', { month: 'short' });
  const weekdayStr = today.toLocaleDateString('zh-TW', { weekday: 'short' });

  return (
    <header className="pt-12 pb-6 px-6 sticky top-0 z-30 bg-black/60 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-white/10 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-indigo-400 uppercase leading-none">{weekdayStr}</span>
            <span className="text-lg font-extrabold leading-none mt-1">{dateStr}</span>
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter text-white">FIT<span className="text-indigo-500">PRO</span></h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{monthStr} WORKOUT SESSION</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
           <div className="px-3 py-1 rounded-full bg-slate-900 border border-white/5 flex flex-col items-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase">總組數</span>
              <span className="text-sm font-black text-indigo-400">{totalSets}</span>
           </div>
        </div>
      </div>
    </header>
  );
};
