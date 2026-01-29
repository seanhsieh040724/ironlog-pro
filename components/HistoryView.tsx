
import React, { useState, useMemo } from 'react';
import { WorkoutSession, MuscleGroup, ExerciseEntry } from '../types';
import { getMuscleGroupDisplay } from '../utils/fitnessMath';
import { getExerciseIcon } from './WorkoutView';
import { Clock, Activity, BarChart3, Trash2, LayoutGrid, Save, CalendarDays, ChevronRight } from 'lucide-react';
import { isSameDay, format } from 'date-fns';
import startOfWeek from 'date-fns/startOfWeek';
import startOfMonth from 'date-fns/startOfMonth';
import startOfYear from 'date-fns/startOfYear';
import { motion, AnimatePresence } from 'framer-motion';

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

  // 計算當日總計數據
  const dailyStats = useMemo(() => {
    if (filteredHistory.length === 0) return null;
    
    let totalMinutes = 0;
    let totalExercises: ExerciseEntry[] = [];
    
    filteredHistory.forEach(s => {
      totalMinutes += Math.round(((s.endTime || Date.now()) - s.startTime) / 60000);
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

  const allMuscleGroups: MuscleGroup[] = ['chest', 'back', 'quads', 'hamstrings', 'shoulders', 'arms', 'core', 'glutes'];

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

  /**
   * 依照要求更新顏色邏輯：
   * 0% (無數據): 深藍灰 #1e293b
   * 1-35% (輕量): 綠色 #22c55e
   * 36-75% (適中): 黃色 #eab308
   * 76-100% (極限): 紅色 #ef4444
   */
  const getHeatColor = (percentage: number) => {
    if (percentage === 0) return '#1e293b'; 
    if (percentage <= 35) return '#22c55e';  
    if (percentage <= 75) return '#eab308';  
    return '#ef4444';                  
  };

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 text-slate-400">
             <CalendarDays className="w-5 h-5 text-neon-green" />
             <h2 className="text-base font-black italic tracking-tighter uppercase">
               訓練日報 <span className="text-white">/ {format(selectedDate, 'MM.dd')}</span>
             </h2>
          </div>
          {dailyStats && (
            <div className="text-xs font-black text-slate-600 uppercase tracking-widest">
              {dailyStats.sessionCount} Sessions Total
            </div>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {!dailyStats ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="py-16 flex flex-col items-center justify-center glass rounded-[40px] border-white/5 bg-slate-900/20"
            >
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-5 text-slate-700">
                <Activity className="w-10 h-10" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-600">這天沒有訓練紀錄</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-800 mt-2.5 italic">Rest is part of the process</p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-[44px] p-8 border-white/5 space-y-7 shadow-2xl relative overflow-hidden group"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h4 className="text-3xl font-black italic uppercase text-white leading-tight">當日總訓練</h4>
                  <div className="flex items-center space-x-5 text-xs text-slate-500 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-2 bg-slate-800/50 px-2.5 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5 text-neon-green" /> {dailyStats.totalMinutes} MINS
                    </span>
                    <span className="bg-slate-800/50 px-2.5 py-1 rounded-md">
                      {dailyStats.totalExercises.length} EXERCISES
                    </span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-neon-green/10 rounded-2xl flex items-center justify-center text-neon-green">
                   <Activity className="w-7 h-7 animate-pulse" />
                </div>
              </div>

              <div className="space-y-7">
                {filteredHistory.map((session, sIdx) => (
                  <div key={session.id} className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                       <div className="flex items-center gap-2.5">
                          <div className="w-1.5 h-4 bg-neon-green/30 rounded-full" />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">時段 {sIdx + 1}: {format(new Date(session.startTime), 'HH:mm')}</span>
                       </div>
                       <button 
                         onClick={() => handleDeleteSession(session.id)}
                         className="text-slate-700 hover:text-red-500 active:scale-90 transition-all"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                    
                    <div className="space-y-3">
                      {session.exercises.map(ex => (
                        <div key={ex.id} className="flex justify-between items-center bg-black/40 p-5 rounded-3xl border border-white/5">
                          <div className="flex items-center gap-4 overflow-hidden">
                            <div className="w-10 h-10 bg-white/5 rounded-xl p-2 text-neon-green shrink-0">
                              {getExerciseIcon(ex.name)}
                            </div>
                            <div className="overflow-hidden">
                              <span className="text-base font-black text-white italic uppercase tracking-tight truncate block">{ex.name}</span>
                              <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">{ex.sets.length} SETS TOTAL</div>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <span className="text-lg font-black italic text-neon-green">{ex.sets[0]?.weight}kg</span>
                            <span className="mx-1 text-slate-800 font-black italic">×</span>
                            <span className="text-lg font-black italic text-white">{ex.sets[0]?.reps}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleSaveDayAsRoutine}
                className="w-full py-6 bg-neon-green text-black font-black rounded-3xl text-xs uppercase tracking-tighter flex items-center justify-center gap-3.5 active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(173,255,47,0.1)]"
              >
                <Save className="w-5 h-5 stroke-[3]" /> 將今日訓練存為自訂課表
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="glass rounded-[44px] p-8 border-white/5 space-y-9 bg-gradient-to-b from-transparent to-slate-900/20 shadow-2xl">
        <div className="flex justify-between items-center">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neon-green/10 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-neon-green" />
              </div>
              <div>
                <h3 className="text-base font-black italic uppercase tracking-tighter text-white">訓練容量分布</h3>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1.5">Muscle stimulation breakdown</p>
              </div>
           </div>
           <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-white/5">
              {(['week', 'month'] as const).map(p => (
                <button key={p} onClick={() => setAnalysisPeriod(p)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${analysisPeriod === p ? 'bg-neon-green text-black shadow-lg shadow-neon-green/10' : 'text-slate-500 hover:text-slate-400'}`}>
                  {p === 'week' ? '週' : '月'}
                </button>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
           {allMuscleGroups.map(muscle => {
             const setTotal = analysisData[muscle] || 0;
             const max = Math.max(...(Object.values(analysisData) as number[]), 1);
             const percentage = (setTotal / max) * 100;
             const barColor = getHeatColor(percentage);
             
             return (
               <div key={muscle} className="space-y-2.5">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest px-1">
                     <span className="text-slate-500">{getMuscleGroupDisplay(muscle).cn}</span>
                     <span className={setTotal > 0 ? "text-neon-green italic" : "text-slate-800"}>{setTotal} SETS</span>
                  </div>
                  <div className="h-3.5 w-full bg-slate-900/60 rounded-full overflow-hidden border border-white/5">
                     <motion.div 
                       initial={{ width: 0 }} 
                       animate={{ width: `${percentage}%`, backgroundColor: barColor }} 
                       transition={{ duration: 1.5, ease: "circOut" }}
                       className="h-full shadow-[0_0_10px_rgba(37,99,235,0.2)]" 
                     />
                  </div>
               </div>
             );
           })}
        </div>

        <div className="pt-5 border-t border-white/5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-5">訓練負荷程度說明</p>
          <div className="flex justify-between">
            {[0, 35, 75, 100].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-2.5">
                <div className="w-8 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: getHeatColor(s) }} />
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                  {s === 0 ? '休息中' : s === 35 ? '輕量' : s === 75 ? '適中' : '極限'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
