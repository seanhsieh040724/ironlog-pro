import React, { useContext, useMemo, useState, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import { BodyMetric, UserGoal } from '../types';
import { getBMIAnalysis, calculateSuggestedCalories, calculateMacros, calculateWaterIntake } from '../utils/fitnessMath';
import { 
  Target, Activity, User, Trash2, 
  Flame, Edit3, CheckCircle2, Save, Beef, Soup, 
  Droplets, Waves, GlassWater, 
  Cake, Maximize2, Weight as WeightIcon, UserCheck, Bike, 
  Camera, Sparkles, AlertCircle, Loader2, TrendingUp, Calendar, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { lightTheme } from '../themeStyles';
import { generateDietarySuggestions } from '../services/aiService';
import Markdown from 'react-markdown';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

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
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiPlan, setShowAiPlan] = useState(false);

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
    return calculateMacros(suggestedCalories, tempMetrics.weight, tempGoal.type, {
      protein: tempGoal.proteinRatio,
      carbs: tempGoal.carbRatio,
      fats: tempGoal.fatRatio
    });
  }, [suggestedCalories, tempMetrics.weight, tempGoal.type, tempGoal.proteinRatio, tempGoal.carbRatio, tempGoal.fatRatio]);

  const waterIntake = useMemo(() => {
    return calculateWaterIntake(tempMetrics.weight);
  }, [tempMetrics.weight]);

  const weightTrendData = useMemo(() => {
    const validMetrics = [...bodyMetrics]
      .filter(m => m.weight > 0)
      .sort((a, b) => a.date - b.date);

    if (validMetrics.length === 0) return null;

    const labels = validMetrics.map(m => new Date(m.date).toLocaleDateString([], { month: '2-digit', day: '2-digit' }));
    const dataPoints = validMetrics.map(m => m.weight);

    return {
      labels,
      datasets: [
        {
          label: '體重 (KG)',
          data: dataPoints,
          borderColor: '#82CC00',
          backgroundColor: 'rgba(130, 204, 0, 0.08)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#82CC00',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 1.5,
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ]
    };
  }, [bodyMetrics]);

  const weightTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#000000',
        bodyColor: '#000000',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 8,
        displayColors: false,
        callbacks: {
          label: (context: any) => `${context.parsed.y} KG`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#8E8E93',
          font: {
            size: 10,
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.03)',
        },
        ticks: {
          color: '#8E8E93',
          font: {
            size: 10,
          }
        }
      }
    }
  };

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

  const handleAiAnalysis = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    setShowAiPlan(true);
    const plan = await generateDietarySuggestions(tempMetrics, tempGoal);
    const updatedGoal = { ...tempGoal, dietaryPlan: plan };
    setTempGoal(updatedGoal);
    setGlobalGoal(updatedGoal);
    localStorage.setItem('ironlog_v3_goal', JSON.stringify(updatedGoal));
    setIsAiLoading(false);
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
    <div className="space-y-8 pb-24">
      {/* 個人頂部資訊 */}
      <div className="flex flex-col items-center gap-5 py-4 text-center">
         <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
           <div style={{ backgroundColor: '#E5E5E7' }} className="w-[88px] h-[88px] rounded-[32px] overflow-hidden border-2 border-black/5 flex items-center justify-center shadow-inner relative">
             {profileImage ? (
               <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <User className="w-11 h-11 text-black" />
             )}
             <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <Camera className="text-white w-7 h-7" />
             </div>
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

         <div className="w-full max-w-md overflow-hidden">
           <div className="flex items-center justify-center gap-2">
             {isEditingName ? (
               <input 
                 autoFocus
                 value={userName}
                 placeholder="請輸入您的名稱"
                 onChange={(e) => {setUserName(e.target.value); localStorage.setItem('ironlog_user_name', e.target.value);}}
                 onBlur={() => setIsEditingName(false)}
                 className="bg-transparent border-b border-black text-[21px] font-black text-black outline-none w-full text-center uppercase placeholder:opacity-40 placeholder:font-normal placeholder:text-zinc-400"
               />
             ) : (
               <h3 
                 onClick={() => setIsEditingName(true)} 
                 style={{ color: !userName ? '#9CA3AF' : lightTheme.text }} 
                 className={`text-[21px] uppercase tracking-tighter truncate cursor-pointer ${!userName ? 'font-normal opacity-50 text-stone-400' : 'font-black'}`}
               >
                 {userName || '請輸入您的名稱'}
               </h3>
             )}
             <Edit3 onClick={() => setIsEditingName(true)} className="w-5 h-5 text-black shrink-0 cursor-pointer" />
           </div>
         </div>
      </div>

      {/* 身體資料分析區塊 */}
      <div style={{ backgroundColor: lightTheme.bg }} className="rounded-[44px] p-9 border border-black/5 relative overflow-hidden shadow-xl">
        <div className="flex justify-between items-center mb-11">
           <div className="flex items-center gap-5">
             <div style={{ backgroundColor: lightTheme.card }} className="p-4 rounded-2xl border border-black/5">
                <Activity className="w-7 h-7 text-black" />
             </div>
             <div>
               <h3 style={{ color: lightTheme.text }} className="text-[19px] font-black uppercase tracking-tighter leading-none">身體資料分析</h3>
               <p className="text-[11.4px] font-black text-black uppercase tracking-widest mt-1.5">生理指標監測</p>
             </div>
           </div>
           
           <button 
             onClick={handleSaveMetrics} 
             className={`px-[18px] py-[9px] rounded-xl font-black uppercase transition-all flex items-center gap-2 text-[11.7px] border border-[#82CC00]/20 ${isMetricsSaved ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-[#82CC00] active:scale-95 shadow-sm'}`}
           >
             {isMetricsSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
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
              <div className="flex items-center gap-2.5 mb-2.5">
                <UserCheck className="text-violet-400 w-3.5 h-3.5" />
                <span className="text-[11px] font-black uppercase text-black tracking-widest">性別</span>
              </div>
              <div className="flex gap-2">
                {(['male', 'female'] as const).map(g => (
                  <button 
                    key={g}
                    onClick={() => setTempMetrics({ ...tempMetrics, gender: g })}
                    className={`flex-1 py-2 rounded-xl text-[11px] font-black uppercase border transition-all ${
                      tempMetrics.gender === g 
                        ? (g === 'male' ? 'bg-blue-500 text-white border-blue-500 shadow-md' : 'bg-pink-500 text-white border-pink-500 shadow-md') 
                        : 'bg-white text-black border-black/5'
                    }`}
                  >
                    {g === 'male' ? '男' : '女'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div style={{ backgroundColor: lightTheme.card }} className="px-7 py-6 rounded-[28px] border border-black/5 flex flex-col gap-2 shadow-inner">
            <span className="text-[12px] font-black uppercase text-black tracking-widest">當前 BMI 指數</span>
            <div className="flex items-baseline justify-between">
              <span style={{ color: lightTheme.text }} className="text-[44px] font-black">{bmi || '--'}</span>
              <span className={`text-[12px] font-black uppercase px-5 py-2 rounded-full border border-white bg-white shadow-sm ${bmiAnalysis.color}`}>{bmi > 0 ? bmiAnalysis.label : '未設定'}</span>
            </div>
          </div>

          {/* 體重趨勢圖 */}
          <div style={{ backgroundColor: lightTheme.card }} className="px-7 py-6 rounded-[28px] border border-black/5 flex flex-col gap-4 shadow-inner">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-[#82CC00] w-4 h-4" />
                <span className="text-[12px] font-black uppercase text-black tracking-widest">體重變化趨勢</span>
              </div>
              {bodyMetrics.filter(m => m.weight > 0).length > 0 && (
                <span className="text-[10px] uppercase text-slate-400 tracking-wider">
                  已記錄 {bodyMetrics.filter(m => m.weight > 0).length} 次
                </span>
              )}
            </div>

            {weightTrendData ? (
              <div className="h-48 relative w-full pt-2">
                <Line data={weightTrendData} options={weightTrendOptions} />
              </div>
            ) : (
              <div className="py-10 text-center flex flex-col items-center justify-center gap-2">
                <TrendingUp className="text-slate-300 w-10 h-10 stroke-[1.5]" />
                <p className="text-xs text-slate-400 font-medium">記錄多次體重後，此處將顯示您的體重變化趨勢圖。</p>
              </div>
            )}
          </div>

          {/* 歷史體重紀錄列表 */}
          {bodyMetrics.length > 0 && (
            <div className="pt-2">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none select-none text-[12px] font-black uppercase text-black tracking-widest hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-2">
                    <History className="text-stone-400 w-4 h-4" />
                    <span>查看體重紀錄歷史 ({bodyMetrics.length})</span>
                  </div>
                  <span className="text-[10px] text-[#82CC00] group-open:hidden">展開 ▾</span>
                  <span className="text-[10px] text-[#82CC00] hidden group-open:inline">收起 ▴</span>
                </summary>
                
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
                  {bodyMetrics.map((m) => (
                    <div 
                      key={m.id || m.date} 
                      style={{ backgroundColor: lightTheme.card }} 
                      className="px-5 py-3 rounded-xl border border-black/[0.03] flex items-center justify-between text-xs gap-3"
                    >
                      <div className="flex items-center gap-2 text-stone-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(m.date).toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[13px] font-black text-black">
                          {m.weight} KG <span className="text-[10px] text-stone-400 font-normal">({m.height}cm / {m.age}歲)</span>
                        </span>
                        <button 
                          onClick={() => {
                            const updated = bodyMetrics.filter(x => x.id !== m.id);
                            setBodyMetrics(updated);
                            localStorage.setItem('ironlog_v3_metrics', JSON.stringify(updated));
                          }}
                          className="p-1 hover:bg-red-50 rounded-lg text-rose-500 transition-colors"
                          title="刪除此紀錄"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>

      {/* 營養建議區塊 */}
      <div style={{ backgroundColor: lightTheme.bg }} className="rounded-[44px] p-9 border border-black/5 relative overflow-hidden shadow-xl">
         <div className="flex justify-between items-center mb-9">
            <div className="flex items-center gap-5">
               <div style={{ backgroundColor: lightTheme.card }} className="p-4 rounded-2xl border border-black/5">
                 <Target className="w-7 h-7 text-black" />
               </div>
               <div>
                 <h3 style={{ color: lightTheme.text }} className="text-[19px] font-black uppercase tracking-tighter leading-none">營養建議藍圖</h3>
                 <p className="text-[11.4px] font-black text-black uppercase tracking-widest mt-1.5">目標規劃與熱量分析</p>
               </div>
            </div>
            <button 
              onClick={handleSaveGoal} 
              className={`px-[18px] py-[9px] rounded-xl font-black uppercase transition-all flex items-center gap-2 text-[11.7px] border border-[#82CC00]/20 ${isGoalSaved ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-[#82CC00] active:scale-95 shadow-sm'}`}
            >
              {isGoalSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {isGoalSaved ? '已儲存' : '儲存'}
            </button>
         </div>

         <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
               {(['cut', 'maintain', 'bulk'] as const).map(type => {
                 const colors = {
                   cut: 'bg-rose-500 border-rose-500',
                   maintain: 'bg-emerald-500 border-emerald-500',
                   bulk: 'bg-blue-600 border-blue-600'
                 };
                 return (
                   <button 
                     key={type}
                     onClick={() => setTempGoal({ ...tempGoal, type })}
                     className={`py-3.5 rounded-xl text-[12px] font-black uppercase transition-all border ${tempGoal.type === type ? `${colors[type]} text-white shadow-md` : 'bg-slate-50 text-black border-black/5'}`}
                   >
                     {type === 'cut' ? '減脂' : type === 'bulk' ? '增肌' : '維持'}
                   </button>
                 );
               })}
            </div>

            <div className="grid grid-cols-1 gap-3">
               <InputBox icon={<Target className="text-orange-400 w-3.5 h-3.5" />} label="目標體重" val={tempGoal.targetWeight} unit="KG" onChange={(v: string) => setTempGoal({ ...tempGoal, targetWeight: Number(v) })} />
               
            <div style={{ backgroundColor: lightTheme.card }} className="p-6 rounded-2xl border border-black/5 shadow-inner">
               <div className="flex items-center gap-3 mb-4">
                  <Bike className="text-indigo-400 w-4 h-4" />
                  <span className="text-[12px] font-black uppercase text-black tracking-widest">日常活動量</span>
               </div>
               <div className="grid grid-cols-5 gap-2">
                 {activityOptions.map(opt => (
                   <button 
                     key={opt.val}
                     onClick={() => setTempGoal({ ...tempGoal, activityLevel: opt.val as any })}
                     className={`flex flex-col items-center py-3 rounded-xl transition-all border ${tempGoal.activityLevel === opt.val ? 'bg-black text-white border-black' : 'bg-white text-black border-black/5'}`}
                   >
                     <span className="text-[10px] font-black mb-1">{opt.label}</span>
                     <span className="text-[8px] font-bold text-black">{opt.desc}</span>
                   </button>
                 ))}
               </div>
            </div>

               <div style={{ backgroundColor: lightTheme.card }} className="p-7 rounded-[32px] border border-black/5 shadow-inner">
                 <div className="flex items-center justify-between mb-5 px-1">
                    <div className="flex items-center gap-3">
                       <Beef className="text-rose-400 w-4 h-4" />
                       <span className="text-[12px] font-black uppercase text-black tracking-widest">巨量營養比例設定</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <span className={`text-[10px] font-black uppercase tracking-widest ${((tempGoal.proteinRatio || 0) + (tempGoal.carbRatio || 0) + (tempGoal.fatRatio || 0)) === 100 ? 'text-emerald-500' : 'text-rose-400'}`}>
                        總計: {((tempGoal.proteinRatio || 0) + (tempGoal.carbRatio || 0) + (tempGoal.fatRatio || 0)) === 0 ? '預設' : ((tempGoal.proteinRatio || 0) + (tempGoal.carbRatio || 0) + (tempGoal.fatRatio || 0)) + '%'}
                      </span>
                      {tempGoal.proteinRatio !== undefined && ((tempGoal.proteinRatio || 0) + (tempGoal.carbRatio || 0) + (tempGoal.fatRatio || 0)) !== 100 && (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                   <div className="space-y-2">
                     <span className="text-[10px] font-black text-black uppercase tracking-widest block text-center">蛋白質 %</span>
                     <input 
                       type="number" 
                       value={tempGoal.proteinRatio || ''} 
                       onChange={e => setTempGoal({ ...tempGoal, proteinRatio: Number(e.target.value) })}
                       className="w-full bg-white border border-black/5 rounded-xl py-3 text-center text-base font-black shadow-sm outline-none focus:border-rose-400/50"
                       placeholder="--"
                     />
                   </div>
                   <div className="space-y-2">
                     <span className="text-[10px] font-black text-black uppercase tracking-widest block text-center">碳水 %</span>
                     <input 
                       type="number" 
                       value={tempGoal.carbRatio || ''} 
                       onChange={e => setTempGoal({ ...tempGoal, carbRatio: Number(e.target.value) })}
                       className="w-full bg-white border border-black/5 rounded-xl py-3 text-center text-base font-black shadow-sm outline-none focus:border-amber-400/50"
                       placeholder="--"
                     />
                   </div>
                   <div className="space-y-2">
                     <span className="text-[10px] font-black text-black uppercase tracking-widest block text-center">脂肪 %</span>
                     <input 
                       type="number" 
                       value={tempGoal.fatRatio || ''} 
                       onChange={e => setTempGoal({ ...tempGoal, fatRatio: Number(e.target.value) })}
                       className="w-full bg-white border border-black/5 rounded-xl py-3 text-center text-base font-black shadow-sm outline-none focus:border-indigo-400/50"
                       placeholder="--"
                     />
                   </div>
                 </div>
                 <p className="text-[9px] font-medium text-black mt-5 leading-relaxed text-center">
                   * 若不設定比例，系統將根據目標 (減脂/增肌/維持) 提供預設建議。
                 </p>
               </div>
            </div>

            <div style={{ backgroundColor: '#FFF9E6' }} className="px-7 py-7 rounded-[32px] border border-black/5 flex flex-col gap-2.5 shadow-inner">
              <div className="flex items-center gap-2.5 mb-1.5">
                <Flame className="w-4.5 h-4.5 text-orange-400" />
                <span className="text-[11px] font-black uppercase text-black tracking-widest">建議每日熱量 (TDEE)</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span style={{ color: lightTheme.text }} className="text-[44px] font-black">{suggestedCalories || '--'}</span>
                <span className="text-sm font-black text-black">KCAL</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <MacroCard icon={<Beef className="w-4 h-4 text-rose-400" />} label="蛋白質" val={macros.protein} unit="G" color="bg-rose-400" />
              <MacroCard icon={<Soup className="w-4 h-4 text-amber-400" />} label="碳水" val={macros.carbs} unit="G" color="bg-amber-400" />
              <MacroCard icon={<Droplets className="w-4 h-4 text-indigo-400" />} label="脂肪" val={macros.fats} unit="G" color="bg-indigo-400" />
            </div>

            <div style={{ backgroundColor: lightTheme.card }} className="p-7 rounded-[32px] border border-black/5 flex items-center justify-between shadow-inner">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-500">
                    <GlassWater className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[12px] font-black uppercase text-black tracking-widest block mb-0.5">每日建議飲水</span>
                    <span style={{ color: lightTheme.text }} className="text-3xl font-black">{waterIntake || '--'} <span className="text-base text-black">ML</span></span>
                  </div>
               </div>
               <Waves className="text-sky-200 w-10 h-10 opacity-50" />
            </div>

            <div className="pt-3">
               <button 
                 onClick={handleAiAnalysis}
                 disabled={isAiLoading}
                 style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
                 className="w-full h-16 rounded-2xl font-black uppercase text-base flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
               >
                 {isAiLoading ? (
                   <Loader2 className="w-6 h-6 animate-spin text-[#CCFF00]" />
                 ) : (
                   <Sparkles className="w-6 h-6 text-[#CCFF00]" />
                 )}
                 {isAiLoading ? 'AI 分析中...' : '獲取個人專屬飲食建議'}
               </button>

               <AnimatePresence>
                 {(showAiPlan || tempGoal.dietaryPlan) && (
                   <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="mt-7 p-8 rounded-[36px] bg-white border border-black/5 shadow-xl relative overflow-hidden"
                   >
                     <div className="flex items-center justify-between mb-7">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-[#CCFF00]">
                           <Sparkles className="w-6 h-6" />
                         </div>
                         <h4 className="text-lg font-black uppercase">個人專屬營養藍圖</h4>
                       </div>
                       <button onClick={() => setShowAiPlan(false)} className="text-[12px] font-black text-black uppercase underline">隱藏</button>
                     </div>
                     
                     <div className="prose prose-base max-w-none text-black leading-relaxed font-medium markdown-body">
                        {isAiLoading ? (
                          <div className="flex flex-col items-center py-14 gap-5">
                             <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                  animate={{ x: [-50, 50] }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-full h-full bg-[#CCFF00]"
                                />
                             </div>
                             <p className="text-[11px] font-black text-black uppercase tracking-widest">正在為您制定專屬計畫...</p>
                          </div>
                        ) : (
                          <div className="markdown-content">
                            <Markdown>{tempGoal.dietaryPlan}</Markdown>
                          </div>
                        )}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
         </div>
      </div>

    </div>
  );
};

const MacroCard = ({ icon, label, val, unit, color }: any) => (
  <div style={{ backgroundColor: lightTheme.card }} className="p-5 rounded-[32px] border border-black/5 flex flex-col items-center gap-4 shadow-inner">
    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
      {icon}
    </div>
    <div className="text-center">
      <span className="text-[10px] font-black text-black uppercase tracking-widest block mb-1.5">{label}</span>
      <div className="flex items-baseline justify-center gap-1">
        <span style={{ color: lightTheme.text }} className="text-xl font-black">{val || '--'}</span>
        <span className="text-[9px] font-black text-black">{unit}</span>
      </div>
    </div>
    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: val > 0 ? '60%' : '0%' }} />
    </div>
  </div>
);

const InputBox = ({ icon, label, val, unit, onChange }: any) => (
  <div style={{ backgroundColor: lightTheme.card }} className="p-6 rounded-2xl border border-black/5 flex-1 shadow-inner">
    <div className="flex items-center gap-3 mb-3">
       {icon}
       <span className="text-[11px] font-black uppercase text-black tracking-widest">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <input 
        type="number" 
        placeholder="--"
        style={{ color: lightTheme.text }}
        className="bg-transparent text-3xl font-black outline-none w-full placeholder:text-black" 
        value={val === 0 ? '' : val} 
        onChange={e => onChange(e.target.value)} 
      />
      <span className="text-[12px] font-bold text-black uppercase">{unit}</span>
    </div>
  </div>
);
