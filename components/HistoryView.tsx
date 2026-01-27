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
    
    // 建立一個包含當日所有動作的虛擬 Session
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
   * 依照訓練百分比決定顏色：
   * 0% (無數據)：深藍灰 #1e293b
   * 1-35%：淡藍 #93c5fd
   * 36-75%：亮藍 #3b82f6
   * 76-100%：深藍 #2563eb
   */
  const getHeatColor = (percentage: number) => {
    if (percentage === 0) return '#1e293b'; 
    if (percentage < 35) return '#93c5fd';  
    if (percentage < 75) return '#3b82f6';  
    return '#2563eb';                  
  };

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-slate-400">
             <CalendarDays className="w-4 h-4 text-neon-green" />
             <h2 className="text-sm font-black italic tracking-tighter uppercase">
               訓練日報 <span className="text-white">/ {format(selectedDate, 'MM.dd')}</span>
             </h2>
          </div>
          {dailyStats && (
            <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
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
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 text-slate-700">
                <Activity className="w-8 h-8" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">這天沒有訓練紀錄</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-slate-800 mt-2 italic">Rest is part of the process</p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-[44px] p-7 border-white/5 space-y-6 shadow-2xl relative overflow-hidden group"
            >
              {/* 日報頂部總覽 */}
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <h4 className="text-2xl font-black italic uppercase text-white leading-tight">當日總訓練</h4>
                  <div className="flex items-center space-x-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-neon-green" /> {dailyStats.totalMinutes} MINS
                    </span>
                    <span className="bg-slate-800/50 px-2 py-0.5 rounded-md">
                      {dailyStats.totalExercises.length} EXERCISES
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-neon-green/10 rounded-2xl flex items-center justify-center text-neon-green">
                   <Activity className="w-6 h-6 animate-pulse" />
                </div>
              </div>

              {/* 依時段列出所有動作 */}
              <div className="space-y-6">
                {filteredHistory.map((session, sIdx) => (
                  <div key={session.id} className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                       <div className="flex items-center gap-2">
                          <div className="w-1 h-3 bg-neon-green/30 rounded-full" />
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">時段 {sIdx + 1}: {format(new Date(session.startTime), 'HH:mm')}</span>
                       </div>
                       <button 
                         onClick={() => handleDeleteSession(session.id)}
                         className="text-slate-700 hover:text-red-500 active:scale-90 transition-all"
                       >
                         <Trash2 className="w-3 h-3" />
                       </button>
                    </div>
                    
                    <div className="space-y-2">
                      {session.exercises.map(ex => (
                        <div key={ex.id} className="flex justify-between items-center bg-black/40 p-4 rounded-3xl border border-white/5">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-9 h-9 bg-white/5 rounded-xl p-2 text-neon-green shrink-0">
                              {getExerciseIcon(ex.name)}
                            </div>
                            <div className="overflow-hidden">
                              <span className="text-sm font-black text-white italic uppercase tracking-tight truncate block">{ex.name}</span>
                              <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">{ex.sets.length} SETS TOTAL</div>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <span className="text-base font-black italic text-neon-green">{ex.sets[0]?.weight}kg</span>
                            <span className="mx-1 text-slate-800 font-black italic">×</span>
                            <span className="text-base font-black italic text-white">{ex.sets[0]?.reps}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* 統一的儲存按鈕 */}
              <button 
                onClick={handleSaveDayAsRoutine}
                className="w-full py-5 bg-neon-green text-black font-black rounded-3xl text-[11px] uppercase tracking-tighter flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(173,255,47,0.1)]"
              >
                <Save className="w-4 h-4 stroke-[3]" /> 將今日訓練存為自訂課表
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 容量分布圖表區塊 */}
      <div className="glass rounded-[44px] p-8 border-white/5 space-y-8 bg-gradient-to-b from-transparent to-slate-900/20 shadow-2xl">
        <div className="flex justify-between items-center">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neon-green/10 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <h3 className="text-sm font-black italic uppercase tracking-tighter text-white">訓練容量分布</h3>
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Muscle stimulation breakdown</p>
              </div>
           </div>
           <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-white/5">
              {(['week', 'month'] as const).map(p => (
                <button key={p} onClick={() => setAnalysisPeriod(p)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${analysisPeriod === p ? 'bg-neon-green text-black shadow-lg shadow-neon-green/10' : 'text-slate-500 hover:text-slate-400'}`}>
                  {p === 'week' ? '週' : '月'}
                </button>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
           {allMuscleGroups.map(muscle => {
             const setTotal = analysisData[muscle] || 0;
             const max = Math.max(...(Object.values(analysisData) as number[]), 1);
             const percentage = (setTotal / max) * 100;
             const barColor = getHeatColor(percentage);
             
             return (
               <div key={muscle} className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest px-1">
                     <span className="text-slate-500">{getMuscleGroupDisplay(muscle).cn}</span>
                     <span className={setTotal > 0 ? "text-neon-green italic" : "text-slate-800"}>{setTotal} SETS</span>
                  </div>
                  <div className="h-3 w-full bg-slate-900/60 rounded-full overflow-hidden border border-white/5">
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

        {/* 圖例說明：從 ProfileView 移動過來 */}
        <div className="pt-4 border-t border-white/5">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">訓練負荷程度說明</p>
          <div className="flex justify-between">
            {[0, 35, 75, 100].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-6 h-2 rounded-full shadow-sm" style={{ backgroundColor: getHeatColor(s) }} />
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
                  {s === 0 ? '休息中' : s === 35 ? '輕量' : s === 75 ? '強化' : '極限'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
