
import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../App';
import { MuscleHeatmap } from './MuscleHeatmap';
import { calculateMuscleActivation, getBMIAnalysis, calculateSuggestedCalories } from '../utils/fitnessMath';
import { Target, Activity, Scale, Ruler, Zap, Heart, User, Trash2, ArrowUpRight, Flame, Share2, X, Smartphone, Copy, CheckCircle2, Apple, Chrome, ArrowRight, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ProfileView: React.FC = () => {
  const context = useContext(AppContext);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const bodyMetrics = context?.bodyMetrics || [];
  const goal = context?.goal || { type: 'maintain', targetWeight: 0, startWeight: 0, activityLevel: 1.55 };
  const history = context?.history || [];
  const setBodyMetrics = context?.setBodyMetrics || (() => {});
  const setGoal = context?.setGoal || (() => {});

  const latest = useMemo(() => bodyMetrics[0] || { 
    weight: 0, 
    height: 0, 
    age: 0, 
    gender: 'male' as const 
  }, [bodyMetrics]);

  const bmi = useMemo(() => {
    if (latest.height === 0 || latest.weight === 0) return 0;
    const h = latest.height / 100;
    return Number((latest.weight / (h * h)).toFixed(1));
  }, [latest.weight, latest.height]);

  const bmiAnalysis = useMemo(() => getBMIAnalysis(bmi), [bmi]);
  
  const suggestedCals = useMemo(() => {
    if (latest.weight === 0 || latest.height === 0 || latest.age === 0) return 0;
    return calculateSuggestedCalories(latest.weight, latest.height, latest.age, latest.gender as any || 'male', goal.type);
  }, [latest.weight, latest.height, latest.age, latest.gender, goal.type]);

  if (!context) return null;

  const updateLatest = (updates: Partial<typeof latest>) => {
    const newMetric = { ...latest, id: crypto.randomUUID(), date: Date.now(), ...updates };
    setBodyMetrics([newMetric, ...bodyMetrics.slice(1)]);
  };

  const currentUrl = window.location.href;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(currentUrl)}&bgcolor=FFFFFF&color=000000`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 獲取手機 App 引導區塊 */}
      <div className="glass rounded-[40px] p-6 border-neon-green/20 relative overflow-hidden bg-gradient-to-br from-neon-green/10 to-transparent shadow-lg glow-green">
         <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-neon-green text-black rounded-2xl animate-float">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black italic uppercase tracking-tighter">下載 App 到手機</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">體驗全螢幕專業健身追蹤</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowQR(true)}
              className="w-full bg-white text-black font-black py-4 rounded-[24px] flex items-center justify-center gap-2 active:scale-95 transition-all text-sm uppercase italic tracking-tighter shadow-xl"
            >
              獲取下載連結與教學 <ArrowRight className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* 生理數據 */}
      <div className="glass rounded-[40px] p-6 border-white/5 relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
           <div className="space-y-1">
             <h3 className="text-sm font-black italic uppercase tracking-tighter">個人生理數據</h3>
             <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${bmiAnalysis.color}`}>
                <Activity className="w-3 h-3" /> BMI: {bmi || '--'} ({bmi > 0 ? bmiAnalysis.label : '未設定'})
             </div>
           </div>
           
           <div className="flex bg-slate-800/80 p-1 rounded-xl border border-white/5 shadow-inner">
              <button onClick={() => updateLatest({ gender: 'male' })} className={`p-2 rounded-lg transition-all ${latest.gender === 'male' ? 'bg-sky-500 text-white' : 'text-slate-600 opacity-40'}`}>
                <MaleSilhouette />
              </button>
              <button onClick={() => updateLatest({ gender: 'female' })} className={`p-2 rounded-lg transition-all ${latest.gender === 'female' ? 'bg-pink-500 text-white' : 'text-slate-600 opacity-40'}`}>
                <FemaleSilhouette />
              </button>
           </div>
        </div>
        
        <div className="flex items-center justify-between gap-4">
           <div className="flex-1 grid grid-cols-1 gap-3">
              <InputBox icon={<Ruler className="text-sky-400" />} label="身高" val={latest.height} unit="CM" onChange={v => updateLatest({ height: Number(v) })} />
              <InputBox icon={<Scale className="text-orange-400" />} label="當前體重" val={latest.weight} unit="KG" onChange={v => updateLatest({ weight: Number(v) })} />
              <InputBox icon={<User className="text-purple-400" />} label="年齡" val={latest.age} unit="歲" onChange={v => updateLatest({ age: Number(v) })} />
           </div>
           <div className="w-[140px]">
              <MuscleHeatmap scores={calculateMuscleActivation(history)} gender={latest.gender as any || 'male'} />
           </div>
        </div>
      </div>

      {/* 目標與熱量 */}
      <div className={`glass rounded-[40px] p-8 border-white/5 relative overflow-hidden ${goal.type === 'bulk' ? 'border-orange-500/30' : goal.type === 'cut' ? 'border-sky-500/30' : ''}`}>
        <h3 className="text-sm font-black italic uppercase tracking-tighter mb-6 flex items-center gap-2">
          <Target className="w-4 h-4 text-neon-green" /> 訓練目標與熱量建議
        </h3>
        
        <div className="grid grid-cols-3 gap-3 mb-6">
          {(['cut', 'maintain', 'bulk'] as const).map(t => (
            <button key={t} onClick={() => setGoal({ ...goal, type: t })} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${goal.type === t ? 'bg-neon-green text-black' : 'bg-slate-800/40 text-slate-500'}`}>
              {t === 'cut' ? '減脂' : t === 'bulk' ? '增肌' : '維持'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="glass bg-white/5 p-5 rounded-[32px] border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-neon-green/10 rounded-2xl">
                <Trophy className="w-5 h-5 text-neon-green" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">理想目標體重</span>
                <div className="flex items-baseline gap-1">
                  <input 
                    type="number" 
                    value={goal.targetWeight === 0 ? '' : goal.targetWeight} 
                    placeholder="--"
                    onChange={e => setGoal({ ...goal, targetWeight: Number(e.target.value) })}
                    className="bg-transparent text-2xl font-black italic text-white outline-none w-20"
                  />
                  <span className="text-xs font-bold text-slate-400 uppercase">KG</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">差距</div>
              <div className="text-sm font-black italic text-neon-green">
                {(latest.weight > 0 && goal.targetWeight > 0) ? Math.abs(latest.weight - goal.targetWeight).toFixed(1) : '--'} KG
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between glass bg-black/30 p-6 rounded-[32px] border-white/5">
          <div className="space-y-1">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">建議每日攝取</span>
             <div className="flex items-baseline gap-1">
               <span className="text-4xl font-black italic text-neon-green">{suggestedCals || '--'}</span>
               <span className="text-xs font-bold text-neon-green/60 uppercase">KCAL</span>
             </div>
          </div>
          <Flame className="w-8 h-8 text-orange-500 opacity-30" />
        </div>
      </div>

      <button 
        onClick={() => { if(confirm('確定要清除所有訓練紀錄與數據？')) { localStorage.clear(); window.location.reload(); }}}
        className="w-full py-5 border border-red-500/10 rounded-[32px] text-red-500/30 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
      >
        <Trash2 className="w-4 h-4" /> 清除所有本地資料
      </button>

      {/* 下載安裝教學彈窗 */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/98 backdrop-blur-2xl" onClick={() => setShowQR(false)} />
            
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative glass rounded-[44px] p-8 w-full max-sm border-white/10 flex flex-col items-center overflow-y-auto max-h-[90vh]">
              <button onClick={() => setShowQR(false)} className="absolute top-6 right-6 text-slate-500 p-2">
                <X className="w-6 h-6" />
              </button>
              
              <div className="w-16 h-16 bg-neon-green/10 rounded-[24px] flex items-center justify-center mb-4">
                <Smartphone className="w-8 h-8 text-neon-green" />
              </div>
              
              <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2 text-white">下載安裝教學</h3>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-8 text-center">把 IRONLOG 加入手機桌面</p>

              <div className="w-full space-y-4 mb-8">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-5 h-5 bg-neon-green text-black rounded-full flex items-center justify-center text-[10px] font-black">1</div>
                   <span className="text-xs font-black uppercase text-white">開啟網址</span>
                </div>
                
                <button 
                  onClick={handleCopyLink}
                  className={`w-full py-4 rounded-2xl font-black italic uppercase tracking-tighter flex items-center justify-center gap-3 transition-all active:scale-95 ${copied ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-neon-green border border-neon-green/20'}`}
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? '網址已複製到剪貼簿' : '點擊複製 App 連結'}
                </button>
                
                <div className="flex flex-col items-center gap-3 py-4 bg-white rounded-[32px] shadow-2xl relative">
                   <img src={qrUrl} alt="App QR Code" className="w-48 h-48" />
                   <p className="text-[9px] font-black text-black/40 uppercase tracking-widest italic">或直接使用手機相機掃描</p>
                </div>
              </div>

              <div className="w-full space-y-6">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-5 h-5 bg-neon-green text-black rounded-full flex items-center justify-center text-[10px] font-black">2</div>
                   <span className="text-xs font-black uppercase text-white">點擊「加入主畫面」</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-3xl p-5 border border-white/5 space-y-3">
                    <Apple className="w-6 h-6 text-sky-400" />
                    <p className="text-[10px] font-bold text-slate-300 leading-relaxed uppercase">
                      iPhone (Safari)<br/>
                      1. 點擊「分享」<br/>
                      2. <span className="text-neon-green">加入主畫面</span>
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-3xl p-5 border border-white/5 space-y-3">
                    <Chrome className="w-6 h-6 text-orange-400" />
                    <p className="text-[10px] font-bold text-slate-300 leading-relaxed uppercase">
                      Android (Chrome)<br/>
                      1. 點擊三個點<br/>
                      2. <span className="text-neon-green">安裝應用程式</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MaleSilhouette = () => (
  <svg width="24" height="24" viewBox="0 0 100 140" fill="currentColor">
    <circle cx="50" cy="15" r="10" />
    <path d="M38 28 L62 28 L72 50 L68 55 L65 90 L60 135 L52 135 L50 105 L48 135 L40 135 L35 90 L32 55 L28 50 Z" />
  </svg>
);

const FemaleSilhouette = () => (
  <svg width="24" height="24" viewBox="0 0 100 140" fill="currentColor">
    <circle cx="50" cy="15" r="9" />
    <path d="M42 28 L58 28 L65 52 L58 70 L68 95 L60 135 L52 135 L50 110 L48 135 L40 135 L32 95 L42 70 L35 52 Z" />
  </svg>
);

const InputBox = ({ icon, label, val, unit, onChange }: any) => (
  <div className="glass bg-white/5 p-3 rounded-2xl border-white/5">
    <div className="flex items-center gap-2 mb-1 opacity-50">
       {icon}
       <span className="text-[7px] font-black uppercase text-slate-300">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <input 
        type="number" 
        placeholder="--"
        className="bg-transparent text-lg font-black italic text-white outline-none w-full" 
        value={val === 0 ? '' : val} 
        onChange={e => onChange(e.target.value)} 
      />
      <span className="text-[8px] font-bold opacity-30 uppercase">{unit}</span>
    </div>
  </div>
);
