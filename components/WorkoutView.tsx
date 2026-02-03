
import React, { useState, useMemo, useContext, useEffect, useRef } from 'react';
import { WorkoutSession, ExerciseEntry, SetEntry, MuscleGroup } from '../types';
import { 
  Plus, Trash2, Search, Save, PlusCircle, 
  Check, MinusCircle, Target, Sparkles, ChevronRight, ChevronLeft, Loader2, AlertCircle, BookOpen, PlusSquare, Play, Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMuscleGroup, getMuscleGroupDisplay, fetchExerciseGif, getExerciseMethod } from '../utils/fitnessMath';
import { AppContext } from '../App';

export const ORGANIZED_EXERCISES: Record<string, string[]> = {
  'chest': ['槓鈴平板臥推', '槓鈴上斜臥推', '啞鈴平板臥推', '啞鈴上斜臥推', '史密斯平板臥推', '坐姿器械推胸', '蝴蝶機夾胸', '跪姿繩索夾胸', '雙槓撐體', '標準俯地挺身', '器械上斜推胸', '史密斯上斜臥推'],
  'back': ['引體向上', '滑輪下拉', '槓鈴划船', '啞鈴單臂划船', '坐姿划船機', 'T桿划船機', '器械反握高位下拉', '傳統硬舉', '輔助引體向上機', 'V把坐姿划船', '寬握水平划船', '滑輪反握下拉'],
  'shoulders': ['啞鈴肩推', '槓鈴肩推', '阿諾肩推', '器械肩推', '史密斯機肩推', '啞鈴側平舉', '滑輪側平舉', '器械側平舉', '啞鈴前平舉', '蝴蝶機後三角飛鳥', '滑輪面拉', '俯身啞鈴反向飛鳥'],
  'legs': ['槓鈴深蹲', '啞鈴高腳杯蹲', '上斜腿推機', '保加利亞啞鈴分腿蹲', '哈克深蹲', '仰臥腿後勾', '坐姿腿後勾', '器械站姿提踵', '相撲硬舉', '器械腿外展', '器械腿內收', '六角槓硬舉'],
  'arms': ['槓鈴彎舉', '反手槓鈴彎舉', '啞鈴交替彎舉', '啞鈴錘式彎舉', '牧師椅彎舉', '滑輪繩索下壓', '窄握槓鈴臥推', '仰臥槓鈴臂屈伸', '啞鈴頸後臂屈伸', '滑輪直桿彎舉', '二頭肌器械彎舉', '滑輪直桿過頭臂屈伸'],
  'core': ['仰臥起坐', '羅馬椅抬腿', '棒式', '俄羅斯轉體', '健腹輪', '器械捲腹', '懸垂抬腿', '登山者', '側棒式', '跪姿滑輪捲腹', '下斜捲腹', '滑輪側捲腹']
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
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>("00:00");

  const currentDetailEx = useMemo(() => session?.exercises.find(e => e.id === activeExerciseId), [session, activeExerciseId]);

  useEffect(() => {
    if (currentDetailEx) {
      fetchExerciseGif(currentDetailEx.name).then(setGifUrl);
    }
  }, [currentDetailEx?.name]);

  // 訓練計時核心邏輯
  useEffect(() => {
    let interval: number;
    if (session?.timerStartedAt) {
      const updateTimer = () => {
        const diff = Date.now() - session.timerStartedAt!;
        const totalSeconds = Math.floor(diff / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        setElapsedTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      };
      updateTimer();
      interval = window.setInterval(updateTimer, 1000);
    } else {
      setElapsedTime("00:00");
    }
    return () => clearInterval(interval);
  }, [session?.timerStartedAt]);

  const addExercise = (name: string) => {
    const newExId = crypto.randomUUID();
    const muscle = getMuscleGroup(name);
    onUpdate({ 
      ...session!, 
      exercises: [
        ...session!.exercises, 
        { 
          id: newExId, 
          name: name, 
          muscleGroup: muscle, 
          sets: Array.from({ length: 4 }).map(() => ({ 
            id: crypto.randomUUID(), 
            weight: 0, 
            reps: 10, 
            completed: false 
          })) 
        }
      ] 
    });
    setActiveExerciseId(newExId);
    setSearchTerm('');
  };

  const startWorkoutTimer = () => {
    if (session && !session.timerStartedAt) {
      onUpdate({ ...session, timerStartedAt: Date.now() });
    }
  };

  const filteredExercises = useMemo(() => {
    if (searchTerm) {
      return EXERCISE_DATABASE.filter(ex => ex.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return ORGANIZED_EXERCISES[activeCategory] || [];
  }, [searchTerm, activeCategory]);

  const isExactMatch = useMemo(() => {
    return EXERCISE_DATABASE.some(ex => ex.toLowerCase() === searchTerm.trim().toLowerCase());
  }, [searchTerm]);

  if (!session) return null;

  return (
    <div className="relative min-h-screen">
      <AnimatePresence mode="wait">
        {!activeExerciseId ? (
          <motion.div key="overview" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 pb-40">
            {/* 已刪除當前訓練項目清單 (整合課表內容) */}

            <div className="space-y-5 pt-2">
              <div className="flex items-center gap-4 bg-slate-900/80 border border-white/5 rounded-2xl px-6 py-4 shadow-inner">
                <Search className="w-5 h-5 text-slate-600" />
                <input 
                  placeholder="搜尋動作庫..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  className="bg-transparent w-full text-base font-black italic outline-none text-white placeholder:text-slate-800" 
                />
              </div>

              {!searchTerm && (
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                  {Object.keys(ORGANIZED_EXERCISES).map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setActiveCategory(cat)} 
                      className={`shrink-0 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat ? 'bg-neon-green text-black border-neon-green' : 'bg-slate-900/40 text-slate-500 border-white/5'}`}
                    >
                      {getMuscleGroupDisplay(cat as MuscleGroup).cn}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {searchTerm.trim() && !isExactMatch && (
                  <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => addExercise(searchTerm.trim())} 
                    className="col-span-2 p-5 rounded-[20px] bg-neon-green/10 border border-neon-green/30 flex items-center justify-between group"
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

                {filteredExercises.map(exName => (
                  <motion.button 
                    key={exName} 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => addExercise(exName)} 
                    className="p-4 rounded-[20px] text-left bg-slate-900/40 border border-white/5 flex flex-col justify-center min-h-[76px] group active:border-neon-green/30"
                  >
                    <div className="text-[13px] font-black italic uppercase text-slate-200 group-active:text-neon-green leading-tight truncate pr-1">
                      {exName}
                    </div>
                    <div className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-2 flex items-center justify-between">
                      {getMuscleGroupDisplay(getMuscleGroup(exName)).cn}
                      <Plus className="w-3.5 h-3.5 text-slate-800 opacity-0 group-active:opacity-100 transition-opacity" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 pb-40">
            <div className="flex items-center justify-between">
              <button onClick={() => setActiveExerciseId(null)} className="flex items-center gap-2 text-slate-400 py-2">
                <ChevronLeft className="w-7 h-7" />
                <span className="text-xs font-black uppercase tracking-widest">返回</span>
              </button>
              <h2 className="text-2xl font-black italic uppercase text-white truncate max-w-[240px] pr-3">{currentDetailEx?.name}</h2>
              <button onClick={() => { if(confirm('移除？')) { onUpdate({ ...session, exercises: session.exercises.filter(e => e.id !== currentDetailEx!.id) }); setActiveExerciseId(null); } }} className="w-11 h-11 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500/40"><Trash2 className="w-5 h-5" /></button>
            </div>

            <div className="w-full relative px-1">
              <div className="relative overflow-hidden rounded-[24px] shadow-2xl border border-white/5 bg-slate-900 min-h-[240px] flex items-center justify-center">
                {currentDetailEx?.name === '啞鈴肩推' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/02/developpe-epaule-halteres.gif" alt="啞鈴肩推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '槓鈴肩推' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/08/developpe-militaire-exercice-musculation.gif" alt="槓鈴肩推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '阿諾肩推' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/08/developpe-arnold-exercice-musculation.gif" alt="阿諾肩推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '器械肩推' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/11/developpe-epaules-a-la-machine-shoulder-press.gif" alt="器械肩推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '史密斯機肩推' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/08/developpe-epaules-smith-machine.gif" alt="史密斯機肩推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '啞鈴側平舉' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/08/elevations-laterales-exercice-musculation.gif" alt="啞鈴側平舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '滑輪側平舉' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/11/elevations-laterales-unilaterale-poulie.gif" alt="滑輪側平舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '器械側平舉' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/02/elevation-laterale-machine.gif" alt="器械側平舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '啞鈴前平舉' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/08/elevations-frontales-exercice-musculation.gif" alt="啞鈴前平舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '蝴蝶機後三角飛鳥' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/12/pec-deck-inverse.gif" alt="蝴蝶機後三角飛鳥" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '滑輪面拉' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/face-pull.gif" alt="滑輪面拉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '俯身啞鈴反向飛鳥' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/12/oiseau-assis-sur-banc.gif" alt="俯身啞鈴反向飛鳥" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '啞鈴上斜臥推' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/06/developpe-incline-halteres-exercice-musculation.gif" alt="啞鈴上斜臥推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '槓鈴平板臥推' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/developpe-couche-prise-inversee.gif" alt="槓鈴平板臥推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '槓鈴上斜臥推' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/10/developpe-incline-barre.gif" alt="槓鈴上斜臥推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '啞鈴平板臥推' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/05/developpe-couche-halteres-exercice-musculation.gif" alt="啞鈴平板臥推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '史密斯平板臥推' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/08/developpe-couche-smith-machine.gif" alt="史密斯平板臥推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '坐姿器械推胸' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/11/developpe-machine-assis-pectoraux.gif" alt="坐姿器械推胸" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '蝴蝶機夾胸' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/06/pec-deck-butterfly-exercice-musculation.gif" alt="蝴蝶機夾胸" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '跪姿繩索夾胸' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2023/07/ecarte-a-la-poulie-vis-a-vis-haute-a-genoux.gif" alt="跪姿繩索夾胸" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '器械上斜推胸' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/06/developpe-incline-machine-convergente-exercice-musculation.gif" alt="器械上斜推胸" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '史密斯上斜臥推' ? (
                  <img src="https://fitliferegime.com/wp-content/uploads/2024/04/Smith-Machine-Incline-Press.gif" alt="史密斯上斜臥推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '雙槓撐體' ? (
                  <img src="https://i.pinimg.com/originals/e7/45/d6/e745d6fcd41963a8a6d36c4b66c009a9.gif" alt="雙槓撐體" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '標準俯地挺身' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2020/10/pompe-musculation.gif" alt="標準俯地挺身" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '槓鈴彎舉' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/09/curl-barre.gif" alt="槓鈴彎舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '啞鈴錘式彎舉' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/09/curl-haltere-prise-neutre.gif" alt="啞鈴錘式彎舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '啞鈴交替彎舉' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/08/curl-biceps-avec-halteres-alterne.gif" alt="啞鈴交替彎舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '牧師椅彎舉' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/curl-au-pupitre-barre-ez-larry-scott.gif" alt="牧師椅彎舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '滑輪直桿彎舉' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/10/curl-biceps-poulie-basse.gif" alt="滑輪直桿彎舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '反手槓鈴彎舉' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/04/curl-inverse-barre.gif" alt="反手槓鈴彎舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '二頭肌器械彎舉' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/curl-pupitre-machine-prechargee.gif" alt="二頭肌器械彎舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '滑輪繩索下壓' ? (
                  <img src="https://www.aesthetics-blog.com/wp-content/uploads/2023/04/12271301-Cable-Standing-One-Arm-Tricep-Pushdown-Overhand-Grip_Upper-Arms_720.gif" alt="滑輪繩索下壓" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '窄握槓鈴臥推' ? (
                  <img src="https://www.aesthetics-blog.com/wp-content/uploads/2021/10/00301301-Barbell-Close-Grip-Bench-Press_Upper-Arms_720.gif" alt="窄握槓鈴臥推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '仰臥槓鈴臂屈伸' ? (
                  <img src="https://www.aesthetics-blog.com/wp-content/uploads/2019/08/00601301-Barbell-Lying-Triceps-Extension-Skull-Crusher_Triceps-SFIX_720.gif" alt="仰臥槓鈴臂屈伸" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '啞鈴頸後臂屈伸' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/12/extensions-des-triceps-assis-avec-haltere.gif" alt="啞鈴頸後臂屈伸" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '滑輪直桿過頭臂屈伸' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/extension-triceps-incline-poulie-basse.gif" alt="滑輪直桿過頭臂屈伸" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '引體向上' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/02/traction-musculation-dos.gif" alt="引體向上" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '滑輪下拉' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/11/tirage-vertical-poitrine.gif" alt="滑輪下拉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '槓鈴划船' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/09/rowing-barre.gif" alt="槓鈴划船" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '啞鈴單臂划船' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/08/rowing-haltere-un-bras.gif" alt="啞鈴單臂划船" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '坐姿划船機' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/rowing-assis-machine-hammer-strenght.gif" alt="坐姿划船機" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === 'T桿划船機' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/rowing-t-bar-machine.gif" alt="T桿划船機" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '器械反握高位下拉' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/tirage-avant-iso-laterale-hammer-strength.gif" alt="器械反握高位下拉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '傳統硬舉' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/12/souleve-de-terre.gif" alt="傳統硬舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '輔助引體向上機' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/02/traction-assistee-machine.gif" alt="輔助引體向上機" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === 'V把坐姿划船' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/02/tirage-horizontal-poulie.gif" alt="V把坐姿划船" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '寬握水平划船' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/10/tirage-horizontal-prise-large.gif" alt="寬握水平划船" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '滑輪反握下拉' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/tirage-vertical-prise-inversee.gif" alt="滑輪反握下拉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '槓鈴深蹲' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/11/homme-faisant-un-squat-avec-barre.gif" alt="槓鈴深蹲" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '啞鈴高腳杯蹲' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/06/squat-goblet-exercice-musculation.gif" alt="啞鈴高腳杯蹲" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '上斜腿推機' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/08/presse-a-cuisses-inclinee.gif" alt="上斜腿推機" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '保加利亞啞鈴分腿蹲' ? (
                  <img src="https://www.aesthetics-blog.com/wp-content/uploads/2023/02/04101301-Dumbbell-Single-Leg-Split-Squat_Thighs-FIX_720.gif" alt="保加利亞啞鈴分腿蹲" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '哈克深蹲' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/hack-squat.gif" alt="哈克深蹲" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '仰臥腿後勾' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/10/leg-curl-allonge.gif" alt="仰臥腿後勾" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '坐姿腿屈伸' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/06/leg-extension-exercice-musculation.gif" alt="坐姿腿屈伸" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '槓鈴臀推' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/12/hips-thrust.gif" alt="槓鈴臀推" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '坐姿腿後勾' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/02/leg-curl-assis-machine.gif" alt="坐姿腿後勾" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '器械站姿提踵' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/10/extension-mollets-debout-machine.gif" alt="器械站姿提踵" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '相撲硬舉' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/10/souleve-de-terre-sumo.gif" alt="相撲硬舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '六角槓硬舉' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2021/10/souleve-de-terre-a-la-trap-bar.gif" alt="六角槓硬舉" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '器械腿外展' ? (
                  <img src="https://static.wixstatic.com/media/2edbed_2c54524226684ddea7f4e2e08a472a3a~mv2.gif" alt="器械腿外展" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '仰臥起坐' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/07/crunch-au-sol-exercice-musculation.gif" alt="仰臥起坐" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '羅馬椅抬腿' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/04/releve-jambes-chaise-romaine-abdominaux.gif" alt="羅馬椅抬腿" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '棒式' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/05/planche-abdos.gif" alt="棒式" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '俄羅斯轉體' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/04/rotations-russes-obliques.gif" alt="俄羅斯轉體" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '健腹輪' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/02/roulette-abdominaux.gif" alt="健腹輪" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '器械捲腹' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/04/crunch-machine-abdos.gif" alt="器械捲腹" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '懸垂抬腿' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/07/releve-de-genoux-suspendu-exercice-musculation.gif" alt="懸垂抬腿" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '登山者' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/06/mountain-climber-exercice-musculation.gif" alt="登山者" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '側棒式' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/01/planche-laterale-obliques.gif" alt="側棒式" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '跪姿滑輪捲腹' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2000/06/crunch-poulie-haute-exercice-musculation.gif" alt="跪姿滑輪捲腹" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '下斜捲腹' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/02/sit-up-decline.gif" alt="下斜捲腹" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : currentDetailEx?.name === '滑輪側捲腹' ? (
                  <img src="https://www.docteur-fitness.com/wp-content/uploads/2022/04/flexions-laterales-poulie-basse.gif" alt="滑輪側捲腹" style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
                ) : gifUrl ? (
                  <img src={gifUrl} alt={currentDetailEx?.name} style={{ width: '100%', borderRadius: '15px', display: 'block' }} />
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
                {getExerciseMethod(currentDetailEx?.name || "")}
              </p>
            </div>

            <div className="space-y-5 px-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2.5">
                    <Target className="w-5 h-5 text-neon-green" />
                    <h3 className="text-sm font-black italic uppercase text-white">訓練錄入</h3>
                  </div>
                  {session.timerStartedAt && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-neon-green/10 border border-neon-green/30 rounded-lg">
                      <Timer className="w-3.5 h-3.5 text-neon-green animate-pulse" />
                      <span className="text-[11px] font-black text-neon-green font-mono">{elapsedTime}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {!session.timerStartedAt && (
                    <button onClick={startWorkoutTimer} className="flex items-center gap-1.5 text-neon-green text-[10px] font-black uppercase">
                      <Play className="w-4 h-4 fill-current" /> 開始訓練
                    </button>
                  )}
                  <button onClick={() => onUpdate({ ...session, exercises: session.exercises.map(ex => ex.id === currentDetailEx!.id ? { ...ex, sets: [...ex.sets, { id: crypto.randomUUID(), weight: ex.sets[ex.sets.length-1]?.weight || 0, reps: ex.sets[ex.sets.length-1]?.reps || 10, completed: false }] } : ex) })} className="flex items-center gap-1.5 text-neon-green text-[10px] font-black uppercase">
                    <PlusCircle className="w-4 h-4" /> 加一組
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {currentDetailEx!.sets.map((set, index) => (
                  <div key={set.id} className={`grid grid-cols-12 gap-2.5 items-center p-4 rounded-[28px] border transition-all ${set.completed ? 'bg-neon-green/5 border-neon-green/20' : 'bg-slate-900/60 border-white/5'}`}>
                    <div className="col-span-1 flex justify-center">
                      <button onClick={() => onUpdate({ ...session, exercises: session.exercises.map(e => e.id !== currentDetailEx!.id ? e : { ...e, sets: e.sets.filter(s => s.id !== set.id) }) })} className="text-slate-800 p-1 active:text-red-500">
                        <MinusCircle className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="col-span-1 text-base font-black italic text-slate-500 text-center">
                      {index + 1}
                    </div>
                    
                    {/* 重量輸入區 */}
                    <div className="col-span-4 flex items-center justify-center gap-2">
                      <input 
                        type="number" 
                        value={set.weight || ''} 
                        placeholder="0" 
                        onChange={(e) => {
                          const newWeight = Number(e.target.value);
                          onUpdate({ 
                            ...session, 
                            exercises: session.exercises.map(ex => {
                              if (ex.id === currentDetailEx!.id) {
                                const newSets = ex.sets.map((s, i) => {
                                  if (s.id === set.id) return { ...s, weight: newWeight };
                                  if (index === 0) return { ...s, weight: newWeight };
                                  return s;
                                });
                                return { ...ex, sets: newSets };
                              }
                              return ex;
                            }) 
                          });
                        }} 
                        className="w-16 bg-black/40 rounded-xl py-3 text-center text-xl font-black text-white outline-none border border-white/5 focus:border-neon-green/30 transition-all" 
                      />
                      <span className="text-[10px] font-black text-slate-600 italic uppercase shrink-0">kg</span>
                    </div>

                    {/* 次數輸入區 */}
                    <div className="col-span-4 flex items-center justify-center gap-2">
                      <input 
                        type="number" 
                        value={set.reps || ''} 
                        placeholder="0" 
                        onChange={(e) => onUpdate({ ...session, exercises: session.exercises.map(ex => ex.id === currentDetailEx!.id ? { ...ex, sets: ex.sets.map(s => s.id === set.id ? { ...s, reps: Number(e.target.value) } : s) } : ex) })} 
                        className="w-16 bg-black/40 rounded-xl py-3 text-center text-xl font-black text-white outline-none border border-white/5 focus:border-neon-green/30 transition-all" 
                      />
                      <span className="text-[10px] font-black text-slate-600 italic uppercase shrink-0">rep</span>
                    </div>

                    <div className="col-span-2 flex justify-end">
                      <button 
                        onClick={() => { 
                          const newComp = !set.completed; 
                          if(newComp && context) context.triggerRestTimer(); 
                          onUpdate({ ...session, exercises: session.exercises.map(ex => ex.id === currentDetailEx!.id ? { ...ex, sets: ex.sets.map(s => s.id === set.id ? { ...s, completed: newComp } : s) } : ex) }); 
                        }} 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 ${set.completed ? 'bg-neon-green text-black' : 'bg-slate-800 text-slate-600 shadow-inner'}`}
                      >
                        <Check className="w-6 h-6 stroke-[4]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-6 pb-12">
                <button 
                  onClick={() => {
                    // 如果尚未開始計時，在儲存時強制記一個點
                    if (!session.timerStartedAt) {
                       onUpdate({ ...session, timerStartedAt: Date.now() });
                    }
                    onFinish();
                  }} 
                  className="w-full bg-neon-green text-black font-black h-12 rounded-xl uppercase italic text-base active:scale-95 transition-all shadow-[0_10px_20px_rgba(173,255,47,0.2)] flex items-center justify-center gap-3 tracking-tighter"
                >
                  <Save className="w-5 h-5 stroke-[2.5]" /> 儲存訓練
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
