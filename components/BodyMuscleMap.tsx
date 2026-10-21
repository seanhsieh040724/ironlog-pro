import React from 'react';
import { MuscleGroup } from '../types';

export type LoadLevel = 'none' | 'light' | 'moderate' | 'exhausted';

export interface MuscleLoadInfo {
  group: MuscleGroup;
  nameCn: string;
  nameEn: string;
  sets: number;
  evalSets: number; // The sets used for rating (weekly sets, or monthly / 4)
  level: LoadLevel;
  levelLabel: string;
  color: string;
}

interface BodyMuscleMapProps {
  muscleData: Record<MuscleGroup, MuscleLoadInfo>;
  selectedGroup: MuscleGroup | null;
  onSelectGroup: (group: MuscleGroup) => void;
  isMonthly?: boolean;
}

export const LEVEL_COLORS: Record<LoadLevel, { bg: string; text: string; fill: string; border: string; label: string }> = {
  none: { bg: 'bg-slate-100', text: 'text-slate-500', fill: '#E2E8F0', border: 'border-slate-200', label: '未訓練' },
  light: { bg: 'bg-emerald-50 text-emerald-700', text: 'text-emerald-600', fill: '#22C55E', border: 'border-emerald-300', label: '輕量等級' },
  moderate: { bg: 'bg-orange-50 text-orange-700', text: 'text-orange-600', fill: '#F97316', border: 'border-orange-300', label: '適中等級' },
  exhausted: { bg: 'bg-rose-50 text-rose-700', text: 'text-rose-600', fill: '#EF4444', border: 'border-rose-300', label: '力竭等級' }
};

export const BodyMuscleMap: React.FC<BodyMuscleMapProps> = ({
  muscleData,
  selectedGroup,
  onSelectGroup,
  isMonthly = false
}) => {
  const getColor = (group: MuscleGroup): string => {
    const data = muscleData[group];
    if (!data || data.level === 'none') return '#E2E8F0';
    return LEVEL_COLORS[data.level].fill;
  };

  const getOpacity = (group: MuscleGroup): number => {
    if (!selectedGroup) return 1;
    return selectedGroup === group ? 1 : 0.25;
  };

  const selectedInfo = selectedGroup ? muscleData[selectedGroup] : null;

  return (
    <div className="relative w-full flex flex-col items-center select-none py-1">
      {/* Front and Back Human Figures Container */}
      <div className="w-full flex items-center justify-center gap-2 sm:gap-6 relative min-h-[360px]">
        {/* Floating Tooltip for Selected Muscle (Matching Exact Reference Mockup) */}
        {selectedInfo && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 bg-white px-4 py-2 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95 min-w-[105px]">
            <span className="text-[13px] font-bold text-slate-800 tracking-tight">{selectedInfo.nameCn}</span>
            <span className="text-[16px] font-black text-slate-900 leading-tight my-0.5">{selectedInfo.sets} 組</span>
            <span className="text-[11px] font-bold leading-tight" style={{ color: selectedInfo.color }}>
              {selectedInfo.levelLabel}
            </span>
            <span className="text-[10px] font-medium leading-tight" style={{ color: selectedInfo.color }}>
              {isMonthly
                ? `(月均 ${(selectedInfo.evalSets).toFixed(0)} 組/週)`
                : selectedInfo.level === 'exhausted'
                ? '(16+ 組)'
                : selectedInfo.level === 'moderate'
                ? '(11–15 組)'
                : selectedInfo.level === 'light'
                ? '(1–10 組)'
                : '(0 組)'}
            </span>
            {/* Small caret */}
            <div className="w-2 h-2 bg-white border-r border-b border-slate-100 rotate-45 -mb-3 mt-1 shadow-xs" />
          </div>
        )}

        {/* FRONT FIGURE CONTAINER (正面人體 - 240x484 標準視圖，與背面大小 1:1 完全一致) */}
        <div className="relative w-36 h-72 sm:w-44 sm:h-88 flex items-center justify-center">
          <svg viewBox="0 0 240 484" className="w-full h-full overflow-visible">
            {/* Layer 1: Muscle Color Fills Underneath */}
            {/* Chest (胸部) */}
            <g opacity={getOpacity('chest')} fill={getColor('chest')} className="transition-all duration-300">
              <path d="M 79,96 C 91,95 106,97 118,100 C 118,118 117,134 116,142 C 103,143 89,138 79,128 C 77,118 77,106 79,96 Z" />
              <path d="M 122,100 C 134,97 149,95 161,96 C 163,106 163,118 161,128 C 151,138 137,143 124,142 C 123,134 122,118 122,100 Z" />
            </g>

            {/* Shoulders (肩部 - Deltoids) */}
            <g opacity={getOpacity('shoulders')} fill={getColor('shoulders')} className="transition-all duration-300">
              <path d="M 77,96 C 77,87 68,85 61,92 C 54,100 55,115 57,128 C 65,136 75,130 77,120 C 78,112 77,104 77,96 Z" />
              <path d="M 163,96 C 163,87 172,85 179,92 C 186,100 185,115 183,128 C 175,136 165,130 163,120 C 162,112 163,104 163,96 Z" />
            </g>

            {/* Arms (手臂 - Biceps & Forearms) */}
            <g opacity={getOpacity('arms')} fill={getColor('arms')} className="transition-all duration-300">
              <path d="M 57,128 C 54,138 53,154 55,172 C 60,176 67,170 68,156 C 69,142 67,134 57,128 Z" />
              <path d="M 54,174 C 48,188 43,208 36,230 C 38,238 48,235 52,222 C 57,204 61,188 65,174 Z" />
              <path d="M 183,128 C 186,138 187,154 185,172 C 180,176 173,170 172,156 C 171,142 173,134 183,128 Z" />
              <path d="M 186,174 C 192,188 197,208 204,230 C 202,238 192,235 188,222 C 183,204 179,188 175,174 Z" />
            </g>

            {/* Core (核心 - Rectus Abdominis & Obliques) */}
            <g opacity={getOpacity('core')} fill={getColor('core')} className="transition-all duration-300">
              <path d="M 105,146 C 112,146 118,146 119,146 L 119,168 L 104,168 Z" />
              <path d="M 121,146 L 135,146 L 136,168 L 121,168 Z" />
              <path d="M 103,170 L 119,170 L 119,194 L 102,194 Z" />
              <path d="M 121,170 L 137,170 L 138,194 L 121,194 Z" />
              <path d="M 102,196 L 119,196 L 119,228 C 113,232 106,224 101,215 Z" />
              <path d="M 121,196 L 138,196 L 139,215 C 134,224 127,232 121,228 Z" />
              <path d="M 84,160 C 81,180 83,204 87,220 C 93,224 99,220 101,210 C 99,190 99,172 101,160 Z" />
              <path d="M 156,160 C 159,180 157,204 153,220 C 147,224 141,220 139,210 C 141,190 141,172 139,160 Z" />
            </g>

            {/* Legs (腿部 - Quads & Calves) */}
            <g opacity={getOpacity('quads')} fill={getColor('quads')} className="transition-all duration-300">
              <path d="M 86,230 C 77,255 76,290 79,322 C 85,332 105,334 114,322 C 118,295 118,260 112,232 C 103,230 93,230 86,230 Z" />
              <path d="M 154,230 C 163,255 164,290 161,322 C 155,332 135,334 126,322 C 122,295 122,260 128,232 C 137,230 147,230 154,230 Z" />
              <path d="M 81,345 C 77,370 77,398 84,425 C 93,427 103,422 104,405 C 105,380 103,360 99,345 Z" />
              <path d="M 159,345 C 163,370 163,398 156,425 C 147,427 137,422 136,405 C 135,380 137,360 141,345 Z" />
            </g>

            {/* Layer 2: Original User Uploaded Front Anatomy Image */}
            <image
              href="/body-front.png"
              x="-19"
              y="0"
              width="245"
              height="484"
              style={{ mixBlendMode: 'multiply' }}
              className="pointer-events-none select-none"
            />

            {/* Layer 3: Interactive Clickable Areas */}
            {/* Chest */}
            <path
              d="M 76,92 L 164,92 L 164,144 L 76,144 Z"
              fill="transparent"
              className="cursor-pointer hover:opacity-10 hover:fill-black transition-opacity"
              onClick={() => onSelectGroup('chest')}
            >
              <title>胸部</title>
            </path>
            {/* Shoulders */}
            <path
              d="M 53,85 L 79,85 L 79,135 L 53,135 Z M 161,85 L 187,85 L 187,135 L 161,135 Z"
              fill="transparent"
              className="cursor-pointer hover:opacity-10 hover:fill-black transition-opacity"
              onClick={() => onSelectGroup('shoulders')}
            >
              <title>肩部</title>
            </path>
            {/* Arms */}
            <path
              d="M 33,130 L 69,130 L 69,245 L 33,245 Z M 171,130 L 207,130 L 207,245 L 171,245 Z"
              fill="transparent"
              className="cursor-pointer hover:opacity-10 hover:fill-black transition-opacity"
              onClick={() => onSelectGroup('arms')}
            >
              <title>手臂</title>
            </path>
            {/* Core */}
            <path
              d="M 81,145 L 159,145 L 159,230 L 81,230 Z"
              fill="transparent"
              className="cursor-pointer hover:opacity-10 hover:fill-black transition-opacity"
              onClick={() => onSelectGroup('core')}
            >
              <title>核心</title>
            </path>
            {/* Legs */}
            <path
              d="M 73,230 L 167,230 L 167,435 L 73,435 Z"
              fill="transparent"
              className="cursor-pointer hover:opacity-10 hover:fill-black transition-opacity"
              onClick={() => onSelectGroup('quads')}
            >
              <title>腿部</title>
            </path>
          </svg>
        </div>

        {/* BACK FIGURE CONTAINER (背面人體 - 240x484 標準視圖，與正面大小 1:1 完全一致) */}
        <div className="relative w-36 h-72 sm:w-44 sm:h-88 flex items-center justify-center">
          <svg viewBox="0 0 240 484" className="w-full h-full overflow-visible">
            {/* Layer 1: Muscle Color Fills Underneath */}
            {/* Back (背部 - Traps, Lats, Rhomboids) */}
            <g opacity={getOpacity('back')} fill={getColor('back')} className="transition-all duration-300">
              <path d="M 107,64 C 115,62 125,62 133,64 C 135,77 143,86 151,94 C 139,100 127,110 120,122 C 113,110 101,100 89,94 C 97,86 105,77 107,64 Z" />
              <path d="M 89,96 C 97,104 105,112 118,124 L 118,214 C 107,208 99,194 93,177 C 85,152 85,122 89,96 Z" />
              <path d="M 151,96 C 143,104 135,112 122,124 L 122,214 C 133,208 141,194 147,177 C 155,152 155,122 151,96 Z" />
            </g>

            {/* Glutes (臀部 - Gluteus Maximus) */}
            <g opacity={getOpacity('glutes')} fill={getColor('glutes')} className="transition-all duration-300">
              <path d="M 81,217 C 75,232 77,254 87,268 C 99,272 111,268 118,254 C 119,238 118,224 118,217 C 105,216 93,216 81,217 Z" />
              <path d="M 159,217 C 165,232 163,254 153,268 C 141,272 129,268 122,254 C 121,238 122,224 122,217 C 135,216 147,216 159,217 Z" />
            </g>

            {/* Rear Deltoids (肩部 - 後三角) */}
            <g opacity={getOpacity('shoulders')} fill={getColor('shoulders')} className="transition-all duration-300">
              <path d="M 87,94 C 77,90 65,94 59,104 C 55,116 56,127 59,137 C 69,134 77,126 81,112 C 83,104 85,98 87,94 Z" />
              <path d="M 153,94 C 163,90 175,94 181,104 C 185,116 184,127 181,137 C 171,134 163,126 159,112 C 157,104 155,98 153,94 Z" />
            </g>

            {/* Arms Back (手臂 - 三頭與前臂後側) */}
            <g opacity={getOpacity('arms')} fill={getColor('arms')} className="transition-all duration-300">
              <path d="M 57,137 C 53,148 51,162 54,180 C 59,182 66,177 67,164 C 69,150 66,142 57,137 Z" />
              <path d="M 53,182 C 46,197 41,218 35,240 C 38,247 46,244 50,230 C 56,212 60,196 63,182 Z" />
              <path d="M 183,137 C 187,148 189,162 186,180 C 181,182 174,177 173,164 C 171,150 174,142 183,137 Z" />
              <path d="M 187,182 C 194,197 199,218 205,240 C 202,247 194,244 190,230 C 184,212 180,196 177,182 Z" />
            </g>

            {/* Legs Back (腿部 - 膕繩肌與小腿後側) */}
            <g opacity={getOpacity('quads')} fill={getColor('quads')} className="transition-all duration-300">
              <path d="M 85,270 C 79,290 78,317 81,344 C 89,348 107,348 113,337 C 116,317 116,292 115,270 Z" />
              <path d="M 155,270 C 161,290 162,317 159,344 C 151,348 133,348 127,337 C 124,317 124,292 125,270 Z" />
              <path d="M 80,347 C 76,370 77,397 82,424 C 90,427 101,422 103,404 C 105,380 103,362 99,347 Z" />
              <path d="M 160,347 C 164,370 163,397 158,424 C 150,427 139,422 137,404 C 135,380 137,362 141,347 Z" />
            </g>

            {/* Layer 2: Original User Uploaded Back Anatomy Image */}
            <image
              href="/body-back.png"
              x="9"
              y="2"
              width="229"
              height="469"
              style={{ mixBlendMode: 'multiply' }}
              className="pointer-events-none select-none"
            />

            {/* Layer 3: Interactive Clickable Areas */}
            {/* Back */}
            <path
              d="M 77,62 L 163,62 L 163,216 L 77,216 Z"
              fill="transparent"
              className="cursor-pointer hover:opacity-10 hover:fill-black transition-opacity"
              onClick={() => onSelectGroup('back')}
            >
              <title>背部</title>
            </path>
            {/* Glutes */}
            <path
              d="M 75,217 L 165,217 L 165,270 L 75,270 Z"
              fill="transparent"
              className="cursor-pointer hover:opacity-10 hover:fill-black transition-opacity"
              onClick={() => onSelectGroup('glutes')}
            >
              <title>臀部</title>
            </path>
            {/* Rear Deltoids */}
            <path
              d="M 53,87 L 81,87 L 81,137 L 53,137 Z M 159,87 L 187,87 L 187,137 L 159,137 Z"
              fill="transparent"
              className="cursor-pointer hover:opacity-10 hover:fill-black transition-opacity"
              onClick={() => onSelectGroup('shoulders')}
            >
              <title>肩部</title>
            </path>
            {/* Arms Back */}
            <path
              d="M 31,132 L 69,132 L 69,250 L 31,250 Z M 171,132 L 209,132 L 209,250 L 171,250 Z"
              fill="transparent"
              className="cursor-pointer hover:opacity-10 hover:fill-black transition-opacity"
              onClick={() => onSelectGroup('arms')}
            >
              <title>手臂</title>
            </path>
            {/* Legs Back */}
            <path
              d="M 73,270 L 167,270 L 167,437 L 73,437 Z"
              fill="transparent"
              className="cursor-pointer hover:opacity-10 hover:fill-black transition-opacity"
              onClick={() => onSelectGroup('quads')}
            >
              <title>腿部</title>
            </path>
          </svg>
        </div>

        {/* Legend on the right (Exact matching user design mockup) */}
        <div className="flex flex-col gap-4 justify-center pl-1 sm:pl-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#EF4444] shadow-xs shrink-0" />
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-slate-800 leading-tight">高</span>
              <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                {isMonthly ? '(64+ 組)' : '(16+ 組)'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#F97316] shadow-xs shrink-0" />
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-slate-800 leading-tight">適中</span>
              <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                {isMonthly ? '(44–60 組)' : '(11–15 組)'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#22C55E] shadow-xs shrink-0" />
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-slate-800 leading-tight">輕量</span>
              <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                {isMonthly ? '(4–40 組)' : '(1–10 組)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
