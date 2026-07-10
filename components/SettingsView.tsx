import React, { useContext, useMemo, useState, useRef } from 'react';
import { AppContext } from '../App';
import { 
  User, Camera, Edit3, Check, Award, Trophy, Crown, Flame, Sparkles, Calendar,
  Globe, Scale, Download, Trash2, ShieldCheck, CreditCard, ChevronRight, CheckCircle2,
  Lock, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { lightTheme } from '../themeStyles';

export const SettingsView: React.FC = () => {
  const context = useContext(AppContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const history = context?.history || [];
  
  // Name and Avatar State
  const [profileImage, setProfileImage] = useState<string | null>(() => localStorage.getItem('ironlog_user_avatar'));
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('ironlog_user_name') || '鋼鐵健身者');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  // Preference State
  const [weightUnit, setWeightUnit] = useState<string>(() => localStorage.getItem('ironlog_weight_unit') || 'KG');
  const [language, setLanguage] = useState<string>(() => localStorage.getItem('ironlog_language') || 'zh-TW');

  // Modal displays
  const [showLegalModal, setShowLegalModal] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => localStorage.getItem('ironlog_pro_subscribed') === 'true');

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

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    setUserName(nameInput);
    localStorage.setItem('ironlog_user_name', nameInput);
    setIsEditingName(false);
  };

  const handleUnitChange = (unit: string) => {
    setWeightUnit(unit);
    localStorage.setItem('ironlog_weight_unit', unit);
    alert(`偏好單位已切換為 ${unit}！`);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('ironlog_language', lang);
    alert(`語言偏好已變更！`);
  };

  // 累計統計邏輯 (供成就徽章計算)
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

  // 成就徽章規則
  const badges = useMemo(() => [
    {
      id: 'first_workout',
      title: '初試身手',
      desc: '完成 1 次訓練課表',
      rule: '完成 1 次訓練',
      requirement: () => stats.totalWorkouts >= 1,
      icon: Award,
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
    },
    {
      id: 'streak_3',
      title: '持續不懈',
      desc: '累計訓練打卡達 3 天',
      rule: '累計打卡 3 天',
      requirement: () => stats.workoutDays >= 3,
      icon: Calendar,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    },
    {
      id: 'workouts_5',
      title: '熱血愛好者',
      desc: '累計完成 5 次訓練',
      rule: '累計完成 5 次',
      requirement: () => stats.totalWorkouts >= 5,
      icon: Flame,
      color: 'bg-orange-500/10 text-orange-500 border-orange-200',
    },
    {
      id: 'sets_100',
      title: '百煉成鋼',
      desc: '累計完成 100 組動作',
      rule: '累計 100 組動作',
      requirement: () => stats.totalSets >= 100,
      icon: Sparkles,
      color: 'bg-amber-500/10 text-amber-500 border-amber-200',
    },
    {
      id: 'volume_10t',
      title: '重力主宰',
      desc: '累計起重重量達 10,000 kg',
      rule: '累計容量 10 噸',
      requirement: () => stats.totalVolume >= 10000,
      icon: Trophy,
      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    },
    {
      id: 'workouts_15',
      title: '鋼鐵猛獸',
      desc: '累計完成 15 次訓練',
      rule: '累計完成 15 次',
      requirement: () => stats.totalWorkouts >= 15,
      icon: Crown,
      color: 'bg-rose-500/10 text-rose-500 border-rose-200',
    },
  ], [stats]);

  const unlockedCount = useMemo(() => {
    return badges.filter(b => b.requirement()).length;
  }, [badges]);

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      history,
      metrics: localStorage.getItem('ironlog_v3_metrics'),
      goal: localStorage.getItem('ironlog_v3_goal')
    }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `IronLog_Workout_Data_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearCache = () => {
    if (confirm('⚠️ 警告：這將永久清除您的所有訓練歷史紀錄、自訂課表以及身體指標數據，且無法復原！\n\n確定要繼續嗎？')) {
      if (confirm('請再次確認是否真的要刪除全部資料？')) {
        localStorage.clear();
        alert('已清除所有本地資料，頁面即將重新載入。');
        window.location.reload();
      }
    }
  };

  const toggleSubscription = () => {
    const nextSub = !isSubscribed;
    setIsSubscribed(nextSub);
    localStorage.setItem('ironlog_pro_subscribed', String(nextSub));
    alert(nextSub ? '🎉 恭喜！您已成功解鎖 IronLog 專業版 Pro 訂閱！' : '已取消 Pro 專業版訂閱。');
  };

  return (
    <div className="space-y-8 pb-24">
      {/* 頂部名稱與頭像 */}
      <div style={{ backgroundColor: lightTheme.bg }} className="rounded-[44px] p-8 border border-black/5 relative overflow-hidden shadow-xl flex flex-col items-center text-center gap-4">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-24 h-24 rounded-[32px] bg-slate-100 border border-black/5 overflow-hidden flex items-center justify-center shadow-lg relative">
            {profileImage ? (
              <img src={profileImage} alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-slate-400" />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleAvatarUpload} 
          />
        </div>

        <div className="space-y-2">
          {isEditingName ? (
            <div className="flex items-center gap-2 justify-center">
              <input 
                type="text" 
                value={nameInput} 
                onChange={e => setNameInput(e.target.value)}
                autoFocus
                onBlur={handleSaveName}
                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                style={{ color: '#000000' }}
                className="bg-slate-100 border-b border-black text-xl font-black text-center py-1 rounded outline-none w-44"
              />
              <button onClick={handleSaveName} className="p-1 text-[#82CC00]"><Check className="w-5 h-5 stroke-[3]" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 justify-center">
              <h3 style={{ color: lightTheme.text }} className="text-xl font-black uppercase tracking-tight leading-none">{userName}</h3>
              <button onClick={() => setIsEditingName(true)} className="p-1 text-slate-400 hover:text-black"><Edit3 className="w-4 h-4" /></button>
            </div>
          )}
          <p className="text-[10px] font-black text-[#82CC00] uppercase tracking-widest">鋼鐵健身愛好者</p>
        </div>
      </div>

      {/* 成就徽章區塊 */}
      <div style={{ backgroundColor: lightTheme.bg }} className="rounded-[44px] p-8 border border-black/5 relative overflow-hidden shadow-xl space-y-6">
        <div className="flex justify-between items-baseline">
          <div>
            <h3 style={{ color: lightTheme.text }} className="text-[17px] font-black uppercase tracking-tighter leading-none">成就徽章</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">您的訓練里程碑</p>
          </div>
          <span className="text-xs font-black text-black bg-[#CCFF00] px-3.5 py-1 rounded-full shadow-sm border border-black/5">
            解鎖: {unlockedCount} / {badges.length}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge) => {
            const isUnlocked = badge.requirement();
            const IconComponent = badge.icon;
            
            return (
              <div 
                key={badge.id}
                style={{ backgroundColor: lightTheme.card }}
                className={`p-4 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between h-36 ${
                  isUnlocked ? 'border-black/5 shadow-sm' : 'border-dashed border-black/5 opacity-40'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className={`p-2.5 rounded-xl border ${isUnlocked ? badge.color : 'bg-slate-100 text-slate-400 border-transparent'}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  {!isUnlocked && <Lock className="w-4 h-4 text-slate-400" />}
                </div>

                <div>
                  <h4 className="text-[11px] font-black text-black leading-tight uppercase tracking-tight">{badge.title}</h4>
                  <p className="text-[9px] font-medium text-slate-400 mt-1 leading-normal">{badge.desc}</p>
                </div>

                {isUnlocked && (
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#CCFF00]/20 rounded-tl-2xl flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-[#82CC00] stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 偏好設定區塊 */}
      <div style={{ backgroundColor: lightTheme.bg }} className="rounded-[44px] p-8 border border-black/5 relative overflow-hidden shadow-xl space-y-6">
        <div>
          <h3 style={{ color: lightTheme.text }} className="text-[17px] font-black uppercase tracking-tighter leading-none">偏好設定</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">個人操作與計量偏好</p>
        </div>

        <div className="space-y-4">
          {/* 重量單位切換 */}
          <div className="flex items-center justify-between p-4 bg-white border border-black/5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <Scale className="w-4 h-4 text-[#82CC00]" />
              <span className="text-xs font-black text-black">重量計量單位</span>
            </div>
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
              {['KG', 'LBS'].map(unit => (
                <button
                  key={unit}
                  onClick={() => handleUnitChange(unit)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                    weightUnit === unit ? 'bg-black text-white shadow-sm' : 'text-slate-400'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>

          {/* 語言偏好 */}
          <div className="flex items-center justify-between p-4 bg-white border border-black/5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-[#82CC00]" />
              <span className="text-xs font-black text-black">介面顯示語言</span>
            </div>
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
              {[
                { val: 'zh-TW', label: '繁中' },
                { val: 'en', label: 'EN' },
                { val: 'ja', label: '日本語' }
              ].map(langOpt => (
                <button
                  key={langOpt.val}
                  onClick={() => handleLanguageChange(langOpt.val)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                    language === langOpt.val ? 'bg-black text-white shadow-sm' : 'text-slate-400'
                  }`}
                >
                  {langOpt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 支援與資料管理 */}
      <div style={{ backgroundColor: lightTheme.bg }} className="rounded-[44px] p-8 border border-black/5 relative overflow-hidden shadow-xl space-y-6">
        <div>
          <h3 style={{ color: lightTheme.text }} className="text-[17px] font-black uppercase tracking-tighter leading-none">支援與資料</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">雲端資料備份與重設</p>
        </div>

        <div className="space-y-3.5">
          <button 
            onClick={handleExportData}
            className="w-full p-4 bg-white hover:bg-slate-50 border border-black/5 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] shadow-sm text-left group"
          >
            <div className="flex items-center gap-3">
              <Download className="w-4 h-4 text-[#82CC00]" />
              <span className="text-xs font-black text-black">匯出我的訓練紀錄 (JSON)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-black transition-colors" />
          </button>

          <button 
            onClick={handleClearCache}
            className="w-full p-4 bg-white hover:bg-rose-50/20 border border-black/5 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] shadow-sm text-left group"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-black text-rose-500">清除並重設所有本地資料</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
          </button>
        </div>
      </div>

      {/* 法律與訂閱 */}
      <div style={{ backgroundColor: lightTheme.bg }} className="rounded-[44px] p-8 border border-black/5 relative overflow-hidden shadow-xl space-y-6">
        <div>
          <h3 style={{ color: lightTheme.text }} className="text-[17px] font-black uppercase tracking-tighter leading-none">法律與訂閱</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">條款細則與尊榮資格管理</p>
        </div>

        <div className="space-y-4">
          {/* Pro 會員卡 */}
          <div 
            style={{ 
              background: isSubscribed 
                ? 'linear-gradient(135deg, #111111 0%, #333333 100%)' 
                : 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)' 
            }} 
            className="p-6 rounded-3xl relative overflow-hidden shadow-md flex justify-between items-center"
          >
            {isSubscribed && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/10 rounded-full blur-2xl" />
            )}
            
            <div className="space-y-2 relative z-10">
              <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md ${isSubscribed ? 'bg-[#CCFF00] text-black' : 'bg-slate-300 text-black'}`}>
                {isSubscribed ? 'PRO MEMBER' : 'FREE TIER'}
              </span>
              <h4 className={`text-base font-black uppercase ${isSubscribed ? 'text-white' : 'text-black'}`}>
                IronLog 專業版訂閱
              </h4>
              <p className={`text-[10px] ${isSubscribed ? 'text-slate-400' : 'text-slate-500'} font-medium`}>
                {isSubscribed ? '無限 AI 飲食拍照與專屬教練對答中' : '解鎖無限 AI 分析與專業教練對話'}
              </p>
            </div>

            <button
              onClick={toggleSubscription}
              style={{ backgroundColor: isSubscribed ? '#CCFF00' : '#000000', color: isSubscribed ? '#000000' : '#FFFFFF' }}
              className="h-10 px-5 rounded-xl font-black text-[11px] uppercase active:scale-95 transition-all shadow-sm relative z-10"
            >
              {isSubscribed ? '已訂閱' : '立即解鎖'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <button 
              onClick={() => setShowLegalModal('terms')}
              className="py-3 px-4 bg-white border border-black/5 rounded-xl text-[11px] text-black font-black text-center shadow-sm"
            >
              使用者合約 (TOS)
            </button>
            <button 
              onClick={() => setShowLegalModal('privacy')}
              className="py-3 px-4 bg-white border border-black/5 rounded-xl text-[11px] text-black font-black text-center shadow-sm"
            >
              隱私權條款 (Privacy)
            </button>
          </div>
        </div>
      </div>

      {/* 條款 Modal 彈出視窗 */}
      <AnimatePresence>
        {showLegalModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-6 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] p-8 max-w-sm w-full max-h-[80vh] overflow-y-auto space-y-6 relative"
            >
              <h3 className="text-xl font-black text-black">
                {showLegalModal === 'terms' ? '使用者合約' : '隱私權條款'}
              </h3>
              
              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                {showLegalModal === 'terms' ? (
                  `歡迎使用 IronLog！

                  1. 服務條款
                  透過造訪及使用 IronLog，您同意遵守以下所有服務條款、細則以及相關法律。

                  2. 用戶責任
                  您有義務確保生理數據的真實性。IronLog AI 教練所提供的任何飲食與營養建議均屬 AI 生成資訊，僅供健身參考，不構成任何醫療、處方、診斷或醫療級營養建議。在進行高強度重訓前請諮詢您的醫生。

                  3. 隱私聲明
                  我們高度尊重您的隱私。本產品所有核心紀錄預設儲存於您的本機（LocalStorage），除請求 Gemini API 分析所需的照片外，絕不會主動搜集、儲存、共享您的個人身份資料。`
                ) : (
                  `您的個人隱私是我們的首要考量。

                  1. 資料收集
                  本應用程式為離線優先產品，絕大部分數據（訓練歷史、自訂課表、身體指標、對話歷史）均儲存在您的瀏覽器快取中。
                  
                  2. 外部 API 使用
                  當您使用「食物 AI 拍照分析」或「AI 鋼鐵教練對話」時，本應用程式會將上傳的照片與訊息加密發送至 Gemini API。我們與 Gemini API 的合作完全遵循標準的資料隱私與保護規範，傳輸內容僅用於即時生成回覆，不作二次開發或追蹤。
                  
                  3. 本地控制
                  您隨時可以透過設定頁面的「清除並重設所有本地資料」一鍵抹除所有本機儲存的歷史隱私紀錄，完全掌握資料的主控權。`
                )}
              </p>

              <button 
                onClick={() => setShowLegalModal(null)}
                className="w-full py-4 bg-black text-white rounded-2xl text-xs font-black uppercase"
              >
                關閉
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
