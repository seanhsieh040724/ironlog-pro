
import React from 'react';
import { motion } from 'framer-motion';
import { MuscleGroup } from '../types';

interface MuscleHeatmapProps {
  scores: Record<MuscleGroup, number>;
  gender?: 'male' | 'female';
}

export const MuscleHeatmap: React.FC<MuscleHeatmapProps> = ({ scores }) => {
  // 依照熱力值計算顏色：深灰 (0) -> 綠色 -> 金色
  const getMuscleColor = (score: number) => {
    if (score === 0) return '#334155'; // 預設深灰色 (對應參考圖肌肉色)
    if (score < 30) return '#4d7c0f'; // 低強度綠
    if (score < 70) return '#ADFF2F'; // 霓虹綠
    return '#facc15'; // 高強度金
  };

  // 身體基底色 (對應參考圖皮膚色)
  const BODY_BASE = '#94a3b8';

  return (
    <div className="w-full max-w-[320px] mx-auto py-4">
      <div className="grid grid-cols-2 gap-4">
        {/* 正面圖 (Front View) */}
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-4">Anterior</span>
          <svg viewBox="0 0 100 180" className="w-full h-auto drop-shadow-lg">
            {/* 身體基底 */}
            <path d="M50 5 Q55 5 58 12 V22 Q58 25 54 26 C65 28 75 35 80 45 L82 85 C80 100 78 115 73 120 L71 165 C70 170 62 170 60 165 L57 125 C54 122 46 122 43 125 L40 165 C38 170 30 170 29 165 L27 120 C22 115 20 100 18 85 L20 45 C25 35 35 28 46 26 Q42 25 42 22 V12 Q45 5 50 5 Z" fill={BODY_BASE} />
            
            {/* 胸部 Pectorals */}
            <motion.g animate={{ fill: getMuscleColor(scores.chest) }}>
              <path d="M35 38 Q42 35 50 37 V58 Q42 62 31 58 Z" />
              <path d="M65 38 Q58 35 50 37 V58 Q58 62 69 58 Z" />
            </motion.g>

            {/* 三角肌 Shoulders (Front) */}
            <motion.g animate={{ fill: getMuscleColor(scores.shoulders) }}>
              <path d="M22 42 Q17 45 20 58 Q23 65 30 58 L32 40 Z" />
              <path d="M78 42 Q83 45 80 58 Q77 65 70 58 L68 40 Z" />
            </motion.g>

            {/* 核心 Core (Abs) */}
            <motion.g animate={{ fill: getMuscleColor(scores.core) }}>
              {[62, 75, 88].map((y, i) => (
                <React.Fragment key={i}>
                  <rect x="42" y={y} width="7" height="11" rx="1" />
                  <rect x="51" y={y} width="7" height="11" rx="1" />
                </React.Fragment>
              ))}
              <path d="M30 70 L38 115" stroke="currentColor" strokeWidth="2" opacity="0.3" fill="none" />
              <path d="M70 70 L62 115" stroke="currentColor" strokeWidth="2" opacity="0.3" fill="none" />
            </motion.g>

            {/* 手臂 Arms (Front) */}
            <motion.g animate={{ fill: getMuscleColor(scores.arms) }}>
              <path d="M18 62 Q15 75 18 90 H25 Q23 75 27 62 Z" />
              <path d="M82 62 Q85 75 82 90 H75 Q77 75 73 62 Z" />
              <path d="M19 95 Q17 110 22 115 H28 V95 Z" />
              <path d="M81 95 Q83 110 78 115 H72 V95 Z" />
            </motion.g>

            {/* 股四頭肌 Quads */}
            <motion.g animate={{ fill: getMuscleColor(scores.quads) }}>
              <path d="M30 122 Q27 145 32 165 H46 V122 Z" />
              <path d="M70 122 Q73 145 68 165 H54 V122 Z" />
            </motion.g>
          </svg>
        </div>

        {/* 背面圖 (Back View) */}
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-4">Posterior</span>
          <svg viewBox="0 0 100 180" className="w-full h-auto drop-shadow-lg">
            {/* 身體基底 */}
            <path d="M50 5 Q55 5 58 12 V22 Q58 25 54 26 C65 28 75 35 80 45 L82 85 C80 100 78 115 73 120 L71 165 C70 170 62 170 60 165 L57 125 C54 122 46 122 43 125 L40 165 C38 170 30 170 29 165 L27 120 C22 115 20 100 18 85 L20 45 C25 35 35 28 46 26 Q42 25 42 22 V12 Q45 5 50 5 Z" fill={BODY_BASE} />
            
            {/* 背肌 Back/Lats */}
            <motion.g animate={{ fill: getMuscleColor(scores.back) }}>
              {/* 斜方肌 */}
              <path d="M50 28 L35 45 L50 60 L65 45 Z" />
              {/* 背闊肌 */}
              <path d="M35 48 Q25 70 48 105 V60 Z" />
              <path d="M65 48 Q75 70 52 105 V60 Z" />
            </motion.g>

            {/* 三角肌 Shoulders (Back) */}
            <motion.g animate={{ fill: getMuscleColor(scores.shoulders) }}>
              <path d="M22 42 Q18 45 20 55 L32 40 Z" />
              <path d="M78 42 Q82 45 80 55 L68 40 Z" />
            </motion.g>

            {/* 臀部 Glutes */}
            <motion.g animate={{ fill: getMuscleColor(scores.glutes) }}>
              <path d="M30 108 Q28 128 48 128 V108 Z" />
              <path d="M70 108 Q72 128 52 128 V108 Z" />
            </motion.g>

            {/* 膕繩肌 Hamstrings (Back of legs) */}
            <motion.g animate={{ fill: getMuscleColor(scores.hamstrings || scores.quads) }}>
              <path d="M31 132 Q28 150 33 165 H46 V132 Z" />
              <path d="M69 132 Q72 150 67 165 H54 V132 Z" />
            </motion.g>

            {/* 手臂 Arms (Back) */}
            <motion.g animate={{ fill: getMuscleColor(scores.arms) }}>
              <path d="M19 58 Q16 75 20 90 H27 V58 Z" />
              <path d="M81 58 Q84 75 80 90 H73 V58 Z" />
            </motion.g>
          </svg>
        </div>
      </div>
      
      {/* 底部圖例 */}
      <div className="mt-8 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#334155' }} />
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Rest</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_5px_#ADFF2F]" />
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_5px_#facc15]" />
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Peak</span>
        </div>
      </div>
    </div>
  );
};
