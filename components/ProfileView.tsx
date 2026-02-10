import React, { useContext, useMemo, useState, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import { BodyMetric, UserGoal } from '../types';
import { getBMIAnalysis, calculateSuggestedCalories, calculateMacros, calculateWaterIntake } from '../utils/fitnessMath';
import { 
  Target, Activity, User, Trash2, 
  Flame, Edit3, CheckCircle2, Save, Beef, Wheat, 
  Droplets, Waves, GlassWater, 
  Cake, Maximize2, Weight as WeightIcon, UserCheck, Bike
} from 'lucide-react';
import { lightTheme } from '../themeStyles';

export const ProfileView: React.FC = () => {
  const context = useContext(AppContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileImage, setProfileImage] = useState<string | null>(localStorage.getItem('ironlog_user_avatar'));
  const [userName, setUserName] = useState<string>(localStorage.getItem('ironlog_user_name') || '');
  const [isEditingName, setIsEditingName] = useState(false);
  
  const bodyMetrics = context?.bodyMetrics || [];
  const globalGoal: UserGoal = context?.goal || { type: 'maintain', targetWeight: 0, startWeight: 0, activityLevel: 1.55 };
  const setGlobalGoal = context?.setGoal || (() => {});
  const setBodyMetrics = context?.setBodyMetrics || (() => {});

  const latest: BodyMetric = useMemo(() => {
    const first = bodyMetrics[0];
    if (first) return first;
    return { id: '', date: Date.now(), weight: 0, height: 0, age: 0, gender: 'male' };
  }, [bodyMetrics]);

  const [tempMetrics, setTempMetrics] = useState<BodyMetric>(latest);
  const [tempGoal, setTempGoal] = useState<UserGoal>(globalGoal);
  
  const [isMetricsSaved, setIsMetricsSaved] = useState(false);
  const [isGoalSaved, setIsGoalSaved] = useState(false);

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
  
  const suggestedCalories = useMemo(() => {
    if (tempMetrics.weight === 0 || tempMetrics.height === 0 || tempMetrics.age === 0) return 0;
    return calculateSuggestedCalories(tempMetrics.weight, tempMetrics.height, tempMetrics.age, tempMetrics.gender, tempGoal.type, tempGoal.activityLevel);
  }, [tempMetrics, tempGoal]);

  const macros = useMemo(() => {
    return calculateMacros(suggestedCalories, tempMetrics.weight, tempGoal.type);
  }, [suggestedCalories, tempMetrics.weight, tempGoal.type]);

  const waterIntake = useMemo(() => {
    return calculateWaterIntake(tempMetrics.weight);
  }, [tempMetrics.weight]);

  const handleSaveMetrics = () => {
    const newMetric = { ...tempMetrics, id: crypto.randomUUID(), date: Date.now() };
    const updatedMetrics = [newMetric, ...bodyMetrics.filter(m => m.id !== tempMetrics.id)];
    setBodyMetrics(updatedMetrics);
    localStorage.setItem('ironlog_v3_metrics', JSON.stringify(updatedMetrics));
    setIsMetricsSaved(true);
    setTimeout(() => setIsMetricsSaved(false), 2000);
  };

  const handleSaveGoal = () => {
    setGlobalGoal(tempGoal);
    localStorage.setItem('ironlog_v3_goal', JSON.stringify(tempGoal));
    setIsGoalSaved(true);
    setTimeout(() => setIsGoalSaved(false), 2000);
  };

  const activityOptions = [
    { label: '久坐', val: 1.2, desc: '無運動' },
    { label: '輕度', val: 1.375, desc: '1-2天' },
    { label: '中度', val: 1.55, desc: '3-5天' },
    { label: '高度', val: 1.725, desc: '6-7天' },
    { label: '極限', val: 1.9, desc: '職業級' }
  ];

  if (!context) return null;

  return (
    <div className="space-y-7 pb-24">
      {/* 個人頂部資訊 */}
      <div style={{ backgroundColor: lightTheme.card }} className="rounded-[40px] p-7 border border-black/5 relative overflow-hidden shadow-sm">
         <div className="relative z-10 flex items-center gap-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div style={{ backgroundColor: lightTheme.bg }} className="w-20 h-20 rounded-[28px] overflow-hidden border-2 border-black/5 flex items-center justify-center shadow-inner">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-100" />
                )}
              </div>
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
            </div>

            <div className="flex-1 space-y-1.5 overflow-hidden">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <input 
                    autoFocus
                    value={userName}
                    onChange={(e) => {setUserName(e.target.value); localStorage.setItem('ironlog_user_name', e.target.value);}}
                    onBlur={() => setIsEditingName(false)}
                    className="bg-transparent border-b border-black text-xl font-black italic text-black outline-none w-full uppercase"
                  />
                ) : (
                  <h3 onClick={() => setIsEditingName(true)} style={{ color: lightTheme.text }} className="text-2xl font-black italic uppercase tracking-tighter truncate pr-2">
                    {userName || '使用者名稱'}
                  </h3>
                )}
                <Edit3 className="w-4 h-4 text-slate-300 shrink-0" />
              </div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-black/5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-[#82CC00] animate-pulse" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">戰士 ID #{(latest.date % 10000)}</p>
              </div>
            </div>
         </div>
      </div>

      {/* 身體資料分析區塊 */}
      <div style={{ backgroundColor: lightTheme.bg }} className="rounded-[44px] p-8 border border-black/5 relative overflow-hidden shadow-xl">
        <div className="flex justify-between items-center mb-10">
           <div className="flex items-center gap-4">
             <div style={{ backgroundColor: lightTheme.card }} className="p-3.5 rounded-2xl border border-black/5">
                <Activity className="w-6 h-6 text-black" />
             </div>
             <div>
               <h3 style={{ color: lightTheme.text }} className="text-base font-black italic uppercase tracking-tighter leading-none">身體資料分析</h3>
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">生理指標監測</p>
             </div>
           </div>
           
           <button 
             onClick={handleSaveMetrics} 
             className={`px-5 py-3 rounded-xl font-black uppercase italic transition-all flex items-center justify-center gap-2 text-[12px] ${isMetricsSaved ? 'bg-emerald-500 text-white' : 'bg-black text-white active:scale-95 shadow-md'}`}
           >
             {isMetricsSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" style={{ color: lightTheme.accent }} />}
             {isMetricsSaved ? '已儲存' : '儲存'}
           </button>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-3">
            <InputBox icon={<Maximize2 className="text-sky-400 w-3.5 h-3.5" />} label="身高" val={tempMetrics.height} unit="CM" onChange={(v: string) => setTempMetrics({ ...tempMetrics, height: Number(v) })} />
            <InputBox icon={<WeightIcon className="text-emerald-400 w-3.5 h-3.5" />} label="當前體重" val={tempMetrics.weight} unit="KG" onChange={(v: string) => setTempMetrics({ ...tempMetrics, weight: Number(v) })} />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <InputBox icon={<Cake className="text-rose-400 w-3.5 h-3.5" />} label="年齡" val={tempMetrics.age} unit="歲" onChange={(v: string) => setTempMetrics({ ...tempMetrics, age: Number(v) })} />
            <div style={{ backgroundColor: lightTheme.card }} className="p-5 rounded-2xl border border-black/5 flex-1 shadow-inner">
              <div className="flex items-center gap-2.5 mb-2.5 opacity-40">
                <UserCheck className="text-violet-400 w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">性別</span>
              </div>
              <div className="flex gap-2">
                {(['male', 'female'] as const).map(g => (
                  <button 
                    key={g}
                    onClick={() => setTempMetrics({ ...tempMetrics, gender: g })}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${tempMetrics.gender === g ? 'bg-black text-white border-black shadow-md' : 'bg-white text-slate-300 border-black/5'}`}
                  >
                    {g === 'male' ? '男' : '女'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div style={{ backgroundColor: lightTheme.card }} className="px-6 py-5 rounded-[28px] border border-black/5 flex flex-col gap-1.5 shadow-inner">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">當前 BMI 指數</span>
            <div className="flex items-baseline justify-between">
              <span style={{ color: lightTheme.text }} className="text-3xl font-black italic">{bmi || '--'}</span>
              <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border border-white bg-white shadow-sm ${bmiAnalysis.color}`}>{bmi > 0 ? bmiAnalysis.label : '未設定'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 營養建議區塊 */}
      <div style={{ backgroundColor: lightTheme.bg }} className="rounded-[44px] p-8 border border-black/5 relative overflow-hidden shadow-xl">
         <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
               <div style={{ backgroundColor: lightTheme.card }} className="p-3.5 rounded-2xl border border-black/5">
                 <Target className="w-6 h-6 text-black" />
               </div>
               <div>
                 <h3 style={{ color: lightTheme.text }} className="text-base font-black italic uppercase tracking-tighter leading-none">營養建議藍圖</h3>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">目標規劃與熱量分析</p>
               </div>
            </div>
            <button 
              onClick={handleSaveGoal} 
              className={`px-5 py-3 rounded-xl font-black uppercase italic transition-all flex items-center justify-center gap-2 text-[12px] ${isGoalSaved ? 'bg-emerald-500 text-white' : 'bg-black text-white active:scale-95 shadow-md'}`}
            >
              {isGoalSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" style={{ color: lightTheme.accent }} />}
              {isGoalSaved ? '已儲存' : '儲存'}
            </button>
         </div>

         <div className="space-y-6">
            <div className="grid grid-cols-3 gap-2">
               {(['cut', 'maintain', 'bulk'] as const).map(type => (
                 <button 
                   key={type}
                   onClick={() => setTempGoal({ ...tempGoal, type })}
                   className={`py-3 rounded-xl text-[11px] font-black uppercase transition-all border ${tempGoal.type === type ? 'bg-black text-white border-black shadow-md' : 'bg-slate-50 text-slate-400 border-black/5'}`}
                 >
                   {type === 'cut' ? '減脂' : type === 'bulk' ? '增肌' : '維持'}
                 </button>
               ))}
            </div>

            <div className="grid grid-cols-1 gap-3">
               <InputBox icon={<Target className="text-orange-400 w-3.5 h-3.5" />} label="目標體重" val={tempGoal.targetWeight} unit="KG" onChange={(v: string) => setTempGoal({ ...tempGoal, targetWeight: Number(v) })} />
               
               <div style={{ backgroundColor: lightTheme.card }} className="p-5 rounded-2xl border border-black/5 shadow-inner">
                 <div className="flex items-center gap-2.5 mb-3.5 opacity-40">
                    <Bike className="text-indigo-400 w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">日常活動量</span>
                 </div>
                 <div className="grid grid-cols-5 gap-1.5">
                   {activityOptions.map(opt => (
                     <button 
                       key={opt.val}
                       onClick={() => setTempGoal({ ...tempGoal, activityLevel: opt.val as any })}
                       className={`flex flex-col items-center py-2.5 rounded-xl transition-all border ${tempGoal.activityLevel === opt.val ? 'bg-black text-white border-black' : 'bg-white text-slate-400 border-black/5'}`}
                     >
                       <span className="text-[9px] font-black mb-0.5">{opt.label}</span>
                       <span className="text-[7px] font-bold opacity-60">{opt.desc}</span>
                     </button>
                   ))}
                 </div>
               </div>
            </div>
            
            <div style={{ backgroundColor: '#FFF9E6' }} className="px-6 py-6 rounded-[32px] border border-black/5 flex flex-col gap-2 shadow-inner">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-[10px] font-black uppercase text-orange-600/70 tracking-widest">建議每日熱量 (TDEE)</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span style={{ color: lightTheme.text }} className="text-4xl font-black italic">{suggestedCalories || '--'}</span>
                <span className="text-xs font-black text-slate-400 italic">KCAL</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <MacroCard icon={<Beef className="w-4 h-4 text-rose-400" />} label="蛋白質" val={macros.protein} unit="G" color="bg-rose-400" />
              <MacroCard icon={<Wheat className="w-4 h-4 text-amber-400" />} label="碳水" val={macros.carbs} unit="G" color="bg-amber-400" />
              <MacroCard icon={<Droplets className="w-4 h-4 text-indigo-400" />} label="脂肪" val={macros.fats} unit="G" color="bg-indigo-400" />
            </div>

            <div style={{ backgroundColor: lightTheme.card }} className="p-6 rounded-[32px] border border-black/5 flex items-center justify-between shadow-inner">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-500">
                    <GlassWater className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-0.5">每日建議飲水</span>
                    <span style={{ color: lightTheme.text }} className="text-xl font-black italic">{waterIntake || '--'} <span className="text-xs not-italic text-slate-300">ML</span></span>
                  </div>
               </div>
               <Waves className="text-sky-200 w-8 h-8 opacity-50" />
            </div>
         </div>
      </div>

      <button onClick={() => { if(confirm('確定要清除所有本地數據？')) { localStorage.clear(); window.location.reload(); }}} className="w-full py-6 border border-red-100 rounded-[32px] text-red-200 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2.5 active:bg-red-50 transition-all">
        <Trash2 className="w-5 h-5" /> 清除所有本地數據
      </button>
    </div>
  );
};

const MacroCard = ({ icon, label, val, unit, color }: any) => (
  <div style={{ backgroundColor: lightTheme.card }} className="p-4 rounded-3xl border border-black/5 flex flex-col items-center gap-3 shadow-inner">
    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
      {icon}
    </div>
    <div className="text-center">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</span>
      <div className="flex items-baseline justify-center gap-0.5">
        <span style={{ color: lightTheme.text }} className="text-lg font-black italic">{val || '--'}</span>
        <span className="text-[8px] font-black text-slate-300">{unit}</span>
      </div>
    </div>
    <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: val > 0 ? '60%' : '0%' }} />
    </div>
  </div>
);

const InputBox = ({ icon, label, val, unit, onChange }: any) => (
  <div style={{ backgroundColor: lightTheme.card }} className="p-5 rounded-2xl border border-black/5 flex-1 shadow-inner">
    <div className="flex items-center gap-2.5 mb-2.5 opacity-40">
       {icon}
       <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-baseline gap-1.5">
      <input 
        type="number" 
        placeholder="--"
        style={{ color: lightTheme.text }}
        className="bg-transparent text-2xl font-black italic outline-none w-full" 
        value={val === 0 ? '' : val} 
        onChange={e => onChange(e.target.value)} 
      />
      <span className="text-[11px] font-bold text-slate-300 uppercase">{unit}</span>
    </div>
  </div>
);