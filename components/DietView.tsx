import React, { useContext, useMemo, useState, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import { BodyMetric, UserGoal } from '../types';
import { getBMIAnalysis, calculateSuggestedCalories, calculateMacros, calculateWaterIntake } from '../utils/fitnessMath';
import { 
  Target, Activity, Trash2, 
  Flame, Edit3, CheckCircle2, Save, Beef, Soup, 
  Droplets, Waves, GlassWater, 
  Cake, Maximize2, Weight as WeightIcon, UserCheck, Bike, 
  Camera, Sparkles, AlertCircle, Loader2, TrendingUp, Calendar, History,
  Upload, Sparkle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { lightTheme } from '../themeStyles';
import { analyzeFoodImage } from '../services/aiService';
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

export const DietView: React.FC = () => {
  const context = useContext(AppContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  
  // 食物拍照分析相關狀態
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(() => {
    return localStorage.getItem('ironlog_last_food_analysis') || null;
  });
  const [foodHistory, setFoodHistory] = useState<{id: string, date: number, image: string, result: string}[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('ironlog_food_history') || '[]');
    } catch {
      return [];
    }
  });

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeFood = async () => {
    if (!selectedImage || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    const result = await analyzeFoodImage(selectedImage);
    setAnalysisResult(result);
    localStorage.setItem('ironlog_last_food_analysis', result);

    const newRecord = {
      id: crypto.randomUUID(),
      date: Date.now(),
      image: selectedImage,
      result
    };
    const updatedHistory = [newRecord, ...foodHistory];
    setFoodHistory(updatedHistory);
    localStorage.setItem('ironlog_food_history', JSON.stringify(updatedHistory));
    
    setIsAnalyzing(false);
  };

  const handleDeleteFoodRecord = (id: string) => {
    if (confirm('確定要刪除此食物分析紀錄嗎？')) {
      const updated = foodHistory.filter(r => r.id !== id);
      setFoodHistory(updated);
      localStorage.setItem('ironlog_food_history', JSON.stringify(updated));
    }
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
      {/* 頂部說明 */}
      <div className="px-1 pt-2">
        <h2 style={{ color: lightTheme.text }} className="text-2xl font-black tracking-tighter uppercase flex items-center gap-4">
          <Beef className="w-7 h-7" /> 飲食與營養分析
        </h2>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          管理您的生理數據，規劃宏量營養比例，並使用 AI 即時相機分析盤中食物。
        </p>
      </div>

      {/* 核心功能：AI 食物拍照分析 */}
      <div style={{ backgroundColor: lightTheme.bg }} className="rounded-[44px] p-8 border border-black/5 relative overflow-hidden shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div style={{ backgroundColor: lightTheme.card }} className="p-3.5 rounded-2xl border border-black/5 shadow-sm">
              <Camera className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 style={{ color: lightTheme.text }} className="text-[17px] font-black uppercase tracking-tighter leading-none">食物 AI 拍照分析</h3>
              <p className="text-[10px] font-black text-black uppercase tracking-widest mt-1.5">拍照或上傳自動估算熱量</p>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
        </div>

        <div className="space-y-5">
          {/* 上傳區塊 */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-black/10 rounded-[32px] p-6 text-center cursor-pointer hover:bg-black/[0.01] transition-all relative overflow-hidden h-48 flex flex-col justify-center items-center gap-3 bg-white shadow-inner"
          >
            {selectedImage ? (
              <div className="absolute inset-0 w-full h-full">
                <img src={selectedImage} alt="Food Upload" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Upload className="w-4 h-4" /> 重新選擇
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-[#CCFF00]/10 flex items-center justify-center text-black">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-black">點擊上傳或拍照</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">支援拖曳圖片、直接相機拍攝</p>
                </div>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
          </div>

          {selectedImage && (
            <button
              onClick={handleAnalyzeFood}
              disabled={isAnalyzing}
              className="w-full h-14 bg-black text-white rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#CCFF00]" />
              ) : (
                <Sparkle className="w-5 h-5 text-[#CCFF00]" />
              )}
              {isAnalyzing ? 'AI 正在掃描並分析熱量...' : '開始 AI 拍照分析'}
            </button>
          )}

          {/* 渲染分析結果 */}
          <AnimatePresence>
            {(isAnalyzing || analysisResult) && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="p-6 rounded-[28px] bg-white border border-black/5 shadow-inner space-y-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-black flex items-center justify-center text-[#CCFF00] shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-sm font-black uppercase">AI 估算分析結果</h4>
                </div>

                {isAnalyzing ? (
                  <div className="py-8 text-center flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-black" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      正在深入辨識菜色、計算卡路里與三大營養素中...
                    </p>
                  </div>
                ) : (
                  <div className="prose prose-sm text-black leading-relaxed font-medium markdown-body overflow-x-auto text-xs">
                    <Markdown>{analysisResult || ''}</Markdown>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 食物拍照歷史 */}
          {foodHistory.length > 0 && (
            <div className="pt-2">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none select-none text-[11px] font-black uppercase text-black tracking-widest hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-2">
                    <History className="text-stone-400 w-3.5 h-3.5" />
                    <span>查看歷史相片紀錄 ({foodHistory.length})</span>
                  </div>
                  <span className="text-[9px] text-[#82CC00] group-open:hidden">展開 ▾</span>
                  <span className="text-[9px] text-[#82CC00] hidden group-open:inline">收起 ▴</span>
                </summary>
                
                <div className="mt-4 space-y-3.5 max-h-64 overflow-y-auto pr-1">
                  {foodHistory.map((rec) => (
                    <div 
                      key={rec.id}
                      style={{ backgroundColor: lightTheme.card }}
                      className="p-4 rounded-2xl border border-black/[0.03] flex gap-4 text-xs shadow-sm"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-black/5 bg-slate-100">
                        <img src={rec.image} alt="Food History" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-slate-400">
                            {new Date(rec.date).toLocaleDateString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <button 
                            onClick={() => handleDeleteFoodRecord(rec.id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="prose prose-sm text-stone-700 leading-normal max-h-12 overflow-y-auto font-medium pr-1 text-[10px] no-scrollbar">
                          <Markdown>{rec.result}</Markdown>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
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
          <InputBox icon={<Maximize2 className="text-sky-400 w-3.5 h-3.5" />} label="身高" val={tempMetrics.height} unit="CM" onChange={(v: string) => setTempMetrics({ ...tempMetrics, height: Number(v) })} />
          <InputBox icon={<WeightIcon className="text-emerald-400 w-3.5 h-3.5" />} label="當前體重" val={tempMetrics.weight} unit="KG" onChange={(v: string) => setTempMetrics({ ...tempMetrics, weight: Number(v) })} />
          <InputBox icon={<Cake className="text-rose-400 w-3.5 h-3.5" />} label="年齡" val={tempMetrics.age} unit="歲" onChange={(v: string) => setTempMetrics({ ...tempMetrics, age: Number(v) })} />
          
          <div style={{ backgroundColor: lightTheme.card }} className="p-6 rounded-2xl border border-black/5 flex flex-col shadow-inner">
            <div className="flex items-center gap-3 mb-3">
              <UserCheck className="text-violet-400 w-3.5 h-3.5" />
              <span className="text-[11px] font-black uppercase text-black tracking-widest">性別</span>
            </div>
            <div className="flex gap-2.5">
              {(['male', 'female'] as const).map(g => (
                <button 
                  key={g}
                  onClick={() => setTempMetrics({ ...tempMetrics, gender: g })}
                  className={`flex-1 py-3 rounded-xl text-[12px] font-black uppercase border transition-all ${
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

             <div className="grid grid-cols-1 gap-3.5">
               <MacroCard icon={<Beef className="w-4 h-4 text-rose-400" />} label="蛋白質" val={macros.protein} unit="G" color="bg-rose-400" />
               <MacroCard icon={<Soup className="w-4 h-4 text-amber-400" />} label="碳水" val={macros.carbs} unit="G" color="bg-amber-400" />
               <MacroCard icon={<Droplets className="w-4 h-4 text-indigo-400" />} label="脂肪" val={macros.fats} unit="G" color="bg-indigo-400" />
               <MacroCard icon={<GlassWater className="w-4 h-4 text-sky-400" />} label="每日建議飲水" val={waterIntake} unit="ML" color="bg-sky-400" />
             </div>
          </div>
       </div>
     </div>
   );
 };
 
 const MacroCard = ({ icon, label, val, unit, color }: any) => (
   <div style={{ backgroundColor: lightTheme.card }} className="p-5 rounded-[24px] flex items-center justify-between gap-4 shadow-inner">
    <div className="flex items-center gap-4 flex-1">
      <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[11px] font-black text-black uppercase tracking-widest block mb-1">{label}</span>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden max-w-[140px]">
          <div className={`h-full ${color}`} style={{ width: val > 0 ? '60%' : '0%' }} />
        </div>
      </div>
    </div>
    <div className="text-right shrink-0">
      <div className="flex items-baseline justify-end gap-1">
        <span style={{ color: lightTheme.text }} className="text-2xl font-black">{val || '--'}</span>
        <span className="text-[10px] font-black text-black">{unit}</span>
      </div>
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
