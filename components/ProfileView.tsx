
import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../App';
import { BodyMetric, UserGoal } from '../types';
import { getBMIAnalysis, calculateSuggestedCalories, getMuscleGroupDisplay } from '../utils/fitnessMath';
import { Target, Activity, Scale, Ruler, Zap, Heart, User, Trash2, ArrowUpRight, Flame, Smartphone, Copy, CheckCircle2, Apple, Chrome, Droplets, Utensils, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ProfileView: React.FC = () => {
  const context = useContext(AppContext);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const bodyMetrics = context?.bodyMetrics || [];
  const goal: UserGoal = context?.goal || { type: 'maintain', targetWeight: 0, startWeight: 0, activityLevel: 1.55 };
  const setBodyMetrics = context?.setBodyMetrics || (() => {});
  const setGoal = context?.setGoal || (() => {});

  const latest: BodyMetric = useMemo(() => {
    return bodyMetrics[0] || { id: '', date: Date.now(), weight: 0, height: 0, age: 0, gender: 'male' };
  }, [bodyMetrics]);

  const bmi: number = useMemo(() => {
    if (latest.height === 0 || latest.weight === 0) return 0;
    return Number((latest.weight / Math.pow(latest.height / 100, 2)).toFixed(1));
  }, [latest.weight, latest.height]);

  const bmiAnalysis = useMemo(() => getBMIAnalysis(bmi), [bmi]);
  const suggestedCals = calculateSuggestedCalories(latest.weight, latest.height, latest.age, latest.gender, goal.type);

  const analysisMetrics = useMemo(() => {
    if (latest.weight === 0) return null;
    return {
      protein: { min: Math.round(latest.weight * 1.6), max: Math.round(latest.weight * 2.2) },
      water: Math.round(latest.weight * 35),
      idealWeight: { min: Math.round(18.5 * Math.pow(latest.height / 100, 2)), max: Math.round(24 * Math.pow(latest.height / 100, 2)) }
    };
  }, [latest]);

  if (!context) return null;

  const updateLatest = (updates: Partial<BodyMetric>) => {
    const newMetric = { ...latest, id: crypto.randomUUID(), date: Date.now(), ...updates };
    setBodyMetrics([newMetric, ...bodyMetrics.slice(1)]);
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="glass rounded-[40px] p-8 border-neon-green/20 relative overflow-hidden bg-gradient-to-br from-neon-green/10 to-transparent shadow-2xl">
         <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white text-black rounded-[24px] flex items-center justify-center animate-float shadow-xl">
                <Smartphone className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">安裝為桌面 App</h3>
                <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest leading-none">專業訓練追蹤體驗</p>
              </div>
            </div>
            <button onClick={() => setShowQR(true)} className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-neon-green active:scale-90 border border-white/5 shadow-lg">
              <ArrowUpRight className="w-7 h-7" />
            </button>
         </div>
      </div>

      <div className="glass rounded-[48px] p-10 border-white/5 relative overflow-hidden shadow-2xl space-y-10">
        <div className="flex justify-between items-start">
           <div className="space-y-3">
             <div className="flex items-center gap-3 text-neon-green">
                <Activity className="w-5 h-5" />
                <h3 className="text-[12px] font-black italic uppercase tracking-[0.3em]">PHYSIOLOGY</h3>
             </div>
             <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">生理數據設定</h2>
           </div>
           <div className="flex bg-slate-800/80 p-2.5 rounded-[22px] border border-white/5">
              <button onClick={() => updateLatest({ gender: 'male' })} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${latest.gender === 'male' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-600 opacity-40 hover:opacity-100'}`}><MaleIcon /></button>
              <button onClick={() => updateLatest({ gender: 'female' })} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${latest.gender === 'female' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'text-slate-600 opacity-40 hover:opacity-100'}`}><FemaleIcon /></button>
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-6">
              <InputBox icon={<Ruler className="text-sky-400" />} label="身高" val={latest.height} unit="CM" onChange={(v: string) => updateLatest({ height: Number(v) })} />
              <InputBox icon={<Scale className="text-orange-400" />} label="體重" val={latest.weight} unit="KG" onChange={(v: string) => updateLatest({ weight: Number(v) })} />
              <InputBox icon={<User className="text-purple-400" />} label="年齡" val={latest.age} unit="歲" onChange={(v: string) => updateLatest({ age: Number(v) })} />
              <div className="pt-2">
                <div className={`px-8 py-6 rounded-[32px] border border-white/5 flex flex-col gap-2 bg-black/40`}>
                  <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">當前 BMI 指數</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-4xl font-black italic text-white">{bmi || '--'}</span>
                    <span className={`text-[12px] font-black uppercase px-5 py-2 rounded-full border ${bmiAnalysis.color} border-current`}>{(bmi as number) > 0 ? bmiAnalysis.label : '未設定'}</span>
                  </div>
                </div>
              </div>
           </div>

           <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6 text-neon-green" />
                <h3 className="text-sm font-black italic uppercase tracking-widest text-white">身體指標分析</h3>
              </div>
              <div className="grid grid-cols-1 gap-5">
                 <AnalysisCard icon={<Utensils className="w-6 h-6 text-emerald-400" />} label="蛋白質攝取建議" value={analysisMetrics ? `${analysisMetrics.protein.min}-${analysisMetrics.protein.max}` : '--'} unit="G / DAY" desc="依健身族群 1.6-2.2g/kg 計算" />
                 <AnalysisCard icon={<Droplets className="w-6 h-6 text-sky-400" />} label="每日飲水建議" value={analysisMetrics ? `${analysisMetrics.water}` : '--'} unit="ML / DAY" desc="依 35ml/kg 代謝水分計算" />
                 <AnalysisCard icon={<Info className="w-6 h-6 text-purple-400" />} label="理想體重範圍" value={analysisMetrics ? `${analysisMetrics.idealWeight.min}-${analysisMetrics.idealWeight.max}` : '--'} unit="KG" desc="依標準 BMI 18.5-24 換算" />
              </div>
           </div>
        </div>
      </div>

      <div className={`glass rounded-[48px] p-10 border-white/5 shadow-2xl relative overflow-hidden`}>
        <div className="flex items-center gap-5 mb-12">
          <div className="p-4 bg-neon-green/10 rounded-[22px]"><Target className="w-7 h-7 text-neon-green" /></div>
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">體態管理目標</h3>
            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Physics Management</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-12">
          {(['cut', 'maintain', 'bulk'] as const).map(t => (
            <button key={t} onClick={() => setGoal({ ...goal, type: t })} className={`py-6 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all ${goal.type === t ? 'bg-neon-green text-black shadow-2xl shadow-neon-green/10 scale-105' : 'bg-slate-900/60 text-slate-600 border border-white/5'}`}>
              {t === 'cut' ? '減脂' : t === 'bulk' ? '增肌' : '維持'}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
           <div className="glass bg-white/5 p-8 rounded-[36px] border-white/5 flex flex-col gap-3">
              <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest">目標體重</span>
              <div className="flex items-baseline gap-2">
                <input type="number" value={goal.targetWeight === 0 ? '' : goal.targetWeight} placeholder="--" onChange={e => setGoal({ ...goal, targetWeight: Number(e.target.value) })} className="bg-transparent text-5xl font-black italic text-white outline-none w-full" />
                <span className="text-base font-bold text-slate-600 uppercase">KG</span>
              </div>
           </div>
           <div className="glass bg-black/40 p-8 rounded-[36px] border-white/5 flex flex-col justify-center">
              <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest mb-2">差距</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-black italic ${(latest.weight as number) > (goal.targetWeight as number) ? 'text-red-400' : 'text-neon-green'}`}>
                  {((latest.weight as number) > 0 && (goal.targetWeight as number) > 0) ? Math.abs((latest.weight as number) - (goal.targetWeight as number)).toFixed(1) : '--'}
                </span>
                <span className="text-base font-bold text-slate-600 uppercase">KG</span>
              </div>
           </div>
        </div>
        <div className="mt-10 flex items-center justify-between glass bg-gradient-to-r from-orange-500/20 to-transparent p-8 rounded-[40px] border-white/5">
          <div className="space-y-2">
             <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest">建議每日熱量 (TDEE)</span>
             <div className="flex items-baseline gap-2">
               <span className="text-6xl font-black italic text-orange-400">{suggestedCals || '--'}</span>
               <span className="text-base font-bold text-orange-400/60 uppercase">KCAL / DAY</span>
             </div>
          </div>
          <Flame className="w-16 h-16 text-orange-500 opacity-20 animate-pulse" />
        </div>
      </div>

      <button onClick={() => { if(confirm('確定要清除所有紀錄？')) { localStorage.clear(); window.location.reload(); }}} className="w-full py-7 border border-red-500/10 rounded-[40px] text-red-500/30 text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-3 active:bg-red-500/10 active:text-red-500 transition-all shadow-xl">
        <Trash2 className="w-6 h-6" /> 清除所有本地訓練數據
      </button>

      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/98 backdrop-blur-3xl" onClick={() => setShowQR(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative glass rounded-[56px] p-12 w-full max-sm border-white/10 flex flex-col items-center shadow-[0_0_100px_rgba(0,0,0,0.8)]">
              <button onClick={() => setShowQR(false)} className="absolute top-10 right-10 text-slate-600"><X className="w-8 h-8" /></button>
              <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-3 text-white text-center">下載 IronLog</h3>
              <p className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.4em] mb-14 text-center">簡單三步驟，開啟專業健身生活</p>
              <div className="w-full space-y-8 mb-12 text-center">
                <div className="bg-white p-6 rounded-[48px] inline-block shadow-2xl"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(window.location.href)}`} alt="QR Code" className="w-60 h-60" /></div>
                <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">掃描 QR Code 或複製連結</p>
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className={`w-full py-6 rounded-3xl font-black italic uppercase tracking-tighter flex items-center justify-center gap-5 transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-neon-green border border-neon-green/20'}`}>
                  {copied ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                  {copied ? '連結已複製' : '複製網址'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6 w-full">
                <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 space-y-4">
                  <Apple className="w-8 h-8 text-sky-400" />
                  <p className="text-[11px] font-bold text-slate-300 leading-relaxed uppercase">Safari: 分享 &rarr; 加入主畫面</p>
                </div>
                <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 space-y-4">
                  <Chrome className="w-8 h-8 text-orange-400" />
                  <p className="text-[11px] font-bold text-slate-300 leading-relaxed uppercase">Chrome: 設定 &rarr; 安裝程式</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MaleIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><path d="M10 22v-8L7 11V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3l-3 3v8"/></svg>;
const FemaleIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><path d="m9 22 2-6H7l2-5V8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3l2 5h-4l2 6"/></svg>;

const InputBox = ({ icon, label, val, unit, onChange }: any) => (
  <div className="glass bg-white/5 p-6 rounded-[24px] border-white/5 shadow-inner">
    <div className="flex items-center gap-3 mb-2 opacity-50">
       {icon}
       <span className="text-[11px] font-black uppercase text-slate-300 tracking-widest">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <input type="number" placeholder="--" className="bg-transparent text-3xl font-black italic text-white outline-none w-full" value={val === 0 ? '' : val} onChange={e => onChange(e.target.value)} />
      <span className="text-[12px] font-bold opacity-30 uppercase">{unit}</span>
    </div>
  </div>
);

const AnalysisCard = ({ icon, label, value, unit, desc }: any) => (
  <div className="p-6 rounded-[28px] bg-black/40 border border-white/5 space-y-3 shadow-xl">
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-black italic text-white">{value}</span>
      <span className="text-[11px] font-bold text-slate-600 uppercase">{unit}</span>
    </div>
    <p className="text-[11px] font-medium text-slate-500 italic leading-none">{desc}</p>
  </div>
);
