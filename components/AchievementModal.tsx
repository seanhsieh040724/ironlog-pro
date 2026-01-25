
import React from 'react';
import { Achievement } from '../types';
import { motion } from 'framer-motion';
import { Trophy, Zap, X } from 'lucide-react';

interface AchievementModalProps {
  achievement: Achievement;
  onClose: () => void;
}

export const AchievementModal: React.FC<AchievementModalProps> = ({ achievement, onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.5, opacity: 0, y: 50 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.5, opacity: 0, y: 50 }}
        className="relative w-full max-w-xs glass rounded-[40px] p-10 flex flex-col items-center text-center shadow-[0_20px_50px_rgba(173,255,47,0.3)] border-neon-green/30"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500">
           <X className="w-6 h-6" />
        </button>

        <div className="relative mb-8">
           <div className="absolute inset-0 bg-neon-green blur-2xl opacity-20 animate-pulse" />
           <div className="relative w-24 h-24 bg-neon-green rounded-full flex items-center justify-center glow-green">
             <Trophy className="w-12 h-12 text-black" />
           </div>
        </div>

        <h2 className="text-3xl font-black italic tracking-tighter text-neon-green uppercase mb-2">
          {achievement.title}
        </h2>
        
        <p className="text-white font-bold mb-6">
          你在 <span className="text-sunset uppercase italic">{achievement.exerciseName}</span> <br/>
          打破了個人重量紀錄！
        </p>

        <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
          <Zap className="w-3 h-3 text-neon-green fill-current" />
          <span>鋼鐵進度：+100 EXP</span>
        </div>
      </motion.div>
    </div>
  );
};
