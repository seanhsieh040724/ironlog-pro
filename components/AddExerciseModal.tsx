
import React, { useState } from 'react';
import { X, Check, Activity, Weight, Layers, Hash } from 'lucide-react';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (exercise: { name: string, weight: number, sets: number, reps: number }) => void;
}

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !weight || !sets || !reps) return;
    onAdd({
      name,
      weight: Number(weight),
      sets: Number(sets),
      reps: Number(reps),
    });
    setName(''); setWeight(''); setSets(''); setReps('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0f1115] rounded-t-[40px] border-t border-white/10 shadow-2xl p-8 animate-in slide-in-from-bottom-full duration-500 ease-out safe-bottom">
        {/* Handle for the bottom sheet */}
        <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-8 cursor-pointer" onClick={onClose} />
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">NEW ENTRY</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">紀錄你的訓練汗水</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-slate-500 transition-all active:scale-90">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              <Activity className="w-3 h-3 mr-1" /> 動作名稱
            </div>
            <input
              autoFocus
              type="text"
              placeholder="例如：槓鈴深蹲..."
              className="w-full bg-black/50 border border-white/5 rounded-2xl px-5 py-4 text-white text-lg font-bold placeholder:text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
             <div className="space-y-2">
                <div className="flex items-center text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  <Weight className="w-3 h-3 mr-1" /> 重量
                </div>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="KG"
                  className="w-full bg-black/50 border border-white/5 rounded-2xl px-5 py-4 text-white text-center font-black focus:outline-none focus:border-indigo-500 transition-all"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
             </div>
             <div className="space-y-2">
                <div className="flex items-center text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  <Layers className="w-3 h-3 mr-1" /> 組數
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="SET"
                  className="w-full bg-black/50 border border-white/5 rounded-2xl px-5 py-4 text-white text-center font-black focus:outline-none focus:border-purple-500 transition-all"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  required
                />
             </div>
             <div className="space-y-2">
                <div className="flex items-center text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  <Hash className="w-3 h-3 mr-1" /> 次數
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="REP"
                  className="w-full bg-black/50 border border-white/5 rounded-2xl px-5 py-4 text-white text-center font-black focus:outline-none focus:border-fuchsia-500 transition-all"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  required
                />
             </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black py-5 rounded-2xl shadow-[0_10px_20px_rgba(99,102,241,0.3)] flex items-center justify-center space-x-2 transition-all active:scale-95 uppercase tracking-tighter text-lg mt-4"
          >
            <Check className="w-6 h-6 stroke-[3px]" />
            <span>完成紀錄並上傳</span>
          </button>
        </form>
      </div>
    </div>
  );
};
