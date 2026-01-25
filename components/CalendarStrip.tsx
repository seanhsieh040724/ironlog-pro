
import React from 'react';
import { format, addDays, isSameDay } from 'date-fns';
// Fix for startOfWeek by importing directly from its function file.
import startOfWeek from 'date-fns/startOfWeek';
// Fix for zhTW by importing directly from its locale folder.
import zhTW from 'date-fns/locale/zh-TW';

interface CalendarStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  workoutDates: Date[];
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({ selectedDate, onDateSelect, workoutDates }) => {
  // 取得本週的週一
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  // 只顯示 7 天，使其能完美平鋪於畫面
  const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
  const today = new Date();

  return (
    <div className="flex justify-between items-center w-full px-1 pt-3 pb-2">
      {days.map((day) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, today);
        const hasWorkout = workoutDates.some(wd => isSameDay(wd, day));
        
        return (
          <button
            key={day.toString()}
            onClick={() => onDateSelect(day)}
            className={`flex-shrink-0 w-[13%] h-16 rounded-xl flex flex-col items-center justify-center transition-all relative ${
              isSelected 
                ? 'bg-neon-green text-black glow-green scale-105 z-10 shadow-[0_0_15px_rgba(173,255,47,0.4)]' 
                : isToday 
                  ? 'bg-slate-800 border border-neon-green/60 text-neon-green' 
                  : 'bg-slate-800/40 text-slate-500 border border-white/5'
            }`}
          >
            {isToday && (
              <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter z-20 shadow-lg ${isSelected ? 'bg-white text-black' : 'bg-neon-green text-black animate-pulse'}`}>
                TODAY
              </span>
            )}
            <span className={`text-[9px] font-bold uppercase mb-0.5 ${isSelected ? 'text-black/70' : isToday ? 'text-neon-green/80' : 'text-slate-600'}`}>
              {format(day, 'EEE', { locale: zhTW })}
            </span>
            <span className="text-sm font-black tracking-tighter">{format(day, 'd')}</span>
            {hasWorkout && (
              <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-black' : 'bg-neon-green'}`} />
            )}
          </button>
        );
      })}
    </div>
  );
};
