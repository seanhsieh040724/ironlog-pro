
import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { RoutineTemplate, ExerciseEntry, MuscleGroup } from '../types';
import { getMuscleGroup, getMuscleGroupDisplay } from '../utils/fitnessMath';
import { Play, Star, ChevronLeft, Zap, Eye, FolderHeart, LayoutGrid, Plus, Trash2, Search, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXERCISE_DATABASE } from './WorkoutView';

export const RoutineView: React.FC<{ onStartRoutine: (template: RoutineTemplate) => void }> = ({ onStartRoutine }) => {
  const context = useContext(AppContext);
  const [previewRoutine, setPreviewRoutine] = useState<RoutineTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newExName, setNewExName] = useState('');

  if (!context) return null;
  const { customRoutines, setCustomRoutines } = context;

  const recommendedRoutines: RoutineTemplate[] = [
    { id: 'ppl-push', name: 'PPL A：推系列 (胸/肩/三頭)', exercises: [
      { id: 'p1', name: '槓鈴臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 8, defaultWeight: 60 },
      { id: 'p2', name: '史密斯肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 10, defaultWeight: 30 },
      { id: 'p3', name: '蝴蝶機夾胸', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 40 },
      { id: 'p4', name: '繩索三頭下壓', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 25 }
    ] },
    { id: 'ppl-pull', name: 'PPL B：拉系列 (背部/二頭)', exercises: [
      { id: 'l1', name: '引體向上', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
      { id: 'l2', name: '坐姿划船機', muscleGroup: 'back', defaultSets: 3, defaultReps: 12, defaultWeight: 45 },
      { id: 'l3', name: '直臂下拉', muscleGroup: 'back', defaultSets: 3, defaultReps: 12, defaultWeight: 20 },
      { id: 'l4', name: '機械彎舉', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 15 }
    ] },
    { id: 'split-4-legs', name: '四分化：地獄下肢日', exercises: [
      { id: 'g1', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 80 },
      { id: 'g2', name: '腿部推蹬機', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 120 },
      { id: 'g3', name: '腿部伸展機', muscleGroup: 'quads', defaultSets: 3, defaultReps: 15, defaultWeight: 35 },
      { id: 'g4', name: '俯臥腿彎舉機', muscleGroup: 'hamstrings', defaultSets: 3, defaultReps: 12, defaultWeight: 30 }
    ] },
    { id: 'arnold-shoulders', name: '五分化：阿諾肩臂雕塑', exercises: [
      { id: 's1', name: '阿諾推舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 10, defaultWeight: 15 },
      { id: 's2', name: '側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 15, defaultWeight: 7.5 },
      { id: 's3', name: '槓鈴彎舉', muscleGroup: 'arms', defaultSets: 3, defaultReps: 10, defaultWeight: 30 },
      { id: 's4', name: '啞鈴三頭伸展', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 12.5 }
    ] }
  ];

  const createRoutine = () => {
    if (!newRoutineName.trim()) return;
    const newRoutine: RoutineTemplate = {
      id: crypto.randomUUID(),
      name: newRoutineName,
      exercises: []
    };
    setCustomRoutines([newRoutine, ...customRoutines]);
    setNewRoutineName('');
    setIsCreating(false);
    setPreviewRoutine(newRoutine);
  };

  const addExerciseToTemplate = (name: string) => {
    if (!previewRoutine || !name.trim()) return;
    const mg = getMuscleGroup(name);
    const newEx = {
      id: crypto.randomUUID(),
      name,
      muscleGroup: mg,
      defaultSets: 3,
      defaultReps: 10,
      defaultWeight: 0
    };
    const updated = { ...previewRoutine, exercises: [...previewRoutine.exercises, newEx] };
    setPreviewRoutine(updated);
    setCustomRoutines(customRoutines.map(r => r.id === previewRoutine.id ? updated : r));
    setNewExName('');
    setIsAddingExercise(false);
  };

  const deleteExerciseFromTemplate = (exId: string) => {
    if (!previewRoutine) return;
    const updated = { ...previewRoutine, exercises: previewRoutine.exercises.filter(e => e.id !== exId) };
    setPreviewRoutine(updated);
    setCustomRoutines(customRoutines.map(r => r.id === previewRoutine.id ? updated : r));
  };

  const suggestions = useMemo(() => {
    if (!newExName.trim()) return [];
    return EXERCISE_DATABASE.filter(ex => ex.toLowerCase().includes(newExName.toLowerCase())).slice(0, 8);
  }, [newExName]);

  if (previewRoutine) {
    const isCustom = customRoutines.some(r => r.id === previewRoutine.id);
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-24">
        <div className="flex items-center space-x-4 mb-4">
          <button onClick={() => setPreviewRoutine(null)} className="p-2 bg-slate-800 rounded-xl text-slate-400 active:scale-95 transition-all">
            <ChevronLeft />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-black italic tracking-tighter uppercase leading-tight">{previewRoutine.name}</h2>
            <span className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em]">編輯課表項目</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {previewRoutine.exercises.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center opacity-20 italic">
               <Dumbbell className="w-12 h-12 mb-2" />
               <p className="text-sm">課表內尚無動作項目</p>
            </div>
          ) : (
            previewRoutine.exercises.map((ex, idx) => (
              <div key={ex.id} className="glass rounded-3xl p-5 border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800/50 flex items-center justify-center text-neon-green font-black italic">{idx + 1}</div>
                  <div>
                    <h4 className="font-black text-white italic uppercase">{ex.name}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{getMuscleGroupDisplay(ex.muscleGroup).cn} • {ex.defaultSets} 組</p>
                  </div>
                </div>
                {isCustom && (
                  <button onClick={() => deleteExerciseFromTemplate(ex.id)} className="text-slate-700 hover:text-red-500 p-2 active:scale-90 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}

          {isCustom && (
            <div className="pt-4">
              {isAddingExercise ? (
                <div className="glass rounded-3xl p-6 border-neon-green/20 space-y-4">
                  <div className="flex items-center gap-2 border-b border-neon-green/20 pb-2">
                    <Search className="w-4 h-4 text-slate-500" />
                    <input 
                      autoFocus 
                      placeholder="搜尋史密斯、機械、器械..." 
                      value={newExName} 
                      onChange={e => setNewExName(e.target.value)} 
                      className="w-full bg-transparent font-black italic outline-none text-white" 
                    />
                  </div>
                  {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {suggestions.map(s => <button key={s} onClick={() => addExerciseToTemplate(s)} className="px-3 py-1.5 bg-slate-800 hover:bg-neon-green hover:text-black rounded-lg text-[9px] font-black uppercase text-slate-400">{s}</button>)}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => addExerciseToTemplate(newExName)} className="flex-1 bg-neon-green text-black font-black py-3 rounded-xl text-xs uppercase italic tracking-tighter">確認新增</button>
                    <button onClick={() => { setIsAddingExercise(false); setNewExName(''); }} className="px-5 bg-slate-800 text-white font-bold py-3 rounded-xl text-xs uppercase">取消</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setIsAddingExercise(true)} className="w-full py-5 border-2 border-dashed border-white/5 rounded-3xl text-slate-500 font-bold flex items-center justify-center hover:text-neon-green transition-all hover:border-neon-green/20">
                  <Plus className="w-4 h-4 mr-2" /> 新增課表動作項目
                </button>
              )}
            </div>
          )}
        </div>

        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-40">
          <button 
            disabled={previewRoutine.exercises.length === 0}
            onClick={() => { onStartRoutine(previewRoutine); setPreviewRoutine(null); }} 
            className="w-full bg-neon-green text-black font-black py-5 rounded-3xl glow-green flex items-center justify-center space-x-2 uppercase italic tracking-tighter text-lg shadow-2xl disabled:opacity-50 active:scale-95 transition-all"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>開始訓練</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-10 pb-32">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-sm font-black italic tracking-tighter uppercase flex items-center gap-2 text-slate-400">
          <LayoutGrid className="w-4 h-4 text-neon-green" /> 專業訓練課表庫
        </h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neon-green text-black text-[10px] font-black rounded-lg shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> 自訂新課表
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="glass rounded-[32px] p-6 border-neon-green/30 space-y-4 overflow-hidden">
            <input 
              autoFocus 
              placeholder="例如：週一胸部訓練..." 
              value={newRoutineName} 
              onChange={e => setNewRoutineName(e.target.value)}
              className="w-full bg-transparent border-b border-neon-green/30 py-3 text-lg font-black italic uppercase outline-none focus:border-neon-green transition-all"
            />
            <div className="flex gap-2">
              <button onClick={createRoutine} className="flex-1 bg-neon-green text-black font-black py-3 rounded-xl uppercase text-xs italic tracking-tighter">確認建立</button>
              <button onClick={() => setIsCreating(false)} className="px-5 bg-slate-800 text-white font-bold py-3 rounded-xl uppercase text-xs">取消</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {customRoutines.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-[10px] font-black italic text-slate-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
              <FolderHeart className="w-3 h-3 text-neon-green" /> 我的自定義訓練
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {customRoutines.map(r => (
                <RoutineCard key={r.id} routine={r} onPreview={setPreviewRoutine} onStart={onStartRoutine} onDelete={() => { if(confirm('確定要刪除此課表？')) setCustomRoutines(customRoutines.filter(rt => rt.id !== r.id)); }} isCustom />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h3 className="text-[10px] font-black italic text-slate-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
            <Star className="w-3 h-3 text-neon-green" /> 精選科學化課表
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {recommendedRoutines.map(r => <RoutineCard key={r.id} routine={r} onPreview={setPreviewRoutine} onStart={onStartRoutine} />)}
          </div>
        </section>
      </div>
    </div>
  );
};

const RoutineCard = ({ routine, onPreview, onStart, onDelete, isCustom }: any) => (
  <div className="glass rounded-[32px] p-6 border-white/5 relative overflow-hidden group hover:bg-white/[0.02] transition-all">
    <div className="relative z-10">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-black text-white italic uppercase leading-tight">{routine.name}</h3>
        {isCustom && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-slate-700 hover:text-red-500 p-1 active:scale-90 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">包含 {routine.exercises.length} 項訓練動作</p>
      <div className="mt-4 flex gap-2">
        <button onClick={() => onPreview(routine)} className="px-4 py-2 bg-slate-800 text-[10px] font-black text-slate-300 rounded-xl flex items-center gap-1 active:scale-95 transition-all"><Eye className="w-3 h-3" /> 檢視 / 編輯</button>
        <button onClick={() => onStart(routine)} className="px-4 py-2 bg-neon-green/10 text-[10px] font-black text-neon-green rounded-xl flex items-center gap-1 active:scale-95 transition-all"><Play className="w-3 h-3 fill-current" /> 開始訓練</button>
      </div>
    </div>
    <div className="absolute -bottom-2 -right-2 text-slate-800"><Zap className="w-16 h-16 opacity-[0.03]" /></div>
  </div>
);
