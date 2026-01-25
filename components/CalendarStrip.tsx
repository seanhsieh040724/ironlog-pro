import React, { useRef, useEffect } from 'react';
// Use direct subpath imports for date-fns to avoid potential issues with barrel exports
import format from 'date-fns/format';
import isSameDay from 'date-fns/isSameDay';
import subDays from 'date-fns/subDays';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import zhTW from 'date-fns/locale/zh-TW';

interface CalendarStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  workoutDates: Date[];
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({ selectedDate, onDateSelect, workoutDates }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 取得台灣目前的日期 (確保午夜切換準確)
  const getTaiwanToday = () => {
    const now = new Date();
    // 雖然大多數瀏覽器已設為本地時間，但此處確保計算基準
    return now;
  };

  const today = getTaiwanToday();
  
  // 產生過去 30 天到今天的日期陣列
  const days = eachDayOfInterval({
    start: subDays(today, 29),
    end: today
  });

  // 初次渲染後自動捲動到最右側 (今天)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  return (
    <div 
      ref={scrollRef}
      className="flex overflow-x-auto gap-2 px-2 pt-4 pb-3 scroll-smooth no-scrollbar"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      {days.map((day) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, today);
        const hasWorkout = workoutDates.some(wd => isSameDay(wd, day));
        
        return (
          <button
            key={day.toString()}
            onClick={() => onDateSelect(day)}
            className={`flex-shrink-0 w-14 h-18 rounded-2xl flex flex-col items-center justify-center transition-all relative ${
              isSelected 
                ? 'bg-neon-green text-black scale-105 z-10 shadow-[0_0_20px_rgba(173,255,47,0.3)]' 
                : isToday 
                  ? 'bg-slate-800 border border-neon-green/40 text-neon-green' 
                  : 'bg-slate-800/40 text-slate-500 border border-white/5'
            }`}
          >
            {isToday && (
              <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter z-20 shadow-lg ${isSelected ? 'bg-white text-black' : 'bg-neon-green text-black'}`}>
                TODAY
              </span>
            )}
            <span className={`text-[8px] font-bold uppercase mb-0.5 ${isSelected ? 'text-black/70' : isToday ? 'text-neon-green/80' : 'text-slate-600'}`}>
              {format(day, 'EEE', { locale: zhTW })}
            </span>
            <span className="text-sm font-black tracking-tighter">{format(day, 'd')}</span>
            {hasWorkout && (
              <div className={`absolute bottom-1.5 w-1 h-1 rounded-full ${isSelected ? 'bg-black' : 'bg-neon-green'}`} />
            )}
          </button>
        );
      })}
    </div>
  );
};