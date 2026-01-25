
import { WorkoutSession, MuscleGroup } from '../types';

export const calculate1RM = (weight: number, reps: number): number => {
  if (reps === 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
};

export const getBMIAnalysis = (bmi: number) => {
  if (bmi < 18.5) return { label: '體重過輕', color: 'text-sky-400' };
  if (bmi < 24) return { label: '體態正常', color: 'text-neon-green' };
  if (bmi < 27) return { label: '過重', color: 'text-orange-400' };
  if (bmi < 30) return { label: '輕度肥胖', color: 'text-red-400' };
  return { label: '中重度肥胖', color: 'text-red-600' };
};

export const calculateSuggestedCalories = (
  weight: number, 
  height: number, 
  age: number, 
  gender: 'male' | 'female',
  goal: 'bulk' | 'cut' | 'maintain',
  activityLevel: number = 1.55
) => {
  // Mifflin-St Jeor Equation
  const bmr = gender === 'male'
    ? (10 * weight) + (6.25 * height) - (5 * age) + 5
    : (10 * weight) + (6.25 * height) - (5 * age) - 161;
  
  const tdee = bmr * activityLevel;
  
  if (goal === 'cut') return Math.round(tdee - 500);
  if (goal === 'bulk') return Math.round(tdee + 300);
  return Math.round(tdee);
};

export const getMuscleGroupDisplay = (mg: MuscleGroup): { cn: string, en: string } => {
  const map: Record<MuscleGroup, { cn: string, en: string }> = {
    chest: { cn: '胸部', en: 'CHEST' },
    back: { cn: '背部', en: 'BACK' },
    quads: { cn: '腿部', en: 'LEGS/QUADS' },
    hamstrings: { cn: '膕繩肌', en: 'HAMSTRINGS' },
    shoulders: { cn: '肩部', en: 'SHOULDERS' },
    arms: { cn: '手臂', en: 'ARMS' },
    core: { cn: '核心', en: 'CORE' },
    glutes: { cn: '臀部', en: 'GLUTES' }
  };
  return map[mg] || { cn: '全身', en: 'TOTAL BODY' };
};

export const getMuscleGroup = (name: string): MuscleGroup => {
  const n = name.toLowerCase();
  if (n.includes('臥推') || n.includes('胸') || n.includes('bench') || n.includes('chest')) return 'chest';
  if (n.includes('划船') || n.includes('下拉') || n.includes('引體') || n.includes('row') || n.includes('pull') || n.includes('lat')) return 'back';
  if (n.includes('蹲') || n.includes('腿') || n.includes('squat') || n.includes('leg')) return 'quads';
  if (n.includes('彎舉') || n.includes('下壓') || n.includes('三頭') || n.includes('二頭') || n.includes('curl') || n.includes('tricep')) return 'arms';
  if (n.includes('肩') || n.includes('平舉') || n.includes('shoulder') || n.includes('press')) return 'shoulders';
  if (n.includes('捲腹') || n.includes('核心') || n.includes('abs') || n.includes('core')) return 'core';
  if (n.includes('臀') || n.includes('kickback') || n.includes('thrust')) return 'glutes';
  return 'core';
};

export const calculateMuscleActivation = (history: WorkoutSession[]): Record<MuscleGroup, number> => {
  const last30Days = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const recentSessions = history.filter(s => s.startTime > last30Days);
  const scores: Record<MuscleGroup, number> = {
    chest: 0, back: 0, quads: 0, hamstrings: 0, shoulders: 0, arms: 0, core: 0, glutes: 0
  };
  recentSessions.forEach(session => {
    session.exercises.forEach(ex => {
      const volume = ex.sets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
      scores[ex.muscleGroup] += volume;
    });
  });
  const maxVolume = Math.max(...Object.values(scores), 1);
  Object.keys(scores).forEach(key => {
    const k = key as MuscleGroup;
    scores[k] = Math.min(100, Math.round((scores[k] / maxVolume) * 100));
  });
  return scores;
};
