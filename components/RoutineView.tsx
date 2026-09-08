import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AppContext } from '../App';
import { RoutineTemplate, MuscleGroup, ExerciseEntry, SetEntry, WorkoutSession } from '../types';
import { ExerciseSmallGif } from './ExerciseSmallGif';
import { ExerciseGifDisplay } from './ExerciseGifDisplay';
import { getMuscleGroup, getMuscleGroupDisplay, getExerciseMethod } from '../utils/fitnessMath';
import { ORGANIZED_EXERCISES, EXERCISE_DATABASE } from './WorkoutView';
import { maleSafe, maleFree, femaleSafe, femaleFree } from '../data/generatedRoutines';
import { 
  LayoutGrid, Trash2, ArrowLeft, Plus, ChevronRight, X, Search, Edit2, 
  Check, BookOpen, ChevronLeft, Zap, Play, Save, 
  Target, PlusCircle, MinusCircle, Loader2, Timer, PlusSquare,
  PlayCircle, Clock, ChevronUp, ChevronDown, ShieldCheck, Flame, Dumbbell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { lightTheme } from '../themeStyles';

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
  
  // 參考 IMG_9161.PNG 的狀態：每週天數 (2, 3, 4, 5), 性別 (男/女), 新手安全模式 (開關)
  const [weeklyDays, setWeeklyDays] = useState<number>(2);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [safetyMode, setSafetyMode] = useState<boolean>(true);

  const customRoutines = context?.customRoutines || [];
  const setCustomRoutines = context?.setCustomRoutines || (() => {});
  const setHistory = context?.setHistory || (() => {});
  const history = context?.history || [];

  useEffect(() => {
    if (selectedExName) {
      setMockSets(Array.from({ length: 4 }).map(() => ({
        id: crypto.randomUUID(), weight: 0, reps: 10, completed: false
      })));
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

  const currentWeeklySystem = useMemo(() => {
    const systems = selectedGender === 'male'
      ? (safetyMode ? maleSafe : maleFree)
      : (safetyMode ? femaleSafe : femaleFree);
    return systems[weeklyDays] || systems[2];
  }, [selectedGender, safetyMode, weeklyDays]);

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
        onClose={() => {
          setIntegratedRoutine(null);
          setPreviewRoutine(null);
        }}
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
                      <div className="w-full relative px-1 max-w-[340px] mx-auto">
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
