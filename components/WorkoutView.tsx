
import React, { useState, useMemo, useContext, useEffect } from 'react';
import { WorkoutSession, ExerciseEntry, SetEntry, MuscleGroup } from '../types';
import { 
  Plus, Trash2, Search, Save, PlusCircle, 
  Check, MinusCircle, Target, Sparkles, ChevronRight, ChevronLeft, Loader2, AlertCircle, BookOpen, PlusSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMuscleGroup, getMuscleGroupDisplay, fetchExerciseGif, getExerciseMethod } from '../utils/fitnessMath';
import { AppContext } from '../App';
import { ChestIcon, BackIcon, ShoulderIcon, LegIcon, DeadliftIcon, ArmIcon, CoreIcon, GenericIcon } from './WorkoutIcons';

export const getExerciseIcon = (name: string) => {
  const muscle = getMuscleGroup(name);
  const n = name.toLowerCase();
  if (n.includes('硬舉') || n.includes('deadlift')) return <DeadliftIcon className="w-full h-full" />;
  switch (muscle) {
    case 'chest': return <ChestIcon className="w-full h-full" />;
    case 'back': return <BackIcon className="w-full h-full" />;
    case 'shoulders': return <ShoulderIcon className="w-full h-full" />;
    case 'quads':
    case 'hamstrings':
    case 'glutes': return <LegIcon className="w-full h-full" />;
    case 'arms': return <ArmIcon className="w-full h-full" />;
    case 'core': return <CoreIcon className="w-full h-full" />;
    default: return <GenericIcon className="w-full h-full" />;
  }
};

export const ORGANIZED_EXERCISES: Record<string, string[]> = {
  'chest': ['槓鈴平板臥推', '槓鈴上斜臥推', '啞鈴平板臥推', '啞鈴上斜臥推', '史密斯平板臥推', '坐姿器械推胸', '蝴蝶機夾胸', '跪姿繩索夾胸', '雙槓撐體', '標準俯地挺身', '器械上斜推胸', '史密斯上斜臥推'],
  'back': ['引體向上', '滑輪下拉', '槓鈴划船', '啞鈴單臂划船', '坐姿划船', 'T桿划船', '直臂滑輪下拉', '傳統硬舉', '羅馬尼亞硬舉', '山羊挺身', '單臂滑輪划船', '反握下拉'],
  'shoulders': ['啞鈴肩推', '槓鈴肩推', '阿諾肩推', '器械肩推', '啞鈴側平舉', '滑輪側平舉', '啞鈴前平舉', '蝴蝶機後三角飛鳥', '滑輪面拉', '槓鈴聳肩', '啞鈴俯身飛鳥', '六角槓聳肩'],
  'legs': ['槓鈴深蹲', '啞鈴杯式深蹲', '器械腿部推蹬', '保加利亞分腿蹲', '哈克深蹲', '器械腿伸展', '坐姿腿屈伸', '槓鈴臀推', '負重箭步蹲', '站姿提踵', '相撲硬舉', '器械內收/外展'],
  'arms': ['槓鈴彎舉', '啞鈴交替彎舉', '啞鈴錘式彎舉', '牧師椅彎舉', '滑輪繩索下壓', '窄握槓鈴臥推', '仰臥槓鈴臂屈伸', '啞鈴頸後臂屈伸', '雙槓臂屈伸', '反握彎舉', '二頭肌器械彎舉', '三頭肌繩索過頭伸展'],
  'core': ['標準捲腹', '仰臥抬腿', '棒式', '俄羅斯轉體', '健腹輪', '腳踏車捲腹', '懸垂提膝', '登山者', '側棒式', '跪姿滑輪捲腹', '反向捲腹', '側向捲腹']
};

export const EXERCISE_DATABASE = Object.values(ORGANIZED_EXERCISES).flat();

export const WorkoutView: React.FC<{ session: WorkoutSession | null, onUpdate: (s: WorkoutSession) => void, onFinish: () => void }> = ({ session, onUpdate, onFinish }) => {
  const context = useContext(AppContext);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('chest');
  const [searchTerm, setSearchTerm] = useState('');
  const [gifUrl, setGifUrl] = useState<string | null>(null);

  const currentDetailEx = useMemo(() => session?.exercises.find(e => e.id === activeExerciseId), [session, activeExerciseId]);

  useEffect(() => {
    if (currentDetailEx) {
      fetchExerciseGif(currentDetailEx.name).then(setGifUrl);
    }
  }, [currentDetailEx?.name]);

  const addExercise = (name: string) => {
    const newExId = crypto.randomUUID();
    onUpdate({ 
      ...session!, 
      exercises: [...session!.exercises, { 
        id: newExId, name, muscleGroup: getMuscleGroup(name), 
        sets: Array.from({ length: 4 }).map(() => ({ id: crypto.randomUUID(), weight: 0, reps: 10, completed: false })) 
      }] 
    });
    setActiveExerciseId(newExId);
    setSearchTerm('');
  };

  const filteredExercises = useMemo(() => {
    if (searchTerm) return EXERCISE_DATABASE.filter(ex => ex.toLowerCase().includes(searchTerm.toLowerCase()));
    return ORGANIZED_EXERCISES[activeCategory] || [];
  }, [searchTerm, activeCategory]);

  if (!session) return null;

  return (
    <div className="relative min-h-screen">
      <AnimatePresence mode="wait">
        {!activeExerciseId ? (
          <motion.div key="overview" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-7 pb-44">
            <div className="flex items-center gap-5 bg-slate-900/80 border border-white/5 rounded-[24px] px-7 py-5 shadow-2xl">
              <Search className="w-6 h-6 text-slate-600" />
              <input placeholder="搜尋動作庫..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent w-full text-lg font-black italic outline-none text-white placeholder:text-slate-800" />
            </div>

            {!searchTerm && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 px-1">
                {Object.keys(ORGANIZED_EXERCISES).map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`shrink-0 px-6 py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat ? 'bg-neon-green text-black border-neon-green' : 'bg-slate-900/40 text-slate-500 border-white/5'}`}>
                    {getMuscleGroupDisplay(cat as MuscleGroup).cn}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {filteredExercises.map(exName => (
                <motion.button key={exName} whileTap={{ scale: 0.95 }} onClick={() => addExercise(exName)} className="p-5 rounded-[28px] text-left bg-slate-900/40 border border-white/5 flex flex-col justify-center min-h-[90px] group active:border-neon-green/30 shadow-lg">
                  <div className="text-[15px] font-black italic uppercase text-slate-200 group-active:text-neon-green leading-tight truncate">{exName}</div>
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-[0.2em] mt-2.5 flex items-center justify-between">
                    {getMuscleGroupDisplay(getMuscleGroup(exName)).cn}
                    <Plus className="w-4 h-4 text-slate-800 opacity-0 group-active:opacity-100 transition-opacity" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8 pb-44">
            <div className="flex items-center justify-between px-2">
              <button onClick={() => setActiveExerciseId(null)} className="flex items-center gap-3 text-slate-400 py-3">
                <ChevronLeft className="w-8 h-8" />
                <span className="text-sm font-black uppercase tracking-widest">返回</span>
              </button>
              <h2 className="text-3xl font-black italic uppercase text-white truncate max-w-[220px] leading-tight">{currentDetailEx?.name}</h2>
              <button onClick={() => { if(confirm('移除動作？')) { onUpdate({ ...session, exercises: session.exercises.filter(e => e.id !== currentDetailEx!.id) }); setActiveExerciseId(null); } }} className="w-13 h-13 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500/40"><Trash2 className="w-6 h-6" /></button>
            </div>

            <div className="w-full relative px-2">
              <div className="relative overflow-hidden rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/5 bg-slate-900 min-h-[260px] flex items-center justify-center">
                {currentDetailEx?.name === '標準俯地挺身' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2020/10/pompe-musculation.gif" alt="標準俯地挺身" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '啞鈴側平舉' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/06/elevations-laterales-halteres-exercice-musculation.gif" alt="啞鈴側平舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '啞鈴上斜臥推' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/06/developpe-incline-halteres-exercice-musculation.gif" style={{ width: '100%', borderRadius: '15px' }} />
                ) : gifUrl ? (
                  <img src={gifUrl} alt={currentDetailEx?.name} style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : (
                  <Loader2 className="w-10 h-10 text-neon-green animate-spin" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-green/5 to-transparent h-24 w-full animate-[scan_3s_linear_infinite] pointer-events-none" />
              </div>
            </div>

            <div className="mx-2 p-8 rounded-[36px] bg-slate-900/40 border border-white/5 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-neon-green">
                <BookOpen className="w-6 h-6" />
                <h3 className="text-[12px] font-black uppercase tracking-widest">運動方法</h3>
              </div>
              <p className="text-base font-medium text-slate-400 leading-relaxed italic whitespace-pre-line">
                {getExerciseMethod(currentDetailEx?.name || "")}
              </p>
            </div>

            <div className="space-y-6 px-2">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-neon-green" />
                  <h3 className="text-base font-black italic uppercase text-white">訓練錄入</h3>
                </div>
                <button onClick={() => onUpdate({ ...session, exercises: session.exercises.map(ex => ex.id === currentDetailEx!.id ? { ...ex, sets: [...ex.sets, { id: crypto.randomUUID(), weight: ex.sets[ex.sets.length-1]?.weight || 0, reps: ex.sets[ex.sets.length-1]?.reps || 10, completed: false }] } : ex) })} className="flex items-center gap-2 text-neon-green text-[12px] font-black uppercase">
                  <PlusCircle className="w-5 h-5" /> 加一組
                </button>
              </div>
              <div className="space-y-4">
                {currentDetailEx!.sets.map((set, index) => (
                  <div key={set.id} className={`grid grid-cols-12 gap-4 items-center p-5 rounded-[32px] border transition-all ${set.completed ? 'bg-neon-green/5 border-neon-green/20 shadow-inner' : 'bg-slate-900/60 border-white/5 shadow-lg'}`}>
                    <div className="col-span-1 flex justify-center"><button onClick={() => onUpdate({ ...session, exercises: session.exercises.map(e => e.id === currentDetailEx!.id ? { ...e, sets: e.sets.filter(s => s.id !== set.id) } : e) })} className="text-slate-800"><MinusCircle className="w-6 h-6" /></button></div>
                    <div className="col-span-2 text-lg font-black italic text-slate-500 text-center">#{index + 1}</div>
                    <div className="col-span-4"><input type="number" value={set.weight || ''} placeholder="KG" onChange={(e) => onUpdate({ ...session, exercises: session.exercises.map(ex => ex.id === currentDetailEx!.id ? { ...ex, sets: ex.sets.map(s => s.id === set.id ? { ...s, weight: Number(e.target.value) } : s) } : ex) })} className="w-full bg-black/50 rounded-2xl py-4.5 text-center text-2xl font-black text-white outline-none focus:bg-black transition-all" /></div>
                    <div className="col-span-3"><input type="number" value={set.reps || ''} placeholder="REP" onChange={(e) => onUpdate({ ...session, exercises: session.exercises.map(ex => ex.id === currentDetailEx!.id ? { ...ex, sets: ex.sets.map(s => s.id === set.id ? { ...s, reps: Number(e.target.value) } : s) } : ex) })} className="w-full bg-black/50 rounded-2xl py-4.5 text-center text-2xl font-black text-white outline-none focus:bg-black transition-all" /></div>
                    <div className="col-span-2 flex justify-center"><button onClick={() => { const newComp = !set.completed; if(newComp && context) context.triggerRestTimer(); onUpdate({ ...session, exercises: session.exercises.map(ex => ex.id === currentDetailEx!.id ? { ...ex, sets: ex.sets.map(s => s.id === set.id ? { ...s, completed: newComp } : s) } : ex) }); }} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${set.completed ? 'bg-neon-green text-black shadow-lg shadow-neon-green/20 scale-105' : 'bg-slate-800 text-slate-600'}`}><Check className="w-8 h-8 stroke-[4]" /></button></div>
                  </div>
                ))}
              </div>
              <div className="pt-10">
                <button onClick={onFinish} className="w-full bg-neon-green text-black font-black h-20 rounded-[32px] uppercase italic text-2xl active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4">
                  <Save className="w-8 h-8 stroke-[3]" /> 儲存本次訓練
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
