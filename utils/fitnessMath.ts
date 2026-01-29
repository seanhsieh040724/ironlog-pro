
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
  
  // 肩部判定
  if (n.includes('肩') || n.includes('平舉') || n.includes('聳肩') || n.includes('shoulder') || n.includes('press') || n.includes('lateral') || n.includes('面拉') || n.includes('後三角') || n.includes('反向飛鳥')) return 'shoulders';
  
  // 胸部判定：明確加入「撐體」與「俯地挺身」
  if (n.includes('臥推') || n.includes('胸') || n.includes('chest') || n.includes('夾胸') || n.includes('bench') || n.includes('fly') || n.includes('飛鳥') || n.includes('撐體') || n.includes('俯地挺身')) return 'chest';
  
  if (n.includes('划船') || n.includes('下拉') || n.includes('引體') || n.includes('row') || n.includes('lat') || n.includes('硬舉') || n.includes('back') || n.includes('pull') || n.includes('deadlift')) return 'back';
  if (n.includes('蹲') || n.includes('腿') || n.includes('squat') || n.includes('leg') || n.includes('踏車') || n.includes('quad') || n.includes('calve')) return 'quads';
  if (n.includes('彎舉') || n.includes('下壓') || n.includes('三頭') || n.includes('二頭') || n.includes('腕') || n.includes('curl') || n.includes('tricep') || n.includes('bicep') || n.includes('arm')) return 'arms';
  if (n.includes('捲腹') || n.includes('核心') || n.includes('棒式') || n.includes('abs') || n.includes('core') || n.includes('crunch') || n.includes('plank')) return 'core';
  if (n.includes('臀') || n.includes('glute') || n.includes('thrust') || n.includes('hip')) return 'glutes';
  
  return 'core';
};

const EXERCISE_MAP: Record<string, string> = {
  "啞鈴上斜臥推": "https://www.docteur-fitness.com/wp-content/uploads/2000/06/developpe-incline-halteres-exercice-musculation.gif",
  "史密斯機肩推": "https://www.docteur-fitness.com/wp-content/uploads/2022/08/developpe-epaules-smith-machine.gif",
  "器械肩推": "https://www.docteur-fitness.com/wp-content/uploads/2022/11/developpe-epaules-a-la-machine-shoulder-press.gif",
  "啞鈴側平舉": "https://www.docteur-fitness.com/wp-content/uploads/2000/08/elevations-laterales-exercice-musculation.gif",
  "滑輪側平舉": "https://www.docteur-fitness.com/wp-content/uploads/2022/11/elevations-laterales-unilaterale-poulie.gif",
  "器械側平舉": "https://www.docteur-fitness.com/wp-content/uploads/2022/02/elevation-laterale-machine.gif",
  "啞鈴前平舉": "https://www.docteur-fitness.com/wp-content/uploads/2000/08/elevations-frontales-exercice-musculation.gif",
  "蝴蝶機後三角飛鳥": "https://www.docteur-fitness.com/wp-content/uploads/2021/12/pec-deck-inverse.gif",
  "滑輪面拉": "https://www.docteur-fitness.com/wp-content/uploads/2022/01/face-pull.gif",
  "俯身啞鈴反向飛鳥": "https://www.docteur-fitness.com/wp-content/uploads/2021/12/oiseau-assis-sur-banc.gif",
  "啞鈴肩推": "https://www.docteur-fitness.com/wp-content/uploads/2022/02/developpe-epaule-halteres.gif",
  "槓鈴肩推": "https://www.docteur-fitness.com/wp-content/uploads/2000/08/developpe-militaire-exercice-musculation.gif",
  "阿諾肩推": "https://www.docteur-fitness.com/wp-content/uploads/2000/08/developpe-arnold-exercice-musculation.gif",
  "槓鈴平板臥推": "barbell_bench_press",
  "槓鈴深蹲": "barbell_full_squat",
  "傳統硬舉": "barbell_deadlift",
  "引體向上": "pull_up",
  "槓鈴划船": "barbell_bent_over_row",
  "槓鈴彎舉": "barbell_curl",
  "滑輪下拉": "lat_pulldown",
  "標準俯地挺身": "push_up",
  "棒式": "front_plank"
};

const EXERCISE_METHODS: Record<string, string> = {
  "啞鈴上斜臥推": "01 調整長凳 30-45 度並背部貼緊。\n02 雙手垂直推起啞鈴至頂端。\n03 緩慢下降至胸部兩側感受拉伸。",
  "槓鈴平板臥推": "01 仰臥平躺並雙腳踩實。\n02 將槓鈴降至胸骨中段位置。\n03 發力推回起始點，肘部不鎖死。",
  "槓鈴深蹲": "01 槓鈴架於後肩斜方肌。\n02 下蹲至大腿與身體垂直。\n03 重心置於足中後方發力站起。",
  "傳統硬舉": "01 槓鈴貼近脛骨並髖部後移。\n02 挺直背部抓握槓鈴。\n03 以髖部驅動發力站起。",
  "引體向上": "01 雙手寬握橫桿懸垂。\n02 背部發力帶動身體向上。\n03 下巴超過橫桿後控制下降。",
  "滑輪下拉": "01 坐穩並雙手寬握橫桿。\n02 垂直下拉至鎖骨上方。\n03 頂峰收縮後緩慢放回。",
  "啞鈴肩推": "01 坐姿手持啞鈴置於肩側。\n02 垂直向上推至手臂伸直。\n03 控制速度放回至起始高度。",
  "槓鈴划船": "01 俯身 45 度並保持背部平直。\n02 將槓鈴拉向腹部肚臍處。\n03 肩胛骨夾緊後緩慢放下。",
  "標準俯地挺身": "01 雙手略寬於肩，核心緊繃。\n02 胸部下降至接近地面。\n03 全身維持直線發力推起。",
  "棒式": "01 前臂與腳尖撐地，肘肩垂直。\n02 核心、臀部、大腿同時發力。\n03 身體呈直線，避免腰部塌陷。",
  "啞鈴側平舉": "01 雙手持啞鈴自然下垂。\n02 向兩側抬起至與肩同高。\n03 感受肩中束發力，控制下降。",
  "跪姿繩索夾胸": "01 跪姿雙膝著地，核心保持中立緊繃。\n02 雙手持把手從斜上方拉至胸前下方。\n03 動作全程維持肘部微彎，底端擠壓胸部。",
  "器械上斜推胸": "01 調整座椅高度使握把與上胸對齊。\n02 背部緊貼靠墊，挺胸收腹。\n03 沿器械軌道向前上方推起，感受上胸部強烈收縮。",
  "雙槓撐體": "01 雙手支撐於雙槓上，雙臂伸直。\n02 身體微前傾以集中胸部發力。\n03 緩慢下降至肘部約 90 度，隨後發力推回起始位。",
  "史密斯機肩推": "01 坐在史密斯機架內，背部貼緊靠墊。\n02 雙手略寬於肩握住槓鈴，解除安全鎖。\n03 控制重量緩慢降至下巴高度後發力推回頂端。",
  "器械側平舉": "01 坐穩於器械中，雙手握住把手或墊在擋板上。\n02 肩部發力帶動手臂向兩側平抬至與肩平行。\n03 在頂端稍作停頓，隨後緩慢控制回放。",
  "滑輪面拉": "01 滑輪設定於與眼部同高，雙手持繩索端。\n02 雙手向面部兩側拉動，手肘抬高，感受後三角肌收縮。\n03 在頂端稍作停留，緩慢放回並保持肌肉張力。",
  "蝴蝶機後三角飛鳥": "01 面向機器坐好，雙手握把手，手臂微彎與肩同高。\n02 肩部發力帶動手臂向後方展開，擠壓後三角肌。\n03 緩慢放回，保持肩部持續張力。",
  "俯身啞鈴反向飛鳥": "01 雙腳與肩同寬，俯身至軀幹接近與地面平行，背部平直。\n02 雙手持啞鈴垂於下方，肘部微彎，向兩側抬起啞鈴。\n03 在頂端擠壓後三角肌與上背部，緩慢控制放回。",
  "槓鈴肩推": "01 雙腳與肩同寬，手持槓鈴與肩同寬握距。\n02 核心收緊，垂直向上推起槓鈴，直至雙臂伸直。\n03 控制速度緩慢降回起始位置，避免腰椎過度伸展。",
  "阿諾肩推": "01 坐姿持啞鈴，掌心面向自己，手肘位於前方。\n02 向上推起啞鈴時，手腕向外旋轉直至掌心向前。\n03 下盤按原路徑旋轉回起始位置，增加肩部全面刺激。",
  "器械肩推": "01 調整座椅高度使握把略低於肩部。\n02 背部貼緊靠墊，垂直向上推起握把。\n03 控制速度緩慢降回，感受肩部前束發力。",
  "滑輪側平舉": "01 單手持低位滑輪握把，側向機器站立。\n02 手臂微彎，向側上方拉動繩索至與肩同高。\n03 緩慢控制回放，保持肌肉張力，換邊重複。",
  "啞鈴前平舉": "01 雙手持啞鈴自然下垂於大腿前方。\n02 核心收緊，手臂微彎將啞鈴向前抬起至肩部高度。\n03 控制速度緩慢降回起始位，避免身體過度晃動。"
};

export const fetchExerciseGif = async (exerciseName: string): Promise<string> => {
  const name = exerciseName.trim();
  const exerciseKey = EXERCISE_MAP[name];
  if (exerciseKey) {
    if (exerciseKey.startsWith('http')) return exerciseKey;
    return `https://fitnessprogramer.com/wp-content/uploads/2021/02/${exerciseKey}.gif`;
  }
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

export const getExerciseMethod = (name: string): string => {
  return EXERCISE_METHODS[name] || "01 準備起始姿勢並穩定核心。\n02 按照標準路徑執行動作。\n03 控制離心速度回到原位. ";
};

export const calculateMuscleActivation = (history: WorkoutSession[]): Record<MuscleGroup, number> => {
  const last7Days = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const recentSessions = history.filter(s => s.startTime > last7Days);
  const scores: Record<MuscleGroup, number> = {
    chest: 0, back: 0, quads: 0, hamstrings: 0, shoulders: 0, arms: 0, core: 0, glutes: 0
  };
  recentSessions.forEach(session => {
    session.exercises.forEach(ex => {
      const setCount = ex.sets.length; 
      if (scores[ex.muscleGroup] !== undefined) {
        scores[ex.muscleGroup] += setCount;
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
