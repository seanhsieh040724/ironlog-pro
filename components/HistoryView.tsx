import React, { useState, useMemo } from 'react';
import { WorkoutSession, MuscleGroup, ExerciseEntry, SetEntry } from '../types';
import { getMuscleGroupDisplay } from '../utils/fitnessMath';
import { Activity, BarChart3, Trash2, CalendarDays, Timer, Save, Check, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { isSameDay, format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, addWeeks } from 'date-fns';
import { ExerciseSmallGif } from './ExerciseSmallGif';
import { startOfMonth } from 'date-fns/startOfMonth';
import { startOfYear } from 'date-fns/startOfYear';
import { motion, AnimatePresence } from 'framer-motion';
import { lightTheme } from '../themeStyles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface HistoryViewProps {
  history: WorkoutSession[];
  selectedDate: Date;
  onUpdateHistory: React.Dispatch<React.SetStateAction<WorkoutSession[]>>;
  onSaveAsRoutine: (session: WorkoutSession) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, selectedDate, onUpdateHistory, onSaveAsRoutine }) => {
  const [analysisPeriod, setAnalysisPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [chartWeekOffset, setChartWeekOffset] = useState(0);

  const chartWeekStart = useMemo(() => {
    return startOfWeek(addWeeks(new Date(), chartWeekOffset), { weekStartsOn: 1 });
  }, [chartWeekOffset]);

  const weeklyActivityData = useMemo(() => {
    const start = chartWeekStart;
    const end = endOfWeek(start, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const daySessions = history.filter(s => isSameDay(new Date(s.startTime), day));
      let dayMinutes = 0;
      daySessions.forEach(s => {
        const beginTime = s.timerStartedAt || s.startTime;
        const doneTime = s.endTime || s.startTime;
        dayMinutes += Math.max(0, Math.round((doneTime - beginTime) / 60000));
      });

      const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
      const dayIndex = day.getDay();

      return {
        name: dayNames[dayIndex],
        date: format(day, 'MM/dd'),
        minutes: dayMinutes,
        isCurrent: isSameDay(day, new Date()),
        isToday: isSameDay(day, selectedDate)
      };
    });
  }, [history, chartWeekStart, selectedDate]);

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

  const [confirmDelete, setConfirmDelete] = useState<{ sessionId: string, exerciseId: string } | null>(null);

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('確定要永久刪除這筆訓練紀錄嗎？此動作無法復原。')) {
      onUpdateHistory(prev => prev.filter(s => s.id !== sessionId));
    }
  };

  const executeDeleteExercise = (sessionId: string, exerciseId: string) => {
    onUpdateHistory(prev => {
      return prev.map(session => {
        if (session.id !== sessionId) return session;
        return {
          ...session,
          exercises: session.exercises.filter(ex => ex.id !== exerciseId)
        };
      }).filter(session => session.exercises.length > 0);
    });
    setConfirmDelete(null);
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

  const multiplier = analysisPeriod === 'month' ? 4 : 1;
  const thresholds = {
    light: 10 * multiplier,
    moderate: 15 * multiplier,
  };

  const getHeatColor = (setCount: number) => {
    if (setCount === 0) return '#E2E8F0'; 
    if (setCount <= thresholds.light) return '#82CC00';  // 輕量
    if (setCount <= thresholds.moderate) return '#FACC15';  // 適中
    return '#FF3B30';                      // 力竭
  };

  const getLoadStatus = (setCount: number) => {
    if (setCount === 0) return { label: '休息恢復', color: 'text-slate-300' };
    if (setCount <= thresholds.light) return { label: `輕量(1-${thresholds.light}組)`, color: 'text-[#82CC00]' };
    if (setCount <= thresholds.moderate) return { label: `適中(${thresholds.light + 1}-${thresholds.moderate}組)`, color: 'text-yellow-500' };
    return { label: `力竭(${thresholds.moderate + 1}+組)`, color: 'text-red-500' };
  };

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 text-slate-400">
             <CalendarDays className="w-5 h-5 text-black" />
             <h2 style={{ color: lightTheme.text }} className="text-base font-black italic tracking-tighter uppercase pr-2">
               訓練日報 <span className="text-black">/ {format(selectedDate, 'MM.dd')}</span>
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
                    <div className="space-y-6">
                      {session.exercises.map(ex => (
                        <div key={ex.id} style={{ backgroundColor: lightTheme.card }} className="p-6 rounded-[32px] border border-black/5 shadow-sm space-y-6 relative overflow-hidden group">
                          {/* 刪除確認遮罩 */}
                          <AnimatePresence>
                            {confirmDelete?.exerciseId === ex.id && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-[110] bg-red-500/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
                              >
                                <p className="text-white font-black italic text-lg mb-4 uppercase tracking-tighter">確定要刪除此動作？</p>
                                <div className="flex gap-3 w-full">
                                  <button 
                                    onClick={() => executeDeleteExercise(session.id, ex.id)}
                                    className="flex-1 bg-white text-red-500 py-3 rounded-2xl font-black uppercase text-xs active:scale-95 transition-all"
                                  >
                                    確認刪除
                                  </button>
                                  <button 
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 bg-black/20 text-white py-3 rounded-2xl font-black uppercase text-xs active:scale-95 transition-all"
                                  >
                                    取消
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setConfirmDelete({ sessionId: session.id, exerciseId: ex.id });
                            }}
                            className="absolute top-3 right-3 w-12 h-12 flex items-center justify-center text-red-500/40 hover:text-red-500 active:scale-75 transition-all z-[100] cursor-pointer bg-red-50 rounded-full border border-red-100/50"
                            title="刪除此動作"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center border border-black/5">
                              <ExerciseSmallGif name={ex.name} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span style={{ color: lightTheme.text }} className="text-xl font-black italic uppercase tracking-tight leading-tight py-1 block">{ex.name}</span>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                {getMuscleGroupDisplay(ex.muscleGroup).cn} • {ex.sets.length} 組
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-2">
                            {ex.sets.map((set, sIdx) => (
                              <div key={set.id} className="flex items-center justify-between py-2.5 px-4 bg-white/50 rounded-2xl border border-black/[0.03]">
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black text-slate-300 italic w-4">#{sIdx + 1}</span>
                                  <div className="flex items-center gap-1">
                                    <span style={{ color: lightTheme.text }} className="text-base font-black italic">{set.weight}</span>
                                    <span className="text-[9px] font-black text-black uppercase italic">kg</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1">
                                    <span style={{ color: lightTheme.text }} className="text-base font-black italic">{set.reps}</span>
                                    <span className="text-[9px] font-black text-black uppercase italic">reps</span>
                                  </div>
                                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${set.completed ? 'bg-[#CCFF00] text-black' : 'bg-slate-100 text-slate-200'}`}>
                                    <Check className="w-3.5 h-3.5 stroke-[4]" />
                                  </div>
                                </div>
                              </div>
                            ))}
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
             const progressPercentage = Math.min(100, (setTotal / (20 * multiplier)) * 100);
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
        <div className="flex items-center justify-between pt-4 border-t border-black/5">
           <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-[#82CC00] shadow-sm" />
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">輕量(1-{thresholds.light}組)</span>
           </div>
           <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-[#FACC15] shadow-sm" />
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">適中({thresholds.light + 1}-{thresholds.moderate}組)</span>
           </div>
           <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-[#FF3B30] shadow-sm" />
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">力竭({thresholds.moderate + 1}+組)</span>
           </div>
        </div>
      </div>

      {/* 每週運動時間圖表 */}
      <div style={{ backgroundColor: lightTheme.bg }} className="rounded-[44px] p-8 border border-black/5 space-y-9 shadow-xl overflow-hidden mt-6">
        <div className="flex justify-between items-center">
           <div className="flex items-center gap-4">
              <div style={{ backgroundColor: lightTheme.card }} className="w-12 h-12 border border-black/5 rounded-xl flex items-center justify-center shadow-inner">
                <Clock className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-base font-black italic uppercase tracking-tighter pr-2 text-black">每週訓練時數</h3>
                <p className="text-[9px] font-black text-black opacity-50 uppercase tracking-widest mt-1">
                  {format(chartWeekStart, 'yyyy.MM.dd')} - {format(endOfWeek(chartWeekStart, { weekStartsOn: 1 }), 'MM.dd')}
                </p>
              </div>
           </div>
           <div className="flex gap-2">
              <button 
                onClick={() => setChartWeekOffset(prev => prev - 1)}
                className="w-10 h-10 rounded-xl bg-slate-50 border border-black/5 flex items-center justify-center text-slate-400 active:scale-95 transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setChartWeekOffset(0)}
                className={`px-3 h-10 rounded-xl border border-black/5 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${chartWeekOffset === 0 ? 'bg-black text-white' : 'bg-white text-slate-400'}`}
              >
                本週
              </button>
              <button 
                onClick={() => setChartWeekOffset(prev => prev + 1)}
                className="w-10 h-10 rounded-xl bg-slate-50 border border-black/5 flex items-center justify-center text-slate-400 active:scale-95 transition-all shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
           </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={weeklyActivityData} 
              margin={{ top: 20, right: 10, left: -10, bottom: 10 }}
              barGap={0}
            >
              <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                axisLine={{ stroke: '#E2E8F0', strokeWidth: 1 }}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 900, fill: '#000000' }}
                dy={10}
              />
              <YAxis 
                axisLine={{ stroke: '#E2E8F0', strokeWidth: 1 }}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 900, fill: '#000000' }}
                dx={-5}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-black text-white px-3 py-2 rounded-xl text-[10px] font-black shadow-xl border border-white/10">
                        <p>{payload[0].payload.date}</p>
                        <p className="text-[#CCFF00]">{payload[0].value} 分鐘</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="minutes" 
                radius={[8, 8, 8, 8]}
                barSize={32}
              >
                {weeklyActivityData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isToday ? '#000000' : '#CCFF00'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-7 gap-0 pl-[45px] pr-2">
           {weeklyActivityData.map((day, idx) => (
             <div key={idx} className="flex flex-col items-center">
               <div className={`text-[8px] font-black uppercase text-black ${day.isToday ? 'opacity-100' : 'opacity-40'}`}>
                 {day.minutes}m
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};