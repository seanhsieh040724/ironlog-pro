import React, { useContext, useMemo, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { BodyMetric, UserGoal } from '../types';
import { getBMIAnalysis, calculateSuggestedCalories, getMuscleGroupDisplay } from '../utils/fitnessMath';
import { Target, Activity, Scale, Ruler, Zap, Heart, User, Trash2, ArrowUpRight, Flame, Share2, X, Smartphone, Copy, CheckCircle2, Apple, Chrome, ArrowRight, Trophy, Calendar, Droplets, Utensils, Info, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ProfileView: React.FC = () => {
  const context = useContext(AppContext);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const bodyMetrics = context?.bodyMetrics || [];
  const goal: UserGoal = context?.goal || { type: 'maintain', targetWeight: 0, startWeight: 0, activityLevel: 1.55 };
  const history = context?.history || [];
  const setBodyMetrics = context?.setBodyMetrics || (() => {});
  const setGoal = context?.setGoal || (() => {});

  const latest: BodyMetric = useMemo(() => {
    const first = bodyMetrics[0];
    if (first) return first;
    return { 
      id: '',
      date: Date.now(),
      weight: 0, 
      height: 0, 
      age: 0, 
      gender: 'male'
    };
  }, [bodyMetrics]);

  // 生理數據暫存狀態
  const [tempMetrics, setTempMetrics] = useState<BodyMetric>(latest);
  const [isSaved, setIsSaved] = useState(false);

  // 目標管理暫存狀態
  const [tempGoal, setTempGoal] = useState<UserGoal>(goal);
  const [isGoalSaved, setIsGoalSaved] = useState(false);

  useEffect(() => {
    setTempMetrics(latest);
  }, [latest]);

  useEffect(() => {
    setTempGoal(goal);
  }, [goal]);

  const bmi: number = useMemo(() => {
    if (tempMetrics.height === 0 || tempMetrics.weight === 0) return 0;
    const h = tempMetrics.height / 100;
    return Number((tempMetrics.weight / (h * h)).toFixed(1));
  }, [tempMetrics.weight, tempMetrics.height]);

  const bmiAnalysis = useMemo(() => getBMIAnalysis(bmi), [bmi]);
  
  const suggestedCals: number = useMemo(() => {
    if (tempMetrics.weight === 0 || tempMetrics.height === 0 || tempMetrics.age === 0) return 0;
    return calculateSuggestedCalories(tempMetrics.weight, tempMetrics.height, tempMetrics.age, tempMetrics.gender as any || 'male', tempGoal.type);
  }, [tempMetrics.weight, tempMetrics.height, tempMetrics.age, tempMetrics.gender, tempGoal.type]);

  const analysisMetrics = useMemo(() => {
    if (tempMetrics.weight === 0) return null;
    return {
      protein: {
        min: Math.round(tempMetrics.weight * 1.6),
        max: Math.round(tempMetrics.weight * 2.2)
      },
      water: Math.round(tempMetrics.weight * 35),
      idealWeight: {
        min: Math.round(18.5 * Math.pow(tempMetrics.height / 100, 2)),
        max: Math.round(24 * Math.pow(tempMetrics.height / 100, 2))
      }
    };
  }, [tempMetrics]);

  if (!context) return null;

  const handleSaveMetrics = () => {
    const newMetric = { ...tempMetrics, id: crypto.randomUUID(), date: Date.now() };
    setBodyMetrics([newMetric, ...bodyMetrics.slice(1)]);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSaveGoal = () => {
    setGoal(tempGoal);
    setIsGoalSaved(true);
    setTimeout(() => setIsGoalSaved(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-7 pb-24">
      {/* 頂部引導 PWA */}
      <div className="glass rounded-[40px] p-7 border-neon-green/20 relative overflow-hidden bg-gradient-to-br from-neon-green/10 to-transparent shadow-lg">
         <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center animate-float shadow-xl">
                <Smartphone className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black italic uppercase tracking-tighter text-white">安裝為桌面 App</h3>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">全螢幕體驗與專業追蹤</p>
              </div>
            </div>
            <button onClick={() => setShowQR(true)} className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-neon-green active:scale-90 transition-all border border-white/5">
              <ArrowUpRight className="w-6 h-6" />
            </button>
         </div>
      </div>

      {/* 生理數據區塊 */}
      <div className="glass rounded-[44px] p-8 border-white/5 relative overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center mb-10">
           <div className="flex items-center gap-4">
             <div className="p-3.5 bg-neon-green/10 rounded-2xl">
                <Activity className="w-6 h-6 text-neon-green" />
             </div>
             <div>
               <h3 className="text-base font-black italic uppercase tracking-tighter text-white leading-none">生理數據設定</h3>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">PHYSIOLOGICAL PARAMETERS</p>
             </div>
           </div>
           
           <button 
             onClick={handleSaveMetrics} 
             className={`px-5 py-2.5 rounded-xl font-black uppercase italic transition-all flex items-center justify-center gap-2 text-[11px] ${isSaved ? 'bg-emerald-500 text-white' : 'bg-neon-green text-black active:scale-95 shadow-lg shadow-neon-green/10'}`}
           >
             {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
             {isSaved ? '已儲存' : '儲存'}
           </button>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
           <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <InputBox icon={<Ruler className="text-sky-400 w-3 h-3" />} label="身高" val={tempMetrics.height} unit="CM" onChange={(v: string) => setTempMetrics({ ...tempMetrics, height: Number(v) })} />
                <InputBox icon={<Scale className="text-orange-400 w-3 h-3" />} label="體重" val={tempMetrics.weight} unit="KG" onChange={(v: string) => setTempMetrics({ ...tempMetrics, weight: Number(v) })} />
                <InputBox icon={<User className="text-purple-400 w-3 h-3" />} label="年齡" val={tempMetrics.age} unit="歲" onChange={(v: string) => setTempMetrics({ ...tempMetrics, age: Number(v) })} />
                
                <div className="glass bg-white/5 p-5 rounded-2xl border-white/5 flex flex-col justify-between">
                  <div className="flex items-center gap-2.5 mb-2 opacity-50">
                     <Heart className="text-pink-400 w-3 h-3" />
                     <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">性別</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => setTempMetrics({ ...tempMetrics, gender: 'male' })}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${tempMetrics.gender === 'male' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-500'}`}
                    >
                      男
                    </button>
                    <button 
                      onClick={() => setTempMetrics({ ...tempMetrics, gender: 'female' })}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${tempMetrics.gender === 'female' ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-500'}`}
                    >
                      女
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <div className={`px-6 py-5 rounded-[28px] border border-white/5 flex flex-col gap-1.5 bg-black/40`}>
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">當前 BMI 指數</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black italic text-white">{bmi || '--'}</span>
                    <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border ${bmiAnalysis.color} border-current`}>{(bmi as number) > 0 ? bmiAnalysis.label : '未設定'}</span>
                  </div>
                </div>
              </div>
           </div>

           <div className="space-y-5">
              <div className="flex items-center gap-2.5 mb-1">
                <Zap className="w-5 h-5 text-neon-green" />
                <h3 className="text-xs font-black italic uppercase tracking-widest text-white">身體指標分析</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                 <AnalysisCard 
                   icon={<Utensils className="w-5 h-5 text-emerald-400" />}
                   label="蛋白質建議攝取"
                   value={analysisMetrics ? `${analysisMetrics.protein.min}-${analysisMetrics.protein.max}` : '--'}
                   unit="G / DAY"
                   desc="依據健身族群 1.6-2.2g/kg 計算"
                 />
                 <AnalysisCard 
                   icon={<Droplets className="w-5 h-5 text-sky-400" />}
                   label="每日飲水建議"
                   value={analysisMetrics ? `${analysisMetrics.water}` : '--'}
                   unit="ML / DAY"
                   desc="依據 35ml/kg 基礎代謝水分計算"
                 />
                 <AnalysisCard 
                   icon={<Info className="w-5 h-5 text-purple-400" />}
                   label="理想體重範圍"
                   value={analysisMetrics ? `${analysisMetrics.idealWeight.min}-${analysisMetrics.idealWeight.max}` : '--'}
                   unit="KG"
                   desc="依據標準 BMI 18.5-24 區間換算"
                 />
              </div>
           </div>
        </div>
      </div>

      {/* 目標管理與熱量建議 */}
      <div className={`glass rounded-[44px] p-8 border-white/5 shadow-2xl relative overflow-hidden`}>
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-neon-green/10 rounded-2xl">
              <Target className="w-6 h-6 text-neon-green" />
            </div>
            <div>
              <h3 className="text-base font-black italic uppercase tracking-tighter text-white leading-none">體態管理目標</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Physics Management</p>
            </div>
          </div>

          <button 
             onClick={handleSaveGoal} 
             className={`px-5 py-2.5 rounded-xl font-black uppercase italic transition-all flex items-center justify-center gap-2 text-[11px] ${isGoalSaved ? 'bg-emerald-500 text-white' : 'bg-neon-green text-black active:scale-95 shadow-lg shadow-neon-green/10'}`}
           >
             {isGoalSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
             {isGoalSaved ? '已儲存' : '儲存'}
           </button>
        </div>
        
        <div className="grid grid-cols-3 gap-3.5 mb-10">
          {(['cut', 'maintain', 'bulk'] as const).map(t => (
            <button key={t} onClick={() => setTempGoal({ ...tempGoal, type: t })} className={`py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${tempGoal.type === t ? 'bg-neon-green text-black shadow-lg shadow-neon-green/10' : 'bg-slate-900/60 text-slate-600 border border-white/5'}`}>
              {t === 'cut' ? '減脂' : t === 'bulk' ? '增肌' : '維持'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-5">
           <div className="glass bg-white/5 p-7 rounded-[32px] border-white/5 flex flex-col gap-2.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">目標體重</span>
              <div className="flex items-baseline gap-1.5">
                <input type="number" value={tempGoal.targetWeight === 0 ? '' : tempGoal.targetWeight} placeholder="--" onChange={e => setTempGoal({ ...tempGoal, targetWeight: Number(e.target.value) })} className="bg-transparent text-4xl font-black italic text-white outline-none w-full" />
                <span className="text-sm font-bold text-slate-600 uppercase">KG</span>
              </div>
           </div>
           <div className="glass bg-black/40 p-7 rounded-[32px] border-white/5 flex flex-col justify-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">差距</span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-4xl font-black italic ${(tempMetrics.weight as number) > (tempGoal.targetWeight as number) ? 'text-red-400' : 'text-neon-green'}`}>
                  {((tempMetrics.weight as number) > 0 && (tempGoal.targetWeight as number) > 0) ? Math.abs((tempMetrics.weight as number) - (tempGoal.targetWeight as number)).toFixed(1) : '--'}
                </span>
                <span className="text-sm font-bold text-slate-600 uppercase">KG</span>
              </div>
           </div>
        </div>

        <div className="mt-8 flex items-center justify-between glass bg-gradient-to-r from-orange-500/20 to-transparent p-7 rounded-[36px] border-white/5">
          <div className="space-y-1.5">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">建議每日總熱量 (TDEE)</span>
             <div className="flex items-baseline gap-1.5">
               <span className="text-5xl font-black italic text-orange-400">{suggestedCals || '--'}</span>
               <span className="text-sm font-bold text-orange-400/60 uppercase">KCAL / DAY</span>
             </div>
          </div>
          <Flame className="w-12 h-12 text-orange-500 opacity-20 animate-pulse" />
        </div>
      </div>

      <button onClick={() => { if(confirm('確定要清除所有紀錄？')) { localStorage.clear(); window.location.reload(); }}} className="w-full py-6 border border-red-500/10 rounded-[32px] text-red-500/30 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2.5 active:bg-red-500/10 active:text-red-500 transition-all">
        <Trash2 className="w-5 h-5" /> 清除所有本地訓練數據
      </button>

      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/98 backdrop-blur-2xl" onClick={() => setShowQR(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative glass rounded-[48px] p-10 w-full max-sm border-white/10 flex flex-col items-center">
              <button onClick={() => setShowQR(false)} className="absolute top-8 right-8 text-slate-600"><X className="w-7 h-7" /></button>
              <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-2.5 text-white text-center">下載 IronLog 到主畫面</h3>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-12 text-center">簡單三步驟，開啟專業健身生活</p>

              <div className="w-full space-y-7 mb-10 text-center">
                <div className="bg-white p-5 rounded-[40px] inline-block shadow-2xl">
                   <img src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(window.location.href)}`} alt="QR Code" className="w-52 h-52" />
                </div>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">掃描 QR Code 或複製連結</p>
                <button onClick={handleCopyLink} className={`w-full py-5 rounded-2xl font-black italic uppercase tracking-tighter flex items-center justify-center gap-4 transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-neon-green border border-neon-green/20'}`}>
                  {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? '連結已複製' : '點擊複製網址'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-5 w-full">
                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-3">
                  <Apple className="w-7 h-7 text-sky-400" />
                  <p className="text-[10px] font-bold text-slate-300 leading-relaxed uppercase">Safari: 分享 &rarr; 加入主畫面</p>
                </div>
                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-3">
                  <Chrome className="w-7 h-7 text-orange-400" />
                  <p className="text-[10px] font-bold text-slate-300 leading-relaxed uppercase">Chrome: 設定 &rarr; 安裝應用程式</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InputBox = ({ icon, label, val, unit, onChange }: any) => (
  <div className="glass bg-white/5 p-5 rounded-2xl border-white/5">
    <div className="flex items-center gap-2.5 mb-1.5 opacity-50">
       {icon}
       <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">{label}</span>
    </div>
    <div className="flex items-baseline gap-1.5">
      <input 
        type="number" 
        placeholder="--"
        className="bg-transparent text-2xl font-black italic text-white outline-none w-full" 
        value={val === 0 ? '' : val} 
        onChange={e => onChange(e.target.value)} 
      />
      <span className="text-[11px] font-bold opacity-30 uppercase">{unit}</span>
    </div>
  </div>
);

const AnalysisCard = ({ icon, label, value, unit, desc }: any) => (
  <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2.5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
    </div>
    <div className="flex items-baseline gap-1.5">
      <span className="text-2xl font-black italic text-white">{value}</span>
      <span className="text-[10px] font-bold text-slate-600 uppercase">{unit}</span>
    </div>
    <p className="text-[10px] font-medium text-slate-500 italic leading-none">{desc}</p>
  </div>
);