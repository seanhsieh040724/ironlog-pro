
import React, { useState, useEffect, createContext, useMemo } from 'react';
import { WorkoutView } from './components/WorkoutView';
import { RoutineView } from './components/RoutineView';
import { HistoryView } from './components/HistoryView';
import { ProfileView } from './components/ProfileView';
import { RestTimer } from './components/RestTimer';
import { CalendarStrip } from './components/CalendarStrip';
import { AppTab, WorkoutSession, BodyMetric, UserGoal, RoutineTemplate } from './types';
import { Dumbbell, History, User, Calendar as CalendarIcon, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import zhTW from 'date-fns/locale/zh-TW';

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
  const [restTimer, setRestTimer] = useState({ active: false, seconds: 90 });

  useEffect(() => {
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
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ironlog_v3_history', JSON.stringify(history));
      localStorage.setItem('ironlog_v3_routines', JSON.stringify(customRoutines));
    }
  }, [history, customRoutines, isLoaded]);

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
    if (!currentSession || currentSession.exercises.length === 0) {
      alert('請先新增動作項目。');
      return;
    }
    const completedSession = { ...currentSession, endTime: Date.now() };
    setHistory([completedSession, ...history]);
    setCurrentSession({
      id: crypto.randomUUID(),
      startTime: Date.now(),
      title: `${format(new Date(), 'MM/dd')} 訓練`,
      exercises: []
    });
    setSelectedDate(new Date());
    setActiveTab('history');
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
      <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col max-w-md mx-auto relative overflow-hidden font-['Outfit']">
        <header className="pt-14 pb-8 px-7 sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-3xl border-b border-white/5">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-neon-green">
                <CalendarIcon className="w-5 h-5" />
                <span className="text-[12px] font-black uppercase tracking-[0.2em]">今日訓練狀態</span>
              </div>
              <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                {format(new Date(), 'MM.dd EEEE', { locale: zhTW })}
              </h1>
            </div>
            <button 
              onClick={() => setActiveTab('profile')} 
              className={`w-16 h-16 rounded-[22px] flex items-center justify-center border border-white/10 transition-all active:scale-90 ${activeTab === 'profile' ? 'bg-neon-green text-black shadow-[0_0_25px_rgba(173,255,47,0.2)]' : 'bg-slate-800 text-slate-400'}`}
            >
              <User className="w-8 h-8" />
            </button>
          </div>
        </header>

        <main className="flex-1 pb-36 px-6 pt-8 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
              {activeTab === 'workout' && <WorkoutView session={currentSession} onUpdate={setCurrentSession} onFinish={handleSaveWorkout} />}
              {activeTab === 'history' && (
                <div className="space-y-8">
                  <div className="bg-slate-900/40 rounded-[36px] border border-white/5 shadow-inner p-2">
                    <CalendarStrip selectedDate={selectedDate} onDateSelect={setSelectedDate} workoutDates={history.map(s => new Date(s.startTime))} />
                  </div>
                  <HistoryView history={history} selectedDate={selectedDate} onUpdateHistory={setHistory} onSaveAsRoutine={handleSaveAsRoutine} />
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
              {activeTab === 'profile' && <ProfileView />}
            </motion.div>
          </AnimatePresence>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#020617]/98 backdrop-blur-3xl border-t border-white/5 safe-bottom z-50 px-10 py-7 flex justify-between items-center rounded-t-[48px] shadow-[0_-15px_40px_rgba(0,0,0,0.5)]">
          <TabButton active={activeTab === 'workout'} onClick={() => setActiveTab('workout')} icon={<Dumbbell />} label="記錄" />
          <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History />} label="歷史" />
          <TabButton active={activeTab === 'routines'} onClick={() => setActiveTab('routines')} icon={<LayoutGrid />} label="課表" />
          <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User />} label="個人" />
        </nav>

        <RestTimer active={restTimer.active} seconds={restTimer.seconds} onClose={() => setRestTimer(prev => ({ ...prev, active: false }))} />
      </div>
    </AppContext.Provider>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-3 transition-all w-20 ${active ? 'text-neon-green' : 'text-slate-500'}`}>
    <div className={`p-3 rounded-2xl transition-all ${active ? 'bg-neon-green/10 shadow-[0_0_25px_rgba(173,255,47,0.15)]' : ''}`}>
      {React.cloneElement(icon, { className: `w-7 h-7 ${active ? 'stroke-[2.5]' : 'stroke-2'}` })}
    </div>
    <span className="text-[12px] font-black uppercase tracking-[0.15em]">{label}</span>
  </button>
);

export default App;
