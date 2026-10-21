import React, { useId } from 'react';
import { AchievementCategory, AchievementRarity } from '../utils/achievements';

interface RankTierEmblemProps {
  level: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * 玩家段位專屬金屬徽章 (Rank Tier Crest)
 * 依等級分階層升級色彩、珠寶鑲嵌與金屬裝飾：
 * - LV.01 ~ 04: 新手學徒階 (Titanium Silver & Sky Ice Blue 鈦鋼銀與冰藍星芒)
 * - LV.05 ~ 08: 戰士先鋒階 (Emerald Jade & Neon Lime Vanguard 翡翠寶石與霓光青綠雙刃)
 * - LV.09 ~ 12: 泰坦宗師階 (Royal Amethyst Purple & Imperial Gold 皇家紫晶與香檳金印)
 * - LV.13 +    : 耶巴蒂至尊階 (Supreme Sovereign Sun Gold & Prismatic Amber 太陽神帝王金與赤紅寶石)
 */
export const RankTierEmblem: React.FC<RankTierEmblemProps> = ({ level, size = 'lg', className = '' }) => {
  const pixelSize = size === 'xs' ? 32 : size === 'sm' ? 44 : size === 'md' ? 64 : 88;
  const uniqueId = useId().replace(/[^a-zA-Z0-9]/g, '');

  let tierStyle = {
    rimGradient: ['#FFFFFF', '#94A3B8', '#334155'],
    innerBezel: ['#E2E8F0', '#64748B'],
    coreGradient: ['#1E293B', '#090D14'],
    accent: '#38BDF8',
    highlight: '#F0F9FF',
    glow: 'rgba(56, 189, 248, 0.4)',
    tierName: 'IRON TIER',
    stars: 1,
    gemColor: '#38BDF8',
  };

  if (level >= 13) {
    tierStyle = {
      rimGradient: ['#FFFBEB', '#F59E0B', '#B45309'],
      innerBezel: ['#FEF08A', '#D97706'],
      coreGradient: ['#381105', '#160401'],
      accent: '#FDE047',
      highlight: '#EF4444',
      glow: 'rgba(245, 158, 11, 0.65)',
      tierName: 'SUPREME TIER',
      stars: 4,
      gemColor: '#EF4444',
    };
  } else if (level >= 9) {
    tierStyle = {
      rimGradient: ['#FDE047', '#A855F7', '#581C87'],
      innerBezel: ['#E879F9', '#7E22CE'],
      coreGradient: ['#280B3B', '#0E0214'],
      accent: '#FBBF24',
      highlight: '#E879F9',
      glow: 'rgba(168, 85, 247, 0.55)',
      tierName: 'TITAN TIER',
      stars: 3,
      gemColor: '#FBBF24',
    };
  } else if (level >= 5) {
    tierStyle = {
      rimGradient: ['#CCFF00', '#10B981', '#064E3B'],
      innerBezel: ['#6EE7B7', '#047857'],
      coreGradient: ['#0C2919', '#03120A'],
      accent: '#CCFF00',
      highlight: '#6EE7B7',
      glow: 'rgba(204, 255, 0, 0.5)',
      tierName: 'WARRIOR TIER',
      stars: 2,
      gemColor: '#CCFF00',
    };
  }

  const idPrefix = `rank-emblem-${uniqueId}-${level}-${size}`;

  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <svg
        viewBox="0 0 100 100"
        width={pixelSize}
        height={pixelSize}
        className="overflow-visible drop-shadow-md select-none pointer-events-none"
      >
        <defs>
          <linearGradient id={`${idPrefix}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tierStyle.rimGradient[0]} />
            <stop offset="50%" stopColor={tierStyle.rimGradient[1]} />
            <stop offset="100%" stopColor={tierStyle.rimGradient[2]} />
          </linearGradient>
          <linearGradient id={`${idPrefix}-inner-bezel`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tierStyle.innerBezel[0]} />
            <stop offset="100%" stopColor={tierStyle.innerBezel[1]} />
          </linearGradient>
          <linearGradient id={`${idPrefix}-core`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={tierStyle.coreGradient[0]} />
            <stop offset="100%" stopColor={tierStyle.coreGradient[1]} />
          </linearGradient>
          <filter id={`${idPrefix}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.75" />
          </filter>
        </defs>

        {/* 外圍鍛造光暈刻度環 */}
        <circle 
          cx="50" 
          cy="50" 
          r="46" 
          fill="none" 
          stroke={tierStyle.accent} 
          strokeWidth="1.2" 
          strokeDasharray="4 3" 
          opacity="0.8" 
        />

        {/* 主盾牌第一層外框 */}
        <polygon
          points="50,4 88,20 82,72 50,96 18,72 12,20"
          fill={`url(#${idPrefix}-rim)`}
          filter={`url(#${idPrefix}-shadow)`}
          stroke="#000000"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* 第二層精緻金屬倒角內框 */}
        <polygon
          points="50,8 84,22 78,69 50,91 22,69 16,22"
          fill={`url(#${idPrefix}-inner-bezel)`}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* 第三層深沉金屬底艙 */}
        <polygon
          points="50,11 80,24 75,66 50,87 25,66 20,24"
          fill={`url(#${idPrefix}-core)`}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* 幾何立體高光刻面遮罩 */}
        <path d="M 50,11 L 80,24 L 50,50 Z" fill="rgba(255,255,255,0.18)" />
        <path d="M 20,24 L 50,11 L 50,50 Z" fill="rgba(0,0,0,0.35)" />

        {/* 階層專屬符騰 */}
        {level < 5 && (
          <g transform="translate(50, 48)">
            <rect x="-16" y="-3" width="32" height="6" rx="1.5" fill={tierStyle.accent} stroke="#000000" strokeWidth="0.8" />
            <rect x="-18" y="-7" width="3.5" height="14" rx="1" fill={tierStyle.highlight} stroke="#000000" strokeWidth="0.6" />
            <rect x="14.5" y="-7" width="3.5" height="14" rx="1" fill={tierStyle.highlight} stroke="#000000" strokeWidth="0.6" />
            <polygon
              points="0,-14 11,8 -11,8"
              fill="none"
              stroke={tierStyle.highlight}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <circle cx="0" cy="0" r="3.2" fill={tierStyle.highlight} stroke="#000000" strokeWidth="0.6" />
          </g>
        )}

        {level >= 5 && level < 9 && (
          <g transform="translate(50, 48)">
            <path
              d="M 0,-16 L 14,-4 L 10,12 L 0,16 L -10,12 L -14,-4 Z"
              fill="none"
              stroke={tierStyle.highlight}
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <polygon points="0,-11 7,-1 0,9 -7,-1" fill={tierStyle.accent} stroke="#000000" strokeWidth="0.6" />
            <line x1="-18" y1="-8" x2="-8" y2="-8" stroke={tierStyle.accent} strokeWidth="2.8" strokeLinecap="round" />
            <line x1="8" y1="-8" x2="18" y2="-8" stroke={tierStyle.accent} strokeWidth="2.8" strokeLinecap="round" />
            <circle cx="0" cy="-1" r="2" fill="#FFFFFF" />
          </g>
        )}

        {level >= 9 && level < 13 && (
          <g transform="translate(50, 48)">
            <path
              d="M -16,-6 L -10,-16 L 0,-8 L 10,-16 L 16,-6 L 12,12 L -12,12 Z"
              fill="none"
              stroke={tierStyle.highlight}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="0" cy="2" r="5.5" fill={tierStyle.accent} stroke="#000000" strokeWidth="1" />
            <circle cx="0" cy="2" r="2" fill="#FFFFFF" />
            <circle cx="-10" cy="-16" r="1.8" fill={tierStyle.highlight} />
            <circle cx="10" cy="-16" r="1.8" fill={tierStyle.highlight} />
            <path d="M -7,7 L 7,7" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {level >= 13 && (
          <g transform="translate(50, 47)">
            <path
              d="M -18,-10 L -12,-18 L -6,-10 L 0,-20 L 6,-10 L 12,-18 L 18,-10 L 14,14 L -14,14 Z"
              fill="none"
              stroke={tierStyle.accent}
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            <polygon points="0,-8 6,0 0,8 -6,0" fill={tierStyle.highlight} stroke="#000000" strokeWidth="0.6" />
            <circle cx="-12" cy="-18" r="2.2" fill="#FFFFFF" stroke="#000000" strokeWidth="0.6" />
            <circle cx="0" cy="-20" r="2.8" fill="#FFFFFF" stroke="#000000" strokeWidth="0.6" />
            <circle cx="12" cy="-18" r="2.2" fill="#FFFFFF" stroke="#000000" strokeWidth="0.6" />
            <circle cx="0" cy="0" r="2" fill="#EF4444" />
          </g>
        )}

        {/* 頂部鉚釘金屬扣件 */}
        <circle cx="50" cy="14" r="2.2" fill={tierStyle.gemColor} stroke="#000000" strokeWidth="1" />
        <circle cx="24" cy="28" r="1.8" fill={tierStyle.accent} opacity="0.9" />
        <circle cx="76" cy="28" r="1.8" fill={tierStyle.accent} opacity="0.9" />

        {/* 底部段位星級 */}
        <g transform="translate(50, 79)">
          {Array.from({ length: tierStyle.stars }).map((_, idx) => {
            const offset = (idx - (tierStyle.stars - 1) / 2) * 8.5;
            return (
              <polygon
                key={idx}
                points={`${offset}, -3.5 ${offset + 2.8}, 2 ${offset - 2.8}, 2`}
                fill={tierStyle.accent}
                stroke="#000000"
                strokeWidth="0.6"
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export type MedalFrameShape = 'octagon' | 'shield' | 'diamond' | 'crown' | 'circle' | 'hex' | 'crest';

export interface MedalVisualTheme {
  rim: [string, string, string];
  innerRim: [string, string];
  core: [string, string];
  accent: string;
  highlight: string;
  glow: string;
  frameShape: MedalFrameShape;
  gemColor: string;
  themeTitle: string;
}

/**
 * 26 枚成就專屬彩色 RPG 視覺主題定義表
 * 融合寶石藍、翡翠綠、紫水晶、烈焰橘、帝王金、玫瑰紅、銀白與彩虹星塵等豐富色系
 */
export const ACHIEVEMENT_VISUAL_THEMES: Record<string, MedalVisualTheme> = {
  // ──────── 1. 訓練歷程 ────────
  first_workout: {
    // 冰藍星芒 · 雙頭啞鈴與啟程之星
    rim: ['#FFFFFF', '#94A3B8', '#334155'],
    innerRim: ['#E0F2FE', '#38BDF8'],
    core: ['#082032', '#030D14'],
    accent: '#38BDF8',
    highlight: '#F0F9FF',
    glow: 'rgba(56, 189, 248, 0.45)',
    frameShape: 'octagon',
    gemColor: '#38BDF8',
    themeTitle: 'ICE BLUE',
  },
  workouts_5: {
    // 晨曦琥珀 · 槓鈴與五星天階
    rim: ['#FEF3C7', '#D97706', '#78350F'],
    innerRim: ['#FDE68A', '#B45309'],
    core: ['#281403', '#110701'],
    accent: '#F59E0B',
    highlight: '#FEF3C7',
    glow: 'rgba(245, 158, 11, 0.45)',
    frameShape: 'circle',
    gemColor: '#FBBF24',
    themeTitle: 'AMBER GOLD',
  },
  workouts_10: {
    // 翡翠綠金 · 羅馬數字 X 與月桂金冠
    rim: ['#FEF08A', '#15803D', '#064E3B'],
    innerRim: ['#6EE7B7', '#047857'],
    core: ['#05281A', '#02120B'],
    accent: '#10B981',
    highlight: '#FBBF24',
    glow: 'rgba(16, 185, 129, 0.5)',
    frameShape: 'shield',
    gemColor: '#34D399',
    themeTitle: 'EMERALD JADE',
  },
  workouts_25: {
    // 紫晶魔能 · 25號槓片與狂暴爪痕
    rim: ['#F5D0FE', '#9333EA', '#3B0764'],
    innerRim: ['#F0ABFC', '#7E22CE'],
    core: ['#260838', '#0E0216'],
    accent: '#C084FC',
    highlight: '#F472B6',
    glow: 'rgba(192, 132, 252, 0.55)',
    frameShape: 'diamond',
    gemColor: '#E879F9',
    themeTitle: 'AMETHYST VOID',
  },
  workouts_50: {
    // 帝王皇冠 · 皇冠星芒與金槓鈴
    rim: ['#FFFBEB', '#F59E0B', '#B45309'],
    innerRim: ['#FEF08A', '#D97706'],
    core: ['#350F03', '#150401'],
    accent: '#FBBF24',
    highlight: '#EF4444',
    glow: 'rgba(251, 191, 36, 0.65)',
    frameShape: 'crown',
    gemColor: '#EF4444',
    themeTitle: 'IMPERIAL SUN',
  },

  // ──────── 2. 起重容量 ────────
  volume_1t: {
    // 鈷藍鍛鋼 · 帶有 1T 銘牌的重磅槓片
    rim: ['#E2E8F0', '#64748B', '#1E293B'],
    innerRim: ['#93C5FD', '#2563EB'],
    core: ['#0A1D33', '#040C16'],
    accent: '#60A5FA',
    highlight: '#BAE6FD',
    glow: 'rgba(96, 165, 250, 0.4)',
    frameShape: 'crest',
    gemColor: '#38BDF8',
    themeTitle: 'COBALT STEEL',
  },
  volume_10t: {
    // 海洋青藍 · 堆疊槓片與突破箭頭
    rim: ['#CFFAFE', '#0891B2', '#164E63'],
    innerRim: ['#67E8F9', '#0E7490'],
    core: ['#041E26', '#010E12'],
    accent: '#06B6D4',
    highlight: '#A5F3FC',
    glow: 'rgba(6, 182, 212, 0.5)',
    frameShape: 'hex',
    gemColor: '#22D3EE',
    themeTitle: 'AQUAMARINE',
  },
  volume_50t: {
    // 熔岩赤銅 · 重型鐵砧與爆發火花
    rim: ['#FFE4E6', '#E11D48', '#881337'],
    innerRim: ['#FDA4AF', '#BE123C'],
    core: ['#2F0611', '#120206'],
    accent: '#FB7185',
    highlight: '#FFE4E6',
    glow: 'rgba(251, 113, 133, 0.55)',
    frameShape: 'hex',
    gemColor: '#F43F5E',
    themeTitle: 'ROSE TITAN',
  },
  volume_100t: {
    // 萬神殿日耀神殿 · 神殿柱體與 100T 標記
    rim: ['#FEF9C3', '#D97706', '#78350F'],
    innerRim: ['#FDE047', '#B45309'],
    core: ['#251403', '#0D0601'],
    accent: '#F59E0B',
    highlight: '#FEF9C3',
    glow: 'rgba(245, 158, 11, 0.7)',
    frameShape: 'crown',
    gemColor: '#FDE047',
    themeTitle: 'SOLAR PANTHEON',
  },

  // ──────── 3. 組數毅力 ────────
  sets_15: {
    // 薄荷綠銀 · 組數刻度與完成符號
    rim: ['#FFFFFF', '#94A3B8', '#334155'],
    innerRim: ['#A7F3D0', '#10B981'],
    core: ['#082218', '#030F0A'],
    accent: '#34D399',
    highlight: '#A7F3D0',
    glow: 'rgba(52, 211, 153, 0.4)',
    frameShape: 'shield',
    gemColor: '#10B981',
    themeTitle: 'MINT SAGE',
  },
  sets_60: {
    // 冰川藍銀 · 精密標靶與耐力刻度
    rim: ['#FFFFFF', '#64748B', '#1E293B'],
    innerRim: ['#A5F3FC', '#0891B2'],
    core: ['#061F26', '#020D10'],
    accent: '#22D3EE',
    highlight: '#E0F2FE',
    glow: 'rgba(34, 211, 238, 0.45)',
    frameShape: 'octagon',
    gemColor: '#06B6D4',
    themeTitle: 'GLACIER CYAN',
  },
  sets_150: {
    // 熔岩橘紅 · 機械齒輪與能量核心
    rim: ['#FFEDD5', '#EA580C', '#7C2D12'],
    innerRim: ['#FDBA74', '#C2410C'],
    core: ['#301205', '#130602'],
    accent: '#FB923C',
    highlight: '#FEF08A',
    glow: 'rgba(251, 146, 60, 0.5)',
    frameShape: 'crest',
    gemColor: '#F97316',
    themeTitle: 'MOLTEN COPPER',
  },
  sets_500: {
    // 幻紫蘭花 · 巨鑽與榮譽環
    rim: ['#F5D0FE', '#9333EA', '#4C1D95'],
    innerRim: ['#E879F9', '#7E22CE'],
    core: ['#230830', '#0C0212'],
    accent: '#D8B4FE',
    highlight: '#FAF5FF',
    glow: 'rgba(216, 180, 254, 0.6)',
    frameShape: 'diamond',
    gemColor: '#C084FC',
    themeTitle: 'PHANTOM CRYSTAL',
  },

  // ──────── 4. 重量突破 ────────
  heavy_50kg: {
    // 橘銅黑鐵 · 壺鈴並標示 50 KG
    rim: ['#FED7AA', '#9A3412', '#431407'],
    innerRim: ['#FDBA74', '#7C2D12'],
    core: ['#2B1206', '#100602'],
    accent: '#FB923C',
    highlight: '#FFEDD5',
    glow: 'rgba(251, 146, 60, 0.45)',
    frameShape: 'circle',
    gemColor: '#EA580C',
    themeTitle: 'FORGED BRONZE',
  },
  heavy_80kg: {
    // 電光藍白銀 · 突破閃電並標示 80 KG
    rim: ['#E0F2FE', '#0284C7', '#0369A1'],
    innerRim: ['#7DD3FC', '#0369A1'],
    core: ['#071F2E', '#020C13'],
    accent: '#0EA5E9',
    highlight: '#E0F2FE',
    glow: 'rgba(14, 165, 233, 0.55)',
    frameShape: 'diamond',
    gemColor: '#38BDF8',
    themeTitle: 'SONIC LIGHTNING',
  },
  heavy_100kg: {
    // 赤紅黑鋼金 · 醒目 100 數字與力量爆發
    rim: ['#FEE2E2', '#DC2626', '#7F1D1D'],
    innerRim: ['#FCA5A5', '#B91C1C'],
    core: ['#300707', '#120202'],
    accent: '#EF4444',
    highlight: '#FDE047',
    glow: 'rgba(239, 68, 68, 0.65)',
    frameShape: 'octagon',
    gemColor: '#F87171',
    themeTitle: 'BERSERKER MAGMA',
  },
  bench_pr: {
    // 猩紅玫瑰金 · 臥推槓鈴與胸部力量意象
    rim: ['#FFE4E6', '#E11D48', '#881337'],
    innerRim: ['#FDA4AF', '#BE123C'],
    core: ['#280610', '#100206'],
    accent: '#F43F5E',
    highlight: '#FECDD3',
    glow: 'rgba(244, 63, 94, 0.55)',
    frameShape: 'shield',
    gemColor: '#FB7185',
    themeTitle: 'CRIMSON VALOR',
  },
  squat_pr: {
    // 翡翠綠古銅金 · 深蹲槓鈴與力量基座
    rim: ['#DCFCE7', '#16A34A', '#14532D'],
    innerRim: ['#86EFAC', '#15803D'],
    core: ['#072418', '#020F0A'],
    accent: '#22C55E',
    highlight: '#BBF7D0',
    glow: 'rgba(34, 197, 94, 0.5)',
    frameShape: 'crest',
    gemColor: '#10B981',
    themeTitle: 'TITAN JADE',
  },

  // ──────── 5. 習慣打卡與時段 ────────
  active_days_3: {
    // 烈焰橘金 · 三重漸層升騰火焰
    rim: ['#FEF3C7', '#EA580C', '#7C2D12'],
    innerRim: ['#FDBA74', '#C2410C'],
    core: ['#2B1004', '#110501'],
    accent: '#F97316',
    highlight: '#FDE047',
    glow: 'rgba(249, 115, 22, 0.45)',
    frameShape: 'shield',
    gemColor: '#F59E0B',
    themeTitle: 'RISING FLAME',
  },
  active_days_7: {
    // 太陽金色 · 七顆星體與七日軌道
    rim: ['#FEF9C3', '#CA8A04', '#713F12'],
    innerRim: ['#FDE047', '#A16207'],
    core: ['#2B1C03', '#110A01'],
    accent: '#EAB308',
    highlight: '#FEF9C3',
    glow: 'rgba(234, 179, 8, 0.5)',
    frameShape: 'circle',
    gemColor: '#FDE047',
    themeTitle: 'SOLAR ORBIT',
  },
  active_days_14: {
    // 皇家紫帝王金 · 雙重盾牌與 14 星辰
    rim: ['#EDE9FE', '#7C3AED', '#4C1D95'],
    innerRim: ['#C4B5FD', '#6D28D9'],
    core: ['#1C0D36', '#090314'],
    accent: '#A78BFA',
    highlight: '#FDE047',
    glow: 'rgba(167, 139, 250, 0.55)',
    frameShape: 'crest',
    gemColor: '#C4B5FD',
    themeTitle: 'DUAL AEGIS',
  },
  active_days_30: {
    // 赤金日冕 · 日曆與永恆八芒自律之星
    rim: ['#FEF9C3', '#EA580C', '#9A3412'],
    innerRim: ['#FDE047', '#C2410C'],
    core: ['#2E0E03', '#120401'],
    accent: '#F59E0B',
    highlight: '#FDE047',
    glow: 'rgba(245, 158, 11, 0.7)',
    frameShape: 'crown',
    gemColor: '#EF4444',
    themeTitle: 'ETERNAL CORONA',
  },
  morning_lifter: {
    // 晨曦珊瑚橘 · 暖金朝陽與晨練小啞鈴
    rim: ['#FFEDD5', '#F97316', '#9A3412'],
    innerRim: ['#FED7AA', '#EA580C'],
    core: ['#2A1106', '#110602'],
    accent: '#FB923C',
    highlight: '#FDE047',
    glow: 'rgba(251, 146, 60, 0.5)',
    frameShape: 'crest',
    gemColor: '#FDBA74',
    themeTitle: 'DAWN SUNRISE',
  },
  night_owl_lifter: {
    // 午夜深空靛藍 · 晶瑩弦月、星辰與槓鈴
    rim: ['#E0E7FF', '#4F46E5', '#312E81'],
    innerRim: ['#A5B4FC', '#3730A3'],
    core: ['#0E1133', '#040616'],
    accent: '#6366F1',
    highlight: '#38BDF8',
    glow: 'rgba(99, 102, 241, 0.55)',
    frameShape: 'shield',
    gemColor: '#818CF8',
    themeTitle: 'ASTRAL NIGHT',
  },

  // ──────── 6. 全面鍛鍊 ────────
  leg_day_hero: {
    // 斯巴達碧玉金 · 腿部護甲與股四頭肌中軸羽紋
    rim: ['#DCFCE7', '#059669', '#1E3A8A'],
    innerRim: ['#6EE7B7', '#047857'],
    core: ['#092117', '#030E09'],
    accent: '#10B981',
    highlight: '#F59E0B',
    glow: 'rgba(16, 185, 129, 0.5)',
    frameShape: 'shield',
    gemColor: '#F59E0B',
    themeTitle: 'SPARTAN GREAVE',
  },
  all_muscle_master: {
    // 彩虹稜鏡星核 · 六色寶石節點與六角能量核心
    rim: ['#F43F5E', '#A855F7', '#06B6D4'],
    innerRim: ['#EC4899', '#3B82F6'],
    core: ['#1A0C2E', '#080312'],
    accent: '#EC4899',
    highlight: '#22D3EE',
    glow: 'rgba(236, 72, 153, 0.65)',
    frameShape: 'hex',
    gemColor: '#CCFF00',
    themeTitle: 'PRISMATIC CORE',
  },
};

/**
 * 依稀有度與類別提供預設回退主題
 */
export function getDefaultRarityTheme(rarity: AchievementRarity, category?: AchievementCategory): MedalVisualTheme {
  switch (rarity) {
    case 'legendary':
      return {
        rim: ['#FEF9C3', '#D97706', '#78350F'],
        innerRim: ['#FDE047', '#B45309'],
        core: ['#251403', '#0D0601'],
        accent: '#F59E0B',
        highlight: '#FEF9C3',
        glow: 'rgba(245, 158, 11, 0.65)',
        frameShape: 'crown',
        gemColor: '#EF4444',
        themeTitle: 'LEGENDARY GOLD',
      };
    case 'epic':
      return {
        rim: ['#F5D0FE', '#9333EA', '#4C1D95'],
        innerRim: ['#E879F9', '#7E22CE'],
        core: ['#230830', '#0C0212'],
        accent: '#C084FC',
        highlight: '#FAF5FF',
        glow: 'rgba(192, 132, 252, 0.55)',
        frameShape: 'diamond',
        gemColor: '#E879F9',
        themeTitle: 'EPIC AMETHYST',
      };
    case 'rare':
      return {
        rim: ['#DCFCE7', '#059669', '#064E3B'],
        innerRim: ['#6EE7B7', '#047857'],
        core: ['#072418', '#020F0A'],
        accent: '#10B981',
        highlight: '#BBF7D0',
        glow: 'rgba(16, 185, 129, 0.5)',
        frameShape: 'shield',
        gemColor: '#34D399',
        themeTitle: 'RARE EMERALD',
      };
    case 'common':
    default:
      return {
        rim: ['#FFFFFF', '#94A3B8', '#334155'],
        innerRim: ['#E2E8F0', '#64748B'],
        core: ['#1E293B', '#090D14'],
        accent: '#38BDF8',
        highlight: '#F0F9FF',
        glow: 'rgba(56, 189, 248, 0.4)',
        frameShape: 'octagon',
        gemColor: '#94A3B8',
        themeTitle: 'COMMON TITANIUM',
      };
  }
}

export interface AchievementIconOptions {
  accent?: string;
  highlight?: string;
  category?: AchievementCategory;
  unlocked?: boolean;
}

/**
 * 26 項成就專屬圖案輔助函式 (getIconForAchievement)
 * 針對現有 26 項成就 ID，分別對應啞鈴、槓鈴、火焰、數字、閃電、獎杯等不同充滿質感的彩色 SVG 造型。
 * 使用純向量圖形，兼具飽滿色彩面積與立體反光刻面，48px~88px 皆極具收藏感！
 */
export function getIconForAchievement(
  achievementId: string | undefined,
  options?: AchievementIconOptions | { accent: string; highlight: string; rim?: string[] }
): React.ReactElement {
  const accent = options?.accent || '#CCFF00';
  const highlight = options?.highlight || '#FFFFFF';
  const category = (options as AchievementIconOptions)?.category;
  const unlocked = (options as AchievementIconOptions)?.unlocked ?? true;

  switch (achievementId) {
    // ──────── 1. 訓練歷程 ────────
    case 'first_workout':
      // Lightweight 啟航：立體斜角雙頭鍛鋼啞鈴＋四芒冰晶啟動星辰
      return (
        <g transform="translate(50, 50)">
          <g transform="rotate(-35)">
            {/* 槓心手柄與握把防滑紋 */}
            <rect x="-14" y="-3.2" width="28" height="6.4" rx="2" fill={accent} stroke="#000000" strokeWidth="0.8" />
            <line x1="-6" y1="-3" x2="-6" y2="3" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
            <line x1="6" y1="-3" x2="6" y2="3" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
            {/* 左右大槓片立體外沿 */}
            <rect x="-18.5" y="-9.5" width="4.5" height="19" rx="2" fill={highlight} stroke="#000000" strokeWidth="0.8" />
            <rect x="-14" y="-7.5" width="2.5" height="15" rx="1" fill={accent} />
            <rect x="14" y="-9.5" width="4.5" height="19" rx="2" fill={highlight} stroke="#000000" strokeWidth="0.8" />
            <rect x="11.5" y="-7.5" width="2.5" height="15" rx="1" fill={accent} />
          </g>
          {/* 右上方璀璨啟蒙之星 (帶高光與中心晶體) */}
          <polygon 
            points="14,-20 16.5,-12 24,-12 17.5,-7.5 20,0 14,-4.5 8,0 10.5,-7.5 4,-12 11.5,-12" 
            fill={highlight} 
            stroke="#000000"
            strokeWidth="0.8"
          />
          <circle cx="14" cy="-9.5" r="2" fill={accent} stroke="#000000" strokeWidth="0.5" />
        </g>
      );

    case 'workouts_5':
      // 漸入佳境：5 次拱形星辰寶石＋鍛造槓鈴
      return (
        <g transform="translate(50, 50)">
          {/* 橫向厚重槓鈴 */}
          <rect x="-21" y="2" width="42" height="5.5" rx="2" fill={accent} stroke="#000000" strokeWidth="0.8" />
          <rect x="-21" y="-4.5" width="4" height="18" rx="1.5" fill={highlight} stroke="#000000" strokeWidth="0.8" />
          <rect x="17" y="-4.5" width="4" height="18" rx="1.5" fill={highlight} stroke="#000000" strokeWidth="0.8" />
          {/* 上方 5 顆弧形燃燒星火寶石 */}
          {[-16, -8, 0, 8, 16].map((x, i) => {
            const y = -13 + Math.abs(x) * 0.35;
            const isCenter = i === 2;
            return (
              <g key={i} transform={`translate(${x}, ${y})`}>
                <polygon 
                  points="0,-4.5 3.5,0 0,4.5 -3.5,0" 
                  fill={isCenter ? highlight : accent} 
                  stroke="#000000" 
                  strokeWidth="0.6" 
                />
                <circle cx="0" cy="0" r={isCenter ? 1.8 : 1.2} fill="#FFFFFF" />
              </g>
            );
          })}
          <path d="M -16,-6 Q 0,-16 16,-6" fill="none" stroke={highlight} strokeWidth="1.2" strokeDasharray="2 2" />
        </g>
      );

    case 'workouts_10':
      // 百煉成鋼：立體金色「X」與青玉月桂冠雙翼
      return (
        <g transform="translate(50, 50)">
          {/* 雙翼翠玉月桂枝 */}
          <path d="M -18,11 C -24,2 -21,-8 -12,-14" fill="none" stroke={accent} strokeWidth="2.8" strokeLinecap="round" />
          <path d="M 18,11 C 24,2 21,-8 12,-14" fill="none" stroke={accent} strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="-19" cy="-1" r="2.2" fill={highlight} stroke="#000000" strokeWidth="0.6" />
          <circle cx="19" cy="-1" r="2.2" fill={highlight} stroke="#000000" strokeWidth="0.6" />
          <circle cx="-14" cy="-10" r="1.8" fill={highlight} />
          <circle cx="14" cy="-10" r="1.8" fill={highlight} />
          {/* 羅馬數字 X 立體浮雕 */}
          <path d="M -11,-12 L 11,12 M 11,-12 L -11,12" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
          <path d="M -11,-12 L 11,12 M 11,-12 L -11,12" stroke={highlight} strokeWidth="4" strokeLinecap="round" />
          <path d="M -11,-12 L 11,12" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      );

    case 'workouts_25':
      // 鋼鐵巨獸：立體紫晶 25 號槓片＋戰龍雙角獸爪
      return (
        <g transform="translate(50, 50)">
          {/* 左右狂暴雙獸角 */}
          <path d="M -18,-15 C -10,-8 -10,8 -18,15" fill="none" stroke={highlight} strokeWidth="3.8" strokeLinecap="round" />
          <path d="M 18,-15 C 10,-8 10,8 18,15" fill="none" stroke={highlight} strokeWidth="3.8" strokeLinecap="round" />
          {/* 中央 25 號槓片輪廓 */}
          <circle cx="0" cy="0" r="16.5" fill={accent} stroke="#000000" strokeWidth="1.4" />
          <circle cx="0" cy="0" r="12" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeDasharray="3 2" />
          <circle cx="0" cy="0" r="5" fill="#12041D" stroke={highlight} strokeWidth="1.5" />
          {/* 25 鋼印數字字樣 */}
          <text x="0" y="3.5" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900" fontFamily="sans-serif">25</text>
        </g>
      );

    case 'workouts_50':
      // 耶巴蒂信徒：帝王金冠＋紅寶石＋王道槓鈴
      return (
        <g transform="translate(50, 50)">
          {/* 底部神聖金槓鈴 */}
          <rect x="-22" y="10" width="44" height="4.5" rx="1.5" fill={accent} stroke="#000000" strokeWidth="0.8" />
          <rect x="-22" y="6" width="3.5" height="12" rx="1" fill={highlight} stroke="#000000" strokeWidth="0.6" />
          <rect x="18.5" y="6" width="3.5" height="12" rx="1" fill={highlight} stroke="#000000" strokeWidth="0.6" />
          {/* 五芒王者皇冠 (金黃與紅寶石) */}
          <polygon 
            points="-16,7 -14,-9 -7,-2 0,-14 7,-2 14,-9 16,7" 
            fill={accent} 
            stroke="#000000" 
            strokeWidth="1.4" 
            strokeLinejoin="round" 
          />
          <polygon points="-6,7 -3,1 0,7" fill={highlight} />
          <polygon points="6,7 3,1 0,7" fill={highlight} />
          <circle cx="-14" cy="-9" r="2.2" fill={highlight} stroke="#000000" strokeWidth="0.5" />
          <circle cx="0" cy="-14" r="2.8" fill="#FFFFFF" stroke="#000000" strokeWidth="0.5" />
          <circle cx="14" cy="-9" r="2.2" fill={highlight} stroke="#000000" strokeWidth="0.5" />
          <circle cx="0" cy="0" r="3.5" fill={highlight} stroke="#000000" strokeWidth="0.8" />
        </g>
      );

    // ──────── 2. 起重容量 ────────
    case 'volume_1t':
      // 千斤推舉：奧林匹克三孔鑄鐵槓片＋立體「1T」銘牌
      return (
        <g transform="translate(50, 50)">
          <circle cx="0" cy="0" r="18.5" fill={accent} stroke="#000000" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="14.5" fill="#0A1828" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          {/* 3 個抓握把孔 */}
          <ellipse cx="0" cy="-9.5" rx="4" ry="2" fill={highlight} stroke="#000000" strokeWidth="0.8" />
          <ellipse cx="-8" cy="5" rx="4" ry="2" transform="rotate(-60 -8 5)" fill={highlight} stroke="#000000" strokeWidth="0.8" />
          <ellipse cx="8" cy="5" rx="4" ry="2" transform="rotate(60 8 5)" fill={highlight} stroke="#000000" strokeWidth="0.8" />
          {/* 中央立體 1T 銘牌 */}
          <rect x="-8.5" y="-5" width="17" height="10" rx="2" fill="#020813" stroke={highlight} strokeWidth="1" />
          <text x="0" y="2.5" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="900" fontFamily="sans-serif">1T</text>
        </g>
      );

    case 'volume_10t':
      // 十噸主宰：階梯式三層青玉立體槓片塔＋衝頂破空力量箭頭
      return (
        <g transform="translate(50, 50)">
          {/* 三層由大至小的槓片立體橢圓 */}
          <ellipse cx="0" cy="9" rx="19" ry="6" fill={accent} stroke="#000000" strokeWidth="1.2" />
          <ellipse cx="0" cy="2" rx="15" ry="5" fill={highlight} stroke="#000000" strokeWidth="1.2" />
          <ellipse cx="0" cy="-5" rx="10.5" ry="4" fill="#E0F2FE" stroke="#000000" strokeWidth="0.8" />
          {/* 向上衝破的力量箭矢 */}
          <polygon points="0,-18 5,-11 2,-11 2,4 -2,4 -2,-11 -5,-11" fill="#FFFFFF" stroke="#000000" strokeWidth="0.8" />
          <circle cx="0" cy="-6" r="2.2" fill={accent} />
        </g>
      );

    case 'volume_50t':
      // 五十噸狂暴：鋼鐵重砧＋火山噴發雙重暴擊箭頭與火花
      return (
        <g transform="translate(50, 50)">
          {/* 鐵砧主體與厚座 */}
          <polygon points="-16,-2 16,-2 12,8 -12,8" fill={accent} stroke="#000000" strokeWidth="1.4" />
          <rect x="-19" y="8" width="38" height="6.5" rx="1.5" fill={highlight} stroke="#000000" strokeWidth="1.2" />
          {/* 雙向下衝擊波力量錐 */}
          <polygon points="0,-4 7,-13 3,-13 3,-18 -3,-18 -3,-13 -7,-13" fill="#FFFFFF" stroke="#000000" strokeWidth="0.8" />
          <polygon points="-12,-8 -9,-14 -15,-14" fill={highlight} />
          <polygon points="12,-8 15,-14 9,-14" fill={highlight} />
        </g>
      );

    case 'volume_100t':
      // 百噸神話：雙多立克神廟巨柱＋「100T」宏偉拱心石與光耀萬丈核心
      return (
        <g transform="translate(50, 50)">
          <rect x="-21" y="12" width="42" height="4.5" rx="1" fill={accent} stroke="#000000" strokeWidth="0.8" />
          {/* 左右神柱 */}
          <rect x="-17.5" y="-4" width="4.5" height="16" fill={highlight} stroke="#000000" strokeWidth="0.8" />
          <rect x="13" y="-4" width="4.5" height="16" fill={highlight} stroke="#000000" strokeWidth="0.8" />
          {/* 宏偉拱心頂 */}
          <path d="M -18,-4 Q 0,-18 18,-4" fill="none" stroke={accent} strokeWidth="4.2" strokeLinecap="round" />
          {/* 拱門中央 100T 標記 */}
          <rect x="-11" y="-7.5" width="22" height="10" rx="2" fill="#150802" stroke={highlight} strokeWidth="1" />
          <text x="0" y="0" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">100T</text>
        </g>
      );

    // ──────── 3. 組數毅力 ────────
    case 'sets_15':
      // 組數起步：三層充能組數卡槽＋翠綠立體 Check 標記
      return (
        <g transform="translate(50, 50)">
          <rect x="-16" y="-13" width="32" height="6.5" rx="2" fill={accent} stroke="#000000" strokeWidth="0.8" />
          <rect x="-16" y="-3.5" width="32" height="6.5" rx="2" fill={accent} stroke="#000000" strokeWidth="0.8" />
          <rect x="-16" y="6" width="32" height="6.5" rx="2" fill="rgba(255,255,255,0.2)" stroke={highlight} strokeWidth="1" />
          {/* 第一層完成 Check */}
          <path d="M 6,-11 L 9,-8 L 15,-14" fill="none" stroke="#000000" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 6,-11 L 9,-8 L 15,-14" fill="none" stroke={highlight} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          {/* 第二層完成 Check */}
          <path d="M 6,-1.5 L 9,1.5 L 15,-4.5" fill="none" stroke="#000000" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 6,-1.5 L 9,1.5 L 15,-4.5" fill="none" stroke={highlight} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );

    case 'sets_60':
      // 力竭藝術：高精密同心雷達標靶與 60 度耐力刻度
      return (
        <g transform="translate(50, 50)">
          <circle cx="0" cy="0" r="17.5" fill="none" stroke={accent} strokeWidth="2.8" />
          <circle cx="0" cy="0" r="10.5" fill="none" stroke={highlight} strokeWidth="1.8" strokeDasharray="3 2" />
          <circle cx="0" cy="0" r="4.5" fill={accent} stroke="#000000" strokeWidth="1" />
          <circle cx="0" cy="0" r="1.8" fill="#FFFFFF" />
          {/* 十字雷達指針 */}
          <line x1="-19" y1="0" x2="-11" y2="0" stroke={highlight} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="11" y1="0" x2="19" y2="0" stroke={highlight} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="0" y1="-19" x2="0" y2="-11" stroke={highlight} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="0" y1="11" x2="0" y2="19" stroke={highlight} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      );

    case 'sets_150':
      // 鋼鐵機關槍：8 齒重型連發齒輪＋超載能量核心
      return (
        <g transform="translate(50, 50)">
          <circle cx="0" cy="0" r="12" fill={accent} stroke="#000000" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="5.5" fill="#170903" stroke={highlight} strokeWidth="1.8" />
          <circle cx="0" cy="0" r="2.5" fill={highlight} />
          {/* 8 顆機關齒輪齒牙 */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <rect 
              key={deg} 
              x="-2.5" 
              y="-17.5" 
              width="5" 
              height="6.5" 
              rx="1" 
              transform={`rotate(${deg})`} 
              fill={highlight} 
              stroke="#000000" 
              strokeWidth="0.8" 
            />
          ))}
        </g>
      );

    case 'sets_500':
      // 千錘百鍊：不毀紫晶巨鑽堡壘＋持久榮譽桂冠
      return (
        <g transform="translate(50, 50)">
          {/* 璀璨五面多切面寶石 */}
          <polygon points="0,-17 16,-4 10,14 -10,14 -16,-4" fill={accent} stroke="#000000" strokeWidth="1.6" strokeLinejoin="round" />
          <polygon points="0,-17 16,-4 0,0" fill="rgba(255,255,255,0.4)" />
          <polygon points="0,-17 -16,-4 0,0" fill="rgba(0,0,0,0.25)" />
          <polygon points="0,0 16,-4 10,14" fill="rgba(255,255,255,0.15)" />
          <polygon points="0,0 -16,-4 -10,14" fill="rgba(0,0,0,0.3)" />
          <polygon points="0,-8 7,1 0,9 -7,1" fill={highlight} stroke="#000000" strokeWidth="0.8" />
          <circle cx="0" cy="1" r="2.2" fill="#FFFFFF" />
        </g>
      );

    // ──────── 4. 重量突破 ────────
    case 'heavy_50kg':
      // 五十公斤重擊：厚重鑄鐵戰鬥壺鈴＋清楚顯示「50 KG」＋地面震波
      return (
        <g transform="translate(50, 50)">
          {/* 弧形實心把手 */}
          <path d="M -8,-9 C -8,-16 8,-16 8,-9" fill="none" stroke={highlight} strokeWidth="3.6" strokeLinecap="round" />
          {/* 壺鈴球體 */}
          <circle cx="0" cy="2" r="13.5" fill={accent} stroke="#000000" strokeWidth="1.6" />
          <ellipse cx="-4" cy="-3" rx="4" ry="2" fill="rgba(255,255,255,0.5)" />
          {/* 清楚顯示「50 KG」字樣銘牌 */}
          <rect x="-10" y="-1.5" width="20" height="9" rx="2" fill="#1F0D04" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
          <text x="0" y="5" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">50 KG</text>
          {/* 地面震波 */}
          <line x1="-16" y1="17.5" x2="16" y2="17.5" stroke={highlight} strokeWidth="2.8" strokeLinecap="round" />
        </g>
      );

    case 'heavy_80kg':
      // 破風八十：音速破風之矢刺穿重量環＋清楚顯示「80 KG」
      return (
        <g transform="translate(50, 50)">
          <circle cx="0" cy="0" r="16.5" fill="none" stroke={accent} strokeWidth="2.8" />
          <circle cx="0" cy="0" r="11" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeDasharray="3 2" />
          {/* 破空箭矢 */}
          <path d="M -16,14 L 16,-14" stroke="#000000" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M -16,14 L 16,-14" stroke={highlight} strokeWidth="3.5" strokeLinecap="round" />
          <polygon points="12,-18 19,-14 15,-7" fill="#FFFFFF" stroke="#000000" strokeWidth="0.8" />
          {/* 清楚顯示「80 KG」文字條 */}
          <rect x="-10" y="-4.5" width="20" height="9" rx="2" fill="#04121E" stroke={highlight} strokeWidth="1" />
          <text x="0" y="2.2" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">80 KG</text>
        </g>
      );

    case 'heavy_100kg':
      // 三位數霸者：破百「100」黃金立體鋼印銘牌＋四射狂暴赤紅電光
      return (
        <g transform="translate(50, 50)">
          {/* 狂暴雙重外環 */}
          <circle cx="0" cy="0" r="18" fill="none" stroke={accent} strokeWidth="2.8" strokeDasharray="5 2" />
          {/* 金塊銘牌 */}
          <rect x="-16.5" y="-9" width="33" height="18" rx="3" fill={highlight} stroke="#000000" strokeWidth="1.4" />
          <rect x="-14.5" y="-7" width="29" height="14" rx="2" fill="#1A0404" stroke={accent} strokeWidth="1" />
          <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="900" fontFamily="monospace">100</text>
        </g>
      );

    case 'bench_pr':
      // 胸肌推土機：臥推長槓＋胸大肌強烈上推力量戰斗三角
      return (
        <g transform="translate(50, 50)">
          {/* 臥推重槓與雙片包膠 */}
          <line x1="-22" y1="-4" x2="22" y2="-4" stroke="#000000" strokeWidth="4.8" strokeLinecap="round" />
          <line x1="-22" y1="-4" x2="22" y2="-4" stroke={highlight} strokeWidth="3.2" strokeLinecap="round" />
          <rect x="-20" y="-11" width="4" height="14" rx="1.5" fill={accent} stroke="#000000" strokeWidth="0.8" />
          <rect x="16" y="-11" width="4" height="14" rx="1.5" fill={accent} stroke="#000000" strokeWidth="0.8" />
          {/* 胸部上推三角與肌群羽紋 */}
          <polygon points="0,-16 6,-8 -6,-8" fill="#FFFFFF" stroke="#000000" strokeWidth="0.8" />
          <path d="M -10,13 Q 0,4 10,13" fill="none" stroke={accent} strokeWidth="3.8" strokeLinecap="round" />
          <circle cx="0" cy="7" r="2.8" fill={highlight} />
        </g>
      );

    case 'squat_pr':
      // 深蹲無畏：深蹲長槓＋泰坦地基三角支撐臂
      return (
        <g transform="translate(50, 50)">
          {/* 扛肩深蹲長槓 */}
          <line x1="-22" y1="-8" x2="22" y2="-8" stroke="#000000" strokeWidth="4.8" strokeLinecap="round" />
          <line x1="-22" y1="-8" x2="22" y2="-8" stroke={highlight} strokeWidth="3.2" strokeLinecap="round" />
          <rect x="-20" y="-15" width="4.5" height="14" rx="1.5" fill={accent} stroke="#000000" strokeWidth="0.8" />
          <rect x="15.5" y="-15" width="4.5" height="14" rx="1.5" fill={accent} stroke="#000000" strokeWidth="0.8" />
          {/* 堅不可摧深蹲三角底座 */}
          <polygon points="-12,-3 12,-3 6,15 -6,15" fill={accent} stroke="#000000" strokeWidth="1.4" />
          <polygon points="-4,-3 4,-3 0,7" fill={highlight} />
        </g>
      );

    // ──────── 5. 習慣打卡與時段 ────────
    case 'active_days_3':
      // 三日不懈：三重漸層升騰立體火舌
      return (
        <g transform="translate(50, 50)">
          {/* 外層大火舌 */}
          <path d="M 0,16 C -8,11 -13,4 -9,-5 C -7,-12 0,-18 0,-18 C 0,-18 7,-12 9,-5 C 13,4 8,11 0,16 Z" fill={accent} stroke="#000000" strokeWidth="1.2" />
          {/* 中層金黃火焰 */}
          <path d="M 0,12 C -5,8 -9,2 -6,-4 C -4,-9 0,-13 0,-13 C 0,-13 4,-9 6,-4 C 9,2 5,8 0,12 Z" fill={highlight} />
          {/* 核心白熾火種 */}
          <path d="M 0,8 C -2,5 -4,1 -3,-2 C -2,-5 0,-8 0,-8 C 0,-8 2,-5 3,-2 C 4,1 2,5 0,8 Z" fill="#FFFFFF" />
        </g>
      );

    case 'active_days_7':
      // 週循環達人：七天星軌圓環＋中央恆久不滅自律火種
      return (
        <g transform="translate(50, 50)">
          <circle cx="0" cy="0" r="16.5" fill="none" stroke={accent} strokeWidth="2.2" strokeDasharray="3 3" />
          {/* 七顆環繞能量行星 */}
          {[0, 51.4, 102.8, 154.2, 205.6, 257, 308.4].map((deg, i) => (
            <circle 
              key={deg} 
              cx={16.5 * Math.sin((deg * Math.PI) / 180)} 
              cy={-16.5 * Math.cos((deg * Math.PI) / 180)} 
              r={i === 0 ? "3.2" : "2.4"} 
              fill={i === 0 ? "#FFFFFF" : highlight} 
              stroke="#000000"
              strokeWidth="0.6"
            />
          ))}
          {/* 中央火種 */}
          <path d="M 0,7 C -4,4 -6,0 -3,-5 C 0,-10 0,-10 0,-10 C 0,-10 0,-10 3,-5 C 6,0 4,4 0,7 Z" fill={accent} stroke="#000000" strokeWidth="0.8" />
          <circle cx="0" cy="1" r="2.2" fill={highlight} />
        </g>
      );

    case 'active_days_14':
      // 自律二週：雙盾交疊雙週打卡守護徽＋「14」星辰金印
      return (
        <g transform="translate(50, 50)">
          {/* 後盾 */}
          <polygon points="-11,-15 8,-15 14,2 0,16 -14,2" fill={accent} stroke="#000000" strokeWidth="1.4" />
          {/* 前盾 */}
          <polygon points="-2,-11 17,-11 23,6 8,20 -7,6" fill={highlight} stroke="#000000" strokeWidth="1.4" />
          <polygon points="8,-7 14,4 8,15 2,4" fill="#20103E" />
          <text x="8" y="7.5" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="900" fontFamily="sans-serif">14</text>
        </g>
      );

    case 'active_days_30':
      // 鋼鐵月曆：30 天全月滿貫大日芒星冠＋翻頁金鉤
      return (
        <g transform="translate(50, 50)">
          {/* 月曆金屬牌板 */}
          <rect x="-14.5" y="-10" width="29" height="24" rx="3.5" fill={accent} stroke="#000000" strokeWidth="1.4" />
          <rect x="-12.5" y="-4" width="25" height="16" rx="2" fill="#1C0A04" />
          {/* 頂部雙金屬掛環 */}
          <rect x="-8.5" y="-14" width="3.2" height="6" rx="1.5" fill={highlight} stroke="#000000" strokeWidth="0.6" />
          <rect x="5.5" y="-14" width="3.2" height="6" rx="1.5" fill={highlight} stroke="#000000" strokeWidth="0.6" />
          {/* 30 天八芒金星 */}
          <polygon 
            points="0,-1 2.5,4 7.5,4 3.5,7.5 5,12.5 0,9.5 -5,12.5 -3.5,7.5 -7.5,4 -2.5,4" 
            fill={highlight} 
            stroke="#000000" 
            strokeWidth="0.8" 
          />
          <circle cx="0" cy="5.5" r="1.6" fill="#EF4444" />
        </g>
      );

    case 'morning_lifter':
      // 晨曦破曉：清晨地平線升起朝陽半圓與五道晨光＋晨練啞鈴
      return (
        <g transform="translate(50, 50)">
          {/* 地平線海天界限 */}
          <line x1="-20" y1="5" x2="20" y2="5" stroke={accent} strokeWidth="3.2" strokeLinecap="round" />
          {/* 升起的朝陽半圓 */}
          <path d="M -11,5 A 11 11 0 0 1 11 5 Z" fill={highlight} stroke="#000000" strokeWidth="0.8" />
          <circle cx="0" cy="5" r="5" fill="#FFFFFF" />
          {/* 五道放射晨曦之光 */}
          {[-60, -30, 0, 30, 60].map((deg) => (
            <line 
              key={deg} 
              x1="0" 
              y1="-13" 
              x2="0" 
              y2="-18" 
              transform={`rotate(${deg})`} 
              stroke={highlight} 
              strokeWidth="2.5" 
              strokeLinecap="round" 
            />
          ))}
          {/* 晨練小啞鈴 */}
          <g transform="translate(0, 11)">
            <rect x="-12" y="-2.2" width="24" height="4.4" rx="1" fill="#FFFFFF" stroke="#000000" strokeWidth="0.6" />
            <rect x="-14" y="-5.5" width="3" height="11" rx="1" fill={accent} stroke="#000000" strokeWidth="0.6" />
            <rect x="11" y="-5.5" width="3" height="11" rx="1" fill={accent} stroke="#000000" strokeWidth="0.6" />
          </g>
        </g>
      );

    case 'night_owl_lifter':
      // 夜行巨獸：午夜深空晶瑩弦月＋守夜星光＋靜音夜練槓鈴
      return (
        <g transform="translate(50, 50)">
          {/* 彎月形狀 */}
          <path 
            d="M 6,-16 A 16 16 0 1 0 17 8 A 13 13 0 1 1 6 -16 Z" 
            fill={highlight} 
            stroke="#000000" 
            strokeWidth="1.2" 
          />
          {/* 守夜星芒 */}
          <polygon points="-8,-8 -6,-5 -3,-5 -5,-2 -4,2 -8,0 -12,2 -11,-2 -13,-5 -10,-5" fill="#FFFFFF" />
          {/* 靜夜槓鈴 */}
          <line x1="-16" y1="12" x2="12" y2="12" stroke="#000000" strokeWidth="3.8" strokeLinecap="round" />
          <line x1="-16" y1="12" x2="12" y2="12" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
          <rect x="-16" y="8" width="3" height="8" rx="1" fill={highlight} stroke="#000000" strokeWidth="0.6" />
          <rect x="9" y="8" width="3" height="8" rx="1" fill={highlight} stroke="#000000" strokeWidth="0.6" />
        </g>
      );

    // ──────── 6. 全面鍛鍊 ────────
    case 'leg_day_hero':
      // 不逃避練腿：戰士腿甲盾面＋股四頭肌力量羽狀肌紋中軸線
      return (
        <g transform="translate(50, 50)">
          {/* 斯巴達腿甲護脛 */}
          <polygon points="-13,-15 13,-15 16,3 0,18 -16,3" fill={accent} stroke="#000000" strokeWidth="1.4" strokeLinejoin="round" />
          <polygon points="-9,-12 9,-12 11,2 0,13 -11,2" fill="#062217" />
          {/* 股四頭肌中軸與人字形羽狀肌紋 */}
          <line x1="0" y1="-12" x2="0" y2="12" stroke={highlight} strokeWidth="2.8" strokeLinecap="round" />
          <path d="M -8,-6 L 0,0 L 8,-6 M -9,2 L 0,8 L 9,2" fill="none" stroke={highlight} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="0" cy="-12" r="2.2" fill="#F59E0B" />
        </g>
      );

    case 'all_muscle_master':
      // 全能幾何：六大肌群六彩寶石節點羅盤陣
      return (
        <g transform="translate(50, 50)">
          {/* 六角能量陣外框 */}
          <polygon points="0,-17 15,-8.5 15,8.5 0,17 -15,8.5 -15,-8.5" fill="none" stroke={highlight} strokeWidth="2.5" strokeLinejoin="round" />
          {/* 連結對角脈衝線 */}
          <line x1="0" y1="-17" x2="0" y2="17" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="-15" y1="-8.5" x2="15" y2="8.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="-15" y1="8.5" x2="15" y2="-8.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="2 2" />
          {/* 六大肌群專屬六色能量寶石節點 (胸-紅、背-藍、肩-金、腿-綠、臂-紫、核-青) */}
          {[
            { pos: [0, -17], color: '#EF4444' },    // 胸
            { pos: [15, -8.5], color: '#3B82F6' },  // 背
            { pos: [15, 8.5], color: '#F59E0B' },   // 肩
            { pos: [0, 17], color: '#10B981' },     // 腿
            { pos: [-15, 8.5], color: '#A855F7' },  // 臂
            { pos: [-15, -8.5], color: '#06B6D4' }, // 核心
          ].map((item, idx) => (
            <circle 
              key={idx} 
              cx={item.pos[0]} 
              cy={item.pos[1]} 
              r="3.5" 
              fill={item.color} 
              stroke="#000000" 
              strokeWidth="0.8" 
            />
          ))}
          {/* 中央聚合核心 */}
          <circle cx="0" cy="0" r="5.5" fill="#CCFF00" stroke="#000000" strokeWidth="1.2" />
          <circle cx="0" cy="0" r="2.2" fill="#FFFFFF" />
        </g>
      );

    default:
      // 分類預設回退符號
      if (category === 'milestone') {
        return (
          <g transform="translate(50, 50)">
            <rect x="-18" y="-3.5" width="36" height="7" rx="2" fill={accent} stroke="#000000" strokeWidth="0.8" />
            <rect x="-18" y="-9.5" width="4" height="19" rx="1.5" fill={highlight} stroke="#000000" strokeWidth="0.8" />
            <rect x="14" y="-9.5" width="4" height="19" rx="1.5" fill={highlight} stroke="#000000" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="4.5" fill="#FFFFFF" />
          </g>
        );
      }
      if (category === 'volume') {
        return (
          <g transform="translate(50, 50)">
            <circle cx="0" cy="0" r="17.5" fill={accent} stroke="#000000" strokeWidth="1.4" />
            <circle cx="0" cy="0" r="11" fill="#0F172A" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <circle cx="0" cy="0" r="4.5" fill={highlight} />
          </g>
        );
      }
      if (category === 'sets') {
        return (
          <g transform="translate(50, 50)">
            <circle cx="0" cy="0" r="16.5" fill="none" stroke={accent} strokeWidth="2.8" />
            <circle cx="0" cy="0" r="9.5" fill="none" stroke={highlight} strokeWidth="1.8" />
            <circle cx="0" cy="0" r="3.8" fill={highlight} />
          </g>
        );
      }
      if (category === 'strength') {
        return (
          <g transform="translate(50, 50)">
            <polygon points="0,-17 15,0 0,17 -15,0" fill={accent} stroke="#000000" strokeWidth="1.4" />
            <polygon points="2,-15 -7,-1 -1,-1 -3,15 7,0 1,0" fill={highlight} stroke="#000000" strokeWidth="0.8" />
          </g>
        );
      }
      if (category === 'consistency') {
        return (
          <g transform="translate(50, 50)">
            <path d="M 0,16 C -7,11 -12,4 -8,-5 C -5,-11 0,-17 0,-17 C 0,-17 5,-11 8,-5 C 12,4 7,11 0,16 Z" fill={accent} stroke="#000000" strokeWidth="1.2" />
            <circle cx="0" cy="2" r="3.5" fill={highlight} />
          </g>
        );
      }
      return (
        <g transform="translate(50, 50)">
          <polygon points="0,-16 14,-8 14,8 0,16 -14,8 -14,-8" fill={accent} stroke="#000000" strokeWidth="1.4" />
          <circle cx="0" cy="0" r="4.5" fill={highlight} />
        </g>
      );
  }
}

/**
 * 相容別名函式 (renderSpecificGlyph)
 */
export function renderSpecificGlyph(
  achievementId: string | undefined, 
  category: AchievementCategory, 
  colors: { accent: string; highlight: string; rim?: string[] },
  unlocked: boolean
) {
  return getIconForAchievement(achievementId, {
    accent: colors.accent,
    highlight: colors.highlight,
    category,
    unlocked,
  });
}

interface AchievementMedalProps {
  achievementId?: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  unlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * 彩色 RPG 收藏勳章實體雕刻組件 (Collectible Achievement Medal)
 * 外框形狀依專屬主題決定，具有三層立體金屬外框、下沉琺瑯色彩艙、倒角刻面、高光遮罩與專屬幾何圖案！
 */
export const AchievementMedal: React.FC<AchievementMedalProps> = ({
  achievementId,
  category,
  rarity,
  unlocked,
  size = 'md',
  className = '',
}) => {
  const pixelSize = size === 'sm' ? 44 : size === 'md' ? 56 : 88;
  const uniqueId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const idPrefix = `medal-${uniqueId}-${achievementId || category}-${rarity}-${unlocked ? 'u' : 'l'}-${size}`;

  // 1. 取得專屬視覺主題或稀有度預設回退
  const theme: MedalVisualTheme = 
    (achievementId && ACHIEVEMENT_VISUAL_THEMES[achievementId]) ||
    getDefaultRarityTheme(rarity, category);

  // 2. 解鎖狀態與鎖定狀態調色
  // 解鎖：飽滿的彩色金屬、寶石與琺瑯材質
  // 鎖定：保留精準可辨識的幾何外框與符騰輪廓，但呈暗調冷鍛深灰鋼鐵質感，並蓋上帝國安全鎖扣印
  const rimColors = unlocked ? theme.rim : ['#64748B', '#334155', '#1E293B'];
  const innerRimColors = unlocked ? theme.innerRim : ['#475569', '#1E293B'];
  const coreColors = unlocked ? theme.core : ['#181E29', '#0A0E17'];
  const accentColor = unlocked ? theme.accent : '#64748B';
  const highlightColor = unlocked ? theme.highlight : '#94A3B8';
  const frameShape = theme.frameShape;

  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {/* 解鎖狀態柔和氛圍外發光 */}
      {unlocked && (
        <div 
          className="absolute inset-0 rounded-full blur-md opacity-40 pointer-events-none transition-opacity duration-300"
          style={{ backgroundColor: theme.accent }}
        />
      )}

      <svg
        viewBox="0 0 100 100"
        width={pixelSize}
        height={pixelSize}
        className="relative z-10 overflow-visible drop-shadow-md select-none pointer-events-none"
      >
        <defs>
          {/* 第一層金屬外框漸層 */}
          <linearGradient id={`${idPrefix}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={rimColors[0]} />
            <stop offset="50%" stopColor={rimColors[1]} />
            <stop offset="100%" stopColor={rimColors[2]} />
          </linearGradient>

          {/* 第二層金屬內框漸層 */}
          <linearGradient id={`${idPrefix}-inner-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={innerRimColors[0]} />
            <stop offset="100%" stopColor={innerRimColors[1]} />
          </linearGradient>

          {/* 第三層彩色琺瑯底面漸層 */}
          <radialGradient id={`${idPrefix}-core`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={coreColors[0]} />
            <stop offset="100%" stopColor={coreColors[1]} />
          </radialGradient>

          {/* 鏡面高光濾鏡 */}
          <linearGradient id={`${idPrefix}-gloss`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          <filter id={`${idPrefix}-filter`} x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="3.5" stdDeviation="2.8" floodColor="#000000" floodOpacity="0.75" />
          </filter>
        </defs>

        {/* ─────────────────────────────────────────────────────────
            1. 第一層外框金屬造型 (7 大專屬造型輪廓)
           ───────────────────────────────────────────────────────── */}
        {frameShape === 'octagon' && (
          <polygon
            points="28,5 72,5 95,28 95,72 72,95 28,95 5,72 5,28"
            fill={`url(#${idPrefix}-rim)`}
            filter={`url(#${idPrefix}-filter)`}
            stroke="#000000"
            strokeWidth="1.6"
          />
        )}

        {frameShape === 'shield' && (
          <polygon
            points="50,4 93,18 85,73 50,96 15,73 7,18"
            fill={`url(#${idPrefix}-rim)`}
            filter={`url(#${idPrefix}-filter)`}
            stroke="#000000"
            strokeWidth="1.6"
          />
        )}

        {frameShape === 'diamond' && (
          <polygon
            points="50,4 95,36 78,93 22,93 5,36"
            fill={`url(#${idPrefix}-rim)`}
            filter={`url(#${idPrefix}-filter)`}
            stroke="#000000"
            strokeWidth="1.6"
          />
        )}

        {frameShape === 'crown' && (
          <polygon
            points="50,4 62,14 78,10 84,26 98,34 94,50 98,66 84,74 78,90 62,86 50,96 38,86 22,90 16,74 2,66 6,50 2,34 16,26 22,10 38,14"
            fill={`url(#${idPrefix}-rim)`}
            filter={`url(#${idPrefix}-filter)`}
            stroke="#000000"
            strokeWidth="1.6"
          />
        )}

        {frameShape === 'circle' && (
          <circle
            cx="50"
            cy="50"
            r="46"
            fill={`url(#${idPrefix}-rim)`}
            filter={`url(#${idPrefix}-filter)`}
            stroke="#000000"
            strokeWidth="1.6"
          />
        )}

        {frameShape === 'hex' && (
          <polygon
            points="50,4 92,27 92,73 50,96 8,73 8,27"
            fill={`url(#${idPrefix}-rim)`}
            filter={`url(#${idPrefix}-filter)`}
            stroke="#000000"
            strokeWidth="1.6"
          />
        )}

        {frameShape === 'crest' && (
          <polygon
            points="50,4 89,14 95,56 74,89 50,96 26,89 5,56 11,14"
            fill={`url(#${idPrefix}-rim)`}
            filter={`url(#${idPrefix}-filter)`}
            stroke="#000000"
            strokeWidth="1.6"
          />
        )}

        {/* ─────────────────────────────────────────────────────────
            2. 第二層精細金屬倒角內圈 (細緻刻線與明暗對比)
           ───────────────────────────────────────────────────────── */}
        {frameShape === 'octagon' && (
          <polygon
            points="30,9 70,9 91,30 91,70 70,91 30,91 9,70 9,30"
            fill={`url(#${idPrefix}-inner-rim)`}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.8"
          />
        )}
        {frameShape === 'shield' && (
          <polygon
            points="50,8 89,20 81,70 50,92 19,70 11,20"
            fill={`url(#${idPrefix}-inner-rim)`}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.8"
          />
        )}
        {frameShape === 'diamond' && (
          <polygon
            points="50,8 90,37 75,89 25,89 10,37"
            fill={`url(#${idPrefix}-inner-rim)`}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.8"
          />
        )}
        {frameShape === 'crown' && (
          <polygon
            points="50,8 60,16 74,13 80,26 93,34 89,49 93,63 80,71 74,86 60,82 50,92 40,82 26,86 20,71 7,63 11,49 7,34 20,26 26,13 40,16"
            fill={`url(#${idPrefix}-inner-rim)`}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.8"
          />
        )}
        {frameShape === 'circle' && (
          <circle
            cx="50"
            cy="50"
            r="42"
            fill={`url(#${idPrefix}-inner-rim)`}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.8"
          />
        )}
        {frameShape === 'hex' && (
          <polygon
            points="50,8 88,29 88,71 50,92 12,71 12,29"
            fill={`url(#${idPrefix}-inner-rim)`}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.8"
          />
        )}
        {frameShape === 'crest' && (
          <polygon
            points="50,8 85,17 90,55 71,86 50,92 29,86 10,55 15,17"
            fill={`url(#${idPrefix}-inner-rim)`}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.8"
          />
        )}

        {/* ─────────────────────────────────────────────────────────
            3. 第三層下沉彩色琺瑯底座與晶亮光澤
           ───────────────────────────────────────────────────────── */}
        <circle
          cx="50"
          cy="50"
          r="34"
          fill={`url(#${idPrefix}-core)`}
          stroke="#000000"
          strokeWidth="1.2"
        />

        {/* 上半部鏡面通透高光弧面 */}
        <path 
          d="M 18,46 A 34 34 0 0 1 82 46 A 34 20 0 0 0 18 46 Z" 
          fill={`url(#${idPrefix}-gloss)`} 
        />

        {/* 琺瑯外環金屬刻線圈 */}
        <circle
          cx="50"
          cy="50"
          r="31"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.2"
          strokeDasharray={unlocked ? 'none' : '3 2'}
          opacity={unlocked ? 0.85 : 0.25}
        />

        {/* 8 顆精緻琺瑯金珠釘 / 寶石節點 */}
        {unlocked && (
          <g opacity="0.6">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <circle
                key={deg}
                cx={50 + 31 * Math.sin((deg * Math.PI) / 180)}
                cy={50 - 31 * Math.cos((deg * Math.PI) / 180)}
                r="1.2"
                fill={theme.gemColor || '#FFFFFF'}
                stroke="#000000"
                strokeWidth="0.4"
              />
            ))}
          </g>
        )}

        {/* ─────────────────────────────────────────────────────────
            4. 26 項成就彩色專屬圖案核心
           ───────────────────────────────────────────────────────── */}
        {getIconForAchievement(achievementId, {
          accent: accentColor,
          highlight: highlightColor,
          category,
          unlocked,
        })}

        {/* ─────────────────────────────────────────────────────────
            5. 鎖定狀態：覆蓋精密機械鎖印封印標記 (仍清晰可見底層符號)
           ───────────────────────────────────────────────────────── */}
        {!unlocked && (
          <g transform="translate(50, 75)">
            <circle cx="0" cy="0" r="7.8" fill="#181B22" stroke="#475569" strokeWidth="1.2" />
            <path d="M -3,-1 L -3,-3.8 C -3,-5.2 3,-5.2 3,-3.8 L 3,-1" fill="none" stroke="#94A3B8" strokeWidth="1.2" />
            <rect x="-3.8" y="-1" width="7.6" height="5.2" rx="1.2" fill="#475569" stroke="#000000" strokeWidth="0.6" />
            <circle cx="0" cy="1.6" r="0.9" fill="#CBD5E1" />
          </g>
        )}
      </svg>
    </div>
  );
};
