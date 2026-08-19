import React, { useContext, useMemo, useState, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import { BodyMetric, UserGoal } from '../types';
import { calculateSuggestedCalories, calculateMacros } from '../utils/fitnessMath';
import { 
  User, Camera, Edit3, Check, Award, Trophy, Crown, Flame, Sparkles, Calendar,
  Globe, Scale, Download, Trash2, ChevronRight, CheckCircle2,
  Lock, X, UserCheck, Utensils, Calculator, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SettingsView: React.FC = () => {
  const context = useContext(AppContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const history = context?.history || [];
  const bodyMetrics = context?.bodyMetrics || [];
  const globalGoal = context?.goal || { type: 'maintain', targetWeight: 0, startWeight: 0, activityLevel: 1.55 };
  const setGlobalGoal = context?.setGoal || (() => {});
  const setBodyMetrics = context?.setBodyMetrics || (() => {});

  // Current latest body metric
  const latestMetric: BodyMetric = useMemo(() => {
    const first = bodyMetrics[0];
    if (first && first.weight > 0) return first;
    return { id: '', date: Date.now(), weight: 75, height: 178, age: 26, gender: 'male' };
  }, [bodyMetrics]);

  // Account State
  const [profileImage, setProfileImage] = useState<string | null>(() => localStorage.getItem('ironlog_user_avatar'));
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('ironlog_user_name') || '');
  const [userEmail, setUserEmail] = useState<string>(() => localStorage.getItem('ironlog_user_email') || '');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => localStorage.getItem('ironlog_pro_subscribed') === 'true');

  // Preferences State
  const [weightUnit, setWeightUnit] = useState<string>(() => localStorage.getItem('ironlog_weight_unit') || 'kg');
  const [coachTone, setCoachTone] = useState<string>(() => localStorage.getItem('ironlog_coach_tone') || '台式教練');
  const [language, setLanguage] = useState<string>(() => localStorage.getItem('ironlog_language') || '繁體中文');

  // Modals
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [showTdeeModal, setShowTdeeModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState<string | null>(null);

  // Form states for modals
  const [editNameInput, setEditNameInput] = useState(userName);
  const [editEmailInput, setEditEmailInput] = useState(userEmail);

  // Nutrition adjustment modal temp state
  const [tempGoal, setTempGoal] = useState<UserGoal>(globalGoal);

  // TDEE survey state
  const [tdeeForm, setTdeeForm] = useState<{
    gender: 'male' | 'female';
    height: number;
    weight: number;
    age: number;
    activityLevel: 1.2 | 1.375 | 1.55 | 1.725 | 1.9;
    type: 'bulk' | 'cut' | 'maintain';
    targetWeight: number;
  }>({
    gender: latestMetric.gender || 'male',
    height: latestMetric.height || 178,
    weight: latestMetric.weight || 75,
    age: latestMetric.age || 26,
    activityLevel: (globalGoal.activityLevel as any) || 1.55,
    type: globalGoal.type || 'maintain',
    targetWeight: globalGoal.targetWeight || (latestMetric.weight || 75)
  });

  useEffect(() => {
    setTempGoal(globalGoal);
  }, [globalGoal]);

  // Current calculated TDEE & macros for display in preference row
  const calculatedCalories = useMemo(() => {
    const w = latestMetric.weight || 75;
    const h = latestMetric.height || 178;
    const a = latestMetric.age || 26;
    const g = latestMetric.gender || 'male';
    const goalType = globalGoal.type || 'maintain';
    const act = globalGoal.activityLevel || 1.55;
    const cal = calculateSuggestedCalories(w, h, a, g, goalType, act);
    return cal > 0 ? cal : 2941;
  }, [latestMetric, globalGoal]);

  const currentMacros = useMemo(() => {
    return calculateMacros(
      calculatedCalories,
      latestMetric.weight || 75,
      globalGoal.type || 'maintain',
      {
        protein: globalGoal.proteinRatio,
        carbs: globalGoal.carbRatio,
        fats: globalGoal.fatRatio
      }
    );
  }, [calculatedCalories, latestMetric.weight, globalGoal]);

  // Achievement statistics
  const stats = useMemo(() => {
    let totalSets = 0;
    let totalVolume = 0;
    const activeDays = new Set<string>();
    
    history.forEach(session => {
      const dateKey = new Date(session.startTime).toDateString();
      activeDays.add(dateKey);
      
      session.exercises?.forEach(ex => {
        ex.sets?.forEach(set => {
          if (set.completed) {
            totalSets += 1;
            totalVolume += (set.weight * set.reps);
          }
        });
      });
    });
    
    return {
      totalWorkouts: history.length,
      workoutDays: activeDays.size,
      totalSets,
      totalVolume,
    };
  }, [history]);

  const badges = useMemo(() => [
    {
      id: 'first_workout',
      title: '初試身手',
      desc: '完成 1 次訓練課表',
      requirement: () => stats.totalWorkouts >= 1,
      icon: Award,
      color: 'bg-indigo-500/10 text-indigo-600',
    },
    {
      id: 'streak_3',
      title: '持續不懈',
      desc: '累計訓練打卡達 3 天',
      requirement: () => stats.workoutDays >= 3,
      icon: Calendar,
      color: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      id: 'workouts_5',
      title: '熱血愛好者',
      desc: '累計完成 5 次訓練',
      requirement: () => stats.totalWorkouts >= 5,
      icon: Flame,
      color: 'bg-orange-500/10 text-orange-500',
    },
    {
      id: 'sets_100',
      title: '百煉成鋼',
      desc: '累計完成 100 組動作',
      requirement: () => stats.totalSets >= 100,
      icon: Sparkles,
      color: 'bg-amber-500/10 text-amber-500',
    },
    {
      id: 'volume_10t',
      title: '重力主宰',
      desc: '累計起重重量達 10,000 kg',
      requirement: () => stats.totalVolume >= 10000,
      icon: Trophy,
      color: 'bg-yellow-500/10 text-yellow-600',
    },
    {
      id: 'workouts_15',
      title: '鋼鐵猛獸',
      desc: '累計完成 15 次訓練',
      requirement: () => stats.totalWorkouts >= 15,
      icon: Crown,
      color: 'bg-rose-500/10 text-rose-500',
    },
  ], [stats]);

  const unlockedCount = useMemo(() => {
    return badges.filter(b => b.requirement()).length;
  }, [badges]);

  // Handlers
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfileImage(base64);
        localStorage.setItem('ironlog_user_avatar', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setUserName(editNameInput);
    setUserEmail(editEmailInput);
    localStorage.setItem('ironlog_user_name', editNameInput);
    localStorage.setItem('ironlog_user_email', editEmailInput);
    setShowEditProfileModal(false);
  };

  const handleUnitToggle = (unit: string) => {
    setWeightUnit(unit);
    localStorage.setItem('ironlog_weight_unit', unit);
  };

  const handleToneToggle = (tone: string) => {
    setCoachTone(tone);
    localStorage.setItem('ironlog_coach_tone', tone);
  };

  const handleSelectLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('ironlog_language', lang);
    setShowLanguageModal(false);
  };

  const handleSaveNutritionGoal = () => {
    setGlobalGoal(tempGoal);
    localStorage.setItem('ironlog_v3_goal', JSON.stringify(tempGoal));
    setShowNutritionModal(false);
  };

  const handleSaveTdeeSurvey = () => {
    const newMetric: BodyMetric = {
      id: crypto.randomUUID(),
      date: Date.now(),
      weight: Number(tdeeForm.weight) || 75,
      height: Number(tdeeForm.height) || 178,
      age: Number(tdeeForm.age) || 26,
      gender: tdeeForm.gender
    };

    const updatedMetrics = [newMetric, ...bodyMetrics.filter(m => m.id !== newMetric.id)];
    setBodyMetrics(updatedMetrics);
    localStorage.setItem('ironlog_v3_metrics', JSON.stringify(updatedMetrics));

    const updatedGoal: UserGoal = {
      ...globalGoal,
      type: tdeeForm.type,
      targetWeight: Number(tdeeForm.targetWeight) || Number(tdeeForm.weight) || 75,
      activityLevel: tdeeForm.activityLevel
    };
    setGlobalGoal(updatedGoal);
    localStorage.setItem('ironlog_v3_goal', JSON.stringify(updatedGoal));

    setShowTdeeModal(false);
  };

  const toggleSubscription = () => {
    const nextSub = !isSubscribed;
    setIsSubscribed(nextSub);
    localStorage.setItem('ironlog_pro_subscribed', String(nextSub));
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      history,
      metrics: localStorage.getItem('ironlog_v3_metrics'),
      goal: localStorage.getItem('ironlog_v3_goal'),
      userEmail,
      userName
    }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `IronLog_Data_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearCache = () => {
    if (confirm('⚠️ 警告：這將清除您的所有本機訓練歷史紀錄與身體數據，且無法復原！\n\n確定要繼續嗎？')) {
      if (confirm('請再次確認是否真的要清除？')) {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  const activityOptions: { label: string; val: 1.2 | 1.375 | 1.55 | 1.725 | 1.9 }[] = [
    { label: '久坐 (辦公室/無運動)', val: 1.2 },
    { label: '輕度 (每週 1-2 天)', val: 1.375 },
    { label: '中度 (每週 3-5 天)', val: 1.55 },
    { label: '高度 (每週 6-7 天)', val: 1.725 },
    { label: '極限 (職業運動員)', val: 1.9 }
  ];

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* 頂部標題 */}
      <div className="text-center pb-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">設定</h1>
      </div>

      {/* 帳戶卡片 */}
      <div className="bg-white rounded-[28px] p-6 border border-black/5 shadow-sm space-y-4">
        <div 
          onClick={() => {
            setEditNameInput(userName);
            setEditEmailInput(userEmail);
            setShowEditProfileModal(true);
          }}
          className="flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-4 min-w-0 pr-2">
            {/* 頭像 */}
            <div className="w-16 h-16 rounded-full bg-[#CCFF00]/15 border border-[#82CC00]/30 flex items-center justify-center text-[#82CC00] shrink-0 overflow-hidden shadow-inner">
              {profileImage ? (
                <img src={profileImage} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 fill-current" />
              )}
            </div>

            {/* 帳戶資訊 */}
            <div className="min-w-0 flex-1">
              <span className="text-xs text-slate-400 font-medium block">帳戶</span>
              <h2 className="text-[17px] font-bold text-slate-900 leading-snug break-all tracking-tight mt-0.5">
                {userName || userEmail ? (
                  <>
                    {userName && <span className="mr-1.5">{userName}</span>}
                    {userEmail && <span className="text-xs text-slate-400 font-normal block sm:inline">{userEmail}</span>}
                  </>
                ) : (
                  <span className="text-slate-400 font-normal">未設定姓名與 Email</span>
                )}
              </h2>
              <span className="text-xs font-bold text-[#82CC00] mt-1 inline-block group-hover:underline">
                點擊設定個人資料
              </span>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
        </div>

        {/* 升級至 Pro 帳戶 按鈕 */}
        <div>
          <button
            onClick={() => setShowProModal(true)}
            className="bg-[#CCFF00] hover:bg-[#b8e600] active:scale-[0.98] text-black font-black text-sm py-2.5 px-5 rounded-2xl shadow-sm inline-flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>{isSubscribed ? 'Pro 專業版會員 (已解鎖)' : '升級至 Pro 帳戶'}</span>
          </button>
        </div>
      </div>

      {/* 偏好設定標題 */}
      <div>
        <h3 className="text-base font-bold text-slate-700 px-1 mb-2.5 tracking-tight">偏好設定</h3>

        {/* 偏好設定卡片列表 */}
        <div className="bg-white rounded-[28px] border border-black/5 shadow-sm overflow-hidden divide-y divide-slate-100">
          
          {/* 1. 體重單位 */}
          <div className="p-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-7 h-7 flex items-center justify-center text-[#82CC00] shrink-0">
                <Scale className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-slate-900 leading-tight">體重單位</h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {weightUnit.toLowerCase() === 'kg' ? '公斤 (kg)' : '磅 (lb)'}
                </p>
              </div>
            </div>

            {/* kg / lb 膠囊切換鈕 */}
            <div className="border border-slate-200 rounded-full p-0.5 flex items-center bg-slate-50 shrink-0">
              <button
                onClick={() => handleUnitToggle('kg')}
                className={`text-xs font-black py-1.5 px-5 rounded-full transition-all ${
                  weightUnit.toLowerCase() === 'kg'
                    ? 'bg-[#CCFF00] text-black shadow-sm'
                    : 'text-slate-700 bg-transparent hover:text-black'
                }`}
              >
                kg
              </button>
              <button
                onClick={() => handleUnitToggle('lb')}
                className={`text-xs font-black py-1.5 px-5 rounded-full transition-all ${
                  weightUnit.toLowerCase() === 'lb'
                    ? 'bg-[#CCFF00] text-black shadow-sm'
                    : 'text-slate-700 bg-transparent hover:text-black'
                }`}
              >
                lb
              </button>
            </div>
          </div>

          {/* 2. AI 教練語氣 */}
          <div className="p-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-7 h-7 flex items-center justify-center text-[#82CC00] shrink-0">
                <UserCheck className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-slate-900 leading-tight">AI 教練語氣</h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{coachTone}</p>
              </div>
            </div>

            {/* 港式教練 / 台式教練 膠囊切換鈕 */}
            <div className="border border-slate-200 rounded-full p-0.5 flex items-center bg-slate-50 shrink-0">
              <button
                onClick={() => handleToneToggle('港式教練')}
                className={`text-xs font-black py-1.5 px-3.5 rounded-full transition-all ${
                  coachTone === '港式教練'
                    ? 'bg-[#CCFF00] text-black shadow-sm'
                    : 'text-slate-700 bg-transparent hover:text-black'
                }`}
              >
                港式教練
              </button>
              <button
                onClick={() => handleToneToggle('台式教練')}
                className={`text-xs font-black py-1.5 px-3.5 rounded-full transition-all ${
                  coachTone === '台式教練'
                    ? 'bg-[#CCFF00] text-black shadow-sm'
                    : 'text-slate-700 bg-transparent hover:text-black'
                }`}
              >
                台式教練
              </button>
            </div>
          </div>

          {/* 3. 選擇語言 */}
          <div 
            onClick={() => setShowLanguageModal(true)}
            className="p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition-colors group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-7 h-7 flex items-center justify-center text-[#82CC00] shrink-0">
                <Globe className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-slate-900 leading-tight">選擇語言</h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{language}</p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
          </div>

          {/* 4. 自訂每日營養目標 */}
          <div 
            onClick={() => {
              setTempGoal(globalGoal);
              setShowNutritionModal(true);
            }}
            className="p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition-colors group"
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div className="w-7 h-7 flex items-center justify-center text-[#82CC00] shrink-0">
                <Utensils className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[15px] font-bold text-slate-900 leading-tight">自訂每日營養目標</h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5 line-clamp-1 leading-snug">
                  使用 TDEE 估算 · {calculatedCalories} 千卡 · 蛋白 {currentMacros.protein}g · 碳水 {currentMacros.carbs}g · 脂肪 {currentMacros.fats}g
                </p>
              </div>
            </div>

            <Edit3 className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-700 shrink-0 transition-colors" />
          </div>

          {/* 5. 重新計算 TDEE */}
          <div 
            onClick={() => {
              setTdeeForm({
                gender: latestMetric.gender || 'male',
                height: latestMetric.height || 178,
                weight: latestMetric.weight || 75,
                age: latestMetric.age || 26,
                activityLevel: (globalGoal.activityLevel as any) || 1.55,
                type: globalGoal.type || 'maintain',
                targetWeight: globalGoal.targetWeight || (latestMetric.weight || 75)
              });
              setShowTdeeModal(true);
            }}
            className="p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition-colors group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-7 h-7 flex items-center justify-center text-[#82CC00] shrink-0">
                <Calculator className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-slate-900 leading-tight">重新計算 TDEE</h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  目前 {latestMetric.weight || 75} kg · 目標 {globalGoal.targetWeight || latestMetric.weight || 75} kg · {calculatedCalories} kcal
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
          </div>

        </div>
      </div>

      {/* 次要功能與資料支援 */}
      <div className="pt-2">
        <h3 className="text-base font-bold text-slate-700 px-1 mb-2.5 tracking-tight">資料與支援</h3>
        <div className="bg-white rounded-[28px] border border-black/5 shadow-sm overflow-hidden divide-y divide-slate-100">
          {/* 成就里程碑 */}
          <div 
            onClick={() => setShowAchievementsModal(true)}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-7 h-7 flex items-center justify-center text-amber-500 shrink-0">
                <Trophy className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-slate-900 leading-tight">訓練成就徽章</h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">已解鎖 {unlockedCount} / {badges.length} 個里程碑</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
          </div>

          {/* 匯出資料 */}
          <div 
            onClick={handleExportData}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-7 h-7 flex items-center justify-center text-[#82CC00] shrink-0">
                <Download className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-slate-900 leading-tight">匯出訓練與營養紀錄</h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">下載為 JSON 備份檔</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
          </div>

          {/* 條款政策 */}
          <div 
            onClick={() => setShowLegalModal('terms')}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-7 h-7 flex items-center justify-center text-slate-500 shrink-0">
                <FileText className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-slate-900 leading-tight">服務條款與隱私權</h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">隱私政策與使用規範</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
          </div>

          {/* 清除資料 */}
          <div 
            onClick={handleClearCache}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-rose-50/40 transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-7 h-7 flex items-center justify-center text-rose-500 shrink-0">
                <Trash2 className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-rose-600 leading-tight">清除本機暫存資料</h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">重設所有本機訓練與生理紀錄</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-rose-400 shrink-0 transition-colors" />
          </div>
        </div>
      </div>

      {/* 隱藏的檔案上傳 input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleAvatarUpload} 
      />

      {/* ================= MODALS ================= */}

      {/* 1. 編輯個人資料 Modal */}
      <AnimatePresence>
        {showEditProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-5 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] p-7 max-w-sm w-full shadow-2xl space-y-6 relative"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">編輯個人資料</h3>
                <button 
                  onClick={() => setShowEditProfileModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 頭像更換 */}
              <div className="flex flex-col items-center gap-3">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-20 h-20 rounded-full bg-[#CCFF00]/15 flex items-center justify-center text-[#82CC00] cursor-pointer overflow-hidden border-2 border-[#82CC00]/30 group shadow-sm"
                >
                  {profileImage ? (
                    <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 fill-current" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-[#82CC00] hover:underline"
                >
                  更換頭像照片
                </button>
              </div>

              {/* 表單欄位 */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">暱稱 / 顯示名稱</label>
                  <input
                    type="text"
                    value={editNameInput}
                    onChange={(e) => setEditNameInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-black"
                    placeholder="請輸入暱稱"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">帳戶 Email</label>
                  <input
                    type="email"
                    value={editEmailInput}
                    onChange={(e) => setEditEmailInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-black"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEditProfileModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 py-3 bg-[#CCFF00] text-black rounded-2xl font-black text-sm hover:bg-[#b8e600] transition-colors shadow-md"
                >
                  儲存
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Pro 方案升級 Modal */}
      <AnimatePresence>
        {showProModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-5 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] p-7 max-w-sm w-full shadow-2xl space-y-6 relative"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#CCFF00]/20 flex items-center justify-center text-black">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">IronLog Pro 尊榮版</h3>
                </div>
                <button 
                  onClick={() => setShowProModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 py-2">
                {[
                  '無限次 AI 食物熱量拍照與營養分析',
                  '專屬 AI 鋼鐵教練（支援港式 / 台式雙語氣即時諮詢）',
                  '進階 TDEE 巨量營養素比例自訂與監測',
                  '終身訓練課表與體重變化雲端趨勢圖表',
                  '無廣告與專屬優先更新權限'
                ].map((perk, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#82CC00] shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>

              {/* 訂閱方案與價格 */}
              <div className="bg-[#CCFF00]/10 p-4 rounded-2xl text-center border border-[#82CC00]/30 space-y-1">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl font-black text-slate-900">NT$ 100</span>
                  <span className="text-xs font-bold text-slate-600">/ 每月 (台幣)</span>
                </div>
                <p className="text-[11px] font-bold text-slate-500">
                  {isSubscribed ? '🎉 目前方案：Pro 專業版會員 (已生效)' : '隨時可取消 · 無綁約負擔'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowProModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                  返回
                </button>
                <button
                  onClick={() => {
                    toggleSubscription();
                    setShowProModal(false);
                  }}
                  className={`flex-1 py-3 text-black font-black rounded-2xl text-sm shadow-md transition-all ${
                    isSubscribed ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-[#CCFF00] hover:bg-[#b8e600]'
                  }`}
                >
                  {isSubscribed ? '停用 Pro 訂閱' : '每月 NT$100 立即解鎖'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. 語言選擇 Modal */}
      <AnimatePresence>
        {showLanguageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-5 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] p-7 max-w-sm w-full shadow-2xl space-y-5 relative"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">選擇語言</h3>
                <button 
                  onClick={() => setShowLanguageModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { label: '繁體中文 (Traditional Chinese)', val: '繁體中文' },
                  { label: 'English (US)', val: 'English' },
                  { label: '日本語 (Japanese)', val: '日本語' }
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => handleSelectLanguage(item.val)}
                    className={`w-full p-4 rounded-2xl text-left font-bold text-sm flex items-center justify-between border transition-all ${
                      language === item.val
                        ? 'border-[#82CC00] bg-[#CCFF00]/15 text-black font-black'
                        : 'border-slate-100 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span>{item.label}</span>
                    {language === item.val && <Check className="w-5 h-5 text-[#82CC00] stroke-[2.5]" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. 自訂每日營養目標 Modal */}
      <AnimatePresence>
        {showNutritionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-5 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] p-7 max-w-sm w-full shadow-2xl space-y-5 relative my-auto"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">自訂每日營養目標</h3>
                <button 
                  onClick={() => setShowNutritionModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 每日熱量預覽 */}
              <div className="bg-[#CCFF00]/15 p-4 rounded-2xl border border-[#82CC00]/30 text-center">
                <span className="text-xs text-slate-700 font-bold block">每日目標熱量</span>
                <span className="text-3xl font-black text-slate-900 mt-1 block">
                  {calculatedCalories} <span className="text-sm font-bold text-slate-600">千卡 (KCAL)</span>
                </span>
              </div>

              {/* 營養比例設定 */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-700 block">三大巨量營養素比例 (%):</span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="space-y-1.5 text-center">
                    <span className="text-xs font-semibold text-rose-500 block">蛋白質 %</span>
                    <input
                      type="number"
                      value={tempGoal.proteinRatio || ''}
                      placeholder="30"
                      onChange={(e) => setTempGoal({ ...tempGoal, proteinRatio: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-center font-bold text-slate-900 text-sm outline-none focus:border-rose-400"
                    />
                  </div>
                  <div className="space-y-1.5 text-center">
                    <span className="text-xs font-semibold text-amber-500 block">碳水 %</span>
                    <input
                      type="number"
                      value={tempGoal.carbRatio || ''}
                      placeholder="45"
                      onChange={(e) => setTempGoal({ ...tempGoal, carbRatio: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-center font-bold text-slate-900 text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-1.5 text-center">
                    <span className="text-xs font-semibold text-sky-500 block">脂肪 %</span>
                    <input
                      type="number"
                      value={tempGoal.fatRatio || ''}
                      placeholder="25"
                      onChange={(e) => setTempGoal({ ...tempGoal, fatRatio: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-center font-bold text-slate-900 text-sm outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                {/* 估算克數預覽 */}
                <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>蛋白質:</span>
                    <span className="text-slate-900 font-bold">{currentMacros.protein} g</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>碳水化合物:</span>
                    <span className="text-slate-900 font-bold">{currentMacros.carbs} g</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>脂肪:</span>
                    <span className="text-slate-900 font-bold">{currentMacros.fats} g</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setTempGoal({ ...tempGoal, proteinRatio: undefined, carbRatio: undefined, fatRatio: undefined });
                  }}
                  className="py-3 px-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-200"
                >
                  恢復預設
                </button>
                <button
                  onClick={handleSaveNutritionGoal}
                  className="flex-1 py-3 bg-[#CCFF00] text-black font-black rounded-2xl text-sm hover:bg-[#b8e600] shadow-md"
                >
                  儲存目標
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. 重新計算 TDEE 問卷 Modal */}
      <AnimatePresence>
        {showTdeeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl space-y-4 relative my-auto max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#CCFF00]/20 flex items-center justify-center text-black">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">重新計算 TDEE</h3>
                </div>
                <button 
                  onClick={() => setShowTdeeModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 生理資料輸入 */}
              <div className="space-y-3.5 text-xs font-bold text-slate-700">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">生理性別</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTdeeForm({ ...tdeeForm, gender: 'male' })}
                      className={`flex-1 py-2.5 rounded-xl font-bold border transition-all ${
                        tdeeForm.gender === 'male'
                          ? 'bg-[#CCFF00] text-black border-[#82CC00]'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      男 (Male)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTdeeForm({ ...tdeeForm, gender: 'female' })}
                      className={`flex-1 py-2.5 rounded-xl font-bold border transition-all ${
                        tdeeForm.gender === 'female'
                          ? 'bg-[#CCFF00] text-black border-[#82CC00]'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      女 (Female)
                    </button>
                  </div>
                </div>

                {/* 體重數據：目前體重 & 目標體重 */}
                <div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">目前體重 (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={tdeeForm.weight || ''}
                        onChange={(e) => setTdeeForm({ ...tdeeForm, weight: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center font-bold text-slate-900 outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="font-black text-[#82CC00] block mb-1">目標體重 (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={tdeeForm.targetWeight || ''}
                        onChange={(e) => setTdeeForm({ ...tdeeForm, targetWeight: Number(e.target.value) })}
                        className="w-full bg-[#CCFF00]/10 border border-[#82CC00]/50 rounded-xl p-2.5 text-center font-black text-slate-900 outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  {/* 體重差距動態提示 */}
                  {tdeeForm.weight > 0 && tdeeForm.targetWeight > 0 && (
                    <div className="mt-1.5 text-center">
                      <span className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        tdeeForm.targetWeight < tdeeForm.weight 
                          ? 'bg-sky-100 text-sky-700' 
                          : tdeeForm.targetWeight > tdeeForm.weight
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        {tdeeForm.targetWeight < tdeeForm.weight
                          ? `目標減重 ${(tdeeForm.weight - tdeeForm.targetWeight).toFixed(1)} kg`
                          : tdeeForm.targetWeight > tdeeForm.weight
                            ? `目標增重 ${(tdeeForm.targetWeight - tdeeForm.weight).toFixed(1)} kg`
                            : '維持當前體重'}
                      </span>
                    </div>
                  )}
                </div>

                {/* 身高 & 年齡 */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">身高 (cm)</label>
                    <input
                      type="number"
                      value={tdeeForm.height || ''}
                      onChange={(e) => setTdeeForm({ ...tdeeForm, height: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center font-bold text-slate-900 outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">年齡 (歲)</label>
                    <input
                      type="number"
                      value={tdeeForm.age || ''}
                      onChange={(e) => setTdeeForm({ ...tdeeForm, age: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center font-bold text-slate-900 outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* 運動目標 */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">體態目標</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'cut', label: '減脂 (-500)' },
                      { val: 'maintain', label: '維持體態' },
                      { val: 'bulk', label: '增肌 (+300)' }
                    ].map(opt => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setTdeeForm({ ...tdeeForm, type: opt.val as any })}
                        className={`py-2 rounded-xl font-bold border transition-all text-xs ${
                          tdeeForm.type === opt.val
                            ? 'bg-[#CCFF00] text-black border-[#82CC00]'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 活動量問卷 */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">日常活動量係數</label>
                  <div className="space-y-1.5">
                    {activityOptions.map(opt => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setTdeeForm({ ...tdeeForm, activityLevel: opt.val })}
                        className={`w-full py-2 px-3 text-left rounded-xl font-bold text-xs border flex items-center justify-between transition-all ${
                          tdeeForm.activityLevel === opt.val
                            ? 'bg-[#CCFF00]/15 text-black border-[#82CC00]'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {tdeeForm.activityLevel === opt.val && <Check className="w-4 h-4 text-[#82CC00]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 即時試算 TDEE 預覽卡 */}
                <div className="bg-[#CCFF00]/15 p-3 rounded-2xl border border-[#82CC00]/30 text-center">
                  <span className="text-[10px] font-bold text-slate-600 block">依據輸入即時試算 TDEE 每日熱量</span>
                  <span className="text-xl font-black text-slate-900 mt-0.5 block">
                    {calculateSuggestedCalories(
                      Number(tdeeForm.weight) || 75,
                      Number(tdeeForm.height) || 178,
                      Number(tdeeForm.age) || 26,
                      tdeeForm.gender,
                      tdeeForm.type,
                      tdeeForm.activityLevel
                    )} <span className="text-xs font-bold text-slate-600">kcal / 日</span>
                  </span>
                </div>
              </div>

              {/* 儲存按鈕 */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTdeeModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveTdeeSurvey}
                  className="flex-1 py-3 bg-[#CCFF00] text-black font-black rounded-2xl text-sm hover:bg-[#b8e600] shadow-md"
                >
                  重新計算並儲存
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. 成就徽章 Modal */}
      <AnimatePresence>
        {showAchievementsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-5 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] p-7 max-w-sm w-full shadow-2xl space-y-5 relative my-auto max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">訓練成就徽章</h3>
                  <p className="text-xs text-slate-400 font-medium">已解鎖: {unlockedCount} / {badges.length}</p>
                </div>
                <button 
                  onClick={() => setShowAchievementsModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {badges.map(badge => {
                  const isUnlocked = badge.requirement();
                  const IconComp = badge.icon;
                  return (
                    <div
                      key={badge.id}
                      className={`p-4 rounded-2xl border flex flex-col justify-between h-32 transition-all ${
                        isUnlocked ? 'border-[#82CC00]/40 bg-[#CCFF00]/10' : 'border-slate-100 bg-slate-50/50 opacity-40'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className={`p-2 rounded-xl ${isUnlocked ? badge.color : 'bg-slate-200 text-slate-400'}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        {isUnlocked ? (
                          <Check className="w-4 h-4 text-[#82CC00] stroke-[3]" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{badge.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{badge.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowAchievementsModal(false)}
                className="w-full py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm"
              >
                關閉
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. 法律條款 Modal */}
      <AnimatePresence>
        {showLegalModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-6 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] p-7 max-w-sm w-full max-h-[80vh] overflow-y-auto space-y-5 relative"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">
                  {showLegalModal === 'terms' ? '服務條款與隱私權' : '隱私權條款'}
                </h3>
                <button 
                  onClick={() => setShowLegalModal(null)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="text-xs text-slate-600 leading-relaxed font-medium space-y-3">
                <p className="font-bold text-slate-800">1. 資料隱私承諾</p>
                <p>IronLog 為本機離線優先設計，您的訓練課表、打卡紀錄、身體指標與個人資料皆安全儲存於您個人的瀏覽器快取中。</p>

                <p className="font-bold text-slate-800">2. AI 服務聲明</p>
                <p>當您使用「食物 AI 拍照分析」或「AI 教練對話」時，資料會加密傳送給 Gemini AI 進行即時分析與計算。所有回覆僅供運動營養與訓練參考，非醫療診斷。</p>

                <p className="font-bold text-slate-800">3. 資料主控權</p>
                <p>您可以隨時在設定頁面匯出完整 JSON 備份檔，或使用「清除本機暫存資料」徹底移除所有紀錄。</p>
              </div>

              <button 
                onClick={() => setShowLegalModal(null)}
                className="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase"
              >
                我知道了
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
