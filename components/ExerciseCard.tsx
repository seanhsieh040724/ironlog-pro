
import React from 'react';
import { Exercise } from '../types';
import { Trash2, TrendingUp, Zap, Clock } from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise;
  onDelete: (id: string) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onDelete }) => {
  return (
    <div className="relative group mb-5">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl opacity-0 group-active:opacity-20 transition duration-500 blur"></div>
      <div className="relative bg-[#0f1115] border border-white/5 rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-500/10 rounded-2xl">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white leading-none mb-1 uppercase tracking-tight">
                {exercise.name}
              </h3>
              <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(exercise.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
          <button 
            onClick={() => onDelete(exercise.id)}
            className="w-10 h-10 flex items-center justify-center bg-slate-900 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all active:scale-90"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col p-4 bg-black/40 rounded-2xl border border-white/5">
            <span className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Weight</span>
            <div className="flex items-baseline">
              <span className="text-xl font-black text-white">{exercise.weight}</span>
              <span className="ml-1 text-[10px] font-bold text-indigo-500 italic uppercase">KG</span>
            </div>
          </div>
          <div className="flex flex-col p-4 bg-black/40 rounded-2xl border border-white/5">
            <span className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Sets</span>
            <div className="flex items-baseline">
              <span className="text-xl font-black text-white">{exercise.sets}</span>
              <span className="ml-1 text-[10px] font-bold text-purple-500 italic uppercase">SET</span>
            </div>
          </div>
          <div className="flex flex-col p-4 bg-black/40 rounded-2xl border border-white/5">
            <span className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Reps</span>
            <div className="flex items-baseline">
              <span className="text-xl font-black text-white">{exercise.reps}</span>
              <span className="ml-1 text-[10px] font-bold text-fuchsia-500 italic uppercase">REP</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center text-emerald-400 text-[10px] font-bold">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>較上次提升 5%</span>
           </div>
           <div className="text-[10px] font-bold text-slate-600">ID: #{exercise.id.slice(0,4)}</div>
        </div>
      </div>
    </div>
  );
};
