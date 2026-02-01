import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { RoutineTemplate, MuscleGroup } from '../types';
import { getMuscleGroup, getMuscleGroupDisplay } from '../utils/fitnessMath';
import { getExerciseIcon, ORGANIZED_EXERCISES, EXERCISE_DATABASE } from './WorkoutView';
import { Eye, LayoutGrid, Trash2, ArrowLeft, Plus, ChevronRight, Save, X, Search, Edit2, Check, Sparkles, Layers, ListChecks } from 'lucide-react';
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
  
  const [activeCategory, setActiveCategory] = useState<string>('chest');
  const [searchTerm, setSearchTerm] = useState('');
  const [newExConfig, setNewExConfig] = useState({ weight: '0', sets: '4', reps: '10' });

  if (!context) return null;
  const { customRoutines, setCustomRoutines } = context;

  const filteredExercises = useMemo(() => {
    if (!searchTerm.trim()) return ORGANIZED_EXERCISES[activeCategory] || [];
    return EXERCISE_DATABASE.filter(ex => ex.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 20);
  }, [searchTerm, activeCategory]);

  const exactMatch = useMemo(() => {
    return EXERCISE_DATABASE.some(ex => ex === searchTerm.trim());
  }, [searchTerm]);

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
    },
    {
      id: '5-split',
      title: '五分化專項系統 (Bro Split)',
      description: '每天專攻一個肌群，給予肌肉最大的破壞與成長空間',
      routines: [
        { id: '5s-1', name: 'Day 1: 胸部專日 (Chest)', exercises: [{ id: '5s1e1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 5, defaultReps: 8, defaultWeight: 60 }, { id: '5s1e2', name: '啞鈴上斜臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 10, defaultWeight: 24 }] },
        { id: '5s-2', name: 'Day 2: 背部專日 (Back)', exercises: [{ id: '5s2e1', name: '滑輪下拉', muscleGroup: 'back', defaultSets: 5, defaultReps: 10, defaultWeight: 55 }, { id: '5s2e2', name: '坐姿划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 45 }] },
        { id: '5s-3', name: 'Day 3: 腿部專日 (Legs)', exercises: [{ id: '5s3e1', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 5, defaultReps: 8, defaultWeight: 80 }, { id: '5s3e2', name: '器械腿部推蹬', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 120 }] },
        { id: '5s-4', name: 'Day 4: 肩部專日 (Shoulder)', exercises: [{ id: '5s4e1', name: '啞鈴肩推', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 10, defaultWeight: 20 }, { id: '5s4e2', name: '啞鈴側平舉', muscleGroup: 'shoulders', defaultSets: 5, defaultReps: 15, defaultWeight: 8 }] },
        { id: '5s-5', name: 'Day 5: 手臂專日 (Arms)', exercises: [{ id: '5s5e1', name: '槓鈴彎舉', muscleGroup: 'arms', defaultSets: 4, defaultReps: 12, defaultWeight: 25 }, { id: '5s5e2', name: '滑輪繩索下壓', muscleGroup: 'arms', defaultSets: 4, defaultReps: 12, defaultWeight: 20 }] }
      ]
    }
  ];

  const createRoutine = () => {
    if (!newRoutineName.trim()) return;
    const newRoutine: RoutineTemplate = { id: crypto.randomUUID(), name: newRoutineName, exercises: [] };
    setCustomRoutines([newRoutine, ...customRoutines]);
    setNewRoutineName('');
    setIsCreating(false);
    setPreviewRoutine(newRoutine);
  };

  const deleteRoutine = (id: string) => {
    if (confirm('確定要永久刪除此自訂課表範本嗎？')) {
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

  const addExerciseToTemplate = (exName: string) => {
    if (!previewRoutine) return;
    const newEntry = {
      id: crypto.randomUUID(),
      name: exName,
      muscleGroup: getMuscleGroup(exName),
      defaultSets: Number(newExConfig.sets) || 4,
      defaultReps: Number(newExConfig.reps) || 10,
      defaultWeight: Number(newExConfig.weight) || 0
    };
    const updatedRoutine = { ...previewRoutine, exercises: [...previewRoutine.exercises, newEntry] };
    setCustomRoutines(prev => prev.map(r => r.id === previewRoutine.id ? updatedRoutine : r));
    setPreviewRoutine(updatedRoutine);
    setIsAddingExercise(false);
    setSearchTerm('');
  };

  const removeExerciseFromTemplate = (exId: string) => {
    if (!previewRoutine) return;
    const updatedRoutine = { ...previewRoutine, exercises: previewRoutine.exercises.filter(e => e.id !== exId) };
    setCustomRoutines(prev => prev.map(r => r.id === previewRoutine.id ? updatedRoutine : r));
    setPreviewRoutine(updatedRoutine);
  };

  if (previewRoutine) {
    const isCustom = customRoutines.some(r => r.id === previewRoutine.id);
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-44">
        <div className="flex items-center gap-5 px-1">
          <button onClick={() => setPreviewRoutine(null)} className="w-11 h-11 bg-slate-800 rounded-xl flex items-center justify-center text-neon-green border border-white/5"><ArrowLeft className="w-6 h-6" /></button>
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
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1.5">訓練清單內容</p>
          </div>
          {isCustom && <button onClick={() => deleteRoutine(previewRoutine.id)} className="w-13 h-13 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center border border-red-500/10"><Trash2 className="w-6 h-6" /></button>}
        </div>
        
        <div className="space-y-4">
          {previewRoutine.exercises.map((ex) => (
            <div key={ex.id} className="glass rounded-[28px] p-6 border-white/5 flex items-center justify-between">
              <div className="flex items-center">
                <div>
                  <h4 className="font-black text-lg text-white italic uppercase tracking-tight">{ex.name}</h4>
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsAddingExercise(false)} />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative w-full max-w-md bg-slate-900 rounded-t-[44px] p-8 pb-14 border-t border-white/10 shadow-2xl safe-bottom max-h-[90vh] overflow-y-auto no-scrollbar">
                <div className="w-14 h-1.5 bg-slate-800 rounded-full mx-auto mb-10" />
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black italic uppercase text-white">選取課表動作</h3>
                  <button onClick={() => setIsAddingExercise(false)} className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400"><X className="w-7 h-7" /></button>
                </div>
                <div className="space-y-7">
                  <div className="flex items-center gap-5 bg-black/40 border border-white/10 rounded-2xl px-6 py-5">
                    <Search className="w-6 h-6 text-slate-600" />
                    <input placeholder="搜尋動作庫..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent w-full text-xl font-black italic outline-none text-white placeholder:text-slate-800" />
                  </div>
                  <AnimatePresence>
                    {searchTerm.trim() && !exactMatch && (
                      <button onClick={() => addExerciseToTemplate(searchTerm.trim())} className="w-full p-5 rounded-2xl bg-neon-green/10 border border-neon-green/40 flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-neon-green text-black rounded-xl flex items-center justify-center"><Plus className="w-7 h-7 stroke-[4]" /></div>
                          <div className="text-left"><div className="text-[11px] font-black text-neon-green uppercase">建立新動作</div><div className="text-base font-black italic text-white uppercase">{searchTerm}</div></div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-neon-green" />
                      </button>
                    )}
                  </AnimatePresence>
                  <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
                    {Object.keys(ORGANIZED_EXERCISES).map(cat => (
                      <button key={cat} onClick={() => { setActiveCategory(cat); setSearchTerm(''); }} className={`shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${!searchTerm && activeCategory === cat ? 'bg-neon-green text-black border-neon-green' : 'bg-slate-800 text-slate-500 border-white/5'}`}>{getMuscleGroupDisplay(cat as MuscleGroup).cn}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                    {filteredExercises.map(exName => (
                      <button key={exName} onClick={() => addExerciseToTemplate(exName)} className="p-4 rounded-2xl text-left bg-slate-800/40 border border-white/5 active:bg-neon-green/5">
                        <div className="flex items-center gap-4"><div className="w-9 h-9 shrink-0 bg-slate-700 rounded-lg flex items-center justify-center p-1">{getExerciseIcon(exName)}</div><div className="text-[11px] font-black italic uppercase text-slate-200 truncate">{exName}</div></div>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <InputSmall label="預設重量" unit="KG" val={newExConfig.weight} onChange={v => setNewExConfig({...newExConfig, weight: v})} />
                    <InputSmall label="預設組數" unit="組" val={newExConfig.sets} onChange={v => setNewExConfig({...newExConfig, sets: v})} />
                    <InputSmall label="預設次數" unit="次" val={newExConfig.reps} onChange={v => setNewExConfig({...newExConfig, reps: v})} />
                  </div>
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
        <h2 className="text-base font-black italic tracking-tighter uppercase flex items-center gap-3 text-slate-400">
          <LayoutGrid className="w-6 h-6 text-neon-green" /> 我的自訂課表
        </h2>
        <button onClick={() => setIsCreating(true)} className="px-5 py-2.5 bg-white/5 text-neon-green text-[11px] font-black rounded-xl uppercase border border-white/5 active:bg-neon-green active:text-black transition-all">
          + 建立範本
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="glass rounded-[32px] p-9 border-neon-green/30 space-y-7 overflow-hidden">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-neon-green uppercase tracking-[0.3em] ml-1.5">新課表範本名稱</label>
              <input autoFocus placeholder="例如：胸背拉推日..." value={newRoutineName} onChange={e => setNewRoutineName(e.target.value)} className="w-full bg-transparent border-b-2 border-neon-green/30 py-4 text-3xl font-black italic uppercase outline-none text-white focus:border-neon-green" />
            </div>
            <div className="flex gap-5">
              <button onClick={createRoutine} className="flex-1 bg-neon-green text-black font-black py-5 rounded-2xl uppercase italic text-base">建立範本</button>
              <button onClick={() => setIsCreating(false)} className="px-10 bg-slate-800 text-white font-bold py-5 rounded-2xl uppercase text-xs">取消</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-5">
        {customRoutines.length === 0 ? (
          <div className="p-12 text-center glass rounded-[36px] border-white/5 italic text-slate-700 text-[11px] uppercase tracking-widest leading-loose">
            尚未建立任何自訂範本
          </div>
        ) : (
          customRoutines.map(r => (
            <div key={r.id} onClick={() => setPreviewRoutine(r)} className="glass rounded-[32px] p-7 border-white/5 active:scale-[0.98] transition-all flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tight">{r.name}</h3>
                <p className="text-[11px] font-bold text-slate-500 uppercase mt-2.5 tracking-widest">{r.exercises.length} 項訓練項目</p>
              </div>
              <div className="w-13 h-13 bg-slate-800 text-slate-500 rounded-2xl flex items-center justify-center border border-white/5 shrink-0"><Eye className="w-6 h-6" /></div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-10 pt-4">
        <p className="text-xs font-black text-slate-600 uppercase tracking-[0.4em] ml-2 flex items-center gap-3">
           <Layers className="w-5 h-5 text-neon-green" /> 科學分化系統系統庫
        </p>
        
        {splitSystems.map(system => (
          <div key={system.id} className="glass rounded-[44px] p-9 border-white/5 space-y-7 relative overflow-hidden bg-gradient-to-br from-slate-900/40 to-transparent">
            <div className="space-y-2.5">
               <h3 className="text-lg font-black italic uppercase text-white tracking-tighter">{system.title}</h3>
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
                        <div className="text-base font-black italic uppercase text-slate-200 truncate">{r.name.split(': ')[1] || r.name}</div>
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
      <input type="number" value={val} onChange={e => onChange(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 text-center text-lg font-black italic outline-none text-white focus:border-neon-green/20" />
      <span className="absolute bottom-1.5 right-2.5 text-[8px] font-black text-slate-700 uppercase">{unit}</span>
    </div>
  </div>
);