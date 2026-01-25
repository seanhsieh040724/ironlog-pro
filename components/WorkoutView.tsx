
import React, { useState, useMemo } from 'react';
import { WorkoutSession, ExerciseEntry } from '../types';
import { Plus, Trash2, Dumbbell, X, ChevronRight, Search, Activity, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMuscleGroup } from '../utils/fitnessMath';

// 完整的鋼鐵健身動作資料庫 - 包含精確器械與動作
export const EXERCISE_DATABASE = [
  // --- 胸部 (Chest) ---
  '槓鈴平放臥推', '啞鈴平放臥推', '槓鈴上斜臥推', '啞鈴上斜臥推', '史密斯平放臥推', '史密斯上斜臥推', 
  '器械推胸機', '蝴蝶機夾胸', '繩索十字夾胸', '雙槓撐體 (胸)', '仰臥啞鈴套衫', '伏地挺身',
  
  // --- 背部 (Back) ---
  '引體向上', '寬握滑輪下拉', '窄握滑輪下拉', 'V柄滑輪下拉', '槓鈴划船', '單臂啞鈴划船', 
  '坐姿划船機', 'T桿划船', '地雷管划船', '繩索直臂下拉', '硬舉', '相撲硬舉', '羅馬尼亞硬舉 (RDL)', '山羊挺身',
  
  // --- 腿部 (Legs) ---
  '槓鈴深蹲', '史密斯深蹲', '杯式深蹲', '腿部推蹬機 (Leg Press)', '腿部伸展機 (Leg Extension)', 
  '俯臥腿彎舉機 (Leg Curl)', '坐姿腿彎舉機', '保加利亞分腿蹲', '史密斯分腿蹲', '啞鈴弓箭步', 
  '器械提踵 (Calf Raise)', '臀推 (Hip Thrust)', '史密斯臀推',
  
  // --- 肩部 (Shoulders) ---
  '槓鈴肩推', '啞鈴肩推', '史密斯肩推', '阿諾推舉', '啞鈴側平舉', '繩索側平舉', '器械側平舉', 
  '啞鈴前平舉', '反向蝴蝶機 (後三角)', '繩索面拉 (Face Pull)', '槓鈴聳肩', '啞鈴聳肩',
  
  // --- 手臂 - 三頭 (Triceps) ---
  '繩索直桿三頭下壓', '繩索V柄三頭下壓', '繩索雙頭繩下壓', '窄握槓鈴臥推', '仰臥三頭伸展 (Skull Crusher)', 
  '啞鈴三頭過頂伸展', '雙槓三頭撐體', '器械三頭伸展',
  
  // --- 手臂 - 二頭 (Biceps) ---
  '槓鈴彎舉', '啞鈴彎舉', '啞鈴鎚式彎舉', '牧師椅彎舉', '繩索彎舉', '集中彎舉',
  
  // --- 核心與功能性 (Core & Others) ---
  '捲腹', '懸垂抬腿', '俄羅斯轉體', '棒式 (Plank)', '健腹輪', '波比跳', '壺鈴擺盪', '藥球投擲'
];

interface WorkoutViewProps {
  session: WorkoutSession | null;
  onUpdate: (session: WorkoutSession) => void;
  onFinish: () => void;
}

export const WorkoutView: React.FC<WorkoutViewProps> = ({ session, onUpdate, onFinish }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newEx, setNewEx] = useState({ name: '', weight: '', sets: '', reps: '' });

  // 搜尋建議邏輯
  const suggestions = useMemo(() => {
    if (!newEx.name.trim()) return [];
    const search = newEx.name.toLowerCase();
    return EXERCISE_DATABASE.filter(ex => 
      ex.toLowerCase().includes(search)
    ).slice(0, 12);
  }, [newEx.name]);

  if (!session) return null;

  const handleAddExercise = (targetName?: string) => {
    const exName = targetName || newEx.name;
    if (!exName) return;

    const s = Number(newEx.sets) || 3;
    const r = Number(newEx.reps) || 12;
    const w = Number(newEx.weight) || 0;

    const entry: ExerciseEntry = {
      id: crypto.randomUUID(),
      name: exName,
      muscleGroup: getMuscleGroup(exName),
      sets: Array.from({ length: s }).map(() => ({
        id: crypto.randomUUID(),
        weight: w,
        reps: r,
        completed: true
      }))
    };

    onUpdate({ ...session, exercises: [entry, ...session.exercises] });
    setNewEx({ name: '', weight: '', sets: '', reps: '' });
    setIsAdding(false);
  };

  const removeExercise = (id: string) => {
    onUpdate({ ...session, exercises: session.exercises.filter(e => e.id !== id) });
  };

  return (
    <div className="space-y-6 min-h-[60vh] relative">
      {/* 動作卡片清單 */}
      <div className="space-y-4">
        {session.exercises.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-700 italic border-2 border-dashed border-white/5 rounded-[40px] bg-slate-900/20">
             <Dumbbell className="w-16 h-16 mb-4 opacity-10 animate-pulse" />
             <p className="text-sm font-black uppercase tracking-widest opacity-40">Iron Will. Recorded.</p>
             <p className="text-[10px] mt-2 opacity-30 tracking-widest">點擊右下方按鈕新增紀錄</p>
          </div>
        ) : (
          session.exercises.map((ex, idx) => (
            <motion.div 
              key={ex.id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass rounded-[32px] p-6 border-white/5 shadow-2xl relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <h3 className="text-xl font-black italic uppercase text-neon-green tracking-tight">{ex.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black bg-neon-green/10 text-neon-green px-2 py-0.5 rounded-full uppercase">
                      {ex.muscleGroup}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      {ex.sets.length} Sets Completed
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => removeExercise(ex.id)} 
                  className="p-2.5 bg-slate-800/50 rounded-2xl text-slate-600 hover:text-red-500 active:scale-90 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-3 relative z-10">
                <StatCard label="WEIGHT" val={ex.sets[0]?.weight} unit="KG" />
                <StatCard label="SETS" val={ex.sets.length} unit="S" />
                <StatCard label="REPS" val={ex.sets[0]?.reps} unit="R" />
              </div>
            </motion.div>
          ))
        )}
      </div>

      {session.exercises.length > 0 && (
        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onFinish} 
          className="w-full py-6 bg-neon-green text-black font-black rounded-[32px] uppercase italic shadow-[0_15px_30px_rgba(173,255,47,0.2)] tracking-tighter text-lg active:scale-95 transition-all mb-20"
        >
          儲存本次訓練紀錄
        </motion.button>
      )}

      {/* 懸浮按鈕 (FAB) - 確保在導覽列上方且明顯 */}
      <div className="fixed bottom-[110px] right-6 z-40">
        <button 
          onClick={() => setIsAdding(true)} 
          className="w-16 h-16 bg-neon-green text-black rounded-full shadow-[0_15px_40px_rgba(173,255,47,0.5)] flex items-center justify-center active:scale-90 transition-all border-4 border-[#020617] glow-green"
        >
          <Plus className="w-9 h-9 stroke-[3]" />
        </button>
      </div>

      {/* 新增動作彈窗 (Bottom Sheet) */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/95 backdrop-blur-xl" 
              onClick={() => setIsAdding(false)} 
            />
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-slate-900 rounded-t-[48px] p-8 pb-12 border-t border-white/10 shadow-2xl safe-bottom max-h-[90vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-8" />
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Add Exercise</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">搜尋器械或自由動作</p>
                </div>
                <button onClick={() => setIsAdding(false)} className="p-3 bg-slate-800 rounded-2xl text-slate-400 active:scale-90 transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-3 relative">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">動作名稱 / 搜尋庫</label>
                  <div className="flex items-center gap-4 bg-black/40 border border-white/5 rounded-[24px] px-6 py-5 focus-within:border-neon-green/30 transition-all shadow-inner">
                    <Search className="w-5 h-5 text-slate-600" />
                    <input 
                      autoFocus 
                      placeholder="關鍵字：史密斯、繩索、三頭..." 
                      value={newEx.name} 
                      onChange={e => setNewEx({...newEx, name: e.target.value})} 
                      className="bg-transparent w-full text-xl font-black italic outline-none text-white placeholder:text-slate-800" 
                    />
                  </div>
                  
                  {/* 建議列表 */}
                  <AnimatePresence>
                    {suggestions.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap gap-2 pt-2"
                      >
                        {suggestions.map(s => (
                          <button 
                            key={s} 
                            onClick={() => {setNewEx({...newEx, name: s}); }} 
                            className="px-4 py-2 bg-slate-800 text-neon-green text-[10px] font-black rounded-xl border border-neon-green/10 active:bg-neon-green active:text-black transition-all"
                          >
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-3 gap-5">
                  <NumInput label="WEIGHT" unit="KG" val={newEx.weight} onChange={v => setNewEx({...newEx, weight: v})} />
                  <NumInput label="SETS" unit="S" val={newEx.sets} onChange={v => setNewEx({...newEx, sets: v})} />
                  <NumInput label="REPS" unit="R" val={newEx.reps} onChange={v => setNewEx({...newEx, reps: v})} />
                </div>

                <button 
                  onClick={() => handleAddExercise()} 
                  className="w-full bg-neon-green text-black font-black py-6 rounded-[32px] uppercase italic tracking-tighter text-xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-neon-green/10"
                >
                   加入訓練清單 <ChevronRight className="w-6 h-6 stroke-[3]" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ label, val, unit }: any) => (
  <div className="bg-black/20 rounded-2xl p-4 border border-white/5 text-center">
    <div className="text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">{label}</div>
    <div className="flex items-baseline justify-center gap-1">
      <span className="text-xl font-black italic text-white">{val || 0}</span>
      <span className="text-[8px] font-black text-neon-green opacity-50">{unit}</span>
    </div>
  </div>
);

const NumInput = ({ label, unit, val, onChange }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-center">{label}</label>
    <div className="relative">
      <input 
        type="number" 
        placeholder="0" 
        value={val} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 text-center text-2xl font-black italic outline-none focus:border-neon-green/50 text-white shadow-inner" 
      />
      <span className="absolute bottom-2 right-4 text-[8px] font-black text-slate-700">{unit}</span>
    </div>
  </div>
);
