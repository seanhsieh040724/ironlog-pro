
import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { RoutineTemplate } from '../types';
import { getMuscleGroup } from '../utils/fitnessMath';
import { Eye, LayoutGrid, Trash2, ArrowLeft, Plus, ChevronRight, Save, X, Search, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXERCISE_DATABASE } from './WorkoutView';

export const RoutineView: React.FC<{ onStartRoutine: (template: RoutineTemplate) => void }> = ({ onStartRoutine }) => {
  const context = useContext(AppContext);
  const [previewRoutine, setPreviewRoutine] = useState<RoutineTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  
  // 新動作編輯狀態
  const [newEx, setNewEx] = useState({ name: '', weight: '0', sets: '4', reps: '10' });

  if (!context) return null;
  const { customRoutines, setCustomRoutines } = context;

  const recommendedRoutines: RoutineTemplate[] = [
    { id: '2-split-upper', name: '二分化：上半身 (胸背肩手)', exercises: [
      { id: 'u1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 8, defaultWeight: 60 },
      { id: 'u2', name: '引體向上', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
      { id: 'u3', name: '啞鈴肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 10, defaultWeight: 20 }
    ] },
    { id: '2-split-lower', name: '二分化：下半身 (腿部/核心)', exercises: [
      { id: 'l1', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 80 },
      { id: 'l2', name: '羅馬尼亞硬舉', muscleGroup: 'hamstrings', defaultSets: 3, defaultReps: 10, defaultWeight: 70 }
    ] },
    { id: '5-split-chest', name: '五分化：胸部專日 (PUMP)', exercises: [
      { id: 'c1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 5, defaultReps: 8, defaultWeight: 60 },
      { id: 'c2', name: '蝴蝶機夾胸', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 45 }
    ] }
  ];

  const createRoutine = () => {
    if (!newRoutineName.trim()) return;
    const newRoutine: RoutineTemplate = { id: crypto.randomUUID(), name: newRoutineName, exercises: [] };
    setCustomRoutines([newRoutine, ...customRoutines]);
    setNewRoutineName('');
    setIsCreating(false);
    setPreviewRoutine(newRoutine);
  };

  // 強化課表刪除功能
  const deleteRoutine = (id: string) => {
    if (confirm('確定要永久刪除此自訂課表範本嗎？此動作無法復原。')) {
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
    if (!previewRoutine || !newEx.name) return;
    
    const newEntry = {
      id: crypto.randomUUID(),
      name: newEx.name,
      muscleGroup: getMuscleGroup(newEx.name),
      defaultSets: Number(newEx.sets) || 4,
      defaultReps: Number(newEx.reps) || 10,
      defaultWeight: Number(newEx.weight) || 0
    };

    const updatedRoutine = {
      ...previewRoutine,
      exercises: [...previewRoutine.exercises, newEntry]
    };

    setCustomRoutines(prev => prev.map(r => r.id === previewRoutine.id ? updatedRoutine : r));
    setPreviewRoutine(updatedRoutine);
    setNewEx({ name: '', weight: '0', sets: '4', reps: '10' });
    setIsAddingExercise(false);
  };

  // 強化動作移除功能
  const removeExerciseFromTemplate = (exId: string) => {
    if (!previewRoutine) return;
    const exName = previewRoutine.exercises.find(e => e.id === exId)?.name;
    if (confirm(`確定要從此課表中移除「${exName || '此動作'}」嗎？`)) {
      const updatedRoutine = {
        ...previewRoutine,
        exercises: previewRoutine.exercises.filter(e => e.id !== exId)
      };
      setCustomRoutines(prev => prev.map(r => r.id === previewRoutine.id ? updatedRoutine : r));
      setPreviewRoutine(updatedRoutine);
    }
  };

  const suggestions = useMemo(() => {
    if (!newEx.name.trim()) return [];
    return EXERCISE_DATABASE.filter(ex => ex.includes(newEx.name)).slice(0, 8);
  }, [newEx.name]);

  if (previewRoutine) {
    const isCustom = customRoutines.some(r => r.id === previewRoutine.id);
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-44">
        <div className="flex items-center gap-4 px-1">
          <button 
            onClick={() => setPreviewRoutine(null)} 
            className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-neon-green active:scale-90 transition-all border border-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 overflow-hidden">
            {isEditingName ? (
              <div className="flex gap-2">
                <input 
                  autoFocus
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  onBlur={renameRoutine}
                  onKeyDown={e => e.key === 'Enter' && renameRoutine()}
                  className="bg-black/40 border-b border-neon-green text-lg font-black italic text-white outline-none w-full uppercase"
                />
                <button onClick={renameRoutine} className="p-2 text-neon-green"><Check className="w-5 h-5" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black italic tracking-tighter uppercase truncate text-white">{previewRoutine.name}</h2>
                {isCustom && <button onClick={() => { setTempName(previewRoutine.name); setIsEditingName(true); }} className="p-1.5 bg-slate-800/50 rounded-lg text-slate-500 active:text-neon-green"><Edit2 className="w-3 h-3" /></button>}
              </div>
            )}
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">預覽訓練清單內容</p>
          </div>
          {isCustom && (
             <button onClick={() => deleteRoutine(previewRoutine.id)} className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center active:scale-90 transition-all border border-red-500/10 shadow-lg" aria-label="刪除此課表">
                <Trash2 className="w-5 h-5" />
             </button>
          )}
        </div>
        
        <div className="space-y-3">
          {previewRoutine.exercises.length === 0 ? (
            <div className="py-20 text-center glass rounded-[32px] border-dashed border-white/10 italic text-slate-700 text-[10px] uppercase tracking-widest">
              目前此課表範本尚無動作
            </div>
          ) : (
            previewRoutine.exercises.map((ex, idx) => (
              <div key={ex.id} className="glass rounded-[28px] p-5 border-white/5 flex items-center justify-between shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-neon-green text-xs font-black italic border border-white/5">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-black text-base text-white italic uppercase tracking-tight">{ex.name}</h4>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">{ex.defaultWeight}KG | {ex.defaultSets} 組 | {ex.defaultReps} 次</p>
                  </div>
                </div>
                {isCustom && (
                  <button onClick={() => removeExerciseFromTemplate(ex.id)} className="w-10 h-10 bg-slate-800/30 rounded-xl flex items-center justify-center text-slate-700 active:text-red-500 transition-colors" aria-label="移除動作">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {isCustom && (
          <button 
            onClick={() => setIsAddingExercise(true)}
            className="w-full py-4 bg-white/5 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase text-slate-500 flex items-center justify-center gap-2 active:bg-white/10 active:text-slate-300 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> 新增動作到此課表範本
          </button>
        )}
        
        <div className="fixed bottom-[95px] left-0 right-0 z-50 flex justify-center px-6">
          <div className="w-full max-w-md">
            <button 
              onClick={() => { onStartRoutine(previewRoutine); setPreviewRoutine(null); }} 
              className="w-full bg-neon-green text-black font-black h-14 rounded-2xl uppercase italic tracking-tighter text-base shadow-[0_10px_30px_rgba(173,255,47,0.2)] flex items-center justify-center gap-3 active:scale-[0.98] transition-all border border-black/5"
            >
              帶入今日訓練開始行動 <ChevronRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isAddingExercise && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsAddingExercise(false)} />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative w-full max-w-md bg-slate-900 rounded-t-[44px] p-8 pb-12 border-t border-white/10 shadow-2xl safe-bottom">
                <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-8" />
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">設定課表預設動作</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">這些設定將在開始訓練時自動帶入</p>
                  </div>
                  <button onClick={() => setIsAddingExercise(false)} className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 active:scale-90 transition-all"><X className="w-6 h-6" /></button>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">動作名稱</label>
                    <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-2xl px-5 py-4">
                      <Search className="w-5 h-5 text-slate-600" />
                      <input 
                        autoFocus 
                        placeholder="搜尋或手動輸入動作..." 
                        value={newEx.name} 
                        onChange={e => setNewEx({...newEx, name: e.target.value})} 
                        className="bg-transparent w-full text-lg font-black italic outline-none text-white placeholder:text-slate-800" 
                      />
                    </div>
                    {suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {suggestions.map(s => (
                          <button key={s} onClick={() => setNewEx({...newEx, name: s})} className="px-3 py-1.5 bg-slate-800/50 text-neon-green text-[10px] font-black rounded-xl border border-neon-green/10 uppercase transition-all active:bg-neon-green active:text-black">{s}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <InputSmall label="重量" unit="KG" val={newEx.weight} onChange={v => setNewEx({...newEx, weight: v})} />
                    <InputSmall label="組數" unit="組" val={newEx.sets} onChange={v => setNewEx({...newEx, sets: v})} />
                    <InputSmall label="次數" unit="次" val={newEx.reps} onChange={v => setNewEx({...newEx, reps: v})} />
                  </div>
                  <button onClick={addExerciseToTemplate} className="w-full bg-neon-green text-black font-black h-16 rounded-[28px] uppercase italic tracking-tighter text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all mt-4 shadow-xl">
                     儲存到課表範本 <Save className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-sm font-black italic tracking-tighter uppercase flex items-center gap-2 text-slate-400">
          <LayoutGrid className="w-5 h-5 text-neon-green" /> 訓練課表範本庫
        </h2>
        <button onClick={() => setIsCreating(true)} className="px-4 py-2 bg-white/5 text-neon-green text-[10px] font-black rounded-xl uppercase border border-white/5 active:bg-neon-green active:text-black transition-all shadow-lg shadow-neon-green/5">
          + 建立課表
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="glass rounded-[32px] p-8 border-neon-green/30 space-y-6 overflow-hidden shadow-2xl">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neon-green uppercase tracking-[0.3em] ml-1">新課表範本名稱</label>
              <input autoFocus placeholder="例如：胸背拉推日..." value={newRoutineName} onChange={e => setNewRoutineName(e.target.value)} className="w-full bg-transparent border-b-2 border-neon-green/30 py-3 text-2xl font-black italic uppercase outline-none text-white placeholder:text-slate-800 focus:border-neon-green transition-all" />
            </div>
            <div className="flex gap-4">
              <button onClick={createRoutine} className="flex-1 bg-neon-green text-black font-black py-4 rounded-2xl uppercase italic text-sm active:scale-95 transition-all shadow-lg shadow-neon-green/10">建立範本</button>
              <button onClick={() => setIsCreating(false)} className="px-8 bg-slate-800 text-white font-bold py-4 rounded-2xl uppercase text-[11px] active:scale-95 transition-all">取消</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-10">
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-2">自訂範本 (CUSTOM)</p>
          {customRoutines.length === 0 ? (
            <div className="p-12 text-center glass rounded-[36px] border-white/5 italic text-slate-700 text-[10px] uppercase tracking-widest leading-loose">
              目前尚未建立任何自訂課表範本<br/>點擊右上方按鈕開始建立
            </div>
          ) : (
            customRoutines.map(r => (
              <div key={r.id} onClick={() => setPreviewRoutine(r)} className="glass rounded-[32px] p-6 border-white/5 active:scale-[0.98] transition-all flex justify-between items-center group relative overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-neon-green/5 opacity-0 group-active:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <h3 className="text-lg font-black text-white italic uppercase leading-tight tracking-tight">{r.name}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-widest">{r.exercises.length} 項訓練項目</p>
                </div>
                <div className="relative z-10 w-12 h-12 bg-slate-800 text-slate-500 group-active:text-neon-green rounded-2xl flex items-center justify-center transition-all border border-white/5">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-2">推薦科學分化 (SPLITS)</p>
          {recommendedRoutines.map(r => (
            <div key={r.id} onClick={() => setPreviewRoutine(r)} className="glass rounded-[32px] p-6 border-white/5 opacity-80 active:opacity-100 active:scale-[0.98] transition-all flex justify-between items-center group shadow-md">
              <div>
                <h3 className="text-lg font-black text-slate-300 italic uppercase leading-none tracking-tight">{r.name}</h3>
                <p className="text-[10px] font-bold text-slate-600 uppercase mt-2 tracking-widest">官方預設科學訓練流程</p>
              </div>
              <ChevronRight className="text-slate-700 group-active:text-neon-green w-5 h-5 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const InputSmall = ({ label, unit, val, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center block">{label}</label>
    <div className="relative">
      <input type="number" value={val} onChange={e => onChange(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 text-center text-base font-black italic outline-none text-white focus:border-neon-green/20" />
      <span className="absolute bottom-1 right-2 text-[6px] font-black text-slate-700 uppercase">{unit}</span>
    </div>
  </div>
);
