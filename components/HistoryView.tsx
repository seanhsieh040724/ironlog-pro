
import React, { useState, useMemo } from 'react';
import { WorkoutSession, MuscleGroup } from '../types';
import { getMuscleGroupDisplay } from '../utils/fitnessMath';
import { Clock, Activity, BarChart3, Trash2, LayoutGrid, Save } from 'lucide-react';
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

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('確定要永久刪除這筆訓練紀錄嗎？此動作無法復原。')) {
      onUpdateHistory(prev => prev.filter(s => s.id !== sessionId));
    }
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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-sm font-black italic tracking-tighter uppercase px-1 text-slate-500">
          訓練日報 - {format(selectedDate, 'MM月dd日')}
        </h2>

        <AnimatePresence mode="popLayout">
          {filteredHistory.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="py-12 flex flex-col items-center justify-center glass rounded-[32px] border-white/5 opacity-40 italic"
            >
              <Activity className="w-10 h-10 mb-2" />
              <p className="text-xs font-black uppercase tracking-widest">當天無任何紀錄</p>
            </motion.div>
          ) : (
            filteredHistory.map(session => (
              <motion.div 
                key={session.id} 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                className="glass rounded-[32px] p-6 border-white/5 space-y-4 shadow-xl relative overflow-hidden group"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h4 className="text-xl font-black italic uppercase text-neon-green leading-tight truncate mr-4">{session.title}</h4>
                    <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {Math.round(((session.endTime || Date.now()) - session.startTime) / 60000)} 分鐘</span>
                      <span>{session.exercises.length} 項動作</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onSaveAsRoutine(session)}
                      className="w-10 h-10 bg-white/5 text-slate-400 rounded-xl flex items-center justify-center active:scale-90 transition-all hover:text-neon-green"
                      title="存為課表"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteSession(session.id)} 
                      className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center active:scale-90 transition-all"
                      title="刪除紀錄"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {session.exercises.map(ex => (
                    <div key={ex.id} className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                      <div>
                        <span className="text-sm font-black text-white italic uppercase tracking-tight">{ex.name}</span>
                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{ex.sets.length} 組訓練</div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black italic text-neon-green">{ex.sets[0]?.weight}kg</span>
                        <span className="mx-1 text-slate-700 font-black">×</span>
                        <span className="text-sm font-black italic text-white">{ex.sets[0]?.reps}次</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => onSaveAsRoutine(session)}
                  className="w-full py-3 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2 active:bg-neon-green/10 active:text-neon-green transition-all"
                >
                  <Save className="w-3 h-3" /> 將此訓練加入為自訂課表
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="glass rounded-[40px] p-8 border-white/5 space-y-6">
        <div className="flex justify-between items-center">
           <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-neon-green" />
              <h3 className="text-sm font-black italic uppercase tracking-tighter">訓練量分析 (總組數)</h3>
           </div>
           <div className="flex bg-slate-800 rounded-lg p-1">
              {(['week', 'month'] as const).map(p => (
                <button key={p} onClick={() => setAnalysisPeriod(p)} className={`px-2 py-1 rounded text-[9px] font-black uppercase transition-all ${analysisPeriod === p ? 'bg-neon-green text-black' : 'text-slate-500'}`}>
                  {p === 'week' ? '週' : '月'}
                </button>
              ))}
           </div>
        </div>

        <div className="space-y-4">
           {allMuscleGroups.map(muscle => {
             const setTotal = analysisData[muscle] || 0;
             const max = Math.max(...(Object.values(analysisData) as number[]), 1);
             const percentage = (setTotal / max) * 100;
             
             return (
               <div key={muscle} className="space-y-1.5">
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                     <span className="text-slate-400">{getMuscleGroupDisplay(muscle).cn}</span>
                     <span className={setTotal > 0 ? "text-neon-green" : "text-slate-600"}>{setTotal} 組</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }} 
                       animate={{ width: `${percentage}%` }} 
                       transition={{ duration: 1, ease: "circOut" }}
                       className={`h-full ${setTotal > 0 ? "bg-neon-green" : "bg-slate-800"}`} 
                     />
                  </div>
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
};
