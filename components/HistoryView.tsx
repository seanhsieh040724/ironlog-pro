
import React, { useState, useMemo } from 'react';
import { WorkoutSession, MuscleGroup } from '../types';
import { getMuscleGroupDisplay } from '../utils/fitnessMath';
import { Clock, Activity, Edit2, Check, BarChart3, Trash2, X, AlertCircle } from 'lucide-react';
import { isSameDay, format } from 'date-fns';
import startOfWeek from 'date-fns/startOfWeek';
import startOfMonth from 'date-fns/startOfMonth';
import startOfYear from 'date-fns/startOfYear';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryViewProps {
  history: WorkoutSession[];
  selectedDate: Date;
  onUpdateHistory: React.Dispatch<React.SetStateAction<WorkoutSession[]>>;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, selectedDate, onUpdateHistory }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [analysisPeriod, setAnalysisPeriod] = useState<'week' | 'month' | 'year'>('week');

  const filteredHistory = useMemo(() => 
    history.filter(s => isSameDay(new Date(s.startTime), selectedDate)),
  [history, selectedDate]);

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('確定要刪除這筆紀錄嗎？')) {
      onUpdateHistory(prev => {
        const next = prev.filter(s => s.id !== sessionId);
        localStorage.setItem('ironlog_v3_history', JSON.stringify(next));
        return next;
      });
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
          const exerciseVolume = ex.sets.reduce((sum, s) => sum + (s.weight * s.reps), 0);
          results[ex.muscleGroup] += exerciseVolume;
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
              <p className="text-xs">當天無訓練紀錄</p>
            </motion.div>
          ) : (
            filteredHistory.map(session => (
              <motion.div 
                key={session.id} 
                layout
                className="glass rounded-[32px] p-6 border-white/5 space-y-4 shadow-xl"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-black italic uppercase text-lime-400 leading-tight">{session.title}</h4>
                    <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {Math.round(((session.endTime || Date.now()) - session.startTime) / 60000)} 分鐘</span>
                      <span>{session.exercises.length} 動作</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteSession(session.id)} className="p-2 text-slate-700 active:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
                
                <div className="space-y-3">
                  {session.exercises.map(ex => (
                    <div key={ex.id} className="flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5">
                      <div>
                        <span className="text-xs font-black text-white italic uppercase tracking-tight">{ex.name}</span>
                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{ex.sets.length} 組訓練</div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black italic text-lime-400">{ex.sets[0]?.weight}kg</span>
                        <span className="mx-1 text-slate-600">×</span>
                        <span className="text-sm font-black italic text-white">{ex.sets[0]?.reps}次</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* 分析區塊 */}
      <div className="glass rounded-[40px] p-8 border-white/5 space-y-6">
        <div className="flex justify-between items-center">
           <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-lime-400" />
              <h3 className="text-sm font-black italic uppercase tracking-tighter">本{analysisPeriod === 'week' ? '週' : analysisPeriod === 'month' ? '月' : '年'}容量分析</h3>
           </div>
           <div className="flex bg-slate-800 rounded-lg p-1">
              {(['week', 'month'] as const).map(p => (
                <button key={p} onClick={() => setAnalysisPeriod(p)} className={`px-2 py-1 rounded text-[9px] font-black uppercase ${analysisPeriod === p ? 'bg-lime-400 text-black' : 'text-slate-500'}`}>
                  {p === 'week' ? '週' : '月'}
                </button>
              ))}
           </div>
        </div>

        <div className="space-y-4">
           {allMuscleGroups.map(muscle => {
             const volume = analysisData[muscle] || 0;
             const max = Math.max(...(Object.values(analysisData) as number[]), 1);
             const percentage = (volume / max) * 100;
             if (volume === 0) return null;
             
             return (
               <div key={muscle} className="space-y-1.5">
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                     <span className="text-slate-400">{getMuscleGroupDisplay(muscle).cn}</span>
                     <span className="text-lime-400">{Math.round(volume)} KG</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className="h-full bg-lime-400" />
                  </div>
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
};
