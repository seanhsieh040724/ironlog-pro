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

export const calculateMacros = (calories: number, weight: number, goal: string) => {
  if (calories <= 0) return { protein: 0, carbs: 0, fats: 0 };
  
  // 蛋白質建議：健身人群通常為 1.8g - 2.2g per kg
  const pGrams = Math.round(weight * 2);
  const pCal = pGrams * 4;
  
  let fPercent = 0.25; // 脂肪預設佔 25%
  if (goal === 'cut') fPercent = 0.20;
  
  const fCal = calories * fPercent;
  const fGrams = Math.round(fCal / 9);
  
  const cCal = calories - pCal - fCal;
  const cGrams = Math.max(0, Math.round(cCal / 4));
  
  return {
    protein: pGrams,
    carbs: cGrams,
    fats: fGrams
  };
};

export const calculateWaterIntake = (weight: number) => {
  // 基礎建議 35ml - 40ml 每公斤體重
  return Math.round(weight * 35);
};

export const getMuscleGroupDisplay = (mg: MuscleGroup | string): { cn: string, en: string } => {
  const map: Record<string, { cn: string, en: string }> = {
    chest: { cn: '胸部', en: 'CHEST' },
    back: { cn: '背部', en: 'BACK' },
    quads: { cn: '腿部', en: 'LEGS' },
    legs: { cn: '腿部', en: 'LEGS' },
    hamstrings: { cn: '膕繩', en: 'HAM' },
    shoulders: { cn: '肩部', en: 'SHOULDER' },
    arms: { cn: '手臂', en: 'ARMS' },
    core: { cn: '核心', en: 'CORE' },
    glutes: { cn: '臀部', en: 'GLUTES' }
  };
  return map[mg] || { cn: '腿部', en: 'LEGS' };
};

export const getMuscleGroup = (name: string): MuscleGroup => {
  const n = name.toLowerCase();
  if (n.includes('彎舉') || n.includes('下壓') || n.includes('三頭') || n.includes('二頭') || n.includes('腕') || n.includes('臂屈伸') || n.includes('窄握') || n.includes('curl') || n.includes('tricep') || n.includes('bicep') || n.includes('arm')) return 'arms';
  if (n.includes('捲腹') || n.includes('起坐') || n.includes('抬腿') || n.includes('核心') || n.includes('棒式') || n.includes('abs') || n.includes('core') || n.includes('crunch') || n.includes('plank')) return 'core';
  if (n.includes('蹲') || n.includes('腿') || n.includes('squat') || n.includes('leg') || n.includes('踏車') || n.includes('quad') || n.includes('calve') || n.includes('臀推') || n.includes('thrust') || n.includes('hip') || n.includes('提踵') || n.includes('calf') || n.includes('相撲') || n.includes('sumo') || n.includes('六角槓') || n.includes('trap bar')) return 'quads';
  if (n.includes('肩') || n.includes('平舉') || n.includes('聳肩') || n.includes('shoulder') || n.includes('press') || n.includes('lateral') || n.includes('面拉') || n.includes('後三角') || n.includes('反向飛鳥')) return 'shoulders';
  if (n.includes('臥推') || n.includes('胸') || n.includes('chest') || n.includes('夾胸') || n.includes('bench') || n.includes('fly') || n.includes('飛鳥') || n.includes('撐體') || n.includes('俯地挺身')) return 'chest';
  if (n.includes('划船') || n.includes('下拉') || n.includes('引體') || n.includes('row') || n.includes('lat') || n.includes('硬舉') || n.includes('back') || n.includes('pull') || n.includes('deadlift')) return 'back';
  if (n.includes('臀') || n.includes('glute')) return 'glutes';
  return 'core';
};

const EXERCISE_MEDIA_REGISTRY: Record<string, string> = {
  "啞鈴肩推": "https://www.docteur-fitness.com/wp-content/uploads/2022/02/developpe-epaule-halteres.gif",
  "槓鈴肩推": "https://www.docteur-fitness.com/wp-content/uploads/2000/08/developpe-militaire-exercice-musculation.gif",
  "阿諾肩推": "https://www.docteur-fitness.com/wp-content/uploads/2000/08/developpe-arnold-exercice-musculation.gif",
  "器械肩推": "https://www.docteur-fitness.com/wp-content/uploads/2022/11/developpe-epaules-a-la-machine-shoulder-press.gif",
  "史密斯機肩推": "https://www.docteur-fitness.com/wp-content/uploads/2022/08/developpe-epaules-smith-machine.gif",
  "啞鈴側平舉": "https://www.docteur-fitness.com/wp-content/uploads/2000/08/elevations-laterales-exercice-musculation.gif",
  "滑輪側平舉": "https://www.docteur-fitness.com/wp-content/uploads/2022/11/elevations-laterales-unilaterale-poulie.gif",
  "器械側平舉": "https://www.docteur-fitness.com/wp-content/uploads/2022/02/elevation-laterale-machine.gif",
  "啞鈴前平舉": "https://www.docteur-fitness.com/wp-content/uploads/2000/08/elevations-frontales-exercice-musculation.gif",
  "蝴蝶機後三角飛鳥": "https://www.docteur-fitness.com/wp-content/uploads/2021/12/pec-deck-inverse.gif",
  "滑輪面拉": "https://www.docteur-fitness.com/wp-content/uploads/2022/01/face-pull.gif",
  "俯身啞鈴反向飛鳥": "https://www.docteur-fitness.com/wp-content/uploads/2021/12/oiseau-assis-sur-banc.gif",
  "啞鈴上斜臥推": "https://www.docteur-fitness.com/wp-content/uploads/2000/06/developpe-incline-halteres-exercice-musculation.gif",
  "槓鈴平板臥推": "https://www.docteur-fitness.com/wp-content/uploads/2022/01/developpe-couche-prise-inversee.gif",
  "槓鈴上斜臥推": "https://www.docteur-fitness.com/wp-content/uploads/2021/10/developpe-incline-barre.gif",
  "啞鈴平板臥推": "https://www.docteur-fitness.com/wp-content/uploads/2000/05/developpe-couche-halteres-exercice-musculation.gif",
  "史密斯平板臥推": "https://www.docteur-fitness.com/wp-content/uploads/2022/08/developpe-couche-smith-machine.gif",
  "坐姿器械推胸": "https://www.docteur-fitness.com/wp-content/uploads/2022/11/developpe-machine-assis-pectoraux.gif",
  "蝴蝶機夾胸": "https://www.docteur-fitness.com/wp-content/uploads/2000/06/pec-deck-butterfly-exercice-musculation.gif",
  "跪姿繩索夾胸": "https://www.docteur-fitness.com/wp-content/uploads/2023/07/ecarte-a-la-poulie-vis-a-vis-haute-a-genoux.gif",
  "器械上斜推胸": "https://www.docteur-fitness.com/wp-content/uploads/2000/06/developpe-incline-machine-convergente-exercice-musculation.gif",
  "史密斯上斜臥推": "https://fitliferegime.com/wp-content/uploads/2024/04/Smith-Machine-Incline-Press.gif",
  "雙槓撐體": "https://i.pinimg.com/originals/e7/45/d6/e745d6fcd41963a8a6d36c4b66c009a9.gif",
  "標準俯地挺身": "https://www.docteur-fitness.com/wp-content/uploads/2020/10/pompe-musculation.gif",
  "槓鈴彎舉": "https://www.docteur-fitness.com/wp-content/uploads/2021/09/curl-barre.gif",
  "啞鈴錘式彎舉": "https://www.docteur-fitness.com/wp-content/uploads/2022/09/curl-haltere-prise-neutre.gif",
  "啞鈴交替彎舉": "https://www.docteur-fitness.com/wp-content/uploads/2022/08/curl-biceps-avec-halteres-alterne.gif",
  "牧師椅彎舉": "https://www.docteur-fitness.com/wp-content/uploads/2022/01/curl-au-pupitre-barre-ez-larry-scott.gif",
  "滑輪直桿彎舉": "https://www.docteur-fitness.com/wp-content/uploads/2021/10/curl-biceps-poulie-basse.gif",
  "反手槓鈴彎舉": "https://www.docteur-fitness.com/wp-content/uploads/2022/04/curl-inverse-barre.gif",
  "二頭肌器械彎舉": "https://www.docteur-fitness.com/wp-content/uploads/2022/01/curl-pupitre-machine-prechargee.gif",
  "滑輪繩索下壓": "https://www.aesthetics-blog.com/wp-content/uploads/2023/04/12271301-Cable-Standing-One-Arm-Tricep-Pushdown-Overhand-Grip_Upper-Arms_720.gif",
  "窄握槓鈴臥推": "https://www.aesthetics-blog.com/wp-content/uploads/2021/10/00301301-Barbell-Close-Grip-Bench-Press_Upper-Arms_720.gif",
  "仰臥槓鈴臂屈伸": "https://www.aesthetics-blog.com/wp-content/uploads/2019/08/00601301-Barbell-Lying-Triceps-Extension-Skull-Crusher_Triceps-SFIX_720.gif",
  "啞鈴頸後臂屈伸": "https://www.docteur-fitness.com/wp-content/uploads/2022/12/extensions-des-triceps-assis-avec-haltere.gif",
  "滑輪直桿過頭臂屈伸": "https://www.docteur-fitness.com/wp-content/uploads/2022/01/extension-triceps-incline-poulie-basse.gif",
  "引體向上": "https://www.docteur-fitness.com/wp-content/uploads/2022/02/traction-musculation-dos.gif",
  "滑輪下拉": "https://www.docteur-fitness.com/wp-content/uploads/2021/11/tirage-vertical-poitrine.gif",
  "槓鈴划船": "https://www.docteur-fitness.com/wp-content/uploads/2021/09/rowing-barre.gif",
  "啞鈴單臂划船": "https://www.docteur-fitness.com/wp-content/uploads/2021/08/rowing-haltere-un-bras.gif",
  "坐姿划船機": "https://www.docteur-fitness.com/wp-content/uploads/2022/01/rowing-assis-machine-hammer-strenght.gif",
  "T桿划船機": "https://www.docteur-fitness.com/wp-content/uploads/2022/01/rowing-t-bar-machine.gif",
  "器械反握高位下拉": "https://www.docteur-fitness.com/wp-content/uploads/2022/01/tirage-avant-iso-laterale-hammer-strength.gif",
  "傳統硬舉": "https://www.docteur-fitness.com/wp-content/uploads/2021/12/souleve-de-terre.gif",
  "輔助引體向上機": "https://www.docteur-fitness.com/wp-content/uploads/2022/02/traction-assistee-machine.gif",
  "V把坐姿划船": "https://www.docteur-fitness.com/wp-content/uploads/2022/02/tirage-horizontal-poulie.gif",
  "寬握水平划船": "https://www.docteur-fitness.com/wp-content/uploads/2022/10/tirage-horizontal-prise-large.gif",
  "滑輪反握下拉": "https://www.docteur-fitness.com/wp-content/uploads/2022/01/tirage-vertical-prise-inversee.gif",
  "槓鈴深蹲": "https://www.docteur-fitness.com/wp-content/uploads/2021/11/homme-faisant-un-squat-avec-barre.gif",
  "啞鈴高腳杯蹲": "https://www.docteur-fitness.com/wp-content/uploads/2000/06/squat-goblet-exercice-musculation.gif",
  "上斜腿推機": "https://www.docteur-fitness.com/wp-content/uploads/2022/08/presse-a-cuisses-inclinee.gif",
  "保加利亞啞鈴分腿蹲": "https://www.aesthetics-blog.com/wp-content/uploads/2023/02/04101301-Dumbbell-Single-Leg-Split-Squat_Thighs-FIX_720.gif",
  "哈克深蹲": "https://www.docteur-fitness.com/wp-content/uploads/2022/01/hack-squat.gif",
  "仰臥腿後勾": "https://www.docteur-fitness.com/wp-content/uploads/2021/10/leg-curl-allonge.gif",
  "坐姿腿後勾": "https://www.docteur-fitness.com/wp-content/uploads/2022/02/leg-curl-assis-machine.gif",
  "器械站姿提踵": "https://www.docteur-fitness.com/wp-content/uploads/2021/10/extension-mollets-debout-machine.gif",
  "相撲硬舉": "https://www.docteur-fitness.com/wp-content/uploads/2021/10/souleve-de-terre-sumo.gif",
  "六角槓硬舉": "https://www.docteur-fitness.com/wp-content/uploads/2021/10/souleve-de-terre-a-la-trap-bar.gif",
  "器械腿外展": "https://static.wixstatic.com/media/2edbed_2c54524226684ddea7f4e2e08a472a3a~mv2.gif",
  "器械腿內收": "https://fitliferegime.com/wp-content/uploads/2024/04/Lever-Seated-Adduction.gif",
  "仰臥起坐": "https://www.docteur-fitness.com/wp-content/uploads/2000/07/crunch-au-sol-exercice-musculation.gif",
  "羅馬椅抬腿": "https://www.docteur-fitness.com/wp-content/uploads/2022/04/releve-jambes-chaise-romaine-abdominaux.gif",
  "棒式": "https://www.docteur-fitness.com/wp-content/uploads/2022/05/planche-abdos.gif",
  "俄羅斯轉體": "https://www.docteur-fitness.com/wp-content/uploads/2022/04/rotations-russes-obliques.gif",
  "健腹輪": "https://www.docteur-fitness.com/wp-content/uploads/2022/02/roulette-abdominaux.gif",
  "器械捲腹": "https://www.docteur-fitness.com/wp-content/uploads/2022/04/crunch-machine-abdos.gif",
  "懸垂抬腿": "https://www.docteur-fitness.com/wp-content/uploads/2000/07/releve-de-genoux-suspendu-exercice-musculation.gif",
  "登山者": "https://www.docteur-fitness.com/wp-content/uploads/2000/06/mountain-climber-exercice-musculation.gif",
  "側棒式": "https://www.docteur-fitness.com/wp-content/uploads/2022/01/planche-laterale-obliques.gif",
  "跪姿滑輪捲腹": "https://www.docteur-fitness.com/wp-content/uploads/2000/06/crunch-poulie-haute-exercice-musculation.gif",
  "下斜捲腹": "https://www.docteur-fitness.com/wp-content/uploads/2022/02/sit-up-decline.gif",
  "滑輪側捲腹": "https://www.docteur-fitness.com/wp-content/uploads/2022/04/flexions-laterales-poulie-basse.gif"
};

export const fetchExerciseGif = async (exerciseName: string): Promise<string> => {
  const name = exerciseName.trim();
  const registeredUrl = EXERCISE_MEDIA_REGISTRY[name];
  if (registeredUrl) return registeredUrl;
  const group = getMuscleGroup(exerciseName);
  const fallbackMap: Record<string, string> = {
    "chest": "https://fitnessprogramer.com/wp-content/uploads/2021/02/barbell_bench_press.gif",
    "back": "https://fitnessprogramer.com/wp-content/uploads/2021/02/lat_pulldown.gif",
    "quads": "https://fitnessprogramer.com/wp-content/uploads/2021/02/barbell_full_squat.gif",
    "arms": "https://fitnessprogramer.com/wp-content/uploads/2021/02/barbell_curl.gif",
    "shoulders": "https://fitnessprogramer.com/wp-content/uploads/2021/02/dumbbell_shoulder_press.gif",
    "core": "https://fitnessprogramer.com/wp-content/uploads/2021/02/crunch.gif"
  };
  return fallbackMap[group] || "https://fitnessprogramer.com/wp-content/uploads/2021/02/barbell_bench_press.gif";
};

const EXERCISE_METHODS: Record<string, string> = {
  // 胸部 (Chest)
  "槓鈴平板臥推": "01 平躺於長凳上，展開胸部，雙手比肩膀略寬的位置握住槓鈴，將槓鈴從架上舉起。\n\n02 緩慢彎曲手肘，控制槓鈴下降，直到槓鈴接近胸部，此時應感受到胸肌的舒張。\n\n03 感覺胸肌收縮時，用胸肌力量將槓鈴向上推起。",

  "槓鈴上斜臥推": "01 將長凳調整至上斜角度（約 30-45 度），平躺後收攏肩胛骨，雙手以略寬於肩的距離握槓並舉起。\n\n02 緩慢控制槓鈴下降至鎖骨下方（上胸位置），感受上胸肌群的延伸與舒張。\n\n03 感覺上胸肌群收縮，用力將槓鈴垂直推回起始位置。",

  "啞鈴平板臥推": "01 平躺於平板長凳，雙手各持啞鈴舉至胸部正上方，掌心朝前，保持手腕與前臂垂直於地面。\n\n02 緩慢向兩側下降啞鈴，感受胸大肌被拉長與舒張，注意手肘位置不要低於背部平面過多。\n\n03 感覺胸肌收縮發力，帶動啞鈴向中心靠攏並推起，頂峰時擠壓胸肌。",

  "啞鈴上斜臥推": "01 坐在上斜長凳上，雙手持啞鈴舉至肩上方，背部緊貼凳面，核心收緊以穩定身體。\n\n02 緩慢下降啞鈴至胸部兩側，控制動作節奏，感受上胸與肩部交界處的舒張。\n\n03 感覺上胸肌群收縮，將啞鈴向中間斜上方推起，並在最高點與胸肌鎖定。",

  "史密斯平板臥推": "01 在史密斯機下的平板凳平躺，調整身體使槓鈴軌道位於胸部上方，雙手握穩後轉動槓鈴解鎖。\n\n02 沿著固定軌道緩慢下降槓鈴，感受胸肌在穩定的路徑中受力與舒張。\n\n03 感覺胸肌收縮時，順著軌道將槓鈴推起，利用機器穩定性專注於胸肌發力。",

  "坐姿器械推胸": "01 調整座椅高度使握把與胸部中線齊平，背部與頭部緊貼靠墊，雙手握緊把手。\n\n02 控制重量緩慢回放，感受握把向後移動時胸部肌群的深度舒張。\n\n03 感覺胸肌收縮，用力將握把向前推至手臂伸直，注意手肘不鎖死。",

  "蝴蝶機夾胸": "01 坐在機器上，背部貼緊靠背，雙臂向兩側張開握住把手，手肘微彎並保持固定。\n\n02 緩慢讓把手向兩側張開，控制回彈力道，直到感受胸肌內側至外側的完全舒張。\n\n03 感覺胸肌內側收縮，帶動雙臂向中心擠壓，直到雙手接近併攏，加強對胸部中縫的刺激。",

  "跪姿繩索夾胸": "01 採跪姿於滑輪機中央，雙手握住高位把手，身體稍微前傾，核心收緊維持平衡。\n\n02 緩慢將手臂向兩側斜上方打開，控制繩索拉力，感受胸大肌整體的舒張。\n\n03 感覺胸肌下緣與內側收縮，雙臂向身體前方斜下方劃出弧線合併，專注於胸肌擠壓感。",

  "雙槓撐體": "01 雙手握住雙槓支撐起身體，上半身微前傾，膝蓋微彎，使身體重心稍微偏向前胸。\n\n02 緩慢彎曲手肘下降身體，直到感受胸肌下緣有明顯的牽拉感與舒張。\n\n03 感覺胸肌下緣收縮發力，將身體撐回起始位置，過程保持肩部穩定。",

  "標準俯地挺身": "01 雙手撐地與肩同寬，身體從頭到腳呈一直線，指尖朝前，維持全身張力。\n\n02 緩慢彎曲手肘下降軀幹，直到胸部幾乎觸碰地面，感受胸部肌肉的橫向舒張。\n\n03 感覺胸肌收縮，用雙手推地的力量將身體抬起，回到起始的平板姿勢。",

  "器械上斜推胸": "01 坐在上斜推胸機上，調整座椅使握把位於上胸高度，雙腳踩穩地面。\n\n02 緩慢控制握把回收，感受上胸肌群在傾斜角度下的受壓與舒張。\n\n03 感覺上胸收縮，將握把沿著機器軌道向上方推起，專注於上胸的飽滿感。",

  "史密斯上斜臥推": "01 將斜凳置於史密斯機內，平躺後確認槓鈴路徑對準上胸，雙手握寬後解鎖。\n\n02 沿著垂直或微斜軌道緩慢降下槓鈴，控制重心，感受上胸纖維的拉伸與舒張。\n\n03 感覺上胸肌肉強力收縮，將槓鈴推回頂端，利用固定軌道進行高強度擠壓。",

  // 背部 (Back)
  "引體向上": "01 雙手略寬於肩握住單槓，身體自然垂懸，核心收緊，穩定軀幹不晃動。\n\n02 緩慢下降身體回到垂懸狀態，控制下落速度，感受背闊肌兩側的拉伸與舒張。\n\n03 感覺背部肌群收縮時，帶動手肘向下拉，將身體向上拉起直到下巴超過單槓高度。",

  "滑輪下拉": "01 坐在機器上並將護墊調整至固定大腿，雙手寬握把手，身體微後傾，鎖定肩胛骨。\n\n02 緩慢放回重量使把手向上移動，控制背部的張力，感受背闊肌由內而外的完全舒張。\n\n03 感覺背部肌群收縮，用力將把手向下拉至上胸處，手肘向下並向後夾緊，稍作停頓。",

  "槓鈴划船": "01 雙腳與肩同寬，上半身前傾並保持背部平直，雙手略寬於肩握住槓鈴，雙臂自然下垂。\n\n02 緩慢放下槓鈴，控制重量不與地面碰撞，始讓背部保持緊繃，感受背部肌群的深度舒張。\n\n03 感覺背部肌群收縮，將槓鈴拉向腹部位置，手肘向後上方帶動，並在頂峰擠壓背部。",

  "啞鈴單臂划船": "01 一手撐在長凳上，同側膝蓋也跪於凳面穩定身體，另一手持啞鈴自然垂下，保持背部與地面平行。\n\n02 緩慢控制啞鈴下降，延伸肩胛骨但不讓身體傾斜，感受單側背肌的完整舒張。\n\n03 感覺背肌收縮發力，帶動手肘向後上方拉起啞鈴，直至與軀幹平行，感受肌肉強力擠壓。",

  "坐姿划船機": "01 坐在機器上，雙腳踩穩踏板，背部挺直，雙手握緊把手，保持肩胛骨下壓並挺胸。\n\n02 緩慢回放重量，讓雙臂向前伸展，控制背部的張力，感受大圓肌與背闊肌的拉伸與舒張。\n\n03 感覺背部肌群收縮時，將把手拉向身體，手肘緊貼身體兩側向後延伸，夾緊後背。",

  "T桿划船機": "01 跨站於機器上方，雙手握住 V 型握把，膝蓋微彎，保持背部平直且核心極度穩定。\n\n02 緩慢放下重量，控制下降幅度，保持腰背部張力，感受到中背部肌群的舒張。\n\n03 感覺中背部收縮發力，將 T 桿向上拉起，專注於肩胛骨向中線靠攏的擠壓感受。",

  "器械反握高位下拉": "01 坐在機器上，雙手反握把手（掌心朝向自己），調整座椅高度使手臂能充分向上延伸。\n\n02 緩慢放回重量向上移動，控制背部受力，感受到背闊肌下緣強烈的延伸與舒張。\n\n03 感覺背部收縮發力，將把手下拉至胸前，專注於手肘向下夾緊並感受下背闊肌的收縮。",

  "傳統硬舉": "01 雙腳與肩同寬站立，槓鈴位於腳掌中央，俯身雙手握槓，背部平直，核心緊鎖，臀部稍微下壓。\n\n02 緩慢放下槓鈴，屁股向後推，控制重量沿著腿部下滑，感受下背部與後側鏈的張力與舒張。\n\n03 感覺背部與腿後肌群收縮，雙腳踩穩地面，將槓鈴垂直拉起直至身體完全站直。",

  "輔助引體向上機": "01 根據需求調整配重，雙膝跪在輔助墊上，雙手握穩上方把手，保持軀幹垂直。\n\n02 緩慢下降身體，控制下降速度，讓輔助墊帶著身體向下，感受整個背部肌群的舒張。\n\n03 感覺背肌收縮發力，利用背部力量將身體向上拉起，直到下巴與握把齊平。",

  "V把坐姿划船": "01 坐在划船機上，雙手握住 V 型把手，雙腳微彎踏穩踏板，背部保持挺直不晃動。\n\n02 緩慢將手臂前伸回放重量，控制背部張力，感受背部深層肌群的牽拉與舒張。\n\n03 感覺背部肌群收縮，將 V 把拉向腹部中線，手肘向後夾緊並保持挺胸擠壓。",

  "寬握水平划船": "01 使用寬握把手，坐穩後背部挺直，雙手略寬於肩握把，手肘抬高與肩膀接近水平。\n\n02 緩慢回放重量，讓把手帶動雙臂前伸，感受到後三角肌與中背部肌群的舒張。\n\n03 感覺後背收縮，將把手向胸部方向拉，手肘向兩側張開並向後擠壓，強化後背厚度。",

  "滑輪反握下拉": "01 雙手反握（掌心朝己）滑輪把手，坐穩並鎖定大腿，上半身微後傾以穩定重心。\n\n02 緩慢將把手送回上方，控制肌肉放鬆的速度，感受到背闊肌垂直向上的舒張。\n\n03 感覺背部收縮，帶動手肘垂直向下夾緊，將把手下拉至鎖骨位置並擠壓背肌。",

  // 肩部 (Shoulders)
  "啞鈴肩推": "01 坐姿或站立，背部挺直，雙手持啞鈴舉至耳朵兩側高度，掌心朝前。\n\n02 緩慢下降啞鈴，手肘保持與地面垂直，感受到肩部三角肌的舒張。\n\n03 感覺三角肌收縮發力，將啞鈴垂直向上推起，注意手肘不完全鎖死。",

  "槓鈴肩推": "01 雙手略寬於肩握槓，將槓鈴置於上胸鎖骨處，挺胸收腹，背部挺直。\n\n02 緩慢控制槓鈴下降至起始位置，頭部微後仰避開軌道，感受肩膀的舒張。\n\n03 感覺三角肌強力收縮，將槓鈴垂直向上推過頭頂。",

  "阿諾肩推": "01 坐在靠背凳上，雙手持啞鈴置於胸前，掌心朝向自己（起始姿勢）。\n\n02 緩慢下降並旋轉啞鈴回到胸前，控制旋轉過程，感受肩部多角度的舒張。\n\n03 感覺三角肌收縮，推起啞鈴的同時旋轉手腕，使掌心轉向前方並推至頂點。",

  "器械肩推": "01 坐穩並握住手把，調整座椅使把手位於肩膀高度，背部緊貼靠墊。\n\n02 緩慢放回重量，感受握把向下移動時肩部肌肉的延伸與舒張。\n\n03 感覺三角肌收縮，用力將握把向上推起，維持動作軌跡穩定。",

  "史密斯機肩推": "01 將長凳置於史密斯機下，調整好位置，雙手握穩槓鈴後解鎖。\n\n02 沿著固定軌道緩慢降下槓鈴至下巴位置，控制速度感受肩部的受壓與舒張。\n\n03 感覺三角肌發力收縮，將槓鈴順著軌道推回上方。",

  "啞鈴側平舉": "01 雙手各持一啞鈴垂於身體兩側，手肘微彎，身體稍微前傾。\n\n02 緩慢控制啞鈴向下降，保持三角肌張力不流失，感受到中三角肌的舒張。\n\n03 感覺中三角肌收縮發力，將啞鈴向兩側抬起至與肩膀齊平的高度。",

  "滑輪側平舉": "01 單手握住滑輪把手，身體微傾，另一手支撐機器以穩定中心。\n\n02 緩慢將手臂帶回身體前方，控制繩索拉力，感受到單側三角肌的持續舒張。\n\n03 感覺中三角肌收縮，帶動手臂向側面拉起把手，維持平滑的弧線路徑。",

  "器械側平舉": "01 調整機器，將前臂或手肘靠在墊片上，握緊把手並維持身體挺直。\n\n02 控制重量緩慢回放，保持肌肉緊繃感，感受三角肌中束的拉伸與舒張。\n\n03 感覺中三角肌收縮，用力將墊片向上方平舉，直到上臂與肩膀水平。",

  "啞鈴前平舉": "01 雙手各持一啞鈴垂於大腿前方，背部挺直，核心收緊。\n\n02 緩慢放下啞鈴回到起始位置，控制下降節奏，感受前三角肌的舒張。\n\n03 感覺前三角肌收縮，將啞鈴向前上方舉起至眼睛高度，保持手肘固定。",

  "蝴蝶機後三角飛鳥": "01 面向機器坐，胸口貼緊靠墊，雙手握住把手，手臂維持與地面平行。\n\n02 緩慢讓把手向前方併攏回位，控制重量速度，感受後三角肌的延伸與舒張。\n\n03 感覺後三角肌收縮，將把手向身體後方兩側拉開，擠壓後肩部。",

  "滑輪面拉": "01 雙手握住繩索把手，向後退一步使繩索繃緊，手臂向前伸直，稍微挺胸。\n\n02 緩慢讓繩索拉回前方，控制背部與肩後的張力，感受到後三角肌的舒張。\n\n03 感覺後三角肌與上背肌群收縮，將繩索拉向臉部方向，手肘向外張開。",

  "俯身啞鈴反向飛鳥": "01 雙腳微彎、俯身與地面接近平行，背部平平直，雙手持啞鈴自然垂下。\n\n02 緩慢下降啞鈴回原位，維持手肘微彎的角度，感受到後三角肌的舒張。\n\n03 感覺後三角肌收縮，將啞鈴向兩側後上方舉起，專注於後肩的擠壓感受。",

  // 腿部 (Legs)
  "槓鈴深蹲": "01 槓鈴架於上背後三角肌及斜方肌上，雙腳與肩同寬，核心收緊並維持背部平直。\n\n02 緩慢下蹲，控制重心於腳掌中央，直到大腿與地面平行或略低，感受臀部與大腿肌群的舒張。\n\n03 感覺腿部肌群收縮發力，腳掌踩穩地面，將身體向上推回起始位置。",

  "啞鈴高腳杯蹲": "01 雙手捧住啞鈴一端置於胸前，雙腳略寬於肩，腳尖微向外張開以利下蹲路徑。\n\n02 保持背部挺直，緩慢下降臀部進行深蹲，感受到股四頭肌與臀大肌的舒張。\n\n03 感覺腿部收縮，利用下肢力量垂直推起身體，回到站立姿勢。",

  "上斜腿推機": "01 斜躺於座墊，雙腳踩在踏板中央與肩同寬，解鎖安全把手後伸直雙腿但不鎖死膝蓋。\n\n02 緩慢彎曲膝蓋，控制踏板下降直到膝蓋接近胸部，感受到腿部肌群受壓與舒張。\n\n03 感覺腿部肌群強力收縮，用力將踏板推回頂端，過程中背部始終緊貼靠墊。",

  "保加利亞啞鈴分腿蹲": "01 一腳向後跨置於長凳，另一腳在前踩地支撐，雙手各持一啞鈴垂於身體兩側。\n\n02 緩慢下降身體，保持重心在支撐腳腳跟，感受臀部肌群的深度舒張與牽拉。\n\n03 感覺臀部與大腿收縮，用力蹬地將身體撐起，回到起始位置。",

  "哈克深蹲": "01 背部貼緊靠墊，肩部抵住護墊，雙腳踩在踏板適當位置並解鎖安全栓。\n\n02 沿著固定軌道緩慢下蹲，控制下降節奏，感受股四頭肌極致的拉伸與舒張。\n\n03 感覺大腿前側收縮，用力蹬起踏板回到高位，專注於股四頭肌的飽滿感受。",

  "仰臥腿後勾": "01 俯臥於機器上，腳踝後方抵住滾輪墊，雙手握緊把手以穩定上半身。\n\n02 緩慢伸直雙腿，控制重量回放，感受到腿後腱肌群的拉長與舒張。\n\n03 感覺腿後肌群收縮，用力將滾輪勾向臀部方向，並在頂點稍作停頓擠壓。",

  "坐姿腿後勾": "01 坐在機器上，背部貼緊靠墊，腿後方抵住邊緣，腳踝後方放置於滾輪墊上。\n\n02 緩慢放鬆雙腿讓重量上升，控制動作路徑，感受到腿後肌群的穩定舒張。\n\n03 感覺腿後肌群強力收縮，將滾輪向下勾起，專注於大腿後側的收縮感。",

  "器械站姿提踵": "01 站立於提踵機，腳掌前緣踩在踏板，肩膀抵住護墊，腳跟自然懸空。\n\n02 緩慢放低腳跟至低於踏板平面，感受小腿肌群（腓腸肌）的深度舒張。\n\n03 感覺小腿肌群收縮發力，用力墊起腳尖至最高點，頂峰擠壓小腿肌肉。",

  "相撲硬舉": "01 雙腳寬於肩站立，腳尖外展，背部平直俯身，雙手在雙腿內側握住槓鈴。\n\n02 緩慢控制槓鈴沿著腿部下滑，臀部後推，感受到內收肌群與臀部的張力與舒張。\n\n03 感覺臀部與內收肌群收縮，腳掌強力蹬地，將槓鈴垂直拉起至完全站直。",

  "器械腿外展": "01 坐在機器上，背部貼齊靠背，膝蓋外側抵住護墊，雙手握穩把手維持穩定。\n\n02 緩慢讓雙腿併攏，控制重量回彈速度，感受臀中肌與臀外側肌群的舒張。\n\n03 感覺臀部外側收縮發力，將雙腿向兩側張開，頂峰時強力擠壓臀肌。",

  "器械腿內收": "01 坐在機器上，雙腿張開並將膝蓋內側抵住護墊，挺胸收腹維持姿勢。\n\n02 緩慢讓雙腿張開，控制負重回收節奏，感受到大腿內側肌群的拉伸與舒張。\n\n03 感覺大腿內收肌群收縮，用力將雙腿向中心併攏擠壓，專注於內側發力。",

  "六角槓硬舉": "01 站在六角槓中央，下蹲握住兩側把手，保持背部平直與核心極度緊鎖。\n\n02 緩慢控制重量下降，臀部後推，感受到下肢肌群與後側鏈的受力與舒張。\n\n03 感覺腿部強力收縮，垂直向上蹬地站起，利用六角槓穩定的重心專注發力。",

  // 手臂 (Arms)
  "槓鈴彎舉": "01 雙腳與肩同寬站立，雙手以略寬於肩的距離反握槓鈴（掌心朝前），挺胸收腹，手肘微靠於身體兩側。\n\n02 緩慢放下槓鈴回到起始位置，控制下降速度，感受到二頭肌的延伸與舒張。\n\n03 感覺二頭肌收縮發力，帶動手肘彎曲將槓鈴向上劃弧線舉起，頂峰時擠壓肌肉。",

  "反手槓鈴彎舉": "01 雙手以正握（掌心朝下）方式握住槓鈴，雙臂自然垂於體前，維持肩部穩定。\n\n02 緩慢放下槓鈴，控制肌肉伸展的路徑，感受到前臂伸肌與二頭肌外側的舒張。\n\n03 感覺前臂與二頭肌收縮，將槓鈴向上彎舉，此動作能加強前臂線條與二頭肌厚度。",

  "啞鈴交替彎舉": "01 雙手各持一啞鈴垂於體側，掌心朝向大腿，身體挺直不晃動。\n\n02 緩慢下放啞鈴，控制單側肌肉受力，感受二頭肌在旋轉回位的過程中的舒張。\n\n03 單臂二頭肌收縮，向上彎舉的同時轉動手腕（使掌心朝上），交替進行以專注於單側擠壓。",

  "啞鈴錘式彎舉": "01 雙手握住啞鈴，掌心始終保持相對（對掌位），手肘固定在身體兩側。\n\n02 緩慢控制啞鈴下降，維持大拇指朝上的姿勢，感受肱橈肌與二頭肌長頭的舒張。\n\n03 感覺側邊肌群收縮，像揮動錘子般將啞鈴向上舉起，專注於增強手臂側面厚度。",

  "牧師椅彎舉": "01 坐在牧師椅上，將雙臂後側平貼於斜墊，雙手握住槓鈴或啞鈴，腋下卡緊墊子邊緣。\n\n02 緩慢伸展手臂，控制重量向下移動，直到手臂接近伸直，感受二頭肌下端的強烈舒張。\n\n03 感覺二頭肌孤立收縮，利用二頭肌力量將重量拉向肩部，避免身體借力晃動。",

  "滑輪繩索下壓": "01 面對滑輪機，雙手握住繩索把手，手肘夾緊肋骨兩側，前臂與地面平行。\n\n02 緩慢讓把手回升到胸部高度，控制配重片不相撞，感受三頭肌的拉長與舒張。\n\n03 感覺三頭肌收縮發力，用力將繩索向下壓至手臂伸直，並在底部向兩側拉開以加強擠壓。",

  "窄握槓鈴臥推": "01 平躺於長凳，雙手以窄於肩寬（約與胸同寬）的距離握槓，肩胛骨收攏並挺胸。\n\n02 緩慢彎曲手肘下降槓鈴至下胸位置，保持手肘貼近身體，感受三頭肌的受壓與舒張。\n\n03 感覺三頭肌收縮發力，將槓鈴垂直向上推起，專注於手臂後側的推力感受。",

  "仰臥槓鈴臂屈伸": "01 平躺於長凳，雙手握住槓鈴舉至胸部正上方，手臂與地面垂直。\n\n02 保持上臂不動，僅移動前臂，將槓鈴緩慢降至額頭上方，感受到三頭肌長頭的深度舒張。\n\n03 感覺三頭肌收縮發力，將槓鈴推回到起始的垂直位置，注意手肘不完全鎖死。",

  "啞鈴頸後臂屈伸": "01 坐姿或站立，雙手合抱一隻啞鈴舉過頭頂，手臂伸直貼近耳側。\n\n02 緩慢控制啞鈴降至頸後，維持上臂穩定，感受到三頭肌內側與長頭的極限舒張。\n\n03 感覺三頭肌收縮，將啞鈴垂直向上推舉至手臂完全伸直。",

  "滑輪直桿彎舉": "01 面對滑輪機握住直桿，雙手反握，手肘固定在身體兩側，維持穩定站姿。\n\n02 緩慢讓直桿隨繩索回放下降，控制背部與肩部不動，感受二頭肌在恆定張力下的舒張。\n\n03 感覺二頭肌收縮發力，將直桿向上拉向胸前，利用繩索持續的阻力強化收縮感。",

  "二頭肌器械彎舉": "01 坐在機器上，調整座椅高度使腋下貼合墊子，雙手握住把手，手肘與軸心齊平。\n\n02 緩慢放回把手，控制重量下降的節奏，感受二頭肌在固定軌道上的完整舒張。\n\n03 感覺二頭肌孤立收縮，將把手向上拉起，專注於動作頂點的肌肉峰值擠壓。",

  "滑輪直桿過頭臂屈伸": "01 背對滑輪機，雙手握住直桿舉過頭頂，雙臂向前伸展，身體呈微前傾姿勢。\n\n02 緩慢彎曲手肘將直桿收向腦後，控制繩索張力，感受到三頭肌外側與長頭的拉伸與舒張。\n\n03 感覺三頭肌強力收縮，將直桿向前上方推至手臂伸直，強化手臂後側線條。",

  // 核心 (Core) - 已更新
  "仰臥起坐": "01 平躺於地或墊子上，雙腿彎曲且腳掌踩地，手部輕扶耳後或交叉於胸前。\n\n02 緩慢將上半身向後放下，控制下降節奏，感受到腹部肌群受力與舒張。\n\n03 感覺腹肌收縮發力，將軀幹向上捲起至接近膝蓋，專注於腹部摺疊感。",

  "羅馬椅抬腿": "01 雙臂支撐在羅馬椅扶手上，背部貼緊靠墊，雙腿自然下垂並核心收緊。\n\n02 緩慢控制雙腿下降回到起始位置，控制重心不晃動，感受下腹肌群的舒張。\n\n03 感覺腹肌（尤其是下腹）收縮，用力將雙腿抬起至與地面平行或更高。",

  "棒式": "01 以手肘及腳尖支撐身體，前臂平放，身體從頭到腳跟呈一直線，核心極度緊鎖。\n\n02 維持靜態支撐，感受重力對身體的牽引，深層核心肌群穩定地對抗並舒張（維持長度張力）。\n\n03 持續感覺核心肌群強力收縮，將腹部與臀部緊扣，專注於維持全身的穩定度。",

  "俄羅斯轉體": "01 坐在墊上，膝蓋微彎且腳跟微離開地面，上半身微後傾，雙手於胸前併攏。\n\n02 緩慢將軀幹轉向一側，控制動作軌跡，感受側腹（腹斜肌）的牽拉與舒張。\n\n03 感覺側腹肌群收縮，用力將身體轉向另一側，過程中保持下半身穩定不晃動。",

  "健腹輪": "01 跪在墊上，雙手握住健腹輪手把置於肩膀正下方，維持腰背平直。\n\n02 控制健腹輪緩慢向前推，身體隨之延伸至極限，感受到腹部肌群強烈的受壓與舒張。\n\n03 感覺腹肌強力收縮，用力將健腹輪拉回至起始位置，注意過程中不塌腰。",

  "器械捲腹": "01 坐在機器上並握住把手，背部緊貼靠墊，雙腳固定在下方擋板。\n\n02 緩慢放回把手，控制重量移動，感受腹部肌群在阻力下的完全舒張。\n\n03 感覺腹肌收縮，帶動上半身向前捲曲，專注於擠壓腹部肌肉。",

  "懸垂抬腿": "01 雙手握住單槓垂懸，身體放鬆但核心維持張力，穩定軀幹避免擺盪。\n\n02 緩慢將雙腿降回垂直位置，控制下落速度，感受腹部肌群由下而上的舒張。\n\n03 感覺腹肌收縮發力，帶動骨盆向上翻轉，將雙腿抬起至水平位置。",

  "登山者": "01 呈高位平板支撐姿勢，手掌撐地且手臂伸直，核心與臀部維持高度穩定。\n\n02 緩慢將單腿伸回起始位置，控制身體不上下晃動，感受核心的穩定與舒張。\n\n03 感覺腹肌收縮，迅速但有控制地將單邊膝蓋向胸部方向帶動，交替進行。",

  "側棒式": "01 側臥並以單手肘支撐，另一手置於腰間，身體側向呈一直線，側面核心收緊。\n\n02 維持支撐姿勢，感受側腹肌群對抗重力的持續舒張與張力。\n\n03 感覺側腹（腹斜肌）強力收縮，將髖部持續推離地面，確保身體不向下塌陷。",

  "跪姿滑輪捲腹": "01 跪在滑輪機前，雙手握住繩索並置於耳側，身體微前傾，背部微拱。\n\n02 緩慢讓滑輪拉力帶動軀幹向上回位，控制肌肉拉長速度，感受腹肌的舒張。\n\n03 感覺腹肌強力收縮，用力將手肘向膝蓋方向拉近，在底部深壓腹部。",

  "下斜捲腹": "01 躺在下斜凳上，雙腳勾住護擋固定身體，手部輕扶頭部兩側。\n\n02 緩慢將上半身向後下降，對抗重力控制節奏，感受到腹部肌群深度的舒張。\n\n03 感覺腹肌收縮，將胸部向腿部方向捲起，專注於腹部上端的擠壓感受。",

  "滑輪側捲腹": "01 側面面向滑輪機並握住把手，單手或雙手握把，維持站姿且核心鎖定。\n\n02 緩慢控制滑輪回收，讓軀幹向滑輪方向微側彎，感受另一側腹斜肌的舒張。\n\n03 感覺側腹肌群收縮，將軀幹向反方向下拉捲曲，強化腰側線條。"
};

export const getExerciseMethod = (name: string): string => {
  return EXERCISE_METHODS[name] || "01 準備起始姿勢並確保脊椎中立穩定核心。調整負重與器械高度，確保身體重心穩固且安全。\n\n02 按照標準生理運動路徑執行動作。發力時呼氣，還原時吸氣. 專注於目標肌群的收縮感，而非僅是移動重量。\n\n03 全程控制離心還原速度，維持肌肉張力不流失. 結束後平穩放下重量，確保不對關節造成衝擊性的傷害。";
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
