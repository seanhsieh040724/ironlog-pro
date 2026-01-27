
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

  const dailyStats = useMemo(() => {
    if (filteredHistory.length === 0) return null;
    let totalMinutes = 0;
    let totalExercises: ExerciseEntry[] = [];
    filteredHistory.forEach(s => {
      totalMinutes += Math.round(((s.endTime || Date.now()) - s.startTime) / 60000);
      totalExercises = [...totalExercises, ...s.exercises];
    });
    return { totalMinutes, totalExercises, sessionCount: filteredHistory.length };
  }, [filteredHistory]);

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
        if (results[ex.muscleGroup] !== undefined) results[ex.muscleGroup] += ex.sets.length;
      });
    });
    return results;
  }, [history, analysisPeriod]);

  /**
   * 依照訓練百分比決定顏色：
   * 0% (無數據)：深藍灰 #1e293b
   * 1-35% (輕量)：綠色 #22c55e
   * 36-75% (適中)：黃色 #eab308
   * 76-100% (極限)：紅色 #ef4444
   */
  const getHeatColor = (percentage: number) => {
    if (percentage === 0) return '#1e293b'; 
    if (percentage <= 35) return '#22c55e';  
    if (percentage <= 75) return '#eab308';  
    return '#ef4444';
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="space-y-7">
        <div className="flex items-center justify-between px-3">
          <div className="flex items-center gap-4 text-slate-400">
             <CalendarDays className="w-6 h-6 text-neon-green" />
             <h2 className="text-xl font-black italic tracking-tighter uppercase leading-none">
               訓練日報 <span className="text-white">/ {format(selectedDate, 'MM.dd')}</span>
             </h2>
          </div>
          {dailyStats && <div className="text-[12px] font-black text-slate-600 uppercase tracking-widest">{dailyStats.sessionCount} Sessions</div>}
        </div>

        <AnimatePresence mode="popLayout">
          {!dailyStats ? (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="py-24 flex flex-col items-center justify-center glass rounded-[44px] border-white/5 bg-slate-900/20">
              <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 text-slate-700 shadow-inner"><Activity className="w-12 h-12" /></div>
              <p className="text-[13px] font-black uppercase tracking-[0.4em] text-slate-600">這天沒有訓練紀錄</p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-[48px] p-10 border-white/5 space-y-10 shadow-[0_25px_60px_rgba(0,0,0,0.4)] relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <h4 className="text-4xl font-black italic uppercase text-white leading-tight">當日總訓練</h4>
                  <div className="flex items-center space-x-6 text-sm text-slate-500 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-2.5 bg-slate-800/50 px-3 py-1.5 rounded-xl"><Clock className="w-4 h-4 text-neon-green" /> {dailyStats.totalMinutes} MINS</span>
                    <span className="bg-slate-800/50 px-3 py-1.5 rounded-xl">{dailyStats.totalExercises.length} EXERCISES</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-neon-green/10 rounded-[22px] flex items-center justify-center text-neon-green shadow-lg"><Activity className="w-8 h-8 animate-pulse" /></div>
              </div>

              <div className="space-y-8">
                {filteredHistory.map((session, sIdx) => (
                  <div key={session.id} className="space-y-5">
                    <div className="flex items-center justify-between px-3">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-5 bg-neon-green/30 rounded-full" />
                          <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest">時段 {sIdx + 1}: {format(new Date(session.startTime), 'HH:mm')}</span>
                       </div>
                       <button onClick={() => { if(confirm('永久刪除這筆紀錄？')) onUpdateHistory(prev => prev.filter(s => s.id !== session.id)); }} className="text-slate-700 hover:text-red-500 active:scale-90 transition-all"><Trash2 className="w-5 h-5" /></button>
                    </div>
                    <div className="space-y-4">
                      {session.exercises.map(ex => (
                        <div key={ex.id} className="flex justify-between items-center bg-black/40 p-6 rounded-[32px] border border-white/5 shadow-xl">
                          <div className="flex items-center gap-5 overflow-hidden">
                            <div className="w-12 h-12 bg-white/5 rounded-xl p-2.5 text-neon-green shrink-0">{getExerciseIcon(ex.name)}</div>
                            <div className="overflow-hidden">
                              <span className="text-lg font-black text-white italic uppercase tracking-tight truncate block leading-none">{ex.name}</span>
                              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mt-2">{ex.sets.length} SETS TOTAL</div>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-4 flex items-center">
                            <span className="text-2xl font-black italic text-neon-green">{ex.sets[0]?.weight}kg</span>
                            <span className="mx-2 text-slate-800 font-black italic text-xl">×</span>
                            <span className="text-2xl font-black italic text-white">{ex.sets[0]?.reps}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => onSaveAsRoutine({ id: 'combined-'+selectedDate.getTime(), title: `${format(selectedDate, 'MM/dd')} 訓練課表`, startTime: selectedDate.getTime(), exercises: dailyStats.totalExercises })} className="w-full py-7 bg-neon-green text-black font-black rounded-[32px] text-sm uppercase tracking-tighter flex items-center justify-center gap-4 active:scale-[0.98] transition-all shadow-2xl">
                <Save className="w-6 h-6 stroke-[3]" /> 將當日動作存為自訂課表
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="glass rounded-[48px] p-10 border-white/5 space-y-10 bg-gradient-to-b from-transparent to-slate-900/20 shadow-2xl">
        <div className="flex justify-between items-center">
           <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-neon-green/10 rounded-[22px] flex items-center justify-center shadow-lg"><BarChart3 className="w-7 h-7 text-neon-green" /></div>
              <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">訓練容量分布</h3>
                <p className="text-[12px] font-black text-slate-600 uppercase tracking-widest mt-2">Muscle stimulation breakdown</p>
              </div>
           </div>
           <div className="flex bg-slate-800/80 p-2 rounded-2xl border border-white/5 shadow-inner">
              {(['week', 'month'] as const).map(p => (
                <button key={p} onClick={() => setAnalysisPeriod(p)} className={`px-6 py-2.5 rounded-xl text-[12px] font-black uppercase transition-all ${analysisPeriod === p ? 'bg-neon-green text-black shadow-xl shadow-neon-green/10' : 'text-slate-500 hover:text-slate-400'}`}>
                  {p === 'week' ? '週' : '月'}
                </button>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-1 gap-7 px-1">
           {allMuscleGroups.map(muscle => {
             const setTotal = analysisData[muscle] || 0;
             const max = Math.max(...Object.values(analysisData), 1);
             const percentage = (setTotal / max) * 100;
             return (
               <div key={muscle} className="space-y-3">
                  <div className="flex justify-between text-[13px] font-black uppercase tracking-widest px-1">
                     <span className="text-slate-500">{getMuscleGroupDisplay(muscle).cn}</span>
                     <span className={setTotal > 0 ? "text-neon-green italic" : "text-slate-800"}>{setTotal} SETS</span>
                  </div>
                  <div className="h-4.5 w-full bg-slate-900/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
                     <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%`, backgroundColor: getHeatColor(percentage) }} transition={{ duration: 1.5, ease: "circOut" }} className="h-full shadow-[0_0_15px_rgba(37,99,235,0.2)]" />
                  </div>
               </div>
             );
           })}
        </div>

        <div className="pt-8 border-t border-white/5">
          <p className="text-[12px] font-black text-slate-500 uppercase tracking-widest mb-6">訓練負荷圖例說明</p>
          <div className="flex justify-between items-center px-2">
            {[0, 35, 75, 100].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-3 group">
                <div className="w-10 h-3 rounded-full shadow-md transition-transform group-active:scale-110" style={{ backgroundColor: getHeatColor(s) }} />
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
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
