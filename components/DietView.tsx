import React, { useContext, useMemo, useState, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import { BodyMetric, UserGoal, FoodItem } from '../types';
import { getBMIAnalysis, calculateSuggestedCalories, calculateMacros, calculateWaterIntake } from '../utils/fitnessMath';
import { 
  Target, Activity, Trash2, Flame, Edit3, CheckCircle2, Save, Beef, Soup, 
  Droplets, GlassWater, Plus, Share2, ScanBarcode, Camera, Sparkles, 
  Loader2, Calendar, History, Upload, Sparkle, Check, X, 
  ChevronRight, ChevronLeft, Utensils, Dumbbell, Clock, Info, Search, RefreshCw, Layers, Lock,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  analyzeFoodImage, 
  sanitizeFoodAnalysisText, 
  parseFoodAnalysisResult, 
  generateDietarySuggestions 
} from '../services/aiService';
import { useEntitlement } from '../services/storeKitBridge';
import { ProPaywall } from './ProPaywall';
import Markdown from 'react-markdown';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addWeeks, 
  subWeeks, 
  startOfMonth, 
  endOfMonth, 
  addMonths, 
  subMonths, 
  isSameDay, 
  isToday, 
  isSameMonth 
} from 'date-fns';

interface ExerciseBurnItem {
  id: string;
  name: string;
  durationMins: number;
  caloriesBurned: number;
  timestamp: number;
}

export const DietView: React.FC = () => {
  const context = useContext(AppContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const bodyMetrics = context?.bodyMetrics || [];
  const globalGoal: UserGoal = context?.goal || { 
    type: 'maintain', 
    targetWeight: 75, 
    startWeight: 75, 
    activityLevel: 1.55,
    proteinRatio: 35,
    carbRatio: 25,
    fatRatio: 40
  };
  const setGlobalGoal = context?.setGoal || (() => {});
  const setBodyMetrics = context?.setBodyMetrics || (() => {});

  const latest: BodyMetric = useMemo(() => {
    const first = bodyMetrics[0];
    if (first && first.weight > 0) return first;
    return { id: '', date: Date.now(), weight: 75, height: 178, age: 26, gender: 'male' };
  }, [bodyMetrics]);

  // Tab: 營養攝取 vs 超市掃描
  const [activeSubTab, setActiveSubTab] = useState<'macros' | 'scanner'>('macros');

  // 日期處理輔助函式
  const formatDateKey = (d: Date): string => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const parseDateKey = (key: string): Date => {
    const parts = key.split('-').map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date();
  };

  const getCurrentMealType = (): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 15) return 'lunch';
    if (hour >= 17 && hour < 22) return 'dinner';
    return 'snack';
  };

  // 今日日期字串 (YYYY-MM-DD) 用於紀錄分類
  const todayKey = useMemo(() => formatDateKey(new Date()), []);

  // 當前選取的檢視日期（預設為今日）
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  // 登記曾有紀錄的日期索引
  const trackRecordedDate = (dateKey: string) => {
    try {
      const saved = localStorage.getItem('ironlog_diet_recorded_dates');
      const dates: string[] = saved ? JSON.parse(saved) : [];
      if (!dates.includes(dateKey)) {
        dates.push(dateKey);
        localStorage.setItem('ironlog_diet_recorded_dates', JSON.stringify(dates));
      }
    } catch {}
  };

  // 當前選取日期的食物紀錄
  const [foodLogs, setFoodLogs] = useState<FoodItem[]>(() => {
    try {
      const saved = localStorage.getItem(`ironlog_food_logs_${todayKey}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // 當前選取日期的運動消耗紀錄
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseBurnItem[]>(() => {
    try {
      const saved = localStorage.getItem(`ironlog_exercise_logs_${todayKey}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // 當前選取日期的飲水量
  const [waterIntakeCurrent, setWaterIntakeCurrent] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`ironlog_water_${todayKey}`);
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  // 當選定日期改變時，自動載入該日期的紀錄
  useEffect(() => {
    try {
      const savedFoods = localStorage.getItem(`ironlog_food_logs_${selectedDateKey}`);
      setFoodLogs(savedFoods ? JSON.parse(savedFoods) : []);
    } catch {
      setFoodLogs([]);
    }

    try {
      const savedExercises = localStorage.getItem(`ironlog_exercise_logs_${selectedDateKey}`);
      setExerciseLogs(savedExercises ? JSON.parse(savedExercises) : []);
    } catch {
      setExerciseLogs([]);
    }

    try {
      const savedWater = localStorage.getItem(`ironlog_water_${selectedDateKey}`);
      setWaterIntakeCurrent(savedWater ? Number(savedWater) : 0);
    } catch {
      setWaterIntakeCurrent(0);
    }
  }, [selectedDateKey]);

  // Modal 狀態
  const [showRecalcModal, setShowRecalcModal] = useState(false);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showMonthCalendarModal, setShowMonthCalendarModal] = useState(false);
  const [showSearchFoodModal, setShowSearchFoodModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showAiMealPlanModal, setShowAiMealPlanModal] = useState(false);
  const [searchModalTerm, setSearchModalTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 週曆與月曆瀏覽日期狀態
  const [viewWeekDate, setViewWeekDate] = useState<Date>(() => parseDateKey(selectedDateKey));
  const [monthViewDate, setMonthViewDate] = useState<Date>(() => parseDateKey(selectedDateKey));

  // AI 專屬餐單狀態
  const [aiMealPlan, setAiMealPlan] = useState<string | null>(() => {
    return localStorage.getItem('ironlog_ai_meal_plan');
  });
  const [isGeneratingMealPlan, setIsGeneratingMealPlan] = useState(false);

  // 當前週的 7 天日期陣列 (週一至週日)
  const weekDays = useMemo(() => {
    const start = startOfWeek(viewWeekDate, { weekStartsOn: 1 });
    const end = endOfWeek(viewWeekDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [viewWeekDate]);

  // 全月曆挑選器當月日期 (含跨月頭尾補齊)
  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthViewDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(monthViewDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [monthViewDate]);

  // 登記曾有紀錄的日期集合 (包含當日有食物紀錄者)
  const recordedDateKeys = useMemo<Set<string>>(() => {
    const set = new Set<string>();
    try {
      const saved = localStorage.getItem('ironlog_diet_recorded_dates');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) {
          arr.forEach((k: string) => set.add(k));
        }
      }
    } catch {}
    if (foodLogs.length > 0) {
      set.add(selectedDateKey);
    }
    return set;
  }, [foodLogs.length, selectedDateKey]);

  // 重新計算表單狀態
  const [recalcForm, setRecalcForm] = useState({
    weight: latest.weight || 75,
    targetWeight: globalGoal.targetWeight || latest.weight || 75,
    height: latest.height || 178,
    age: latest.age || 26,
    gender: latest.gender || 'male',
    goalType: globalGoal.type || 'maintain',
    activityLevel: globalGoal.activityLevel || 1.55,
    proteinRatio: globalGoal.proteinRatio || 35,
    carbRatio: globalGoal.carbRatio || 25,
    fatRatio: globalGoal.fatRatio || 40
  });

  // 手動新增食物表單
  const [foodForm, setFoodForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    mealType: 'lunch' as 'breakfast' | 'lunch' | 'dinner' | 'snack'
  });

  // 運動消耗表單
  const [exerciseForm, setExerciseForm] = useState({
    name: '重量訓練 (重訓)',
    durationMins: '60',
    caloriesBurned: '320'
  });

  // StoreKit Pro 權限狀態與 Paywall
  const entitlement = useEntitlement();
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<{ title: string; desc: string }>({
    title: 'IronLog Pro',
    desc: ''
  });

  // AI 掃描與相片分析
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(() => {
    const saved = localStorage.getItem('ironlog_last_food_analysis');
    return saved ? sanitizeFoodAnalysisText(saved) : null;
  });
  const [isCurrentAnalysisAdded, setIsCurrentAnalysisAdded] = useState<boolean>(() => {
    try {
      const lastAnalysis = localStorage.getItem('ironlog_last_food_analysis');
      const lastAdded = localStorage.getItem('ironlog_last_food_analysis_added');
      return !!(lastAnalysis && lastAdded && lastAdded === lastAnalysis);
    } catch {
      return false;
    }
  });

  const parsedFood = useMemo(() => {
    return analysisResult ? parseFoodAnalysisResult(analysisResult) : null;
  }, [analysisResult]);

  const [supermarketSearch, setSupermarketSearch] = useState('');

  // 儲存當前選取日期的飲食與運動紀錄
  useEffect(() => {
    localStorage.setItem(`ironlog_food_logs_${selectedDateKey}`, JSON.stringify(foodLogs));
    if (foodLogs.length > 0) {
      trackRecordedDate(selectedDateKey);
    }
  }, [foodLogs, selectedDateKey]);

  useEffect(() => {
    localStorage.setItem(`ironlog_exercise_logs_${selectedDateKey}`, JSON.stringify(exerciseLogs));
    if (exerciseLogs.length > 0) {
      trackRecordedDate(selectedDateKey);
    }
  }, [exerciseLogs, selectedDateKey]);

  useEffect(() => {
    localStorage.setItem(`ironlog_water_${selectedDateKey}`, String(waterIntakeCurrent));
  }, [waterIntakeCurrent, selectedDateKey]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 目標熱量 (TDEE / 每日目標)
  const targetCalories = useMemo(() => {
    const w = latest.weight > 0 ? latest.weight : 75;
    const h = latest.height > 0 ? latest.height : 178;
    const a = latest.age > 0 ? latest.age : 26;
    const cal = calculateSuggestedCalories(w, h, a, latest.gender, globalGoal.type, globalGoal.activityLevel);
    return cal || 2941;
  }, [latest, globalGoal]);

  // 目標三大營養素 (克數)
  const targetMacros = useMemo(() => {
    const w = latest.weight > 0 ? latest.weight : 75;
    const pRatio = globalGoal.proteinRatio || 35;
    const cRatio = globalGoal.carbRatio || 25;
    const fRatio = globalGoal.fatRatio || 40;

    return calculateMacros(targetCalories, w, globalGoal.type, {
      protein: pRatio,
      carbs: cRatio,
      fats: fRatio
    });
  }, [targetCalories, latest.weight, globalGoal]);

  // 已攝取三大營養素與熱量
  const consumed = useMemo(() => {
    return foodLogs.reduce((acc, item) => {
      acc.calories += item.calories;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fat += item.fat;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [foodLogs]);

  // 運動消耗總大卡
  const totalBurnedCalories = useMemo(() => {
    return exerciseLogs.reduce((acc, item) => acc + item.caloriesBurned, 0);
  }, [exerciseLogs]);

  // 剩餘可攝取大卡 = 目標熱量 - 已攝取 + 運動消耗
  const remainingCalories = useMemo(() => {
    return Math.round(targetCalories - consumed.calories + totalBurnedCalories);
  }, [targetCalories, consumed.calories, totalBurnedCalories]);

  // 剩餘三大營養素 (克數)
  const remainingMacros = useMemo(() => {
    return {
      protein: Number(Math.max(0, targetMacros.protein - consumed.protein).toFixed(1)),
      carbs: Number(Math.max(0, targetMacros.carbs - consumed.carbs).toFixed(1)),
      fat: Number(Math.max(0, targetMacros.fats - consumed.fat).toFixed(1))
    };
  }, [targetMacros, consumed]);

  // 每日目標飲水量
  const targetWaterIntake = useMemo(() => {
    const w = latest.weight > 0 ? latest.weight : 75;
    return calculateWaterIntake(w);
  }, [latest.weight]);

  // 處理重新計算儲存
  const handleSaveRecalculation = () => {
    const updatedGoal: UserGoal = {
      ...globalGoal,
      type: recalcForm.goalType as any,
      targetWeight: Number(recalcForm.targetWeight) || Number(recalcForm.weight) || 75,
      activityLevel: recalcForm.activityLevel as any,
      proteinRatio: entitlement.isPro ? recalcForm.proteinRatio : (globalGoal.proteinRatio || 35),
      carbRatio: entitlement.isPro ? recalcForm.carbRatio : (globalGoal.carbRatio || 25),
      fatRatio: entitlement.isPro ? recalcForm.fatRatio : (globalGoal.fatRatio || 40)
    };
    setGlobalGoal(updatedGoal);
    localStorage.setItem('ironlog_v3_goal', JSON.stringify(updatedGoal));

    const updatedMetric: BodyMetric = {
      ...latest,
      id: latest.id || crypto.randomUUID(),
      date: Date.now(),
      weight: Number(recalcForm.weight),
      height: Number(recalcForm.height),
      age: Number(recalcForm.age),
      gender: recalcForm.gender as any
    };
    const newMetrics = [updatedMetric, ...bodyMetrics.filter(m => m.id !== latest.id)];
    setBodyMetrics(newMetrics);
    localStorage.setItem('ironlog_v3_metrics', JSON.stringify(newMetrics));

    setShowRecalcModal(false);
    showToast('已更新每日熱量與目標體重！');
  };

  // 手動新增食物
  const handleAddFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodForm.name.trim()) return;

    const newItem: FoodItem = {
      id: crypto.randomUUID(),
      name: foodForm.name.trim(),
      calories: Number(foodForm.calories) || 0,
      protein: Number(foodForm.protein) || 0,
      carbs: Number(foodForm.carbs) || 0,
      fat: Number(foodForm.fat) || 0,
      mealType: foodForm.mealType,
      timestamp: Date.now(),
      dateKey: selectedDateKey
    };

    setFoodLogs(prev => [newItem, ...prev]);
    setFoodForm({ name: '', calories: '', protein: '', carbs: '', fat: '', mealType: 'lunch' });
    setShowAddFoodModal(false);
    showToast(`已加入「${newItem.name}」(${newItem.calories} kcal)`);
  };

  // 手動新增運動消耗
  const handleAddExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseForm.name.trim()) return;

    const newItem: ExerciseBurnItem = {
      id: crypto.randomUUID(),
      name: exerciseForm.name.trim(),
      durationMins: Number(exerciseForm.durationMins) || 30,
      caloriesBurned: Number(exerciseForm.caloriesBurned) || 200,
      timestamp: Date.now()
    };

    setExerciseLogs(prev => [newItem, ...prev]);
    setShowAddExerciseModal(false);
    showToast(`已記錄運動消耗 +${newItem.caloriesBurned} 大卡！`);
  };

  // 刪除紀錄
  const handleDeleteFoodItem = (id: string) => {
    setFoodLogs(prev => prev.filter(item => item.id !== id));
  };

  const handleDeleteExerciseItem = (id: string) => {
    setExerciseLogs(prev => prev.filter(item => item.id !== id));
  };

  // 分享/匯出今日營養攝取
  const handleShareMacros = () => {
    const summaryText = `【IronLog 今日營養攝取】\n` +
      `🔥 每日目標熱量：${targetCalories} kcal\n` +
      `🍽️ 已攝取：${consumed.calories} kcal (${Math.round((consumed.calories / targetCalories) * 100)}%)\n` +
      `⚡ 運動消耗：+${totalBurnedCalories} kcal\n` +
      `✨ 剩餘可攝取：${remainingCalories} kcal\n` +
      `───────────────\n` +
      `🥩 蛋白質：${consumed.protein}g / ${targetMacros.protein}g (剩餘 ${remainingMacros.protein}g)\n` +
      `🍚 碳水化合物：${consumed.carbs}g / ${targetMacros.carbs}g (剩餘 ${remainingMacros.carbs}g)\n` +
      `🥑 脂肪：${consumed.fat}g / ${targetMacros.fats}g (剩餘 ${remainingMacros.fat}g)\n` +
      `💧 今日飲水：${waterIntakeCurrent}ml / ${targetWaterIntake}ml`;

    navigator.clipboard.writeText(summaryText);
    showToast('已複製今日營養攝取摘要至剪貼簿！');
  };

  // 產生/重新產生 AI 專屬飲食建議餐單
  const handleGenerateMealPlan = async () => {
    if (isGeneratingMealPlan) return;
    if (!entitlement.isPro) {
      setPaywallFeature({
        title: 'AI 專屬增肌減脂餐單',
        desc: '升級 IronLog Pro 即可享有 AI 根據個人 TDEE 與目標量身規劃每日專屬飲食課表。'
      });
      setShowPaywall(true);
      return;
    }
    setIsGeneratingMealPlan(true);
    try {
      const plan = await generateDietarySuggestions(latest, globalGoal);
      setAiMealPlan(plan);
      localStorage.setItem('ironlog_ai_meal_plan', plan);
      setShowAiMealPlanModal(true);
      showToast('AI 專屬餐單生成完成！');
    } catch (e) {
      console.error(e);
      showToast('AI 餐單生成失敗，請稍後再試');
    } finally {
      setIsGeneratingMealPlan(false);
    }
  };

  // 圖片 AI 辨識分析（加入手機端照片自動適度縮放壓縮，避免數位相機原始 10MB+ 超大圖導致傳輸逾時或記憶體溢出）
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawResult = event.target?.result as string;
        if (!rawResult) return;

        // 使用 Canvas 將手機端高畫質相片等比例縮放至最高邊長 1200px 並轉為高品質 JPEG
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_DIM = 1200;
            let { width, height } = img;
            if (width > MAX_DIM || height > MAX_DIM) {
              if (width > height) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              } else {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
              setSelectedImage(compressedBase64);
              setAnalysisResult(null);
              setIsCurrentAnalysisAdded(false);
              localStorage.removeItem('ironlog_last_food_analysis_added');
              return;
            }
          } catch (err) {
            console.warn('Image compression fallback:', err);
          }
          setSelectedImage(rawResult);
          setAnalysisResult(null);
          setIsCurrentAnalysisAdded(false);
          localStorage.removeItem('ironlog_last_food_analysis_added');
        };
        img.onerror = () => {
          setSelectedImage(rawResult);
          setAnalysisResult(null);
          setIsCurrentAnalysisAdded(false);
          localStorage.removeItem('ironlog_last_food_analysis_added');
        };
        img.src = rawResult;
      };
      reader.readAsDataURL(file);
      // 清除 input 數值，方便連續重拍或選擇同一檔名
      e.target.value = '';
    }
  };

  const handleAnalyzeFood = async () => {
    if (!selectedImage || isAnalyzing) return;
    if (!entitlement.isPro) {
      setPaywallFeature({
        title: 'AI 食物拍照分析',
        desc: '升級 IronLog Pro 即可享有無限次 AI 拍照辨識食物卡路里與三大營養素。'
      });
      setShowPaywall(true);
      return;
    }
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setIsCurrentAnalysisAdded(false);
    localStorage.removeItem('ironlog_last_food_analysis_added');

    const rawResult = await analyzeFoodImage(selectedImage);
    const sanitized = sanitizeFoodAnalysisText(rawResult);
    setAnalysisResult(sanitized);
    localStorage.setItem('ironlog_last_food_analysis', sanitized);
    setIsAnalyzing(false);
  };

  // 加入今日攝取
  const handleAddToDailyIntake = () => {
    if (isCurrentAnalysisAdded) return;
    if (!parsedFood || !parsedFood.isValid) {
      showToast('無法辨識有效熱量數值，請重新拍攝。');
      return;
    }

    const newItem: FoodItem = {
      id: crypto.randomUUID(),
      name: parsedFood.name || 'AI 拍照分析食物',
      calories: parsedFood.calories,
      protein: parsedFood.protein,
      carbs: parsedFood.carbs,
      fat: parsedFood.fat,
      mealType: getCurrentMealType(),
      timestamp: Date.now(),
      dateKey: todayKey,
      isAiAnalyzed: true,
      addedToDaily: true
    };

    // 取得今日最新的紀錄清單並儲存
    let todayFoods: FoodItem[] = [];
    try {
      const saved = localStorage.getItem(`ironlog_food_logs_${todayKey}`);
      if (saved) todayFoods = JSON.parse(saved);
    } catch {}

    const updatedTodayFoods = [newItem, ...todayFoods];
    localStorage.setItem(`ironlog_food_logs_${todayKey}`, JSON.stringify(updatedTodayFoods));
    trackRecordedDate(todayKey);

    // 若使用者目前就在瀏覽今日，即時同步更新畫面；若在歷史日期，切回今日並更新
    if (selectedDateKey === todayKey) {
      setFoodLogs(updatedTodayFoods);
    } else {
      setSelectedDateKey(todayKey);
      setFoodLogs(updatedTodayFoods);
    }

    setIsCurrentAnalysisAdded(true);
    if (analysisResult) {
      localStorage.setItem('ironlog_last_food_analysis_added', analysisResult);
    }
    showToast(`已加入今日攝取 · ${parsedFood.calories} kcal`);
  };

  // 重新拍攝
  const handleRetakePhoto = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setIsCurrentAnalysisAdded(false);
    localStorage.removeItem('ironlog_last_food_analysis');
    localStorage.removeItem('ironlog_last_food_analysis_added');
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 120);
  };

  const handleSelectMacroRatio = (protein: number, carbs: number, fat: number) => {
    if (!entitlement.isPro) {
      setPaywallFeature({
        title: 'TDEE 營養比例自訂',
        desc: '升級 IronLog Pro 即可自由調整高蛋白、低碳水或運動員專屬巨量營養素比例。'
      });
      setShowPaywall(true);
      return;
    }
    setRecalcForm({ ...recalcForm, proteinRatio: protein, carbRatio: carbs, fatRatio: fat });
  };

  // 超市常見健身餐品範本清單
  const supermarketPresets = [
    { name: '義式香草舒肥雞胸肉', brand: '7-ELEVEN / 全家', cal: 165, p: 31.2, c: 1.5, f: 2.8, icon: '🍗' },
    { name: '光泉特濃無糖高纖豆漿 500ml', brand: '便利超商', cal: 168, p: 15.2, c: 7.2, f: 8.4, icon: '🥛' },
    { name: 'ON 金牌乳清蛋白 (1匙)', brand: 'Optimum Nutrition', cal: 130, p: 24.0, c: 3.0, f: 1.5, icon: '⚡' },
    { name: '冰烤熟地瓜 (約 150g)', brand: '全家 / 全聯', cal: 142, p: 2.2, c: 32.5, f: 0.3, icon: '🍠' },
    { name: '茶葉蛋 / 溏心蛋 (1顆)', brand: '便利超商', cal: 75, p: 7.0, c: 1.2, f: 4.8, icon: '🥚' },
    { name: '大成蒜香嫩雞胸肉', brand: '全聯 / 家樂福', cal: 158, p: 29.5, c: 2.0, f: 2.4, icon: '🥩' },
    { name: '即食黑胡椒舒肥嫩肩牛排', brand: '超市冷藏', cal: 210, p: 26.0, c: 1.0, f: 11.2, icon: '🍖' },
    { name: '新鮮香蕉 (中等 1根)', brand: '生鮮水果', cal: 105, p: 1.3, c: 27.0, f: 0.3, icon: '🍌' },
    { name: '鮪魚御飯糰', brand: '7-ELEVEN', cal: 215, p: 6.8, c: 41.2, f: 2.5, icon: '🍙' },
    { name: '特級水煮鮪魚罐頭 (半罐)', brand: '愛之味 / 遠東', cal: 85, p: 18.5, c: 0.5, f: 0.8, icon: '🐟' }
  ];

  const filteredPresets = useMemo(() => {
    if (!supermarketSearch.trim()) return supermarketPresets;
    return supermarketPresets.filter(item => 
      item.name.toLowerCase().includes(supermarketSearch.toLowerCase()) || 
      item.brand.toLowerCase().includes(supermarketSearch.toLowerCase())
    );
  }, [supermarketSearch]);

  const handleAddPresetToToday = (preset: typeof supermarketPresets[0]) => {
    const newItem: FoodItem = {
      id: crypto.randomUUID(),
      name: preset.name,
      calories: preset.cal,
      protein: preset.p,
      carbs: preset.c,
      fat: preset.f,
      mealType: getCurrentMealType(),
      timestamp: Date.now(),
      dateKey: selectedDateKey
    };
    setFoodLogs(prev => [newItem, ...prev]);
    showToast(`已加入「${preset.name}」到攝取紀錄！`);
  };

  // 快速加入食物預設模板
  const quickFoodShortcuts = [
    { name: '舒肥雞胸肉 100g', cal: 130, p: 26, c: 0, f: 2 },
    { name: '水煮蛋 1顆', cal: 75, p: 7, c: 1, f: 5 },
    { name: '乳清蛋白 1份', cal: 130, p: 24, c: 3, f: 1.5 },
    { name: '糙米飯 1碗', cal: 220, p: 5, c: 48, f: 1.2 },
    { name: '無糖豆漿 400ml', cal: 140, p: 12, c: 6, f: 7 }
  ];

  const filteredSearchModalItems = useMemo(() => {
    const all = [
      ...supermarketPresets.map(p => ({
        name: p.name,
        sub: p.brand,
        cal: p.cal,
        p: p.p,
        c: p.c,
        f: p.f,
        icon: p.icon
      })),
      ...quickFoodShortcuts.map(q => ({
        name: q.name,
        sub: '常用健身食物',
        cal: q.cal,
        p: q.p,
        c: q.c,
        f: q.f,
        icon: '🥗'
      }))
    ];
    if (!searchModalTerm.trim()) return all;
    const term = searchModalTerm.toLowerCase();
    return all.filter(item => 
      item.name.toLowerCase().includes(term) || item.sub.toLowerCase().includes(term)
    );
  }, [searchModalTerm]);

  const handleAddCustomItemToToday = (name: string, cal: number, p: number, c: number, f: number) => {
    const newItem: FoodItem = {
      id: crypto.randomUUID(),
      name,
      calories: cal,
      protein: p,
      carbs: c,
      fat: f,
      mealType: getCurrentMealType(),
      timestamp: Date.now(),
      dateKey: selectedDateKey
    };
    setFoodLogs(prev => [newItem, ...prev]);
    showToast(`已加入「${name}」(${cal} kcal)`);
  };

  return (
    <div className="space-y-4 pb-28">
      {/* 頂部大標題：食物分析 (與截圖一致) */}
      <div className="px-1 pt-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">食物分析</h1>
      </div>

      {/* 頂部頁籤切換：營養攝取 vs 超市掃描 (與截圖 100% 一致) */}
      <div className="flex border-b border-black/10 -mx-1 px-1">
        <button
          onClick={() => setActiveSubTab('macros')}
          className={`flex-1 py-3 text-center text-sm font-black transition-all relative ${
            activeSubTab === 'macros'
              ? 'text-[#82CC00]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>營養攝取</span>
          {activeSubTab === 'macros' && (
            <motion.div
              layoutId="dietTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#82CC00]"
            />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('scanner')}
          className={`flex-1 py-3 text-center text-sm font-black transition-all relative ${
            activeSubTab === 'scanner'
              ? 'text-[#82CC00]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>超市掃描</span>
          {activeSubTab === 'scanner' && (
            <motion.div
              layoutId="dietTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#82CC00]"
            />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'macros' ? (
          <motion.div
            key="macros-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* 橫向週曆與「記錄飲食」整合操作區塊 */}
            <div className="bg-white rounded-[28px] p-4 sm:p-5 border border-black/5 shadow-sm space-y-3.5">
              {/* 週曆頂部：年份月份、回到今天、前後週切換、月曆彈窗按鈕 */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    {format(viewWeekDate, 'yyyy年 M月')}
                  </span>
                  {selectedDateKey !== todayKey && (
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        setViewWeekDate(now);
                        setSelectedDateKey(formatDateKey(now));
                      }}
                      className="text-[10px] font-black bg-slate-100 hover:bg-[#CCFF00] hover:text-black text-slate-700 px-2.5 py-1 rounded-full transition-all active:scale-95 shadow-2xs"
                    >
                      回到今天
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewWeekDate(prev => subWeeks(prev, 1))}
                    className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors active:scale-95"
                    title="上一週"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewWeekDate(prev => addWeeks(prev, 1))}
                    className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors active:scale-95"
                    title="下一週"
                  >
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMonthViewDate(parseDateKey(selectedDateKey));
                      setShowMonthCalendarModal(true);
                    }}
                    className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-[#CCFF00]/30 hover:text-black flex items-center justify-center text-slate-700 transition-colors active:scale-95 ml-0.5"
                    title="開啟完整月曆"
                  >
                    <Calendar className="w-4 h-4 text-slate-800" />
                  </button>
                </div>
              </div>

              {/* 橫向 7 天週曆 */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {weekDays.map((day, idx) => {
                  const dayKey = formatDateKey(day);
                  const isSelected = selectedDateKey === dayKey;
                  const hasRecord = recordedDateKeys.has(dayKey);
                  const dayName = ['一', '二', '三', '四', '五', '六', '日'][idx];

                  return (
                    <button
                      key={dayKey}
                      type="button"
                      onClick={() => {
                        setSelectedDateKey(dayKey);
                        setViewWeekDate(day);
                      }}
                      className={`py-2 sm:py-2.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-150 active:scale-95 select-none ${
                        isSelected
                          ? 'bg-[#CCFF00] text-black shadow-xs font-black'
                          : 'bg-slate-50 hover:bg-slate-100/90 text-slate-800 border border-slate-100'
                      }`}
                    >
                      <span className={`text-[11px] mb-1 ${
                        isSelected ? 'text-black/80 font-black' : 'text-slate-500 font-bold'
                      }`}>
                        {dayName}
                      </span>
                      <span className={`text-base sm:text-lg leading-none ${
                        isSelected ? 'text-black font-black' : 'text-slate-900 font-black'
                      }`}>
                        {format(day, 'd')}
                      </span>
                      <div className="h-1.5 mt-1.5 flex items-center justify-center">
                        {hasRecord ? (
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-black' : 'bg-[#82CC00]'
                          }`} />
                        ) : (
                          <span className="w-1.5 h-1.5 opacity-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 「＋ 記錄飲食」按鈕：整合在週曆卡片下方 */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowBottomSheet(true)}
                  className="w-full h-12 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3] text-black" />
                  <span className="tracking-wide">記錄飲食</span>
                </button>
              </div>
            </div>

            {/* 卡片 1：每日熱量目標 (與截圖 100% 結構一致) */}
            <div className="bg-white rounded-[28px] p-6 border border-black/5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight">
                  {selectedDateKey === todayKey ? '每日熱量目標' : `${selectedDateKey} 熱量目標`}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (aiMealPlan) {
                        setShowAiMealPlanModal(true);
                      } else {
                        handleGenerateMealPlan();
                      }
                    }}
                    disabled={isGeneratingMealPlan}
                    className="bg-slate-100 hover:bg-[#CCFF00]/20 text-slate-800 hover:text-black px-3.5 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 shadow-2xs flex items-center gap-1.5"
                  >
                    {isGeneratingMealPlan ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-[#82CC00]" />
                    )}
                    <span>AI 專屬餐單</span>
                  </button>

                  <button
                    onClick={() => {
                      setRecalcForm({
                        weight: latest.weight || 75,
                        targetWeight: globalGoal.targetWeight || latest.weight || 75,
                        height: latest.height || 178,
                        age: latest.age || 26,
                        gender: latest.gender || 'male',
                        goalType: globalGoal.type || 'maintain',
                        activityLevel: globalGoal.activityLevel || 1.55,
                        proteinRatio: globalGoal.proteinRatio || 35,
                        carbRatio: globalGoal.carbRatio || 25,
                        fatRatio: globalGoal.fatRatio || 40
                      });
                      setShowRecalcModal(true);
                    }}
                    className="bg-slate-100 hover:bg-[#CCFF00]/20 text-slate-800 hover:text-black px-3.5 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 shadow-2xs"
                  >
                    重新計算
                  </button>
                </div>
              </div>

              <div>
                <div className="text-5xl font-black text-slate-900 tracking-tight leading-none">
                  {targetCalories}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs font-bold text-slate-500">
                    大卡 / 日
                  </span>
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    目標體重：{globalGoal.targetWeight || latest.weight || 75} kg
                  </span>
                  {globalGoal.targetWeight && latest.weight > 0 && globalGoal.targetWeight !== latest.weight && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      globalGoal.targetWeight < latest.weight ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {globalGoal.targetWeight < latest.weight 
                        ? `目標減重 ${(latest.weight - globalGoal.targetWeight).toFixed(1)} kg` 
                        : `目標增重 ${(globalGoal.targetWeight - latest.weight).toFixed(1)} kg`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 卡片 2：今日營養攝取 (Today's Macros) (與截圖 100% 一致) */}
            <div className="bg-white rounded-[28px] p-6 border border-black/5 shadow-sm space-y-5">
              {/* 頂部標題與分享圖示 */}
              <div className="flex items-center justify-between">
                <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight">
                  {selectedDateKey === todayKey ? "今日營養攝取（Today's Macros）" : `${selectedDateKey} 營養攝取`}
                </h2>
                <button
                  onClick={handleShareMacros}
                  title="分享今日營養摘要"
                  className="text-slate-600 hover:text-[#82CC00] p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Share2 className="w-5 h-5 stroke-[2]" />
                </button>
              </div>

              {/* 說明文字 */}
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                依 TDEE 熱量估算三大營養素目標（蛋白 {globalGoal.proteinRatio || 35}% · 碳水 {globalGoal.carbRatio || 25}% · 脂肪 {globalGoal.fatRatio || 40}%）。
              </p>

              {/* 剩餘可攝取大卡 Banner (綠色主題高亮膠囊) */}
              <div className={`rounded-2xl p-4 text-center border transition-all ${
                remainingCalories < -100
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : Math.abs(remainingCalories) <= 100 && consumed.calories > 0
                    ? 'bg-sky-500/10 border-sky-500/30'
                    : 'bg-[#CCFF00]/15 border-[#82CC00]/30'
              }`}>
                <span className="text-sm md:text-base font-black text-slate-900 flex items-center justify-center gap-1.5">
                  <span>🔥</span>
                  <span>
                    {remainingCalories < -100
                      ? `今日已超過目標 ${Math.abs(remainingCalories)} kcal`
                      : Math.abs(remainingCalories) <= 100 && consumed.calories > 0
                        ? `今日熱量已接近目標（已攝取 ${consumed.calories} kcal）`
                        : `今日還有 ${remainingCalories} kcal（剩餘可攝取）`}
                  </span>
                </span>

                {/* 總熱量進度條 */}
                <div className="mt-2.5 space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-600 px-0.5">
                    <span>已攝取 {consumed.calories} kcal</span>
                    <span>目標 {targetCalories} kcal</span>
                  </div>
                  <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        remainingCalories < -100 ? 'bg-amber-500' : 'bg-[#82CC00]'
                      }`}
                      style={{ width: `${Math.min(100, targetCalories > 0 ? (consumed.calories / targetCalories) * 100 : 0)}%` }}
                    />
                  </div>
                </div>

                {totalBurnedCalories > 0 && (
                  <span className="text-[10px] text-slate-600 font-bold mt-1.5 block">
                    (已包含今日運動消耗 +{totalBurnedCalories} 大卡)
                  </span>
                )}
              </div>

              {/* 三大營養素進度條 (蛋白質、碳水、脂肪) */}
              <div className="space-y-4">
                {/* 1. 蛋白質 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-900 text-sm">蛋白質</span>
                    <span className="font-bold text-slate-800">{consumed.protein}g / {targetMacros.protein}g</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold">
                    剩餘：{remainingMacros.protein}g
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#82CC00] rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, targetMacros.protein > 0 ? (consumed.protein / targetMacros.protein) * 100 : 0)}%` }}
                    />
                  </div>
                </div>

                {/* 2. 碳水 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-900 text-sm">碳水</span>
                    <span className="font-bold text-slate-800">{consumed.carbs}g / {targetMacros.carbs}g</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold">
                    剩餘：{remainingMacros.carbs}g
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#82CC00]/80 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, targetMacros.carbs > 0 ? (consumed.carbs / targetMacros.carbs) * 100 : 0)}%` }}
                    />
                  </div>
                </div>

                {/* 3. 脂肪 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-900 text-sm">脂肪</span>
                    <span className="font-bold text-slate-800">{consumed.fat}g / {targetMacros.fats}g</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold">
                    剩餘：{remainingMacros.fat}g
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, targetMacros.fats > 0 ? (consumed.fat / targetMacros.fats) * 100 : 0)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 底部雙按鈕：手動新增 & 運動消耗 (與截圖 100% 一致) */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowAddFoodModal(true)}
                  className="py-3 px-4 rounded-2xl border border-slate-200 hover:border-black bg-white hover:bg-slate-50 text-slate-800 hover:text-black font-black text-xs md:text-sm flex items-center justify-center gap-2 active:scale-98 transition-all shadow-2xs"
                >
                  <Utensils className="w-4 h-4 text-[#82CC00]" />
                  <span>手動新增</span>
                </button>

                <button
                  onClick={() => setShowAddExerciseModal(true)}
                  className="py-3 px-4 rounded-2xl border border-slate-200 hover:border-black bg-white hover:bg-slate-50 text-slate-800 hover:text-black font-black text-xs md:text-sm flex items-center justify-center gap-2 active:scale-98 transition-all shadow-2xs"
                >
                  <Plus className="w-4 h-4 text-[#82CC00]" />
                  <span>運動消耗</span>
                </button>
              </div>
            </div>

            {/* 今日飲水追蹤卡片 */}
            <div className="bg-white rounded-[28px] p-5 border border-black/5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                  <GlassWater className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">今日飲水量</span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {waterIntakeCurrent} ml / {targetWaterIntake} ml 目標
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWaterIntakeCurrent(prev => prev + 250)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-[#CCFF00]/20 rounded-xl text-xs font-black text-slate-800 hover:text-black border border-slate-200 transition-all active:scale-95"
                >
                  +250ml
                </button>
                <button
                  onClick={() => setWaterIntakeCurrent(prev => prev + 500)}
                  className="px-3 py-1.5 bg-[#CCFF00] hover:bg-[#b8e600] rounded-xl text-xs font-black text-black transition-all active:scale-95 shadow-xs"
                >
                  +500ml
                </button>
              </div>
            </div>

            {/* 今日餐點與運動消耗明細記錄清單 */}
            {(foodLogs.length > 0 || exerciseLogs.length > 0) && (
              <div className="bg-white rounded-[28px] p-6 border border-black/5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900">
                    {selectedDateKey === todayKey ? '今日飲食與消耗紀錄' : `${selectedDateKey} 飲食與消耗紀錄`}
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">
                    共 {foodLogs.length} 筆食物 · {exerciseLogs.length} 筆運動
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {/* 食物紀錄 */}
                  {foodLogs.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${item.isAiAnalyzed ? 'bg-amber-500' : 'bg-[#82CC00]'}`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-black text-slate-900 truncate">{item.name}</p>
                            {item.isAiAnalyzed && (
                              <span className="text-[9px] font-black text-black bg-[#CCFF00] px-1.5 py-0.5 rounded-full shrink-0">
                                AI 拍照
                              </span>
                            )}
                            {item.timestamp && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                {new Date(item.timestamp).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                            <span className="text-slate-900 font-black">{item.calories} kcal</span> · 蛋 {item.protein}g · 碳 {item.carbs}g · 脂 {item.fat}g
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteFoodItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors shrink-0"
                        title="刪除紀錄"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* 運動紀錄 */}
                  {exerciseLogs.map((ex) => (
                    <div key={ex.id} className="py-3 flex items-center justify-between text-xs bg-amber-50/40 -mx-3 px-3 rounded-xl">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <div>
                          <p className="font-black text-slate-900">{ex.name} ({ex.durationMins} 分鐘)</p>
                          <p className="text-[10px] text-amber-700 font-bold mt-0.5">
                            運動消耗 +{ex.caloriesBurned} kcal
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteExerciseItem(ex.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors shrink-0"
                        title="刪除紀錄"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* 總攝取彙總欄 */}
                {foodLogs.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-slate-900">
                    <span>當日總攝取</span>
                    <span className="text-sm font-black text-slate-900">{consumed.calories} kcal</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          /* SubTab 2: 超市掃描 & AI 拍照辨識 */
          <motion.div
            key="scanner-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* AI 拍照或上傳食物營養標籤卡片 */}
            <div className="bg-white rounded-[28px] p-6 border border-black/5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-[#CCFF00] shadow-sm">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-black text-slate-900">
                      AI 超市食物／標籤拍照掃描
                    </h3>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                      拍攝商品營養成分表或盤中美食，自動估算熱量與三大營養素
                    </p>
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-[#82CC00]" />
              </div>

              {/* 上傳區域 */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-black rounded-[24px] p-6 text-center cursor-pointer transition-all relative overflow-hidden h-44 flex flex-col justify-center items-center gap-2 bg-slate-50"
              >
                {selectedImage ? (
                  <div className="absolute inset-0 w-full h-full">
                    <img src={selectedImage} alt="Food Upload" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-black flex items-center gap-1.5">
                        <Upload className="w-4 h-4" /> 更換照片
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-11 h-11 rounded-full bg-[#CCFF00]/20 flex items-center justify-center text-black">
                      <Camera className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">點擊拍照或上傳食物照片</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">支援手機相機、相簿與圖片拖曳</p>
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
                  className="w-full h-12 bg-[#CCFF00] hover:bg-[#b8e600] text-black rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : !entitlement.isPro ? (
                    <Lock className="w-4 h-4 text-black stroke-[2.5]" />
                  ) : (
                    <Sparkle className="w-4 h-4 text-black" />
                  )}
                  <span>
                    {isAnalyzing 
                      ? 'AI 正在分析卡路里與三大營養素...' 
                      : entitlement.isPro 
                        ? '開始 AI 辨識分析' 
                        : '🔒 Pro 專屬 · 開始 AI 辨識分析'}
                  </span>
                </button>
              )}

              {/* 分析結果 */}
              <AnimatePresence>
                {(isAnalyzing || analysisResult) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-black text-[#CCFF00] flex items-center justify-center">
                        <Sparkles className="w-3 h-3" />
                      </div>
                      <h4 className="text-xs font-black text-slate-900">AI 營養分析估算</h4>
                    </div>

                    {isAnalyzing ? (
                      <div className="py-6 text-center flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-black" />
                        <p className="text-xs text-slate-500 font-bold">正在比對食品庫數據，計算卡路里與巨量營養素...</p>
                      </div>
                    ) : (
                      <>
                        <div className="prose prose-sm text-slate-800 text-xs leading-relaxed font-medium markdown-body overflow-x-auto whitespace-pre-line">
                          <Markdown>{analysisResult ? sanitizeFoodAnalysisText(analysisResult) : ''}</Markdown>
                        </div>

                        {/* 分析完成後操作按鈕：加入今日攝取 & 重新拍攝 */}
                        {analysisResult && (
                          <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row gap-2.5">
                            {parsedFood && parsedFood.isValid ? (
                              <button
                                type="button"
                                onClick={handleAddToDailyIntake}
                                disabled={isCurrentAnalysisAdded}
                                className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all ${
                                  isCurrentAnalysisAdded
                                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
                                    : 'bg-[#CCFF00] hover:bg-[#b8e600] text-black active:scale-98 shadow-md'
                                }`}
                              >
                                {isCurrentAnalysisAdded ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>✓ 已加入今日攝取</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4 stroke-[3]" />
                                    <span>＋ 加入今日攝取</span>
                                  </>
                                )}
                              </button>
                            ) : null}

                            <button
                              type="button"
                              onClick={handleRetakePhoto}
                              className="flex-1 py-3 px-4 rounded-2xl font-black text-xs md:text-sm bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center gap-2 active:scale-98 transition-all shadow-2xs"
                            >
                              <RefreshCw className="w-4 h-4" />
                              <span>↻ 重新拍攝</span>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 超市／超商常見健身高蛋白餐點快速檢索庫 */}
            <div className="bg-white rounded-[28px] p-6 border border-black/5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm md:text-base font-black text-slate-900">
                    超商／超市熱門健身餐品庫
                  </h3>
                  <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                    一鍵快速加入今日營養攝取
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <ScanBarcode className="w-4 h-4" />
                </div>
              </div>

              {/* 搜尋欄 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜尋雞胸肉、豆漿、地瓜、乳清..."
                  value={supermarketSearch}
                  onChange={(e) => setSupermarketSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-black"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>

              {/* 餐品列表 */}
              <div className="grid grid-cols-1 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {filteredPresets.map((preset, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-300 bg-slate-50/70 hover:bg-white flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{preset.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black text-slate-900 truncate">{preset.name}</h4>
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded shrink-0">
                            {preset.brand}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#82CC00] font-black mt-0.5">
                          {preset.cal} kcal · <span className="text-slate-700 font-bold">蛋白質 {preset.p}g · 碳水 {preset.c}g · 脂肪 {preset.f}g</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddPresetToToday(preset)}
                      className="px-3 py-1.5 bg-[#CCFF00] hover:bg-[#b8e600] active:scale-95 text-black font-black text-xs rounded-xl shadow-xs shrink-0 flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>加入</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal 1: 重新計算 TDEE & 每日熱量與三大營養素目標 */}
      <AnimatePresence>
        {showRecalcModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#CCFF00]/20 flex items-center justify-center text-black">
                    <Flame className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">重新計算熱量與營養目標</h3>
                </div>
                <button
                  onClick={() => setShowRecalcModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3.5 text-xs font-bold text-slate-700">
                {/* 性別 */}
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">生理性別</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRecalcForm({ ...recalcForm, gender: 'male' })}
                      className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                        recalcForm.gender === 'male'
                          ? 'bg-[#CCFF00] text-black border-[#82CC00]'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      男性
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecalcForm({ ...recalcForm, gender: 'female' })}
                      className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                        recalcForm.gender === 'female'
                          ? 'bg-[#CCFF00] text-black border-[#82CC00]'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      女性
                    </button>
                  </div>
                </div>

                {/* 體重數據：目前體重 & 目標體重 */}
                <div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">目前體重 (KG)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={recalcForm.weight}
                        onChange={(e) => setRecalcForm({ ...recalcForm, weight: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-center text-slate-900 outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#82CC00] font-black mb-1">目標體重 (KG)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={recalcForm.targetWeight}
                        onChange={(e) => setRecalcForm({ ...recalcForm, targetWeight: Number(e.target.value) })}
                        className="w-full bg-[#CCFF00]/10 border border-[#82CC00]/50 rounded-xl p-2.5 font-black text-center text-slate-900 outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  {/* 體重差距動態提示 */}
                  {recalcForm.weight > 0 && recalcForm.targetWeight > 0 && (
                    <div className="mt-1.5 text-center">
                      <span className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        recalcForm.targetWeight < recalcForm.weight 
                          ? 'bg-sky-100 text-sky-700' 
                          : recalcForm.targetWeight > recalcForm.weight
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        {recalcForm.targetWeight < recalcForm.weight
                          ? `目標減重 ${(recalcForm.weight - recalcForm.targetWeight).toFixed(1)} KG`
                          : recalcForm.targetWeight > recalcForm.weight
                            ? `目標增重 ${(recalcForm.targetWeight - recalcForm.weight).toFixed(1)} KG`
                            : '維持當前體重'}
                      </span>
                    </div>
                  )}
                </div>

                {/* 身高 & 年齡 */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">身高 (CM)</label>
                    <input
                      type="number"
                      value={recalcForm.height}
                      onChange={(e) => setRecalcForm({ ...recalcForm, height: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-center text-slate-900 outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">年齡 (歲)</label>
                    <input
                      type="number"
                      value={recalcForm.age}
                      onChange={(e) => setRecalcForm({ ...recalcForm, age: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-center text-slate-900 outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* 目標型態 */}
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">體態目標</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: '減脂 (-500)', val: 'cut' },
                      { label: '維持', val: 'maintain' },
                      { label: '增肌 (+300)', val: 'bulk' }
                    ].map(opt => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setRecalcForm({ ...recalcForm, goalType: opt.val as any })}
                        className={`py-2 rounded-xl font-bold border transition-all text-xs ${
                          recalcForm.goalType === opt.val
                            ? 'bg-[#CCFF00] text-black border-[#82CC00]'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 日常活動量係數 */}
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">日常活動量係數</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: '久坐 (1.2)', val: 1.2 },
                      { label: '輕度 (1.375)', val: 1.375 },
                      { label: '中度 (1.55)', val: 1.55 },
                      { label: '高度 (1.725)', val: 1.725 },
                    ].map(act => (
                      <button
                        key={act.val}
                        type="button"
                        onClick={() => setRecalcForm({ ...recalcForm, activityLevel: act.val as any })}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                          recalcForm.activityLevel === act.val
                            ? 'bg-black text-white border-black'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 三大營養素比例 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] text-slate-500 font-bold">
                      三大營養素比例 (蛋白 {recalcForm.proteinRatio}% · 碳水 {recalcForm.carbRatio}% · 脂肪 {recalcForm.fatRatio}%)
                    </label>
                    {!entitlement.isPro && (
                      <span className="text-[10px] font-black text-black bg-[#CCFF00] px-2 py-0.5 rounded-full flex items-center gap-1 border border-black/10">
                        <Lock className="w-2.5 h-2.5 stroke-[2.5]" /> Pro
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectMacroRatio(35, 25, 40)}
                      className={`py-1.5 rounded-xl border text-[10px] font-bold transition-all relative ${
                        recalcForm.proteinRatio === 35 && recalcForm.carbRatio === 25
                          ? 'bg-black text-white border-black'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      高蛋白低碳 35/25/40
                      {!entitlement.isPro && !(recalcForm.proteinRatio === 35 && recalcForm.carbRatio === 25) && (
                        <Lock className="w-2.5 h-2.5 absolute top-1 right-1 text-slate-400" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectMacroRatio(30, 45, 25)}
                      className={`py-1.5 rounded-xl border text-[10px] font-bold transition-all relative ${
                        recalcForm.proteinRatio === 30 && recalcForm.carbRatio === 45
                          ? 'bg-black text-white border-black'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      均衡增肌 30/45/25
                      {!entitlement.isPro && (
                        <Lock className="w-2.5 h-2.5 absolute top-1 right-1 text-slate-400" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectMacroRatio(40, 35, 25)}
                      className={`py-1.5 rounded-xl border text-[10px] font-bold transition-all relative ${
                        recalcForm.proteinRatio === 40
                          ? 'bg-black text-white border-black'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      運動員 40/35/25
                      {!entitlement.isPro && (
                        <Lock className="w-2.5 h-2.5 absolute top-1 right-1 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 即時試算結果預覽卡 */}
                <div className="bg-[#CCFF00]/15 p-3 rounded-2xl border border-[#82CC00]/30 text-center">
                  <span className="text-[10px] font-bold text-slate-600 block">依據設定即時試算每日目標熱量</span>
                  <span className="text-xl font-black text-slate-900 mt-0.5 block">
                    {calculateSuggestedCalories(
                      Number(recalcForm.weight) || 75,
                      Number(recalcForm.height) || 178,
                      Number(recalcForm.age) || 26,
                      recalcForm.gender as any,
                      recalcForm.goalType as any,
                      recalcForm.activityLevel || 1.55
                    )} <span className="text-xs font-bold text-slate-600">kcal / 日</span>
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecalcModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-xs"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveRecalculation}
                  className="flex-1 py-3 bg-[#CCFF00] text-black font-black rounded-2xl text-xs hover:bg-[#b8e600] shadow-md"
                >
                  儲存並更新
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal 2: 手動新增食物攝取 */}
      <AnimatePresence>
        {showAddFoodModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#CCFF00]/20 flex items-center justify-center text-black">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">手動記錄食物營養</h3>
                </div>
                <button
                  onClick={() => setShowAddFoodModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold"
                >
                  ✕
                </button>
              </div>

              {/* 快速填寫範本 */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5">快速常用範本：</label>
                <div className="flex flex-wrap gap-1.5">
                  {quickFoodShortcuts.map((sc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setFoodForm({
                          ...foodForm,
                          name: sc.name,
                          calories: String(sc.cal),
                          protein: String(sc.p),
                          carbs: String(sc.c),
                          fat: String(sc.f)
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#CCFF00]/30 text-[11px] font-bold text-slate-800 transition-colors"
                    >
                      {sc.name}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAddFoodSubmit} className="space-y-3">
                {/* 食物名稱 */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">食物名稱</label>
                  <input
                    type="text"
                    required
                    placeholder="例如：舒肥雞胸肉配糙米飯"
                    value={foodForm.name}
                    onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-black"
                  />
                </div>

                {/* 卡路里 */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">總熱量 (kcal)</label>
                  <input
                    type="number"
                    required
                    placeholder="例如：350"
                    value={foodForm.calories}
                    onChange={(e) => setFoodForm({ ...foodForm, calories: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-black"
                  />
                </div>

                {/* 三大營養素 */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#82CC00] mb-1">蛋白質 (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={foodForm.protein}
                      onChange={(e) => setFoodForm({ ...foodForm, protein: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#82CC00] mb-1">碳水 (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={foodForm.carbs}
                      onChange={(e) => setFoodForm({ ...foodForm, carbs: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-amber-600 mb-1">脂肪 (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={foodForm.fat}
                      onChange={(e) => setFoodForm({ ...foodForm, fat: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900 text-center"
                    />
                  </div>
                </div>

                {/* 餐別 */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">餐別</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: '早餐', val: 'breakfast' },
                      { label: '午餐', val: 'lunch' },
                      { label: '晚餐', val: 'dinner' },
                      { label: '點心', val: 'snack' }
                    ].map(t => (
                      <button
                        key={t.val}
                        type="button"
                        onClick={() => setFoodForm({ ...foodForm, mealType: t.val as any })}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          foodForm.mealType === t.val
                            ? 'bg-black text-white border-black'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddFoodModal(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-xs"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#CCFF00] text-black font-black rounded-2xl text-xs hover:bg-[#b8e600] shadow-md"
                  >
                    加入今日紀錄
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal 3: 運動消耗登記 */}
      <AnimatePresence>
        {showAddExerciseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">記錄運動熱量消耗</h3>
                </div>
                <button
                  onClick={() => setShowAddExerciseModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold"
                >
                  ✕
                </button>
              </div>

              {/* 快速運動項目選擇 */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5">常見運動項目：</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { name: '重量訓練', min: 60, cal: 320 },
                    { name: '跑步 (有氧)', min: 30, cal: 280 },
                    { name: '單車 (騎行)', min: 45, cal: 300 },
                    { name: '游泳', min: 45, cal: 350 },
                    { name: 'HIIT 間歇', min: 25, cal: 260 },
                    { name: '健走散步', min: 40, cal: 160 }
                  ].map((ex, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setExerciseForm({
                          name: ex.name,
                          durationMins: String(ex.min),
                          caloriesBurned: String(ex.cal)
                        });
                      }}
                      className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-[11px] font-bold text-slate-800 transition-colors text-center"
                    >
                      {ex.name}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAddExerciseSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">運動名稱</label>
                  <input
                    type="text"
                    required
                    value={exerciseForm.name}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">運動時間 (分鐘)</label>
                    <input
                      type="number"
                      required
                      value={exerciseForm.durationMins}
                      onChange={(e) => setExerciseForm({ ...exerciseForm, durationMins: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-amber-600 mb-1">消耗熱量 (kcal)</label>
                    <input
                      type="number"
                      required
                      value={exerciseForm.caloriesBurned}
                      onChange={(e) => setExerciseForm({ ...exerciseForm, caloriesBurned: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 text-center"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddExerciseModal(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-xs"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#CCFF00] text-black font-black rounded-2xl text-xs hover:bg-[#b8e600] shadow-md"
                  >
                    確認增加額度
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部彈出選單 (Bottom Sheet): 記錄飲食 5 大入口 */}
      <AnimatePresence>
        {showBottomSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBottomSheet(false)}
            className="fixed inset-0 bg-black/60 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-[32px] sm:rounded-[32px] p-6 max-w-md w-full shadow-2xl space-y-4 pb-10 sm:pb-6"
            >
              {/* 頂部拉桿 (Mobile) 與標題 */}
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto sm:hidden mb-2" />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">記錄飲食</h3>
                  <p className="text-[11px] text-slate-400 font-bold mt-0.5">選擇記錄方式快速登錄餐點營養</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBottomSheet(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 2 欄網格按鈕排版 */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* 1. 拍照辨識 */}
                <button
                  type="button"
                  onClick={() => {
                    setShowBottomSheet(false);
                    setActiveSubTab('scanner');
                    setTimeout(() => fileInputRef.current?.click(), 160);
                  }}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-[#CCFF00]/20 border border-slate-200/80 flex flex-col items-center justify-center text-center gap-2 group active:scale-95 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-black text-[#CCFF00] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">拍照辨識</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">AI 影像智能分析</span>
                  </div>
                </button>

                {/* 2. 搜尋食物 */}
                <button
                  type="button"
                  onClick={() => {
                    setShowBottomSheet(false);
                    setShowSearchFoodModal(true);
                  }}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-[#CCFF00]/20 border border-slate-200/80 flex flex-col items-center justify-center text-center gap-2 group active:scale-95 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">搜尋食物</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">熱門餐品庫檢索</span>
                  </div>
                </button>

                {/* 3. 我的最愛 */}
                <button
                  type="button"
                  onClick={() => {
                    setShowBottomSheet(false);
                    setShowFavoritesModal(true);
                  }}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-[#CCFF00]/20 border border-slate-200/80 flex flex-col items-center justify-center text-center gap-2 group active:scale-95 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <Star className="w-6 h-6 fill-white" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">我的最愛</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">常用快速範本</span>
                  </div>
                </button>

                {/* 4. 掃描條碼 */}
                <button
                  type="button"
                  onClick={() => {
                    setShowBottomSheet(false);
                    setActiveSubTab('scanner');
                  }}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-[#CCFF00]/20 border border-slate-200/80 flex flex-col items-center justify-center text-center gap-2 group active:scale-95 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <ScanBarcode className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">掃描條碼</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">超市食品成分掃描</span>
                  </div>
                </button>

                {/* 5. 手動輸入 */}
                <button
                  type="button"
                  onClick={() => {
                    setShowBottomSheet(false);
                    setShowAddFoodModal(true);
                  }}
                  className="col-span-2 p-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white flex items-center justify-center gap-2 active:scale-98 transition-all shadow-xs"
                >
                  <Utensils className="w-4 h-4 text-[#CCFF00]" />
                  <span className="text-xs font-black">手動輸入食物熱量與營養素</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: 完整月曆選擇器 */}
      <AnimatePresence>
        {showMonthCalendarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-slate-900" />
                  <h3 className="text-base font-black text-slate-900">
                    {format(monthViewDate, 'yyyy年 M月')}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setMonthViewDate(prev => subMonths(prev, 1))}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                    title="上個月"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonthViewDate(prev => addMonths(prev, 1))}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                    title="下個月"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMonthCalendarModal(false)}
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold ml-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 星期標題 */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-black text-slate-400">
                {['一', '二', '三', '四', '五', '六', '日'].map(w => (
                  <div key={w} className="py-1">{w}</div>
                ))}
              </div>

              {/* 日期格子 */}
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((day) => {
                  const dayKey = formatDateKey(day);
                  const isCurrentMonth = isSameMonth(day, monthViewDate);
                  const isSelected = selectedDateKey === dayKey;
                  const hasRecord = recordedDateKeys.has(dayKey);

                  return (
                    <button
                      key={dayKey}
                      type="button"
                      onClick={() => {
                        setSelectedDateKey(dayKey);
                        setViewWeekDate(day);
                        setShowMonthCalendarModal(false);
                      }}
                      className={`h-10 rounded-xl flex flex-col items-center justify-center transition-all relative ${
                        isSelected
                          ? 'bg-[#CCFF00] text-black font-black shadow-xs'
                          : isCurrentMonth
                            ? 'hover:bg-slate-100 text-slate-900 font-bold'
                            : 'text-slate-300 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <span className="text-xs leading-none">{format(day, 'd')}</span>
                      <div className="h-1 mt-0.5 flex items-center justify-center">
                        {hasRecord ? (
                          <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-black' : 'bg-[#82CC00]'}`} />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-between items-center text-[11px] font-bold text-slate-500 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    setSelectedDateKey(formatDateKey(now));
                    setViewWeekDate(now);
                    setMonthViewDate(now);
                    setShowMonthCalendarModal(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#CCFF00] hover:text-black text-slate-800 transition-colors"
                >
                  回到今天
                </button>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#82CC00]" />
                  <span>有飲食紀錄</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: 搜尋食物 */}
      <AnimatePresence>
        {showSearchFoodModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                    <Search className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">搜尋食物資料庫</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSearchFoodModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 搜尋列 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="輸入食物名稱 (例: 雞胸肉、豆漿、地瓜)..."
                  value={searchModalTerm}
                  onChange={(e) => setSearchModalTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-black"
                  autoFocus
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                {searchModalTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchModalTerm('')}
                    className="w-4 h-4 text-slate-400 hover:text-black absolute right-3 top-3"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 搜尋結果列表 */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
                {filteredSearchModalItems.length > 0 ? (
                  filteredSearchModalItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl border border-slate-100 hover:border-slate-300 bg-slate-50/70 hover:bg-white flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0">{item.icon}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-900 truncate">{item.name}</h4>
                          <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                            <span className="text-slate-900 font-black">{item.cal} kcal</span> · 蛋 {item.p}g · 碳 {item.c}g · 脂 {item.f}g
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleAddCustomItemToToday(item.name, item.cal, item.p, item.c, item.f);
                        }}
                        className="px-2.5 py-1.5 bg-[#CCFF00] hover:bg-[#b8e600] active:scale-95 text-black font-black text-xs rounded-xl shadow-xs shrink-0 flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>加入</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center space-y-2">
                    <p className="text-xs text-slate-400 font-bold">找不到相符食物</p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSearchFoodModal(false);
                        setFoodForm(prev => ({ ...prev, name: searchModalTerm }));
                        setShowAddFoodModal(true);
                      }}
                      className="text-xs font-black text-slate-900 underline"
                    >
                      手動新增「{searchModalTerm}」
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowSearchFoodModal(false);
                    setShowAddFoodModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>找不到？切換至手動輸入</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: 我的最愛常用範本 */}
      <AnimatePresence>
        {showFavoritesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <Star className="w-4 h-4 fill-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">我的最愛食物</h3>
                    <p className="text-[10px] text-slate-400 font-bold">高蛋白乾淨飲食一鍵登錄</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFavoritesModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {quickFoodShortcuts.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-300 bg-slate-50/70 hover:bg-white flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-500 text-xs">★</span>
                        <h4 className="text-xs font-black text-slate-900 truncate">{item.name}</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                        <span className="text-slate-900 font-black">{item.cal} kcal</span> · 蛋白 {item.p}g · 碳水 {item.c}g · 脂肪 {item.f}g
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleAddCustomItemToToday(item.name, item.cal, item.p, item.c, item.f);
                      }}
                      className="px-3 py-1.5 bg-[#CCFF00] hover:bg-[#b8e600] active:scale-95 text-black font-black text-xs rounded-xl shadow-xs shrink-0 flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>登錄</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowFavoritesModal(false);
                    setShowAddFoodModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>新增其他自訂食物</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: AI 專屬餐單規劃 */}
      <AnimatePresence>
        {showAiMealPlanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[88vh] flex flex-col"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-black text-[#CCFF00] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">AI 專屬增肌減脂餐單</h3>
                    <p className="text-[10px] text-slate-400 font-bold">量身推薦一日餐點與巨量營養比例</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAiMealPlanModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium prose prose-sm max-w-none">
                {isGeneratingMealPlan ? (
                  <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-black" />
                    <p className="text-xs text-slate-500 font-bold">正在為您計算個人化餐單...</p>
                  </div>
                ) : aiMealPlan ? (
                  <Markdown>{aiMealPlan}</Markdown>
                ) : (
                  <p className="text-slate-400 text-center py-8">尚無餐單，請點擊下方按鈕開始生成</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleGenerateMealPlan}
                  disabled={isGeneratingMealPlan}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  {isGeneratingMealPlan ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>重新規劃餐單</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAiMealPlanModal(false)}
                  className="flex-1 py-3 bg-[#CCFF00] text-black font-black rounded-2xl text-xs hover:bg-[#b8e600] shadow-md transition-colors"
                >
                  確認
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 提示 Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[2000] bg-black text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-white/10"
          >
            <Check className="w-4 h-4 text-[#CCFF00]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pro 訂閱 Paywall */}
      <ProPaywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        featureTitle={paywallFeature.title}
        featureDescription={paywallFeature.desc}
      />
    </div>
  );
};
