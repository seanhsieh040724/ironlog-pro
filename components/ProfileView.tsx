
import React, { useContext, useMemo, useState, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import { BodyMetric, UserGoal } from '../types';
import { getBMIAnalysis, calculateSuggestedCalories, getMuscleGroupDisplay } from '../utils/fitnessMath';
import { Target, Activity, Scale, Ruler, Zap, Heart, User, Trash2, LogOut, Flame, Camera, Edit3, CheckCircle2, Save, Utensils, Droplets, Info, BookOpen, Chrome, ChevronRight, Apple, ShieldAlert, X, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ProfileView: React.FC = () => {
  const context = useContext(AppContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const user = context?.user;
  const setUser = context?.setUser;

  // 彈窗狀態
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 使用者個人資料狀態
  const [profileImage, setProfileImage] = useState<string | null>(user?.picture || localStorage.getItem('ironlog_user_avatar'));
  const [userName, setUserName] = useState<string>(user?.name || localStorage.getItem('ironlog_user_name') || '');
  const [isEditingName, setIsEditingName] = useState(false);
  
  const bodyMetrics = context?.bodyMetrics || [];
  const globalGoal: UserGoal = context?.goal || { type: 'maintain', targetWeight: 0, startWeight: 0, activityLevel: 1.55 };
  const setGlobalGoal = context?.setGoal || (() => {});
  const setBodyMetrics = context?.setBodyMetrics || (() => {});

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

  // 本地臨時狀態，用於編輯
  const [tempMetrics, setTempMetrics] = useState<BodyMetric>(latest);
  const [tempGoal, setTempGoal] = useState<UserGoal>(globalGoal);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setTempMetrics(latest);
    setTempGoal(globalGoal);
  }, [latest, globalGoal]);

  const bmi: number = useMemo(() => {
    if (tempMetrics.height === 0 || tempMetrics.weight === 0) return 0;
    const h = tempMetrics.height / 100;
    return Number((tempMetrics.weight / (h * h)).toFixed(1));
  }, [tempMetrics.weight, tempMetrics.height]);

  const bmiAnalysis = useMemo(() => getBMIAnalysis(bmi), [bmi]);
  
  // 計算熱量建議
  const suggestedCalories = useMemo(() => {
    if (tempMetrics.weight === 0 || tempMetrics.height === 0 || tempMetrics.age === 0) return 0;
    return calculateSuggestedCalories(
      tempMetrics.weight,
      tempMetrics.height,
      tempMetrics.age,
      tempMetrics.gender,
      tempGoal.type,
      tempGoal.activityLevel
    );
  }, [tempMetrics, tempGoal]);

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

  const handleSaveAll = () => {
    const newMetric = { ...tempMetrics, id: crypto.randomUUID(), date: Date.now() };
    setBodyMetrics([newMetric, ...bodyMetrics.slice(1)]);
    setGlobalGoal(tempGoal);
    localStorage.setItem('ironlog_v3_goal', JSON.stringify(tempGoal));
    localStorage.setItem('ironlog_v3_metrics', JSON.stringify([newMetric, ...bodyMetrics.slice(1)]));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleImageClick = () => {
    if (user?.authProvider === 'google') return; 
    fileInputRef.current?.click();
  };

  const handleGoogleLogin = () => {
    if ((window as any).google) {
      (window as any).google.accounts.id.prompt();
      setIsAuthModalOpen(false);
    }
  };

  const handleLogout = () => {
    if (confirm('確定要登出目前的身分嗎？訓練數據將保留在本地。')) {
      localStorage.removeItem('ironlog_auth_user');
      if (setUser) setUser(null);
      setIsAuthModalOpen(false);
    }
  };

  if (!context) return null;

  return (
    <div className="space-y-7 pb-24">
      {/* 個人頭像與基本資料區塊 */}
      <div className="glass rounded-[40px] p-7 border-neon-green/20 relative overflow-hidden bg-gradient-to-br from-neon-green/15 to-transparent shadow-xl">
         <div className="relative z-10 flex items-center gap-6">
            <div className="relative group cursor-pointer" onClick={handleImageClick}>
              <div className="w-20 h-20 rounded-[28px] overflow-hidden border-2 border-neon-green shadow-[0_0_15px_rgba(173,255,47,0.3)] bg-slate-900 flex items-center justify-center transition-transform active:scale-95">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-700" />
                )}
                {user?.authProvider !== 'google' && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                     <Camera className="w-6 h-6 text-neon-green" />
                  </div>
                )}
              </div>
              {user?.authProvider !== 'google' && (
                <>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const b64 = reader.result as string;
                        setProfileImage(b64);
                        localStorage.setItem('ironlog_user_avatar', b64);
                      };
                      reader.readAsDataURL(file);
                    }
                  }} />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-neon-green rounded-full flex items-center justify-center shadow-lg border-2 border-[#020617]">
                     <Camera className="w-3.5 h-3.5 text-black" />
                  </div>
                </>
              )}
            </div>

            <div className="flex-1 space-y-1.5 overflow-hidden">
              <div className="flex items-center gap-2">
                {isEditingName && user?.authProvider !== 'google' ? (
                  <input 
                    autoFocus
                    placeholder="使用者名稱"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      localStorage.setItem('ironlog_user_name', e.target.value);
                    }}
                    onBlur={() => setIsEditingName(false)}
                    className="bg-slate-800/50 border-b border-neon-green text-xl font-black italic text-white outline-none w-full uppercase placeholder:text-slate-600 pr-2"
                  />
                ) : (
                  <h3 
                    onClick={() => user?.authProvider !== 'google' && setIsEditingName(true)}
                    className={`text-2xl font-black italic uppercase tracking-tighter truncate pr-2 ${user?.authProvider !== 'google' ? 'cursor-text hover:text-neon-green' : ''} transition-colors ${userName ? 'text-white' : 'text-slate-600 opacity-60'}`}
                  >
                    {userName || '使用者名稱'}
                  </h3>
                )}
                {user?.authProvider !== 'google' && <Edit3 className="w-4 h-4 text-slate-600 shrink-0" />}
              </div>
              
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 group active:scale-95 transition-all"
              >
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-black uppercase tracking-widest transition-all ${user?.authProvider === 'google' ? 'bg-neon-green/10 border-neon-green/30 text-neon-green' : 'bg-slate-800/60 border-white/10 text-slate-500 group-hover:border-neon-green/40'}`}>
                  {user?.authProvider === 'google' ? '雲端同步' : '登入'}
                  {user?.authProvider === 'google' ? <Chrome className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3 opacity-50" />}
                </div>
                <ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-neon-green transition-colors" />
              </button>
            </div>
         </div>
      </div>

      {/* 身體資料分析區塊 */}
      <div className="glass rounded-[44px] p-8 border-white/5 relative overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center mb-10">
           <div className="flex items-center gap-4">
             <div className="p-3.5 bg-neon-green/10 rounded-2xl">
                <Activity className="w-6 h-6 text-neon-green" />
             </div>
             <div>
               <h3 className="text-base font-black italic uppercase tracking-tighter text-white leading-none">身體資料分析</h3>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">即時生理指標監測</p>
             </div>
           </div>
           
           <button 
             onClick={handleSaveAll} 
             className={`px-5 py-3 rounded-xl font-black uppercase italic transition-all flex items-center justify-center gap-2 text-[12px] min-w-[80px] ${isSaved ? 'bg-emerald-500 text-white' : 'bg-neon-green text-black active:scale-95 shadow-lg shadow-neon-green/10'}`}
           >
             {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
             {isSaved ? '已儲存' : '儲存全部'}
           </button>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
           <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <InputBox icon={<Ruler className="text-sky-400 w-3 h-3" />} label="身高" val={tempMetrics.height} unit="CM" onChange={(v: string) => setTempMetrics({ ...tempMetrics, height: Number(v) })} />
                <InputBox icon={<Scale className="text-orange-400 w-3 h-3" />} label="當前體重" val={tempMetrics.weight} unit="KG" onChange={(v: string) => setTempMetrics({ ...tempMetrics, weight: Number(v) })} />
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
                <h3 className="text-xs font-black italic uppercase tracking-widest text-white">營養建議 (依當前體重)</h3>
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

      {/* 體態管理目標區塊 - 包含每日總熱量建議 */}
      <div className="glass rounded-[44px] p-8 border-white/5 relative overflow-hidden shadow-2xl">
         <div className="flex items-center gap-4 mb-8">
            <div className="p-3.5 bg-sky-500/10 rounded-2xl">
              <Target className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h3 className="text-base font-black italic uppercase tracking-tighter text-white leading-none">體態管理目標</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">設定目標，精準執行</p>
            </div>
         </div>

         <div className="space-y-6">
            <div className="grid grid-cols-3 gap-2">
               {(['cut', 'maintain', 'bulk'] as const).map(type => (
                 <button 
                   key={type}
                   onClick={() => setTempGoal({ ...tempGoal, type })}
                   className={`py-3 rounded-xl text-[11px] font-black uppercase transition-all border ${tempGoal.type === type ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/20' : 'bg-slate-800/50 text-slate-500 border-white/5'}`}
                 >
                   {type === 'cut' ? '減脂' : type === 'bulk' ? '增肌' : '維持'}
                 </button>
               ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <InputBox icon={<TrendingUp className="text-sky-400 w-3 h-3" />} label="目標體重" val={tempGoal.targetWeight} unit="KG" onChange={(v: string) => setTempGoal({ ...tempGoal, targetWeight: Number(v) })} />
               <div className="glass bg-white/5 p-5 rounded-2xl border-white/5">
                  <div className="flex items-center gap-2.5 mb-2 opacity-50">
                    <Activity className="text-sky-400 w-3 h-3" />
                    <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">日常活動量</span>
                  </div>
                  <select 
                    value={tempGoal.activityLevel}
                    onChange={(e) => setTempGoal({ ...tempGoal, activityLevel: Number(e.target.value) as any })}
                    className="bg-transparent text-lg font-black italic text-white outline-none w-full appearance-none cursor-pointer"
                  >
                    <option value={1.2}>久坐不動</option>
                    <option value={1.375}>輕量活動</option>
                    <option value={1.55}>中度訓練</option>
                    <option value={1.725}>高度訓練</option>
                    <option value={1.9}>極限運動</option>
                  </select>
               </div>
            </div>

            {/* 建議每日總熱量顯示 */}
            <div className="pt-2">
              <div className="px-6 py-5 rounded-[28px] border border-orange-500/20 flex flex-col gap-1.5 bg-orange-500/5">
                <div className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-[10px] font-black uppercase text-orange-300/60 tracking-widest">建議每日總熱量攝取</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black italic text-white">{suggestedCalories || '--'} <span className="text-xs text-slate-600 not-italic ml-1">KCAL</span></span>
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase text-slate-500 block leading-none">TDEE 調整後結果</span>
                    <span className="text-[8px] font-bold text-orange-400/50 uppercase mt-1 block">依據目標類型增減 300-500 KCAL</span>
                  </div>
                </div>
              </div>
            </div>
         </div>
      </div>

      <div className="space-y-4">
        <button onClick={() => { if(confirm('確定要清除所有訓練紀錄？')) { localStorage.clear(); window.location.reload(); }}} className="w-full py-6 border border-red-500/10 rounded-[32px] text-red-500/30 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2.5 active:bg-red-500/10 active:text-red-500 transition-all">
          <Trash2 className="w-5 h-5" /> 清除所有本地訓練數據
        </button>
      </div>

      {/* 帳號管理彈窗 */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md glass border-t border-white/10 rounded-t-[48px] p-8 pb-12 shadow-2xl safe-bottom"
            >
              <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-8" />
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">帳號管理</h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                      {user?.authProvider === 'google' ? '已連動雲端備份' : '目前尚未登入'}
                    </p>
                 </div>
                 <button onClick={() => setIsAuthModalOpen(false)} className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-slate-500">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleGoogleLogin}
                  className={`w-full py-5 rounded-2xl flex items-center justify-between px-6 transition-all active:scale-95 ${user?.authProvider === 'google' ? 'bg-neon-green/10 border border-neon-green/30' : 'bg-white text-black shadow-xl'}`}
                >
                  <div className="flex items-center gap-4">
                    <Chrome className={`w-6 h-6 ${user?.authProvider === 'google' ? 'text-neon-green' : 'text-black'}`} />
                    <span className="font-black uppercase italic tracking-tighter">
                      {user?.authProvider === 'google' ? '已同步 Google 帳號' : '使用 Google 帳號登入'}
                    </span>
                  </div>
                  {user?.authProvider === 'google' && <CheckCircle2 className="w-5 h-5 text-neon-green" />}
                </button>

                <button 
                  onClick={() => alert('Apple ID 登入功能正在審核整合中，敬請期待。')}
                  className="w-full py-5 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-between px-6 transition-all active:scale-95 text-white"
                >
                  <div className="flex items-center gap-4">
                    <Apple className="w-6 h-6 fill-current" />
                    <span className="font-black uppercase italic tracking-tighter">使用 Apple ID 登入</span>
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-700 tracking-widest bg-slate-800 px-2 py-1 rounded">Beta</span>
                </button>

                <div className="py-4" />

                <button 
                  onClick={handleLogout}
                  className="w-full py-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center gap-3 font-black uppercase italic tracking-tighter transition-all active:scale-95"
                >
                  <LogOut className="w-5 h-5" />
                  切換帳號或登出
                </button>
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
