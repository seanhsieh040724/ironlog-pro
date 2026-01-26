
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
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next

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
    <div className="p-4 select-none">
      {/* 月份切換標題 */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neon-green/10 rounded-xl flex items-center justify-center text-neon-green">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">
              {format(viewDate, 'yyyy MMM', { locale: zhTW })}
            </h3>
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">
              左右滑動切換月份
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-400 active:text-neon-green">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => { setViewDate(new Date()); onDateSelect(new Date()); }} className="px-3 rounded-lg bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest active:text-neon-green">
            Today
          </button>
          <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-400 active:text-neon-green">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 星期標題 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map(d => (
          <div key={d} className="text-center text-[9px] font-black text-slate-700 uppercase py-2">
            {d}
          </div>
        ))}
      </div>

      {/* 日曆網格與滑動動畫 */}
      <div className="relative overflow-hidden min-h-[240px]">
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={viewDate.getMonth() + '-' + viewDate.getFullYear()}
            custom={direction}
            initial={{ x: direction * 100 + '%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -100 + '%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="grid grid-cols-7 gap-1"
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
                    relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all
                    ${!isCurrentMonth ? 'opacity-20 scale-90' : 'opacity-100'}
                    ${isSelected 
                      ? 'bg-neon-green text-black font-black shadow-[0_0_15px_rgba(173,255,47,0.3)] z-10' 
                      : isToday 
                        ? 'bg-slate-800 border border-neon-green/40 text-neon-green' 
                        : 'hover:bg-slate-800/30 text-slate-400'
                    }
                  `}
                >
                  <span className={`text-sm ${isSelected ? 'scale-110' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  
                  {hasWorkout && (
                    <div className={`
                      absolute bottom-1.5 w-1 h-1 rounded-full 
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
