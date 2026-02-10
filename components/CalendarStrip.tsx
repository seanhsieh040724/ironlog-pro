
import React, { useState, useMemo } from 'react';
// Fix: Use path-based imports for members missing from the main date-fns entry point to avoid compilation errors
import { 
  format, 
  addMonths, 
  endOfMonth, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth,
  isToday as isDateToday
} from 'date-fns';
import subMonths from 'date-fns/subMonths';
import startOfMonth from 'date-fns/startOfMonth';
import startOfWeek from 'date-fns/startOfWeek';
import zhTW from 'date-fns/locale/zh-TW';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { lightTheme } from '../themeStyles';

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

  const weekdays = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className="p-4 sm:p-5 select-none relative z-10">
      <div className="flex items-center justify-between mb-6 sm:mb-8 px-1">
        <div className="flex items-center gap-3 overflow-hidden">
          <div style={{ backgroundColor: lightTheme.bg }} className="w-10 h-10 rounded-xl flex items-center justify-center border border-black/5 shadow-sm shrink-0">
            <CalendarIcon className="w-5 h-5 text-black" />
          </div>
          <div className="overflow-hidden">
            <h3 style={{ color: lightTheme.text }} className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter leading-none truncate whitespace-nowrap">
              {format(viewDate, 'yyyy MMM', { locale: zhTW })}
            </h3>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1 truncate">
              SWIPE TO CHANGE MONTH
            </p>
          </div>
        </div>
        
        <div className="flex gap-1.5 shrink-0">
          <button onClick={prevMonth} style={{ backgroundColor: lightTheme.accent }} className="w-8 h-8 rounded-lg flex items-center justify-center text-black active:scale-90 shadow-md"><ChevronLeft className="w-4 h-4 stroke-[3]" /></button>
          <button onClick={nextMonth} style={{ backgroundColor: lightTheme.accent }} className="w-8 h-8 rounded-lg flex items-center justify-center text-black active:scale-90 shadow-md"><ChevronRight className="w-4 h-4 stroke-[3]" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map(d => (
          <div key={d} className="text-center text-[10px] font-black text-slate-200 uppercase py-1.5">{d}</div>
        ))}
      </div>

      <div className="relative overflow-hidden min-h-[240px] touch-pan-y">
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
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
                    ? 'bg-black text-white font-black shadow-md z-10 scale-105' 
                    : isToday 
                      ? 'bg-slate-100 border border-black text-black' 
                      : 'hover:bg-slate-50 text-slate-400'
                  }
                `}
              >
                <span className={`text-sm sm:text-base ${isSelected ? 'scale-110' : ''}`}>
                  {format(day, 'd')}
                </span>
                
                {hasWorkout && (
                  <div className={`
                    absolute bottom-2 w-1.5 h-1.5 rounded-full 
                    ${isSelected ? 'bg-white' : 'bg-black opacity-30'}
                  `} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
