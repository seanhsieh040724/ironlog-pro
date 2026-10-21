import React, { useState, useMemo, useContext, useEffect } from 'react';
import { AppContext } from '../App';
import { 
  ArrowLeft, Search, X, Trophy, Swords, Zap, Check, ChevronRight, 
  Sparkles, Dumbbell, Layers, Target, CheckCircle2,
  Calendar, Flame, Shield, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AchievementProgress, 
  AchievementCategory, 
  CATEGORY_LABELS, 
  RARITY_CONFIG,
  evaluateAllAchievements, 
  calculateUserLevel,
} from '../utils/achievements';
import { triggerHapticSuccess } from '../utils/feedback';
import { RankTierEmblem, AchievementMedal, getIconForAchievement, ACHIEVEMENT_VISUAL_THEMES } from './AchievementBadges';

interface AchievementsViewProps {
  onBack?: () => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ onBack }) => {
  const context = useContext(AppContext);
  const history = context?.history || [];

  // 1. 核心成就狀態計算 (嚴格沿用既有評估引擎，零修改運算邏輯)
  const { 
    progressList, 
    unlockedList, 
    inProgressList, 
    lockedList, 
    nextRecommended, 
    recentlyUnlocked 
  } = useMemo(() => {
    return evaluateAllAchievements(history);
  }, [history]);

  // 2. 等級與經驗值計算 (嚴格沿用既有升級公式)
  const userLevel = useMemo(() => {
    return calculateUserLevel(history, unlockedList);
  }, [history, unlockedList]);

  // 3. 戰鬥核心統計數據 (量化訓練歷程)
  const playerStats = useMemo(() => {
    let totalVolume = 0;
    let totalSets = 0;
    const activeDates = new Set<string>();

    history.forEach(session => {
      activeDates.add(new Date(session.startTime).toDateString());
      session.exercises?.forEach(e => {
        e.sets?.forEach(s => {
          if (s.completed) {
            totalSets += 1;
            totalVolume += (s.weight || 0) * (s.reps || 0);
          }
        });
      });
    });

    return {
      totalVolume,
      totalVolumeTons: (totalVolume / 1000).toFixed(1),
      totalSets,
      totalWorkouts: history.length,
      activeDays: activeDates.size,
    };
  }, [history]);

  // 4. 升級動畫機制 (僅在實際等級提升時觸發，避免重整重複彈出，無音訊干擾)
  const [levelUpData, setLevelUpData] = useState<{
    oldLevel: number;
    newLevel: number;
    newTitle: string;
    levelFormatted: string;
  } | null>(null);

  useEffect(() => {
    const savedLevelStr = localStorage.getItem('ironlog_last_seen_level');
    if (!savedLevelStr) {
      localStorage.setItem('ironlog_last_seen_level', String(userLevel.level));
      return;
    }

    const prevLevel = parseInt(savedLevelStr, 10);
    if (!isNaN(prevLevel) && userLevel.level > prevLevel) {
      setLevelUpData({
        oldLevel: prevLevel,
        newLevel: userLevel.level,
        newTitle: userLevel.title,
        levelFormatted: userLevel.levelFormatted,
      });
      triggerHapticSuccess();
    }
  }, [userLevel.level, userLevel.title, userLevel.levelFormatted]);

  const handleDismissLevelUp = () => {
    if (levelUpData) {
      localStorage.setItem('ironlog_last_seen_level', String(levelUpData.newLevel));
      setLevelUpData(null);
    }
  };

  // 5. 篩選與搜尋狀態
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'unlocked' | 'in_progress' | 'locked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingItem, setInspectingItem] = useState<AchievementProgress | null>(null);

  // 6. 篩選後的成就列表
  const filteredAchievements = useMemo(() => {
    return progressList.filter(item => {
      if (selectedCategory !== 'all' && item.definition.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus === 'unlocked' && !item.unlocked) return false;
      if (selectedStatus === 'in_progress' && (item.unlocked || item.progressPercent === 0)) return false;
      if (selectedStatus === 'locked' && (item.unlocked || item.progressPercent > 0)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = item.definition.title.toLowerCase().includes(q);
        const descMatch = item.definition.description.toLowerCase().includes(q);
        const subMatch = item.definition.subtitle.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !subMatch) return false;
      }

      return true;
    });
  }, [progressList, selectedCategory, selectedStatus, searchQuery]);

  return (
    <div className="-mx-5 -mt-16 pt-16 px-5 min-h-[100dvh] bg-[#070709] space-y-6 pb-28 text-slate-100 overflow-x-hidden selection:bg-[#CCFF00] selection:text-black">
      
      {/* ─────────────────────────────────────────────────────────
          I. 頂部導航列 (Top Bar Contract: 返回、簡練標題、已解鎖計數)
         ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="w-11 h-11 rounded-2xl bg-[#131418] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#1c1d24] active:scale-95 transition-all shadow-sm"
              aria-label="返回上一頁"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>鋼鐵成就殿堂</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
              <span>戰士養成</span>
              <span className="text-slate-600">·</span>
              <span>榮譽勳章典藏庫</span>
            </p>
          </div>
        </div>

        {/* 成就解鎖進度標示 (俐落無多餘光暈) */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121317] border border-white/10 rounded-2xl shadow-inner">
          <Trophy className="w-4 h-4 text-[#CCFF00]" />
          <span className="text-xs font-black text-white tabular-nums">
            {unlockedList.length} <span className="text-slate-500 font-medium">/ {progressList.length}</span>
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          II. 玩家等級主視覺面板 (Hero Warrior Progression Panel)
         ───────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#15161c] via-[#101115] to-[#0a0a0d] text-white rounded-[32px] p-6 shadow-2xl border border-white/15">
        {/* 背景環境微光 (深碳石與沈穩青綠) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#CCFF00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-6">
          {/* 主視覺核心：超大等級數字 + 專屬鍛造段位徽章 + 稱號 */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {/* 段位專屬實體金屬徽章 */}
              <RankTierEmblem level={userLevel.level} size="lg" />

              <div className="min-w-0">
                {/* 大型等級數字 (以數字為主角，乾淨俐落無擠壓) */}
                <div className="flex items-center gap-2">
                  <span className="text-4xl sm:text-5xl font-black tracking-tighter text-[#CCFF00] font-mono leading-none drop-shadow-sm">
                    {userLevel.levelFormatted}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 text-[10px] font-black tracking-wider uppercase font-mono">
                    {userLevel.badge}
                  </span>
                </div>

                {/* 等級稱號 */}
                <h2 className="text-xl font-black text-white tracking-tight mt-1.5 truncate">
                  {userLevel.title}
                </h2>
                
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-medium">
                  <span className="tabular-nums font-bold text-slate-200">{userLevel.totalXP.toLocaleString()} XP 累積</span>
                  <span className="text-slate-600">·</span>
                  <span>達成率 {Math.round((unlockedList.length / progressList.length) * 100)}%</span>
                </div>
              </div>
            </div>

            {/* 下一階級預覽銘牌 (自然層級) */}
            <div className="text-right shrink-0 bg-[#0d0e12]/90 border border-white/10 rounded-2xl px-3 py-2 min-w-[88px] flex flex-col justify-between">
              <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                NEXT RANK
              </span>
              <span className="text-xs font-black text-[#CCFF00] tracking-tight font-mono my-0.5">
                {userLevel.nextLevelFormatted}
              </span>
              <span className="text-[10px] text-slate-300 font-medium truncate max-w-[84px]">
                {userLevel.nextLevelTitle}
              </span>
            </div>
          </div>

          {/* 升級進度能量槽 (Precision XP Progression Bar) */}
          <div className="space-y-2 bg-[#0c0d10] p-4 rounded-2xl border border-white/5 shadow-inner">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">升級進度</span>
              <span className="text-slate-300 text-xs font-medium">
                還差 <span className="text-[#CCFF00] font-black tabular-nums font-mono">{userLevel.xpNeededForNext.toLocaleString()}</span> XP
              </span>
            </div>

            {/* 精緻金屬邊框能量條 */}
            <div className="h-2.5 w-full bg-[#181920] rounded-full overflow-hidden p-0.5 border border-white/10 relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${userLevel.levelProgressPercent}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-gradient-to-r from-emerald-500 via-[#CCFF00] to-[#bbf000] rounded-full shadow-[0_0_10px_rgba(204,255,0,0.4)]"
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 font-mono tabular-nums pt-0.5">
              <span>{userLevel.currentLevelXP.toLocaleString()} XP</span>
              <span className="text-[#CCFF00] font-bold">{userLevel.levelProgressPercent}%</span>
              <span>目標 {userLevel.nextLevelXP.toLocaleString()} XP</span>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────
              III. 次要戰力統計數字 (Warrior Combat Stats Strip)
             ───────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="bg-[#121318] border border-white/5 rounded-2xl p-2.5 text-center flex flex-col justify-between min-h-[72px]">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium">
                <Layers className="w-3 h-3 text-[#CCFF00]/80" />
                <span>起重總量</span>
              </div>
              <div className="text-base font-black text-white tabular-nums mt-1 font-mono">
                {playerStats.totalVolumeTons} <span className="text-xs text-[#CCFF00] font-sans font-bold">噸</span>
              </div>
            </div>

            <div className="bg-[#121318] border border-white/5 rounded-2xl p-2.5 text-center flex flex-col justify-between min-h-[72px]">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium">
                <Target className="w-3 h-3 text-cyan-400/80" />
                <span>有效組數</span>
              </div>
              <div className="text-base font-black text-white tabular-nums mt-1 font-mono">
                {playerStats.totalSets} <span className="text-xs text-cyan-400 font-sans font-bold">組</span>
              </div>
            </div>

            <div className="bg-[#121318] border border-white/5 rounded-2xl p-2.5 text-center flex flex-col justify-between min-h-[72px]">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium">
                <Flame className="w-3 h-3 text-amber-400/80" />
                <span>累積戰役</span>
              </div>
              <div className="text-base font-black text-white tabular-nums mt-1 font-mono">
                {playerStats.totalWorkouts} <span className="text-xs text-amber-400 font-sans font-bold">次</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          IV. 戰役懸賞任務面板 (Tactical Bounty Quest Contract)
         ───────────────────────────────────────────────────────── */}
      {nextRecommended && (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#181611] via-[#12110c] to-[#0c0b08] rounded-[28px] border border-amber-500/30 p-5 shadow-xl">
          {/* 金色委託背景氛圍 */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3.5">
            {/* 懸賞令標頭 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                  <Swords className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black text-amber-300 tracking-wider uppercase">
                  戰役懸賞合約 · 即將達成
                </span>
              </div>
              <span className="text-[10px] font-black text-black bg-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                BOUNTY
              </span>
            </div>

            {/* 懸賞互動卡片 */}
            <div 
              onClick={() => setInspectingItem(nextRecommended)}
              className="flex items-center justify-between p-3.5 bg-black/40 hover:bg-black/60 active:scale-[0.99] rounded-2xl transition-all cursor-pointer border border-white/10"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* 懸賞成就的專屬實體徽章 */}
                <AchievementMedal
                  achievementId={nextRecommended.definition.id}
                  category={nextRecommended.definition.category}
                  rarity={nextRecommended.definition.rarity}
                  unlocked={false}
                  size="md"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white truncate">
                      {nextRecommended.definition.title}
                    </h4>
                    <span className="text-[9px] font-bold text-amber-300 px-1.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/30 shrink-0">
                      {CATEGORY_LABELS[nextRecommended.definition.category]}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                    {nextRecommended.definition.subtitle}
                  </p>

                  {/* 懸賞進度條 */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-28 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-[#CCFF00] rounded-full" 
                        style={{ width: `${nextRecommended.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-amber-300 tabular-nums font-mono">
                      {nextRecommended.currentValue}/{nextRecommended.targetValue} {nextRecommended.definition.unit} ({nextRecommended.progressPercent}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                <span className="text-xs font-black text-amber-300 bg-amber-400/10 px-2.5 py-1.5 rounded-xl border border-amber-400/30 tabular-nums font-mono">
                  +{nextRecommended.definition.xp} XP
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
          V. 成就勳章典藏庫 (Collectible Medal Vault)
         ───────────────────────────────────────────────────────── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <span>榮譽獎章典藏庫</span>
            <span className="text-xs font-bold text-slate-400 font-mono">({filteredAchievements.length})</span>
          </h3>
        </div>

        {/* 搜尋欄位 (曜石深碳灰) */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋成就名稱、條件或關鍵字..."
            className="w-full pl-10 pr-9 py-2.5 bg-[#121317] border border-white/10 rounded-2xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-[#CCFF00] transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 狀態切換按鈕組 (Segmented Controls) */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#121317] rounded-2xl border border-white/5">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              selectedStatus === 'all' 
                ? 'bg-[#22242c] text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            全部 ({progressList.length})
          </button>
          <button
            onClick={() => setSelectedStatus('unlocked')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              selectedStatus === 'unlocked' 
                ? 'bg-[#22242c] text-[#CCFF00] shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            已解鎖 ({unlockedList.length})
          </button>
          <button
            onClick={() => setSelectedStatus('in_progress')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              selectedStatus === 'in_progress' 
                ? 'bg-[#22242c] text-amber-300 shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            進行中 ({inProgressList.length})
          </button>
          <button
            onClick={() => setSelectedStatus('locked')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              selectedStatus === 'locked' 
                ? 'bg-[#22242c] text-slate-300 shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            未解鎖 ({lockedList.length})
          </button>
        </div>

        {/* 類別水平切換標籤 */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#CCFF00] text-black shadow-sm font-black'
                : 'bg-[#121317] border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            全部分類
          </button>
          {(Object.keys(CATEGORY_LABELS) as AchievementCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#CCFF00] text-black shadow-sm font-black'
                  : 'bg-[#121317] border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* 成就列表卡片清單 (具備獨立徽章與清楚層級) */}
        {filteredAchievements.length === 0 ? (
          <div className="p-10 text-center bg-[#121317] rounded-[28px] border border-white/10 text-slate-400">
            <Trophy className="w-10 h-10 mx-auto mb-2 text-slate-600 stroke-[1.5]" />
            <p className="text-sm font-bold text-white">查無符合條件的成就勳章</p>
            <p className="text-xs text-slate-500 mt-1">請嘗試變更搜尋關鍵字或切換狀態篩選</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAchievements.map(item => {
              const { definition, unlocked, currentValue, targetValue, progressPercent } = item;
              const rarityConfig = RARITY_CONFIG[definition.rarity];

              return (
                <div
                  key={definition.id}
                  onClick={() => setInspectingItem(item)}
                  className={`p-4 rounded-[26px] border transition-all cursor-pointer flex items-center justify-between min-h-[92px] ${
                    unlocked 
                      ? `bg-gradient-to-r ${rarityConfig.bgGradient} ${rarityConfig.borderClass} ${rarityConfig.glowClass}` 
                      : 'bg-[#111216] border-white/5 opacity-85 hover:opacity-100 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-3">
                    {/* 獨立實體雕刻勳章 (26 項成就專屬圖案) */}
                    <AchievementMedal 
                      achievementId={definition.id}
                      category={definition.category}
                      rarity={definition.rarity}
                      unlocked={unlocked}
                      size="md"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-black truncate ${unlocked ? 'text-white' : 'text-slate-300'}`}>
                          {definition.title}
                        </h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${rarityConfig.badgeBg}`}>
                          {rarityConfig.label}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                        {definition.subtitle}
                      </p>

                      {/* 進度顯示條或解鎖完成標記 */}
                      <div className="mt-2">
                        {unlocked ? (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#CCFF00]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>已解鎖勳章</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-[120px]">
                              <div 
                                className="h-full bg-gradient-to-r from-slate-400 to-[#CCFF00] rounded-full" 
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono font-medium text-slate-400 tabular-nums">
                              {currentValue}/{targetValue} {definition.unit} ({progressPercent}%)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                    <span className="text-xs font-bold text-[#CCFF00] bg-[#CCFF00]/10 px-2 py-1 rounded-xl border border-[#CCFF00]/20 tabular-nums font-mono">
                      +{definition.xp}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────
          VI. 勳章詳細檢視彈窗 (Medal Inspection Modal)
         ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {inspectingItem && (
          <AchievementDetailModal
            item={inspectingItem}
            onClose={() => setInspectingItem(null)}
          />
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────
          VII. LEVEL UP 升級全螢幕動態彈窗 (Level-Up Modal)
         ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {levelUpData && (
          <LevelUpCelebrationModal
            levelData={levelUpData}
            onClose={handleDismissLevelUp}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * 勳章詳細檢視彈窗 (Inspection Modal)
 */
interface AchievementDetailModalProps {
  item: AchievementProgress;
  onClose: () => void;
}

const AchievementDetailModal: React.FC<AchievementDetailModalProps> = ({ item, onClose }) => {
  const { definition, unlocked, currentValue, targetValue, progressPercent, unlockedAt } = item;
  const rarityConfig = RARITY_CONFIG[definition.rarity];

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-sm bg-gradient-to-b from-[#181920] to-[#0f1014] text-white rounded-[36px] border border-white/20 overflow-hidden shadow-2xl flex flex-col p-6 space-y-5"
      >
        {/* 頂部類別與關閉按鈕 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${rarityConfig.badgeBg}`}>
              {rarityConfig.label} · {CATEGORY_LABELS[definition.category]}
            </span>
            {ACHIEVEMENT_VISUAL_THEMES[definition.id]?.themeTitle && (
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10 tracking-wider">
                {ACHIEVEMENT_VISUAL_THEMES[definition.id].themeTitle}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/20 transition-colors"
            aria-label="關閉"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 勳章主視覺 (大型 84px 實體雕刻) */}
        <div className="flex flex-col items-center text-center space-y-3 pt-1">
          <AchievementMedal
            achievementId={definition.id}
            category={definition.category}
            rarity={definition.rarity}
            unlocked={unlocked}
            size="lg"
          />

          <div>
            <h3 className="text-xl font-black text-white">
              {definition.title}
            </h3>
            <p className="text-xs text-slate-400 font-bold mt-0.5">
              {definition.subtitle}
            </p>
          </div>
        </div>

        {/* 達成條件與進度說明 */}
        <div className="bg-[#0b0c10] rounded-2xl p-4 border border-white/10 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {definition.description}
          </p>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">達成進度</span>
              <span className="text-white font-mono tabular-nums">
                {currentValue} / {targetValue} {definition.unit} ({progressPercent}%)
              </span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${unlocked ? 'bg-[#CCFF00]' : 'bg-gradient-to-r from-slate-400 to-[#CCFF00]'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 激勵座右銘 */}
        {definition.quote && (
          <div className="text-center px-2">
            <p className="text-[11px] italic font-medium text-slate-400">
              "{definition.quote}"
            </p>
          </div>
        )}

        {/* 獎勵與解鎖狀態 */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#CCFF00]">
            <Zap className="w-4 h-4 fill-[#CCFF00]" />
            <span className="text-xs font-black font-mono">
              +{definition.xp} XP
            </span>
          </div>

          <div className="text-right text-[11px]">
            {unlocked ? (
              <span className="text-[#CCFF00] font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                {unlockedAt ? `解鎖於 ${new Date(unlockedAt).toLocaleDateString()}` : '已解鎖'}
              </span>
            ) : (
              <span className="text-slate-500 font-medium">
                尚未解鎖
              </span>
            )}
          </div>
        </div>

        {/* 底部關閉按鈕 */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#CCFF00] text-black rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-[#b8e600] active:scale-[0.98] transition-all shadow-md shadow-[#CCFF00]/20"
        >
          關閉
        </button>
      </motion.div>
    </div>
  );
};

/**
 * 升級祝賀彈窗 (Level-Up Celebration Modal)
 * 不主動播放媒體音訊，不干擾外部播放器
 */
interface LevelUpCelebrationModalProps {
  levelData: {
    oldLevel: number;
    newLevel: number;
    newTitle: string;
    levelFormatted: string;
  };
  onClose: () => void;
}

const LevelUpCelebrationModal: React.FC<LevelUpCelebrationModalProps> = ({ levelData, onClose }) => {
  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 20 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="w-full max-w-sm bg-gradient-to-b from-[#162104] via-[#101408] to-[#080905] text-white rounded-[40px] border-2 border-[#CCFF00] overflow-hidden shadow-[0_0_50px_rgba(204,255,0,0.3)] flex flex-col items-center text-center p-7 space-y-6 relative"
      >
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFF00] text-black font-black text-[11px] tracking-widest uppercase shadow-md">
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span>LEVEL UP! 力量段位晉升</span>
          </div>

          {/* 升級段位徽章 */}
          <div className="relative my-3 flex justify-center">
            <RankTierEmblem level={levelData.newLevel} size="lg" />
          </div>

          <div>
            <div className="text-4xl font-black text-[#CCFF00] font-mono tracking-tight">
              {levelData.levelFormatted}
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mt-1">
              {levelData.newTitle}
            </h2>
            <p className="text-xs text-slate-300 font-medium mt-1">
              恭喜突破！你已成功晉升為 <span className="text-[#CCFF00] font-bold">{levelData.levelFormatted}</span> 戰士！
            </p>
          </div>

          <div className="p-3 bg-black/60 rounded-2xl border border-white/10 text-[11px] text-slate-400 font-medium italic">
            "耶巴蒂！Lightweight Baby！每一滴汗水都在為力量加冕！"
          </div>
        </div>

        <button
          onClick={onClose}
          className="relative z-10 w-full py-3.5 bg-[#CCFF00] text-black font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-[#b8e600] active:scale-[0.98] transition-all shadow-lg shadow-[#CCFF00]/30"
        >
          收下榮耀 · 繼續戰鬥
        </button>
      </motion.div>
    </div>
  );
};
