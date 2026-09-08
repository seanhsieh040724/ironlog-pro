import React, { useState, useMemo } from 'react';
import { WorkoutSession, MuscleGroup, ExerciseEntry, SetEntry } from '../types';
import { getMuscleGroupDisplay, getMuscleGroup } from '../utils/fitnessMath';
import { Activity, BarChart3, Trash2, CalendarDays, Timer, Save, Check, ChevronLeft, ChevronRight, Clock, ArrowLeft, X } from 'lucide-react';
import { isSameDay, format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, addWeeks, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { ExerciseSmallGif } from './ExerciseSmallGif';
import { BodyMuscleMap, MuscleLoadInfo, LoadLevel } from './BodyMuscleMap';
import { motion, AnimatePresence } from 'framer-motion';
import { lightTheme } from '../themeStyles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Label } from 'recharts';

interface HistoryViewProps {
  history: WorkoutSession[];
  selectedDate: Date;
  onUpdateHistory: React.Dispatch<React.SetStateAction<WorkoutSession[]>>;
  onSaveAsRoutine: (session: WorkoutSession) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, selectedDate, onUpdateHistory, onSaveAsRoutine }) => {
  const [analysisPeriod, setAnalysisPeriod] = useState<'week' | 'month'>('week');
  const [selectedVolumeMuscle, setSelectedVolumeMuscle] = useState<MuscleGroup | null>(null);
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

  const muscleGroupsList: MuscleGroup[] = ['chest', 'arms', 'back', 'core', 'quads', 'glutes', 'shoulders', 'fullbody'];

  const volumeAnalysis = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;
    if (analysisPeriod === 'week') {
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfWeek(now, { weekStartsOn: 1 });
    } else {
      // 真正的「本月」時間區間 (當月 1 號 00:00 至 當月底 23:59:59)
      start = startOfMonth(now);
      end = endOfMonth(now);
    }

    const startMs = start.getTime();
    const endMs = end.getTime();

    const periodHistory = history.filter(s => s.startTime >= startMs && s.startTime <= endMs);

    const stats: Record<MuscleGroup, {
      sets: number;
      exercises: Record<string, number>;
    }> = {
      chest: { sets: 0, exercises: {} },
      back: { sets: 0, exercises: {} },
      quads: { sets: 0, exercises: {} },
      hamstrings: { sets: 0, exercises: {} },
      shoulders: { sets: 0, exercises: {} },
      arms: { sets: 0, exercises: {} },
      core: { sets: 0, exercises: {} },
      glutes: { sets: 0, exercises: {} },
      fullbody: { sets: 0, exercises: {} }
    };

    periodHistory.forEach(session => {
      session.exercises.forEach(ex => {
        let mg: MuscleGroup = ex.muscleGroup || getMuscleGroup(ex.name);
        const n = ex.name.toLowerCase();
        if (n.includes('硬舉') || n.includes('deadlift') || n.includes('波比') || n.includes('burpee') || n.includes('壺鈴') || n.includes('swing') || n.includes('全身') || mg === 'fullbody') {
          stats.fullbody.sets += ex.sets.length;
          stats.fullbody.exercises[ex.name] = (stats.fullbody.exercises[ex.name] || 0) + ex.sets.length;
        }
        // 統整腿部 (膕繩或 legs 歸入 quads 腿部)
        if (mg === 'hamstrings' || (mg as string) === 'legs') {
          mg = 'quads';
        }
        if (!stats[mg]) {
          stats[mg] = { sets: 0, exercises: {} };
        }
        const count = ex.sets.length;
        stats[mg].sets += count;
        stats[mg].exercises[ex.name] = (stats[mg].exercises[ex.name] || 0) + count;
      });
    });

    const isMonthly = analysisPeriod === 'month';
    const muscleMapData: Record<MuscleGroup, MuscleLoadInfo> = {} as any;

    (Object.keys(stats) as MuscleGroup[]).forEach(g => {
      const totalSets = stats[g].sets;
      // 月度判定標準：月總組數 ÷ 4 = 平均每週組數
      const evalSets = isMonthly ? totalSets / 4 : totalSets;
      let level: LoadLevel = 'none';
      let levelLabel = '未訓練';
      let color = '#CBD5E1';

      if (totalSets === 0) {
        level = 'none';
        levelLabel = '未訓練';
        color = '#CBD5E1';
      } else if (evalSets <= 10) {
        level = 'light';
        levelLabel = '輕量等級';
        color = '#22C55E';
      } else if (evalSets <= 15) {
        level = 'moderate';
        levelLabel = '適中等級';
        color = '#F97316';
      } else {
        level = 'exhausted';
        levelLabel = '力竭等級';
        color = '#EF4444';
      }

      const d = getMuscleGroupDisplay(g);

      muscleMapData[g] = {
        group: g,
        nameCn: d.cn,
        nameEn: d.en,
        sets: totalSets,
        evalSets,
        level,
        levelLabel,
        color
      };
    });

    return {
      stats,
      muscleMapData,
      isMonthly
    };
  }, [history, analysisPeriod]);

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 text-slate-400">
             <CalendarDays className="w-5 h-5 text-black" />
             <h2 style={{ color: lightTheme.text }} className="text-xl font-black tracking-tighter uppercase pr-2">
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
              <p className="text-[12px] font-black uppercase tracking-[0.3em] text-black">這天沒有訓練紀錄</p>
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
                  <h4 style={{ color: lightTheme.text }} className="text-xl font-black uppercase leading-tight pr-3">當日總訓練</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span style={{ backgroundColor: lightTheme.card, color: lightTheme.text }} className="flex items-center gap-2 border border-black/5 px-3 py-1.5 rounded-xl text-sm font-black shadow-inner">
                      <Timer className="w-3.5 h-3.5 text-black" /> {dailyStats.totalMinutes} 分鐘
                    </span>
                    <span style={{ backgroundColor: lightTheme.card, color: '#000000' }} className="border border-black/5 px-3 py-1.5 rounded-xl text-sm font-black text-black">
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
                    <div className="flex items-center px-2">
                       <span className="text-[10px] font-black text-black uppercase tracking-widest">
                         {format(new Date(session.startTime), 'HH:mm')} 開始
                       </span>
                    </div>
                    <div className="space-y-3.5">
                      {session.exercises.map(ex => (
                        <div key={ex.id} style={{ backgroundColor: lightTheme.card }} className="p-3.5 sm:p-4 rounded-[22px] border border-black/5 shadow-xs space-y-3 relative overflow-hidden group">
                          {/* 刪除確認遮罩 */}
                          <AnimatePresence>
                            {confirmDelete?.exerciseId === ex.id && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-[110] bg-red-600/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center rounded-[22px]"
                              >
                                <p className="text-white font-black text-base sm:text-lg mb-3 uppercase tracking-tight">確定要刪除此動作？</p>
                                <div className="flex gap-2.5 w-full max-w-[280px]">
                                  <button 
                                    onClick={() => executeDeleteExercise(session.id, ex.id)}
                                    className="flex-1 bg-white text-red-600 py-2 sm:py-2.5 rounded-xl font-black uppercase text-xs sm:text-sm active:scale-95 transition-all shadow-sm"
                                  >
                                    確認刪除
                                  </button>
                                  <button 
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 bg-black/30 text-white py-2 sm:py-2.5 rounded-xl font-black uppercase text-xs sm:text-sm active:scale-95 transition-all"
                                  >
                                    取消
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* 動作卡片右上角紅色垃圾桶（更深紅色、清晰醒目） */}
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setConfirmDelete({ sessionId: session.id, exerciseId: ex.id });
                            }}
                            className="absolute top-2.5 right-2.5 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-red-600 hover:text-red-700 active:scale-75 transition-all z-[100] cursor-pointer bg-red-100 hover:bg-red-200/90 rounded-full border border-red-200 shadow-xs"
                            title="刪除此動作"
                          >
                            <Trash2 className="w-4 h-4 stroke-[2.3]" />
                          </button>
                          
                          {/* 動作名稱與 GIF（尺寸縮小，比照主頁動作欄位） */}
                          <div className="flex items-center gap-3.5 pr-8">
                            <div className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] aspect-square rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center border border-black/5">
                              <ExerciseSmallGif name={ex.name} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span style={{ color: lightTheme.text }} className="text-[16px] font-black uppercase tracking-tight leading-snug py-0.5 block truncate">
                                {ex.name}
                              </span>
                              <div className="text-[11px] font-black text-black uppercase tracking-wider mt-0.5">
                                {getMuscleGroupDisplay(ex.muscleGroup).cn} • {ex.sets.length} 組
                              </div>
                            </div>
                          </div>
                          
                          {/* 各組數據列表（#1 改為黑色、間距收斂） */}
                          <div className="grid grid-cols-1 gap-1.5">
                            {ex.sets.map((set, sIdx) => (
                              <div key={set.id} className="flex items-center justify-between py-1.5 px-3 bg-white/60 rounded-xl border border-black/[0.03]">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-[12px] font-black text-black w-6 shrink-0">#{sIdx + 1}</span>
                                  <div className="flex items-center gap-1">
                                    <span style={{ color: lightTheme.text }} className="text-base font-black">{set.weight}</span>
                                    <span className="text-[10px] font-black text-black uppercase">kg</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <span style={{ color: lightTheme.text }} className="text-base font-black">{set.reps}</span>
                                    <span className="text-[10px] font-black text-black uppercase">reps</span>
                                  </div>
                                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${set.completed ? 'bg-[#CCFF00] text-black' : 'bg-slate-100 text-slate-300'}`}>
                                    <Check className="w-3 h-3 stroke-[3.5]" />
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
                className="w-full py-6 text-black font-black rounded-3xl text-sm uppercase flex items-center justify-center gap-3.5 active:scale-[0.98] transition-all shadow-md"
              >
                <Save className="w-5 h-5" /> 存為自訂課表
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-white rounded-[32px] sm:rounded-[36px] p-5 sm:p-7 border border-slate-100 shadow-sm space-y-5 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center">
           <div className="flex items-center gap-3 sm:gap-3.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 border border-slate-200/80 rounded-2xl flex items-center justify-center bg-white shadow-xs">
                <BarChart3 className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">訓練容量分布</h3>
                <p className="text-xs text-black font-semibold mt-0.5">累積負荷分析 • 依組數統計各肌群訓練量</p>
              </div>
           </div>
           {/* Week / Month Toggle */}
           <div className="bg-slate-100 p-1 rounded-full flex items-center">
              {(['week', 'month'] as const).map(p => (
                <button 
                  key={p} 
                  onClick={() => {
                    setAnalysisPeriod(p);
                  }} 
                  className={`px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    analysisPeriod === p ? 'bg-black text-white shadow-xs' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {p === 'week' ? '週' : '月'}
                </button>
              ))}
           </div>
        </div>

        {/* Interactive Body Muscle Map (Front + Back) with Legend */}
        <BodyMuscleMap
          muscleData={volumeAnalysis.muscleMapData}
          selectedGroup={selectedVolumeMuscle}
          onSelectGroup={(g) => setSelectedVolumeMuscle(prev => prev === g ? null : g)}
          isMonthly={volumeAnalysis.isMonthly}
        />

        {/* Selected Muscle Detail View OR Muscle Group Grid */}
        <AnimatePresence mode="wait">
          {selectedVolumeMuscle ? (
            <motion.div
              key={`detail-${selectedVolumeMuscle}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="pt-2 border-t border-slate-100 space-y-4"
            >
              {/* Top Row: Muscle Name & Load Level */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: volumeAnalysis.muscleMapData[selectedVolumeMuscle].color }}
                  />
                  <h4 className="text-base font-bold text-slate-900">
                    {volumeAnalysis.muscleMapData[selectedVolumeMuscle].nameCn}
                  </h4>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-slate-900 leading-tight">
                    {volumeAnalysis.muscleMapData[selectedVolumeMuscle].sets} 組
                  </div>
                  <div 
                    className="text-xs font-bold leading-tight mt-0.5"
                    style={{ color: volumeAnalysis.muscleMapData[selectedVolumeMuscle].color }}
                  >
                    {volumeAnalysis.muscleMapData[selectedVolumeMuscle].levelLabel}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 sm:h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${Math.min(100, Math.max(volumeAnalysis.muscleMapData[selectedVolumeMuscle].sets > 0 ? 8 : 0, (volumeAnalysis.muscleMapData[selectedVolumeMuscle].sets / (volumeAnalysis.isMonthly ? 64 : 16)) * 100))}%` 
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{ backgroundColor: volumeAnalysis.muscleMapData[selectedVolumeMuscle].color }}
                  className="h-full rounded-full shadow-xs"
                />
              </div>

              {/* Major Exercises Breakdown */}
              <div className="space-y-2 pt-1">
                <div className="text-sm font-bold text-slate-900 mb-2">
                  主要動作
                </div>
                {Object.entries(volumeAnalysis.stats[selectedVolumeMuscle]?.exercises || {}).length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {Object.entries(volumeAnalysis.stats[selectedVolumeMuscle].exercises)
                      .sort((a, b) => b[1] - a[1])
                      .map(([exName, count]) => (
                        <div key={exName} className="py-2.5 flex items-center justify-between">
                          <span className="text-[13px] font-medium text-slate-700">{exName}</span>
                          <span className="text-[13px] font-bold text-slate-900">
                            {count} 組
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    本{volumeAnalysis.isMonthly ? '月' : '週'}尚無此肌群的訓練動作紀錄
                  </p>
                )}
              </div>

              {/* Return to Overview Button */}
              <button
                onClick={() => setSelectedVolumeMuscle(null)}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer pt-1"
              >
                <X className="w-3.5 h-3.5" /> 返回肌群列表
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid-overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-2 border-t border-slate-100"
            >
              <div className="grid grid-cols-2 gap-3">
                {muscleGroupsList.map(muscle => {
                  const data = volumeAnalysis.muscleMapData[muscle];
                  return (
                    <button
                      key={muscle}
                      onClick={() => setSelectedVolumeMuscle(muscle)}
                      className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 shadow-xs transition-all active:scale-98 text-left cursor-pointer group"
                    >
                      <span 
                        className="w-4 h-4 rounded-full shrink-0 shadow-xs" 
                        style={{ backgroundColor: data.color }} 
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-bold text-slate-800 leading-none truncate">
                          {data.nameCn}
                        </span>
                        <span className="text-[14px] font-black text-slate-900 mt-1.5 leading-none">
                          {data.sets} 組
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 每週運動時間圖表 */}
      <div style={{ backgroundColor: lightTheme.bg }} className="rounded-[44px] p-8 border border-black/5 space-y-9 shadow-xl overflow-hidden mt-6">
        <div className="flex justify-between items-center">
           <div className="flex items-center gap-4">
              <div style={{ backgroundColor: lightTheme.card }} className="w-10 h-10 border border-black/5 rounded-xl flex items-center justify-center shadow-inner">
                <Clock className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-tighter text-black">每週訓練時數</h3>
                <p className="text-[10px] font-black text-black uppercase tracking-widest mt-0.5">
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
              margin={{ top: 25, right: 12, left: -4, bottom: 10 }}
              barGap={0}
            >
              <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                axisLine={{ stroke: '#E2E8F0', strokeWidth: 1 }}
                tickLine={false}
                tick={{ fontSize: 16, fontWeight: 900, fill: '#000000' }}
                dy={8}
              />
              <YAxis 
                domain={[0, 180]}
                ticks={[0, 30, 60, 90, 120, 150, 180]}
                width={42}
                axisLine={{ stroke: '#E2E8F0', strokeWidth: 1 }}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 900, fill: '#000000' }}
                dx={-4}
              >
                <Label 
                  value="分鐘" 
                  position="top" 
                  offset={10} 
                  fill="#000000" 
                  fontSize={11} 
                  fontWeight={900} 
                />
              </YAxis>
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-black text-white px-3.5 py-2.5 rounded-xl text-xs font-black shadow-xl border border-white/10">
                        <p className="text-slate-300">{payload[0].payload.date}（週{payload[0].payload.name}）</p>
                        <p className="text-white font-extrabold text-sm mt-0.5">{payload[0].value} 分鐘</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="minutes" 
                radius={[6, 6, 6, 6]}
                barSize={32}
              >
                {weeklyActivityData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.minutes > 0 ? '#000000' : 'transparent'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-7 gap-0 pl-[38px] pr-[12px]">
           {weeklyActivityData.map((day, idx) => (
             <div key={idx} className="flex flex-col items-center">
               <div 
                 className={`text-[13px] sm:text-[14px] font-black tracking-tight ${
                   day.minutes > 0 
                     ? 'text-black' 
                     : day.isToday 
                       ? 'text-slate-800' 
                       : 'text-slate-300'
                 }`}
               >
                 {day.minutes}m
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};