import React, { useContext, useMemo, useState, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import { BodyMetric, UserGoal } from '../types';
import { calculateSuggestedCalories, calculateMacros } from '../utils/fitnessMath';
import { 
  User, Camera, Edit3, Check, Award, Trophy, Crown, Flame, Sparkles, Calendar,
  Globe, Scale, Download, Trash2, ChevronRight, CheckCircle2,
  Lock, X, UserCheck, Utensils, Calculator, FileText,
  Smartphone, CreditCard, ShieldCheck, Loader2, ScanFace
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
  const [showApplePaySheet, setShowApplePaySheet] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'sheet' | 'authenticating' | 'processing' | 'done'>('sheet');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
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

  const playApplePaySuccessSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1046.5, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.5, now + 0.09);
      gain2.gain.setValueAtTime(0.22, now + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.55);
    } catch (e) {
      console.log('Audio playback error', e);
    }
  };

  const handleStartPayment = (authType: 'faceid' | 'password' = 'faceid') => {
    if (paymentStep !== 'sheet') return;
    
    setPaymentStep('authenticating');
    
    // 模擬 iPhone Face ID 辨識動畫
    setTimeout(() => {
      setPaymentStep('processing');
      
      // 模擬 App Store / Apple Pay 交易處理
      setTimeout(() => {
        setPaymentStep('done');
        playApplePaySuccessSound();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([40, 80, 40]);
        }
        
        // 正式開通 Pro 尊榮版訂閱
        setIsSubscribed(true);
        localStorage.setItem('ironlog_pro_subscribed', 'true');
        window.dispatchEvent(new Event('storage'));
        
        // 完成後關閉付款頁面並顯示成功通知
        setTimeout(() => {
          setShowApplePaySheet(false);
          setPaymentStep('sheet');
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 5000);
        }, 1600);
      }, 1100);
    }, 1200);
  };

  const toggleSubscription = () => {
    const nextSub = !isSubscribed;
    setIsSubscribed(nextSub);
    localStorage.setItem('ironlog_pro_subscribed', String(nextSub));
    window.dispatchEvent(new Event('storage'));
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
                    if (isSubscribed) {
                      toggleSubscription();
                      setShowProModal(false);
                    } else {
                      setShowProModal(false);
                      setPaymentStep('sheet');
                      setShowApplePaySheet(true);
                    }
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

      {/* 2.1 iPhone 相應的 Apple Pay / In-App Purchase 付費畫面 */}
      <AnimatePresence>
        {showApplePaySheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[1100] flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget && paymentStep !== 'processing' && paymentStep !== 'authenticating') {
                setShowApplePaySheet(false);
                setPaymentStep('sheet');
              }
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="bg-[#1C1C1E] text-white w-full sm:max-w-md rounded-t-[36px] sm:rounded-[36px] shadow-2xl overflow-hidden border-t sm:border border-white/10 relative pb-8 sm:pb-6"
            >
              {/* iPhone iOS 頂部滑動橫條 (Home / Sheet Indicator) */}
              <div className="w-10 h-1 bg-white/25 rounded-full mx-auto mt-2.5 mb-1.5" />

              {/* 頂部標題列 */}
              <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                    <span className="text-2xl leading-none"></span>Pay
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-white/60 font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                    App Store 訂閱
                  </span>
                </div>
                {paymentStep !== 'processing' && paymentStep !== 'authenticating' && (
                  <button
                    onClick={() => {
                      setShowApplePaySheet(false);
                      setPaymentStep('sheet');
                    }}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white/70 hover:text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 主要內容區域 */}
              <div className="p-6 space-y-4">
                {/* App 資訊卡片 */}
                <div className="flex items-center gap-3.5 bg-white/5 p-3.5 rounded-2xl border border-white/5">
                  <img
                    src="https://i.postimg.cc/P5H3QSkC/Gemini-Generated-Image-38bzpo38bzpo38bz.png"
                    alt="IronLog Pro"
                    className="w-13 h-13 rounded-2xl shadow-md border border-white/10 object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[15px] font-bold text-white truncate">IronLog Pro - 健身追蹤</h4>
                    <p className="text-xs text-white/60 truncate">IronLog Fitness Co., Ltd.</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-[#CCFF00]">
                      <Sparkles className="w-3 h-3" />
                      <span>尊榮版月費方案 (1 個月)</span>
                    </div>
                  </div>
                </div>

                {/* 費用與帳號卡片 (iOS 錢包風格) */}
                <div className="bg-white/5 rounded-2xl p-4 space-y-3 border border-white/5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">方案內容</span>
                    <span className="font-semibold text-white">IronLog Pro 自動續訂</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/5 pt-2.5">
                    <span className="text-white/60">訂閱費用</span>
                    <div className="text-right">
                      <span className="text-xl font-black text-white tracking-tight">NT$ 100</span>
                      <span className="text-[11px] text-white/60 ml-1">/ 月</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/5 pt-2.5">
                    <span className="text-white/60">Apple 帳號</span>
                    <span className="font-medium text-white/90 truncate max-w-[210px]">
                      {userEmail || 'seanhsieh040724@gmail.com'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/5 pt-2.5">
                    <span className="text-white/60">付款卡片</span>
                    <div className="flex items-center gap-1.5 font-medium text-white/90">
                      <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-bold">Pay</span>
                      <span>中國信託 Commercial (•••• 8820)</span>
                    </div>
                  </div>
                </div>

                {/* Apple 條款說明 */}
                <p className="text-[11px] text-white/40 leading-relaxed text-center px-2">
                  確認購買後款項將計入 Apple ID 帳戶。訂閱將以每月 NT$ 100 自動續訂，可於各期結束前至少 24 小時至「設定 &gt; Apple ID &gt; 訂閱項目」取消。
                </p>

                {/* 驗證互動區域 */}
                {paymentStep === 'sheet' && (
                  <div className="space-y-3 pt-1">
                    {/* 模擬 iPhone 側邊按鈕指示條 */}
                    <div
                      onClick={() => handleStartPayment('faceid')}
                      className="bg-white/10 hover:bg-white/15 active:scale-[0.99] transition-all p-3.5 rounded-2xl flex items-center justify-between cursor-pointer border border-white/10 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#CCFF00] group-hover:scale-110 transition-transform">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>按兩下側邊按鈕以付款</span>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CCFF00] opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#CCFF00]"></span>
                            </span>
                          </div>
                          <div className="text-[11px] text-white/50">iPhone 側鍵確認或點擊此處直接驗證</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#CCFF00] px-2.5 py-1 rounded-lg bg-[#CCFF00]/10 border border-[#CCFF00]/30">
                        確認
                      </span>
                    </div>

                    {/* 主確認按鈕 */}
                    <button
                      onClick={() => handleStartPayment('faceid')}
                      className="w-full py-3.5 bg-white text-black hover:bg-white/90 active:scale-[0.98] rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <ScanFace className="w-5 h-5 text-black" />
                      <span>以 Face ID 確認付款 (NT$ 100)</span>
                    </button>

                    {/* 次要按鈕 */}
                    <button
                      onClick={() => handleStartPayment('password')}
                      className="w-full py-2 bg-transparent hover:bg-white/5 text-white/60 hover:text-white rounded-xl font-bold text-xs transition-colors text-center"
                    >
                      使用 Apple ID 密碼購買
                    </button>
                  </div>
                )}

                {paymentStep === 'authenticating' && (
                  <div className="py-8 flex flex-col items-center justify-center space-y-4">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <div className="absolute inset-0 border-2 border-[#CCFF00] rounded-2xl animate-pulse" />
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#CCFF00]">
                        <ScanFace className="w-8 h-8 animate-bounce" />
                      </div>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-bold text-white">正在使用 Face ID 驗證...</p>
                      <p className="text-xs text-white/50">請注視您的 iPhone 螢幕</p>
                    </div>
                  </div>
                )}

                {paymentStep === 'processing' && (
                  <div className="py-8 flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-10 h-10 text-[#CCFF00] animate-spin" />
                    <p className="text-sm font-bold text-white">正在處理 App Store 付款交易...</p>
                    <p className="text-xs text-white/50">請稍候，即將完成授權</p>
                  </div>
                )}

                {paymentStep === 'done' && (
                  <div className="py-7 flex flex-col items-center justify-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-[#007AFF] text-white flex items-center justify-center shadow-lg shadow-[#007AFF]/40">
                      <Check className="w-9 h-9 stroke-[3]" />
                    </div>
                    <p className="text-base font-black text-white">完成 (Done)</p>
                    <p className="text-xs text-white/70">付款成功！已為您開通 IronLog Pro 尊榮版</p>
                  </div>
                )}
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

      {/* 8. iPhone Apple Pay 付款成功通知 Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 inset-x-4 max-w-sm mx-auto z-[1500] bg-[#18392B] text-white px-4 py-3.5 rounded-2xl shadow-2xl border border-[#82CC00]/50 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-[#CCFF00] text-black flex items-center justify-center font-black shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div className="text-xs min-w-0 flex-1">
              <p className="font-black text-[#CCFF00] text-[13px]">🎉 訂閱成功！Pro 尊榮版已生效</p>
              <p className="text-slate-200 text-[11px] mt-0.5">無限次 AI 食物熱量分析與專屬教練功能已全數開通！</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
