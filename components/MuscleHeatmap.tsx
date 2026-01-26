
import React from 'react';
import { motion } from 'framer-motion';
import { MuscleGroup } from '../types';

interface MuscleHeatmapProps {
  scores: Record<MuscleGroup, number>;
  gender?: 'male' | 'female';
}

export const MuscleHeatmap: React.FC<MuscleHeatmapProps> = ({ scores }) => {
  // 依照範本色調調整：
  // 底色：淺灰藍 #cbd5e1
  // 低活化：淡藍 #93c5fd
  // 中活化：亮藍 #3b82f6
  // 高活化：強效藍 #2563eb (匹配圖片中的深度藍)
  const getHeatColor = (score: number) => {
    if (score === 0) return '#cbd5e1'; 
    if (score < 35) return '#93c5fd';  
    if (score < 75) return '#3b82f6';  
    return '#2563eb';                  
  };

  const transition = { duration: 0.8, ease: [0.4, 0, 0.2, 1] };

  return (
    <div className="w-full flex flex-col items-center py-4 select-none">
      <div className="relative w-full max-w-[550px] aspect-[1.4] rounded-[32px] p-6 bg-[#f1f5f9] border border-slate-200 shadow-inner flex items-center justify-center overflow-hidden">
        
        {/* 視圖標籤 */}
        <div className="absolute top-6 left-0 right-0 flex justify-around pointer-events-none px-12">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">正面</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">背面</span>
        </div>

        <svg viewBox="0 0 800 500" className="w-full h-full drop-shadow-sm">
          {/* 正面視圖 (Anterior) */}
          <g transform="translate(100, 50) scale(1.05)">
            {/* 靜態底色輪廓 (頭部、頸部、關節) */}
            <path d="M100 15 C95 15 92 18 92 25 V45 L100 55 L108 45 V25 C108 18 105 15 100 15" fill="#94a3b8" />
            <circle cx="100" cy="25" r="9" fill="#94a3b8" />
            
            {/* 胸肌 (Chest) - 左右瓣狀 */}
            <motion.path animate={{ fill: getHeatColor(scores.chest) }} transition={transition}
              d="M100 85 C115 85 132 90 138 110 C132 130 115 135 100 132 Z" stroke="white" strokeWidth="1" />
            <motion.path animate={{ fill: getHeatColor(scores.chest) }} transition={transition}
              d="M100 85 C85 85 68 90 62 110 C68 130 85 135 100 132 Z" stroke="white" strokeWidth="1" />

            {/* 肩部 (Shoulders) */}
            <motion.path animate={{ fill: getHeatColor(scores.shoulders) }} transition={transition}
              d="M60 82 C50 92 48 125 62 135 C68 120 68 98 60 82 Z" stroke="white" strokeWidth="1" />
            <motion.path animate={{ fill: getHeatColor(scores.shoulders) }} transition={transition}
              d="M140 82 C150 92 152 125 138 135 C132 120 132 98 140 82 Z" stroke="white" strokeWidth="1" />

            {/* 六塊肌 (Abs) */}
            <g stroke="white" strokeWidth="0.8">
              <motion.path animate={{ fill: getHeatColor(scores.core) }} transition={transition} d="M88 145 H112 V155 H88 Z" />
              <motion.path animate={{ fill: getHeatColor(scores.core) }} transition={transition} d="M88 158 H112 V168 H88 Z" />
              <motion.path animate={{ fill: getHeatColor(scores.core) }} transition={transition} d="M88 171 H112 V181 H88 Z" />
              {/* 核心側翼 */}
              <motion.path animate={{ fill: getHeatColor(scores.core) }} transition={transition} fillOpacity="0.4"
                d="M75 140 C80 180 85 220 100 235 C115 220 120 180 125 140 Z" />
            </g>

            {/* 手臂 (Arms) */}
            <motion.path animate={{ fill: getHeatColor(scores.arms) }} transition={transition}
              d="M55 145 C45 185 50 240 60 260 L68 255 C62 230 62 180 65 148 Z" stroke="white" strokeWidth="1" />
            <motion.path animate={{ fill: getHeatColor(scores.arms) }} transition={transition}
              d="M145 145 C155 185 150 240 140 260 L132 255 C138 230 138 180 135 148 Z" stroke="white" strokeWidth="1" />

            {/* 股四頭肌 (Quads) - 解剖學水滴狀 */}
            <motion.path animate={{ fill: getHeatColor(scores.quads) }} transition={transition}
              d="M72 245 C65 295 70 380 82 430 H98 V245 Z" stroke="white" strokeWidth="1.5" />
            <motion.path animate={{ fill: getHeatColor(scores.quads) }} transition={transition}
              d="M128 245 C135 295 130 380 118 430 H102 V245 Z" stroke="white" strokeWidth="1.5" />
            
            {/* 小腿 (Calves) - 底色 */}
            <path d="M82 435 C80 460 85 480 100 480 C115 480 120 460 118 435 Z" fill="#94a3b8" />
          </g>

          {/* 背面視圖 (Posterior) */}
          <g transform="translate(450, 50) scale(1.05)">
            <path d="M100 15 C95 15 92 18 92 25 V45 L100 55 L108 45 V25 C108 18 105 15 100 15" fill="#94a3b8" />
            <circle cx="100" cy="25" r="9" fill="#94a3b8" />
            
            {/* 上背與斜方 (Back - Traps/Lats) */}
            <motion.path animate={{ fill: getHeatColor(scores.back) }} transition={transition}
              d="M100 55 L138 85 C145 125 125 195 100 215 C75 195 55 125 62 85 Z" stroke="white" strokeWidth="1.2" />
            
            {/* 後三角肌 */}
            <motion.path animate={{ fill: getHeatColor(scores.shoulders) }} transition={transition}
              d="M62 82 C52 92 52 125 62 138 C68 120 68 100 62 82 Z" stroke="white" strokeWidth="1" />
            <motion.path animate={{ fill: getHeatColor(scores.shoulders) }} transition={transition}
              d="M138 82 C148 92 148 125 138 138 C132 120 132 100 138 82 Z" stroke="white" strokeWidth="1" />

            {/* 臀部 (Glutes) */}
            <motion.path animate={{ fill: getHeatColor(scores.glutes) }} transition={transition}
              d="M72 215 C70 265 100 280 100 280 C100 280 130 265 128 215 C120 205 80 205 72 215 Z" stroke="white" strokeWidth="1.5" />

            {/* 腿後肌 (Hamstrings) */}
            <motion.path animate={{ fill: getHeatColor(scores.hamstrings || scores.quads) }} transition={transition}
              d="M75 285 C70 340 75 430 82 430 H98 V285 Z" stroke="white" strokeWidth="1.2" />
            <motion.path animate={{ fill: getHeatColor(scores.hamstrings || scores.quads) }} transition={transition}
              d="M125 285 C130 340 125 430 118 430 H102 V285 Z" stroke="white" strokeWidth="1.2" />
            
            {/* 手臂三頭 (Triceps) */}
            <motion.path animate={{ fill: getHeatColor(scores.arms) }} transition={transition}
              d="M55 145 C45 185 50 240 60 260 L68 255 C62 230 62 180 65 148 Z" stroke="white" strokeWidth="1" />
            <motion.path animate={{ fill: getHeatColor(scores.arms) }} transition={transition}
              d="M145 145 C155 185 150 240 140 260 L132 255 C138 230 138 180 135 148 Z" stroke="white" strokeWidth="1" />

            {/* 小腿底色 */}
            <path d="M82 435 C80 460 85 480 100 480 C115 480 120 460 118 435 Z" fill="#94a3b8" />
          </g>
        </svg>
      </div>

      {/* 圖例 */}
      <div className="mt-6 flex gap-12">
        {[0, 35, 75, 100].map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: getHeatColor(s) }} />
            <div className="w-[1px] h-2 bg-slate-300" />
          </div>
        ))}
      </div>
    </div>
  );
};
