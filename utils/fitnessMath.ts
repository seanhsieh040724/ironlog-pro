
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
    quads: { cn: '腿部', en: 'LEGS' },
    hamstrings: { cn: '膕繩', en: 'HAM' },
    shoulders: { cn: '肩部', en: 'SHOULDER' },
    arms: { cn: '手臂', en: 'ARMS' },
    core: { cn: '核心', en: 'CORE' },
    glutes: { cn: '臀部', en: 'GLUTES' }
  };
  return map[mg] || { cn: '全身', en: 'TOTAL' };
};

export const getMuscleGroup = (name: string): MuscleGroup => {
  const n = name.toLowerCase();
  if (n.includes('臥推') || n.includes('胸') || n.includes('chest') || n.includes('夾胸') || n.includes('bench') || n.includes('fly')) return 'chest';
  if (n.includes('划船') || n.includes('下拉') || n.includes('引體') || n.includes('row') || n.includes('lat') || n.includes('硬舉') || n.includes('back') || n.includes('pull') || n.includes('deadlift')) return 'back';
  if (n.includes('蹲') || n.includes('腿') || n.includes('squat') || n.includes('leg') || n.includes('踏車') || n.includes('quad') || n.includes('calve')) return 'quads';
  if (n.includes('彎舉') || n.includes('下壓') || n.includes('三頭') || n.includes('二頭') || n.includes('腕') || n.includes('curl') || n.includes('tricep') || n.includes('bicep') || n.includes('arm')) return 'arms';
  if (n.includes('肩') || n.includes('平舉') || n.includes('聳肩') || n.includes('shoulder') || n.includes('press') || n.includes('lateral')) return 'shoulders';
  if (n.includes('捲腹') || n.includes('核心') || n.includes('棒式') || n.includes('abs') || n.includes('core') || n.includes('crunch') || n.includes('plank')) return 'core';
  if (n.includes('臀') || n.includes('glute') || n.includes('thrust') || n.includes('hip')) return 'glutes';
  return 'core';
};

/**
 * 智慧映射：將中文動作對應到開源資料庫的 ID
 */
const EXERCISE_MAP: Record<string, string> = {
  "槓鈴平板臥推": "barbell_bench_press",
  "槓鈴深蹲": "barbell_full_squat",
  "傳統硬舉": "barbell_deadlift",
  "引體向上": "pull_up",
  "槓鈴划船": "barbell_bent_over_row",
  "啞鈴肩推": "dumbbell_shoulder_press",
  "槓鈴彎舉": "barbell_curl",
  "滑輪下拉": "lat_pulldown",
  "標準俯地挺身": "push_up",
  "雙槓撐體": "triceps_dip",
  "啞鈴平板臥推": "dumbbell_bench_press",
  "蝴蝶機夾胸": "lever_pec_deck_fly",
  "啞鈴側平舉": "dumbbell_lateral_raise",
  "保加利亞分腿蹲": "dumbbell_bulgarian_split_squat",
  "器械腿部推蹬": "sled_45_degree_leg_press",
  "器械腿伸展": "lever_leg_extension",
  "坐姿腿屈伸": "lever_seated_leg_curl",
  "滑輪繩索下壓": "cable_triceps_pushdown",
  "棒式": "front_plank"
};

/**
 * 根據動作名稱從開源資料庫獲取示範 GIF 連結
 */
export const fetchExerciseGif = async (exerciseName: string): Promise<string> => {
  const name = exerciseName.trim();
  const exerciseKey = EXERCISE_MAP[name];
  
  // 延遲模擬
  await new Promise(resolve => setTimeout(resolve, 500));

  if (exerciseKey) {
    // 使用 fitness-programer 開放資源，這是一個非常穩定的直連 GIF 資源庫
    return `https://fitnessprogramer.com/wp-content/uploads/2021/02/${exerciseKey}.gif`;
  }

  // 如果找不到精確匹配，根據肌群回傳一個通用的高品質示範圖
  const group = getMuscleGroup(exerciseName);
  const fallbackMap: Record<string, string> = {
    "chest": "https://fitnessprogramer.com/wp-content/uploads/2021/02/barbell_bench_press.gif",
    "back": "https://fitnessprogramer.com/wp-content/uploads/2021/02/lat_pulldown.gif",
    "quads": "https://fitnessprogramer.com/wp-content/uploads/2021/02/barbell_full_squat.gif",
    "arms": "https://fitnessprogramer.com/wp-content/uploads/2021/02/barbell_curl.gif",
    "shoulders": "https://fitnessprogramer.com/wp-content/uploads/2021/02/dumbbell_shoulder_press.gif"
  };

  return fallbackMap[group] || "https://fitnessprogramer.com/wp-content/uploads/2021/02/barbell_bench_press.gif";
};

export const calculateMuscleActivation = (history: WorkoutSession[]): Record<MuscleGroup, number> => {
  const last7Days = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const recentSessions = history.filter(s => s.startTime > last7Days);
  
  const scores: Record<MuscleGroup, number> = {
    chest: 0, back: 0, quads: 0, hamstrings: 0, shoulders: 0, arms: 0, core: 0, glutes: 0
  };
  
  recentSessions.forEach(session => {
    session.exercises.forEach(ex => {
      const setWeight = ex.sets.length; 
      if (scores[ex.muscleGroup] !== undefined) {
        scores[ex.muscleGroup] += setWeight;
      }
    });
  });
  
  const maxFreq = Math.max(...Object.values(scores), 1);
  Object.keys(scores).forEach(key => {
    const k = key as MuscleGroup;
    scores[k] = Math.min(100, Math.round((scores[k] / maxFreq) * 100));
  });
  
  return scores;
};
