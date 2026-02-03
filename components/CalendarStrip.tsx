import React, { useState, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth,
  isToday as isDateToday
} from 'date-fns';
import zhTW from 'date-fns/locale/zh-TW';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  workoutDates: Date[];
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({ selectedDate, onDateSelect, workoutDates }) => {
  const [viewDate, setViewDate] = useState(selectedDate);
  const [direction, setDirection] = useState(0);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [viewDate]);

  const nextMonth = () => {
    setDirection(1);
    setViewDate(addMonths(viewDate, 1));
  };

  const prevMonth = () => {
    setDirection(-1);
    setViewDate(subMonths(viewDate, 1));
  };

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 50;
    if (info.offset.x < -threshold) nextMonth();
    else if (info.offset.x > threshold) prevMonth();
  };

  const weekdays = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className="p-4 sm:p-5 select-none relative z-10">
      {/* 月份切換標題 - 強化為單行顯示且不換行 */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 px-1">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-neon-green/10 rounded-xl flex items-center justify-center text-neon-green shrink-0">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="overflow-hidden">
            <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter text-white leading-none truncate whitespace-nowrap">
              {format(viewDate, 'yyyy MMM', { locale: zhTW })}
            </h3>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1 truncate whitespace-nowrap">
              SWIPE TO CHANGE MONTH
            </p>
          </div>
        </div>
        
        <div className="flex gap-1.5 sm:gap-2.5 shrink-0 ml-2">
          <button onClick={prevMonth} className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-400 active:text-neon-green transition-colors">
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button onClick={() => { setViewDate(new Date()); onDateSelect(new Date()); }} className="px-3 sm:px-4 rounded-lg bg-slate-800/50 text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest active:text-neon-green whitespace-nowrap transition-colors">
            Today
          </button>
          <button onClick={nextMonth} className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-400 active:text-neon-green transition-colors">
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* 星期標題 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map(d => (
          <div key={d} className="text-center text-[10px] sm:text-[11px] font-black text-slate-700 uppercase py-1.5">
            {d}
          </div>
        ))}
      </div>

      {/* 日曆網格與滑動動畫 - 優化動畫屬性 */}
      <div className="relative overflow-hidden min-h-[240px] sm:min-h-[260px] touch-pan-y">
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.div
            key={viewDate.getMonth() + '-' + viewDate.getFullYear()}
            custom={direction}
            initial={{ x: direction * 100 + '%', opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: direction * -100 + '%', opacity: 0, scale: 0.95 }}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 300,
              opacity: { duration: 0.2 },
              scale: { duration: 0.3 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="grid grid-cols-7 gap-1 sm:gap-1.5 cursor-grab active:cursor-grabbing"
          >
            {days.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isDateToday(day);
              const hasWorkout = workoutDates.some(wd => isSameDay(wd, day));
              const isCurrentMonth = isSameMonth(day, viewDate);
              
              return (
                <button
                  key={day.toString()}
                  onClick={() => onDateSelect(day)}
                  className={`
                    relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200
                    ${!isCurrentMonth ? 'opacity-20 scale-90' : 'opacity-100'}
                    ${isSelected 
                      ? 'bg-neon-green text-black font-black shadow-[0_0_20px_rgba(173,255,47,0.4)] z-10 scale-105' 
                      : isToday 
                        ? 'bg-slate-800 border border-neon-green/40 text-neon-green' 
                        : 'hover:bg-slate-800/30 text-slate-400'
                    }
                  `}
                >
                  <span className={`text-sm sm:text-base ${isSelected ? 'scale-110' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  
                  {hasWorkout && (
                    <div className={`
                      absolute bottom-2 w-1.5 h-1.5 rounded-full 
                      ${isSelected ? 'bg-black' : 'bg-neon-green'}
                      ${isToday && !isSelected ? 'animate-pulse' : ''}
                    `} />
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};