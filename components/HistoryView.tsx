import React, { useState, useMemo } from 'react';
import { WorkoutSession, MuscleGroup, ExerciseEntry } from '../types';
import { getMuscleGroupDisplay } from '../utils/fitnessMath';
import { Activity, BarChart3, Trash2, CalendarDays, Timer, Save } from 'lucide-react';
import { isSameDay, format } from 'date-fns';
import startOfWeek from 'date-fns/startOfWeek';
import startOfMonth from 'date-fns/startOfMonth';
import startOfYear from 'date-fns/startOfYear';
import { motion, AnimatePresence } from 'framer-motion';
import { lightTheme } from '../themeStyles';

interface HistoryViewProps {
  history: WorkoutSession[];
  selectedDate: Date;
  onUpdateHistory: React.Dispatch<React.SetStateAction<WorkoutSession[]>>;
  onSaveAsRoutine: (session: WorkoutSession) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, selectedDate, onUpdateHistory, onSaveAsRoutine }) => {
  const [analysisPeriod, setAnalysisPeriod] = useState<'week' | 'month' | 'year'>('week');

  const filteredHistory = useMemo(() => 
    history.filter(s => isSameDay(new Date(s.startTime), selectedDate)),
  [history, selectedDate]);

  const dailyStats = useMemo(() => {
    if (filteredHistory.length === 0) return null;
    
    let totalMinutes = 0;
    let totalExercises: ExerciseEntry[] = [];
    
    filteredHistory.forEach(s => {
      const beginTime = s.timerStartedAt || s.startTime;
      const doneTime = s.endTime || s.startTime;
      totalMinutes += Math.max(0, Math.round((doneTime - beginTime) / 60000));
      totalExercises = [...totalExercises, ...s.exercises];
    });

    return {
      totalMinutes,
      totalExercises,
      sessionCount: filteredHistory.length
    };
  }, [filteredHistory]);

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('確定要永久刪除這筆訓練紀錄嗎？此動作無法復原。')) {
      onUpdateHistory(prev => prev.filter(s => s.id !== sessionId));
    }
  };

  const handleSaveDayAsRoutine = () => {
    if (!dailyStats) return;
    
    const combinedSession: WorkoutSession = {
      id: 'combined-' + selectedDate.getTime(),
      title: `${format(selectedDate, 'MM/dd')} 訓練課表`,
      startTime: selectedDate.getTime(),
      exercises: dailyStats.totalExercises
    };
    
    onSaveAsRoutine(combinedSession);
  };

  const allMuscleGroups: MuscleGroup[] = ['chest', 'back', 'quads', 'shoulders', 'arms', 'core'];

  const analysisData = useMemo(() => {
    const now = new Date();
    let start: Date;
    if (analysisPeriod === 'week') start = startOfWeek(now, { weekStartsOn: 1 });
    else if (analysisPeriod === 'month') start = startOfMonth(now);
    else start = startOfYear(now);

    const periodHistory = history.filter(s => s.startTime >= start.getTime());
    const results: Record<string, number> = {};
    allMuscleGroups.forEach(m => results[m] = 0);

    periodHistory.forEach(session => {
      session.exercises.forEach(ex => {
        if (results[ex.muscleGroup] !== undefined) {
          const setCount = ex.sets.length;
          results[ex.muscleGroup] += setCount;
        }
      });
    });

    return results;
  }, [history, analysisPeriod]);

  const getHeatColor = (setCount: number) => {
    if (setCount === 0) return '#E2E8F0'; 
    if (setCount <= 10) return '#82CC00';  // 輕量
    if (setCount <= 15) return '#FACC15';  // 適中
    return '#FF3B30';                      // 力竭
  };

  const getLoadStatus = (setCount: number) => {
    if (setCount === 0) return { label: '休息恢復', color: 'text-slate-300' };
    if (setCount <= 10) return { label: '輕量(1-10組)', color: 'text-[#82CC00]' };
    if (setCount <= 15) return { label: '適中(11-15組)', color: 'text-yellow-500' };
    return { label: '力竭(16+組)', color: 'text-red-500' };
  };

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 text-slate-400">
             <CalendarDays className="w-5 h-5 text-black" />
             <h2 style={{ color: lightTheme.text }} className="text-base font-black italic tracking-tighter uppercase pr-2">
               訓練日報 <span className="text-slate-300">/ {format(selectedDate, 'MM.dd')}</span>
             </h2>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {!dailyStats ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              style={{ backgroundColor: lightTheme.card }}
              className="py-16 flex flex-col items-center justify-center rounded-[40px] border border-black/5 shadow-sm"
            >
              <div style={{ backgroundColor: lightTheme.bg }} className="w-16 h-16 rounded-full flex items-center justify-center mb-5 text-slate-100 shadow-inner">
                <Activity className="w-8 h-8" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">這天沒有訓練紀錄</p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ backgroundColor: lightTheme.bg }}
              className="rounded-[44px] p-8 border border-black/5 space-y-7 shadow-xl relative overflow-hidden group"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h4 style={{ color: lightTheme.text }} className="text-3xl font-black italic uppercase leading-tight pr-3">當日總訓練</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span style={{ backgroundColor: lightTheme.card, color: lightTheme.text }} className="flex items-center gap-2 border border-black/5 px-3 py-1.5 rounded-xl text-xs font-black italic shadow-inner">
                      <Timer className="w-3.5 h-3.5 text-black" /> {dailyStats.totalMinutes} 分鐘
                    </span>
                    <span style={{ backgroundColor: lightTheme.card, color: '#6E6E73' }} className="border border-black/5 px-3 py-1.5 rounded-xl text-xs font-black">
                      {dailyStats.totalExercises.length} 項動作
                    </span>
                  </div>
                </div>
                <div style={{ backgroundColor: lightTheme.accent }} className="w-14 h-14 rounded-2xl flex items-center justify-center text-black shadow-lg">
                   <Activity className="w-7 h-7" />
                </div>
              </div>

              <div className="space-y-7">
                {filteredHistory.map((session) => (
                  <div key={session.id} className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         {format(new Date(session.startTime), 'HH:mm')} 開始
                       </span>
                       <button onClick={() => handleDeleteSession(session.id)} className="text-slate-200 hover:text-red-400 active:scale-90 transition-all">
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                    <div className="space-y-3">
                      {session.exercises.map(ex => (
                        <div key={ex.id} style={{ backgroundColor: lightTheme.card }} className="flex justify-between items-center p-5 rounded-3xl border border-black/5 shadow-sm">
                          <div className="overflow-hidden">
                            <span style={{ color: lightTheme.text }} className="text-base font-black italic uppercase tracking-tight truncate block pr-2">{ex.name}</span>
                            <div className="text-[9px] font-bold text-slate-300 uppercase mt-1">{ex.sets.length} 組</div>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <span style={{ color: '#82CC00' }} className="text-lg font-black italic pr-0.5">{ex.sets[0]?.weight}kg</span>
                            <span className="mx-1 text-slate-200 font-black italic">×</span>
                            <span style={{ color: lightTheme.text }} className="text-lg font-black italic">{ex.sets[0]?.reps}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleSaveDayAsRoutine}
                style={{ backgroundColor: lightTheme.accent }}
                className="w-full py-6 text-black font-black rounded-3xl text-xs uppercase flex items-center justify-center gap-3.5 active:scale-[0.98] transition-all shadow-md"
              >
                <Save className="w-5 h-5" /> 存為自訂課表
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ backgroundColor: lightTheme.bg }} className="rounded-[44px] p-8 border border-black/5 space-y-9 shadow-xl">
        <div className="flex justify-between items-center">
           <div className="flex items-center gap-4">
              <div style={{ backgroundColor: lightTheme.card }} className="w-12 h-12 border border-black/5 rounded-xl flex items-center justify-center shadow-inner">
                <BarChart3 className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 style={{ color: lightTheme.text }} className="text-base font-black italic uppercase tracking-tighter pr-2">訓練容量分布</h3>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">累積負荷分析</p>
              </div>
           </div>
           <div style={{ backgroundColor: lightTheme.card }} className="flex p-1.5 rounded-2xl border border-black/5 shadow-inner">
              {(['week', 'month'] as const).map(p => (
                <button key={p} onClick={() => setAnalysisPeriod(p)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${analysisPeriod === p ? 'bg-black text-white shadow-md' : 'text-slate-300'}`}>
                  {p === 'week' ? '週' : '月'}
                </button>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
           {allMuscleGroups.map(muscle => {
             const setTotal = analysisData[muscle] || 0;
             const progressPercentage = Math.min(100, (setTotal / 20) * 100);
             const barColor = getHeatColor(setTotal);
             const loadStatus = getLoadStatus(setTotal);
             
             return (
               <div key={muscle} className="space-y-3">
                  <div className="flex justify-between items-end px-1">
                     <div className="space-y-1">
                        <span className="text-xs font-black uppercase text-slate-400 block">{getMuscleGroupDisplay(muscle).cn}</span>
                        <div className={`text-[10px] font-black uppercase flex items-center gap-1.5 ${loadStatus.color}`}>
                           <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                           {loadStatus.label}
                        </div>
                     </div>
                     <div className="text-right">
                        <span className={setTotal > 0 ? "text-xl font-black italic text-black" : "text-slate-200 font-black italic text-lg"}>{setTotal}</span>
                        <span className="text-[9px] font-black text-slate-300 uppercase ml-1.5">Sets</span>
                     </div>
                  </div>
                  <div style={{ backgroundColor: lightTheme.card }} className="h-3.5 w-full rounded-full overflow-hidden border border-black/5 shadow-inner p-0.5">
                     <motion.div 
                       initial={{ width: 0 }} 
                       animate={{ width: `${progressPercentage}%`, backgroundColor: barColor }} 
                       transition={{ duration: 1.5, ease: "circOut" }}
                       className="h-full rounded-full shadow-sm" 
                     />
                  </div>
               </div>
             );
           })}
        </div>

        {/* 負荷強度圖例 - 依照使用者要求調整格式 */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 border-t border-black/5">
           <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-[#82CC00] shadow-sm" />
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">輕量(1-10組)</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-[#FACC15] shadow-sm" />
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">適中(11-15組)</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-[#FF3B30] shadow-sm" />
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">力竭(16+組)</span>
           </div>
        </div>
      </div>
    </div>
  );
};