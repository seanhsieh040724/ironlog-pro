import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AppContext } from '../App';
import { RoutineTemplate, MuscleGroup, ExerciseEntry, SetEntry, WorkoutSession } from '../types';
import { ExerciseSmallGif } from './ExerciseSmallGif';
import { getMuscleGroup, getMuscleGroupDisplay, fetchExerciseGif, getExerciseMethod, getExerciseGifUrl } from '../utils/fitnessMath';
import { ORGANIZED_EXERCISES, EXERCISE_DATABASE } from './WorkoutView';
import { 
  LayoutGrid, Trash2, ArrowLeft, Plus, ChevronRight, X, Search, Edit2, 
  Check, Sparkles, Layers, BookOpen, ChevronLeft, Zap, Play, Save, 
  Target, PlusCircle, MinusCircle, Loader2, Timer, PlusSquare, Weight,
  PauseCircle, PlayCircle, Clock, ChevronUp, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { lightTheme } from '../themeStyles';

const getHardcodedGif = (n: string) => {
  if (!n) return null;
  return getExerciseGifUrl(n);
};

// 將組件移出 RoutineView 作用域，防止每次 render 時重新宣告組件導致跳轉
const ExerciseGifDisplay: React.FC<{ name: string }> = ({ name }) => {
  const [localGifUrl, setLocalGifUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchExerciseGif(name).then(url => {
      setLocalGifUrl(url);
    });
  }, [name]);

  const displaySrc = getHardcodedGif(name) || localGifUrl || '';

  return (
    <div style={{ backgroundColor: lightTheme.card }} className="relative overflow-hidden rounded-[24px] shadow-sm border border-black/5 min-h-[240px] flex items-center justify-center">
      {isLoading && !getHardcodedGif(name) && (
        <div style={{ backgroundColor: lightTheme.card }} className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-black" />
          <p className="text-[11px] font-black uppercase tracking-widest text-black">準備中...</p>
        </div>
      )}
      {displaySrc && (
        <img 
          src={displaySrc} 
          alt={name} 
          className="w-full h-auto object-cover rounded-[15px] block"
          onLoad={() => setIsLoading(false)}
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
};

const RoutineExerciseRow: React.FC<{ name: string; sets: number; reps: number; muscleGroup: string; index: number }> = ({ name, sets, reps, muscleGroup, index }) => {
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadGif = async () => {
      const hardcoded = getHardcodedGif(name);
      if (hardcoded) {
        if (isMounted) {
          setGifUrl(hardcoded);
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      try {
        const url = await fetchExerciseGif(name);
        if (isMounted) setGifUrl(url);
      } catch (error) {
        console.error('Failed to fetch gif:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadGif();
    return () => { isMounted = false; };
  }, [name]);

  const muscleCn = getMuscleGroupDisplay(muscleGroup as MuscleGroup).cn;

  return (
    <div style={{ backgroundColor: lightTheme.bg }} className="p-3 border border-black/5 rounded-2xl shadow-sm flex items-center gap-4">
      {/* Small GIF on Left */}
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center border border-black/5 relative">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-black/40" />
        ) : (
          <img 
            src={gifUrl || `https://picsum.photos/seed/${name}/100/100`} 
            alt={name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      {/* Details on Right */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black px-1.5 py-0.5 rounded bg-black text-[#CCFF00]">#{index}</span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{muscleCn}</span>
        </div>
        <h4 className="text-[16px] font-black text-black uppercase leading-tight truncate mt-1.5">{name}</h4>
        <div className="text-[13px] font-bold text-stone-500 mt-1.5">
          建議：<span className="font-black text-black">{sets} 組</span> x <span className="font-black text-black">{reps} 下</span>
        </div>
      </div>
    </div>
  );
};

// 移除本地定義的 ExerciseSmallGif

interface IntegratedWorkoutViewProps {
  routine: RoutineTemplate;
  sessionExercises: ExerciseEntry[];
  setSessionExercises: React.Dispatch<React.SetStateAction<ExerciseEntry[]>>;
  onClose: () => void;
  onFinish: (finalSession: WorkoutSession) => void;
}

const IntegratedWorkoutView: React.FC<IntegratedWorkoutViewProps> = ({ 
  routine, 
  sessionExercises, 
  setSessionExercises, 
  onClose,
  onFinish 
}) => {
  const context = useContext(AppContext);
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
    }
    return () => clearInterval(interval);
  }, [timerStartedAt]);

  const startWorkoutTimer = () => {
    if (!timerStartedAt) {
      setTimerStartedAt(Date.now());
    }
  };

  const updateSetData = (exIndex: number, setId: string, updates: Partial<SetEntry>, sIdx: number) => {
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
    onFinish(finalSession);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 pb-48">
      <div className="flex items-center gap-5 px-1 sticky top-0 z-[60] bg-white/90 backdrop-blur-xl py-4 border-b border-black/5">
        <button onClick={() => { if(timerStartedAt && !confirm('訓練正在計時中，確定要離開嗎？')) return; onClose(); }} style={{ backgroundColor: lightTheme.accent }} className="w-11 h-11 rounded-xl flex items-center justify-center text-black active:scale-90 transition-all shadow-md">
          <ArrowLeft className="w-6 h-6 stroke-[3]" />
        </button>
        <div className="flex-1 overflow-hidden">
          <h2 style={{ color: lightTheme.text }} className="text-2xl font-black tracking-tighter uppercase leading-tight py-1">{routine.name}</h2>
          <p className="text-[11px] font-black text-[#82CC00] uppercase tracking-widest mt-0.5">整合訓練模式</p>
        </div>
      </div>

      <div className="space-y-24">
        {sessionExercises.map((ex, exIdx) => (
          <div key={ex.id} className="space-y-8">
            <div className="flex items-center gap-4 px-1">
               <div style={{ backgroundColor: lightTheme.card }} className="w-12 h-12 rounded-2xl flex items-center justify-center text-black font-black text-xl border border-black/5 shrink-0">#{exIdx + 1}</div>
               <div className="flex-1 min-w-0 flex items-center gap-3">
                 <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center border border-black/5">
                   <ExerciseSmallGif name={ex.name} />
                 </div>
                 <h3 style={{ color: lightTheme.text }} className="text-2xl font-black uppercase tracking-tighter leading-tight py-1">{ex.name}</h3>
               </div>
            </div>

            <div style={{ backgroundColor: lightTheme.card }} className="mx-1 p-6 rounded-[28px] border border-black/5 space-y-3.5 shadow-sm">
              <div className="flex items-center gap-2.5 text-black">
                <BookOpen className="w-5 h-5" />
                <h3 className="text-[12px] font-black uppercase tracking-widest">運動方法</h3>
              </div>
              <p className="text-base font-medium text-black leading-relaxed whitespace-pre-line">
                {getExerciseMethod(ex.name)}
              </p>
            </div>

            <div className="space-y-6 px-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2.5">
                    <Target className="w-5 h-5 text-black" />
                    <h3 style={{ color: lightTheme.text }} className="text-sm font-black uppercase">訓練錄入</h3>
                  </div>
                  {timerStartedAt && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-black/5 border border-black/10 rounded-lg">
                      <Timer className="w-3.5 h-3.5 animate-pulse" />
                      <span className="text-[11px] font-black font-sans text-black">{elapsedTime}</span>
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
                  <div key={set.id} className={`grid grid-cols-12 gap-1 sm:gap-2.5 items-center p-2.5 sm:p-4 rounded-[28px] border transition-all ${set.completed ? 'bg-[#CCFF00] border-black' : 'bg-white border-black/5 shadow-sm'}`}>
                    <div className="col-span-1 flex justify-center">
                      <button onClick={() => removeSetFromEx(exIdx, set.id)} className="text-black p-1 active:text-red-500">
                        <MinusCircle className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="col-span-1 text-lg font-black text-black text-center">{sIdx + 1}</div>
                    
                    <div className="col-span-4 flex items-center justify-center gap-1 sm:gap-2">
                      <input 
                        type="number" 
                        value={set.weight || ''} 
                        placeholder="0" 
                        onChange={e => updateSetData(exIdx, set.id, { weight: Number(e.target.value) }, sIdx)} 
                        style={{ color: '#000000' }}
                        className="w-[44px] sm:w-[51px] bg-slate-100 rounded-xl py-2 sm:py-2.5 text-center text-[17px] sm:text-[19px] font-black outline-none border border-black/5 focus:border-black/20 transition-all shadow-inner [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] appearance-none px-0.5" 
                      />
                      <span className="text-[10px] sm:text-[11px] font-black text-black uppercase shrink-0">kg</span>
                    </div>

                    <div className="col-span-4 flex items-center justify-center gap-1 sm:gap-1.5">
                      <input 
                        type="number" 
                        value={set.reps || ''} 
                        placeholder="0" 
                        onChange={e => updateSetData(exIdx, set.id, { reps: Number(e.target.value) }, sIdx)} 
                        style={{ color: '#000000' }}
                        className="w-[38px] sm:w-[46px] bg-slate-100 rounded-xl py-2 sm:py-2.5 text-center text-[16px] sm:text-[18px] font-black outline-none border border-black/5 focus:border-black/20 transition-all shadow-inner [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] appearance-none px-0.5" 
                      />
                      <div className="flex flex-col justify-center items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateSetData(exIdx, set.id, { reps: (set.reps || 0) + 1 }, sIdx)}
                          className="w-4 h-4 sm:w-5 sm:h-5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 rounded flex items-center justify-center text-black transition-all active:scale-90"
                          title="加1次"
                        >
                          <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSetData(exIdx, set.id, { reps: Math.max(0, (set.reps || 0) - 1) }, sIdx)}
                          className="w-4 h-4 sm:w-5 sm:h-5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 rounded flex items-center justify-center text-black transition-all active:scale-90"
                          title="減1次"
                        >
                          <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                        </button>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-black text-black uppercase shrink-0">rep</span>
                    </div>

                    <div className="col-span-2 flex justify-end">
                      <button 
                        onClick={() => { 
                          const nc = !set.completed; 
                          if(nc) { 
                            startWorkoutTimer(); 
                            if(context) context.triggerRestTimer(); 
                          } 
                          updateSetData(exIdx, set.id, { completed: nc }, sIdx); 
                        }} 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 border shadow-sm ${set.completed ? 'bg-[#CCFF00] border-[#CCFF00] text-black' : 'bg-slate-50 border-black/5 text-black'}`}
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
           className="w-full font-black h-14 rounded-2xl uppercase text-base active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 tracking-tighter"
         >
           <Save className="w-5 h-5 stroke-[2.5]" style={{ color: lightTheme.accent }} /> 儲存訓練
         </button>
      </div>
    </motion.div>
  );
};

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
  const [weeklyDays, setWeeklyDays] = useState<number>(2);

  if (!context) return null;
  const { customRoutines, setCustomRoutines, setHistory, history } = context;

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

  const handleFinishIntegratedWorkout = (finalSession: WorkoutSession) => {
    setHistory([finalSession, ...history]);
    alert('訓練紀錄已儲存！');
    setIntegratedRoutine(null);
    setPreviewRoutine(null);
  };

  if (integratedRoutine) {
    return (
      <IntegratedWorkoutView 
        routine={integratedRoutine} 
        sessionExercises={sessionExercises}
        setSessionExercises={setSessionExercises}
        onClose={() => setIntegratedRoutine(null)}
        onFinish={handleFinishIntegratedWorkout}
      />
    );
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
                <input autoFocus value={tempName} onChange={e => setTempName(e.target.value)} onBlur={renameRoutine} className="bg-transparent border-b border-black text-xl font-black text-black outline-none w-full uppercase" />
                <button onClick={renameRoutine} className="p-2 text-black"><Check className="w-6 h-6" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <h2 style={{ color: lightTheme.text }} className="text-xl font-black tracking-tighter uppercase leading-tight py-1">{previewRoutine.name}</h2>
                {isCustom && <button onClick={() => { setTempName(previewRoutine.name); setIsEditingName(true); }} className="p-2 bg-slate-100 rounded-lg text-black"><Edit2 className="w-4 h-4" /></button>}
              </div>
            )}
          </div>
          {isCustom && <button onClick={() => deleteRoutine(previewRoutine.id)} className="w-11 h-11 bg-red-50 text-red-500 rounded-xl flex items-center justify-center border border-red-100 active:scale-90 transition-all"><Trash2 className="w-6 h-6" /></button>}
        </div>
        
        <div className="space-y-3.5">
          {previewRoutine.exercises.map((ex, idx) => (
            <div key={ex.id} style={{ backgroundColor: lightTheme.card }} className="rounded-[32px] p-4 border border-black/5 flex items-center justify-between group shadow-sm">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <span className="text-xs font-black text-black w-4 shrink-0">{idx + 1}</span>
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center border border-black/5">
                  <ExerciseSmallGif name={ex.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 style={{ color: lightTheme.text }} className="font-black text-xl uppercase tracking-tight pr-2 leading-tight py-0.5">{ex.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] font-black text-black uppercase tracking-widest">{getMuscleGroupDisplay(ex.muscleGroup).cn}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[11px] font-bold text-black uppercase tracking-[0.2em]">{ex.defaultSets} 組 | {ex.defaultReps} 次</span>
                  </div>
                </div>
              </div>
              {isCustom && (
                <button onClick={() => removeExerciseFromTemplate(ex.id)} style={{ backgroundColor: lightTheme.bg }} className="w-10 h-10 rounded-xl flex items-center justify-center text-black active:text-red-500 border border-black/5 shadow-inner ml-2"><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
          ))}
        </div>

        {isCustom && (
          <button onClick={() => { setIsAddingExercise(true); setSearchTerm(''); }} style={{ backgroundColor: lightTheme.accent }} className="w-full py-5 border border-black/5 rounded-3xl text-[12px] font-black uppercase text-black flex items-center justify-center gap-2.5 active:scale-95 transition-all shadow-md">
            <Plus className="w-4 h-4 stroke-[3]" /> 新增動作項目
          </button>
        )}
        
        <div className="fixed bottom-[110px] left-0 right-0 z-50 flex flex-col gap-3 px-8">
          <button 
            onClick={() => handleEnterIntegratedMode(previewRoutine)} 
            style={{ backgroundColor: '#CCFF00', color: '#000000' }}
            className="w-full font-black h-16 rounded-2xl uppercase tracking-tighter text-lg shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all"
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
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    {selectedExName ? (
                      <>
                        <button onClick={() => setSelectedExName(null)} className="p-2 -ml-2 active:scale-90 transition-all shrink-0">
                          <ChevronLeft className="w-8 h-8 text-black stroke-[4]" />
                        </button>
                        <h2 style={{ color: lightTheme.text }} className="text-xl font-black uppercase leading-tight py-1">
                          {selectedExName}
                        </h2>
                      </>
                    ) : (
                      <h3 style={{ color: lightTheme.text }} className="text-2xl font-black uppercase pr-2">選取項目</h3>
                    )}
                  </div>
                  <button onClick={() => { setIsAddingExercise(false); setSelectedExName(null); }} style={{ backgroundColor: lightTheme.card }} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-black border border-black/5 active:scale-90"><X className="w-7 h-7" /></button>
                </div>

                <div className="space-y-5 flex-1 overflow-hidden flex flex-col">
                  {!selectedExName ? (
                    <>
                      <div style={{ backgroundColor: lightTheme.card }} className="flex items-center gap-4 border border-black/5 rounded-2xl px-6 py-4 shadow-inner shrink-0">
                        <Search className="w-5 h-5 text-black" />
                        <input 
                          placeholder="搜尋動作庫..." 
                          value={searchTerm} 
                          onChange={e => setSearchTerm(e.target.value)} 
                          className="bg-transparent w-full text-lg font-black outline-none placeholder:text-black" 
                          style={{ color: lightTheme.text }}
                        />
                      </div>

                      {!searchTerm && (
                        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 shrink-0">
                          {Object.keys(ORGANIZED_EXERCISES).map(cat => (
                            <button 
                              key={cat} 
                              onClick={() => setActiveCategory(cat)} 
                              className={`shrink-0 px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat ? 'bg-black text-white border-black' : 'bg-slate-50 text-black border-black/5'}`}
                              style={activeCategory === cat ? { backgroundColor: '#000000', color: '#FFFFFF' } : {}}
                            >
                              {getMuscleGroupDisplay(cat as MuscleGroup).cn}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-12">
                        <div className="grid grid-cols-1 gap-3">
                          {searchTerm.trim() && !isExactMatch && (
                            <motion.button 
                              whileTap={{ scale: 0.95 }} 
                              onClick={() => setSelectedExName(searchTerm.trim())} 
                              style={{ backgroundColor: lightTheme.card }}
                              className="p-5 rounded-[24px] border border-black/5 flex items-center justify-between group shadow-sm"
                            >
                              <div className="flex items-center gap-4">
                                <div style={{ backgroundColor: lightTheme.accent }} className="w-10 h-10 rounded-xl flex items-center justify-center text-black">
                                  <PlusSquare className="w-6 h-6" />
                                </div>
                                <div className="text-left overflow-hidden">
                                  <div className="text-[12px] font-black uppercase tracking-widest leading-none text-black">建立自訂動作</div>
                                  <div style={{ color: lightTheme.text }} className="text-lg font-black uppercase leading-tight mt-1.5 pr-2">{searchTerm}</div>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-[#82CC00] stroke-[3]" />
                            </motion.button>
                          )}

                          {filteredExercises.map(exName => (
                            <button 
                              key={exName} 
                              onClick={() => setSelectedExName(exName)} 
                              style={{ backgroundColor: lightTheme.card }} 
                              className="p-3 rounded-[24px] text-left border border-black/5 flex items-center gap-4 active:border-black/20 group transition-all shadow-sm"
                            >
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center border border-black/5">
                                <ExerciseSmallGif name={exName} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div style={{ color: lightTheme.text }} className="text-[16px] font-black uppercase leading-tight py-0.5 pr-1">{exName}</div>
                                <div className="text-[11px] font-bold text-black uppercase tracking-widest mt-1.5 flex items-center justify-between">
                                  {getMuscleGroupDisplay(getMuscleGroup(exName)).cn}
                                  <Plus className="w-3.5 h-3.5 text-[#82CC00] stroke-[3] opacity-0 group-active:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pb-32">
                      <div className="w-full relative px-1">
                        <ExerciseGifDisplay name={selectedExName} />
                      </div>

                      <div style={{ backgroundColor: lightTheme.card }} className="mx-1 p-6 rounded-[28px] border border-black/5 space-y-3.5 shadow-sm">
                        <div className="flex items-center gap-2.5 text-black">
                          < BookOpen className="w-5 h-5" />
                          <h3 className="text-[12px] font-black uppercase tracking-widest">運動方法</h3>
                        </div>
                        <p className="text-base font-medium text-black leading-relaxed whitespace-pre-line">
                          {getExerciseMethod(selectedExName)}
                        </p>
                      </div>

                      <div className="space-y-6 px-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Target className="w-5 h-5 text-black" />
                            <h3 style={{ color: lightTheme.text }} className="text-sm font-black uppercase">訓練錄入</h3>
                          </div>
                          <div className="flex items-center gap-3">
                            <button onClick={() => setMockSets([...mockSets, { id: crypto.randomUUID(), weight: mockSets[mockSets.length-1]?.weight || 0, reps: mockSets[mockSets.length-1]?.reps || 10, completed: false }])} className="flex items-center gap-1.5 text-black text-[10px] font-black uppercase">
                              <PlusCircle className="w-4 h-4" /> 加一組
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {mockSets.map((set, index) => (
                            <div key={set.id} className={`grid grid-cols-12 gap-1 sm:gap-2.5 items-center p-2.5 sm:p-4 rounded-[28px] border transition-all ${set.completed ? 'bg-[#CCFF00] border-black' : 'bg-white border-black/5 shadow-sm'}`}>
                              <div className="col-span-1 flex justify-center">
                                <button onClick={() => setMockSets(mockSets.filter(s => s.id !== set.id))} className="text-black p-1 active:text-red-500">
                                  <MinusCircle className="w-5 h-5" />
                                </button>
                              </div>
                              <div className="col-span-1 text-lg font-black text-black text-center">{index + 1}</div>
                              
                              <div className="col-span-4 flex items-center justify-center gap-1 sm:gap-2">
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
                                  style={{ color: '#000000' }}
                                  className="w-[44px] sm:w-[51px] bg-slate-100 rounded-xl py-2 sm:py-2.5 text-center text-[17px] sm:text-[19px] font-black outline-none border border-black/5 focus:border-black/20 transition-all shadow-inner [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] appearance-none px-0.5" 
                                />
                                <span className="text-[10px] sm:text-[11px] font-black text-black uppercase shrink-0">kg</span>
                              </div>

                              <div className="col-span-4 flex items-center justify-center gap-1 sm:gap-1.5">
                                <input 
                                  type="number" 
                                  value={set.reps || ''} 
                                  placeholder="0" 
                                  onChange={e => setMockSets(mockSets.map(s => s.id === set.id ? { ...s, reps: Number(e.target.value) } : s))} 
                                  style={{ color: '#000000' }}
                                  className="w-[38px] sm:w-[46px] bg-slate-100 rounded-xl py-2 sm:py-2.5 text-center text-[16px] sm:text-[18px] font-black outline-none border border-black/5 focus:border-black/20 transition-all shadow-inner [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] appearance-none px-0.5" 
                                />
                                <div className="flex flex-col justify-center items-center gap-0.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setMockSets(mockSets.map(s => s.id === set.id ? { ...s, reps: (s.reps || 0) + 1 } : s))}
                                    className="w-4 h-4 sm:w-5 sm:h-5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 rounded flex items-center justify-center text-black transition-all active:scale-90"
                                    title="加1次"
                                  >
                                    <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setMockSets(mockSets.map(s => s.id === set.id ? { ...s, reps: Math.max(0, (s.reps || 0) - 1) } : s))}
                                    className="w-4 h-4 sm:w-5 sm:h-5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 rounded flex items-center justify-center text-black transition-all active:scale-90"
                                    title="減1次"
                                  >
                                    <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                                  </button>
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-black text-black uppercase shrink-0">rep</span>
                              </div>

                              <div className="col-span-2 flex justify-end">
                                <button 
                                  onClick={() => setMockSets(mockSets.map(s => s.id === set.id ? { ...s, completed: !s.completed } : s))} 
                                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 border shadow-sm ${set.completed ? 'bg-[#CCFF00] border-[#CCFF00] text-black' : 'bg-slate-50 border-black/5 text-black'}`}
                                >
                                  <Check className="w-6 h-6 stroke-[4]" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="fixed bottom-12 left-0 right-0 z-50 px-8">
                        <button onClick={addExerciseToTemplate} style={{ backgroundColor: '#CCFF00', color: '#000000' }} className="w-full font-black h-16 rounded-2xl uppercase text-xl active:scale-95 shadow-xl flex items-center justify-center gap-4 transition-all">
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
          { id: 'p2', name: '坐姿啞鈴肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
          { id: 'p3', name: '雙槓撐體', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
        ]},
        { id: 'ppl-2', name: 'PULL A - 背部二頭厚度 (Day 2)', exercises: [
          { id: 'pl1', name: '槓鈴划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
          { id: 'pl2', name: '引體向上', muscleGroup: 'back', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
          { id: 'pl3', name: '繩索面拉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
        ]},
        { id: 'ppl-3', name: 'LEGS A - 下肢全能力量 (Day 3)', exercises: [
          { id: 'l1', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 5, defaultReps: 5, defaultWeight: 0 },
          { id: 'l2', name: '傳統硬舉', muscleGroup: 'back', defaultSets: 3, defaultReps: 5, defaultWeight: 0 },
          { id: 'l3', name: '俯臥腿後勾', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
        ]},
        { id: 'ppl-4', name: 'PUSH B - 胸肩三頭肥大 (Day 4)', exercises: [
          { id: 'pb1', name: '啞鈴上斜臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
          { id: 'pb2', name: '啞鈴側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
          { id: 'pb3', name: '繩索下壓', muscleGroup: 'arms', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
        ]},
        { id: 'ppl-5', name: 'PULL B - 背部二頭寬度 (Day 5)', exercises: [
          { id: 'plb1', name: '高位下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
          { id: 'plb2', name: '坐姿器械划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
          { id: 'plb3', name: '槓鈴彎舉', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
        ]},
        { id: 'ppl-6', name: 'LEGS B - 下肢肥大 (Day 6)', exercises: [
          { id: 'lb1', name: '上斜器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
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
          { id: 'bb1', name: '高位下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
          { id: 'bb2', name: '槓鈴划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
          { id: 'bb3', name: '單臂啞鈴划船', muscleGroup: 'back', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
        ]},
        { id: 'bs-3', name: 'DAY 3 - 肩部維度', exercises: [
          { id: 'bs1', name: '坐姿啞鈴肩推', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
          { id: 'bs2', name: '啞鈴側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
          { id: 'bs3', name: '繩索面拉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
        ]},
        { id: 'bs-4', name: 'DAY 4 - 腿部力量', exercises: [
          { id: 'bl1', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
          { id: 'bl2', name: '上斜器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
          { id: 'bl3', name: '俯臥腿後勾', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
        ]},
        { id: 'bs-5', name: 'DAY 5 - 手臂極限', exercises: [
          { id: 'ba1', name: '槓鈴彎舉', muscleGroup: 'arms', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
          { id: 'ba2', name: '窄握槓鈴臥推', muscleGroup: 'arms', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
          { id: 'ba3', name: '繩索下壓', muscleGroup: 'arms', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
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
          { id: 'u3', name: '站姿槓鈴肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 8, defaultWeight: 0 }
        ]},
        { id: 'ul-2', name: 'LOWER A - 下肢力量 (Day 2)', exercises: [
          { id: 'lo1', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 6, defaultWeight: 0 },
          { id: 'lo2', name: '六角槓硬舉', muscleGroup: 'quads', defaultSets: 3, defaultReps: 5, defaultWeight: 0 },
          { id: 'lo3', name: '俯臥腿後勾', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
        ]},
        { id: 'ul-3', name: 'UPPER B - 上肢肥大 (Day 3)', exercises: [
          { id: 'ub1', name: '啞鈴上斜臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
          { id: 'ub2', name: '坐姿器械划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
          { id: 'ub3', name: '啞鈴側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 15, defaultWeight: 0 }
        ]},
        { id: 'ul-4', name: 'LOWER B - 下肢肥大 (Day 4)', exercises: [
          { id: 'lob1', name: '上斜器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
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
          { id: 'f3', name: '坐姿器械划船', muscleGroup: 'back', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
        ]},
        { id: 'fb-2', name: '全身基礎 B (Day 2)', exercises: [
          { id: 'f21', name: '六角槓硬舉', muscleGroup: 'back', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
          { id: 'f22', name: '器械肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
          { id: 'f23', name: '棒式', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 0 }
        ]},
        { id: 'fb-3', name: '全身基礎 C (Day 3)', exercises: [
          { id: 'f31', name: '上斜器械腿推', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
          { id: 'f32', name: '啞鈴上斜臥推', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
          { id: 'f33', name: '高位下拉', muscleGroup: 'back', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
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

  const WEEKLY_DAY_ROUTINES: Record<number, { title: string; desc: string; days: RoutineTemplate[] }> = {
    2: {
      title: '每週二練基礎維持課表',
      desc: '專為時間有限者設計。Day 1 專注上肢拉推力量，Day 2 專注下肢與核心。高效率、極省時。',
      days: [
        {
          id: 'w2-d1',
          name: 'Day 1 - 全身上肢拉與推',
          exercises: [
            { id: 'w2-d1-e1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
            { id: 'w2-d1-e2', name: '引體向上', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
            { id: 'w2-d1-e3', name: '站姿繩索夾胸', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
          ]
        },
        {
          id: 'w2-d2',
          name: 'Day 2 - 全身下肢與核心',
          exercises: [
            { id: 'w2-d2-e1', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
            { id: 'w2-d2-e2', name: '傳統硬舉', muscleGroup: 'back', defaultSets: 3, defaultReps: 6, defaultWeight: 0 },
            { id: 'w2-d2-e3', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
          ]
        }
      ]
    },
    3: {
      title: '每週三練經典推拉腿課表',
      desc: '最科學的三天分化模式。推、拉、腿循環，給予各肌群最充分的恢復與最高強度刺激。',
      days: [
        {
          id: 'w3-d1',
          name: 'Day 1 - 推部力量與維度',
          exercises: [
            { id: 'w3-d1-e1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
            { id: 'w3-d1-e2', name: '坐姿啞鈴肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
            { id: 'w3-d1-e3', name: '平板繩索飛鳥', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
          ]
        },
        {
          id: 'w3-d2',
          name: 'Day 2 - 拉部寬度與厚度',
          exercises: [
            { id: 'w3-d2-e1', name: '槓鈴划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
            { id: 'w3-d2-e2', name: '高位下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
            { id: 'w3-d2-e3', name: '滑輪直臂下拉', muscleGroup: 'back', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
          ]
        },
        {
          id: 'w3-d3',
          name: 'Day 3 - 腿部與臀部力量',
          exercises: [
            { id: 'w3-d3-e1', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
            { id: 'w3-d3-e2', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
            { id: 'w3-d3-e3', name: '水平器械腿推', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
          ]
        }
      ]
    },
    4: {
      title: '每週四練上下肢精準分化課表',
      desc: '最適合重訓愛好者的 4 天上下肢交替訓練模式。高效率、高容積。',
      days: [
        {
          id: 'w4-d1',
          name: 'Day 1 - 上肢 A 力量拉推',
          exercises: [
            { id: 'w4-d1-e1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
            { id: 'w4-d1-e2', name: '引體向上', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
            { id: 'w4-d1-e3', name: '站姿繩索夾胸', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
          ]
        },
        {
          id: 'w4-d2',
          name: 'Day 2 - 下肢 A 力量深蹲',
          exercises: [
            { id: 'w4-d2-e1', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
            { id: 'w4-d2-e2', name: '水平器械腿推', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
            { id: 'w4-d2-e3', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
          ]
        },
        {
          id: 'w4-d3',
          name: 'Day 3 - 上肢 B 肥大雕琢',
          exercises: [
            { id: 'w4-d3-e1', name: '上斜器械胸推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
            { id: 'w4-d3-e2', name: '分動器械下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
            { id: 'w4-d3-e3', name: '滑輪直臂下拉', muscleGroup: 'back', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
          ]
        },
        {
          id: 'w4-d4',
          name: 'Day 4 - 下肢 B 肥大拉伸',
          exercises: [
            { id: 'w4-d4-e1', name: '傳統硬舉', muscleGroup: 'back', defaultSets: 3, defaultReps: 8, defaultWeight: 0 },
            { id: 'w4-d4-e2', name: '上斜啞鈴划船', muscleGroup: 'back', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
            { id: 'w4-d4-e3', name: '仰臥器械胸推', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
          ]
        }
      ]
    },
    5: {
      title: '每週五練經典肌群分化課表',
      desc: '五天完美肌群分化，每天專精一個部位。極致容量與雕琢泵感。',
      days: [
        {
          id: 'w5-d1',
          name: 'Day 1 - 胸部力量與形狀',
          exercises: [
            { id: 'w5-d1-e1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
            { id: 'w5-d1-e2', name: '站姿繩索夾胸', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
            { id: 'w5-d1-e3', name: '仰臥器械胸推', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
          ]
        },
        {
          id: 'w5-d2',
          name: 'Day 2 - 背部維度與厚度',
          exercises: [
            { id: 'w5-d2-e1', name: '分動器械下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
            { id: 'w5-d2-e2', name: '引體向上', muscleGroup: 'back', defaultSets: 3, defaultReps: 8, defaultWeight: 0 },
            { id: 'w5-d2-e3', name: '滑輪直臂下拉', muscleGroup: 'back', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
          ]
        },
        {
          id: 'w5-d3',
          name: 'Day 3 - 肩部雕刻與立體感',
          exercises: [
            { id: 'w5-d3-e1', name: '坐姿啞鈴肩推', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
            { id: 'w5-d3-e2', name: '繩索面拉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
            { id: 'w5-d3-e3', name: '啞鈴側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 15, defaultWeight: 0 }
          ]
        },
        {
          id: 'w5-d4',
          name: 'Day 4 - 下肢大重量深蹲',
          exercises: [
            { id: 'w5-d4-e1', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
            { id: 'w5-d4-e2', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
            { id: 'w5-d4-e3', name: '水平器械腿推', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
          ]
        },
        {
          id: 'w5-d5',
          name: 'Day 5 - 手臂肌群極限雕琢',
          exercises: [
            { id: 'w5-d5-e1', name: '槓鈴彎舉', muscleGroup: 'arms', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
            { id: 'w5-d5-e2', name: '雙槓撐體輔助', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
          ]
        }
      ]
    }
  };

  const currentWeeklySystem = WEEKLY_DAY_ROUTINES[weeklyDays];

  return (
    <div className="space-y-12 pb-40">
      <div className="flex justify-between items-center px-1 pt-2">
        <h2 style={{ color: lightTheme.text }} className="text-[30px] sm:text-4xl font-black tracking-tighter uppercase flex items-center gap-4">
          <LayoutGrid className="w-7 h-7 animate-pulse" /> 訓練課表
        </h2>
      </div>

      {/* 每週訓練天數選擇器（2, 3, 4, 5 天）- 新增需求 */}
      <div style={{ backgroundColor: lightTheme.card }} className="mx-1 p-6 rounded-[36px] border border-black/5 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 style={{ color: lightTheme.text }} className="text-xl font-black uppercase tracking-tight">每週訓練天數</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">選擇每週天數顯示對應計劃</p>
          </div>
          <span className="text-xs sm:text-sm font-black text-white bg-black px-3 py-1 rounded-lg uppercase tracking-widest">
            每週 {weeklyDays} 練
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {[2, 3, 4, 5].map(days => (
            <button
              key={days}
              onClick={() => setWeeklyDays(days)}
              className={`py-3.5 rounded-2xl text-base font-black transition-all border ${
                weeklyDays === days 
                  ? 'bg-[#CCFF00] text-black border-black shadow-md scale-105' 
                  : 'bg-white text-black border-black/5 hover:border-black/20'
              }`}
            >
              {days} 天
            </button>
          ))}
        </div>

        {/* 展開並顯示 GIF 的每週課表 */}
        <div className="border-t border-black/5 pt-5 space-y-6">
          <div className="bg-slate-50 rounded-2xl p-4 border border-black/[0.02]">
            <h4 className="text-[16px] font-black text-black uppercase leading-tight">{currentWeeklySystem.title}</h4>
            <p className="text-[13px] text-stone-500 mt-1.5 leading-relaxed">{currentWeeklySystem.desc}</p>
          </div>

          {/* List of All Days vertically stacked */}
          <div className="space-y-8 pt-2">
            {currentWeeklySystem.days.map((routineDay, dIdx) => (
              <div key={routineDay.id} className="space-y-4 border-t border-black/5 pt-6 first:border-t-0 first:pt-0">
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-black/[0.02]">
                  <div className="min-w-0 pr-2">
                    <h5 className="text-[16px] font-black uppercase text-black leading-tight">
                      {routineDay.name}
                    </h5>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1.5">
                      {routineDay.exercises.length} 個動作項目
                    </p>
                  </div>
                  <button
                    onClick={() => handleEnterIntegratedMode(routineDay)}
                    className="flex items-center gap-1.5 text-black text-xs font-black uppercase bg-[#CCFF00]/20 px-3 py-1.5 rounded-lg active:scale-95 transition-all shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> 開始此天訓練
                  </button>
                </div>

                {/* Vertical list of small exercises */}
                <div className="grid grid-cols-1 gap-3.5">
                  {routineDay.exercises.map((ex, exIdx) => (
                    <RoutineExerciseRow 
                      key={ex.id}
                      name={ex.name}
                      sets={ex.defaultSets}
                      reps={ex.defaultReps}
                      muscleGroup={ex.muscleGroup}
                      index={exIdx + 1}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <p className="text-sm font-black text-black uppercase tracking-[0.4em] ml-2">我的自訂課表</p>
        
        <button 
          onClick={() => setIsCreating(true)} 
          style={{ backgroundColor: lightTheme.accent }}
          className="w-full py-5 text-black text-base font-black rounded-2xl uppercase active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3"
        >
          <Plus className="w-6 h-6 stroke-[3]" /> 建立我的課表
        </button>

        <AnimatePresence>
          {isCreating && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ backgroundColor: lightTheme.card }} className="rounded-[40px] p-8 border border-black/5 shadow-xl space-y-7 overflow-hidden">
              <input autoFocus placeholder="課表名稱..." value={newRoutineName} onChange={e => setNewRoutineName(e.target.value)} style={{ color: '#000000' }} className="w-full bg-transparent border-b-2 border-black/10 py-4 text-3xl font-black uppercase outline-none focus:border-black" />
              <div className="flex gap-4">
                <button onClick={createRoutine} style={{ backgroundColor: lightTheme.accent }} className="flex-1 text-black font-black py-5 rounded-2xl uppercase text-base active:scale-95 shadow-md">確認建立</button>
                <button onClick={() => setIsCreating(false)} className="px-10 bg-white text-black font-bold py-5 rounded-2xl uppercase text-xs active:scale-90 border border-black/5 shadow-sm">取消</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {customRoutines.map(r => (
            <button key={r.id} onClick={() => setPreviewRoutine(r)} style={{ backgroundColor: lightTheme.card }} className="w-full rounded-[32px] p-7 border border-black/5 active:scale-[0.98] transition-all flex justify-between items-center text-left group shadow-sm">
              <div>
                <h3 style={{ color: lightTheme.text }} className="text-xl font-black uppercase tracking-tight leading-tight py-1">{r.name}</h3>
                <div className="flex items-center gap-3 mt-2.5">
                  <span className="text-[10px] font-black text-black uppercase tracking-widest">{r.exercises.length} EXERCISES</span>
                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-bold text-black uppercase tracking-widest">自訂</span>
                </div>
              </div>
              <div style={{ backgroundColor: lightTheme.accent }} className="w-12 h-12 text-black rounded-2xl flex items-center justify-center group-active:scale-90 transition-all shadow-sm">
                <ChevronRight className="w-6 h-6 stroke-[3]" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};