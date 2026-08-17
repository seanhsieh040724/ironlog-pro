import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AppContext } from '../App';
import { RoutineTemplate, MuscleGroup, ExerciseEntry, SetEntry, WorkoutSession } from '../types';
import { ExerciseSmallGif } from './ExerciseSmallGif';
import { getMuscleGroup, getMuscleGroupDisplay, fetchExerciseGif, getExerciseMethod, getExerciseGifUrl } from '../utils/fitnessMath';
import { ORGANIZED_EXERCISES, EXERCISE_DATABASE } from './WorkoutView';
import { 
  LayoutGrid, Trash2, ArrowLeft, Plus, ChevronRight, X, Search, Edit2, 
  Check, BookOpen, ChevronLeft, Zap, Play, Save, 
  Target, PlusCircle, MinusCircle, Loader2, Timer, PlusSquare,
  PlayCircle, Clock, ChevronUp, ChevronDown, ShieldCheck, Flame, Dumbbell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { lightTheme } from '../themeStyles';

const getHardcodedGif = (n: string) => {
  if (!n) return null;
  return getExerciseGifUrl(n);
};

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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-48">
      <div className="flex items-center gap-4 px-1 sticky top-0 z-[60] bg-white/95 backdrop-blur-xl py-4 border-b border-black/5">
        <button 
          onClick={() => { if(timerStartedAt && !confirm('訓練正在計時中，確定要離開嗎？')) return; onClose(); }} 
          style={{ backgroundColor: '#CCFF00' }} 
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-black active:scale-90 transition-all shadow-sm border border-black/10"
        >
          <ArrowLeft className="w-6 h-6 stroke-[3]" />
        </button>
        <div className="flex-1 overflow-hidden">
          <h2 style={{ color: lightTheme.text }} className="text-2xl font-black tracking-tight uppercase leading-tight py-0.5">{routine.name}</h2>
          <span className="inline-block text-[10px] font-black text-black bg-[#CCFF00] px-2 py-0.5 rounded uppercase tracking-wider mt-0.5">整合訓練模式</span>
        </div>
      </div>

      <div className="space-y-16">
        {sessionExercises.map((ex, exIdx) => (
          <div key={ex.id} className="space-y-6">
            <div className="flex items-center gap-4 px-1">
               <div style={{ backgroundColor: '#CCFF00' }} className="w-12 h-12 rounded-2xl flex items-center justify-center text-black font-black text-xl border border-black/10 shrink-0 shadow-xs">#{exIdx + 1}</div>
               <div className="flex-1 min-w-0 flex items-center gap-3">
                 <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center border border-black/5">
                   <ExerciseSmallGif name={ex.name} />
                 </div>
                 <h3 style={{ color: lightTheme.text }} className="text-xl font-black uppercase tracking-tight leading-tight py-1">{ex.name}</h3>
               </div>
            </div>

            <div style={{ backgroundColor: lightTheme.card }} className="mx-1 p-5 rounded-[28px] border border-black/5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2.5 text-black">
                <BookOpen className="w-5 h-5" />
                <h3 className="text-[12px] font-black uppercase tracking-widest">動作說明</h3>
              </div>
              <p className="text-sm font-medium text-black leading-relaxed whitespace-pre-line">
                {getExerciseMethod(ex.name)}
              </p>
            </div>

            <div className="space-y-4 px-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-black" />
                    <h3 style={{ color: lightTheme.text }} className="text-xs font-black uppercase tracking-wider">訓練組數</h3>
                  </div>
                  {timerStartedAt && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/5 border border-black/10 rounded-lg">
                      <Timer className="w-3.5 h-3.5 animate-pulse text-black" />
                      <span className="text-[11px] font-black font-sans text-black">{elapsedTime}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {!timerStartedAt && (
                    <button onClick={startWorkoutTimer} className="flex items-center gap-1.5 text-black text-[11px] font-black uppercase group">
                      <PlayCircle className="w-4 h-4 fill-current group-active:scale-90 transition-transform" /> 開始計時
                    </button>
                  )}
                  <button onClick={() => addSetToEx(exIdx)} className="flex items-center gap-1 text-black text-[11px] font-black uppercase">
                    <PlusCircle className="w-4 h-4" /> 加一組
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {ex.sets.map((set, sIdx) => (
                  <div key={set.id} className={`grid grid-cols-12 gap-1 sm:gap-2.5 items-center p-2.5 sm:p-3.5 rounded-[24px] border transition-all ${set.completed ? 'bg-[#CCFF00] border-black shadow-xs' : 'bg-white border-black/5 shadow-sm'}`}>
                    <div className="col-span-1 flex justify-center">
                      <button onClick={() => removeSetFromEx(exIdx, set.id)} className="text-black p-1 active:text-red-500">
                        <MinusCircle className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="col-span-1 text-base font-black text-black text-center">{sIdx + 1}</div>
                    
                    <div className="col-span-4 flex items-center justify-center gap-1 sm:gap-2">
                      <input 
                        type="number" 
                        value={set.weight || ''} 
                        placeholder="0" 
                        onChange={e => updateSetData(exIdx, set.id, { weight: Number(e.target.value) }, sIdx)} 
                        style={{ color: '#000000' }}
                        className="w-[44px] sm:w-[50px] bg-slate-100 rounded-xl py-2 text-center text-[16px] sm:text-[18px] font-black outline-none border border-black/5 focus:border-black/20 transition-all shadow-inner [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] appearance-none px-0.5" 
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
                        className="w-[38px] sm:w-[46px] bg-slate-100 rounded-xl py-2 text-center text-[16px] sm:text-[18px] font-black outline-none border border-black/5 focus:border-black/20 transition-all shadow-inner [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] appearance-none px-0.5" 
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
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 border shadow-xs ${set.completed ? 'bg-[#CCFF00] border-black text-black' : 'bg-slate-50 border-black/5 text-black'}`}
                      >
                        <Check className="w-6 h-6 stroke-[3.5]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-[105px] left-0 right-0 z-[70] px-6 max-w-md mx-auto">
         <button 
           onClick={handleSaveWorkout} 
           style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
           className="w-full font-black h-14 rounded-2xl uppercase text-base active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 tracking-tight"
         >
           <Save className="w-5 h-5 stroke-[2.5]" style={{ color: '#CCFF00' }} /> 儲存訓練紀錄
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
  
  // 參考 IMG_9161.PNG 的狀態：每週天數 (2, 3, 4, 5), 性別 (男/女), 新手安全模式 (開關)
  const [weeklyDays, setWeeklyDays] = useState<number>(2);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [safetyMode, setSafetyMode] = useState<boolean>(true);

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
        <div className="flex items-center gap-4 px-1">
          <button 
            onClick={() => setPreviewRoutine(null)} 
            style={{ backgroundColor: '#CCFF00' }} 
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-black active:scale-90 transition-all shadow-sm border border-black/10"
          >
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
                <h2 style={{ color: lightTheme.text }} className="text-xl font-black tracking-tight uppercase leading-tight py-1">{previewRoutine.name}</h2>
                {isCustom && <button onClick={() => { setTempName(previewRoutine.name); setIsEditingName(true); }} className="p-2 bg-slate-100 rounded-lg text-black"><Edit2 className="w-4 h-4" /></button>}
              </div>
            )}
          </div>
          {isCustom && <button onClick={() => deleteRoutine(previewRoutine.id)} className="w-11 h-11 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center border border-red-100 active:scale-90 transition-all"><Trash2 className="w-5 h-5" /></button>}
        </div>
        
        <div className="space-y-3.5">
          {previewRoutine.exercises.map((ex, idx) => (
            <div key={ex.id} style={{ backgroundColor: lightTheme.card }} className="rounded-[28px] p-4 border border-black/5 flex items-center justify-between group shadow-sm">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <span className="w-7 h-7 rounded-xl bg-black text-[#CCFF00] font-black text-xs flex items-center justify-center shrink-0">{idx + 1}</span>
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center border border-black/5">
                  <ExerciseSmallGif name={ex.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 style={{ color: lightTheme.text }} className="font-black text-base uppercase tracking-tight pr-2 leading-tight py-0.5">{ex.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-black text-black uppercase tracking-wider">{getMuscleGroupDisplay(ex.muscleGroup).cn}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[11px] font-bold text-stone-500 uppercase">{ex.defaultSets} 組 x {ex.defaultReps} 次</span>
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
          <button 
            onClick={() => { setIsAddingExercise(true); setSearchTerm(''); }} 
            style={{ backgroundColor: '#CCFF00' }} 
            className="w-full py-4 border border-black/10 rounded-2xl text-[13px] font-black uppercase text-black flex items-center justify-center gap-2.5 active:scale-95 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> 新增動作項目
          </button>
        )}
        
        <div className="fixed bottom-[105px] left-0 right-0 z-50 flex flex-col gap-3 px-6 max-w-md mx-auto">
          <button 
            onClick={() => handleEnterIntegratedMode(previewRoutine)} 
            style={{ backgroundColor: '#CCFF00', color: '#000000' }}
            className="w-full font-black h-14 rounded-2xl uppercase tracking-tight text-base shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all border border-black/10"
          >
            套用並開始訓練 <ChevronRight className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        <AnimatePresence>
          {isAddingExercise && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => { setIsAddingExercise(false); setSelectedExName(null); }} />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative w-full max-w-md bg-white rounded-t-[40px] p-6 pb-12 border-t border-black/5 shadow-2xl safe-bottom max-h-[90vh] overflow-hidden flex flex-col">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 shrink-0" />
                <div className="flex justify-between items-center mb-5 shrink-0">
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    {selectedExName ? (
                      <>
                        <button onClick={() => setSelectedExName(null)} className="p-2 -ml-2 active:scale-90 transition-all shrink-0">
                          <ChevronLeft className="w-7 h-7 text-black stroke-[3.5]" />
                        </button>
                        <h2 style={{ color: lightTheme.text }} className="text-xl font-black uppercase leading-tight py-1">
                          {selectedExName}
                        </h2>
                      </>
                    ) : (
                      <h3 style={{ color: lightTheme.text }} className="text-xl font-black uppercase pr-2">選取項目</h3>
                    )}
                  </div>
                  <button onClick={() => { setIsAddingExercise(false); setSelectedExName(null); }} style={{ backgroundColor: lightTheme.card }} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-black border border-black/5 active:scale-90"><X className="w-6 h-6" /></button>
                </div>

                <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                  {!selectedExName ? (
                    <>
                      <div style={{ backgroundColor: lightTheme.card }} className="flex items-center gap-3 border border-black/5 rounded-2xl px-4 py-3 shadow-inner shrink-0">
                        <Search className="w-5 h-5 text-black" />
                        <input 
                          placeholder="搜尋動作庫..." 
                          value={searchTerm} 
                          onChange={e => setSearchTerm(e.target.value)} 
                          className="bg-transparent w-full text-base font-black outline-none placeholder:text-stone-400" 
                          style={{ color: lightTheme.text }}
                        />
                      </div>

                      {!searchTerm && (
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 shrink-0">
                          {Object.keys(ORGANIZED_EXERCISES).map(cat => (
                            <button 
                              key={cat} 
                              onClick={() => setActiveCategory(cat)} 
                              className={`shrink-0 px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all border ${activeCategory === cat ? 'bg-[#CCFF00] text-black border-black shadow-xs' : 'bg-slate-50 text-stone-600 border-black/5'}`}
                            >
                              {getMuscleGroupDisplay(cat as MuscleGroup).cn}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-12">
                        <div className="grid grid-cols-1 gap-2.5">
                          {searchTerm.trim() && !isExactMatch && (
                            <motion.button 
                              whileTap={{ scale: 0.95 }} 
                              onClick={() => setSelectedExName(searchTerm.trim())} 
                              style={{ backgroundColor: lightTheme.card }}
                              className="p-4 rounded-[22px] border border-black/5 flex items-center justify-between group shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div style={{ backgroundColor: '#CCFF00' }} className="w-10 h-10 rounded-xl flex items-center justify-center text-black shadow-xs">
                                  <PlusSquare className="w-5 h-5" />
                                </div>
                                <div className="text-left overflow-hidden">
                                  <div className="text-[11px] font-black uppercase tracking-wider text-stone-500">建立自訂動作</div>
                                  <div style={{ color: lightTheme.text }} className="text-base font-black uppercase leading-tight mt-0.5">{searchTerm}</div>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-black stroke-[3]" />
                            </motion.button>
                          )}

                          {filteredExercises.map(exName => (
                            <button 
                              key={exName} 
                              onClick={() => setSelectedExName(exName)} 
                              style={{ backgroundColor: lightTheme.card }} 
                              className="p-3 rounded-[22px] text-left border border-black/5 flex items-center gap-3.5 active:border-black/20 group transition-all shadow-sm"
                            >
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center border border-black/5">
                                <ExerciseSmallGif name={exName} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div style={{ color: lightTheme.text }} className="text-base font-black uppercase leading-tight">{exName}</div>
                                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mt-1 flex items-center justify-between">
                                  {getMuscleGroupDisplay(getMuscleGroup(exName)).cn}
                                  <Plus className="w-4 h-4 text-black stroke-[3] opacity-0 group-active:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-28">
                      <div className="w-full relative px-1">
                        <ExerciseGifDisplay name={selectedExName} />
                      </div>

                      <div style={{ backgroundColor: lightTheme.card }} className="mx-1 p-5 rounded-[24px] border border-black/5 space-y-2.5 shadow-sm">
                        <div className="flex items-center gap-2 text-black">
                          <BookOpen className="w-4 h-4" />
                          <h3 className="text-[11px] font-black uppercase tracking-wider">動作說明</h3>
                        </div>
                        <p className="text-sm font-medium text-black leading-relaxed whitespace-pre-line">
                          {getExerciseMethod(selectedExName)}
                        </p>
                      </div>

                      <div className="space-y-4 px-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-black">
                            <Target className="w-4 h-4" />
                            <h3 style={{ color: lightTheme.text }} className="text-xs font-black uppercase tracking-wider">設定組數</h3>
                          </div>
                          <button onClick={() => setMockSets([...mockSets, { id: crypto.randomUUID(), weight: mockSets[mockSets.length-1]?.weight || 0, reps: mockSets[mockSets.length-1]?.reps || 10, completed: false }])} className="flex items-center gap-1 text-black text-[11px] font-black uppercase">
                            <PlusCircle className="w-4 h-4" /> 加一組
                          </button>
                        </div>

                        <div className="space-y-3">
                          {mockSets.map((set, index) => (
                            <div key={set.id} className={`grid grid-cols-12 gap-1 sm:gap-2.5 items-center p-2.5 rounded-[22px] border transition-all ${set.completed ? 'bg-[#CCFF00] border-black shadow-xs' : 'bg-white border-black/5 shadow-sm'}`}>
                              <div className="col-span-1 flex justify-center">
                                <button onClick={() => setMockSets(mockSets.filter(s => s.id !== set.id))} className="text-black p-1 active:text-red-500">
                                  <MinusCircle className="w-5 h-5" />
                                </button>
                              </div>
                              <div className="col-span-1 text-base font-black text-black text-center">{index + 1}</div>
                              
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
                                  className="w-[44px] sm:w-[50px] bg-slate-100 rounded-xl py-2 text-center text-[16px] font-black outline-none border border-black/5 focus:border-black/20 transition-all shadow-inner [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] appearance-none px-0.5" 
                                />
                                <span className="text-[10px] font-black text-black uppercase shrink-0">kg</span>
                              </div>

                              <div className="col-span-4 flex items-center justify-center gap-1 sm:gap-1.5">
                                <input 
                                  type="number" 
                                  value={set.reps || ''} 
                                  placeholder="0" 
                                  onChange={e => setMockSets(mockSets.map(s => s.id === set.id ? { ...s, reps: Number(e.target.value) } : s))} 
                                  style={{ color: '#000000' }}
                                  className="w-[38px] sm:w-[46px] bg-slate-100 rounded-xl py-2 text-center text-[16px] font-black outline-none border border-black/5 focus:border-black/20 transition-all shadow-inner [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] appearance-none px-0.5" 
                                />
                                <div className="flex flex-col justify-center items-center gap-0.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setMockSets(mockSets.map(s => s.id === set.id ? { ...s, reps: (s.reps || 0) + 1 } : s))}
                                    className="w-4 h-4 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 rounded flex items-center justify-center text-black transition-all active:scale-90"
                                    title="加1次"
                                  >
                                    <ChevronUp className="w-3 h-3 stroke-[3]" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setMockSets(mockSets.map(s => s.id === set.id ? { ...s, reps: Math.max(0, (s.reps || 0) - 1) } : s))}
                                    className="w-4 h-4 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 rounded flex items-center justify-center text-black transition-all active:scale-90"
                                    title="減1次"
                                  >
                                    <ChevronDown className="w-3 h-3 stroke-[3]" />
                                  </button>
                                </div>
                                <span className="text-[10px] font-black text-black uppercase shrink-0">rep</span>
                              </div>

                              <div className="col-span-2 flex justify-end">
                                <button 
                                  onClick={() => setMockSets(mockSets.map(s => s.id === set.id ? { ...s, completed: !s.completed } : s))} 
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 border shadow-xs ${set.completed ? 'bg-[#CCFF00] border-black text-black' : 'bg-slate-50 border-black/5 text-black'}`}
                                >
                                  <Check className="w-5 h-5 stroke-[3.5]" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="fixed bottom-8 left-0 right-0 z-50 px-6 max-w-md mx-auto">
                        <button onClick={addExerciseToTemplate} style={{ backgroundColor: '#CCFF00', color: '#000000' }} className="w-full font-black h-14 rounded-2xl uppercase text-base active:scale-95 shadow-xl flex items-center justify-center gap-3 transition-all border border-black/10">
                          <Check className="w-5 h-5 stroke-[3]" /> 確認並加入課表
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

  // 依據「性別」與「新手安全模式 (器械為主)」動態產生對應課表
  const GENERATED_ROUTINES = useMemo(() => {
    // 1. 男士 + 新手安全模式 (器械/固定軌道為主)
    const maleSafe: Record<number, { title: string; desc: string; englishTag: string; days: (RoutineTemplate & { subTitle?: string; durationMinutes?: number })[] }> = {
      2: {
        title: '2 日器械分化 · 上肢/下肢安全模式',
        desc: '專為男士初學者設計，全面採用固定器械與滑輪。Day 1 強化胸背推拉，Day 2 穩固下肢與核心。動作路徑固定、安全高效。',
        englishTag: '2 Days Machine Split',
        days: [
          {
            id: 'm-safe-2-d1',
            name: 'Day 1: 上肢器械安全推拉',
            subTitle: 'Upper Body Machine Focus',
            durationMinutes: 45,
            exercises: [
              { id: 'm-s2-e1', name: '坐姿器械胸推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s2-e2', name: '分動器械下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s2-e3', name: '蝴蝶機夾胸', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s2-e4', name: '繩索下壓', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-safe-2-d2',
            name: 'Day 2: 下肢器械與核心防護',
            subTitle: 'Lower Body Machine & Core',
            durationMinutes: 45,
            exercises: [
              { id: 'm-s2-e5', name: '水平器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s2-e6', name: '坐姿腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s2-e7', name: '器械站姿提踵', muscleGroup: 'quads', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'm-s2-e8', name: '器械捲腹', muscleGroup: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          }
        ]
      },
      3: {
        title: '3 日器械分化 · 推拉腿循環',
        desc: '經典 Push/Pull/Legs 三分化。以固定器械取代自由槓鈴，精準孤立發力，降低下背與關節壓力。',
        englishTag: 'PPL Machine Split',
        days: [
          {
            id: 'm-safe-3-d1',
            name: 'Day 1: 器械推部 (胸/肩/三頭)',
            subTitle: 'Machine Push Focus',
            durationMinutes: 45,
            exercises: [
              { id: 'm-s3-e1', name: '坐姿器械胸推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s3-e2', name: '器械肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s3-e3', name: '蝴蝶機夾胸', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s3-e4', name: '繩索下壓', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-safe-3-d2',
            name: 'Day 2: 器械拉部 (背/後肩/二頭)',
            subTitle: 'Machine Pull Focus',
            durationMinutes: 45,
            exercises: [
              { id: 'm-s3-e5', name: '分動器械下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s3-e6', name: '坐姿器械划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s3-e7', name: '滑輪直臂下拉', muscleGroup: 'back', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s3-e8', name: 'cable直槓彎舉', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-safe-3-d3',
            name: 'Day 3: 下肢器械 (腿/臀/核心)',
            subTitle: 'Machine Legs & Core',
            durationMinutes: 45,
            exercises: [
              { id: 'm-s3-e9', name: '水平器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s3-e10', name: '坐姿腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s3-e11', name: '器械腿外展', muscleGroup: 'quads', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'm-s3-e12', name: '器械捲腹', muscleGroup: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          }
        ]
      },
      4: {
        title: '4 日器械分化 · 上下肢雙循環',
        desc: '適合每週可練 4 天的男士。上下肢兩輪循環，全器械安全軌道，最大化肌肉肥大並兼顧關節健康。',
        englishTag: 'Upper Lower Machine Split',
        days: [
          {
            id: 'm-safe-4-d1',
            name: 'Day 1: 上肢器械 A (胸/背寬度)',
            subTitle: 'Machine Upper Body A',
            durationMinutes: 50,
            exercises: [
              { id: 'm-s4-e1', name: '坐姿器械胸推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s4-e2', name: '分動器械下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s4-e3', name: '器械肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s4-e4', name: '繩索下壓', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-safe-4-d2',
            name: 'Day 2: 下肢器械 A (腿推/腿後/核心)',
            subTitle: 'Machine Lower Body A',
            durationMinutes: 50,
            exercises: [
              { id: 'm-s4-e5', name: '水平器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s4-e6', name: '坐姿腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s4-e7', name: '器械腿外展', muscleGroup: 'quads', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'm-s4-e8', name: '器械捲腹', muscleGroup: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-safe-4-d3',
            name: 'Day 3: 上肢器械 B (上胸/背厚/手臂)',
            subTitle: 'Machine Upper Body B',
            durationMinutes: 50,
            exercises: [
              { id: 'm-s4-e9', name: '上斜器械胸推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s4-e10', name: '坐姿器械划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s4-e11', name: '蝴蝶機夾胸', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s4-e12', name: 'cable直槓彎舉', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-safe-4-d4',
            name: 'Day 4: 下肢器械 B (上斜腿推/小腿/核心)',
            subTitle: 'Machine Lower Body B',
            durationMinutes: 50,
            exercises: [
              { id: 'm-s4-e13', name: '上斜器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s4-e14', name: '俯臥腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s4-e15', name: '器械站姿提踵', muscleGroup: 'quads', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'm-s4-e16', name: 'cable跪姿捲腹', muscleGroup: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          }
        ]
      },
      5: {
        title: '5 日器械分化 · 部位極致雕琢',
        desc: '胸、背、肩、腿、手臂每天專注一個肌群。全器械高安全係數，帶來最飽滿的肌肉充血泵感。',
        englishTag: '5 Days Machine Focus',
        days: [
          {
            id: 'm-safe-5-d1',
            name: 'Day 1: 胸肌器械雕琢 (上中胸與夾胸)',
            subTitle: 'Chest Machine Sculpt',
            durationMinutes: 50,
            exercises: [
              { id: 'm-s5-e1', name: '坐姿器械胸推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s5-e2', name: '上斜器械胸推', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s5-e3', name: '蝴蝶機夾胸', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-safe-5-d2',
            name: 'Day 2: 背部器械寬度 (高位下拉/划船)',
            subTitle: 'Back Machine Width & Thickness',
            durationMinutes: 50,
            exercises: [
              { id: 'm-s5-e4', name: '分動器械下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s5-e5', name: '坐姿器械划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s5-e6', name: '滑輪直臂下拉', muscleGroup: 'back', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-safe-5-d3',
            name: 'Day 3: 肩部器械立體 (肩推/側平舉/面拉)',
            subTitle: 'Shoulder Machine 3D',
            durationMinutes: 50,
            exercises: [
              { id: 'm-s5-e7', name: '器械肩推', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s5-e8', name: '器械側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s5-e9', name: '繩索面拉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-safe-5-d4',
            name: 'Day 4: 下肢器械安全 (腿推/腿後/提踵)',
            subTitle: 'Legs Machine Safety',
            durationMinutes: 50,
            exercises: [
              { id: 'm-s5-e10', name: '水平器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s5-e11', name: '坐姿腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s5-e12', name: '器械站姿提踵', muscleGroup: 'quads', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-safe-5-d5',
            name: 'Day 5: 手臂器械孤立 (二頭/三頭泵感)',
            subTitle: 'Arms Cable & Machine Focus',
            durationMinutes: 45,
            exercises: [
              { id: 'm-s5-e13', name: '器械牧師彎舉', muscleGroup: 'arms', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s5-e14', name: '繩索下壓', muscleGroup: 'arms', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s5-e15', name: '反手直桿下壓', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          }
        ]
      }
    };

    // 2. 男士 + 自由重量/進階力量 (安全模式關閉)
    const maleFree: Record<number, { title: string; desc: string; englishTag: string; days: (RoutineTemplate & { subTitle?: string; durationMinutes?: number })[] }> = {
      2: {
        title: '2 日自由分化 · 槓鈴複合力量',
        desc: '專為追求全身爆發力與厚度的男士設計。以槓鈴臥推、深蹲、硬舉等大重量動作為核心，效率最高。',
        englishTag: '2 Days Free Weights',
        days: [
          {
            id: 'm-free-2-d1',
            name: 'Day 1: 全身上肢力量拉推',
            subTitle: 'Upper Body Compound A',
            durationMinutes: 45,
            exercises: [
              { id: 'm-f2-e1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f2-e2', name: '引體向上', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f2-e3', name: '坐姿啞鈴肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f2-e4', name: '槓鈴彎舉', muscleGroup: 'arms', defaultSets: 3, defaultReps: 10, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-free-2-d2',
            name: 'Day 2: 全身下肢深蹲與硬舉',
            subTitle: 'Lower Body Compound A',
            durationMinutes: 45,
            exercises: [
              { id: 'm-f2-e5', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f2-e6', name: '傳統硬舉', muscleGroup: 'back', defaultSets: 3, defaultReps: 6, defaultWeight: 0 },
              { id: 'm-f2-e7', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f2-e8', name: '棒式', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 0 }
            ]
          }
        ]
      },
      3: {
        title: '3 日自由分化 · 經典推拉腿 PPL',
        desc: '健美經典推拉腿模式。Day 1 臥推與推舉，Day 2 槓鈴划船與引體向上，Day 3 槓鈴深蹲與硬舉。力量與體積兼備。',
        englishTag: 'Classic Push Pull Legs',
        days: [
          {
            id: 'm-free-3-d1',
            name: 'Day 1: 自由推部力量 (胸/肩/三頭)',
            subTitle: 'Push Strength Focus',
            durationMinutes: 45,
            exercises: [
              { id: 'm-f3-e1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f3-e2', name: '站姿槓鈴肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f3-e3', name: '啞鈴上斜臥推', muscleGroup: 'chest', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f3-e4', name: '雙槓撐體', muscleGroup: 'chest', defaultSets: 3, defaultReps: 10, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-free-3-d2',
            name: 'Day 2: 自由拉部厚度 (背/後肩/二頭)',
            subTitle: 'Pull Thickness Focus',
            durationMinutes: 45,
            exercises: [
              { id: 'm-f3-e5', name: '槓鈴划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f3-e6', name: '引體向上', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f3-e7', name: '單臂啞鈴划船', muscleGroup: 'back', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f3-e8', name: '槓鈴彎舉', muscleGroup: 'arms', defaultSets: 3, defaultReps: 10, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-free-3-d3',
            name: 'Day 3: 下肢深蹲硬舉爆發 (腿/臀/核心)',
            subTitle: 'Legs & Glutes Power',
            durationMinutes: 45,
            exercises: [
              { id: 'm-f3-e9', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f3-e10', name: '傳統硬舉', muscleGroup: 'back', defaultSets: 3, defaultReps: 6, defaultWeight: 0 },
              { id: 'm-f3-e11', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f3-e12', name: '保加利亞啞鈴分腿蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 }
            ]
          }
        ]
      },
      4: {
        title: '4 日自由分化 · 上下肢力量與肌肥大',
        desc: '中高階男士重訓首選。A天專注大重量神經募集，B天專注啞鈴與容量肌肥大。',
        englishTag: 'Upper Lower Heavy Split',
        days: [
          {
            id: 'm-free-4-d1',
            name: 'Day 1: 上肢力量 A (槓鈴臥推/引體/肩推)',
            subTitle: 'Upper Heavy Strength',
            durationMinutes: 50,
            exercises: [
              { id: 'm-f4-e1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f4-e2', name: '引體向上', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f4-e3', name: '坐姿啞鈴肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f4-e4', name: '站姿繩索夾胸', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-free-4-d2',
            name: 'Day 2: 下肢力量 A (大重量深蹲/硬舉)',
            subTitle: 'Lower Heavy Strength',
            durationMinutes: 50,
            exercises: [
              { id: 'm-f4-e5', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f4-e6', name: '傳統硬舉', muscleGroup: 'back', defaultSets: 3, defaultReps: 6, defaultWeight: 0 },
              { id: 'm-f4-e7', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f4-e8', name: '羅馬椅抬腿', muscleGroup: 'core', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-free-4-d3',
            name: 'Day 3: 上肢肥大 B (啞鈴推拉/側平舉/手臂)',
            subTitle: 'Upper Hypertrophy B',
            durationMinutes: 50,
            exercises: [
              { id: 'm-f4-e9', name: '啞鈴平板臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f4-e10', name: '槓鈴划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f4-e11', name: '啞鈴側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-f4-e12', name: '啞鈴交替彎舉', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-free-4-d4',
            name: 'Day 4: 下肢肥大 B (六角槓硬舉/分腿蹲/高腳杯)',
            subTitle: 'Lower Hypertrophy B',
            durationMinutes: 50,
            exercises: [
              { id: 'm-f4-e13', name: '六角槓硬舉', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f4-e14', name: '保加利亞啞鈴分腿蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f4-e15', name: '啞鈴高腳杯蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-f4-e16', name: '懸垂抬腿', muscleGroup: 'core', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          }
        ]
      },
      5: {
        title: '5 日自由分化 · 頂級重訓分化',
        desc: '高容積、高強度的黃金五日分化。槓鈴與啞鈴極致刺激，鍛造完美倒三角與強大力量。',
        englishTag: '5 Days Pro Split',
        days: [
          {
            id: 'm-free-5-d1',
            name: 'Day 1: 胸部極限厚度 (槓鈴臥推/啞鈴斜推)',
            subTitle: 'Chest Heavy Focus',
            durationMinutes: 50,
            exercises: [
              { id: 'm-f5-e1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f5-e2', name: '啞鈴上斜臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f5-e3', name: '雙槓撐體', muscleGroup: 'chest', defaultSets: 3, defaultReps: 10, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-free-5-d2',
            name: 'Day 2: 倒三角背部厚度 (槓鈴划船/硬舉/引體)',
            subTitle: 'Back Width & Thickness',
            durationMinutes: 50,
            exercises: [
              { id: 'm-f5-e4', name: '槓鈴划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f5-e5', name: '引體向上', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f5-e6', name: '傳統硬舉', muscleGroup: 'back', defaultSets: 3, defaultReps: 6, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-free-5-d3',
            name: 'Day 3: 虎頭肩立體雕刻 (站姿槓推/側平舉)',
            subTitle: 'Shoulder Cannonball 3D',
            durationMinutes: 50,
            exercises: [
              { id: 'm-f5-e7', name: '站姿槓鈴肩推', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f5-e8', name: '啞鈴側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-f5-e9', name: '俯身啞鈴反向飛鳥', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-free-5-d4',
            name: 'Day 4: 下肢核心鋼鐵深蹲 (深蹲/臀推/分腿蹲)',
            subTitle: 'Legs Power Heavy',
            durationMinutes: 50,
            exercises: [
              { id: 'm-f5-e10', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f5-e11', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f5-e12', name: '保加利亞啞鈴分腿蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-free-5-d5',
            name: 'Day 5: 手臂線條與維度 (二頭/三頭窄推)',
            subTitle: 'Arms Big Gun Blast',
            durationMinutes: 45,
            exercises: [
              { id: 'm-f5-e13', name: '槓鈴彎舉', muscleGroup: 'arms', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f5-e14', name: '窄握槓鈴臥推', muscleGroup: 'arms', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f5-e15', name: '站姿啞鈴錘式彎舉', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          }
        ]
      }
    };

    // 3. 女士 + 新手安全模式 (器械為主，蜜桃臀雕塑、直角肩、緊緻美背與核心)
    const femaleSafe: Record<number, { title: string; desc: string; englishTag: string; days: (RoutineTemplate & { subTitle?: string; durationMinutes?: number })[] }> = {
      2: {
        title: '2 日蜜桃美背 · 女士安全器械',
        desc: '專為女性設計的低負擔雕塑課表。高比例臀腿與美背器械，精準刺激臀大肌與臀中肌，不傷膝蓋與腰椎。',
        englishTag: '2 Days Glutes & Tone Machine',
        days: [
          {
            id: 'f-safe-2-d1',
            name: 'Day 1: 蜜桃臀雕塑與緊緻美背',
            subTitle: 'Glutes & Back Machine',
            durationMinutes: 45,
            exercises: [
              { id: 'f-s2-e1', name: '器械腿外展', muscleGroup: 'quads', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s2-e2', name: '分動器械下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s2-e3', name: '水平器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s2-e4', name: '器械捲腹', muscleGroup: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-safe-2-d2',
            name: 'Day 2: 直角肩線條與臀腿塑形',
            subTitle: 'Shoulder Tone & Lower Machine',
            durationMinutes: 45,
            exercises: [
              { id: 'f-s2-e5', name: '坐姿器械划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s2-e6', name: '坐姿腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s2-e7', name: '站姿繩索夾胸', muscleGroup: 'chest', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s2-e8', name: '側棒式', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 0 }
            ]
          }
        ]
      },
      3: {
        title: '3 日女性分化 · 蜜桃臀/天鵝背/直角肩',
        desc: '深受女性喜愛的專屬三分化。Day 1 臀腿極致塑形，Day 2 優雅天鵝背與直角肩，Day 3 全身燃脂緊緻。',
        englishTag: 'Glutes Upper Fullbody Machine',
        days: [
          {
            id: 'f-safe-3-d1',
            name: 'Day 1: 蜜桃臀極致塑形 (腿外展/腿推/腿後)',
            subTitle: 'Peach Glutes Focus',
            durationMinutes: 45,
            exercises: [
              { id: 'f-s3-e1', name: '器械腿外展', muscleGroup: 'quads', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s3-e2', name: '水平器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s3-e3', name: '坐姿腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s3-e4', name: '器械捲腹', muscleGroup: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-safe-3-d2',
            name: 'Day 2: 優雅美背與直角肩 (下拉/划船/面拉)',
            subTitle: 'Back & Shoulder Tone',
            durationMinutes: 45,
            exercises: [
              { id: 'f-s3-e5', name: '分動器械下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s3-e6', name: '坐姿器械划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s3-e7', name: '繩索面拉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s3-e8', name: '繩索單邊側平舉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-safe-3-d3',
            name: 'Day 3: 全身燃脂與緊緻線條 (上斜腿推/胸/核心)',
            subTitle: 'Fullbody Tighten & Core',
            durationMinutes: 45,
            exercises: [
              { id: 'f-s3-e9', name: '上斜器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s3-e10', name: '俯臥腿後勾', muscleGroup: 'hamstrings', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s3-e11', name: '坐姿器械胸推', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s3-e12', name: '棒式', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 0 }
            ]
          }
        ]
      },
      4: {
        title: '4 日女性分化 · 臀腿與美背雙循環',
        desc: '兩天專屬臀腿塑形 + 兩天美背肩頸線條。極低下背負擔，全面緊緻全身曲線。',
        englishTag: '4 Days Female Tone Machine',
        days: [
          {
            id: 'f-safe-4-d1',
            name: 'Day 1: 臀部飽滿專項 A (外展/腿推/腹肌)',
            subTitle: 'Glute Isolation & Tone A',
            durationMinutes: 50,
            exercises: [
              { id: 'f-s4-e1', name: '器械腿外展', muscleGroup: 'quads', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s4-e2', name: '水平器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s4-e3', name: '坐姿腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s4-e4', name: '器械捲腹', muscleGroup: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-safe-4-d2',
            name: 'Day 2: 天鵝美背與直角肩 A (下拉/划船/肩推)',
            subTitle: 'Upper Back & Posture A',
            durationMinutes: 50,
            exercises: [
              { id: 'f-s4-e5', name: '分動器械下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s4-e6', name: '坐姿器械划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s4-e7', name: '器械肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s4-e8', name: '繩索面拉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-safe-4-d3',
            name: 'Day 3: 大腿內外側與蜜桃臀 B (腿推/內收/後勾)',
            subTitle: 'Thighs & Glutes Shape B',
            durationMinutes: 50,
            exercises: [
              { id: 'f-s4-e9', name: '上斜器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s4-e10', name: '俯臥腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s4-e11', name: '器械腿內收', muscleGroup: 'quads', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s4-e12', name: '側棒式', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-safe-4-d4',
            name: 'Day 4: 上肢胸背緊緻 B (繩索夾胸/直臂/側平舉)',
            subTitle: 'Upper Sculpt & Core B',
            durationMinutes: 50,
            exercises: [
              { id: 'f-s4-e13', name: '站姿繩索夾胸', muscleGroup: 'chest', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s4-e14', name: '滑輪直臂下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s4-e15', name: '繩索單邊側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s4-e16', name: 'cable跪姿捲腹', muscleGroup: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          }
        ]
      },
      5: {
        title: '5 日女性分化 · 精緻部位極致雕琢',
        desc: '臀、背、肩、腿、核心獨立分化。器械軌道安全不傷關節，打造零死角體態。',
        englishTag: '5 Days Goddess Machine Plan',
        days: [
          {
            id: 'f-safe-5-d1',
            name: 'Day 1: 蜜桃臀飽滿雕刻 (器械外展/水平腿推/後勾)',
            subTitle: 'Glute Peak Machine',
            durationMinutes: 50,
            exercises: [
              { id: 'f-s5-e1', name: '器械腿外展', muscleGroup: 'quads', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s5-e2', name: '水平器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s5-e3', name: '坐姿腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-safe-5-d2',
            name: 'Day 2: 天鵝美背線條 (器械下拉/划船/直臂)',
            subTitle: 'Swan Back Tone',
            durationMinutes: 50,
            exercises: [
              { id: 'f-s5-e4', name: '分動器械下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s5-e5', name: '坐姿器械划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s5-e6', name: '滑輪直臂下拉', muscleGroup: 'back', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-safe-5-d3',
            name: 'Day 3: 直角肩與手臂線條 (器械肩推/側平舉/面拉)',
            subTitle: 'Shoulder & Arm Tone',
            durationMinutes: 50,
            exercises: [
              { id: 'f-s5-e7', name: '器械肩推', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s5-e8', name: '器械側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s5-e9', name: '繩索面拉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-safe-5-d4',
            name: 'Day 4: 大腿緊緻與腿縫雕刻 (上斜腿推/腿後/內收)',
            subTitle: 'Thigh Tightening & Shape',
            durationMinutes: 50,
            exercises: [
              { id: 'f-s5-e10', name: '上斜器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s5-e11', name: '俯臥腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s5-e12', name: '器械腿內收', muscleGroup: 'quads', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-safe-5-d5',
            name: 'Day 5: 核心小蠻腰 (器械捲腹/cable捲腹/棒式)',
            subTitle: 'Waist & Core Sculpt',
            durationMinutes: 45,
            exercises: [
              { id: 'f-s5-e13', name: '器械捲腹', muscleGroup: 'core', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s5-e14', name: 'cable跪姿捲腹', muscleGroup: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s5-e15', name: '棒式', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 0 }
            ]
          }
        ]
      }
    };

    // 4. 女士 + 力量雕塑/自由重量 (安全模式關閉，槓鈴臀推、相撲硬舉、分腿蹲、啞鈴肩推)
    const femaleFree: Record<number, { title: string; desc: string; englishTag: string; days: (RoutineTemplate & { subTitle?: string; durationMinutes?: number })[] }> = {
      2: {
        title: '2 日自由分化 · 蜜桃臀大重量力量',
        desc: '專為追求極致臀腿線條的女性打造。以槓鈴臀推、相撲硬舉、保加利亞分腿蹲為主軸，大幅提升臀部維度。',
        englishTag: '2 Days Heavy Glutes & Back',
        days: [
          {
            id: 'f-free-2-d1',
            name: 'Day 1: 蜜桃臀大重量與後側鏈',
            subTitle: 'Heavy Glutes & Hamstrings',
            durationMinutes: 45,
            exercises: [
              { id: 'f-f2-e1', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f2-e2', name: '相撲硬舉', muscleGroup: 'back', defaultSets: 3, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f2-e3', name: '保加利亞啞鈴分腿蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f2-e4', name: '羅馬椅抬腿', muscleGroup: 'core', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-free-2-d2',
            name: 'Day 2: 天鵝美背與深蹲曲線',
            subTitle: 'Back Posture & Squats',
            durationMinutes: 45,
            exercises: [
              { id: 'f-f2-e5', name: '高位下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f2-e6', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f2-e7', name: '上斜啞鈴划船', muscleGroup: 'back', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-f2-e8', name: '棒式', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 0 }
            ]
          }
        ]
      },
      3: {
        title: '3 日自由分化 · 臀推/硬舉/美背雕塑',
        desc: '科學高效的女性力量體態計畫。Day 1 臀推與單腿分腿蹲，Day 2 美背與直角肩，Day 3 相撲硬舉與深蹲。',
        englishTag: 'Glutes Deadlift Squat Split',
        days: [
          {
            id: 'f-free-3-d1',
            name: 'Day 1: 蜜桃臀爆發 (槓鈴臀推/分腿蹲/高腳杯)',
            subTitle: 'Glute Heavy Power',
            durationMinutes: 45,
            exercises: [
              { id: 'f-f3-e1', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f3-e2', name: '保加利亞啞鈴分腿蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f3-e3', name: '啞鈴高腳杯蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-f3-e4', name: '羅馬椅抬腿', muscleGroup: 'core', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-free-3-d2',
            name: 'Day 2: 天鵝美背與直角肩 (下拉/啞鈴划船/側平舉)',
            subTitle: 'Back Width & Shoulder Tone',
            durationMinutes: 45,
            exercises: [
              { id: 'f-f3-e5', name: '高位下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f3-e6', name: '單臂啞鈴划船', muscleGroup: 'back', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f3-e7', name: '啞鈴側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-f3-e8', name: '繩索面拉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-free-3-d3',
            name: 'Day 3: 下肢後側鏈 (相撲硬舉/深蹲/核心)',
            subTitle: 'Deadlift & Squat Tone',
            durationMinutes: 45,
            exercises: [
              { id: 'f-f3-e9', name: '相撲硬舉', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f3-e10', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f3-e11', name: '上斜啞鈴划船', muscleGroup: 'back', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-f3-e12', name: '棒式', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 0 }
            ]
          }
        ]
      },
      4: {
        title: '4 日自由分化 · 蜜桃臀重訓與雕刻',
        desc: '女性 4 天重訓分化。槓鈴臀推、深蹲、硬舉與啞鈴雕塑全面結合，雕琢立體臀波與腰背比。',
        englishTag: '4 Days Female Free Weight Split',
        days: [
          {
            id: 'f-free-4-d1',
            name: 'Day 1: 臀部力量重訓 A (槓鈴臀推/相撲硬舉/分腿蹲)',
            subTitle: 'Glute Heavy Day A',
            durationMinutes: 50,
            exercises: [
              { id: 'f-f4-e1', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f4-e2', name: '相撲硬舉', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f4-e3', name: '保加利亞啞鈴分腿蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f4-e4', name: '懸垂抬腿', muscleGroup: 'core', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-free-4-d2',
            name: 'Day 2: 天鵝美背與直角肩 A (高位下拉/槓鈴划船/肩推)',
            subTitle: 'Back & Shoulder Power A',
            durationMinutes: 50,
            exercises: [
              { id: 'f-f4-e5', name: '高位下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f4-e6', name: '槓鈴划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f4-e7', name: '坐姿啞鈴肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f4-e8', name: '啞鈴側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-free-4-d3',
            name: 'Day 3: 深蹲與臀部曲線 B (槓鈴深蹲/臀推/高腳杯)',
            subTitle: 'Squat & Glute Shape B',
            durationMinutes: 50,
            exercises: [
              { id: 'f-f4-e9', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f4-e10', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f4-e11', name: '啞鈴高腳杯蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-f4-e12', name: '羅馬椅抬腿', muscleGroup: 'core', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-free-4-d4',
            name: 'Day 4: 全身緊緻與美背 B (上斜划船/啞鈴推胸/後肩)',
            subTitle: 'Upper Sculpt & Core B',
            durationMinutes: 50,
            exercises: [
              { id: 'f-f4-e13', name: '上斜啞鈴划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f4-e14', name: '啞鈴平板臥推', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-f4-e15', name: '俯身啞鈴反向飛鳥', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-f4-e16', name: '棒式', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 0 }
            ]
          }
        ]
      },
      5: {
        title: '5 日自由分化 · 女性極致曲線計畫',
        desc: '頂級女性分化計畫。臀部、美背、肩線、下肢與核心全方位深層雕刻。',
        englishTag: '5 Days Female Sculpt Plan',
        days: [
          {
            id: 'f-free-5-d1',
            name: 'Day 1: 蜜桃臀極限爆發 (槓鈴臀推/相撲硬舉/分腿蹲)',
            subTitle: 'Glutes Maximal Power',
            durationMinutes: 50,
            exercises: [
              { id: 'f-f5-e1', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f5-e2', name: '相撲硬舉', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f5-e3', name: '保加利亞啞鈴分腿蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-free-5-d2',
            name: 'Day 2: 天鵝美背線條 (引體輔助/高位下拉/槓鈴划船)',
            subTitle: 'Back Width & Posture',
            durationMinutes: 50,
            exercises: [
              { id: 'f-f5-e4', name: '引體向上輔助', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f5-e5', name: '高位下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f5-e6', name: '槓鈴划船', muscleGroup: 'back', defaultSets: 3, defaultReps: 10, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-free-5-d3',
            name: 'Day 3: 直角肩與鎖骨線 (坐姿啞鈴肩推/側平舉/面拉)',
            subTitle: 'Shoulder & Collarbone Line',
            durationMinutes: 50,
            exercises: [
              { id: 'f-f5-e7', name: '坐姿啞鈴肩推', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f5-e8', name: '啞鈴側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-f5-e9', name: '繩索面拉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-free-5-d4',
            name: 'Day 4: 下肢深蹲曲線 (槓鈴深蹲/高腳杯蹲/臀推)',
            subTitle: 'Squat & Lower Curve',
            durationMinutes: 50,
            exercises: [
              { id: 'f-f5-e10', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f5-e11', name: '啞鈴高腳杯蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-f5-e12', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-free-5-d5',
            name: 'Day 5: 核心小蠻腰 (懸垂抬腿/健腹輪/棒式)',
            subTitle: 'Core & Waistline Strength',
            durationMinutes: 45,
            exercises: [
              { id: 'f-f5-e13', name: '懸垂抬腿', muscleGroup: 'core', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-f5-e14', name: '健腹輪', muscleGroup: 'core', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f5-e15', name: '棒式', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 0 }
            ]
          }
        ]
      }
    };

    if (selectedGender === 'male') {
      return safetyMode ? maleSafe : maleFree;
    } else {
      return safetyMode ? femaleSafe : femaleFree;
    }
  }, [selectedGender, safetyMode]);

  const currentWeeklySystem = GENERATED_ROUTINES[weeklyDays] || GENERATED_ROUTINES[2];

  return (
    <div className="space-y-6 pb-40 px-1">
      {/* 頂部標題區 - 依據 IMG_9161.PNG 設計 */}
      <div className="pt-2 space-y-1.5">
        <h1 className="text-[28px] sm:text-3xl font-black tracking-tight text-black">
          新人專屬訓練計畫
        </h1>
        <p className="text-[14px] text-stone-500 font-medium">
          依每週可訓練日數，自動配對最適合的新手分化
        </p>
      </div>

      {/* 每週訓練日數選擇器卡片 */}
      <div className="space-y-3">
        <h2 className="text-[17px] font-black text-black">
          每週訓練日數
        </h2>
        
        {/* 2日 / 3日 / 4日 / 5日 按鈕群組 */}
        <div className="grid grid-cols-4 gap-2.5">
          {[2, 3, 4, 5].map(days => {
            const isSelected = weeklyDays === days;
            return (
              <button
                key={days}
                onClick={() => setWeeklyDays(days)}
                className={`py-3.5 rounded-[18px] text-[16px] font-black transition-all border flex items-center justify-center ${
                  isSelected 
                    ? 'bg-[#CCFF00] text-black border-black shadow-xs scale-[1.02]' 
                    : 'bg-white text-stone-800 border-black/5 hover:border-black/20 shadow-xs'
                }`}
              >
                {days}日
              </button>
            );
          })}
        </div>
      </div>

      {/* 分化說明與性別切換列 */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-[15px] font-black text-black">
          {weeklyDays} 日分化 · {currentWeeklySystem.days.length} 個訓練日
        </div>

        {/* 男 / 女 標籤切換 */}
        <div className="bg-white border border-black/5 p-1 rounded-2xl flex items-center gap-1 shadow-xs">
          <button
            onClick={() => setSelectedGender('male')}
            className={`px-3 py-1.5 rounded-xl text-[13px] font-black transition-all ${
              selectedGender === 'male' 
                ? 'bg-[#CCFF00] text-black border border-black/10 shadow-xs' 
                : 'text-stone-400'
            }`}
          >
            男
          </button>
          <button
            onClick={() => setSelectedGender('female')}
            className={`px-3 py-1.5 rounded-xl text-[13px] font-black transition-all ${
              selectedGender === 'female' 
                ? 'bg-[#CCFF00] text-black border border-black/10 shadow-xs' 
                : 'text-stone-400'
            }`}
          >
            女
          </button>
        </div>
      </div>

      {/* 新手安全模式切換卡片 */}
      <div className="bg-white rounded-[24px] p-4 border border-black/5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🛡️</span>
          <span className="text-[15px] font-black text-black">
            新手安全模式 (器械為主)
          </span>
        </div>

        {/* 綠色開關 Toggle (嚴格維持 #CCFF00，不使用其他綠色) */}
        <button
          type="button"
          onClick={() => setSafetyMode(!safetyMode)}
          className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors border ${
            safetyMode ? 'bg-[#CCFF00] border-black/20 justify-end' : 'bg-stone-200 border-black/5 justify-start'
          }`}
          aria-label="切換新手安全模式"
        >
          <motion.div 
            layout 
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="bg-white w-6 h-6 rounded-full shadow-md border border-black/10" 
          />
        </button>
      </div>

      {/* 各訓練日卡片清單 (完全對應 IMG_9161.PNG 的白色圓角大卡片與動作列表) */}
      <div className="space-y-5">
        {currentWeeklySystem.days.map((routineDay, dIdx) => (
          <div 
            key={routineDay.id}
            className="bg-white rounded-[28px] p-5 sm:p-6 border border-black/5 shadow-sm space-y-4 transition-all"
          >
            {/* 卡片頂部 Header：圓圈編號 + Day名稱/副標 + 約45分鐘與箭頭 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                {/* 序號徽章 */}
                <div className="w-10 h-10 rounded-2xl bg-[#CCFF00] text-black font-black text-lg flex items-center justify-center shrink-0 border border-black/10 shadow-xs">
                  {dIdx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[17px] sm:text-[18px] font-black text-black uppercase leading-tight truncate">
                    {routineDay.name}
                  </h3>
                  <p className="text-[12px] font-bold text-stone-400 uppercase tracking-wider mt-0.5">
                    {routineDay.subTitle || `Workout Day ${dIdx + 1}`}
                  </p>
                </div>
              </div>

              {/* 時間預估標籤與進入箭頭 */}
              <button
                onClick={() => handleEnterIntegratedMode(routineDay)}
                className="flex items-center gap-1 text-[12px] font-bold text-stone-500 hover:text-black transition-colors pl-2 shrink-0 group"
              >
                <span>⏱️ 約 {routineDay.durationMinutes || 45} 分鐘</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5] text-stone-400 group-hover:text-black group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* 動作項目垂直清單 (維持原有動作與組數) */}
            <div className="divide-y divide-black/[0.04] pt-1">
              {routineDay.exercises.map((ex) => (
                <div key={ex.id} className="py-3 flex items-center gap-3.5 first:pt-1 last:pb-1">
                  {/* 動作 GIF / 圖示 */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-slate-50 border border-black/5 shrink-0 flex items-center justify-center">
                    <ExerciseSmallGif name={ex.name} />
                  </div>

                  {/* 動作名稱與組數次數 */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[16px] font-black text-black leading-snug truncate">
                      {ex.name}
                    </h4>
                    <p className="text-[13px] font-bold text-stone-500 mt-1">
                      {ex.defaultSets} 組 x {ex.defaultReps === 1 ? '力竭' : `${ex.defaultReps} 次`}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 卡片底部操作按鈕 */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                onClick={() => handleEnterIntegratedMode(routineDay)}
                style={{ backgroundColor: '#CCFF00', color: '#000000' }}
                className="flex-1 font-black py-3 px-4 rounded-xl text-[14px] uppercase active:scale-95 transition-all shadow-xs border border-black/10 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> 開始訓練
              </button>
              <button
                onClick={() => setPreviewRoutine(routineDay)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-black font-black rounded-xl text-[13px] transition-all border border-black/5"
              >
                查看詳情
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 自訂課表專區 */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-black text-black">
            我的自訂課表
          </h3>
          <span className="text-[11px] font-black text-stone-400 uppercase tracking-wider">
            {customRoutines.length} 個課表
          </span>
        </div>
        
        <button 
          onClick={() => setIsCreating(true)} 
          style={{ backgroundColor: '#CCFF00', color: '#000000' }}
          className="w-full py-4 text-black text-[15px] font-black rounded-2xl uppercase active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2.5 border border-black/10"
        >
          <Plus className="w-5 h-5 stroke-[3]" /> 建立我的專屬課表
        </button>

        <AnimatePresence>
          {isCreating && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ backgroundColor: lightTheme.card }} className="rounded-[28px] p-6 border border-black/5 shadow-sm space-y-5 overflow-hidden">
              <input autoFocus placeholder="課表名稱..." value={newRoutineName} onChange={e => setNewRoutineName(e.target.value)} style={{ color: '#000000' }} className="w-full bg-transparent border-b-2 border-black/10 py-3 text-2xl font-black uppercase outline-none focus:border-black" />
              <div className="flex gap-3">
                <button onClick={createRoutine} style={{ backgroundColor: '#CCFF00', color: '#000000' }} className="flex-1 text-black font-black py-4 rounded-xl uppercase text-sm active:scale-95 shadow-xs border border-black/10">確認建立</button>
                <button onClick={() => setIsCreating(false)} className="px-6 bg-white text-black font-bold py-4 rounded-xl uppercase text-xs active:scale-90 border border-black/5 shadow-xs">取消</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {customRoutines.length > 0 && (
          <div className="space-y-3">
            {customRoutines.map(r => (
              <button key={r.id} onClick={() => setPreviewRoutine(r)} style={{ backgroundColor: lightTheme.card }} className="w-full rounded-[24px] p-5 border border-black/5 active:scale-[0.98] transition-all flex justify-between items-center text-left group shadow-xs">
                <div>
                  <h4 style={{ color: lightTheme.text }} className="text-[17px] font-black uppercase tracking-tight leading-tight py-0.5">{r.name}</h4>
                  <div className="flex items-center gap-2.5 mt-1.5">
                    <span className="text-[11px] font-black text-black uppercase tracking-wider">{r.exercises.length} 個動作</span>
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[11px] font-bold text-stone-500 uppercase">自訂</span>
                  </div>
                </div>
                <div style={{ backgroundColor: '#CCFF00' }} className="w-10 h-10 text-black rounded-xl flex items-center justify-center group-active:scale-90 transition-all shadow-xs border border-black/10">
                  <ChevronRight className="w-5 h-5 stroke-[3]" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
