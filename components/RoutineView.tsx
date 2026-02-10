
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
import { lightTheme } from '../themeStyles';

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
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [isGifLoading, setIsGifLoading] = useState(false);

  if (!context) return null;
  const { customRoutines, setCustomRoutines, setHistory, history, triggerRestTimer } = context;

  useEffect(() => {
    if (selectedExName) {
      setMockSets(Array.from({ length: 4 }).map(() => ({
        id: crypto.randomUUID(), weight: 0, reps: 10, completed: false
      })));
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
      <div style={{ backgroundColor: lightTheme.card }} className="relative overflow-hidden rounded-[24px] shadow-sm border border-black/5 min-h-[240px] flex items-center justify-center">
        {isLoading && (
          <div style={{ backgroundColor: lightTheme.card }} className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-black" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">準備中...</p>
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent h-24 w-full animate-[scan_3s_linear_infinite] pointer-events-none" />
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
      setIntegratedRoutine(null);
      setPreviewRoutine(null);
    };

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 pb-48">
        <div className="flex items-center gap-5 px-1 sticky top-0 z-[60] bg-white/90 backdrop-blur-xl py-4 border-b border-black/5">
          <button onClick={() => { if(timerStartedAt && !confirm('訓練正在計時中，確定要離開嗎？')) return; setIntegratedRoutine(null); }} style={{ backgroundColor: lightTheme.accent }} className="w-11 h-11 rounded-xl flex items-center justify-center text-black active:scale-90 transition-all shadow-md">
            <ArrowLeft className="w-6 h-6 stroke-[3]" />
          </button>
          <div className="flex-1 overflow-hidden">
            <h2 style={{ color: lightTheme.text }} className="text-xl font-black italic tracking-tighter uppercase truncate">{routine.name}</h2>
            <p className="text-[10px] font-black text-[#82CC00] uppercase tracking-widest mt-0.5">整合訓練模式</p>
          </div>
        </div>

        <div className="space-y-24">
          {sessionExercises.map((ex, exIdx) => (
            <div key={ex.id} className="space-y-8">
              <div className="flex items-center gap-4 px-1">
                 <div style={{ backgroundColor: lightTheme.card }} className="w-12 h-12 rounded-2xl flex items-center justify-center text-black font-black text-xl italic border border-black/5">#{exIdx + 1}</div>
                 <h3 style={{ color: lightTheme.text }} className="text-2xl font-black italic uppercase tracking-tighter">{ex.name}</h3>
              </div>

              <div className="w-full relative px-1">
                <ExerciseGifDisplay name={ex.name} />
              </div>

              <div style={{ backgroundColor: lightTheme.card }} className="mx-1 p-6 rounded-[28px] border border-black/5 space-y-3.5 shadow-sm">
                <div className="flex items-center gap-2.5 text-black">
                  <BookOpen className="w-5 h-5" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest">運動方法</h3>
                </div>
                <p className="text-sm font-medium text-slate-500 leading-relaxed italic whitespace-pre-line">
                  {getExerciseMethod(ex.name)}
                </p>
              </div>

              <div className="space-y-6 px-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5">
                      <Target className="w-5 h-5 text-black" />
                      <h3 style={{ color: lightTheme.text }} className="text-sm font-black italic uppercase">訓練錄入</h3>
                    </div>
                    {timerStartedAt && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-black/5 border border-black/10 rounded-lg">
                        <Timer className="w-3.5 h-3.5 animate-pulse" />
                        <span className="text-[11px] font-black font-mono">{elapsedTime}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {!timerStartedAt && (
                      <button onClick={startWorkoutTimer} className="flex items-center gap-1.5 text-black text-[10px] font-black uppercase group">
                        <PlayCircle className="w-4 h-4 fill-current group-active:scale-90 transition-transform" /> 開始訓練
                      </button>
                    )}
                    <button onClick={() => addSetToEx(exIdx)} className="flex items-center gap-1.5 text-black text-[10px] font-black uppercase">
                      <PlusCircle className="w-4 h-4" /> 加一組
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {ex.sets.map((set, sIdx) => (
                    <div key={set.id} className={`grid grid-cols-12 gap-2.5 items-center p-4 rounded-[28px] border transition-all ${set.completed ? 'bg-[#CCFF00]/10 border-[#CCFF00]/40' : 'bg-white border-black/5 shadow-sm'}`}>
                      <div className="col-span-1 flex justify-center">
                        <button onClick={() => removeSetFromEx(exIdx, set.id)} className="text-slate-200 p-1 active:text-red-500">
                          <MinusCircle className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="col-span-1 text-base font-black italic text-slate-300 text-center">{sIdx + 1}</div>
                      
                      <div className="col-span-4 flex items-center justify-center gap-2">
                        <input 
                          type="number" 
                          value={set.weight || ''} 
                          placeholder="0" 
                          onChange={e => updateSetData(exIdx, set.id, { weight: Number(e.target.value) }, sIdx)} 
                          style={{ color: lightTheme.text }}
                          className="w-16 bg-slate-50 rounded-xl py-3 text-center text-xl font-black outline-none border border-black/5 focus:border-black/20 transition-all shadow-inner" 
                        />
                        <span className="text-[10px] font-black text-slate-300 italic uppercase shrink-0">kg</span>
                      </div>

                      <div className="col-span-4 flex items-center justify-center gap-2">
                        <input 
                          type="number" 
                          value={set.reps || ''} 
                          placeholder="0" 
                          onChange={e => updateSetData(exIdx, set.id, { reps: Number(e.target.value) }, sIdx)} 
                          style={{ color: lightTheme.text }}
                          className="w-16 bg-slate-50 rounded-xl py-3 text-center text-xl font-black outline-none border border-black/5 focus:border-black/20 transition-all shadow-inner" 
                        />
                        <span className="text-[10px] font-black text-slate-300 italic uppercase shrink-0">rep</span>
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
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 border shadow-sm ${set.completed ? 'bg-[#CCFF00] border-[#CCFF00] text-black' : 'bg-slate-50 border-black/5 text-slate-200'}`}
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

        <div className="fixed bottom-[110px] left-0 right-0 z-[70] px-8">
           <button 
             onClick={handleSaveWorkout} 
             style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
             className="w-full font-black h-16 rounded-[28px] uppercase italic text-lg shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all"
           >
             <Save className="w-6 h-6 stroke-[2.5]" style={{ color: lightTheme.accent }} /> 儲存訓練紀錄
           </button>
        </div>
      </motion.div>
    );
  };

  if (integratedRoutine) {
    return <IntegratedWorkoutView routine={integratedRoutine} />;
  }

  if (previewRoutine) {
    const isCustom = customRoutines.some(r => r.id === previewRoutine.id);
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 pb-44">
        <div className="flex items-center gap-5 px-1">
          <button onClick={() => setPreviewRoutine(null)} style={{ backgroundColor: lightTheme.accent }} className="w-11 h-11 rounded-xl flex items-center justify-center text-black active:scale-90 transition-all shadow-md">
            <ArrowLeft className="w-6 h-6 stroke-[3]" />
          </button>
          <div className="flex-1 overflow-hidden">
            {isEditingName ? (
              <div className="flex gap-2">
                <input autoFocus value={tempName} onChange={e => setTempName(e.target.value)} onBlur={renameRoutine} className="bg-transparent border-b border-black text-xl font-black italic text-black outline-none w-full uppercase" />
                <button onClick={renameRoutine} className="p-2 text-black"><Check className="w-6 h-6" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <h2 style={{ color: lightTheme.text }} className="text-xl font-black italic tracking-tighter uppercase truncate">{previewRoutine.name}</h2>
                {isCustom && <button onClick={() => { setTempName(previewRoutine.name); setIsEditingName(true); }} className="p-2 bg-slate-100 rounded-lg text-slate-400"><Edit2 className="w-4 h-4" /></button>}
              </div>
            )}
          </div>
          {isCustom && <button onClick={() => deleteRoutine(previewRoutine.id)} className="w-11 h-11 bg-red-50 text-red-500 rounded-xl flex items-center justify-center border border-red-100 active:scale-90 transition-all"><Trash2 className="w-6 h-6" /></button>}
        </div>
        
        <div className="space-y-3.5">
          {previewRoutine.exercises.map((ex, idx) => (
            <div key={ex.id} style={{ backgroundColor: lightTheme.card }} className="rounded-[32px] p-6 border border-black/5 flex items-center justify-between group shadow-sm">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black italic text-slate-300 w-4">{idx + 1}</span>
                <div>
                  <h4 style={{ color: lightTheme.text }} className="font-black text-lg italic uppercase tracking-tight pr-2">{ex.name}</h4>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{getMuscleGroupDisplay(ex.muscleGroup).cn}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{ex.defaultSets} 組 | {ex.defaultReps} 次</span>
                  </div>
                </div>
              </div>
              {isCustom && (
                <button onClick={() => removeExerciseFromTemplate(ex.id)} style={{ backgroundColor: lightTheme.bg }} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-200 active:text-red-500 border border-black/5 shadow-inner"><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
          ))}
        </div>

        {isCustom && (
          <button onClick={() => { setIsAddingExercise(true); setSearchTerm(''); }} style={{ backgroundColor: lightTheme.accent }} className="w-full py-5 border border-black/5 rounded-3xl text-[11px] font-black uppercase text-black flex items-center justify-center gap-2.5 active:scale-95 transition-all shadow-md">
            <Plus className="w-4 h-4 stroke-[3]" /> 新增動作項目
          </button>
        )}
        
        <div className="fixed bottom-[110px] left-0 right-0 z-50 flex flex-col gap-3 px-8">
          <button 
            onClick={() => handleEnterIntegratedMode(previewRoutine)} 
            style={{ backgroundColor: '#CCFF00', color: '#000000' }}
            className="w-full font-black h-16 rounded-2xl uppercase italic tracking-tighter text-lg shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all"
          >
            套用並開始訓練 <ChevronRight className="w-6 h-6 stroke-[4]" />
          </button>
        </div>

        <AnimatePresence>
          {isAddingExercise && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => { setIsAddingExercise(false); setSelectedExName(null); }} />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative w-full max-w-md bg-white rounded-t-[48px] p-8 pb-14 border-t border-black/5 shadow-2xl safe-bottom max-h-[95vh] overflow-hidden flex flex-col">
                <div className="w-14 h-1.5 bg-slate-200 rounded-full mx-auto mb-8 shrink-0" />
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {selectedExName ? (
                      <button onClick={() => setSelectedExName(null)} style={{ color: '#82CC00' }} className="flex items-center gap-2 py-2">
                        <ChevronLeft className="w-7 h-7 stroke-[3]" />
                        <span className="text-xs font-black uppercase tracking-widest">返回搜尋</span>
                      </button>
                    ) : (
                      <h3 style={{ color: lightTheme.text }} className="text-2xl font-black italic uppercase pr-2">選取項目</h3>
                    )}
                  </div>
                  <button onClick={() => { setIsAddingExercise(false); setSelectedExName(null); }} style={{ backgroundColor: lightTheme.card }} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-black/5 active:scale-90"><X className="w-7 h-7" /></button>
                </div>

                <div className="space-y-5 flex-1 overflow-hidden flex flex-col">
                  {!selectedExName ? (
                    <>
                      <div style={{ backgroundColor: lightTheme.card }} className="flex items-center gap-4 border border-black/5 rounded-2xl px-6 py-4 shadow-inner shrink-0">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input 
                          placeholder="搜尋動作庫..." 
                          value={searchTerm} 
                          onChange={e => setSearchTerm(e.target.value)} 
                          className="bg-transparent w-full text-base font-black italic outline-none placeholder:text-slate-300" 
                          style={{ color: lightTheme.text }}
                        />
                      </div>

                      {!searchTerm && (
                        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 shrink-0">
                          {Object.keys(ORGANIZED_EXERCISES).map(cat => (
                            <button 
                              key={cat} 
                              onClick={() => setActiveCategory(cat)} 
                              className={`shrink-0 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat ? 'bg-black text-white border-black' : 'bg-slate-50 text-slate-400 border-black/5'}`}
                              style={activeCategory === cat ? { backgroundColor: '#000000', color: '#FFFFFF' } : {}}
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
                              style={{ backgroundColor: lightTheme.card }}
                              className="col-span-2 p-5 rounded-[24px] border border-black/5 flex items-center justify-between group shadow-sm"
                            >
                              <div className="flex items-center gap-4">
                                <div style={{ backgroundColor: lightTheme.accent }} className="w-10 h-10 rounded-xl flex items-center justify-center text-black">
                                  <PlusSquare className="w-6 h-6" />
                                </div>
                                <div className="text-left overflow-hidden">
                                  <div className="text-[11px] font-black uppercase tracking-widest leading-none text-slate-400">建立自訂動作</div>
                                  <div style={{ color: lightTheme.text }} className="text-base font-black italic uppercase truncate max-w-[200px] mt-1.5 pr-2">{searchTerm}</div>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-[#82CC00] stroke-[3]" />
                            </motion.button>
                          )}

                          {filteredExercises.map(exName => (
                            <button key={exName} onClick={() => setSelectedExName(exName)} style={{ backgroundColor: lightTheme.card }} className="p-5 rounded-[24px] text-left border border-black/5 flex flex-col justify-center min-h-[86px] active:border-black/20 group transition-all shadow-sm">
                              <div style={{ color: lightTheme.text }} className="text-[14px] font-black italic uppercase leading-tight truncate pr-1">{exName}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center justify-between">
                                {getMuscleGroupDisplay(getMuscleGroup(exName)).cn}
                                <Plus className="w-3.5 h-3.5 text-[#82CC00] stroke-[3] opacity-0 group-active:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pb-32">
                      <h2 style={{ color: lightTheme.text }} className="text-2xl font-black italic uppercase truncate px-1">{selectedExName}</h2>

                      <div className="w-full relative px-1">
                        <ExerciseGifDisplay name={selectedExName} />
                      </div>

                      <div style={{ backgroundColor: lightTheme.card }} className="mx-1 p-6 rounded-[28px] border border-black/5 space-y-3.5 shadow-sm">
                        <div className="flex items-center gap-2.5 text-black">
                          <BookOpen className="w-5 h-5" />
                          <h3 className="text-[11px] font-black uppercase tracking-widest">運動方法</h3>
                        </div>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed italic whitespace-pre-line">
                          {getExerciseMethod(selectedExName)}
                        </p>
                      </div>

                      <div className="space-y-6 px-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Target className="w-5 h-5 text-black" />
                            <h3 style={{ color: lightTheme.text }} className="text-sm font-black italic uppercase">訓練錄入</h3>
                          </div>
                          <div className="flex items-center gap-3">
                            <button onClick={() => setMockSets([...mockSets, { id: crypto.randomUUID(), weight: mockSets[mockSets.length-1]?.weight || 0, reps: mockSets[mockSets.length-1]?.reps || 10, completed: false }])} className="flex items-center gap-1.5 text-black text-[10px] font-black uppercase">
                              <PlusCircle className="w-4 h-4" /> 加一組
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {mockSets.map((set, index) => (
                            <div key={set.id} className={`grid grid-cols-12 gap-2.5 items-center p-4 rounded-[28px] border transition-all ${set.completed ? 'bg-[#CCFF00]/10 border-[#CCFF00]/40' : 'bg-white border-black/5 shadow-sm'}`}>
                              <div className="col-span-1 flex justify-center">
                                <button onClick={() => setMockSets(mockSets.filter(s => s.id !== set.id))} className="text-slate-200 p-1 active:text-red-500">
                                  <MinusCircle className="w-5 h-5" />
                                </button>
                              </div>
                              <div className="col-span-1 text-base font-black italic text-slate-300 text-center">{index + 1}</div>
                              
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
                                  style={{ color: lightTheme.text }}
                                  className="w-16 bg-slate-100 rounded-xl py-3 text-center text-xl font-black outline-none border border-black/5 focus:border-black/20 transition-all shadow-inner" 
                                />
                                <span className="text-[10px] font-black text-slate-300 italic uppercase shrink-0">kg</span>
                              </div>

                              <div className="col-span-4 flex items-center justify-center gap-2">
                                <input 
                                  type="number" 
                                  value={set.reps || ''} 
                                  placeholder="0" 
                                  onChange={e => setMockSets(mockSets.map(s => s.id === set.id ? { ...s, reps: Number(e.target.value) } : s))} 
                                  style={{ color: lightTheme.text }}
                                  className="w-16 bg-slate-100 rounded-xl py-3 text-center text-xl font-black outline-none border border-black/5 focus:border-black/20 transition-all shadow-inner" 
                                />
                                <span className="text-[10px] font-black text-slate-300 italic uppercase shrink-0">rep</span>
                              </div>

                              <div className="col-span-2 flex justify-end">
                                <button 
                                  onClick={() => setMockSets(mockSets.map(s => s.id === set.id ? { ...s, completed: !s.completed } : s))} 
                                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 border shadow-sm ${set.completed ? 'bg-[#CCFF00] border-[#CCFF00] text-black' : 'bg-slate-50 border-black/5 text-slate-200'}`}
                                >
                                  <Check className="w-6 h-6 stroke-[4]" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="fixed bottom-12 left-0 right-0 z-50 px-8">
                        <button onClick={addExerciseToTemplate} style={{ backgroundColor: '#CCFF00', color: '#000000' }} className="w-full font-black h-16 rounded-2xl uppercase italic text-lg active:scale-95 shadow-xl flex items-center justify-center gap-4 transition-all">
                          <Check className="w-6 h-6 stroke-[3]" /> 確認並加入
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

  const RECOMMENDED_SYSTEMS = [
    {
      id: 'ppl-split',
      title: 'PPL 科學分化 (6 天版)',
      description: '極致高效的推、拉、腿分化，確保每週肌群都能獲得兩次高強度刺激。',
      tag: '高效增肌',
      routines: [
        { id: 'ppl-1', name: 'PUSH A - 胸肩三頭力量 (Day 1)', exercises: [
          { id: 'p1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 5, defaultReps: 5, defaultWeight: 0 },
          { id: 'p2', name: '啞鈴肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
          { id: 'p3', name: '雙槓撐體', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
        ]},
        { id: 'ppl-2', name: 'PULL A - 背部二頭厚度 (Day 2)', exercises: [
          { id: 'pl1', name: '槓鈴划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
          { id: 'pl2', name: '引體向上', muscleGroup: 'back', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
          { id: 'pl3', name: '滑輪面拉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
        ]},
        { id: 'ppl-3', name: 'LEGS A - 下肢全能力量 (Day 3)', exercises: [
          { id: 'l1', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 5, defaultReps: 5, defaultWeight: 0 },
          { id: 'l2', name: '傳統硬舉', muscleGroup: 'back', defaultSets: 3, defaultReps: 5, defaultWeight: 0 },
          { id: 'l3', name: '仰臥腿後勾', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
        ]},
        { id: 'ppl-4', name: 'PUSH B - 胸肩三頭肥大 (Day 4)', exercises: [
          { id: 'pb1', name: '啞鈴上斜臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
          { id: 'pb2', name: '啞鈴側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
          { id: 'pb3', name: '滑輪繩索下壓', muscleGroup: 'arms', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
        ]},
        { id: 'ppl-5', name: 'PULL B - 背部二頭寬度 (Day 5)', exercises: [
          { id: 'plb1', name: '滑輪下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
          { id: 'plb2', name: '坐姿划船機', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
          { id: 'plb3', name: '槓鈴彎舉', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
        ]},
        { id: 'ppl-6', name: 'LEGS B - 下肢肥大 (Day 6)', exercises: [
          { id: 'lb1', name: '上斜腿推機', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
          { id: 'lb2', name: '啞鈴高腳杯蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
          { id: 'lb3', name: '器械站姿提踵', muscleGroup: 'quads', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
        ]}
      ]
    },
    {
      id: 'bro-split',
      title: '經典五天分化 (5 天完整版)',
      description: '每天專注一個大肌群的高容量訓練，適合追求極致泵感與肌肉發展的進階者。',
      tag: '肌群專精',
      routines: [
        { id: 'bs-1', name: 'DAY 1 - 胸部轟炸', exercises: [
          { id: 'bc1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
          { id: 'bc2', name: '啞鈴上斜臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
          { id: 'bc3', name: '蝴蝶機夾胸', muscleGroup: 'chest', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
        ]},
        { id: 'bs-2', name: 'DAY 2 - 背部寬度', exercises: [
          { id: 'bb1', name: '滑輪下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
          { id: 'bb2', name: '槓鈴划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
          { id: 'bb3', name: '啞鈴單臂划船', muscleGroup: 'back', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
        ]},
        { id: 'bs-3', name: 'DAY 3 - 肩部維度', exercises: [
          { id: 'bs1', name: '啞鈴肩推', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
          { id: 'bs2', name: '啞鈴側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
          { id: 'bs3', name: '滑輪面拉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
        ]},
        { id: 'bs-4', name: 'DAY 4 - 腿部力量', exercises: [
          { id: 'bl1', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
          { id: 'bl2', name: '上斜腿推機', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
          { id: 'bl3', name: '仰臥腿後勾', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
        ]},
        { id: 'bs-5', name: 'DAY 5 - 手臂極限', exercises: [
          { id: 'ba1', name: '槓鈴彎舉', muscleGroup: 'arms', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
          { id: 'ba2', name: '窄握槓鈴臥推', muscleGroup: 'arms', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
          { id: 'ba3', name: '滑輪繩索下壓', muscleGroup: 'arms', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
        ]}
      ]
    },
    {
      id: 'upper-lower',
      title: '上下肢分化 (4 天版)',
      description: '將全身分為上下兩部分，兼顧力量發展與肌肥大容積。適合每週訓練 4 次的愛好者。',
      tag: '力量與容量',
      routines: [
        { id: 'ul-1', name: 'UPPER A - 上肢力量 (Day 1)', exercises: [
          { id: 'u1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 6, defaultWeight: 0 },
          { id: 'u2', name: '引體向上', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
          { id: 'u3', name: '槓鈴肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 8, defaultWeight: 0 }
        ]},
        { id: 'ul-2', name: 'LOWER A - 下肢力量 (Day 2)', exercises: [
          { id: 'lo1', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 6, defaultWeight: 0 },
          { id: 'lo2', name: '六角槓硬舉', muscleGroup: 'quads', defaultSets: 3, defaultReps: 5, defaultWeight: 0 },
          { id: 'lo3', name: '仰臥腿後勾', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
        ]},
        { id: 'ul-3', name: 'UPPER B - 上肢肥大 (Day 3)', exercises: [
          { id: 'ub1', name: '啞鈴上斜臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
          { id: 'ub2', name: '坐姿划船機', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
          { id: 'ub3', name: '啞鈴側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 15, defaultWeight: 0 }
        ]},
        { id: 'ul-4', name: 'LOWER B - 下肢肥大 (Day 4)', exercises: [
          { id: 'lob1', name: '上斜腿推機', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
          { id: 'lob2', name: '啞鈴高腳杯蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
          { id: 'lob3', name: '器械站姿提踵', muscleGroup: 'quads', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
        ]}
      ]
    },
    {
      id: 'full-body',
      title: '全身基礎體力 (3 天版)',
      description: '每次訓練涵蓋全身大肌群，適合每週時間有限的新手或忙碌人士。',
      tag: '新手友善',
      routines: [
        { id: 'fb-1', name: '全身基礎 A (Day 1)', exercises: [
          { id: 'f1', name: '啞鈴高腳杯蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
          { id: 'f2', name: '標準俯地挺身', muscleGroup: 'chest', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
          { id: 'f3', name: '坐姿划船機', muscleGroup: 'back', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
        ]},
        { id: 'fb-2', name: '全身基礎 B (Day 2)', exercises: [
          { id: 'f21', name: '六角槓硬舉', muscleGroup: 'back', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
          { id: 'f22', name: '器械肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
          { id: 'f23', name: '棒式', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 0 }
        ]},
        { id: 'fb-3', name: '全身基礎 C (Day 3)', exercises: [
          { id: 'f31', name: '上斜腿推機', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
          { id: 'f32', name: '啞鈴上斜臥推', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
          { id: 'f33', name: '滑輪下拉', muscleGroup: 'back', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
        ]}
      ]
    },
    {
      id: 'power-base',
      title: 'SBD 力量專項 (3 天版)',
      description: '專注於深蹲、臥推、硬舉 (SBD) 的力量基底提升，走大重量低次數路線。',
      tag: '力量巔峰',
      routines: [
        { id: 'pb-1', name: 'SQUAT DAY - 深蹲專項 (Day 1)', exercises: [
          { id: 'p11', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 5, defaultReps: 3, defaultWeight: 0 },
          { id: 'p12', name: '保加利亞啞鈴分腿蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 8, defaultWeight: 0 }
        ]},
        { id: 'pb-2', name: 'BENCH DAY - 臥推專項 (Day 2)', exercises: [
          { id: 'p21', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 5, defaultReps: 3, defaultWeight: 0 },
          { id: 'p22', name: '窄握槓鈴臥推', muscleGroup: 'arms', defaultSets: 3, defaultReps: 8, defaultWeight: 0 }
        ]},
        { id: 'pb-3', name: 'DEADLIFT DAY - 硬舉專項 (Day 3)', exercises: [
          { id: 'p31', name: '傳統硬舉', muscleGroup: 'back', defaultSets: 5, defaultReps: 2, defaultWeight: 0 },
          { id: 'p32', name: '引體向上', muscleGroup: 'back', defaultSets: 4, defaultReps: 6, defaultWeight: 0 }
        ]}
      ]
    }
  ];

  return (
    <div className="space-y-12 pb-40">
      <div className="flex justify-between items-center px-1 pt-2">
        <h2 style={{ color: lightTheme.text }} className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-4">
          <LayoutGrid className="w-7 h-7" /> 訓練課表
        </h2>
        <button 
          onClick={() => setIsCreating(true)} 
          style={{ backgroundColor: lightTheme.accent }}
          className="px-6 py-3 text-black text-[11px] font-black rounded-xl uppercase active:scale-95 transition-all shadow-md"
        >
          + 建立自訂
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ backgroundColor: lightTheme.card }} className="rounded-[40px] p-8 border border-black/5 shadow-xl space-y-7 overflow-hidden">
            <input autoFocus placeholder="課表名稱..." value={newRoutineName} onChange={e => setNewRoutineName(e.target.value)} style={{ color: lightTheme.text }} className="w-full bg-transparent border-b-2 border-black/10 py-4 text-3xl font-black italic uppercase outline-none focus:border-black" />
            <div className="flex gap-4">
              <button onClick={createRoutine} style={{ backgroundColor: lightTheme.accent }} className="flex-1 text-black font-black py-5 rounded-2xl uppercase italic text-base active:scale-95 shadow-md">確認建立</button>
              <button onClick={() => setIsCreating(false)} className="px-10 bg-white text-slate-400 font-bold py-5 rounded-2xl uppercase text-xs active:scale-90 border border-black/5 shadow-sm">取消</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {customRoutines.length > 0 && (
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] ml-2">我的自訂課表</p>
        )}
        {customRoutines.map(r => (
          <button key={r.id} onClick={() => setPreviewRoutine(r)} style={{ backgroundColor: lightTheme.card }} className="w-full rounded-[32px] p-7 border border-black/5 active:scale-[0.98] transition-all flex justify-between items-center text-left group shadow-sm">
            <div>
              <h3 style={{ color: lightTheme.text }} className="text-xl font-black italic uppercase tracking-tight">{r.name}</h3>
              <div className="flex items-center gap-3 mt-2.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.exercises.length} EXERCISES</span>
                <div className="w-1 h-1 rounded-full bg-slate-200" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">自訂</span>
              </div>
            </div>
            <div style={{ backgroundColor: lightTheme.accent }} className="w-12 h-12 text-black rounded-2xl flex items-center justify-center group-active:scale-90 transition-all shadow-sm">
              <ChevronRight className="w-6 h-6 stroke-[3]" />
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-10 pt-4">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] ml-2 flex items-center gap-3">
           <Layers className="w-5 h-5" /> 科學訓練系統庫
        </p>
        
        {RECOMMENDED_SYSTEMS.map(system => (
          <div key={system.id} style={{ backgroundColor: lightTheme.card }} className="rounded-[48px] p-8 border border-black/5 space-y-6 relative overflow-hidden shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                <h3 style={{ color: lightTheme.text }} className="text-xl font-black italic uppercase tracking-tighter">{system.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{system.description}</p>
              </div>
              <span className="shrink-0 px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-black/10">{system.tag}</span>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
               {system.routines.map((r, idx) => (
                 <button key={r.id} onClick={() => setPreviewRoutine(r as any)} style={{ backgroundColor: lightTheme.bg }} className="flex items-center justify-between p-6 border border-black/5 rounded-[28px] hover:border-black/20 active:scale-[0.98] transition-all text-left group shadow-sm">
                   <div className="flex items-center gap-5 overflow-hidden">
                      <div style={{ backgroundColor: lightTheme.card }} className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black text-black shrink-0 border border-black/5">D{idx + 1}</div>
                      <div className="overflow-hidden">
                        <div style={{ color: lightTheme.text }} className="text-base font-black italic uppercase truncate pr-2">{r.name}</div>
                        <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">{r.exercises.length} 個動作</div>
                      </div>
                   </div>
                   <div style={{ color: '#82CC00' }} className="w-8 h-8 rounded-lg flex items-center justify-center group-active:scale-110 transition-all">
                    <ChevronRight className="w-6 h-6 stroke-[4]" />
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
