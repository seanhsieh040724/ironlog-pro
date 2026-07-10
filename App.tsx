import React, { useState, useEffect, createContext, useMemo } from 'react';
import { WorkoutView } from './components/WorkoutView';
import { RoutineView } from './components/RoutineView';
import { HistoryView } from './components/HistoryView';
import { DietView } from './components/DietView';
import { CoachView } from './components/CoachView';
import { SettingsView } from './components/SettingsView';
import { RestTimer } from './components/RestTimer';
import { CalendarStrip } from './components/CalendarStrip';
import { WorkoutSummaryModal } from './components/WorkoutSummaryModal';
import { AppTab, WorkoutSession, BodyMetric, UserGoal, RoutineTemplate } from './types';
import { Dumbbell, History, LayoutGrid, Calendar, Apple, Bot, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ContainerStyle, lightTheme } from './themeStyles';

export interface AppContextType {
  history: WorkoutSession[];
  setHistory: React.Dispatch<React.SetStateAction<WorkoutSession[]>>;
  bodyMetrics: BodyMetric[];
  setBodyMetrics: React.Dispatch<React.SetStateAction<BodyMetric[]>>;
  goal: UserGoal;
  setGoal: React.Dispatch<React.SetStateAction<UserGoal>>;
  customRoutines: RoutineTemplate[];
  setCustomRoutines: React.Dispatch<React.SetStateAction<RoutineTemplate[]>>;
  triggerRestTimer: (seconds?: number) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('workout');
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [sessionForSummary, setSessionForSummary] = useState<WorkoutSession | null>(null);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetric[]>([]);
  const [goal, setGoal] = useState<UserGoal>({
    type: 'maintain',
    targetWeight: 0,
    startWeight: 0,
    activityLevel: 1.55
  });
  const [customRoutines, setCustomRoutines] = useState<RoutineTemplate[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const [restTimer, setRestTimer] = useState({ active: false, seconds: 90 });

  useEffect(() => {
    // 模擬載入與過場動畫時間
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    const savedHistory = localStorage.getItem('ironlog_v3_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    const savedMetrics = localStorage.getItem('ironlog_v3_metrics');
    if (savedMetrics) setBodyMetrics(JSON.parse(savedMetrics));

    const savedGoal = localStorage.getItem('ironlog_v3_goal');
    if (savedGoal) setGoal(JSON.parse(savedGoal));

    const savedRoutines = localStorage.getItem('ironlog_v3_routines');
    if (savedRoutines) setCustomRoutines(JSON.parse(savedRoutines));

    setCurrentSession({
      id: crypto.randomUUID(),
      startTime: Date.now(),
      title: `${format(new Date(), 'MM/dd')} 訓練`,
      exercises: []
    });
    
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    if (window.webkit?.messageHandlers?.notificationHandler) {
      window.webkit.messageHandlers.notificationHandler.postMessage({ action: 'requestPermission' });
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ironlog_v3_history', JSON.stringify(history));
    }
  }, [history, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ironlog_v3_routines', JSON.stringify(customRoutines));
    }
  }, [customRoutines, isLoaded]);

  const triggerRestTimer = (seconds: number = 90) => {
    setRestTimer({ active: true, seconds });
  };

  const contextValue = useMemo(() => ({
    history, setHistory, 
    bodyMetrics, setBodyMetrics, 
    goal, setGoal, 
    customRoutines, setCustomRoutines,
    triggerRestTimer
  }), [history, bodyMetrics, goal, customRoutines]);

  const handleSaveWorkout = () => {
    if (!currentSession) return;

    const completedExercises = currentSession.exercises.filter(ex => 
      ex.sets.some(set => set.completed)
    );

    if (completedExercises.length === 0) {
      alert('請至少勾選一個完成的組數再儲存訓練紀錄。');
      return;
    }

    const completedSession: WorkoutSession = { 
      ...currentSession, 
      exercises: completedExercises,
      endTime: Date.now() 
    };

    setHistory([completedSession, ...history]);
    setSessionForSummary(completedSession);
  };

  const handleSaveAsRoutine = (session: WorkoutSession) => {
    const newRoutine: RoutineTemplate = {
      id: crypto.randomUUID(),
      name: `${session.title} (轉錄)`,
      exercises: session.exercises.map(ex => ({
        id: crypto.randomUUID(),
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        defaultSets: ex.sets.length,
        defaultReps: ex.sets[0]?.reps || 10,
        defaultWeight: ex.sets[0]?.weight || 0
      }))
    };
    setCustomRoutines(prev => [newRoutine, ...prev]);
    alert('已成功將此訓練紀錄存為自訂課表！');
    setActiveTab('routines');
  };

  return (
    <AppContext.Provider value={contextValue}>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-white"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 1.2, 
                ease: [0.23, 1, 0.32, 1]
              }}
              className="relative"
            >
              {/* iOS Style App Icon */}
              <div className="w-32 h-32 bg-white rounded-[28px] flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-black/5 relative overflow-hidden">
                <img 
                  src="https://i.postimg.cc/P5H3QSkC/Gemini-Generated-Image-38bzpo38bzpo38bz.png" 
                  alt="App Icon" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
              </div>
              
              <motion.div 
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-[#CCFF00] rounded-[28px] -z-10 blur-3xl"
              />
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-12 flex flex-col items-center"
            >
              <div className="inline-flex flex-col items-stretch gap-6">
                <h1 className="text-3xl font-black tracking-tight text-black leading-none text-center">
                  開始今天的訓練吧!
                </h1>
                <p className="text-3xl font-black text-black uppercase tracking-tight text-center leading-none">
                  耶巴蒂 LightWeight!
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ delay: 0.8, duration: 1.2, ease: "easeInOut" }}
              className="h-1 bg-black/5 rounded-full mt-12 overflow-hidden"
            >
              <motion.div 
                animate={{ x: [-120, 120] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-1/2 h-full bg-[#82CC00]"
              />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={ContainerStyle} 
            className="flex flex-col max-w-md mx-auto relative overflow-hidden"
          >
            <main className="flex-1 pb-32 px-5 pt-16 overflow-y-auto no-scrollbar">
              {/* 頂部固定日期標示 */}
              {activeTab === 'workout' && (
                <div className="flex items-center justify-between mt-4 mb-8 px-1">
                  <div className="flex items-center gap-4">
                    <div style={{ backgroundColor: lightTheme.card }} className="w-12 h-12 rounded-2xl flex items-center justify-center border border-black/5 shadow-sm shrink-0">
                      <Calendar className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h1 style={{ color: lightTheme.text }} className="text-3xl font-black uppercase tracking-tighter leading-none">
                        {(() => {
                          const d = new Date();
                          const weekDays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
                          return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${weekDays[d.getDay()]}`;
                        })()}
                      </h1>
                      <p className="text-[11px] font-black text-black uppercase tracking-[0.2em] mt-1.5">
                        TODAY'S WORKOUT
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'workout' && (
                    <WorkoutView 
                      session={currentSession} 
                      onUpdate={setCurrentSession}
                      onFinish={handleSaveWorkout}
                    />
                  )}
                  {activeTab === 'history' && (
                    <div className="space-y-6">
                      <div style={{ backgroundColor: lightTheme.card }} className="rounded-[32px] border border-black/5 shadow-sm">
                        <CalendarStrip 
                          selectedDate={selectedDate} 
                          onDateSelect={setSelectedDate} 
                          workoutDates={history.map(s => new Date(s.startTime))} 
                        />
                      </div>
                      <HistoryView 
                        history={history} 
                        selectedDate={selectedDate} 
                        onUpdateHistory={setHistory} 
                        onSaveAsRoutine={handleSaveAsRoutine}
                      />
                    </div>
                  )}
                  {activeTab === 'routines' && <RoutineView onStartRoutine={(template) => {
                    const newSess: WorkoutSession = {
                      id: crypto.randomUUID(),
                      startTime: Date.now(),
                      title: template.name,
                      exercises: template.exercises.map(te => ({
                        id: crypto.randomUUID(),
                        name: te.name,
                        muscleGroup: te.muscleGroup,
                        sets: Array.from({ length: te.defaultSets || 4 }).map((_, idx) => ({
                          id: crypto.randomUUID(),
                          weight: idx === 0 ? te.defaultWeight : 0, 
                          reps: te.defaultReps,
                          completed: false
                        }))
                      }))
                    };
                    setCurrentSession(newSess);
                    setActiveTab('workout');
                  }} />}
                  {activeTab === 'diet' && <DietView />}
                  {activeTab === 'coach' && <CoachView />}
                  {activeTab === 'settings' && <SettingsView />}
                </motion.div>
              </AnimatePresence>
            </main>

            <nav style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }} className="fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t border-black/5 safe-bottom z-50 px-2 py-4 flex justify-between items-center rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
              <TabButton active={activeTab === 'routines'} onClick={() => setActiveTab('routines')} icon={<LayoutGrid />} label="課表" />
              <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History />} label="歷史" />
              <TabButton active={activeTab === 'workout'} onClick={() => setActiveTab('workout')} icon={<Dumbbell />} label="主頁" />
              <TabButton active={activeTab === 'diet'} onClick={() => setActiveTab('diet')} icon={<Apple />} label="飲食分析" />
              <TabButton active={activeTab === 'coach'} onClick={() => setActiveTab('coach')} icon={<Bot />} label="教練" />
              <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings />} label="設定" />
            </nav>

            <RestTimer 
              active={restTimer.active} 
              seconds={restTimer.seconds} 
              onClose={() => setRestTimer(prev => ({ ...prev, active: false }))} 
            />

            <AnimatePresence>
              {sessionForSummary && (
                <WorkoutSummaryModal 
                  session={sessionForSummary} 
                  onClose={() => {
                    setCurrentSession({
                      id: crypto.randomUUID(),
                      startTime: Date.now(),
                      title: `${format(new Date(), 'MM/dd')} 訓練`,
                      exercises: []
                    });
                    setSelectedDate(new Date());
                    setActiveTab('history');
                    setSessionForSummary(null);
                  }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </AppContext.Provider>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all w-[64px] ${active ? 'text-[#82CC00]' : 'text-black/60 hover:text-black'}`}>
    <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-[#CCFF00]/10 shadow-[0_0_20px_rgba(204,255,0,0.1)]' : ''}`}>
      {React.cloneElement(icon, { className: `w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-2'}` })}
    </div>
    <span className={`text-[9px] font-black tracking-tight leading-tight transition-all ${active ? 'text-black' : 'text-black/60'}`}>{label}</span>
  </button>
);

export default App;