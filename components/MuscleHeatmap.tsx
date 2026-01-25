
import React from 'react';
import { MuscleGroup } from '../types';

interface MuscleHeatmapProps {
  scores: Record<MuscleGroup, number>;
  gender?: 'male' | 'female';
}

export const MuscleHeatmap: React.FC<MuscleHeatmapProps> = ({ scores, gender = 'male' }) => {
  const getColor = (score: number) => {
    if (score === 0) return 'rgba(30, 41, 59, 0.3)'; 
    const opacity = 0.2 + (score / 100) * 0.8;
    return `rgba(173, 255, 47, ${opacity})`;
  };

  const silhouetteColor = gender === 'male' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(236, 72, 153, 0.12)';
  const outlineColor = gender === 'male' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(236, 72, 153, 0.3)';

  return (
    <div className="relative w-full aspect-[3/4] max-w-[140px] mx-auto bg-slate-900/40 rounded-[40px] p-4 border border-white/5 flex items-center justify-center shadow-xl">
      <svg viewBox="0 0 100 140" className="w-full h-full drop-shadow-[0_0_15px_rgba(173,255,47,0.1)]">
        {/* 頭部 */}
        <circle cx="50" cy="12" r="8" fill={silhouetteColor} stroke={outlineColor} strokeWidth="1" />
        
        {gender === 'male' ? (
          <>
            {/* 男性完整身形輪廓 */}
            <path d="M38 22 L62 22 L72 45 L68 50 L65 85 L60 135 L52 135 L50 100 L48 135 L40 135 L35 85 L32 50 L28 45 Z" fill={silhouetteColor} stroke={outlineColor} strokeWidth="1" />
            
            {/* 胸部 */}
            <rect x="38" y="25" width="24" height="12" rx="2" fill={getColor(scores.chest)} />
            {/* 核心 */}
            <rect x="42" y="40" width="16" height="18" rx="2" fill={getColor(scores.core)} />
            {/* 肩膀 */}
            <circle cx="32" cy="27" r="6" fill={getColor(scores.shoulders)} />
            <circle cx="68" cy="27" r="6" fill={getColor(scores.shoulders)} />
            {/* 手臂 */}
            <path d="M30 35 Q26 50 28 75" fill="none" stroke={getColor(scores.arms)} strokeWidth="5" strokeLinecap="round" />
            <path d="M70 35 Q74 50 72 75" fill="none" stroke={getColor(scores.arms)} strokeWidth="5" strokeLinecap="round" />
            {/* 大腿 */}
            <rect x="37" y="85" width="11" height="38" rx="5" fill={getColor(scores.quads)} />
            <rect x="52" y="85" width="11" height="38" rx="5" fill={getColor(scores.quads)} />
            {/* 背部 (示意) */}
            <path d="M40 30 Q50 28 60 30" fill="none" stroke={getColor(scores.back)} strokeWidth="2" opacity="0.6" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* 女性完整身形輪廓 */}
            <path d="M42 22 L58 22 L65 45 L58 65 L68 90 L60 135 L52 135 L50 105 L48 135 L40 135 L32 90 L42 65 L35 45 Z" fill={silhouetteColor} stroke={outlineColor} strokeWidth="1" />
            
            {/* 胸部 */}
            <rect x="41" y="26" width="18" height="10" rx="4" fill={getColor(scores.chest)} />
            {/* 核心 */}
            <rect x="44" y="44" width="12" height="16" rx="4" fill={getColor(scores.core)} />
            {/* 肩膀 */}
            <circle cx="36" cy="28" r="5" fill={getColor(scores.shoulders)} />
            <circle cx="64" cy="28" r="5" fill={getColor(scores.shoulders)} />
            {/* 手臂 */}
            <path d="M36 35 Q33 50 36 75" fill="none" stroke={getColor(scores.arms)} strokeWidth="4" strokeLinecap="round" />
            <path d="M64 35 Q67 50 64 75" fill="none" stroke={getColor(scores.arms)} strokeWidth="4" strokeLinecap="round" />
            {/* 臀部 */}
            <ellipse cx="50" cy="82" rx="18" ry="12" fill={getColor(scores.glutes)} />
            {/* 大腿 */}
            <rect x="38" y="92" width="10" height="35" rx="5" fill={getColor(scores.quads)} />
            <rect x="52" y="92" width="10" height="35" rx="5" fill={getColor(scores.quads)} />
          </>
        )}
      </svg>
      <div className="absolute bottom-3 text-[7px] font-black uppercase text-slate-700 tracking-widest text-center w-full">
        IRON HEATMAP
      </div>
    </div>
  );
};
