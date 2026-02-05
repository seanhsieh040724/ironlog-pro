
import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AppContext } from '../App';
import { RoutineTemplate, MuscleGroup, ExerciseEntry, SetEntry, WorkoutSession } from '../types';
import { getMuscleGroup, getMuscleGroupDisplay, fetchExerciseGif, getExerciseMethod } from '../utils/fitnessMath';
import { ORGANIZED_EXERCISES, EXERCISE_DATABASE } from './WorkoutView';
import { 
  LayoutGrid, Trash2, ArrowLeft, Plus, ChevronRight, X, Search, Edit2, 
  Check, Sparkles, Layers, BookOpen, ChevronLeft, Zap, Play, Save, 
  Target, PlusCircle, MinusCircle, Loader2, Timer, PlusSquare, Weight,
  PauseCircle, PlayCircle, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RoutineView: React.FC<{ onStartRoutine: (template: RoutineTemplate) => void }> = ({ onStartRoutine }) => {
  const context = useContext(AppContext);
  const [previewRoutine, setPreviewRoutine] = useState<RoutineTemplate | null>(null);
  const [integratedRoutine, setIntegratedRoutine] = useState<RoutineTemplate | null>(null);
  
  const [sessionExercises, setSessionExercises] = useState<ExerciseEntry[]>([]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  
  const [activeCategory, setActiveCategory] = useState<string>('chest');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExName, setSelectedExName] = useState<string | null>(null);
  
  const [mockSets, setMockSets] = useState<SetEntry[]>([]);
  const [dummyTimerActive, setDummyTimerActive] = useState(false);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [isGifLoading, setIsGifLoading] = useState(false);

  if (!context) return null;
  const { customRoutines, setCustomRoutines, setHistory, history, triggerRestTimer } = context;

  useEffect(() => {
    if (selectedExName) {
      setMockSets(Array.from({ length: 4 }).map(() => ({
        id: crypto.randomUUID(), weight: 0, reps: 10, completed: false
      })));
      setDummyTimerActive(false);
      setIsGifLoading(true);
      fetchExerciseGif(selectedExName).then(url => {
        setGifUrl(url);
        setTimeout(() => setIsGifLoading(false), 300);
      });
    }
  }, [selectedExName]);

  const filteredExercises = useMemo(() => {
    if (searchTerm) {
      return EXERCISE_DATABASE.filter(ex => ex.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return ORGANIZED_EXERCISES[activeCategory] || [];
  }, [searchTerm, activeCategory]);

  const isExactMatch = useMemo(() => {
    return EXERCISE_DATABASE.some(ex => ex.toLowerCase() === searchTerm.trim().toLowerCase());
  }, [searchTerm]);

  const createRoutine = () => {
    if (!newRoutineName.trim()) return;
    const newRoutine: RoutineTemplate = { id: crypto.randomUUID(), name: newRoutineName, exercises: [] };
    setCustomRoutines([newRoutine, ...customRoutines]);
    setNewRoutineName('');
    setIsCreating(false);
    setPreviewRoutine(newRoutine);
  };

  const deleteRoutine = (id: string) => {
    if (confirm('確定要永久刪除此自訂課表嗎？')) {
      setCustomRoutines(prev => prev.filter(r => r.id !== id));
      setPreviewRoutine(null);
    }
  };

  const renameRoutine = () => {
    if (!previewRoutine || !tempName.trim()) return;
    const updated = { ...previewRoutine, name: tempName };
    setCustomRoutines(prev => prev.map(r => r.id === previewRoutine.id ? updated : r));
    setPreviewRoutine(updated);
    setIsEditingName(false);
  };

  const addExerciseToTemplate = () => {
    if (!previewRoutine || !selectedExName) return;
    const firstSet = mockSets[0];
    const newEntry = {
      id: crypto.randomUUID(),
      name: selectedExName,
      muscleGroup: getMuscleGroup(selectedExName),
      defaultSets: mockSets.length,
      defaultReps: firstSet?.reps || 10,
      defaultWeight: firstSet?.weight || 0
    };
    const updatedRoutine = { ...previewRoutine, exercises: [...previewRoutine.exercises, newEntry] };
    setCustomRoutines(prev => prev.map(r => r.id === previewRoutine.id ? updatedRoutine : r));
    setPreviewRoutine(updatedRoutine);
    setIsAddingExercise(false);
    setSelectedExName(null);
    setSearchTerm('');
  };

  const removeExerciseFromTemplate = (exId: string) => {
    if (!previewRoutine) return;
    const updatedRoutine = { ...previewRoutine, exercises: previewRoutine.exercises.filter(e => e.id !== exId) };
    setCustomRoutines(prev => prev.map(r => r.id === previewRoutine.id ? updatedRoutine : r));
    setPreviewRoutine(updatedRoutine);
  };

  const handleEnterIntegratedMode = (template: RoutineTemplate) => {
    const initialData: ExerciseEntry[] = template.exercises.map(te => ({
      id: crypto.randomUUID(),
      name: te.name,
      muscleGroup: te.muscleGroup,
      sets: Array.from({ length: te.defaultSets || 4 }).map((_, idx) => ({
        id: crypto.randomUUID(),
        weight: idx === 0 ? te.defaultWeight : 0,
        reps: te.defaultReps,
        completed: false
      }))
    }));
    setSessionExercises(initialData);
    setIntegratedRoutine(template);
  };

  const ExerciseGifDisplay = ({ name }: { name: string }) => {
    const [localGifUrl, setLocalGifUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      fetchExerciseGif(name).then(url => {
        setLocalGifUrl(url);
      });
    }, [name]);

    return (
      <div className="relative overflow-hidden rounded-[24px] shadow-2xl border border-white/5 bg-slate-900 min-h-[240px] flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">準備示範中...</p>
          </div>
        )}
        {localGifUrl && (
          <img 
            src={localGifUrl} 
            alt={name} 
            className="w-full h-auto object-cover rounded-[15px] block"
            onLoad={() => setIsLoading(false)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-green/5 to-transparent h-24 w-full animate-[scan_3s_linear_infinite] pointer-events-none" />
      </div>
    );
  };

  const IntegratedWorkoutView = ({ routine }: { routine: RoutineTemplate }) => {
    const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState<string>("00:00");

    useEffect(() => {
      let interval: number;
      if (timerStartedAt) {
        const updateTimer = () => {
          const diff = Date.now() - timerStartedAt;
          const totalSeconds = Math.floor(diff / 1000);
          const mins = Math.floor(totalSeconds / 60);
          const secs = totalSeconds % 60;
          setElapsedTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        };
        updateTimer();
        interval = window.setInterval(updateTimer, 1000);
      } else {
        setElapsedTime("00:00");
      }
      return () => clearInterval(interval);
    }, [timerStartedAt]);

    const startWorkoutTimer = () => {
      if (!timerStartedAt) {
        setTimerStartedAt(Date.now());
      }
    };

    const updateSetData = (exIndex: number, setId: string, updates: Partial<SetEntry>, sIdx: number) => {
      // 關鍵規則：如果是「完成動作 (completed)」且尚未啟動計時，就啟動。
      // 打勾動作絕不停止計時器。
      if (updates.completed && !timerStartedAt) {
        startWorkoutTimer();
      }
      
      setSessionExercises(prev => {
        const newExs = [...prev];
        const ex = { ...newExs[exIndex] };
        ex.sets = ex.sets.map((s, i) => {
          if (s.id === setId) return { ...s, ...updates };
          if (updates.weight !== undefined && sIdx === 0) return { ...s, weight: updates.weight };
          return s;
        });
        newExs[exIndex] = ex;
        return newExs;
      });
    };

    const addSetToEx = (exIndex: number) => {
      setSessionExercises(prev => {
        const newExs = [...prev];
        const ex = { ...newExs[exIndex] };
        const lastSet = ex.sets[ex.sets.length - 1];
        ex.sets = [...ex.sets, { 
          id: crypto.randomUUID(), 
          weight: lastSet?.weight || 0, 
          reps: lastSet?.reps || 10, 
          completed: false 
        }];
        newExs[exIndex] = ex;
        return newExs;
      });
    };

    const removeSetFromEx = (exIndex: number, setId: string) => {
      setSessionExercises(prev => {
        const newExs = [...prev];
        const ex = { ...newExs[exIndex] };
        ex.sets = ex.sets.filter(s => s.id !== setId);
        newExs[exIndex] = ex;
        return newExs;
      });
    };

    const handleSaveWorkout = () => {
      const completedExercises = sessionExercises.filter(ex => 
        ex.sets.some(set => set.completed)
      );
      if (completedExercises.length === 0) {
        alert('請至少勾選一個完成的組數再儲存。');
        return;
      }
      const finalSession: WorkoutSession = {
        id: crypto.randomUUID(),
        startTime: timerStartedAt || Date.now(),
        timerStartedAt: timerStartedAt || undefined,
        endTime: Date.now(),
        title: routine.name,
        exercises: completedExercises
      };
      setHistory([finalSession, ...history]);
      alert('訓練紀錄已儲存！總訓練時間：' + elapsedTime);
      // 重置頁面，計時器也隨之銷毀
      setIntegratedRoutine(null);
      setPreviewRoutine(null);
    };

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 pb-48">
        {/* 固定標題 */}
        <div className="flex items-center gap-5 px-1 sticky top-0 z-[60] bg-[#020617]/90 backdrop-blur-xl py-4 border-b border-white/5">
          <button onClick={() => { if(timerStartedAt && !confirm('訓練正在計時中，確定要離開嗎？')) return; setIntegratedRoutine(null); }} className="w-11 h-11 bg-slate-800 rounded-xl flex items-center justify-center text-neon-green border border-white/5 active:scale-90 transition-all">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 overflow-hidden">
            <h2 className="text-xl font-black italic tracking-tighter uppercase truncate text-white">{routine.name}</h2>
            <p className="text-[10px] font-black text-neon-green uppercase tracking-widest mt-0.5">整合訓練模式</p>
          </div>
        </div>

        <div className="space-y-24">
          {sessionExercises.map((ex, exIdx) => (
            <div key={ex.id} className="space-y-8">
              <div className="flex items-center gap-4 px-1">
                 <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-neon-green font-black text-xl italic">#{exIdx + 1}</div>
                 <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">{ex.name}</h3>
              </div>

              <div className="w-full relative px-1">
                <ExerciseGifDisplay name={ex.name} />
              </div>

              <div className="mx-1 p-6 rounded-[28px] bg-slate-900/40 border border-white/5 space-y-3.5 shadow-xl">
                <div className="flex items-center gap-2.5 text-neon-green">
                  <BookOpen className="w-5 h-5" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest">運動方法</h3>
                </div>
                <p className="text-sm font-medium text-slate-400 leading-relaxed italic whitespace-pre-line">
                  {getExerciseMethod(ex.name)}
                </p>
              </div>

              <div className="space-y-6 px-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5">
                      <Target className="w-5 h-5 text-neon-green" />
                      <h3 className="text-sm font-black italic uppercase text-white">訓練錄入</h3>
                    </div>
                    {/* 計時器顯示位置：標題右側 */}
                    {timerStartedAt && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-neon-green/10 border border-neon-green/30 rounded-lg">
                        <Timer className="w-3.5 h-3.5 text-neon-green animate-pulse" />
                        <span className="text-[11px] font-black text-neon-green font-mono">{elapsedTime}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {/* 開始按鈕放置在加一組左側 */}
                    {!timerStartedAt && (
                      <button onClick={startWorkoutTimer} className="flex items-center gap-1.5 text-neon-green text-[10px] font-black uppercase group">
                        <PlayCircle className="w-4 h-4 fill-current group-active:scale-90 transition-transform" /> 開始訓練
                      </button>
                    )}
                    <button onClick={() => addSetToEx(exIdx)} className="flex items-center gap-1.5 text-neon-green text-[10px] font-black uppercase">
                      <PlusCircle className="w-4 h-4" /> 加一組
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {ex.sets.map((set, sIdx) => (
                    <div key={set.id} className={`grid grid-cols-12 gap-2.5 items-center p-4 rounded-[28px] border transition-all ${set.completed ? 'bg-neon-green/5 border-neon-green/20' : 'bg-slate-900/60 border-white/5'}`}>
                      <div className="col-span-1 flex justify-center">
                        <button onClick={() => removeSetFromEx(exIdx, set.id)} className="text-slate-800 p-1 active:text-red-500">
                          <MinusCircle className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="col-span-1 text-base font-black italic text-slate-500 text-center">{sIdx + 1}</div>
                      
                      <div className="col-span-4 flex items-center justify-center gap-2">
                        <input 
                          type="number" 
                          value={set.weight || ''} 
                          placeholder="0" 
                          onChange={e => updateSetData(exIdx, set.id, { weight: Number(e.target.value) }, sIdx)} 
                          className="w-16 bg-black/40 rounded-xl py-3 text-center text-xl font-black text-white outline-none border border-white/5 focus:border-neon-green/30 transition-all" 
                        />
                        <span className="text-[10px] font-black text-slate-600 italic uppercase shrink-0">kg</span>
                      </div>

                      <div className="col-span-4 flex items-center justify-center gap-2">
                        <input 
                          type="number" 
                          value={set.reps || ''} 
                          placeholder="0" 
                          onChange={e => updateSetData(exIdx, set.id, { reps: Number(e.target.value) }, sIdx)} 
                          className="w-16 bg-black/40 rounded-xl py-3 text-center text-xl font-black text-white outline-none border border-white/5 focus:border-neon-green/30 transition-all" 
                        />
                        <span className="text-[10px] font-black text-slate-600 italic uppercase shrink-0">rep</span>
                      </div>

                      <div className="col-span-2 flex justify-end">
                        <button 
                          onClick={() => { 
                            const nc = !set.completed; 
                            if(nc) { 
                              startWorkoutTimer(); 
                              triggerRestTimer(); 
                            } 
                            updateSetData(exIdx, set.id, { completed: nc }, sIdx); 
                          }} 
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 ${set.completed ? 'bg-neon-green text-black shadow-lg shadow-neon-green/10' : 'bg-slate-800 text-slate-600 shadow-inner'}`}
                        >
                          <Check className="w-6 h-6 stroke-[4]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 底部功能區：只保留儲存按鈕，徹底移除原本的白色按鈕 */}
        <div className="fixed bottom-[110px] left-0 right-0 z-[70] px-8">
           <button 
             onClick={handleSaveWorkout} 
             className="w-full bg-neon-green text-black font-black h-16 rounded-[28px] uppercase italic text-lg shadow-[0_15px_40px_rgba(173,255,47,0.3)] flex items-center justify-center gap-4 active:scale-95 transition-all"
           >
             <Save className="w-6 h-6 stroke-[2.5]" /> 儲存本次訓練紀錄
           </button>
        </div>
      </motion.div>
    );
  };

  if (integratedRoutine) {
    return <IntegratedWorkoutView routine={integratedRoutine} />;
  }

  // ... 課表預覽與建立邏輯保持不變 ...
  if (previewRoutine) {
    const isCustom = customRoutines.some(r => r.id === previewRoutine.id);
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 pb-44">
        <div className="flex items-center gap-5 px-1">
          <button onClick={() => setPreviewRoutine(null)} className="w-11 h-11 bg-slate-800 rounded-xl flex items-center justify-center text-neon-green border border-white/5 active:scale-90 transition-all">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 overflow-hidden">
            {isEditingName ? (
              <div className="flex gap-2">
                <input autoFocus value={tempName} onChange={e => setTempName(e.target.value)} onBlur={renameRoutine} className="bg-black/40 border-b border-neon-green text-xl font-black italic text-white outline-none w-full uppercase" />
                <button onClick={renameRoutine} className="p-2 text-neon-green"><Check className="w-6 h-6" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black italic tracking-tighter uppercase truncate text-white">{previewRoutine.name}</h2>
                {isCustom && <button onClick={() => { setTempName(previewRoutine.name); setIsEditingName(true); }} className="p-2 bg-slate-800/50 rounded-lg text-slate-500"><Edit2 className="w-4 h-4" /></button>}
              </div>
            )}
          </div>
          {isCustom && <button onClick={() => deleteRoutine(previewRoutine.id)} className="w-11 h-11 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center border border-red-500/10 active:scale-90 transition-all"><Trash2 className="w-6 h-6" /></button>}
        </div>
        
        <div className="space-y-3.5">
          {previewRoutine.exercises.map((ex, idx) => (
            <div key={ex.id} className="glass rounded-[32px] p-6 border-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black italic text-slate-700 w-4">{idx + 1}</span>
                <div>
                  <h4 className="font-black text-lg text-white italic uppercase tracking-tight pr-2">{ex.name}</h4>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] font-black text-neon-green/60 uppercase tracking-widest">{getMuscleGroupDisplay(ex.muscleGroup).cn}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-800" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{ex.defaultSets} 組 | {ex.defaultReps} 次</span>
                  </div>
                </div>
              </div>
              {isCustom && (
                <button onClick={() => removeExerciseFromTemplate(ex.id)} className="w-10 h-10 bg-slate-800/30 rounded-xl flex items-center justify-center text-slate-700 active:text-red-500"><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
          ))}
        </div>

        {isCustom && (
          <button onClick={() => { setIsAddingExercise(true); setSearchTerm(''); }} className="w-full py-5 bg-white/5 border border-dashed border-white/10 rounded-3xl text-[10px] font-black uppercase text-slate-500 flex items-center justify-center gap-2.5 active:bg-white/10 transition-all">
            <Plus className="w-4 h-4" /> 新增動作項目
          </button>
        )}
        
        <div className="fixed bottom-[110px] left-0 right-0 z-50 flex flex-col gap-3 px-8">
          <button 
            onClick={() => handleEnterIntegratedMode(previewRoutine)} 
            className="w-full bg-neon-green text-black font-black h-16 rounded-[28px] uppercase italic tracking-tighter text-lg shadow-[0_10px_30px_rgba(173,255,47,0.2)] flex items-center justify-center gap-4 active:scale-95 transition-all"
          >
            套用課表 <ChevronRight className="w-6 h-6 stroke-[4]" />
          </button>
        </div>

        <AnimatePresence>
          {isAddingExercise && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => { setIsAddingExercise(false); setSelectedExName(null); }} />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative w-full max-w-md bg-slate-950 rounded-t-[48px] p-8 pb-14 border-t border-white/10 shadow-2xl safe-bottom max-h-[95vh] overflow-hidden flex flex-col">
                <div className="w-14 h-1.5 bg-slate-800 rounded-full mx-auto mb-8 shrink-0" />
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {selectedExName ? (
                      <button onClick={() => setSelectedExName(null)} className="flex items-center gap-2 text-slate-400 py-2">
                        <ChevronLeft className="w-7 h-7" />
                        <span className="text-xs font-black uppercase tracking-widest">返回搜尋</span>
                      </button>
                    ) : (
                      <h3 className="text-2xl font-black italic uppercase text-white pr-2">選取動作項目</h3>
                    )}
                  </div>
                  <button onClick={() => { setIsAddingExercise(false); setSelectedExName(null); }} className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 border border-white/5 active:scale-90"><X className="w-7 h-7" /></button>
                </div>

                <div className="space-y-5 flex-1 overflow-hidden flex flex-col">
                  {!selectedExName ? (
                    <>
                      <div className="flex items-center gap-4 bg-slate-900/80 border border-white/5 rounded-2xl px-6 py-4 shadow-inner shrink-0">
                        <Search className="w-5 h-5 text-slate-600" />
                        <input 
                          placeholder="搜尋動作庫..." 
                          value={searchTerm} 
                          onChange={e => setSearchTerm(e.target.value)} 
                          className="bg-transparent w-full text-base font-black italic outline-none text-white placeholder:text-slate-800" 
                        />
                      </div>

                      {!searchTerm && (
                        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 shrink-0">
                          {Object.keys(ORGANIZED_EXERCISES).map(cat => (
                            <button 
                              key={cat} 
                              onClick={() => setActiveCategory(cat)} 
                              className={`shrink-0 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat ? 'bg-neon-green text-black border-neon-green' : 'bg-slate-900/40 text-slate-500 border-white/5'}`}
                            >
                              {getMuscleGroupDisplay(cat as MuscleGroup).cn}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-12">
                        <div className="grid grid-cols-2 gap-3">
                          {searchTerm.trim() && !isExactMatch && (
                            <motion.button 
                              whileTap={{ scale: 0.95 }} 
                              onClick={() => setSelectedExName(searchTerm.trim())} 
                              className="col-span-2 p-5 rounded-[24px] bg-neon-green/10 border border-neon-green/30 flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-neon-green rounded-xl flex items-center justify-center text-black">
                                  <PlusSquare className="w-6 h-6" />
                                </div>
                                <div className="text-left overflow-hidden">
                                  <div className="text-[11px] font-black text-neon-green uppercase tracking-widest leading-none">建立自訂動作</div>
                                  <div className="text-base font-black italic text-white uppercase truncate max-w-[200px] mt-1.5 pr-2">{searchTerm}</div>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-neon-green opacity-50" />
                            </motion.button>
                          )}

                          {filteredExercises.map(exName => (
                            <button key={exName} onClick={() => setSelectedExName(exName)} className="p-5 rounded-[24px] text-left bg-slate-900/40 border border-white/5 flex flex-col justify-center min-h-[86px] active:border-neon-green/30 group transition-all">
                              <div className="text-[14px] font-black italic uppercase text-slate-200 group-active:text-neon-green leading-tight truncate pr-1">{exName}</div>
                              <div className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-2 flex items-center justify-between">
                                {getMuscleGroupDisplay(getMuscleGroup(exName)).cn}
                                <Plus className="w-3.5 h-3.5 text-slate-800 opacity-0 group-active:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pb-32">
                      <h2 className="text-2xl font-black italic uppercase text-white truncate px-1">{selectedExName}</h2>

                      <div className="w-full relative px-1">
                        <ExerciseGifDisplay name={selectedExName} />
                      </div>

                      <div className="mx-1 p-6 rounded-[28px] bg-slate-900/40 border border-white/5 space-y-3.5 shadow-xl">
                        <div className="flex items-center gap-2.5 text-neon-green">
                          <BookOpen className="w-5 h-5" />
                          <h3 className="text-[11px] font-black uppercase tracking-widest">運動方法</h3>
                        </div>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed italic whitespace-pre-line">
                          {getExerciseMethod(selectedExName)}
                        </p>
                      </div>

                      <div className="space-y-6 px-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2.5">
                              <Target className="w-5 h-5 text-neon-green" />
                              <h3 className="text-sm font-black italic uppercase text-white">訓練錄入</h3>
                            </div>
                            {dummyTimerActive && (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-neon-green/10 border border-neon-green/30 rounded-lg">
                                <Timer className="w-3.5 h-3.5 text-neon-green animate-pulse" />
                                <span className="text-[11px] font-black text-neon-green font-mono">00:00</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {!dummyTimerActive && (
                              <button onClick={() => setDummyTimerActive(true)} className="flex items-center gap-1.5 text-neon-green text-[10px] font-black uppercase">
                                <Play className="w-4 h-4 fill-current" /> 開始訓練
                              </button>
                            )}
                            <button onClick={() => setMockSets([...mockSets, { id: crypto.randomUUID(), weight: mockSets[mockSets.length-1]?.weight || 0, reps: mockSets[mockSets.length-1]?.reps || 10, completed: false }])} className="flex items-center gap-1.5 text-neon-green text-[10px] font-black uppercase">
                              <PlusCircle className="w-4 h-4" /> 加一組
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {mockSets.map((set, index) => (
                            <div key={set.id} className={`grid grid-cols-12 gap-2.5 items-center p-4 rounded-[28px] border transition-all ${set.completed ? 'bg-neon-green/5 border-neon-green/20' : 'bg-slate-900/60 border-white/5'}`}>
                              <div className="col-span-1 flex justify-center">
                                <button onClick={() => setMockSets(mockSets.filter(s => s.id !== set.id))} className="text-slate-800 p-1 active:text-red-500">
                                  <MinusCircle className="w-5 h-5" />
                                </button>
                              </div>
                              <div className="col-span-1 text-base font-black italic text-slate-500 text-center">{index + 1}</div>
                              
                              <div className="col-span-4 flex items-center justify-center gap-2">
                                <input 
                                  type="number" 
                                  value={set.weight || ''} 
                                  placeholder="0" 
                                  onChange={e => {
                                    const nw = Number(e.target.value);
                                    setMockSets(mockSets.map((s, i) => {
                                      if (s.id === set.id) return { ...s, weight: nw };
                                      if (index === 0) return { ...s, weight: nw };
                                      return s;
                                    }));
                                  }} 
                                  className="w-16 bg-black/40 rounded-xl py-3 text-center text-xl font-black text-white outline-none border border-white/5 focus:border-neon-green/30 transition-all" 
                                />
                                <span className="text-[10px] font-black text-slate-600 italic uppercase shrink-0">kg</span>
                              </div>

                              <div className="col-span-4 flex items-center justify-center gap-2">
                                <input 
                                  type="number" 
                                  value={set.reps || ''} 
                                  placeholder="0" 
                                  onChange={e => setMockSets(mockSets.map(s => s.id === set.id ? { ...s, reps: Number(e.target.value) } : s))} 
                                  className="w-16 bg-black/40 rounded-xl py-3 text-center text-xl font-black text-white outline-none border border-white/5 focus:border-neon-green/30 transition-all" 
                                />
                                <span className="text-[10px] font-black text-slate-600 italic uppercase shrink-0">rep</span>
                              </div>

                              <div className="col-span-2 flex justify-end">
                                <button 
                                  onClick={() => setMockSets(mockSets.map(s => s.id === set.id ? { ...s, completed: !s.completed } : s))} 
                                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 ${set.completed ? 'bg-neon-green text-black shadow-lg shadow-neon-green/10' : 'bg-slate-800 text-slate-600 shadow-inner'}`}
                                >
                                  <Check className="w-6 h-6 stroke-[4]" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="fixed bottom-12 left-0 right-0 z-50 px-8">
                        <button onClick={addExerciseToTemplate} className="w-full bg-neon-green text-black font-black h-16 rounded-[28px] uppercase italic text-lg active:scale-95 shadow-[0_10px_30px_rgba(173,255,47,0.3)] flex items-center justify-center gap-4 transition-all">
                          <Check className="w-6 h-6 stroke-[3]" /> 確認加入此項目
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <div className="space-y-12 pb-40">
      <div className="flex justify-between items-center px-1 pt-2">
        <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-4 text-white">
          <LayoutGrid className="w-7 h-7 text-neon-green" /> 訓練課表
        </h2>
        <button onClick={() => setIsCreating(true)} className="px-5 py-2.5 bg-neon-green/10 text-neon-green text-[10px] font-black rounded-xl uppercase border border-neon-green/20 active:bg-neon-green active:text-black transition-all">
          + 建立
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="glass rounded-[40px] p-8 border-neon-green/30 space-y-7 overflow-hidden">
            <input autoFocus placeholder="課表名稱..." value={newRoutineName} onChange={e => setNewRoutineName(e.target.value)} className="w-full bg-transparent border-b-2 border-neon-green/30 py-4 text-3xl font-black italic uppercase outline-none text-white focus:border-neon-green" />
            <div className="flex gap-4">
              <button onClick={createRoutine} className="flex-1 bg-neon-green text-black font-black py-5 rounded-2xl uppercase italic text-base active:scale-95">確認建立</button>
              <button onClick={() => setIsCreating(false)} className="px-10 bg-slate-800 text-slate-400 font-bold py-5 rounded-2xl uppercase text-xs active:scale-90">取消</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {customRoutines.length > 0 && (
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-2">我的自訂課表</p>
        )}
        {customRoutines.map(r => (
          <button key={r.id} onClick={() => setPreviewRoutine(r)} className="w-full glass rounded-[32px] p-7 border-white/5 active:scale-[0.98] transition-all flex justify-between items-center text-left group">
            <div>
              <h3 className="text-xl font-black text-white italic uppercase tracking-tight">{r.name}</h3>
              <div className="flex items-center gap-3 mt-2.5">
                <span className="text-[10px] font-black text-neon-green uppercase tracking-widest">{r.exercises.length} EXERCISES</span>
                <div className="w-1 h-1 rounded-full bg-slate-800" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">自訂</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-slate-800 text-slate-500 rounded-2xl flex items-center justify-center border border-white/5 group-active:bg-neon-green group-active:text-black transition-all">
              <ChevronRight className="w-6 h-6" />
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-10 pt-4">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-2 flex items-center gap-3">
           <Layers className="w-5 h-5 text-neon-green" /> 科學訓練系統庫
        </p>
        
        {[
          {
            id: 'arnold-split',
            title: '阿諾對抗分化 (Arnold Split)',
            description: '經典對抗式訓練，強調胸背與肩臂的極致泵感。',
            tag: '高強度增肌',
            routines: [
              { id: 'arn-1', name: '阿諾 D1 - 胸與背', exercises: [
                { id: 'ab1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
                { id: 'ab2', name: '引體向上', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
                { id: 'ab3', name: '啞鈴上斜臥推', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
                { id: 'ab4', name: '槓鈴划船', muscleGroup: 'back', defaultSets: 3, defaultReps: 10, defaultWeight: 0 }
              ]},
              { id: 'arn-2', name: '阿諾 D2 - 肩與臂', exercises: [
                { id: 'sa1', name: '啞鈴肩推', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
                { id: 'sa2', name: '槓鈴彎舉', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
                { id: 'sa3', name: '滑輪繩索下壓', muscleGroup: 'arms', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
              ]}
            ]
          },
          {
            id: 'ppl-split',
            title: 'PPL 科學分化 (Push/Pull/Legs)',
            description: '目前全球最推崇的科學訓練分化，最大化恢復與肌肥大。',
            tag: '全方位進化',
            routines: [
              { id: 'ppl-1', name: 'PPL - 推 (Push)', exercises: [
                { id: 'p1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 3, defaultReps: 8, defaultWeight: 0 },
                { id: 'p2', name: '啞鈴肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
                { id: 'p3', name: '滑輪繩索下壓', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
                { id: 'p4', name: '啞鈴側平舉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
              ]},
              { id: 'ppl-2', name: 'PPL - 拉 (Pull)', exercises: [
                { id: 'pu1', name: '滑輪下拉', muscleGroup: 'back', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
                { id: 'pu2', name: '槓鈴划船', muscleGroup: 'back', defaultSets: 3, defaultReps: 8, defaultWeight: 0 },
                { id: 'pu3', name: '槓鈴彎舉', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
                { id: 'pu4', name: '滑輪面拉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
              ]},
              { id: 'ppl-3', name: 'PPL - 腿 (Legs)', exercises: [
                { id: 'l1', name: '槓鈴深蹲', muscleGroup: 'legs', defaultSets: 3, defaultReps: 8, defaultWeight: 0 },
                { id: 'l2', name: '上斜腿推機', muscleGroup: 'legs', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
                { id: 'l3', name: '仰臥腿後勾', muscleGroup: 'legs', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
                { id: 'l4', name: '羅馬椅抬腿', muscleGroup: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
              ]}
            ]
          },
          {
            id: 'ul-split',
            title: '上肢/下肢分化 (UL Split)',
            description: '平衡上下肢發展，適合一週四練的進階訓練者。',
            tag: '肌力與體態',
            routines: [
              { id: 'ul-1', name: 'UL - 上肢 A (Upper A)', exercises: [
                { id: 'ua1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 3, defaultReps: 8, defaultWeight: 0 },
                { id: 'ua2', name: '槓鈴划船', muscleGroup: 'back', defaultSets: 3, defaultReps: 8, defaultWeight: 0 },
                { id: 'ua3', name: '啞鈴肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
                { id: 'ua4', name: '引體向上', muscleGroup: 'back', defaultSets: 3, defaultReps: 10, defaultWeight: 0 }
              ]},
              { id: 'ul-2', name: 'UL - 下肢 A (Lower A)', exercises: [
                { id: 'la1', name: '槓鈴深蹲', muscleGroup: 'legs', defaultSets: 3, defaultReps: 8, defaultWeight: 0 },
                { id: 'la2', name: '保加利亞啞鈴分腿蹲', muscleGroup: 'legs', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
                { id: 'la3', name: '仰臥腿後勾', muscleGroup: 'legs', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
                { id: 'la4', name: '器械站姿提踵', muscleGroup: 'legs', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
              ]}
            ]
          },
          {
            id: 'full-body',
            title: '全身基礎強化 (Full Body)',
            description: '高頻率全身刺激，適合新手或一週三練的高效能選擇。',
            tag: '新手/高效',
            routines: [
              { id: 'fb-1', name: '全身訓練 A', exercises: [
                { id: 'fb1a', name: '槓鈴深蹲', muscleGroup: 'legs', defaultSets: 3, defaultReps: 8, defaultWeight: 0 },
                { id: 'fb1b', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 3, defaultReps: 8, defaultWeight: 0 },
                { id: 'fb1c', name: '滑轮下拉', muscleGroup: 'back', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
                { id: 'fb1d', name: '啞鈴側平舉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
              ]},
              { id: 'fb-2', name: '全身訓練 B', exercises: [
                { id: 'fb2a', name: '傳統硬舉', muscleGroup: 'back', defaultSets: 3, defaultReps: 5, defaultWeight: 0 },
                { id: 'fb2b', name: '槓鈴肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 8, defaultWeight: 0 },
                { id: 'fb2c', name: '上斜腿推機', muscleGroup: 'legs', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
                { id: 'fb2d', name: '啞鈴交替彎舉', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
              ]}
            ]
          }
        ].map(system => (
          <div key={system.id} className="glass rounded-[48px] p-8 border-white/5 space-y-6 relative overflow-hidden bg-gradient-to-br from-slate-900/40 to-transparent shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">{system.title}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{system.description}</p>
              </div>
              <span className="shrink-0 px-3 py-1 bg-neon-green/10 text-neon-green text-[9px] font-black uppercase tracking-widest rounded-lg border border-neon-green/20">{system.tag}</span>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
               {system.routines.map((r, idx) => (
                 <button key={r.id} onClick={() => setPreviewRoutine(r)} className="flex items-center justify-between p-6 bg-black/40 border border-white/5 rounded-[28px] hover:border-neon-green/30 active:scale-[0.98] transition-all text-left">
                   <div className="flex items-center gap-5 overflow-hidden">
                      <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-[11px] font-black text-neon-green shrink-0">D{idx + 1}</div>
                      <div>
                        <div className="text-base font-black italic uppercase text-slate-200 truncate pr-2">{r.name}</div>
                        <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">{r.exercises.length} 個動作</div>
                      </div>
                   </div>
                   <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-700">
                    <ChevronRight className="w-4 h-4" />
                   </div>
                 </button>
               ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
