import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AppContext } from '../App';
import { RoutineTemplate, MuscleGroup } from '../types';
import { getMuscleGroup, getMuscleGroupDisplay, fetchExerciseGif, getExerciseMethod } from '../utils/fitnessMath';
import { ORGANIZED_EXERCISES, EXERCISE_DATABASE } from './WorkoutView';
import { Eye, LayoutGrid, Trash2, ArrowLeft, Plus, ChevronRight, Save, X, Search, Edit2, Check, Sparkles, Layers, ListChecks, PlusSquare, Loader2, Target, BookOpen, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RoutineSplitGroup {
  id: string;
  title: string;
  description: string;
  routines: RoutineTemplate[];
}

export const RoutineView: React.FC<{ onStartRoutine: (template: RoutineTemplate) => void }> = ({ onStartRoutine }) => {
  const context = useContext(AppContext);
  const [previewRoutine, setPreviewRoutine] = useState<RoutineTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  
  // 新增動作相關狀態
  const [activeCategory, setActiveCategory] = useState<string>('chest');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExName, setSelectedExName] = useState<string | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [newExConfig, setNewExConfig] = useState({ weight: '0', sets: '4', reps: '10' });

  if (!context) return null;
  const { customRoutines, setCustomRoutines } = context;

  // 抓取 GIF 邏輯（與 WorkoutView 一致）
  useEffect(() => {
    if (selectedExName) {
      fetchExerciseGif(selectedExName).then(setGifUrl);
    } else {
      setGifUrl(null);
    }
  }, [selectedExName]);

  const filteredExercises = useMemo(() => {
    if (searchTerm) {
      return EXERCISE_DATABASE.filter(ex => ex.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return ORGANIZED_EXERCISES[activeCategory] || [];
  }, [searchTerm, activeCategory]);

  const exactMatch = useMemo(() => {
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
    const newEntry = {
      id: crypto.randomUUID(),
      name: selectedExName,
      muscleGroup: getMuscleGroup(selectedExName),
      defaultSets: Number(newExConfig.sets) || 4,
      defaultReps: Number(newExConfig.reps) || 10,
      defaultWeight: Number(newExConfig.weight) || 0
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

  const splitSystems: RoutineSplitGroup[] = [
    {
      id: '2-split',
      title: '二分化訓練系統 (Upper/Lower)',
      description: '適合每週訓練 2-4 次，效率極高的全身平衡方案',
      routines: [
        { id: '2s-1', name: 'Day 1: 上半身 (胸/背/肩)', exercises: [
          { id: '2s1e1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 8, defaultWeight: 60 },
          { id: '2s1e2', name: '滑輪下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 50 },
          { id: '2s1e3', name: '啞鈴肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 12, defaultWeight: 20 },
          { id: '2s1e4', name: '滑輪下壓', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 25 }
        ]},
        { id: '2s-2', name: 'Day 2: 下半身 (腿/核心)', exercises: [
          { id: '2s2e1', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 80 },
          { id: '2s2e2', name: '羅馬尼亞硬舉', muscleGroup: 'back', defaultSets: 3, defaultReps: 10, defaultWeight: 70 },
          { id: '2s2e3', name: '器械腿伸展', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 40 },
          { id: '2s2e4', name: '棒式', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 0 }
        ]}
      ]
    },
    {
      id: '3-split',
      title: '三分化 PPL 系統 (Push/Pull/Legs)',
      description: '最經典的科學分化，針對不同發力模式深度訓練',
      routines: [
        { id: '3s-1', name: 'Day 1: 推 (Push) - 胸肩三頭', exercises: [
          { id: '3s1e1', name: '啞鈴上斜臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 10, defaultWeight: 25 },
          { id: '3s1e2', name: '槓鈴肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 8, defaultWeight: 40 },
          { id: '3s1e3', name: '啞鈴側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 15, defaultWeight: 8 },
          { id: '3s1e4', name: '仰臥槓鈴臂屈伸', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 20 }
        ]},
        { id: '3s-2', name: 'Day 2: 拉 (Pull) - 背部二頭', exercises: [
          { id: '3s2e1', name: '引體向上', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
          { id: '3s2e2', name: '槓鈴划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 50 },
          { id: '3s2e3', name: '啞鈴交替彎舉', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 14 },
          { id: '3s2e4', name: '蝴蝶機後三角飛鳥', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 35 }
        ]},
        { id: '3s-3', name: 'Day 3: 腿 (Legs) - 下肢/臀部', exercises: [
          { id: '3s3e1', name: '保加利亞分腿蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 15 },
          { id: '3s3e2', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 10, defaultWeight: 60 },
          { id: '3s3e3', name: '器械腿屈伸', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 40 },
          { id: '3s3e4', name: '站姿提踵', muscleGroup: 'quads', defaultSets: 3, defaultReps: 15, defaultWeight: 30 }
        ]}
      ]
    }
  ];

  if (previewRoutine) {
    const isCustom = customRoutines.some(r => r.id === previewRoutine.id);
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-44">
        <div className="flex items-center gap-5 px-1">
          <button onClick={() => setPreviewRoutine(null)} className="w-11 h-11 bg-slate-800 rounded-xl flex items-center justify-center text-neon-green border border-white/5"><ArrowLeft className="w-6 h-6" /></button>
          <div className="flex-1 overflow-hidden">
            {isEditingName ? (
              <div className="flex gap-2">
                <input autoFocus value={tempName} onChange={e => setTempName(e.target.value)} onBlur={renameRoutine} className="bg-black/40 border-b border-neon-green text-xl font-black italic text-white outline-none w-full uppercase pr-2" />
                <button onClick={renameRoutine} className="p-2 text-neon-green"><Check className="w-6 h-6" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black italic tracking-tighter uppercase truncate text-white pr-2">{previewRoutine.name}</h2>
                {isCustom && <button onClick={() => { setTempName(previewRoutine.name); setIsEditingName(true); }} className="p-2 bg-slate-800/50 rounded-lg text-slate-500"><Edit2 className="w-4 h-4" /></button>}
              </div>
            )}
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1.5">訓練清單內容</p>
          </div>
          {isCustom && <button onClick={() => deleteRoutine(previewRoutine.id)} className="w-13 h-13 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center border border-red-500/10"><Trash2 className="w-6 h-6" /></button>}
        </div>
        
        <div className="space-y-4">
          {previewRoutine.exercises.map((ex) => (
            <div key={ex.id} className="glass rounded-[28px] p-6 border-white/5 flex items-center justify-between">
              <div className="flex items-center">
                <div>
                  <h4 className="font-black text-lg text-white italic uppercase tracking-tight pr-2">{ex.name}</h4>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1.5">{ex.defaultWeight}KG | {ex.defaultSets} 組 | {ex.defaultReps} 次</p>
                </div>
              </div>
              {isCustom && (
                <button onClick={() => removeExerciseFromTemplate(ex.id)} className="w-11 h-11 bg-slate-800/30 rounded-xl flex items-center justify-center text-slate-700 active:text-red-500"><Trash2 className="w-5 h-5" /></button>
              )}
            </div>
          ))}
        </div>

        {isCustom && (
          <button onClick={() => setIsAddingExercise(true)} className="w-full py-5 bg-white/5 border border-dashed border-white/10 rounded-2xl text-[11px] font-black uppercase text-slate-500 flex items-center justify-center gap-2.5">
            <Plus className="w-4 h-4" /> 新增動作項目
          </button>
        )}
        
        <div className="fixed bottom-[95px] left-0 right-0 z-50 flex justify-center px-6">
          <button onClick={() => { onStartRoutine(previewRoutine); setPreviewRoutine(null); }} className="w-full bg-neon-green text-black font-black h-16 rounded-2xl uppercase italic tracking-tighter text-lg shadow-lg flex items-center justify-center gap-4">
            帶入今日訓練開始行動 <ChevronRight className="w-6 h-6 stroke-[4]" />
          </button>
        </div>

        <AnimatePresence>
          {isAddingExercise && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => { setIsAddingExercise(false); setSelectedExName(null); }} />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative w-full max-w-md bg-slate-950 rounded-t-[44px] p-8 pb-14 border-t border-white/10 shadow-2xl safe-bottom max-h-[95vh] overflow-hidden flex flex-col">
                <div className="w-14 h-1.5 bg-slate-800 rounded-full mx-auto mb-8 shrink-0" />
                
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <div className="flex items-center gap-3">
                    {selectedExName ? (
                      <button onClick={() => setSelectedExName(null)} className="flex items-center gap-2 text-slate-400 py-2">
                        <ChevronLeft className="w-7 h-7" />
                        <span className="text-xs font-black uppercase tracking-widest">返回</span>
                      </button>
                    ) : (
                      <h3 className="text-2xl font-black italic uppercase text-white pr-2">選取課表動作</h3>
                    )}
                  </div>
                  <button onClick={() => { setIsAddingExercise(false); setSelectedExName(null); }} className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 border border-white/5"><X className="w-7 h-7" /></button>
                </div>

                <div className="space-y-5 flex-1 overflow-hidden flex flex-col">
                  {!selectedExName ? (
                    <>
                      {/* 搜尋庫：與記錄頁面一模一樣 */}
                      <div className="flex items-center gap-4 bg-slate-900/80 border border-white/5 rounded-2xl px-6 py-4 shadow-inner shrink-0">
                        <Search className="w-5 h-5 text-slate-600" />
                        <input 
                          placeholder="搜尋動作庫..." 
                          value={searchTerm} 
                          onChange={e => setSearchTerm(e.target.value)} 
                          className="bg-transparent w-full text-base font-black italic outline-none text-white placeholder:text-slate-800 pr-2" 
                        />
                      </div>

                      {!searchTerm && (
                        <div className="flex gap-2.5 overflow-x-auto no-scrollbar shrink-0 pb-1">
                          {Object.keys(ORGANIZED_EXERCISES).map(cat => (
                            <button 
                              key={cat} 
                              onClick={() => { setActiveCategory(cat); setSearchTerm(''); }} 
                              className={`shrink-0 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat ? 'bg-neon-green text-black border-neon-green' : 'bg-slate-900/40 text-slate-500 border-white/5'}`}
                            >
                              {getMuscleGroupDisplay(cat as MuscleGroup).cn}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-12">
                        <AnimatePresence mode="popLayout">
                          {searchTerm.trim() && !exactMatch && (
                            <motion.button 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              onClick={() => setSelectedExName(searchTerm.trim())} 
                              className="w-full p-5 rounded-[20px] bg-neon-green/10 border border-neon-green/30 flex items-center justify-between group"
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
                        </AnimatePresence>

                        <div className="grid grid-cols-2 gap-3">
                          {filteredExercises.map(exName => (
                            <button 
                              key={exName} 
                              onClick={() => setSelectedExName(exName)} 
                              className="p-4 rounded-[20px] text-left bg-slate-900/40 border border-white/5 flex flex-col justify-center min-h-[76px] group active:border-neon-green/30"
                            >
                              <div className="text-[13px] font-black italic uppercase text-slate-200 group-active:text-neon-green leading-tight truncate pr-1">
                                {exName}
                              </div>
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
                    /* 詳細資訊介面：與記錄頁面一模一樣（搬過來） */
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-24">
                      <div className="flex items-center justify-between px-1">
                        <h2 className="text-2xl font-black italic uppercase text-white truncate max-w-[280px] pr-3">{selectedExName}</h2>
                      </div>

                      <div className="w-full relative px-1">
                        <div className="relative overflow-hidden rounded-[24px] shadow-2xl border border-white/5 bg-slate-900 min-h-[240px] flex items-center justify-center">
                          {/* 搬過來的硬連結 GIF 邏輯 */}
                          {selectedExName === '啞鈴肩推' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/02/developpe-epaule-halteres.gif" alt="啞鈴肩推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '槓鈴肩推' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/08/developpe-militaire-exercice-musculation.gif" alt="槓鈴肩推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '阿諾肩推' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/08/developpe-arnold-exercice-musculation.gif" alt="阿諾肩推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '器械肩推' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/11/developpe-epaules-a-la-machine-shoulder-press.gif" alt="器械肩推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '史密斯機肩推' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/08/developpe-epaules-smith-machine.gif" alt="史密斯機肩推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '啞鈴側平舉' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/08/elevations-laterales-exercice-musculation.gif" alt="啞鈴側平舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '滑輪側平舉' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/11/elevations-laterales-unilaterale-poulie.gif" alt="滑輪側平舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '器械側平舉' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/02/elevation-laterale-machine.gif" alt="器械側平舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '啞鈴前平舉' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/08/elevations-frontales-exercice-musculation.gif" alt="啞鈴前平舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '蝴蝶機後三角飛鳥' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/12/pec-deck-inverse.gif" alt="蝴蝶機後三角飛鳥" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '滑輪面拉' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/face-pull.gif" alt="滑輪面拉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '俯身啞鈴反向飛鳥' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/12/oiseau-assis-sur-banc.gif" alt="俯身啞鈴反向飛鳥" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '啞鈴上斜臥推' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/06/developpe-incline-halteres-exercice-musculation.gif" alt="啞鈴上斜臥推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '槓鈴平板臥推' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/developpe-couche-prise-inversee.gif" alt="槓鈴平板臥推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '槓鈴上斜臥推' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/10/developpe-incline-barre.gif" alt="槓鈴上斜臥推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '啞鈴平板臥推' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/05/developpe-couche-halteres-exercice-musculation.gif" alt="啞鈴平板臥推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '史密斯平板臥推' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/08/developpe-couche-smith-machine.gif" alt="史密斯平板臥推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '坐姿器械推胸' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/11/developpe-machine-assis-pectoraux.gif" alt="坐姿器械推胸" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '蝴蝶機夾胸' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/06/pec-deck-butterfly-exercice-musculation.gif" alt="蝴蝶機夾胸" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '跪姿繩索夾胸' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2023/07/ecarte-a-la-poulie-vis-a-vis-haute-a-genoux.gif" alt="跪姿繩索夾胸" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '器械上斜推胸' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/06/developpe-incline-machine-convergente-exercice-musculation.gif" alt="器械上斜推胸" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '史密斯上斜臥推' ? (
                            <img src="https://fitliferegime.com/wp-content/uploads/2024/04/Smith-Machine-Incline-Press.gif" alt="史密斯上斜臥推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '雙槓撐體' ? (
                            <img src="https://i.pinimg.com/originals/e7/45/d6/e745d6fcd41963a8a6d36c4b66c009a9.gif" alt="雙槓撐體" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '標準俯地挺身' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2020/10/pompe-musculation.gif" alt="標準俯地挺身" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '槓鈴彎舉' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/09/curl-barre.gif" alt="槓鈴彎舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '啞鈴錘式彎舉' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/09/curl-haltere-prise-neutre.gif" alt="啞鈴錘式彎舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '啞鈴交替彎舉' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/08/curl-biceps-avec-halteres-alterne.gif" alt="啞鈴交替彎舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '牧師椅彎舉' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/curl-au-pupitre-barre-ez-larry-scott.gif" alt="牧師椅彎舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '滑輪直桿彎舉' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/10/curl-biceps-poulie-basse.gif" alt="滑輪直桿彎舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '反手槓鈴彎舉' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/04/curl-inverse-barre.gif" alt="反手槓鈴彎舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '二頭肌器械彎舉' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/curl-pupitre-machine-prechargee.gif" alt="二頭肌器械彎舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '滑輪繩索下壓' ? (
                            <img src="https://www.aesthetics-blog.com/wp-content/uploads/2023/04/12271301-Cable-Standing-One-Arm-Tricep-Pushdown-Overhand-Grip_Upper-Arms_720.gif" alt="滑輪繩索下壓" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '窄握槓鈴臥推' ? (
                            <img src="https://www.aesthetics-blog.com/wp-content/uploads/2021/10/00301301-Barbell-Close-Grip-Bench-Press_Upper-Arms_720.gif" alt="窄握槓鈴臥推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '仰臥槓鈴臂屈伸' ? (
                            <img src="https://www.aesthetics-blog.com/wp-content/uploads/2019/08/00601301-Barbell-Lying-Triceps-Extension-Skull-Crusher_Triceps-SFIX_720.gif" alt="仰臥槓鈴臂屈伸" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '啞鈴頸後臂屈伸' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/12/extensions-des-triceps-assis-avec-haltere.gif" alt="啞鈴頸後臂屈伸" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '滑輪直桿過頭臂屈伸' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/extension-triceps-incline-poulie-basse.gif" alt="滑輪直桿過頭臂屈伸" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '引體向上' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/02/traction-musculation-dos.gif" alt="引體向上" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '滑輪下拉' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/11/血液-vertical-poitrine.gif" alt="滑輪下拉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '槓鈴划船' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/09/rowing-barre.gif" alt="槓鈴划船" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '啞鈴單臂划船' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/08/rowing-haltere-un-bras.gif" alt="啞鈴單臂划船" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '坐姿划船機' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/rowing-assis-machine-hammer-strenght.gif" alt="坐姿划船機" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === 'T桿划船機' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/rowing-t-bar-machine.gif" alt="T桿划船機" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '器械反握高位下拉' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/tirage-avant-iso-laterale-hammer-strength.gif" alt="器械反握高位下拉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '傳統硬舉' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/12/souleve-de-terre.gif" alt="傳統硬舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '輔助引體向上機' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/02/traction-assistee-machine.gif" alt="輔助引體向上機" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === 'V把坐姿划船' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/02/tirage-horizontal-poulie.gif" alt="V把坐姿划船" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '寬握水平划船' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/10/tirage-horizontal-prise-large.gif" alt="寬握水平划船" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '滑輪反握下拉' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/tirage-vertical-prise-inversee.gif" alt="滑輪反握下拉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '槓鈴深蹲' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/11/homme-faisant-un-squat-avec-barre.gif" alt="槓鈴深蹲" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '啞鈴高腳杯蹲' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/06/squat-goblet-exercice-musculation.gif" alt="啞鈴高腳杯蹲" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '上斜腿推機' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/08/presse-a-cuisses-inclinee.gif" alt="上斜腿推機" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '保加利亞啞鈴分腿蹲' ? (
                            <img src="https://www.aesthetics-blog.com/wp-content/uploads/2023/02/04101301-Dumbbell-Single-Leg-Split-Squat_Thighs-FIX_720.gif" alt="保加利亞啞鈴分腿蹲" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '哈克深蹲' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/hack-squat.gif" alt="哈克深蹲" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '仰臥腿後勾' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/10/leg-curl-allonge.gif" alt="仰臥腿後勾" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '坐姿腿屈伸' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/06/leg-extension-exercice-musculation.gif" alt="坐姿腿屈伸" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '槓鈴臀推' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/12/hips-thrust.gif" alt="槓鈴臀推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '坐姿腿後勾' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/02/leg-curl-assis-machine.gif" alt="坐姿腿後勾" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '器械站姿提踵' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/10/extension-mollets-debout-machine.gif" alt="器械站姿提踵" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '相撲硬舉' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/10/souleve-de-terre-sumo.gif" alt="相撲硬舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '六角槓硬舉' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/10/souleve-de-terre-a-la-trap-bar.gif" alt="六角槓硬舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '器械腿外展' ? (
                            <img src="https://static.wixstatic.com/media/2edbed_2c54524226684ddea7f4e2e08a472a3a~mv2.gif" alt="器械腿外展" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '仰臥起坐' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/07/crunch-au-sol-exercice-musculation.gif" alt="仰臥起坐" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '羅馬椅抬腿' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/04/releve-jambes-chaise-romaine-abdominaux.gif" alt="羅馬椅抬腿" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '棒式' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/05/planche-abdos.gif" alt="棒式" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '俄羅斯轉體' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/04/rotations-russes-obliques.gif" alt="俄羅斯轉體" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '健腹輪' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/02/roulette-abdominaux.gif" alt="健腹輪" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '器械捲腹' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/04/crunch-machine-abdos.gif" alt="器械捲腹" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '懸垂抬腿' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/07/releve-de-genoux-suspendu-exercice-musculation.gif" alt="懸垂抬腿" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '登山者' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/06/mountain-climber-exercice-musculation.gif" alt="登山者" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '側棒式' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/planche-laterale-obliques.gif" alt="側棒式" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '跪姿滑輪捲腹' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/06/crunch-poulie-haute-exercice-musculation.gif" alt="跪姿滑輪捲腹" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '下斜捲腹' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/02/sit-up-decline.gif" alt="下斜捲腹" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : selectedExName === '滑輪側捲腹' ? (
                            <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/04/flexions-laterales-poulie-basse.gif" alt="滑輪側捲腹" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : gifUrl ? (
                            <img src={gifUrl} alt={selectedExName} style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                          ) : (
                            <Loader2 className="w-9 h-9 text-neon-green animate-spin" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-green/5 to-transparent h-24 w-full animate-[scan_3s_linear_infinite] pointer-events-none" />
                        </div>
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

                      {/* 課表專用：預設數值設定區 */}
                      <div className="space-y-5 px-1">
                        <div className="flex items-center gap-2.5">
                          <Target className="w-5 h-5 text-neon-green" />
                          <h3 className="text-sm font-black italic uppercase text-white">設定預設數值</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <InputSmall label="預設重量" unit="KG" val={newExConfig.weight} onChange={(v: string) => setNewExConfig({...newExConfig, weight: v})} />
                          <InputSmall label="預設組數" unit="組" val={newExConfig.sets} onChange={(v: string) => setNewExConfig({...newExConfig, sets: v})} />
                          <InputSmall label="預設次數" unit="次" val={newExConfig.reps} onChange={(v: string) => setNewExConfig({...newExConfig, reps: v})} />
                        </div>
                      </div>

                      <div className="pt-4 px-1 pb-10">
                        <button 
                          onClick={addExerciseToTemplate} 
                          className="w-full bg-neon-green text-black font-black h-14 rounded-xl uppercase italic text-base active:scale-95 transition-all shadow-[0_10px_20px_rgba(173,255,47,0.2)] flex items-center justify-center gap-3 tracking-tighter"
                        >
                          <Save className="w-5 h-5 stroke-[2.5]" /> 加入課表
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
    <div className="space-y-12 pb-32">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-base font-black italic tracking-tighter uppercase flex items-center gap-3 text-slate-400 pr-2">
          <LayoutGrid className="w-6 h-6 text-neon-green" /> 我的訓練課表
        </h2>
        <button onClick={() => setIsCreating(true)} className="px-5 py-2.5 bg-white/5 text-neon-green text-[11px] font-black rounded-xl uppercase border border-white/5 active:bg-neon-green active:text-black transition-all">
          + 建立課表
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="glass rounded-[32px] p-9 border-neon-green/30 space-y-7 overflow-hidden">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-neon-green uppercase tracking-[0.3em] ml-1.5">新課表名稱</label>
              <input autoFocus placeholder="例如：胸背拉推日..." value={newRoutineName} onChange={e => setNewRoutineName(e.target.value)} className="w-full bg-transparent border-b-2 border-neon-green/30 py-4 text-3xl font-black italic uppercase outline-none text-white focus:border-neon-green pr-3" />
            </div>
            <div className="flex gap-5">
              <button onClick={createRoutine} className="flex-1 bg-neon-green text-black font-black py-5 rounded-2xl uppercase italic text-base">建立課表</button>
              <button onClick={() => setIsCreating(false)} className="px-10 bg-slate-800 text-white font-bold py-5 rounded-2xl uppercase text-xs">取消</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-5">
        {customRoutines.length === 0 ? (
          <div className="p-12 text-center glass rounded-[36px] border-white/5 italic text-slate-700 text-[11px] uppercase tracking-widest leading-loose">
            尚未建立任何自訂課表
          </div>
        ) : (
          customRoutines.map(r => (
            <div key={r.id} onClick={() => setPreviewRoutine(r)} className="glass rounded-[32px] p-7 border-white/5 active:scale-[0.98] transition-all flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tight pr-2">{r.name}</h3>
                <p className="text-[11px] font-bold text-slate-500 uppercase mt-2.5 tracking-widest">{r.exercises.length} 項訓練項目</p>
              </div>
              <div className="w-13 h-13 bg-slate-800 text-slate-500 rounded-2xl flex items-center justify-center border border-white/5 shrink-0"><Eye className="w-6 h-6" /></div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-10 pt-4">
        <p className="text-xs font-black text-slate-600 uppercase tracking-[0.4em] ml-2 flex items-center gap-3">
           <Layers className="w-5 h-5 text-neon-green" /> 科學分化系統庫
        </p>
        
        {splitSystems.map(system => (
          <div key={system.id} className="glass rounded-[44px] p-9 border-white/5 space-y-7 relative overflow-hidden bg-gradient-to-br from-slate-900/40 to-transparent">
            <div className="space-y-2.5">
               <h3 className="text-lg font-black italic uppercase text-white tracking-tighter pr-2">{system.title}</h3>
               <p className="text-xs font-medium text-slate-500 leading-relaxed">{system.description}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
               {system.routines.map((r, idx) => (
                 <button 
                   key={r.id} 
                   onClick={() => setPreviewRoutine(r)}
                   className="flex items-center justify-between p-6 bg-black/40 border border-white/5 rounded-[24px] hover:border-neon-green/30 transition-all active:scale-[0.98]"
                 >
                   <div className="flex items-center gap-5 overflow-hidden">
                      <div className="w-11 h-11 bg-slate-800 rounded-xl flex items-center justify-center text-[12px] font-black text-neon-green shrink-0">
                         D{idx + 1}
                      </div>
                      <div className="text-left overflow-hidden">
                        <div className="text-base font-black italic uppercase text-slate-200 truncate pr-2">{r.name.split(': ')[1] || r.name}</div>
                        <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">{r.exercises.length} EXERCISES</div>
                      </div>
                   </div>
                   <ChevronRight className="w-5 h-5 text-slate-700" />
                 </button>
               ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const InputSmall = ({ label, unit, val, onChange }: any) => (
  <div className="space-y-2.5">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center block">{label}</label>
    <div className="relative">
      <input type="number" value={val} onChange={e => onChange(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 text-center text-lg font-black italic outline-none text-white focus:border-neon-green/20 pr-1" />
      <span className="absolute bottom-1.5 right-2.5 text-[8px] font-black text-slate-700 uppercase">{unit}</span>
    </div>
  </div>
);