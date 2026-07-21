import React, { useState, useMemo, useContext, useEffect, useRef } from 'react';
import { WorkoutSession, ExerciseEntry, SetEntry, MuscleGroup } from '../types';
import { 
  Plus, Minus, Trash2, Search, Save, PlusCircle, 
  Check, MinusCircle, Target, Sparkles, ChevronRight, ChevronLeft, Loader2, AlertCircle, BookOpen, PlusSquare, Play, Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExerciseSmallGif } from './ExerciseSmallGif';
import { getMuscleGroup, getMuscleGroupDisplay, fetchExerciseGif, getExerciseMethod } from '../utils/fitnessMath';
import { AppContext } from '../App';
import { lightTheme, CardStyle, TextStyle, InputStyle, ActionButtonStyle } from '../themeStyles';

export const ORGANIZED_EXERCISES: Record<string, string[]> = {
  'chest': ['槓鈴平板臥推', '槓鈴上斜臥推', '啞鈴平板臥推', '啞鈴上斜臥推', '史密斯平板臥推', '坐姿器械推胸', '蝴蝶機夾胸', '跪姿繩索夾胸', '站姿繩索夾胸', '平板繩索飛鳥', '啞鈴平板飛鳥', '啞鈴上斜飛鳥', '器械上斜飛鳥', '上斜器械胸推', '雙槓撐體輔助', '仰臥器械胸推', '雙槓撐體', '標準俯地挺身', '器械上斜推胸', '史密斯上斜臥推'],
  'back': ['引體向上', '滑輪下拉', '槓鈴划船', '啞鈴單臂划船', '坐姿划船機', 'T桿划船機', '器械反握高位下拉', '傳統硬舉', '輔助引體向上機', 'V把坐姿划船', '寬握水平划船', '滑輪反握下拉', '器械下拉', '直臂下拉', '啞鈴上斜划船'],
  'shoulders': ['啞鈴肩推', '槓鈴肩推', '阿諾肩推', '器械肩推', '史密斯機肩推', '啞鈴側平舉', '滑輪側平舉', '器械側平舉', '啞鈴前平舉', '蝴蝶機後三角飛鳥', '滑輪面拉', '俯身啞鈴反向飛鳥'],
  'legs': ['槓鈴深蹲', '啞鈴高腳杯蹲', '上斜腿推機', '水平腿推機', '槓鈴臀推', '保加利亞啞鈴分腿蹲', '哈克深蹲', '仰臥腿後勾', '坐姿腿後勾', '器械站姿提踵', '相撲硬舉', '器械腿外展', '器械腿內收', '六角槓硬舉'],
  'arms': ['槓鈴彎舉', '反手槓鈴彎舉', '啞鈴交替彎舉', '啞鈴錘式彎舉', '牧師椅彎舉', '坐姿上斜啞鈴二頭彎舉', '坐姿啞鈴錘式彎舉', '站姿繩索錘式彎舉', '單臂滑輪三頭下壓', '反手直桿下壓', '滑輪繩索下壓', '窄握槓鈴臥推', '仰臥槓鈴臂屈伸', '啞鈴頸後臂屈伸', '滑輪直桿彎舉', '二頭肌器械彎舉', '滑輪直桿過頭臂屈伸'],
  'core': ['仰臥起坐', '羅馬椅抬腿', '棒式', '俄羅斯轉體', '健腹輪', '器械捲腹', '懸垂抬腿', '登山者', '側棒式', '跪姿滑輪捲腹', '下斜捲腹', '滑輪側捲腹']
};

export const EXERCISE_DATABASE = Object.values(ORGANIZED_EXERCISES).flat();

interface WorkoutViewProps {
  session: WorkoutSession | null;
  onUpdate: (session: WorkoutSession) => void;
  onFinish: () => void;
}

// 移除本地定義的 ExerciseSmallGif 和重複的 getHardcodedGif
const getHardcodedGif = (name: string) => {
  if (name === '槓鈴臀推') return 'https://www.docteur-fitness.com/wp-content/uploads/2021/12/hips-thrust.gif';
  if (name === '水平腿推機') return 'https://i.pinimg.com/originals/81/0f/96/810f969dcadba4d95912efa62e75ba61.gif';
  if (name === '平板繩索飛鳥') return 'https://modusx.de/wp-content/uploads/cable-crossover-liegend.gif';
  if (name === '站姿繩索夾胸') return 'https://images2.imgbox.com/84/e9/MDZXAjNh_o.gif';
  if (name === '啞鈴平板飛鳥') return 'https://fitliferegime.com/wp-content/uploads/2023/06/Dumbbell-Fly.gif';
  if (name === '啞鈴上斜飛鳥') return 'https://fitliferegime.com/wp-content/uploads/2023/06/Incline-Dumbbell-Fly.gif';
  if (name === '器械上斜飛鳥') return 'https://liftmanual.com/wp-content/uploads/2023/04/lever-incline-fly.webp';
  if (name === '上斜器械胸推') return 'https://liftmanual.com/wp-content/uploads/2023/04/lever-incline-chest-press.gif';
  if (name === '雙槓撐體輔助') return 'https://www.docteur-fitness.com/wp-content/uploads/2022/04/dips-assiste-machine.gif';
  if (name === '仰臥器械胸推') return 'https://images2.imgbox.com/7e/a4/OJA0HI9E_o.gif';
  if (name === '器械下拉') return 'https://i.pinimg.com/originals/8c/de/6c/8cde6c7cab8d14552f7eb07871f649a4.gif';
  if (name === '直臂下拉') return 'https://modusx.de/wp-content/uploads/ueberzuege-kabel-ruecken.gif';
  if (name === '啞鈴上斜划船') return 'https://www.inspireusafoundation.org/wp-content/uploads/2022/10/dumbbell-incline-row.gif';
  return null;
};

export const WorkoutView: React.FC<WorkoutViewProps> = ({ session, onUpdate, onFinish }) => {
  const context = useContext(AppContext);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('chest');
  const [searchTerm, setSearchTerm] = useState('');
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [isGifLoading, setIsGifLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState<string>("00:00");

  const currentDetailEx = useMemo(() => session?.exercises.find(e => e.id === activeExerciseId), [session, activeExerciseId]);

  const lastPerformedExercise = useMemo(() => {
    if (!currentDetailEx || !context?.history) return null;
    // 找出歷史紀錄中該動作最近的一次（排除當前 session，雖然 history 通常不含當前）
    return context.history
      .filter(s => s.exercises.some(e => e.name === currentDetailEx.name))
      .sort((a, b) => b.startTime - a.startTime)[0]
      ?.exercises.find(e => e.name === currentDetailEx.name);
  }, [currentDetailEx?.name, context?.history]);

  useEffect(() => {
    if (activeExerciseId) {
      // 當進入任何動作詳情時，確保畫面穩定地停在最上方（顯示 GIF 區域）
      const scrollToTop = () => {
        const mainElement = document.querySelector('main');
        if (mainElement) {
          mainElement.scrollTop = 0;
        }
        window.scrollTo(0, 0);
      };

      scrollToTop();
      // 額外在短時間後再執行一次，確保在動畫或 DOM 更新完成後仍能保持在頂部
      const timer = setTimeout(scrollToTop, 50);
      return () => clearTimeout(timer);
    }
  }, [activeExerciseId]);

  useEffect(() => {
    if (currentDetailEx) {
      setIsGifLoading(true);
      fetchExerciseGif(currentDetailEx.name).then(url => {
        setGifUrl(url);
        setTimeout(() => setIsGifLoading(false), 300);
      });
    }
  }, [currentDetailEx?.name]);

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

  const displayGifSrc = currentDetailEx ? (getHardcodedGif(currentDetailEx.name) || gifUrl || '') : '';

  return (
    <div className="relative min-h-screen">
      <AnimatePresence mode="wait">
        {!activeExerciseId ? (
          <motion.div key="overview" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 pb-40">
            <div className="space-y-5 pt-2">
              <div style={{ backgroundColor: lightTheme.card }} className="flex items-center gap-4 border border-black/5 rounded-2xl px-6 py-4 shadow-sm">
                <Search className="w-5 h-5 text-black" />
                <input 
                  placeholder="搜尋動作庫..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  className="bg-transparent w-full text-lg font-black outline-none placeholder:text-black" 
                  style={{ color: lightTheme.text }}
                />
              </div>

              {!searchTerm && (
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                  {Object.keys(ORGANIZED_EXERCISES).map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setActiveCategory(cat)} 
                      className={`shrink-0 px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat ? 'bg-black text-white border-black' : 'bg-slate-100 text-black border-black/5'}`}
                      style={activeCategory === cat ? { backgroundColor: '#000000', color: '#FFFFFF' } : {}}
                    >
                      {getMuscleGroupDisplay(cat as MuscleGroup).cn}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {searchTerm.trim() && !isExactMatch && (
                  <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => addExercise(searchTerm.trim())} 
                    style={{ backgroundColor: lightTheme.card }}
                    className="p-5 rounded-[20px] border border-black/5 flex items-center justify-between group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div style={{ backgroundColor: lightTheme.accent }} className="w-10 h-10 rounded-xl flex items-center justify-center text-black">
                        <PlusSquare className="w-6 h-6" />
                      </div>
                      <div className="text-left overflow-hidden">
                        <div className="text-[12px] font-black uppercase tracking-widest leading-none text-black">建立自訂動作</div>
                        <div style={{ color: lightTheme.text }} className="text-lg font-black uppercase leading-tight mt-1.5 pr-2">{searchTerm}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#82CC00] stroke-[3]" />
                  </motion.button>
                )}

                {filteredExercises.map(exName => (
                  <motion.button 
                    key={exName} 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => addExercise(exName)} 
                    style={{ backgroundColor: lightTheme.card }}
                    className="p-3 rounded-[20px] text-left border border-black/5 flex items-center gap-4 group active:border-black/20 shadow-sm"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center border border-black/5">
                      <ExerciseSmallGif name={exName} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ color: lightTheme.text }} className="text-[16px] font-black uppercase leading-tight py-0.5 pr-1">
                        {exName}
                      </div>
                      <div className="text-[11px] font-bold text-black uppercase tracking-widest mt-1.5 flex items-center justify-between">
                        {getMuscleGroupDisplay(getMuscleGroup(exName)).cn}
                        <Plus className="w-3.5 h-3.5 text-[#82CC00] stroke-[3] opacity-0 group-active:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 pb-40">
            <div className="relative flex items-center justify-center mb-8 px-1 min-h-[48px]">
              <button 
                onClick={() => setActiveExerciseId(null)} 
                className="absolute left-1 p-2 active:scale-90 transition-all shrink-0 z-10"
              >
                <ChevronLeft className="w-8 h-8 text-black stroke-[4]" />
              </button>
              <h2 style={{ color: lightTheme.text }} className="text-2xl sm:text-3xl font-black uppercase leading-tight py-1 text-center px-12">
                {currentDetailEx?.name}
              </h2>
            </div>

            <div className="w-full relative px-1">
              <div style={{ backgroundColor: lightTheme.card }} className="relative overflow-hidden rounded-[24px] shadow-sm border border-black/5 min-h-[240px] flex items-center justify-center">
                {isGifLoading && !getHardcodedGif(currentDetailEx?.name || '') ? (
                  <div className="flex flex-col items-center gap-4 py-12 text-black">
                    <Loader2 className="w-9 h-9 animate-spin text-black" />
                    <p className="text-[11px] font-black uppercase tracking-widest">載入動作中...</p>
                  </div>
                ) : (
                  <img 
                    src={displayGifSrc} 
                    alt={currentDetailEx?.name} 
                    className="w-full h-auto object-cover rounded-[15px] block"
                    onLoad={() => setIsGifLoading(false)}
                  />
                )}
              </div>
            </div>

            <div style={{ backgroundColor: lightTheme.card }} className="mx-1 p-6 rounded-[28px] border border-black/5 space-y-3.5 shadow-sm">
              <div className="flex items-center gap-2.5 text-black">
                <BookOpen className="w-5 h-5" />
                <h3 className="text-[12px] font-black uppercase tracking-widest">運動方法</h3>
              </div>
              <p className="text-base font-medium text-black leading-relaxed whitespace-pre-line">
                {getExerciseMethod(currentDetailEx?.name || "")}
              </p>
            </div>

            <div className="space-y-5 px-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2.5">
                    <Target className="w-5 h-5 text-black" />
                    <h3 style={{ color: lightTheme.text }} className="text-base font-black uppercase">訓練錄入</h3>
                  </div>
                  {session.timerStartedAt && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-black/5 border border-black/10 rounded-lg">
                      <Timer className="w-3.5 h-3.5 animate-pulse" />
                      <span className="text-[12px] font-black font-sans text-black">{elapsedTime}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {!session.timerStartedAt && (
                    <button onClick={startWorkoutTimer} className="flex items-center gap-1.5 text-black text-[11px] font-black uppercase">
                      <Play className="w-4 h-4 fill-current" /> 開始訓練
                    </button>
                  )}
                  <button onClick={() => onUpdate({ ...session, exercises: session.exercises.map(ex => ex.id === currentDetailEx!.id ? { ...ex, sets: [...ex.sets, { id: crypto.randomUUID(), weight: ex.sets[ex.sets.length-1]?.weight || 0, reps: ex.sets[ex.sets.length-1]?.reps || 10, completed: false }] } : ex) })} className="flex items-center gap-1.5 text-black text-[11px] font-black uppercase">
                    <PlusCircle className="w-4 h-4" /> 加一組
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {currentDetailEx!.sets.map((set, index) => (
                    <motion.div 
                      key={set.id}
                      layout
                      initial={{ opacity: 0, y: 15, scale: 0.96 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0, 
                        scale: set.completed ? [1, 1.03, 1] : 1 
                      }}
                      exit={{ opacity: 0, scale: 0.95, y: -15, transition: { duration: 0.15 } }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 400, 
                        damping: 28,
                        layout: { type: 'spring', stiffness: 350, damping: 28 },
                        scale: { type: 'keyframes', ease: 'easeInOut', duration: 0.3 }
                      }}
                      className={`grid grid-cols-12 gap-1 sm:gap-2.5 items-center p-3.5 sm:p-5 rounded-[34px] border border-black transition-all ${set.completed ? 'bg-[#CCFF00]' : 'bg-white shadow-sm'}`}
                    >
                      <div className="col-span-1 flex justify-center">
                        <button onClick={() => onUpdate({ ...session, exercises: session.exercises.map(e => e.id !== currentDetailEx!.id ? e : { ...e, sets: e.sets.filter(s => s.id !== set.id) }) })} className="text-black p-1 active:text-red-500">
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </div>
                      <div className="col-span-1 text-xl sm:text-2xl font-black text-black text-center">
                        {index + 1}
                      </div>
                      
                      <div className="col-span-4 flex items-center justify-center gap-1.5 sm:gap-2.5">
                        <div className="relative">
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
                                      if (i >= index) return { ...s, weight: newWeight };
                                      return s;
                                    });
                                    return { ...ex, sets: newSets };
                                  }
                                  return ex;
                                }) 
                              });
                            }} 
                            style={{ color: '#000000' }}
                            className="w-[53px] sm:w-[61px] bg-slate-100 rounded-xl py-2.5 sm:py-3 text-center text-[20px] sm:text-[23px] font-black outline-none border border-black/5 focus:border-black/20 transition-all shadow-inner [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] appearance-none px-0.5" 
                          />
                          {lastPerformedExercise && lastPerformedExercise.sets[index] && (
                            <div className="absolute -bottom-[18px] left-1/2 -translate-x-1/2 text-[11px] sm:text-[12px] font-black text-black uppercase tracking-wider whitespace-nowrap">
                              上次: {lastPerformedExercise.sets[index].weight}kg
                            </div>
                          )}
                        </div>
                        <span className="text-[12px] sm:text-[13px] font-black text-black uppercase shrink-0">kg</span>
                      </div>

                      <div className="col-span-4 flex items-center justify-center gap-1 sm:gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const newReps = Math.max(0, (set.reps || 0) - 1);
                            onUpdate({ 
                              ...session, 
                              exercises: session.exercises.map(ex => 
                                ex.id === currentDetailEx!.id 
                                  ? { ...ex, sets: ex.sets.map(s => s.id === set.id ? { ...s, reps: newReps } : s) } 
                                  : ex
                              ) 
                            });
                          }}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-200 hover:bg-slate-300 active:scale-90 flex items-center justify-center text-black font-black shrink-0 transition-all border border-black/10"
                          title="減 1 次"
                        >
                          <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                        </button>

                        <div className="relative">
                          <input 
                            type="number" 
                            value={set.reps || ''} 
                            placeholder="0" 
                            onChange={(e) => onUpdate({ ...session, exercises: session.exercises.map(ex => ex.id === currentDetailEx!.id ? { ...ex, sets: ex.sets.map(s => s.id === set.id ? { ...s, reps: Number(e.target.value) } : s) } : ex) })} 
                            style={{ color: '#000000' }}
                            className="w-[40px] sm:w-[48px] bg-slate-100 rounded-xl py-2 sm:py-2.5 text-center text-[18px] sm:text-[21px] font-black outline-none border border-black/5 focus:border-black/20 transition-all shadow-inner [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] appearance-none px-0.5" 
                          />
                          {lastPerformedExercise && lastPerformedExercise.sets[index] && (
                            <div className="absolute -bottom-[18px] left-1/2 -translate-x-1/2 text-[10px] sm:text-[11px] font-black text-black uppercase tracking-wider whitespace-nowrap">
                              上次: {lastPerformedExercise.sets[index].reps}次
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const newReps = (set.reps || 0) + 1;
                            onUpdate({ 
                              ...session, 
                              exercises: session.exercises.map(ex => 
                                ex.id === currentDetailEx!.id 
                                  ? { ...ex, sets: ex.sets.map(s => s.id === set.id ? { ...s, reps: newReps } : s) } 
                                  : ex
                              ) 
                            });
                          }}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-200 hover:bg-slate-300 active:scale-90 flex items-center justify-center text-black font-black shrink-0 transition-all border border-black/10"
                          title="加 1 次"
                        >
                          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                        </button>
                      </div>

                      <div className="col-span-2 flex justify-end">
                        <motion.button 
                          whileTap={{ scale: 0.9 }}
                          onClick={() => { 
                            const newComp = !set.completed; 
                            if(newComp && context) context.triggerRestTimer(); 
                            onUpdate({ ...session, exercises: session.exercises.map(ex => ex.id === currentDetailEx!.id ? { ...ex, sets: ex.sets.map(s => s.id === set.id ? { ...s, completed: newComp } : s) } : ex) }); 
                          }} 
                          className={`w-[58px] h-[58px] rounded-xl flex items-center justify-center transition-all border shadow-sm ${set.completed ? 'bg-[#CCFF00] border-[#CCFF00] text-black' : 'bg-slate-50 border-black/5 text-black'}`}
                        >
                          <motion.div
                            animate={{ 
                              scale: set.completed ? [1, 1.25, 1] : 1,
                              rotate: set.completed ? [0, 10, -10, 0] : 0
                            }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <Check className="w-7 h-7 stroke-[4]" />
                          </motion.div>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="pt-6 pb-12">
                <button 
                  onClick={() => {
                    if (!session.timerStartedAt) {
                       onUpdate({ ...session, timerStartedAt: Date.now() });
                    }
                    onFinish();
                  }} 
                  style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
                  className="w-full font-black h-14 rounded-2xl uppercase text-lg active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 tracking-tighter"
                >
                  <Save className="w-5 h-5 stroke-[2.5]" style={{ color: lightTheme.accent }} /> 儲存訓練
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};