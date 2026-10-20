import { WorkoutSession } from '../types';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type AchievementCategory = 'milestone' | 'volume' | 'sets' | 'strength' | 'consistency' | 'diversity';

export interface AchievementDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xp: number;
  iconName: string;
  targetValue: number;
  unit: string;
  quote?: string;
  evaluator: (history: WorkoutSession[]) => { currentValue: number; unlocked: boolean };
}

export interface AchievementProgress {
  definition: AchievementDefinition;
  currentValue: number;
  targetValue: number;
  unlocked: boolean;
  unlockedAt?: number;
  progressPercent: number; // 0 to 100
}

export interface UserLevelInfo {
  level: number;
  levelFormatted: string; // 例如 LV.01, LV.07
  title: string;
  badge: string;
  totalXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
  xpNeededForNext: number;
  levelProgressPercent: number;
  nextLevelFormatted: string;
  nextLevelTitle: string;
}

/**
 * 格式化兩位數等級字串（如 LV.01, LV.02, LV.10）
 */
export function formatLevelString(level: number): string {
  return level < 10 ? `LV.0${level}` : `LV.${level}`;
}

/**
 * 等級所需最小累積經驗值公式：
 * LV.01: 0 XP
 * LV.02: 200 XP (+200)
 * LV.03: 500 XP (+300)
 * LV.04: 900 XP (+400)
 * ...
 * 升到第 L 級所需累積 XP: 50 * (L - 1) * (L + 2)
 * 升級曲線平滑增加、可持續升級且無硬性上限。
 */
export function getLevelMinXP(level: number): number {
  if (level <= 1) return 0;
  return 50 * (level - 1) * (level + 2);
}

/**
 * 依累積 XP 反推當前等級
 */
export function getLevelForXP(totalXP: number): number {
  if (totalXP <= 0) return 1;
  let level = 1;
  while (getLevelMinXP(level + 1) <= totalXP) {
    level++;
  }
  return level;
}

export const LEVEL_TITLES: { level: number; title: string; badge: string }[] = [
  { level: 1, title: '健身新秀', badge: 'Rookie' },
  { level: 2, title: '鐵館學徒', badge: 'Apprentice' },
  { level: 3, title: '熱血常客', badge: 'Dedicated Lifter' },
  { level: 4, title: '肌力健將', badge: 'Iron Challenger' },
  { level: 5, title: '鋼鐵戰士', badge: 'Steel Warrior' },
  { level: 6, title: '重量巨擘', badge: 'Power Master' },
  { level: 7, title: '泰坦神獸', badge: 'Titan Beast' },
  { level: 8, title: '殿堂宗師', badge: 'Iron Legend' },
  { level: 9, title: '耶巴蒂門徒', badge: 'Ronnie Disciple' },
  { level: 10, title: '鋼鐵霸主', badge: 'Lightweight God' },
  { level: 11, title: '狂暴領主', badge: 'Iron Overlord' },
  { level: 12, title: '神力破曉', badge: 'Power Vanguard' },
  { level: 13, title: '深淵征服者', badge: 'Abyss Conqueror' },
  { level: 14, title: '不朽狂魔', badge: 'Immortal Berserker' },
  { level: 15, title: '耶巴蒂至尊', badge: 'Lightweight Supreme' },
];

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  milestone: '訓練歷程',
  volume: '起重容量',
  sets: '組數毅力',
  strength: '重量突破',
  consistency: '習慣打卡',
  diversity: '全面鍛鍊',
};

export const RARITY_CONFIG: Record<AchievementRarity, {
  label: string;
  colorName: string;
  accentColor: string;
  bgGradient: string;
  borderClass: string;
  textClass: string;
  badgeBg: string;
  glowClass: string;
  iconBg: string;
}> = {
  common: {
    label: '普通',
    colorName: '金屬鐵銀',
    accentColor: '#94a3b8',
    bgGradient: 'from-[#1a1a1e] via-[#151518] to-[#101012]',
    borderClass: 'border-white/10 hover:border-slate-400/40',
    textClass: 'text-slate-300',
    badgeBg: 'bg-white/10 text-slate-300 border border-white/10',
    glowClass: 'shadow-sm',
    iconBg: 'bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600/50 text-slate-200',
  },
  rare: {
    label: '稀有',
    colorName: '翡翠綠',
    accentColor: '#10b981',
    bgGradient: 'from-[#071f15] via-[#0d2a1d] to-[#081812]',
    borderClass: 'border-emerald-500/30 hover:border-emerald-400/60',
    textClass: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    glowClass: 'shadow-[0_0_20px_rgba(16,185,129,0.14)]',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-800 border border-emerald-400/50 text-white',
  },
  epic: {
    label: '史詩',
    colorName: '霓光青綠',
    accentColor: '#CCFF00',
    bgGradient: 'from-[#142003] via-[#1c2906] to-[#0c1402]',
    borderClass: 'border-[#CCFF00]/40 hover:border-[#CCFF00]/80',
    textClass: 'text-[#CCFF00]',
    badgeBg: 'bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30',
    glowClass: 'shadow-[0_0_22px_rgba(204,255,0,0.18)]',
    iconBg: 'bg-gradient-to-br from-[#CCFF00] to-[#82CC00] border border-[#CCFF00] text-black font-black',
  },
  legendary: {
    label: '傳奇',
    colorName: '璀璨黑金',
    accentColor: '#f59e0b',
    bgGradient: 'from-[#261803] via-[#1c1204] to-[#120b02]',
    borderClass: 'border-amber-400/50 hover:border-amber-400/90',
    textClass: 'text-amber-400',
    badgeBg: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-400/40',
    glowClass: 'shadow-[0_0_30px_rgba(245,158,11,0.25)]',
    iconBg: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 border border-amber-300 text-black font-black shadow-md shadow-amber-500/30',
  },
};

/**
 * 完整成就清單（26 個精心設計的成就里程碑）
 */
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // --- 1. 訓練歷程 ---
  {
    id: 'first_workout',
    title: 'Lightweight 啟航',
    subtitle: '踏出鋼鐵第一步',
    description: '在 IronLog 完成並記錄人生第 1 次訓練。',
    category: 'milestone',
    rarity: 'common',
    xp: 100,
    iconName: 'Award',
    targetValue: 1,
    unit: '次',
    quote: '每位傳奇巨獸，都始於第一組訓練！耶巴蒂！',
    evaluator: (history) => {
      const val = history.length;
      return { currentValue: Math.min(val, 1), unlocked: val >= 1 };
    },
  },
  {
    id: 'workouts_5',
    title: '漸入佳境',
    subtitle: '建立訓練熱度',
    description: '累計完成 5 次訓練課表。',
    category: 'milestone',
    rarity: 'common',
    xp: 180,
    iconName: 'Flame',
    targetValue: 5,
    unit: '次',
    quote: '肌肉記憶正在甦醒，保持這股節奏！',
    evaluator: (history) => {
      const val = history.length;
      return { currentValue: Math.min(val, 5), unlocked: val >= 5 };
    },
  },
  {
    id: 'workouts_10',
    title: '百煉成鋼',
    subtitle: '真正的健身常客',
    description: '累計完成 10 次訓練課表。',
    category: 'milestone',
    rarity: 'rare',
    xp: 300,
    iconName: 'Trophy',
    targetValue: 10,
    unit: '次',
    quote: '你已經超越了 90% 只去健身房一兩天就放棄的人。',
    evaluator: (history) => {
      const val = history.length;
      return { currentValue: Math.min(val, 10), unlocked: val >= 10 };
    },
  },
  {
    id: 'workouts_25',
    title: '鋼鐵巨獸',
    subtitle: '二十五場戰役的洗禮',
    description: '累計完成 25 次訓練課表。',
    category: 'milestone',
    rarity: 'epic',
    xp: 600,
    iconName: 'Crown',
    targetValue: 25,
    unit: '次',
    quote: 'Ain’t nothing to it but to do it!',
    evaluator: (history) => {
      const val = history.length;
      return { currentValue: Math.min(val, 25), unlocked: val >= 25 };
    },
  },
  {
    id: 'workouts_50',
    title: '耶巴蒂信徒',
    subtitle: '半百傳奇霸主',
    description: '累計完成 50 次訓練課表。',
    category: 'milestone',
    rarity: 'legendary',
    xp: 1200,
    iconName: 'Sparkles',
    targetValue: 50,
    unit: '次',
    quote: '耶巴蒂！Lightweight Baby！你的自律已成為傳奇！',
    evaluator: (history) => {
      const val = history.length;
      return { currentValue: Math.min(val, 50), unlocked: val >= 50 };
    },
  },

  // --- 2. 起重容量 ---
  {
    id: 'volume_1t',
    title: '千斤推舉',
    subtitle: '累計容量突破 1,000 kg',
    description: '累計完成的所有有效組起重量達到 1,000 kg。',
    category: 'volume',
    rarity: 'common',
    xp: 120,
    iconName: 'Dumbbell',
    targetValue: 1000,
    unit: 'kg',
    quote: '一噸的重量被你征服在掌心之間。',
    evaluator: (history) => {
      let sum = 0;
      history.forEach(s => s.exercises?.forEach(e => e.sets?.forEach(set => {
        if (set.completed) sum += (set.weight || 0) * (set.reps || 0);
      })));
      return { currentValue: Math.min(sum, 1000), unlocked: sum >= 1000 };
    },
  },
  {
    id: 'volume_10t',
    title: '十噸主宰',
    subtitle: '重力完全臣服',
    description: '累計起重容量達到 10,000 kg（十公噸）。',
    category: 'volume',
    rarity: 'rare',
    xp: 280,
    iconName: 'Flame',
    targetValue: 10000,
    unit: 'kg',
    quote: '這相當於舉起了一輛雙層巴士的重量！',
    evaluator: (history) => {
      let sum = 0;
      history.forEach(s => s.exercises?.forEach(e => e.sets?.forEach(set => {
        if (set.completed) sum += (set.weight || 0) * (set.reps || 0);
      })));
      return { currentValue: Math.min(sum, 10000), unlocked: sum >= 10000 };
    },
  },
  {
    id: 'volume_50t',
    title: '五十噸狂暴',
    subtitle: '大地因你而震顫',
    description: '累計起重容量達到 50,000 kg。',
    category: 'volume',
    rarity: 'epic',
    xp: 550,
    iconName: 'Trophy',
    targetValue: 50000,
    unit: 'kg',
    quote: '鐵塊的重量在你的汗水裡化作純粹的力量。',
    evaluator: (history) => {
      let sum = 0;
      history.forEach(s => s.exercises?.forEach(e => e.sets?.forEach(set => {
        if (set.completed) sum += (set.weight || 0) * (set.reps || 0);
      })));
      return { currentValue: Math.min(sum, 50000), unlocked: sum >= 50000 };
    },
  },
  {
    id: 'volume_100t',
    title: '百噸神話',
    subtitle: '突破 100,000 kg 宏偉里程',
    description: '累計起重容量達到 100,000 kg（一百公噸）。',
    category: 'volume',
    rarity: 'legendary',
    xp: 1500,
    iconName: 'Crown',
    targetValue: 100000,
    unit: 'kg',
    quote: '你舉起了一整座鋼鐵城堡。Lightweight!',
    evaluator: (history) => {
      let sum = 0;
      history.forEach(s => s.exercises?.forEach(e => e.sets?.forEach(set => {
        if (set.completed) sum += (set.weight || 0) * (set.reps || 0);
      })));
      return { currentValue: Math.min(sum, 100000), unlocked: sum >= 100000 };
    },
  },

  // --- 3. 組數毅力 ---
  {
    id: 'sets_15',
    title: '組數起步',
    subtitle: '扎實完成每一組',
    description: '累計完成 15 組有效訓練組數。',
    category: 'sets',
    rarity: 'common',
    xp: 100,
    iconName: 'Layers',
    targetValue: 15,
    unit: '組',
    quote: '每一組的堅持，都是肌纖維成長的證明。',
    evaluator: (history) => {
      let count = 0;
      history.forEach(s => s.exercises?.forEach(e => e.sets?.forEach(set => {
        if (set.completed) count += 1;
      })));
      return { currentValue: Math.min(count, 15), unlocked: count >= 15 };
    },
  },
  {
    id: 'sets_60',
    title: '力竭藝術',
    subtitle: '超越六十組考驗',
    description: '累計完成 60 組有效訓練組數。',
    category: 'sets',
    rarity: 'common',
    xp: 180,
    iconName: 'Zap',
    targetValue: 60,
    unit: '組',
    quote: '組間休息喝口水，下一組繼續推進極限！',
    evaluator: (history) => {
      let count = 0;
      history.forEach(s => s.exercises?.forEach(e => e.sets?.forEach(set => {
        if (set.completed) count += 1;
      })));
      return { currentValue: Math.min(count, 60), unlocked: count >= 60 };
    },
  },
  {
    id: 'sets_150',
    title: '鋼鐵機關槍',
    subtitle: '突破 150 組大關',
    description: '累計完成 150 組有效訓練組數。',
    category: 'sets',
    rarity: 'rare',
    xp: 350,
    iconName: 'Target',
    targetValue: 150,
    unit: '組',
    quote: '把熱情化作每組扎實的下壓與推舉。',
    evaluator: (history) => {
      let count = 0;
      history.forEach(s => s.exercises?.forEach(e => e.sets?.forEach(set => {
        if (set.completed) count += 1;
      })));
      return { currentValue: Math.min(count, 150), unlocked: count >= 150 };
    },
  },
  {
    id: 'sets_500',
    title: '千錘百鍊',
    subtitle: '五百組的沉殿',
    description: '累計完成 500 組有效訓練組數。',
    category: 'sets',
    rarity: 'epic',
    xp: 800,
    iconName: 'Crown',
    targetValue: 500,
    unit: '組',
    quote: '五百組動作，雕刻出堅定不移的體魄與意志。',
    evaluator: (history) => {
      let count = 0;
      history.forEach(s => s.exercises?.forEach(e => e.sets?.forEach(set => {
        if (set.completed) count += 1;
      })));
      return { currentValue: Math.min(count, 500), unlocked: count >= 500 };
    },
  },

  // --- 4. 重量突破 (Strength & PRs) ---
  {
    id: 'heavy_50kg',
    title: '五十公斤重擊',
    subtitle: '任一動作單組達 50 kg',
    description: '在任一動作的有效組中完成 50 kg 以上的重量。',
    category: 'strength',
    rarity: 'common',
    xp: 150,
    iconName: 'Dumbbell',
    targetValue: 50,
    unit: 'kg',
    quote: '50 公斤的門檻，你已經跨過去了！',
    evaluator: (history) => {
      let maxW = 0;
      history.forEach(s => s.exercises?.forEach(e => e.sets?.forEach(set => {
        if (set.completed && set.weight > maxW) maxW = set.weight;
      })));
      return { currentValue: Math.min(maxW, 50), unlocked: maxW >= 50 };
    },
  },
  {
    id: 'heavy_80kg',
    title: '破風八十',
    subtitle: '任一動作突破 80 kg',
    description: '在任一動作的有效組中完成 80 kg 以上的重量。',
    category: 'strength',
    rarity: 'rare',
    xp: 320,
    iconName: 'Zap',
    targetValue: 80,
    unit: 'kg',
    quote: '沉重的啞鈴與槓片，只能在你的控制下順從起伏。',
    evaluator: (history) => {
      let maxW = 0;
      history.forEach(s => s.exercises?.forEach(e => e.sets?.forEach(set => {
        if (set.completed && set.weight > maxW) maxW = set.weight;
      })));
      return { currentValue: Math.min(maxW, 80), unlocked: maxW >= 80 };
    },
  },
  {
    id: 'heavy_100kg',
    title: '三位數霸者',
    subtitle: '突破 100 kg 狂暴重量',
    description: '在任一動作（臥推、深蹲、硬舉等）中完成 100 kg 以上的組數。',
    category: 'strength',
    rarity: 'epic',
    xp: 650,
    iconName: 'Trophy',
    targetValue: 100,
    unit: 'kg',
    quote: '歡迎進入破百俱樂部！純粹的力量在咆哮！',
    evaluator: (history) => {
      let maxW = 0;
      history.forEach(s => s.exercises?.forEach(e => e.sets?.forEach(set => {
        if (set.completed && set.weight > maxW) maxW = set.weight;
      })));
      return { currentValue: Math.min(maxW, 100), unlocked: maxW >= 100 };
    },
  },
  {
    id: 'bench_pr',
    title: '胸肌推土機',
    subtitle: '胸部推舉重量突破 60 kg',
    description: '在槓鈴臥推、啞鈴臥推或器械胸推中單組達到 60 kg 以上。',
    category: 'strength',
    rarity: 'rare',
    xp: 300,
    iconName: 'Target',
    targetValue: 60,
    unit: 'kg',
    quote: '胸口傳來的泵感，是鋼鐵給予的最高讚許！',
    evaluator: (history) => {
      let maxW = 0;
      history.forEach(s => s.exercises?.forEach(e => {
        if (e.name.includes('推') || e.name.includes('胸') || e.muscleGroup === 'chest') {
          e.sets?.forEach(set => {
            if (set.completed && set.weight > maxW) maxW = set.weight;
          });
        }
      }));
      return { currentValue: Math.min(maxW, 60), unlocked: maxW >= 60 };
    },
  },
  {
    id: 'squat_pr',
    title: '深蹲無畏',
    subtitle: '深蹲或腿推突破 80 kg',
    description: '在深蹲、腿推或哈克深蹲中單組達到 80 kg 以上。',
    category: 'strength',
    rarity: 'rare',
    xp: 350,
    iconName: 'Flame',
    targetValue: 80,
    unit: 'kg',
    quote: '蹲得越深，起得越高，下半身地基堅不可摧！',
    evaluator: (history) => {
      let maxW = 0;
      history.forEach(s => s.exercises?.forEach(e => {
        if (e.name.includes('蹲') || e.name.includes('腿推') || e.muscleGroup === 'quads' || e.muscleGroup === 'glutes') {
          e.sets?.forEach(set => {
            if (set.completed && set.weight > maxW) maxW = set.weight;
          });
        }
      }));
      return { currentValue: Math.min(maxW, 80), unlocked: maxW >= 80 };
    },
  },

  // --- 5. 習慣打卡與時段 (Consistency) ---
  {
    id: 'active_days_3',
    title: '三日不懈',
    subtitle: '累計打卡 3 天',
    description: '累計訓練打卡達 3 個不同日期。',
    category: 'consistency',
    rarity: 'common',
    xp: 120,
    iconName: 'Calendar',
    targetValue: 3,
    unit: '天',
    quote: '三天只是起點，習慣正悄悄成形。',
    evaluator: (history) => {
      const days = new Set(history.map(s => new Date(s.startTime).toDateString()));
      return { currentValue: Math.min(days.size, 3), unlocked: days.size >= 3 };
    },
  },
  {
    id: 'active_days_7',
    title: '週循環達人',
    subtitle: '累計打卡 7 天',
    description: '累計訓練打卡達 7 個不同日期。',
    category: 'consistency',
    rarity: 'rare',
    xp: 250,
    iconName: 'Calendar',
    targetValue: 7,
    unit: '天',
    quote: '七天的耕耘，讓運動成為生活不可分割的一部分。',
    evaluator: (history) => {
      const days = new Set(history.map(s => new Date(s.startTime).toDateString()));
      return { currentValue: Math.min(days.size, 7), unlocked: days.size >= 7 };
    },
  },
  {
    id: 'active_days_14',
    title: '自律二週',
    subtitle: '累計打卡 14 天',
    description: '累計訓練打卡達 14 個不同日期。',
    category: 'consistency',
    rarity: 'epic',
    xp: 500,
    iconName: 'ShieldCheck',
    targetValue: 14,
    unit: '天',
    quote: '兩週的淬鍊，身體線條已經有了肉眼可見的變化！',
    evaluator: (history) => {
      const days = new Set(history.map(s => new Date(s.startTime).toDateString()));
      return { currentValue: Math.min(days.size, 14), unlocked: days.size >= 14 };
    },
  },
  {
    id: 'active_days_30',
    title: '鋼鐵月曆',
    subtitle: '累計打卡 30 天',
    description: '累計訓練打卡達 30 個不同日期。',
    category: 'consistency',
    rarity: 'legendary',
    xp: 1200,
    iconName: 'Sparkles',
    targetValue: 30,
    unit: '天',
    quote: '一個月滿貫打卡！你的自律已經是他人仰望的標竿。',
    evaluator: (history) => {
      const days = new Set(history.map(s => new Date(s.startTime).toDateString()));
      return { currentValue: Math.min(days.size, 30), unlocked: days.size >= 30 };
    },
  },
  {
    id: 'morning_lifter',
    title: '晨曦破曉',
    subtitle: '早上 05:00 - 09:30 晨練打卡',
    description: '在清晨或上午 9:30 前完成一次訓練紀錄。',
    category: 'consistency',
    rarity: 'rare',
    xp: 220,
    iconName: 'Clock',
    targetValue: 1,
    unit: '次',
    quote: '城市還在沉睡，你的肌肉已經熱氣騰騰！',
    evaluator: (history) => {
      const hasMorning = history.some(s => {
        const h = new Date(s.startTime).getHours();
        return h >= 5 && h <= 9;
      });
      return { currentValue: hasMorning ? 1 : 0, unlocked: hasMorning };
    },
  },
  {
    id: 'night_owl_lifter',
    title: '夜行巨獸',
    subtitle: '夜間 20:30 以後訓練打卡',
    description: '在晚間 20:30 以後完成並儲存一次訓練紀錄。',
    category: 'consistency',
    rarity: 'rare',
    xp: 220,
    iconName: 'Clock',
    targetValue: 1,
    unit: '次',
    quote: '結束整天的忙碌，鐵館是最好的庇護所與戰場！',
    evaluator: (history) => {
      const hasNight = history.some(s => {
        const h = new Date(s.startTime).getHours();
        return h >= 20;
      });
      return { currentValue: hasNight ? 1 : 0, unlocked: hasNight };
    },
  },

  // --- 6. 全面鍛鍊 (Diversity & Muscle Balance) ---
  {
    id: 'leg_day_hero',
    title: '不逃避練腿',
    subtitle: '單次腿部訓練滿 10 組',
    description: '在單次訓練中完成至少 10 組腿部或臀部動作。',
    category: 'diversity',
    rarity: 'rare',
    xp: 320,
    iconName: 'Flame',
    targetValue: 1,
    unit: '次',
    quote: '真男人絕不跳過練腿日！走路顫抖是榮耀的勳章。',
    evaluator: (history) => {
      const qualified = history.some(s => {
        let legSets = 0;
        s.exercises?.forEach(e => {
          if (['quads', 'hamstrings', 'glutes'].includes(e.muscleGroup) || e.name.includes('腿') || e.name.includes('蹲') || e.name.includes('硬舉')) {
            legSets += e.sets?.filter(st => st.completed).length || 0;
          }
        });
        return legSets >= 10;
      });
      return { currentValue: qualified ? 1 : 0, unlocked: qualified };
    },
  },
  {
    id: 'all_muscle_master',
    title: '全能幾何',
    subtitle: '練遍胸背肩腿手核心 6 大肌群',
    description: '歷史訓練中完整涵蓋了 6 大主要肌群（胸、背、肩、腿、手臂、核心）。',
    category: 'diversity',
    rarity: 'epic',
    xp: 600,
    iconName: 'ShieldCheck',
    targetValue: 6,
    unit: '大肌群',
    quote: '均衡發展，無死角的美感與功能性體魄。',
    evaluator: (history) => {
      const covered = new Set<string>();
      history.forEach(s => s.exercises?.forEach(e => {
        if (e.sets?.some(st => st.completed)) {
          if (['chest'].includes(e.muscleGroup) || e.name.includes('胸')) covered.add('胸');
          if (['back'].includes(e.muscleGroup) || e.name.includes('背') || e.name.includes('引體')) covered.add('背');
          if (['shoulders'].includes(e.muscleGroup) || e.name.includes('肩')) covered.add('肩');
          if (['quads', 'hamstrings', 'glutes'].includes(e.muscleGroup) || e.name.includes('腿') || e.name.includes('蹲')) covered.add('腿');
          if (['arms'].includes(e.muscleGroup) || e.name.includes('二頭') || e.name.includes('三頭') || e.name.includes('彎舉')) covered.add('手');
          if (['core'].includes(e.muscleGroup) || e.name.includes('腹') || e.name.includes('捲腹')) covered.add('核心');
        }
      }));
      return { currentValue: covered.size, unlocked: covered.size >= 6 };
    },
  },
];

/**
 * 計算用戶經驗值與等級
 * XP 來源：
 * 1. 每次完成訓練獎勵：50 XP
 * 2. 每完成一個有效組數：2 XP
 * 3. 解鎖各成就獎勵 XP
 */
export function calculateUserLevel(
  history: WorkoutSession[],
  unlockedAchievements: AchievementProgress[]
): UserLevelInfo {
  let baseWorkoutXP = 0;
  let totalSetsCount = 0;

  history.forEach(session => {
    baseWorkoutXP += 50; // 每次訓練打卡基礎 50 XP
    session.exercises?.forEach(e => {
      e.sets?.forEach(s => {
        if (s.completed) totalSetsCount += 1;
      });
    });
  });

  const setsXP = totalSetsCount * 2;
  const achievementXP = unlockedAchievements.reduce((acc, curr) => {
    return curr.unlocked ? acc + curr.definition.xp : acc;
  }, 0);

  const totalXP = baseWorkoutXP + setsXP + achievementXP;

  // 使用連續可預測的公式計算等級，無硬性上限
  const level = getLevelForXP(totalXP);
  const currentLevelXP = getLevelMinXP(level);
  const nextLevelXP = getLevelMinXP(level + 1);
  const xpNeededForNext = Math.max(0, nextLevelXP - totalXP);
  
  const span = Math.max(1, nextLevelXP - currentLevelXP);
  const currentInSpan = Math.max(0, totalXP - currentLevelXP);
  const levelProgressPercent = Math.min(100, Math.max(0, Math.round((currentInSpan / span) * 100)));

  const titleObj = LEVEL_TITLES.find(t => t.level === level) || {
    level,
    title: `耶巴蒂至尊 (階級 ${level})`,
    badge: `Supreme ${level}`
  };

  const nextTitleObj = LEVEL_TITLES.find(t => t.level === level + 1) || {
    level: level + 1,
    title: `耶巴蒂至尊 (階級 ${level + 1})`,
    badge: `Supreme ${level + 1}`
  };

  return {
    level,
    levelFormatted: formatLevelString(level),
    title: titleObj.title,
    badge: titleObj.badge,
    totalXP,
    currentLevelXP,
    nextLevelXP,
    xpNeededForNext,
    levelProgressPercent,
    nextLevelFormatted: formatLevelString(level + 1),
    nextLevelTitle: nextTitleObj.title,
  };
}

/**
 * 評估所有成就狀態並與 LocalStorage 同步解鎖時間
 */
export function evaluateAllAchievements(history: WorkoutSession[]): {
  progressList: AchievementProgress[];
  unlockedList: AchievementProgress[];
  inProgressList: AchievementProgress[];
  lockedList: AchievementProgress[];
  nextRecommended: AchievementProgress | null;
  recentlyUnlocked: AchievementProgress[];
} {
  // 載入過往記錄的解鎖時間
  let unlockTimestamps: Record<string, number> = {};
  try {
    const saved = localStorage.getItem('ironlog_achievements_unlocked_v1');
    if (saved) unlockTimestamps = JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse unlockTimestamps', e);
  }

  const now = Date.now();
  let hasChanges = false;

  const progressList: AchievementProgress[] = ACHIEVEMENT_DEFINITIONS.map(def => {
    const res = def.evaluator(history);
    let unlockedAt = unlockTimestamps[def.id];

    if (res.unlocked && !unlockedAt) {
      unlockedAt = now;
      unlockTimestamps[def.id] = now;
      hasChanges = true;
    }

    const progressPercent = Math.min(
      100,
      Math.max(0, Math.round((res.currentValue / def.targetValue) * 100))
    );

    return {
      definition: def,
      currentValue: res.currentValue,
      targetValue: def.targetValue,
      unlocked: res.unlocked,
      unlockedAt,
      progressPercent,
    };
  });

  if (hasChanges) {
    try {
      localStorage.setItem('ironlog_achievements_unlocked_v1', JSON.stringify(unlockTimestamps));
    } catch (e) {
      console.error('Failed to save unlockTimestamps', e);
    }
  }

  const unlockedList = progressList.filter(p => p.unlocked);
  const notUnlockedList = progressList.filter(p => !p.unlocked);
  const inProgressList = notUnlockedList.filter(p => p.progressPercent > 0);
  const lockedList = notUnlockedList.filter(p => p.progressPercent === 0);

  // 下一個值得努力的成就：從未解鎖中選出進度最高 (最高 progressPercent)，若同分則選 targetValue 較小或 XP 較高的
  const nextRecommended = notUnlockedList.length > 0
    ? [...notUnlockedList].sort((a, b) => {
        if (b.progressPercent !== a.progressPercent) {
          return b.progressPercent - a.progressPercent;
        }
        return b.definition.xp - a.definition.xp;
      })[0]
    : null;

  // 最近解鎖的成就：依 unlockedAt 降序排列
  const recentlyUnlocked = [...unlockedList].sort((a, b) => {
    return (b.unlockedAt || 0) - (a.unlockedAt || 0);
  });

  return {
    progressList,
    unlockedList,
    inProgressList,
    lockedList,
    nextRecommended,
    recentlyUnlocked,
  };
}
