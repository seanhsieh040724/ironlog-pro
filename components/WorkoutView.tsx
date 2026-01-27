
import React, { useState, useMemo, useContext, useEffect } from 'react';
import { WorkoutSession, ExerciseEntry, SetEntry, MuscleGroup } from '../types';
import { 
  Plus, Trash2, Search, Save, PlusCircle, 
  Check, MinusCircle, Target, Sparkles, ChevronRight, ChevronLeft, Loader2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMuscleGroup, getMuscleGroupDisplay, fetchExerciseGif } from '../utils/fitnessMath';
import { AppContext } from '../App';
import * as Silhouettes from './WorkoutIcons';

// 智慧圖示映射函數
export const getExerciseIcon = (name: string, isActive: boolean = false) => {
  const n = name.toLowerCase();
  const props = { 
    className: `w-full h-full transition-all duration-500 ${isActive ? 'text-neon-green' : 'text-slate-500'}` 
  };
  
  if (n.includes('臥推') || n.includes('推胸') || n.includes('夾胸') || n.includes('bench')) return <Silhouettes.ChestIcon {...props} />;
  if (n.includes('深蹲') || n.includes('腿') || n.includes('蹲') || n.includes('squat') || n.includes('leg')) return <Silhouettes.LegIcon {...props} />;
  if (n.includes('引體向上') || n.includes('下拉') || n.includes('划船') || n.includes('row') || n.includes('pull')) return <Silhouettes.BackIcon {...props} />;
  if (n.includes('硬舉') || n.includes('deadlift')) return <Silhouettes.DeadliftIcon {...props} />;
  if (n.includes('肩推') || n.includes('平舉') || n.includes('shoulder') || n.includes('press')) return <Silhouettes.ShoulderIcon {...props} />;
  if (n.includes('彎舉') || n.includes('下壓') || n.includes('二頭') || n.includes('三頭') || n.includes('arm')) return <Silhouettes.ArmIcon {...props} />;
  if (n.includes('捲腹') || n.includes('棒式') || n.includes('核心') || n.includes('abs') || n.includes('core')) return <Silhouettes.CoreIcon {...props} />;
  
  return <Silhouettes.GenericIcon {...props} />;
};

export const ORGANIZED_EXERCISES: Record<string, string[]> = {
  'chest': ['槓鈴平板臥推', '槓鈴上斜臥推', '啞鈴平板臥推', '啞鈴上斜臥推', '史密斯平板臥推', '坐姿器械推胸', '蝴蝶機夾胸', '滑輪高位交叉', '雙槓撐體', '標準俯地挺身', '啞鈴下斜臥推', '史密斯上斜臥推'],
  'back': ['引體向上', '滑輪下拉', '槓鈴划船', '啞鈴單臂划船', '坐姿划船', 'T桿划船', '直臂滑輪下拉', '傳統硬舉', '羅馬尼亞硬舉', '山羊挺身', '單臂滑輪划船', '反握下拉'],
  'shoulders': ['啞鈴肩推', '槓鈴肩推', '阿諾肩推', '器械肩推', '啞鈴側平舉', '滑輪側平舉', '啞鈴前平舉', '蝴蝶機後三角飛鳥', '滑輪面拉', '槓鈴聳肩', '啞鈴俯身飛鳥', '六角槓聳肩'],
  'legs': ['槓鈴深蹲', '啞鈴杯式深蹲', '器械腿部推蹬', '保加利亞分腿蹲', '哈克深蹲', '器械腿伸展', '坐姿腿屈伸', '槓鈴臀推', '負重箭步蹲', '站姿提踵', '相撲硬舉', '器械內收/外展'],
  'arms': ['槓鈴彎舉', '啞鈴交替彎舉', '啞鈴錘式彎舉', '牧師椅彎舉', '滑輪繩索下壓', '窄握槓鈴臥推', '仰臥槓鈴臂屈伸', '啞鈴頸後臂屈伸', '雙槓臂屈伸', '反握彎舉', '二頭肌器械彎舉', '三頭肌繩索過頭伸展'],
  'core': ['標準捲腹', '仰臥抬腿', '棒式', '俄羅斯轉體', '健腹輪', '腳踏車捲腹', '懸垂提膝', '登山者', '側棒式', '跪姿滑輪捲腹', '反向捲腹', '側向捲腹']
};

export const EXERCISE_DATABASE = Object.values(ORGANIZED_EXERCISES).flat();

interface WorkoutViewProps {
  session: WorkoutSession | null;
  onUpdate: (session: WorkoutSession) => void;
  onFinish: () => void;
}

export const WorkoutView: React.FC<WorkoutViewProps> = ({ session, onUpdate, onFinish }) => {
  const context = useContext(AppContext);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('chest');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentGif, setCurrentGif] = useState<string | null>(null);
  const [isGifLoading, setIsGifLoading] = useState(false);
  const [hasGifError, setHasGifError] = useState(false);

  const filteredExercises = useMemo(() => {
    if (!searchTerm.trim()) return ORGANIZED_EXERCISES[activeCategory] || [];
    return EXERCISE_DATABASE.filter(ex => ex.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 20);
  }, [searchTerm, activeCategory]);

  const currentDetailEx = useMemo(() => 
    session?.exercises.find(e => e.id === activeExerciseId),
  [session, activeExerciseId]);

  useEffect(() => {
    if (activeExerciseId && currentDetailEx) {
      const name = currentDetailEx.name.trim();
      
      // 完全寫死「啞鈴上斜臥推」的處理
      if (name === '啞鈴上斜臥推') {
        setCurrentGif('https://raw.githubusercontent.com/seanhsieh040724/ironlog-pro/refs/heads/main/incline-press.gif');
        setIsGifLoading(false);
        setHasGifError(false);
        return;
      }

      setIsGifLoading(true);
      setHasGifError(false);
      fetchExerciseGif(name)
        .then(url => {
          setCurrentGif(url);
          setIsGifLoading(false);
        })
        .catch(() => {
          setHasGifError(true);
          setIsGifLoading(false);
        });
    }
  }, [activeExerciseId, currentDetailEx?.name]);

  if (!session) return null;

  const handleAddExercise = (exName: string) => {
    const newExId = crypto.randomUUID();
    const entry: ExerciseEntry = {
      id: newExId,
      name: exName,
      muscleGroup: getMuscleGroup(exName),
      sets: Array.from({ length: 4 }).map((_, idx) => ({
        id: crypto.randomUUID(),
        weight: 0, 
        reps: 10,
        completed: false
      }))
    };
    onUpdate({ ...session, exercises: [...session.exercises, entry] });
    setActiveExerciseId(newExId); 
    setSearchTerm('');
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const toggleSetCompletion = (exerciseId: string, setId: string) => {
    onUpdate({
      ...session,
      exercises: session.exercises.map(ex => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map(s => {
              if (s.id === setId) {
                const newCompleted = !s.completed;
                if (newCompleted && context) context.triggerRestTimer();
                return { ...s, completed: newCompleted };
              }
              return s;
            })
          };
        }
        return ex;
      })
    });
  };

  const updateSetData = (exerciseId: string, setId: string, updates: Partial<SetEntry>) => {
    onUpdate({
      ...session,
      exercises: session.exercises.map(ex => {
        if (ex.id === exerciseId) {
          return { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, ...updates } : s) };
        }
        return ex;
      })
    });
  };

  const addSetToExercise = (exerciseId: string) => {
    onUpdate({
      ...session,
      exercises: session.exercises.map(ex => {
        if (ex.id === exerciseId) {
          const lastSet = ex.sets[ex.sets.length - 1];
          return { 
            ...ex, 
            sets: [...ex.sets, {
              id: crypto.randomUUID(),
              weight: lastSet?.weight || 0,
              reps: lastSet?.reps || 10,
              completed: false
            }] 
          };
        }
        return ex;
      })
    });
  };

  const removeSetFromExercise = (exerciseId: string, setId: string) => {
    onUpdate({ 
      ...session, 
      exercises: session.exercises.map(e => e.id === exerciseId ? { ...e, sets: e.sets.filter(s => s.id !== setId) } : e) 
    });
  };

  const removeExercise = (id: string) => {
    if(confirm(`確定要移除此動作紀錄嗎？`)) {
      onUpdate({ ...session, exercises: session.exercises.filter(e => e.id !== id) });
      if (activeExerciseId === id) setActiveExerciseId(null);
    }
  };

  return (
    <div className="relative min-h-screen">
      <AnimatePresence mode="wait">
        {!activeExerciseId ? (
          <motion.div key="overview" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 pb-40">
            <div className="space-y-6 pt-2">
              <div className="px-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-neon-green" />
                  <h3 className="text-xs font-black italic uppercase tracking-[0.2em] text-white">點擊動作開始訓練</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-slate-900/80 border border-white/5 rounded-2xl px-5 py-3.5 shadow-inner">
                  <Search className="w-4 h-4 text-slate-600" />
                  <input placeholder="搜尋動作..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent w-full text-sm font-black italic outline-none text-white placeholder:text-slate-800" />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {Object.keys(ORGANIZED_EXERCISES).map(cat => (
                    <button key={cat} onClick={() => { setActiveCategory(cat); setSearchTerm(''); }} className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${!searchTerm && activeCategory === cat ? 'bg-neon-green text-black border-neon-green' : 'bg-slate-900/40 text-slate-500 border-white/5'}`}>{getMuscleGroupDisplay(cat as MuscleGroup).cn}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {filteredExercises.map(exName => (
                    <motion.button key={exName} whileTap={{ scale: 0.95 }} onClick={() => handleAddExercise(exName)} className="p-4 rounded-2xl text-left bg-slate-900/40 border border-white/5 hover:border-neon-green/30 transition-all flex items-start gap-3">
                      <div className="w-9 h-9 shrink-0 bg-slate-800 rounded-lg flex items-center justify-center p-1">{getExerciseIcon(exName)}</div>
                      <div className="overflow-hidden">
                        <div className="text-[11px] font-black italic uppercase text-slate-200 truncate">{exName}</div>
                        <div className="text-[7px] font-bold text-slate-700 uppercase tracking-widest mt-1">{getMuscleGroupDisplay(getMuscleGroup(exName)).cn}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 pb-40">
            <div className="flex items-center justify-between">
              <button onClick={() => setActiveExerciseId(null)} className="flex items-center gap-2 text-slate-400 active:text-neon-green transition-colors py-2"><ChevronLeft className="w-6 h-6" /><span className="text-[10px] font-black uppercase tracking-widest">返回</span></button>
              <h2 className="text-xl font-black italic uppercase text-white truncate max-w-[200px]">{currentDetailEx?.name}</h2>
              <button onClick={() => removeExercise(currentDetailEx!.id)} className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500/40"><Trash2 className="w-4 h-4" /></button>
            </div>

            {/* 核心示範圖：強制置頂，寫死樣式 */}
            <div className="w-full relative px-1">
              {isGifLoading && currentDetailEx?.name !== '啞鈴上斜臥推' ? (
                <div className="w-full aspect-video bg-slate-900/50 rounded-[15px] flex items-center justify-center border border-white/5"><Loader2 className="w-8 h-8 animate-spin text-neon-green" /></div>
              ) : hasGifError && currentDetailEx?.name !== '啞鈴上斜臥推' ? (
                <div className="w-full aspect-video bg-slate-900/50 rounded-[15px] flex flex-col items-center justify-center text-slate-700 border border-white/5 p-8 text-center"><AlertCircle className="w-8 h-8 mb-2" /><span className="text-[10px] font-black uppercase tracking-widest leading-relaxed">示範圖載入失敗</span></div>
              ) : (
                <div className="relative overflow-hidden rounded-[15px] shadow-2xl border border-white/5 bg-slate-900">
                  <img 
                    src={currentDetailEx?.name === '啞鈴上斜臥推' ? 'https://raw.githubusercontent.com/seanhsieh040724/ironlog-pro/refs/heads/main/incline-press.gif' : (currentGif || '')} 
                    className="w-full h-auto block" 
                    alt="exercise demonstration" 
                    style={{ borderRadius: '15px', width: '100%', display: 'block', height: 'auto' }}
                    referrerPolicy="no-referrer"
                  />
                  {/* 掃描線動畫 */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-green/5 to-transparent h-24 w-full animate-[scan_3s_linear_infinite] pointer-events-none" />
                </div>
              )}
            </div>

            <div className="space-y-4 px-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-neon-green" />
                  <h3 className="text-xs font-black italic uppercase tracking-widest text-white">訓練數據錄入</h3>
                </div>
                <button onClick={() => addSetToExercise(currentDetailEx!.id)} className="flex items-center gap-1 text-neon-green text-[9px] font-black uppercase"><PlusCircle className="w-3.5 h-3.5" /> 新增下一組</button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 text-[8px] font-black text-slate-600 uppercase tracking-widest px-4">
                  <div className="col-span-1"></div>
                  <div className="col-span-2 text-center">組數</div>
                  <div className="col-span-4 text-center">重量 (KG)</div>
                  <div className="col-span-3 text-center">次數</div>
                  <div className="col-span-2"></div>
                </div>

                <AnimatePresence mode="popLayout">
                  {currentDetailEx!.sets.map((set, index) => (
                    <motion.div key={set.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className={`grid grid-cols-12 gap-2 items-center p-3 rounded-[24px] border transition-all ${set.completed ? 'bg-neon-green/5 border-neon-green/20' : 'bg-slate-900/60 border-white/5'}`}>
                      <div className="col-span-1 flex justify-center"><button onClick={() => removeSetFromExercise(currentDetailEx!.id, set.id)} className="text-slate-800 active:text-red-500"><MinusCircle className="w-4 h-4" /></button></div>
                      <div className="col-span-2 text-sm font-black italic text-slate-500 text-center">#{index + 1}</div>
                      <div className="col-span-4"><input type="number" inputMode="decimal" value={set.weight || ''} placeholder="0" onChange={(e) => updateSetData(currentDetailEx!.id, set.id, { weight: Number(e.target.value) })} className="w-full bg-black/40 rounded-xl py-3 text-center text-lg font-black text-white outline-none focus:ring-1 ring-neon-green/30" /></div>
                      <div className="col-span-3"><input type="number" inputMode="numeric" value={set.reps || ''} placeholder="0" onChange={(e) => updateSetData(currentDetailEx!.id, set.id, { reps: Number(e.target.value) })} className="w-full bg-black/40 rounded-xl py-3 text-center text-lg font-black text-white outline-none focus:ring-1 ring-neon-green/30" /></div>
                      <div className="col-span-2 flex justify-center"><button onClick={() => toggleSetCompletion(currentDetailEx!.id, set.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${set.completed ? 'bg-neon-green text-black' : 'bg-slate-800 text-slate-600'}`}><Check className="w-5 h-5 stroke-[4]" /></button></div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="pt-6">
                <button onClick={onFinish} className="w-full bg-neon-green text-black font-black h-16 rounded-[24px] uppercase italic text-lg shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"><Save className="w-6 h-6 stroke-[3]" /> 儲存紀錄</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
