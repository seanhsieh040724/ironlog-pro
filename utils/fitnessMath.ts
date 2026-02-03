
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

export const EXERCISE_GIFS: Record<string, string> = {
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
  "坐姿腿屈伸": "https://www.docteur-fitness.com/wp-content/uploads/2000/06/leg-extension-exercice-musculation.gif",
  "槓鈴臀推": "https://www.docteur-fitness.com/wp-content/uploads/2021/12/hips-thrust.gif",
  "坐姿腿後勾": "https://www.docteur-fitness.com/wp-content/uploads/2022/02/leg-curl-assis-machine.gif",
  "器械站姿提踵": "https://www.docteur-fitness.com/wp-content/uploads/2021/10/extension-mollets-debout-machine.gif",
  "相撲硬舉": "https://www.docteur-fitness.com/wp-content/uploads/2021/10/souleve-de-terre-sumo.gif",
  "六角槓硬舉": "https://www.docteur-fitness.com/wp-content/uploads/2021/10/souleve-de-terre-a-la-trap-bar.gif",
  "器械腿外展": "https://static.wixstatic.com/media/2edbed_2c54524226684ddea7f4e2e08a472a3a~mv2.gif",
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

export const EXERCISE_METHODS: Record<string, string> = {
  "槓鈴平板臥推": "01 仰臥維持頭、背、臀及雙腳踩實之五點支撐，雙手略寬於肩抓槓並收緊肩胛。\n02 控制槓鈴慢速下降至乳頭上方，維持前臂垂直地面且手肘與軀幹呈45度夾角。\n03 吐氣胸肌發力將槓鈴推起至鎖骨正上方，頂端不鎖死關節以維持肌肉持續張力。",
  "啞鈴上斜臥推": "01 斜凳調整至30-45度，雙手持啞鈴置於鎖骨兩側，掌心朝前且背部貼緊靠墊。\n02 控制啞鈴緩慢下放至胸外側，感受上胸部充分拉伸，前臂維持垂直地面。\n03 吐氣由上胸發力垂直推起，頂端兩手微向中心靠攏擠壓胸肌，保持動作流暢。",
  "槓鈴深蹲": "01 槓鈴架於斜方肌中位，雙腳與肩同寬且趾尖微外展，核心吸氣維持腹壓穩定。\n02 髖部啟動後移下蹲，膝蓋與趾尖方向一致不內扣，深度至大腿與地面平行。\n03 腳掌踩穩地面吐氣垂直站起，骨盆回正至中立位，感受股四頭與臀部強力收縮。",
  "傳統硬舉": "01 槓鈴貼近脛骨，髖部後移俯身抓槓，背部平直中立且肩部略超前於槓鈴中心線。\n02 核心繃緊鎖定脊椎，吐氣腳掌發力踩地帶動身體站直，槓鈴沿腿部直線升起。\n03 頂端髖部前推鎖定，吸氣控制重量沿腿部原路緩慢放下，嚴禁直接摔落重量。",
  "引體向上": "01 雙手寬握橫桿懸垂，肩胛先行收緊下壓穩定，核心緊繃避免身體大幅擺動。\n02 吐氣背部發力帶動手肘向下拉，將胸部拉向橫桿直至下巴超過橫桿高度。\n03 緩慢控制下降至手臂接近伸直，全程維持背部肌肉張力，不晃動借力。",
  "滑輪下拉": "01 坐穩並調整擋板固定大腿，雙手寬握橫桿，挺胸脊椎微後傾維持動作軌道。\n02 吐氣肩胛下沉，將橫桿垂直拉至鎖骨上方，想像手肘向肋骨後側擠壓背肌。\n03 吸氣緩慢控制橫桿回放，直到手臂接近伸直，全程避免聳肩以孤立背部發力。",
  "啞鈴肩推": "01 坐姿手持啞鈴置於耳側，手心向前，挺胸收腹使下背部貼緊椅背維持自然曲度。\n02 吐氣三角肌發力，垂直將啞鈴推向頭頂上方，頂端感受肩部頂峰收縮。\n03 吸氣控制離心速度放回至耳朵高度，避免肘部過度後擺，維持穩定的運動路徑。",
  "槓鈴划船": "01 俯身約45度背部平直，雙手略寬於肩抓槓，膝蓋微彎維持下肢重心穩定。\n02 吐氣發力將槓鈴拉向肚臍處，手肘貼近身體兩側，肩胛骨向脊椎中心強力擠壓。\n03 控制重量緩慢下放至手臂自然伸直，全程軀幹維持固定不隨重量前後晃動。",
  "保加利亞啞鈴分腿蹲": "01 一腳架在後方長凳，另一腳跨前一大步，雙手持啞鈴垂於兩側，重心置於前腳。\n02 垂直下蹲至後膝接近地面，前腳膝蓋與趾尖同向，軀幹保持微前傾以刺激臀部。\n03 前腳跟發力吐氣站起，訓練過程中維持核心穩定，不產生左右搖晃。",
  "哈克深蹲": "01 背部緊貼滑軌靠墊，肩膀頂住負重墊，雙腳踩在踏板中上部，核心吸氣鎖定。\n02 解除安全鎖吸氣控制重量緩慢下蹲，直到大腿與踏板平行，避免膝蓋過度推移。\n03 腳跟發力吐氣推回起始位置，膝蓋保持微彎不鎖死，專注於股四頭肌的收縮。",
  "滑輪面拉": "01 滑輪設定於眼部高度，雙手持繩索端，後退一步保持繩索始終維持張力狀態。\n02 吐氣想像手肘向斜後方拉動，雙手拉向耳朵兩側，強力擠壓後三角肌與斜方肌。\n03 吸氣緩慢放回起始位，全程保持肩膀下沉不聳肩，頭部維持中立避免頸部借力。",
  "啞鈴側平舉": "01 站姿手持啞鈴自然下垂，手肘微彎，肩胛稍微後收鎖定以減少斜方肌代償。\n02 吐氣三角肌中束發力，帶動手臂向兩側抬至與肩同高，小姆指端可微向上翻轉。\n03 控制離心速度緩慢放回，全程維持肌肉緊張感，嚴禁利用身體慣性甩動重量。",
  "啞鈴交替彎舉": "01 站姿手持啞鈴於兩側掌心相對，大臂固定在軀幹兩側，核心穩定不晃動。\n02 彎舉時吐氣並旋轉手腕使掌心向上，在頂部強力擠壓二頭肌，感受肌肉峰值。\n03 緩慢下放並旋回掌心相對，換另一側執行，控制速度以增加肌肉受力時間。",
  "滑輪繩索下壓": "01 雙手握繩索端，手肘貼緊身體側邊不動，身體微前傾，膝蓋保持微彎緩衝。\n02 吐氣三頭肌發力將繩索下壓至手臂完全伸直，末端向兩側拉開繩索增加收縮。\n03 吸氣緩慢放回至肘部成90度，全程確保大臂不動，僅有小臂進行弧線運動。",
  "仰臥腿後勾": "01 俯臥器材且滾墊置於腳踝上方，雙手握把手固定上半身，骨盆全程緊貼墊面。\n02 吐氣發力將小腿向後彎曲，帶動滾墊接近臀部，感受腿後腱強力且深層的擠壓。\n03 控制離心速度緩慢回放，直到腿部接近伸直，維持肌肉張力不流失。",
  "啞鈴高腳杯蹲": "01 雙手捧啞鈴置於胸前，雙腳略寬於肩趾尖微外展，挺胸收腹核心繃緊維持穩固。\n02 吸氣髖部後移下蹲，膝蓋始終與趾尖方向一致，深度至手肘觸碰大腿內側邊緣。\n03 腳跟發力吐氣垂直站起，全程保持背部平直不圓背，重心維持在足底中心。",
  "羅馬椅抬腿": "01 前臂支撐於靠墊上，背部貼緊背墊，雙手抓握把手穩定上半身及肩膀。\n02 吐氣收縮下腹部，帶動雙腿垂直向上抬起至與地面平行，避免髖部過度晃動。\n03 吸氣緩慢有控制地下放雙腿回起始位，全程保持腰椎貼平背墊不產生空隙。",
  "阿諾肩推": "01 坐姿手持啞鈴，起始位掌心朝向面部且雙肘靠攏，背部挺直穩定核心。\n02 吐氣向上推起啞鈴，同時旋轉手腕使掌心轉向前方，在頂端完成完全伸展。\n03 吸氣控制重量沿原路徑轉回起始位，全程維持三角肌的動態控制與旋轉穩定。",
  "棒式": "01 前臂與腳尖撐地，手肘置於肩膀正下方，全身成一段直線並收緊臀部及核心。\n02 視線向下凝視地面，保持頸部中立，深呼吸並專注於腹部深層肌肉的對抗。\n03 持續維持身體不塌腰、不拱背，直至設定時間結束過動作型態無法維持。",
  "相撲硬舉": "01 雙腳採取超寬站姿，趾尖大幅外展，雙手垂直抓握槓鈴於雙腿內側。\n02 挺胸收緊肩胛，吐氣腳掌發力將槓鈴垂直拉起，強調臀部與大腿內側收縮。\n03 在頂部鎖定髖部後，吸氣控制重量平穩降至地面，始終維持脊椎中立位。"
};

export const fetchExerciseGif = async (exerciseName: string): Promise<string> => {
  const name = exerciseName.trim();
  const exerciseUrl = EXERCISE_GIFS[name];
  if (exerciseUrl) return exerciseUrl;
  
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
  return EXERCISE_METHODS[name] || "01 準備起始姿勢並確保脊椎中立穩定核心，調整負重與器械高度。\n02 按照標準生理運動路徑執行動作，注意呼氣發力、吸氣還原。\n03 全程控制離心還原速度，維持肌肉張力，確保動作完整不借力。";
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
