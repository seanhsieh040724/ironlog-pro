
import React, { useState, useMemo } from 'react';
import { WorkoutSession, ExerciseEntry, SetEntry } from '../types';
import { Plus, Trash2, Dumbbell, X, ChevronRight, Search, Save, PlusCircle, Check, MinusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMuscleGroup } from '../utils/fitnessMath';
import { RestTimer } from './RestTimer';

export const EXERCISE_DATABASE = [
  '槓鈴平板臥推', '啞鈴平板臥推', '槓鈴上斜臥推', '啞鈴上斜臥推', '史密斯平板臥推', '史密斯上斜臥推', 
  '器械推胸機', '蝴蝶機夾胸', '繩索十字夾胸', '雙槓撐體 (胸)', '引體向上', '寬握滑輪下拉', '窄握滑輪下拉', 'V柄滑輪下拉', '槓鈴划船', '單臂啞鈴划船', 
  '坐姿划船機', 'T桿划船', '地雷管划船', '繩索直臂下拉', '硬舉', '相撲硬舉', '羅馬尼亞硬舉 (RDL)', '山羊挺身',
  '槓鈴深蹲', '史密斯深蹲', '杯式深蹲', '腿部推蹬機 (Leg Press)', '腿部伸展機 (Leg Extension)', 
  '俯臥腿彎舉機 (Leg Curl)', '坐姿腿彎舉機', '保加利亞分腿蹲', '史密斯分腿蹲', '啞鈴弓箭步', 
  '器械提踵 (Calf Raise)', '臀推 (Hip Thrust)', '史密斯臀推',
  '槓鈴肩推', '啞鈴肩推', '史密斯肩推', '阿諾推舉', '啞鈴側平舉', '繩索側平舉', '器械側平舉', 
  '啞鈴前平舉', '反向蝴蝶機 (後三角)', '繩索面拉 (Face Pull)', '槓鈴聳肩', '啞鈴聳肩',
  '繩索直桿三頭下壓', '繩索V柄三頭下壓', '繩索雙頭繩下壓', '窄握槓鈴臥推', '仰臥三頭伸展 (Skull Crusher)', 
  '啞鈴三頭過頂伸展', '雙槓三頭撐體', '器械三頭伸展',
  '槓鈴彎舉', '啞鈴彎舉', '啞鈴鎚式彎舉', '牧師椅彎舉', '繩索彎舉', '集中彎舉',
  '捲腹', '懸垂抬腿', '俄羅斯轉體', '棒式 (Plank)', '健腹輪', '波比跳', '壺鈴擺盪', '藥球投擲'
];

interface WorkoutViewProps {
  session: WorkoutSession | null;
  onUpdate: (session: WorkoutSession) => void;
  onFinish: () => void;
}

export const WorkoutView: React.FC<WorkoutViewProps> = ({ session, onUpdate, onFinish }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newEx, setNewEx] = useState({ name: '', weight: '', sets: '4', reps: '10' });
  const [showRestTimer, setShowRestTimer] = useState(false);

  const suggestions = useMemo(() => {
    if (!newEx.name.trim()) return [];
    return EXERCISE_DATABASE.filter(ex => ex.includes(newEx.name)).slice(0, 10);
  }, [newEx.name]);

  if (!session) return null;

  const handleAddExercise = () => {
    if (!newEx.name) return;
    const setsCount = Math.max(1, Number(newEx.sets) || 1);
    const entry: ExerciseEntry = {
      id: crypto.randomUUID(),
      name: newEx.name,
      muscleGroup: getMuscleGroup(newEx.name),
      sets: Array.from({ length: setsCount }).map(() => ({
        id: crypto.randomUUID(),
        weight: Number(newEx.weight) || 0,
        reps: Number(newEx.reps) || 10,
        completed: false
      }))
    };
    onUpdate({ ...session, exercises: [entry, ...session.exercises] });
    setNewEx({ name: '', weight: '', sets: '4', reps: '10' });
    setIsAdding(false);
  };

  const toggleSetCompletion = (exerciseId: string, setId: string) => {
    const updatedExercises = session.exercises.map(ex => {
      if (ex.id === exerciseId) {
        const updatedSets = ex.sets.map(s => {
          if (s.id === setId) {
            const newCompleted = !s.completed;
            if (newCompleted) setShowRestTimer(true);
            return { ...s, completed: newCompleted };
          }
          return s;
        });
        return { ...ex, sets: updatedSets };
      }
      return ex;
    });
    onUpdate({ ...session, exercises: updatedExercises });
  };

  const updateSetData = (exerciseId: string, setId: string, updates: Partial<SetEntry>) => {
    const updatedExercises = session.exercises.map(ex => {
      if (ex.id === exerciseId) {
        const updatedSets = ex.sets.map(s => s.id === setId ? { ...s, ...updates } : s);
        return { ...ex, sets: updatedSets };
      }
      return ex;
    });
    onUpdate({ ...session, exercises: updatedExercises });
  };

  const addSetToExercise = (exerciseId: string) => {
    const updatedExercises = session.exercises.map(ex => {
      if (ex.id === exerciseId) {
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: SetEntry = {
          id: crypto.randomUUID(),
          weight: lastSet?.weight || 0,
          reps: lastSet?.reps || 10,
          completed: false
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      }
      return ex;
    });
    onUpdate({ ...session, exercises: updatedExercises });
  };

  // 修正後的組數刪除邏輯：即便是最後一組也能刪除（會詢問是否刪除動作）
  const removeSetFromExercise = (exerciseId: string, setId: string) => {
    const ex = session.exercises.find(e => e.id === exerciseId);
    if (!ex) return;

    if (ex.sets.length <= 1) {
      if (confirm(`這是最後一組了。要連同「${ex.name}」動作項目一起移除嗎？`)) {
        removeExercise(exerciseId);
      }
      return;
    }

    if (confirm('確定要移除這一組訓練嗎？')) {
      const updatedExercises = session.exercises.map(e => {
        if (e.id === exerciseId) {
          return { ...e, sets: e.sets.filter(s => s.id !== setId) };
        }
        return e;
      });
      onUpdate({ ...session, exercises: updatedExercises });
    }
  };

  // 強化動作刪除功能：確保點擊必生效
  const removeExercise = (id: string) => {
    const ex = session.exercises.find(e => e.id === id);
    if(confirm(`確定要完全移除「${ex?.name || '此動作'}」的所有紀錄嗎？`)) {
      onUpdate({ ...session, exercises: session.exercises.filter(e => e.id !== id) });
    }
  };

  return (
    <div className="space-y-5 pb-44">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-[10px] font-black italic uppercase tracking-[0.2em] text-slate-500">當前訓練 (CURRENT)</h2>
      </div>

      <div className="space-y-5">
        {session.exercises.length === 0 ? (
          <motion.button 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsAdding(true)}
            className="w-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[40px] bg-slate-900/10 active:bg-neon-green/5 transition-all group"
          >
             <div className="w-20 h-20 bg-white text-black rounded-full shadow-2xl flex items-center justify-center group-active:scale-90 transition-all border-4 border-[#020617] mb-5">
               <Plus className="w-10 h-10 stroke-[3]" />
             </div>
             <p className="text-sm font-black italic uppercase tracking-tighter text-white">立即新增動作項目</p>
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mt-2">鋼鐵般的意志從第一組開始</p>
          </motion.button>
        ) : (
          session.exercises.map((ex) => (
            <motion.div key={ex.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-[32px] p-6 border-white/5 shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black italic uppercase text-white leading-none mb-2">{ex.name}</h3>
                  <span className="text-[8px] font-black bg-neon-green/10 text-neon-green px-2 py-0.5 rounded uppercase tracking-[0.2em]">{ex.muscleGroup}</span>
                </div>
                {/* 增加刪除熱區 */}
                <button 
                  onClick={() => removeExercise(ex.id)} 
                  className="w-12 h-12 -mr-2 -mt-2 bg-slate-800/30 rounded-xl flex items-center justify-center text-slate-500 active:text-red-500 transition-colors"
                  aria-label="刪除動作"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 mb-5">
                <div className="grid grid-cols-12 gap-2 text-[7px] font-black text-slate-600 uppercase tracking-widest px-1">
                  <div className="col-span-1"></div>
                  <div className="col-span-2">組數</div>
                  <div className="col-span-4 text-center">重量 (KG)</div>
                  <div className="col-span-3 text-center">次數</div>
                  <div className="col-span-2 text-center">完成</div>
                </div>
                
                {ex.sets.map((set, index) => (
                  <div key={set.id} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-2xl transition-all ${set.completed ? 'bg-neon-green/5' : 'bg-black/30'}`}>
                    <div className="col-span-1 flex justify-center">
                       {/* 增加組數刪除按鈕的大小與反饋 */}
                       <button 
                         onClick={() => removeSetFromExercise(ex.id, set.id)} 
                         className="w-8 h-8 -ml-2 text-red-500/20 active:text-red-500 p-1 transition-all"
                         aria-label="刪除此組"
                       >
                          <MinusCircle className="w-5 h-5" />
                       </button>
                    </div>
                    <div className="col-span-2 text-xs font-black italic text-slate-500 pl-1">#{index + 1}</div>
                    
                    <div className="col-span-4">
                      <input 
                        type="number" 
                        value={set.weight} 
                        onChange={(e) => updateSetData(ex.id, set.id, { weight: Number(e.target.value) })}
                        className="w-full bg-slate-800/50 rounded-xl py-2 text-center text-sm font-black text-white outline-none focus:ring-1 ring-neon-green/30"
                      />
                    </div>
                    
                    <div className="col-span-3">
                      <input 
                        type="number" 
                        value={set.reps} 
                        onChange={(e) => updateSetData(ex.id, set.id, { reps: Number(e.target.value) })}
                        className="w-full bg-slate-800/50 rounded-xl py-2 text-center text-sm font-black text-white outline-none focus:ring-1 ring-neon-green/30"
                      />
                    </div>

                    <div className="col-span-2 flex justify-center">
                      <button 
                        onClick={() => toggleSetCompletion(ex.id, set.id)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${set.completed ? 'bg-neon-green text-black shadow-lg shadow-neon-green/20' : 'bg-slate-800 text-slate-600'}`}
                      >
                        <Check className="w-4 h-4 stroke-[4]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => addSetToExercise(ex.id)}
                className="w-full py-3 bg-white/5 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase text-slate-500 flex items-center justify-center gap-2 active:bg-white/10 active:text-slate-300 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" /> 新增下一組 (ADD SET)
              </button>
            </motion.div>
          ))
        )}
      </div>

      {session.exercises.length > 0 && (
        <>
          <div className="fixed bottom-[95px] left-0 right-0 z-50 flex justify-center px-6">
            <div className="w-full max-w-md">
              <button 
                onClick={onFinish}
                className="w-full bg-neon-green text-black font-black h-14 rounded-2xl uppercase italic tracking-tighter text-base shadow-[0_10px_30px_rgba(173,255,47,0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-black/5"
              >
                <Save className="w-5 h-5 stroke-[2.5]" /> 儲存本次訓練紀錄
              </button>
            </div>
          </div>

          <div className="fixed bottom-[165px] left-1/2 -translate-x-1/2 z-50">
            <button 
              onClick={() => setIsAdding(true)} 
              className="w-16 h-16 bg-white text-black rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all border-4 border-[#020617] glow-white"
            >
              <Plus className="w-8 h-8 stroke-[3]" />
            </button>
          </div>
        </>
      )}

      <RestTimer active={showRestTimer} seconds={90} onClose={() => setShowRestTimer(false)} />

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsAdding(false)} />
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              className="relative w-full max-w-md bg-slate-900 rounded-t-[44px] p-8 pb-12 border-t border-white/10 shadow-2xl safe-bottom"
            >
              <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-8" />
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">新增動作項目</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">選取訓練部位與參數</p>
                </div>
                <button onClick={() => setIsAdding(false)} className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 active:scale-90 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">動作名稱 (EXERCISE NAME)</label>
                  <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-2xl px-5 py-4">
                    <Search className="w-5 h-5 text-slate-600" />
                    <input 
                      autoFocus 
                      placeholder="搜尋或輸入，例如：深蹲..." 
                      value={newEx.name} 
                      onChange={e => setNewEx({...newEx, name: e.target.value})} 
                      className="bg-transparent w-full text-lg font-black italic outline-none text-white placeholder:text-slate-800" 
                    />
                  </div>
                  {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {suggestions.map(s => (
                        <button key={s} onClick={() => setNewEx({...newEx, name: s})} className="px-3 py-1.5 bg-slate-800/50 text-neon-green text-[10px] font-black rounded-xl border border-neon-green/10 uppercase transition-colors active:bg-neon-green active:text-black">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center block">預設重量</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={newEx.weight} 
                        placeholder="0"
                        onChange={e => setNewEx({...newEx, weight: e.target.value})} 
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 text-center text-lg font-black italic outline-none text-white focus:border-neon-green/30" 
                      />
                      <span className="absolute bottom-2 right-3 text-[8px] font-black text-slate-700 uppercase">KG</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center block">組數</label>
                    <input 
                      type="number" 
                      value={newEx.sets} 
                      onChange={e => setNewEx({...newEx, sets: e.target.value})} 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 text-center text-lg font-black italic outline-none text-white focus:border-neon-green/30" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center block">每組次數</label>
                    <input 
                      type="number" 
                      value={newEx.reps} 
                      onChange={e => setNewEx({...newEx, reps: e.target.value})} 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 text-center text-lg font-black italic outline-none text-white focus:border-neon-green/30" 
                    />
                  </div>
                </div>

                <button 
                  onClick={handleAddExercise} 
                  className="w-full bg-neon-green text-black font-black h-16 rounded-[28px] uppercase italic tracking-tighter text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all mt-4 shadow-xl"
                >
                   加入本次訓練項目 <ChevronRight className="w-5 h-5 stroke-[3]" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
