
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
  const [quickConfig, setQuickConfig] = useState({ weight: '', sets: '4', reps: '10' });
  
  // 動態動畫相關狀態
  const [currentGif, setCurrentGif] = useState<string | null>(null);
  const [isGifLoading, setIsGifLoading] = useState(false);
  const [hasGifError, setHasGifError] = useState(false);

  const filteredExercises = useMemo(() => {
    if (!searchTerm.trim()) return ORGANIZED_EXERCISES[activeCategory] || [];
    return EXERCISE_DATABASE.filter(ex => ex.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 20);
  }, [searchTerm, activeCategory]);

  const exactMatch = useMemo(() => {
    return EXERCISE_DATABASE.some(ex => ex === searchTerm.trim());
  }, [searchTerm]);

  const currentDetailEx = useMemo(() => 
    session?.exercises.find(e => e.id === activeExerciseId),
  [session, activeExerciseId]);

  // 當使用者進入動作詳情時，自動抓取動畫
  useEffect(() => {
    if (activeExerciseId && currentDetailEx) {
      setIsGifLoading(true);
      setHasGifError(false);
      fetchExerciseGif(currentDetailEx.name)
        .then(url => {
          setCurrentGif(url);
          setIsGifLoading(false);
        })
        .catch(() => {
          setHasGifError(true);
          setIsGifLoading(false);
        });
    } else {
      setCurrentGif(null);
      setHasGifError(false);
    }
  }, [activeExerciseId, currentDetailEx?.name]);

  if (!session) return null;

  const handleAddExercise = (exName: string) => {
    const setsCount = Math.max(1, Number(quickConfig.sets) || 1);
    const newExId = crypto.randomUUID();
    const entry: ExerciseEntry = {
      id: newExId,
      name: exName,
      muscleGroup: getMuscleGroup(exName),
      sets: Array.from({ length: setsCount }).map((_, idx) => ({
        id: crypto.randomUUID(),
        weight: idx === 0 ? (Number(quickConfig.weight) || 0) : 0, 
        reps: Number(quickConfig.reps) || 10,
        completed: false
      }))
    };
    onUpdate({ ...session, exercises: [...session.exercises, entry] });
    setActiveExerciseId(newExId); 
    setSearchTerm('');
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const toggleSetCompletion = (exerciseId: string, setId: string) => {
    const updatedExercises = session.exercises.map(ex => {
      if (ex.id === exerciseId) {
        const updatedSets = ex.sets.map(s => {
          if (s.id === setId) {
            const newCompleted = !s.completed;
            if (newCompleted && context) context.triggerRestTimer();
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
    });
    onUpdate({ ...session, exercises: updatedExercises });
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
          <motion.div 
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 pb-40"
          >
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
                  <input 
                    placeholder="搜尋動作..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="bg-transparent w-full text-sm font-black italic outline-none text-white placeholder:text-slate-800" 
                  />
                </div>

                <AnimatePresence>
                  {searchTerm.trim() && !exactMatch && (
                    <motion.button
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={() => handleAddExercise(searchTerm.trim())}
                      className="w-full p-4 rounded-2xl bg-neon-green/10 border border-neon-green/40 flex items-center justify-between group active:bg-neon-green/20 mb-2"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-neon-green text-black rounded-xl flex items-center justify-center shrink-0">
                           <Plus className="w-6 h-6 stroke-[3]" />
                        </div>
                        <div className="text-left truncate">
                          <div className="text-[10px] font-black text-neon-green uppercase tracking-widest">建立新動作</div>
                          <div className="text-sm font-black italic text-white uppercase truncate">{searchTerm}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-neon-green shrink-0" />
                    </motion.button>
                  )}
                </AnimatePresence>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {Object.keys(ORGANIZED_EXERCISES).map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => { setActiveCategory(cat); setSearchTerm(''); }}
                      className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${!searchTerm && activeCategory === cat ? 'bg-neon-green text-black border-neon-green shadow-lg shadow-neon-green/10' : 'bg-slate-900/40 text-slate-500 border-white/5'}`}
                    >
                      {getMuscleGroupDisplay(cat as MuscleGroup).cn}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {filteredExercises.map(exName => (
                    <motion.button 
                      key={exName} 
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddExercise(exName)}
                      className="p-4 rounded-2xl text-left bg-slate-900/40 border border-white/5 hover:border-neon-green/30 transition-all group relative active:bg-neon-green/5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 shrink-0 bg-slate-800 rounded-lg flex items-center justify-center border border-white/5 p-1">
                          {getExerciseIcon(exName)}
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-[11px] font-black italic uppercase text-slate-200 leading-tight truncate">{exName}</div>
                          <div className="text-[7px] font-bold text-slate-700 uppercase tracking-widest mt-1">{getMuscleGroupDisplay(getMuscleGroup(exName)).cn}</div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="glass bg-black/40 p-5 rounded-[32px] border-white/5 space-y-4">
                 <div className="flex items-center gap-2 mb-2">
                    <Target className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">下個動作的預設設定</span>
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                    <QuickInput label="預設重量" unit="KG" val={quickConfig.weight} onChange={v => setQuickConfig({...quickConfig, weight: v})} />
                    <QuickInput label="預設組數" unit="組" val={quickConfig.sets} onChange={v => setQuickConfig({...quickConfig, sets: v})} />
                    <QuickInput label="預設次數" unit="次" val={quickConfig.reps} onChange={v => setQuickConfig({...quickConfig, reps: v})} />
                 </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6 pb-40"
          >
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => setActiveExerciseId(null)}
                className="flex items-center gap-2 text-slate-400 active:text-neon-green transition-colors py-2 group"
              >
                <ChevronLeft className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase tracking-widest">返回動作庫</span>
              </button>
              <button onClick={() => removeExercise(currentDetailEx!.id)} className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500/50 active:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="glass rounded-[40px] p-6 border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 {getExerciseIcon(currentDetailEx!.name, true)}
              </div>
              
              <div className="w-full flex flex-col items-center">
                <h2 className="text-2xl font-black italic uppercase text-white text-center leading-tight mb-2">{currentDetailEx!.name}</h2>
                <span className="text-[9px] font-black bg-neon-green/10 text-neon-green px-4 py-1 rounded-full uppercase tracking-[0.3em] mb-6">{getMuscleGroupDisplay(currentDetailEx!.muscleGroup).cn}</span>
                
                {/* 示範動畫播放區塊 */}
                <div className="w-full aspect-square max-w-[280px] glass rounded-[32px] overflow-hidden border border-white/10 relative bg-black/40 mb-2 group">
                  <AnimatePresence mode="wait">
                    {isGifLoading ? (
                      <motion.div 
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-3"
                      >
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-[8px] font-black uppercase tracking-widest">正在載入示範圖...</span>
                      </motion.div>
                    ) : hasGifError ? (
                      <motion.div 
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 gap-3 p-8 text-center"
                      >
                        <AlertCircle className="w-8 h-8 opacity-40" />
                        <span className="text-[8px] font-black uppercase tracking-widest leading-relaxed">示範圖載入失敗，請檢查網路連線或嘗試其他動作</span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="gif-container" 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="w-full h-full relative"
                      >
                        <img 
                          src={currentGif || ''} 
                          onError={() => setHasGifError(true)}
                          className="w-full h-full object-cover mix-blend-screen"
                          alt="exercise demonstration"
                        />
                        {/* 科技感掃描線特效 */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-green/5 to-transparent h-20 w-full animate-[scan_2s_linear_infinite] pointer-events-none" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center mt-2 opacity-40 italic">Open-Source Fitness DB</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] px-4">
                <div className="col-span-1"></div>
                <div className="col-span-2">組數</div>
                <div className="col-span-4 text-center">重量 (KG)</div>
                <div className="col-span-3 text-center">次數</div>
                <div className="col-span-2 text-center">狀態</div>
              </div>

              <AnimatePresence mode="popLayout">
                {currentDetailEx!.sets.map((set, index) => (
                  <motion.div 
                    key={set.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`grid grid-cols-12 gap-2 items-center p-3 rounded-[24px] transition-all border ${set.completed ? 'bg-neon-green/5 border-neon-green/20' : 'bg-slate-900/60 border-white/5'}`}
                  >
                    <div className="col-span-1 flex justify-center">
                       <button onClick={() => removeSetFromExercise(currentDetailEx!.id, set.id)} className="text-slate-800 active:text-red-500 p-1">
                          <MinusCircle className="w-4 h-4" />
                       </button>
                    </div>
                    <div className="col-span-2 text-sm font-black italic text-slate-500 text-center">#{index + 1}</div>
                    <div className="col-span-4">
                      <input 
                        type="number" 
                        inputMode="decimal" 
                        value={set.weight === 0 ? '' : set.weight} 
                        placeholder="--" 
                        onChange={(e) => updateSetData(currentDetailEx!.id, set.id, { weight: Number(e.target.value) })} 
                        className="w-full bg-black/40 rounded-xl py-3 text-center text-lg font-black text-white outline-none focus:ring-1 ring-neon-green/30" 
                      />
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="number" 
                        inputMode="numeric" 
                        value={set.reps === 0 ? '' : set.reps} 
                        placeholder="--" 
                        onChange={(e) => updateSetData(currentDetailEx!.id, set.id, { reps: Number(e.target.value) })} 
                        className="w-full bg-black/40 rounded-xl py-3 text-center text-lg font-black text-white outline-none focus:ring-1 ring-neon-green/30" 
                      />
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <button 
                        onClick={() => toggleSetCompletion(currentDetailEx!.id, set.id)} 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${set.completed ? 'bg-neon-green text-black shadow-lg shadow-neon-green/20' : 'bg-slate-800 text-slate-600'}`}
                      >
                        <Check className="w-5 h-5 stroke-[4]" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button 
                onClick={() => addSetToExercise(currentDetailEx!.id)} 
                className="w-full py-4 bg-white/5 border border-dashed border-white/10 rounded-3xl text-[10px] font-black uppercase text-slate-500 flex items-center justify-center gap-2 active:bg-white/10 mt-2"
              >
                <PlusCircle className="w-4 h-4" /> 新增下一組
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeExerciseId && (
          <div className="fixed bottom-[110px] left-0 right-0 z-40 flex justify-center px-6">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="w-full max-w-md"
            >
              <button 
                onClick={onFinish}
                className="w-full font-black h-16 rounded-[24px] uppercase italic tracking-tighter text-lg shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-black/10 bg-neon-green text-black"
              >
                <Save className="w-6 h-6 stroke-[3]" /> 儲存本次訓練
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const QuickInput = ({ label, unit, val, onChange }: any) => (
  <div className="space-y-1.5">
    <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest text-center block">{label}</label>
    <div className="relative">
      <input 
        type="number" 
        value={val} 
        placeholder="0"
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-slate-800/30 border border-white/5 rounded-xl py-2.5 text-center text-xs font-black italic text-white outline-none focus:border-neon-green/40" 
      />
      <span className="absolute bottom-1 right-2 text-[6px] font-black text-slate-700 uppercase">{unit}</span>
    </div>
  </div>
);
