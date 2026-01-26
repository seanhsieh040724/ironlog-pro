
import React from 'react';
import { motion } from 'framer-motion';
import { MuscleGroup } from '../types';

interface MuscleHeatmapProps {
  scores: Record<MuscleGroup, number>;
  gender?: 'male' | 'female';
}

export const MuscleHeatmap: React.FC<MuscleHeatmapProps> = ({ scores }) => {
  /**
   * 依照範本色調調整：
   * 底色（無數據）：淺灰藍 #cbd5e1
   * 1-35%：淡藍 #93c5fd
   * 36-75%：亮藍 #3b82f6
   * 76-100%：深藍 #2563eb
   */
  const getHeatColor = (score: number) => {
    if (score === 0) return '#cbd5e1'; 
    if (score < 35) return '#93c5fd';  
    if (score < 75) return '#3b82f6';  
    return '#2563eb';                  
  };

  // 使用 as const 確保 ease 屬性符合字面量型別要求
  const transition = { duration: 1.2, ease: "circOut" as const };

  return (
    <div className="w-full flex flex-col items-center py-4 select-none">
      <div className="relative w-full max-w-[580px] aspect-[1.4] rounded-[40px] p-6 bg-[#f8fafc] border border-slate-200 shadow-inner flex items-center justify-center overflow-hidden">
        
        {/* 頂部文字標籤 */}
        <div className="absolute top-6 left-0 right-0 flex justify-around pointer-events-none px-12">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic">正面視圖</span>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic">背面視圖</span>
        </div>

        <svg viewBox="0 0 800 500" className="w-full h-full drop-shadow-sm">
          {/* 正面視圖 (Anterior) */}
          <g transform="translate(110, 50) scale(1.1)">
            {/* 頭部與關節固定色 */}
            <path d="M100 15 C95 15 92 18 92 25 V45 L100 55 L108 45 V25 C108 18 105 15 100 15" fill="#94a3b8" />
            <circle cx="100" cy="25" r="9" fill="#94a3b8" />
            
            {/* 胸肌 (Chest) */}
            <motion.path 
              animate={{ fill: getHeatColor(scores.chest) }} 
              transition={transition}
              d="M100 85 C118 85 135 92 138 112 C132 132 115 138 100 135 C85 138 68 132 62 112 C65 92 82 85 100 85" 
              stroke="white" 
              strokeWidth="1.2" 
            />
            <line x1="100" y1="85" x2="100" y2="135" stroke="white" strokeWidth="0.8" opacity="0.5" />

            {/* 肩部 (Shoulders) */}
            <motion.path animate={{ fill: getHeatColor(scores.shoulders) }} transition={transition}
              d="M60 82 C50 90 48 122 62 135 C70 120 70 98 60 82 Z" stroke="white" strokeWidth="1" />
            <motion.path animate={{ fill: getHeatColor(scores.shoulders) }} transition={transition}
              d="M140 82 C150 90 152 122 138 135 C130 120 130 98 140 82 Z" stroke="white" strokeWidth="1" />

            {/* 核心 (Core/Abs) */}
            <g stroke="white" strokeWidth="0.8">
              <motion.path animate={{ fill: getHeatColor(scores.core) }} transition={transition} d="M88 145 H112 V155 H88 Z" />
              <motion.path animate={{ fill: getHeatColor(scores.core) }} transition={transition} d="M88 158 H112 V168 H88 Z" />
              <motion.path animate={{ fill: getHeatColor(scores.core) }} transition={transition} d="M88 171 H112 V181 H88 Z" />
              <motion.path animate={{ fill: getHeatColor(scores.core) }} transition={transition} fillOpacity="0.3"
                d="M75 140 C80 185 85 225 100 240 C115 225 120 185 125 140 Z" />
            </g>

            {/* 手臂 (Arms) */}
            <motion.path animate={{ fill: getHeatColor(scores.arms) }} transition={transition}
              d="M55 145 C45 185 50 240 60 260 L68 255 C62 230 62 180 65 145 Z" stroke="white" strokeWidth="1" />
            <motion.path animate={{ fill: getHeatColor(scores.arms) }} transition={transition}
              d="M145 145 C155 185 150 240 140 260 L132 255 C138 230 138 180 135 145 Z" stroke="white" strokeWidth="1" />

            {/* 股四頭肌 (Quads) */}
            <motion.path animate={{ fill: getHeatColor(scores.quads) }} transition={transition}
              d="M72 245 C62 295 68 385 82 435 H98 V245 Z" stroke="white" strokeWidth="1.5" />
            <motion.path animate={{ fill: getHeatColor(scores.quads) }} transition={transition}
              d="M128 245 C138 295 132 385 118 435 H102 V245 Z" stroke="white" strokeWidth="1.5" />
            
            <path d="M82 440 C80 465 85 485 100 485 C115 485 120 465 118 440 Z" fill="#94a3b8" />
          </g>

          {/* 背面視圖 (Posterior) */}
          <g transform="translate(460, 50) scale(1.1)">
            <path d="M100 15 C95 15 92 18 92 25 V45 L100 55 L108 45 V25 C108 18 105 15 100 15" fill="#94a3b8" />
            <circle cx="100" cy="25" r="9" fill="#94a3b8" />
            
            {/* 背闊肌與斜方肌 (Back) */}
            <motion.path animate={{ fill: getHeatColor(scores.back) }} transition={transition}
              d="M100 55 L140 85 C148 125 128 200 100 220 C72 200 52 125 60 85 Z" stroke="white" strokeWidth="1.2" />
            
            {/* 後三角肌 */}
            <motion.path animate={{ fill: getHeatColor(scores.shoulders) }} transition={transition}
              d="M62 82 C52 92 52 125 62 138 C68 120 68 100 62 82 Z" stroke="white" strokeWidth="1" />
            <motion.path animate={{ fill: getHeatColor(scores.shoulders) }} transition={transition}
              d="M138 82 C148 92 148 125 138 138 C132 120 132 100 138 82 Z" stroke="white" strokeWidth="1" />

            {/* 臀大肌 (Glutes) */}
            <motion.path animate={{ fill: getHeatColor(scores.glutes) }} transition={transition}
              d="M72 220 C70 270 100 285 100 285 C100 285 130 270 128 220 C120 210 80 210 72 220 Z" stroke="white" strokeWidth="1.5" />

            {/* 腿後肌 (Hamstrings) */}
            <motion.path animate={{ fill: getHeatColor(scores.hamstrings || scores.quads) }} transition={transition}
              d="M75 290 C70 345 75 435 82 435 H98 V290 Z" stroke="white" strokeWidth="1.2" />
            <motion.path animate={{ fill: getHeatColor(scores.hamstrings || scores.quads) }} transition={transition}
              d="M125 290 C130 345 125 435 118 435 H102 V290 Z" stroke="white" strokeWidth="1.2" />
            
            {/* 手臂 (Arms) */}
            <motion.path animate={{ fill: getHeatColor(scores.arms) }} transition={transition}
              d="M55 145 C45 185 50 240 60 260 L68 255 C62 230 62 180 65 145 Z" stroke="white" strokeWidth="1" />
            <motion.path animate={{ fill: getHeatColor(scores.arms) }} transition={transition}
              d="M145 145 C155 185 150 240 140 260 L132 255 C138 230 138 180 135 145 Z" stroke="white" strokeWidth="1" />

            <path d="M82 440 C80 465 85 485 100 485 C115 485 120 465 118 440 Z" fill="#94a3b8" />
          </g>
        </svg>
      </div>

      {/* 圖例說明 */}
      <div className="mt-8 flex gap-12">
        {[0, 35, 75, 100].map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-4 h-4 rounded-md shadow-sm border border-white/20" style={{ backgroundColor: getHeatColor(s) }} />
            <div className="w-[1px] h-2 bg-slate-300" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
              {s === 0 ? '休息中' : s === 100 ? '極限' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
