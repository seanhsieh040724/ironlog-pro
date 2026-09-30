import React, { useState, useMemo, useContext, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { WorkoutSession, ExerciseEntry, SetEntry, MuscleGroup } from '../types';
import { 
  Plus, Trash2, Search, Save, PlusCircle, 
  Check, MinusCircle, Target, Sparkles, ChevronRight, ChevronLeft, Loader2, AlertCircle, BookOpen, PlusSquare, Play, Timer,
  ChevronUp, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExerciseSmallGif } from './ExerciseSmallGif';
import { ExerciseGifDisplay } from './ExerciseGifDisplay';
import { getMuscleGroup, getMuscleGroupDisplay, getExerciseMethod } from '../utils/fitnessMath';
import { AppContext } from '../App';
import { lightTheme, CardStyle, TextStyle, InputStyle, ActionButtonStyle } from '../themeStyles';

export const ORGANIZED_EXERCISES: Record<string, string[]> = {
  'chest': ['槓鈴平板臥推', '槓鈴上斜臥推', '啞鈴平板臥推', '啞鈴上斜臥推', '史密斯平板臥推', '坐姿器械胸推', '蝴蝶機夾胸', '跪姿繩索夾胸', '站姿繩索夾胸', '平板繩索飛鳥', '平板啞鈴飛鳥', '上斜啞鈴飛鳥', '上斜器械飛鳥', '上斜器械胸推', '雙槓撐體輔助', '仰臥器械胸推', '雙槓撐體', '標準俯地挺身', '器械上斜胸推', '史密斯上斜臥推'],
  'back': ['引體向上', '高位下拉', '槓鈴划船', '單臂啞鈴划船', '坐姿器械划船', '俯臥T槓划船', '反握高位划船', '傳統硬舉', '引體向上輔助', 'V把坐姿划船', '寬距坐姿划船', '反握高位下拉', '分動器械下拉', '滑輪直臂下拉', '上斜啞鈴划船'],
  'shoulders': ['坐姿啞鈴肩推', '站姿槓鈴肩推', '阿諾肩推', '器械肩推', '史密斯肩推', '啞鈴側平舉', '繩索單邊側平舉', '器械側平舉', '啞鈴前平舉', '蝴蝶機反向飛鳥', '繩索面拉', '俯身啞鈴反向飛鳥'],
  'legs': ['槓鈴深蹲', '啞鈴高腳杯蹲', '上斜器械腿推', '水平器械腿推', '槓鈴臀推', '保加利亞啞鈴分腿蹲', '哈克深蹲', '俯臥腿後勾', '坐姿腿後勾', '器械站姿提踵', '相撲硬舉', '器械腿外展', '器械腿內收', '六角槓硬舉'],
  'arms': ['槓鈴彎舉', '槓鈴反向彎舉', '啞鈴交替彎舉', '站姿啞鈴錘式彎舉', '牧師椅彎舉', '坐姿上斜啞鈴二頭彎舉', '坐姿啞鈴錘式彎舉', '站姿繩索錘式彎舉', '單臂滑輪三頭下壓', '反手直桿下壓', '繩索下壓', '窄握槓鈴臥推', '碎顱者', '啞鈴頸後臂屈伸', 'cable直槓彎舉', '器械牧師彎舉', 'cable直槓過頭臂屈伸'],
  'core': ['仰臥起坐', '羅馬椅抬腿', '棒式', '俄羅斯轉體', '健腹輪', '器械捲腹', '懸垂抬腿', '登山者', '側棒式', 'cable跪姿捲腹', '下斜捲腹', 'cable單側捲腹']
};

export const EXERCISE_DATABASE = Object.values(ORGANIZED_EXERCISES).flat();

interface WorkoutViewProps {
  session: WorkoutSession | null;
  onUpdate: (session: WorkoutSession) => void;
  onFinish: () => boolean | void;
}

/**
 * 列表狀態保存結構（支援切換 Tab、重新 Mount 與條件渲染）
 */
interface PreservedWorkoutState {
  activeCategory: string;
  searchTerm: string;
  scrollMain: number;
  scrollWindow: number;
  lastExerciseName: string;
  shouldRestore: boolean;
}

let preservedWorkoutState: PreservedWorkoutState = {
  activeCategory: 'chest',
  searchTerm: '',
  scrollMain: 0,
  scrollWindow: 0,
  lastExerciseName: '',
  shouldRestore: false
};

export const WorkoutView: React.FC<WorkoutViewProps> = ({ session, onUpdate, onFinish }) => {
  const context = useContext(AppContext);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  // 保留選定的肌群分類與搜尋字串，即使切換 tab 或重新渲染也不會被重置
  const [activeCategory, setActiveCategory] = useState<string>(preservedWorkoutState.activeCategory);
  const [searchTerm, setSearchTerm] = useState(preservedWorkoutState.searchTerm);
  const [elapsedTime, setElapsedTime] = useState<string>("00:00");

  const overviewContainerRef = useRef<HTMLDivElement | null>(null);

  // 保持 activeExerciseId 即時 ref，供非同步 frame / timeout 嚴格判定
  const activeExerciseIdRef = useRef<string | null>(activeExerciseId);
  activeExerciseIdRef.current = activeExerciseId;

  // 將捲動容器獨立重設至最上方（專供動作詳情頁）
  const resetDetailScrollToTop = useCallback(() => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, []);

  const currentDetailEx = useMemo(() => session?.exercises.find(e => e.id === activeExerciseId), [session, activeExerciseId]);

  const lastPerformedExercise = useMemo(() => {
    if (!currentDetailEx || !context?.history) return null;
    // 找出歷史紀錄中該動作最近的一次（排除當前 session，雖然 history 通常不含當前）
    return context.history
      .filter(s => s.exercises.some(e => e.name === currentDetailEx.name))
      .sort((a, b) => b.startTime - a.startTime)[0]
      ?.exercises.find(e => e.name === currentDetailEx.name);
  }, [currentDetailEx?.name, context?.history]);

  // 同步分類與搜尋狀態至模組層，跨 Tab 與 Mount 保留
  useEffect(() => {
    preservedWorkoutState.activeCategory = activeCategory;
  }, [activeCategory]);

  useEffect(() => {
    preservedWorkoutState.searchTerm = searchTerm;
  }, [searchTerm]);

  // 當使用者在列表視圖（overview）滾動時，持續記錄目前捲動位置（詳情頁滾動絕對不寫入）
  useEffect(() => {
    if (activeExerciseId) return;

    const handleScroll = () => {
      // 若正在執行恢復動畫過程或處於非列表狀態，避免覆寫目標滾動值
      if (preservedWorkoutState.shouldRestore || activeExerciseIdRef.current) return;

      const mainEl = document.querySelector('main');
      const mainTop = mainEl ? mainEl.scrollTop : 0;
      const winTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

      preservedWorkoutState.scrollMain = mainTop;
      preservedWorkoutState.scrollWindow = winTop;
    };

    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (mainEl) mainEl.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeExerciseId]);

  // 執行精確滾動位置恢復（僅用於動作列表 Overview，嚴禁在詳情頁執行）
  const performScrollRestoration = useCallback(() => {
    // 雙重安全守衛：若當前在詳情頁，或未標記恢復，立即退出
    if (activeExerciseIdRef.current || !preservedWorkoutState.shouldRestore) return;

    const targetMain = preservedWorkoutState.scrollMain;
    const targetWin = preservedWorkoutState.scrollWindow;
    const targetEx = preservedWorkoutState.lastExerciseName;

    // 若原本在頂部且無特定動作目標，無須恢復
    if (targetMain <= 0 && targetWin <= 0 && !targetEx) {
      preservedWorkoutState.shouldRestore = false;
      return;
    }

    const mainEl = document.querySelector('main');

    const applyScroll = (): boolean => {
      // 隨時檢查：若使用者進入詳情頁，立即中止避免將詳情頁滾動到底部
      if (activeExerciseIdRef.current) return true;

      let applied = false;

      // 1. 恢復 <main> 獨立捲動容器之 scrollTop
      if (mainEl && targetMain > 0) {
        mainEl.scrollTop = targetMain;
        if (Math.abs(mainEl.scrollTop - targetMain) < 15) {
          applied = true;
        }
      }

      // 2. 恢復 window 捲動位置（相容 window scrolling 情境）
      if (targetWin > 0) {
        window.scrollTo(0, targetWin);
        const currentWin = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        if (Math.abs(currentWin - targetWin) < 15) {
          applied = true;
        }
      }

      // 3. 雙重保險：若因佈局折疊無法抵達 targetMain，以目標動作卡片為錨點確保該動作進入畫面
      if (targetEx) {
        const exElement = document.querySelector(`[data-exercise-name="${targetEx}"]`);
        if (exElement) {
          if (!applied && mainEl && mainEl.scrollTop === 0) {
            exElement.scrollIntoView({ block: 'center', inline: 'nearest' });
            applied = true;
          }
        }
      }

      return applied;
    };

    // 立即嘗試一次
    applyScroll();

    // 隨幀重試以克服 Framer Motion 動畫過程及非同步渲染中 DOM 高度尚未齊備的問題
    let frameId: number;
    let count = 0;
    const maxFrames = 25; // 約 400ms，涵蓋動畫過渡期

    const step = () => {
      if (activeExerciseIdRef.current) return;
      count++;
      applyScroll();
      if (count < maxFrames && preservedWorkoutState.shouldRestore) {
        frameId = requestAnimationFrame(step);
      } else {
        preservedWorkoutState.shouldRestore = false;
      }
    };

    frameId = requestAnimationFrame(step);

    const timer = setTimeout(() => {
      if (!activeExerciseIdRef.current) {
        applyScroll();
      }
      preservedWorkoutState.shouldRestore = false;
    }, 380);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timer);
    };
  }, []);

  // 當返回 overview 且標記需要恢復時，於 LayoutEffect 觸發列表位置恢復
  useLayoutEffect(() => {
    if (!activeExerciseId && preservedWorkoutState.shouldRestore) {
      const cleanup = performScrollRestoration();
      return cleanup;
    }
  }, [activeExerciseId, performScrollRestoration]);

  // 進入動作詳情時：徹底將捲動容器重設至頂部（標題、GIF 與運動方法），絕對從 0 開始
  useLayoutEffect(() => {
    if (activeExerciseId) {
      preservedWorkoutState.shouldRestore = false;
      resetDetailScrollToTop();

      let frameId: number;
      let count = 0;
      const step = () => {
        count++;
        resetDetailScrollToTop();
        if (count < 12) {
          frameId = requestAnimationFrame(step);
        }
      };
      frameId = requestAnimationFrame(step);

      const t1 = setTimeout(resetDetailScrollToTop, 50);
      const t2 = setTimeout(resetDetailScrollToTop, 150);

      return () => {
        cancelAnimationFrame(frameId);
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [activeExerciseId, resetDetailScrollToTop]);

  const addExercise = (name: string) => {
    // 進入動作詳情前：立即擷取目前列表的實際捲動位置與目標動作
    const mainEl = document.querySelector('main');
    const mainTop = mainEl ? mainEl.scrollTop : 0;
    const winTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

    preservedWorkoutState.scrollMain = mainTop;
    preservedWorkoutState.scrollWindow = winTop;
    preservedWorkoutState.activeCategory = activeCategory;
    preservedWorkoutState.searchTerm = searchTerm;
    preservedWorkoutState.lastExerciseName = name;
    // 進入詳情頁時禁止 shouldRestore，確保詳情頁不被列表位置干擾
    preservedWorkoutState.shouldRestore = false;

    // 立即將主容器置頂歸零
    resetDetailScrollToTop();

    // 若目前訓練階段已存在該動作，直接開啟既有卡片避免重複建立空白組數
    const existingEx = session?.exercises.find(e => e.name === name);
    if (existingEx) {
      setActiveExerciseId(existingEx.id);
      return;
    }

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
          <motion.div 
            key="overview" 
            ref={(node) => {
              overviewContainerRef.current = node;
              if (node && (preservedWorkoutState.shouldRestore || preservedWorkoutState.scrollMain > 0 || preservedWorkoutState.scrollWindow > 0)) {
                preservedWorkoutState.shouldRestore = true;
                performScrollRestoration();
              }
            }}
            onAnimationComplete={() => {
              if (preservedWorkoutState.shouldRestore || preservedWorkoutState.scrollMain > 0 || preservedWorkoutState.scrollWindow > 0) {
                performScrollRestoration();
              }
            }}
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            className="space-y-6 pb-40"
          >
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
                      onClick={() => {
                        setActiveCategory(cat);
                        preservedWorkoutState.activeCategory = cat;
                        preservedWorkoutState.scrollMain = 0;
                        preservedWorkoutState.scrollWindow = 0;
                        preservedWorkoutState.lastExerciseName = '';
                        preservedWorkoutState.shouldRestore = false;
                        const mainEl = document.querySelector('main');
                        if (mainEl) mainEl.scrollTop = 0;
                        window.scrollTo(0, 0);
                      }} 
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
                    data-exercise-name={searchTerm.trim()}
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
                    data-exercise-name={exName}
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
          <motion.div 
            key="detail" 
            ref={(node) => {
              if (node) {
                resetDetailScrollToTop();
              }
            }}
            onAnimationComplete={() => {
              resetDetailScrollToTop();
            }}
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 20 }} 
            className="space-y-6 pb-40"
          >
            <div className="relative flex items-center justify-center mb-8 px-1 min-h-[48px]">
              <button 
                onClick={() => {
                  preservedWorkoutState.shouldRestore = true;
                  setActiveExerciseId(null);
                }} 
                className="absolute left-1 p-2 active:scale-90 transition-all shrink-0 z-10"
              >
                <ChevronLeft className="w-8 h-8 text-black stroke-[4]" />
              </button>
              <h2 style={{ color: lightTheme.text }} className="text-2xl sm:text-3xl font-black uppercase leading-tight py-1 text-center px-12">
                {currentDetailEx?.name}
              </h2>
            </div>

            <div className="w-full relative px-1">
              <ExerciseGifDisplay name={currentDetailEx?.name || ''} />
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
                        <div className="relative">
                          <input 
                            type="number" 
                            value={set.reps || ''} 
                            placeholder="0" 
                            onChange={(e) => onUpdate({ ...session, exercises: session.exercises.map(ex => ex.id === currentDetailEx!.id ? { ...ex, sets: ex.sets.map(s => s.id === set.id ? { ...s, reps: Number(e.target.value) } : s) } : ex) })} 
                            style={{ color: '#000000' }}
                            className="w-[44px] sm:w-[50px] bg-slate-100 rounded-xl py-2.5 sm:py-3 text-center text-[19px] sm:text-[22px] font-black outline-none border border-black/5 focus:border-black/20 transition-all shadow-inner [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] appearance-none px-0.5" 
                          />
                          {lastPerformedExercise && lastPerformedExercise.sets[index] && (
                            <div className="absolute -bottom-[18px] left-1/2 -translate-x-1/2 text-[11px] sm:text-[12px] font-black text-black uppercase tracking-wider whitespace-nowrap">
                              上次: {lastPerformedExercise.sets[index].reps}次
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const cur = set.reps || 0;
                              onUpdate({ 
                                ...session, 
                                exercises: session.exercises.map(ex => 
                                  ex.id === currentDetailEx!.id 
                                    ? { ...ex, sets: ex.sets.map(s => s.id === set.id ? { ...s, reps: cur + 1 } : s) } 
                                    : ex
                                ) 
                              });
                            }}
                            className="w-5 h-5 sm:w-5 sm:h-5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 rounded flex items-center justify-center text-black transition-all active:scale-90"
                            title="加1次"
                          >
                            <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const cur = set.reps || 0;
                              onUpdate({ 
                                ...session, 
                                exercises: session.exercises.map(ex => 
                                  ex.id === currentDetailEx!.id 
                                    ? { ...ex, sets: ex.sets.map(s => s.id === set.id ? { ...s, reps: Math.max(0, cur - 1) } : s) } 
                                    : ex
                                ) 
                              });
                            }}
                            className="w-5 h-5 sm:w-5 sm:h-5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 rounded flex items-center justify-center text-black transition-all active:scale-90"
                            title="減1次"
                          >
                            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                          </button>
                        </div>
                        <span className="text-[12px] sm:text-[13px] font-black text-black uppercase shrink-0">rep</span>
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
                    const result = onFinish();
                    if (result !== false) {
                      preservedWorkoutState.shouldRestore = false;
                      preservedWorkoutState.scrollMain = 0;
                      preservedWorkoutState.scrollWindow = 0;
                      preservedWorkoutState.lastExerciseName = '';
                      setActiveExerciseId(null);
                    }
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