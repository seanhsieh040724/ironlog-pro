import { RoutineTemplate } from "../types";

export interface WeeklyRoutineSystem {
  title: string;
  desc: string;
  englishTag: string;
  days: (RoutineTemplate & { subTitle?: string; durationMinutes?: number })[];
}

    // 1. 男士 + 新手安全模式 (器械/固定軌道為主)
    export const maleSafe: Record<number, { title: string; desc: string; englishTag: string; days: (RoutineTemplate & { subTitle?: string; durationMinutes?: number })[] }> = {
      2: {
        title: '2 日器械分化 · 上肢/下肢安全模式',
        desc: '專為男士初學者設計，全面採用固定器械與滑輪。Day 1 強化胸背推拉，Day 2 穩固下肢與核心。動作路徑固定、安全高效。',
        englishTag: '2 Days Machine Split',
        days: [
          {
            id: 'm-safe-2-d1',
            name: 'Day 1: 上肢器械安全推拉',
            subTitle: 'Upper Body Machine Focus',
            durationMinutes: 45,
            exercises: [
              { id: 'm-s2-e1', name: '坐姿器械胸推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s2-e2', name: '分動器械下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s2-e3', name: '蝴蝶機夾胸', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s2-e4', name: '繩索下壓', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-safe-2-d2',
            name: 'Day 2: 下肢器械與核心防護',
            subTitle: 'Lower Body Machine & Core',
            durationMinutes: 45,
            exercises: [
              { id: 'm-s2-e5', name: '水平器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s2-e6', name: '坐姿腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s2-e7', name: '器械站姿提踵', muscleGroup: 'quads', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'm-s2-e8', name: '器械捲腹', muscleGroup: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          }
        ]
      },
      3: {
        title: '3 日器械分化 · 推拉腿循環',
        desc: '經典 Push/Pull/Legs 三分化。以固定器械取代自由槓鈴，精準孤立發力，降低下背與關節壓力。',
        englishTag: 'PPL Machine Split',
        days: [
          {
            id: 'm-safe-3-d1',
            name: 'Day 1: 器械推部 (胸/肩/三頭)',
            subTitle: 'Machine Push Focus',
            durationMinutes: 45,
            exercises: [
              { id: 'm-s3-e1', name: '坐姿器械胸推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s3-e2', name: '器械肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s3-e3', name: '蝴蝶機夾胸', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s3-e4', name: '繩索下壓', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-safe-3-d2',
            name: 'Day 2: 器械拉部 (背/後肩/二頭)',
            subTitle: 'Machine Pull Focus',
            durationMinutes: 45,
            exercises: [
              { id: 'm-s3-e5', name: '分動器械下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s3-e6', name: '坐姿器械划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s3-e7', name: '滑輪直臂下拉', muscleGroup: 'back', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s3-e8', name: 'cable直槓彎舉', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-safe-3-d3',
            name: 'Day 3: 下肢器械 (腿/臀/核心)',
            subTitle: 'Machine Legs & Core',
            durationMinutes: 45,
            exercises: [
              { id: 'm-s3-e9', name: '水平器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s3-e10', name: '坐姿腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s3-e11', name: '器械腿外展', muscleGroup: 'quads', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'm-s3-e12', name: '器械捲腹', muscleGroup: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          }
        ]
      },
      4: {
        title: '4 日器械分化 · 上下肢雙循環',
        desc: '適合每週可練 4 天的男士。上下肢兩輪循環，全器械安全軌道，最大化肌肉肥大並兼顧關節健康。',
        englishTag: 'Upper Lower Machine Split',
        days: [
          {
            id: 'm-safe-4-d1',
            name: 'Day 1: 上肢器械 A (胸/背寬度)',
            subTitle: 'Machine Upper Body A',
            durationMinutes: 50,
            exercises: [
              { id: 'm-s4-e1', name: '坐姿器械胸推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s4-e2', name: '分動器械下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s4-e3', name: '器械肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s4-e4', name: '繩索下壓', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-safe-4-d2',
            name: 'Day 2: 下肢器械 A (腿推/腿後/核心)',
            subTitle: 'Machine Lower Body A',
            durationMinutes: 50,
            exercises: [
              { id: 'm-s4-e5', name: '水平器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s4-e6', name: '坐姿腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s4-e7', name: '器械腿外展', muscleGroup: 'quads', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'm-s4-e8', name: '器械捲腹', muscleGroup: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-safe-4-d3',
            name: 'Day 3: 上肢器械 B (上胸/背厚/手臂)',
            subTitle: 'Machine Upper Body B',
            durationMinutes: 50,
            exercises: [
              { id: 'm-s4-e9', name: '上斜器械胸推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s4-e10', name: '坐姿器械划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s4-e11', name: '蝴蝶機夾胸', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s4-e12', name: 'cable直槓彎舉', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-safe-4-d4',
            name: 'Day 4: 下肢器械 B (上斜腿推/小腿/核心)',
            subTitle: 'Machine Lower Body B',
            durationMinutes: 50,
            exercises: [
              { id: 'm-s4-e13', name: '上斜器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s4-e14', name: '俯臥腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s4-e15', name: '器械站姿提踵', muscleGroup: 'quads', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'm-s4-e16', name: 'cable跪姿捲腹', muscleGroup: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          }
        ]
      },
      5: {
        title: '5 日器械分化 · 部位極致雕琢',
        desc: '胸、背、肩、腿、手臂每天專注一個肌群。全器械高安全係數，帶來最飽滿的肌肉充血泵感。',
        englishTag: '5 Days Machine Focus',
        days: [
          {
            id: 'm-safe-5-d1',
            name: 'Day 1: 胸肌器械雕琢 (上中胸與夾胸)',
            subTitle: 'Chest Machine Sculpt',
            durationMinutes: 50,
            exercises: [
              { id: 'm-s5-e1', name: '坐姿器械胸推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s5-e2', name: '上斜器械胸推', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s5-e3', name: '蝴蝶機夾胸', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-safe-5-d2',
            name: 'Day 2: 背部器械寬度 (高位下拉/划船)',
            subTitle: 'Back Machine Width & Thickness',
            durationMinutes: 50,
            exercises: [
              { id: 'm-s5-e4', name: '分動器械下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s5-e5', name: '坐姿器械划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s5-e6', name: '滑輪直臂下拉', muscleGroup: 'back', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-safe-5-d3',
            name: 'Day 3: 肩部器械立體 (肩推/側平舉/面拉)',
            subTitle: 'Shoulder Machine 3D',
            durationMinutes: 50,
            exercises: [
              { id: 'm-s5-e7', name: '器械肩推', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-s5-e8', name: '器械側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s5-e9', name: '繩索面拉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-safe-5-d4',
            name: 'Day 4: 下肢器械安全 (腿推/腿後/提踵)',
            subTitle: 'Legs Machine Safety',
            durationMinutes: 50,
            exercises: [
              { id: 'm-s5-e10', name: '水平器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s5-e11', name: '坐姿腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s5-e12', name: '器械站姿提踵', muscleGroup: 'quads', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-safe-5-d5',
            name: 'Day 5: 手臂器械孤立 (二頭/三頭泵感)',
            subTitle: 'Arms Cable & Machine Focus',
            durationMinutes: 45,
            exercises: [
              { id: 'm-s5-e13', name: '器械牧師彎舉', muscleGroup: 'arms', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s5-e14', name: '繩索下壓', muscleGroup: 'arms', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-s5-e15', name: '反手直桿下壓', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          }
        ]
      }
    };

    // 2. 男士 + 自由重量/進階力量 (安全模式關閉)
    export const maleFree: Record<number, { title: string; desc: string; englishTag: string; days: (RoutineTemplate & { subTitle?: string; durationMinutes?: number })[] }> = {
      2: {
        title: '2 日自由分化 · 槓鈴複合力量',
        desc: '專為追求全身爆發力與厚度的男士設計。以槓鈴臥推、深蹲、硬舉等大重量動作為核心，效率最高。',
        englishTag: '2 Days Free Weights',
        days: [
          {
            id: 'm-free-2-d1',
            name: 'Day 1: 全身上肢力量拉推',
            subTitle: 'Upper Body Compound A',
            durationMinutes: 45,
            exercises: [
              { id: 'm-f2-e1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f2-e2', name: '引體向上', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f2-e3', name: '坐姿啞鈴肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f2-e4', name: '槓鈴彎舉', muscleGroup: 'arms', defaultSets: 3, defaultReps: 10, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-free-2-d2',
            name: 'Day 2: 全身下肢深蹲與硬舉',
            subTitle: 'Lower Body Compound A',
            durationMinutes: 45,
            exercises: [
              { id: 'm-f2-e5', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f2-e6', name: '傳統硬舉', muscleGroup: 'back', defaultSets: 3, defaultReps: 6, defaultWeight: 0 },
              { id: 'm-f2-e7', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f2-e8', name: '棒式', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 0 }
            ]
          }
        ]
      },
      3: {
        title: '3 日自由分化 · 經典推拉腿 PPL',
        desc: '健美經典推拉腿模式。Day 1 臥推與推舉，Day 2 槓鈴划船與引體向上，Day 3 槓鈴深蹲與硬舉。力量與體積兼備。',
        englishTag: 'Classic Push Pull Legs',
        days: [
          {
            id: 'm-free-3-d1',
            name: 'Day 1: 自由推部力量 (胸/肩/三頭)',
            subTitle: 'Push Strength Focus',
            durationMinutes: 45,
            exercises: [
              { id: 'm-f3-e1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f3-e2', name: '站姿槓鈴肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f3-e3', name: '啞鈴上斜臥推', muscleGroup: 'chest', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f3-e4', name: '雙槓撐體', muscleGroup: 'chest', defaultSets: 3, defaultReps: 10, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-free-3-d2',
            name: 'Day 2: 自由拉部厚度 (背/後肩/二頭)',
            subTitle: 'Pull Thickness Focus',
            durationMinutes: 45,
            exercises: [
              { id: 'm-f3-e5', name: '槓鈴划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f3-e6', name: '引體向上', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f3-e7', name: '單臂啞鈴划船', muscleGroup: 'back', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f3-e8', name: '槓鈴彎舉', muscleGroup: 'arms', defaultSets: 3, defaultReps: 10, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-free-3-d3',
            name: 'Day 3: 下肢深蹲硬舉爆發 (腿/臀/核心)',
            subTitle: 'Legs & Glutes Power',
            durationMinutes: 45,
            exercises: [
              { id: 'm-f3-e9', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f3-e10', name: '傳統硬舉', muscleGroup: 'back', defaultSets: 3, defaultReps: 6, defaultWeight: 0 },
              { id: 'm-f3-e11', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f3-e12', name: '保加利亞啞鈴分腿蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 }
            ]
          }
        ]
      },
      4: {
        title: '4 日自由分化 · 上下肢力量與肌肥大',
        desc: '中高階男士重訓首選。A天專注大重量神經募集，B天專注啞鈴與容量肌肥大。',
        englishTag: 'Upper Lower Heavy Split',
        days: [
          {
            id: 'm-free-4-d1',
            name: 'Day 1: 上肢力量 A (槓鈴臥推/引體/肩推)',
            subTitle: 'Upper Heavy Strength',
            durationMinutes: 50,
            exercises: [
              { id: 'm-f4-e1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f4-e2', name: '引體向上', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f4-e3', name: '坐姿啞鈴肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f4-e4', name: '站姿繩索夾胸', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-free-4-d2',
            name: 'Day 2: 下肢力量 A (大重量深蹲/硬舉)',
            subTitle: 'Lower Heavy Strength',
            durationMinutes: 50,
            exercises: [
              { id: 'm-f4-e5', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f4-e6', name: '傳統硬舉', muscleGroup: 'back', defaultSets: 3, defaultReps: 6, defaultWeight: 0 },
              { id: 'm-f4-e7', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f4-e8', name: '羅馬椅抬腿', muscleGroup: 'core', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-free-4-d3',
            name: 'Day 3: 上肢肥大 B (啞鈴推拉/側平舉/手臂)',
            subTitle: 'Upper Hypertrophy B',
            durationMinutes: 50,
            exercises: [
              { id: 'm-f4-e9', name: '啞鈴平板臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f4-e10', name: '槓鈴划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f4-e11', name: '啞鈴側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-f4-e12', name: '啞鈴交替彎舉', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-free-4-d4',
            name: 'Day 4: 下肢肥大 B (六角槓硬舉/分腿蹲/高腳杯)',
            subTitle: 'Lower Hypertrophy B',
            durationMinutes: 50,
            exercises: [
              { id: 'm-f4-e13', name: '六角槓硬舉', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f4-e14', name: '保加利亞啞鈴分腿蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f4-e15', name: '啞鈴高腳杯蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-f4-e16', name: '懸垂抬腿', muscleGroup: 'core', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          }
        ]
      },
      5: {
        title: '5 日自由分化 · 頂級重訓分化',
        desc: '高容積、高強度的黃金五日分化。槓鈴與啞鈴極致刺激，鍛造完美倒三角與強大力量。',
        englishTag: '5 Days Pro Split',
        days: [
          {
            id: 'm-free-5-d1',
            name: 'Day 1: 胸部極限厚度 (槓鈴臥推/啞鈴斜推)',
            subTitle: 'Chest Heavy Focus',
            durationMinutes: 50,
            exercises: [
              { id: 'm-f5-e1', name: '槓鈴平板臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f5-e2', name: '啞鈴上斜臥推', muscleGroup: 'chest', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f5-e3', name: '雙槓撐體', muscleGroup: 'chest', defaultSets: 3, defaultReps: 10, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-free-5-d2',
            name: 'Day 2: 倒三角背部厚度 (槓鈴划船/硬舉/引體)',
            subTitle: 'Back Width & Thickness',
            durationMinutes: 50,
            exercises: [
              { id: 'm-f5-e4', name: '槓鈴划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f5-e5', name: '引體向上', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f5-e6', name: '傳統硬舉', muscleGroup: 'back', defaultSets: 3, defaultReps: 6, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-free-5-d3',
            name: 'Day 3: 虎頭肩立體雕刻 (站姿槓推/側平舉)',
            subTitle: 'Shoulder Cannonball 3D',
            durationMinutes: 50,
            exercises: [
              { id: 'm-f5-e7', name: '站姿槓鈴肩推', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f5-e8', name: '啞鈴側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'm-f5-e9', name: '俯身啞鈴反向飛鳥', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-free-5-d4',
            name: 'Day 4: 下肢核心鋼鐵深蹲 (深蹲/臀推/分腿蹲)',
            subTitle: 'Legs Power Heavy',
            durationMinutes: 50,
            exercises: [
              { id: 'm-f5-e10', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'm-f5-e11', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f5-e12', name: '保加利亞啞鈴分腿蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 }
            ]
          },
          {
            id: 'm-free-5-d5',
            name: 'Day 5: 手臂線條與維度 (二頭/三頭窄推)',
            subTitle: 'Arms Big Gun Blast',
            durationMinutes: 45,
            exercises: [
              { id: 'm-f5-e13', name: '槓鈴彎舉', muscleGroup: 'arms', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f5-e14', name: '窄握槓鈴臥推', muscleGroup: 'arms', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'm-f5-e15', name: '站姿啞鈴錘式彎舉', muscleGroup: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          }
        ]
      }
    };

    // 3. 女士 + 新手安全模式 (器械為主，蜜桃臀雕塑、直角肩、緊緻美背與核心)
    export const femaleSafe: Record<number, { title: string; desc: string; englishTag: string; days: (RoutineTemplate & { subTitle?: string; durationMinutes?: number })[] }> = {
      2: {
        title: '2 日蜜桃美背 · 女士安全器械',
        desc: '專為女性設計的低負擔雕塑課表。高比例臀腿與美背器械，精準刺激臀大肌與臀中肌，不傷膝蓋與腰椎。',
        englishTag: '2 Days Glutes & Tone Machine',
        days: [
          {
            id: 'f-safe-2-d1',
            name: 'Day 1: 蜜桃臀雕塑與緊緻美背',
            subTitle: 'Glutes & Back Machine',
            durationMinutes: 45,
            exercises: [
              { id: 'f-s2-e1', name: '器械腿外展', muscleGroup: 'quads', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s2-e2', name: '分動器械下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s2-e3', name: '水平器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s2-e4', name: '器械捲腹', muscleGroup: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-safe-2-d2',
            name: 'Day 2: 直角肩線條與臀腿塑形',
            subTitle: 'Shoulder Tone & Lower Machine',
            durationMinutes: 45,
            exercises: [
              { id: 'f-s2-e5', name: '坐姿器械划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s2-e6', name: '坐姿腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s2-e7', name: '站姿繩索夾胸', muscleGroup: 'chest', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s2-e8', name: '側棒式', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 0 }
            ]
          }
        ]
      },
      3: {
        title: '3 日女性分化 · 蜜桃臀/天鵝背/直角肩',
        desc: '深受女性喜愛的專屬三分化。Day 1 臀腿極致塑形，Day 2 優雅天鵝背與直角肩，Day 3 全身燃脂緊緻。',
        englishTag: 'Glutes Upper Fullbody Machine',
        days: [
          {
            id: 'f-safe-3-d1',
            name: 'Day 1: 蜜桃臀極致塑形 (腿外展/腿推/腿後)',
            subTitle: 'Peach Glutes Focus',
            durationMinutes: 45,
            exercises: [
              { id: 'f-s3-e1', name: '器械腿外展', muscleGroup: 'quads', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s3-e2', name: '水平器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s3-e3', name: '坐姿腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s3-e4', name: '器械捲腹', muscleGroup: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-safe-3-d2',
            name: 'Day 2: 優雅美背與直角肩 (下拉/划船/面拉)',
            subTitle: 'Back & Shoulder Tone',
            durationMinutes: 45,
            exercises: [
              { id: 'f-s3-e5', name: '分動器械下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s3-e6', name: '坐姿器械划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s3-e7', name: '繩索面拉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s3-e8', name: '繩索單邊側平舉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-safe-3-d3',
            name: 'Day 3: 全身燃脂與緊緻線條 (上斜腿推/胸/核心)',
            subTitle: 'Fullbody Tighten & Core',
            durationMinutes: 45,
            exercises: [
              { id: 'f-s3-e9', name: '上斜器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s3-e10', name: '俯臥腿後勾', muscleGroup: 'hamstrings', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s3-e11', name: '坐姿器械胸推', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s3-e12', name: '棒式', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 0 }
            ]
          }
        ]
      },
      4: {
        title: '4 日女性分化 · 臀腿與美背雙循環',
        desc: '兩天專屬臀腿塑形 + 兩天美背肩頸線條。極低下背負擔，全面緊緻全身曲線。',
        englishTag: '4 Days Female Tone Machine',
        days: [
          {
            id: 'f-safe-4-d1',
            name: 'Day 1: 臀部飽滿專項 A (外展/腿推/腹肌)',
            subTitle: 'Glute Isolation & Tone A',
            durationMinutes: 50,
            exercises: [
              { id: 'f-s4-e1', name: '器械腿外展', muscleGroup: 'quads', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s4-e2', name: '水平器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s4-e3', name: '坐姿腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s4-e4', name: '器械捲腹', muscleGroup: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-safe-4-d2',
            name: 'Day 2: 天鵝美背與直角肩 A (下拉/划船/肩推)',
            subTitle: 'Upper Back & Posture A',
            durationMinutes: 50,
            exercises: [
              { id: 'f-s4-e5', name: '分動器械下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s4-e6', name: '坐姿器械划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s4-e7', name: '器械肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s4-e8', name: '繩索面拉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-safe-4-d3',
            name: 'Day 3: 大腿內外側與蜜桃臀 B (腿推/內收/後勾)',
            subTitle: 'Thighs & Glutes Shape B',
            durationMinutes: 50,
            exercises: [
              { id: 'f-s4-e9', name: '上斜器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s4-e10', name: '俯臥腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s4-e11', name: '器械腿內收', muscleGroup: 'quads', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s4-e12', name: '側棒式', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-safe-4-d4',
            name: 'Day 4: 上肢胸背緊緻 B (繩索夾胸/直臂/側平舉)',
            subTitle: 'Upper Sculpt & Core B',
            durationMinutes: 50,
            exercises: [
              { id: 'f-s4-e13', name: '站姿繩索夾胸', muscleGroup: 'chest', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s4-e14', name: '滑輪直臂下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s4-e15', name: '繩索單邊側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s4-e16', name: 'cable跪姿捲腹', muscleGroup: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          }
        ]
      },
      5: {
        title: '5 日女性分化 · 精緻部位極致雕琢',
        desc: '臀、背、肩、腿、核心獨立分化。器械軌道安全不傷關節，打造零死角體態。',
        englishTag: '5 Days Goddess Machine Plan',
        days: [
          {
            id: 'f-safe-5-d1',
            name: 'Day 1: 蜜桃臀飽滿雕刻 (器械外展/水平腿推/後勾)',
            subTitle: 'Glute Peak Machine',
            durationMinutes: 50,
            exercises: [
              { id: 'f-s5-e1', name: '器械腿外展', muscleGroup: 'quads', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s5-e2', name: '水平器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s5-e3', name: '坐姿腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-safe-5-d2',
            name: 'Day 2: 天鵝美背線條 (器械下拉/划船/直臂)',
            subTitle: 'Swan Back Tone',
            durationMinutes: 50,
            exercises: [
              { id: 'f-s5-e4', name: '分動器械下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s5-e5', name: '坐姿器械划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s5-e6', name: '滑輪直臂下拉', muscleGroup: 'back', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-safe-5-d3',
            name: 'Day 3: 直角肩與手臂線條 (器械肩推/側平舉/面拉)',
            subTitle: 'Shoulder & Arm Tone',
            durationMinutes: 50,
            exercises: [
              { id: 'f-s5-e7', name: '器械肩推', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s5-e8', name: '器械側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s5-e9', name: '繩索面拉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-safe-5-d4',
            name: 'Day 4: 大腿緊緻與腿縫雕刻 (上斜腿推/腿後/內收)',
            subTitle: 'Thigh Tightening & Shape',
            durationMinutes: 50,
            exercises: [
              { id: 'f-s5-e10', name: '上斜器械腿推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-s5-e11', name: '俯臥腿後勾', muscleGroup: 'hamstrings', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s5-e12', name: '器械腿內收', muscleGroup: 'quads', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-safe-5-d5',
            name: 'Day 5: 核心小蠻腰 (器械捲腹/cable捲腹/棒式)',
            subTitle: 'Waist & Core Sculpt',
            durationMinutes: 45,
            exercises: [
              { id: 'f-s5-e13', name: '器械捲腹', muscleGroup: 'core', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s5-e14', name: 'cable跪姿捲腹', muscleGroup: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-s5-e15', name: '棒式', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 0 }
            ]
          }
        ]
      }
    };

    // 4. 女士 + 力量雕塑/自由重量 (安全模式關閉，槓鈴臀推、相撲硬舉、分腿蹲、啞鈴肩推)
    export const femaleFree: Record<number, { title: string; desc: string; englishTag: string; days: (RoutineTemplate & { subTitle?: string; durationMinutes?: number })[] }> = {
      2: {
        title: '2 日自由分化 · 蜜桃臀大重量力量',
        desc: '專為追求極致臀腿線條的女性打造。以槓鈴臀推、相撲硬舉、保加利亞分腿蹲為主軸，大幅提升臀部維度。',
        englishTag: '2 Days Heavy Glutes & Back',
        days: [
          {
            id: 'f-free-2-d1',
            name: 'Day 1: 蜜桃臀大重量與後側鏈',
            subTitle: 'Heavy Glutes & Hamstrings',
            durationMinutes: 45,
            exercises: [
              { id: 'f-f2-e1', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f2-e2', name: '相撲硬舉', muscleGroup: 'back', defaultSets: 3, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f2-e3', name: '保加利亞啞鈴分腿蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f2-e4', name: '羅馬椅抬腿', muscleGroup: 'core', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-free-2-d2',
            name: 'Day 2: 天鵝美背與深蹲曲線',
            subTitle: 'Back Posture & Squats',
            durationMinutes: 45,
            exercises: [
              { id: 'f-f2-e5', name: '高位下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f2-e6', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f2-e7', name: '上斜啞鈴划船', muscleGroup: 'back', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-f2-e8', name: '棒式', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 0 }
            ]
          }
        ]
      },
      3: {
        title: '3 日自由分化 · 臀推/硬舉/美背雕塑',
        desc: '科學高效的女性力量體態計畫。Day 1 臀推與單腿分腿蹲，Day 2 美背與直角肩，Day 3 相撲硬舉與深蹲。',
        englishTag: 'Glutes Deadlift Squat Split',
        days: [
          {
            id: 'f-free-3-d1',
            name: 'Day 1: 蜜桃臀爆發 (槓鈴臀推/分腿蹲/高腳杯)',
            subTitle: 'Glute Heavy Power',
            durationMinutes: 45,
            exercises: [
              { id: 'f-f3-e1', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f3-e2', name: '保加利亞啞鈴分腿蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f3-e3', name: '啞鈴高腳杯蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-f3-e4', name: '羅馬椅抬腿', muscleGroup: 'core', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-free-3-d2',
            name: 'Day 2: 天鵝美背與直角肩 (下拉/啞鈴划船/側平舉)',
            subTitle: 'Back Width & Shoulder Tone',
            durationMinutes: 45,
            exercises: [
              { id: 'f-f3-e5', name: '高位下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f3-e6', name: '單臂啞鈴划船', muscleGroup: 'back', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f3-e7', name: '啞鈴側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-f3-e8', name: '繩索面拉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-free-3-d3',
            name: 'Day 3: 下肢後側鏈 (相撲硬舉/深蹲/核心)',
            subTitle: 'Deadlift & Squat Tone',
            durationMinutes: 45,
            exercises: [
              { id: 'f-f3-e9', name: '相撲硬舉', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f3-e10', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f3-e11', name: '上斜啞鈴划船', muscleGroup: 'back', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-f3-e12', name: '棒式', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 0 }
            ]
          }
        ]
      },
      4: {
        title: '4 日自由分化 · 蜜桃臀重訓與雕刻',
        desc: '女性 4 天重訓分化。槓鈴臀推、深蹲、硬舉與啞鈴雕塑全面結合，雕琢立體臀波與腰背比。',
        englishTag: '4 Days Female Free Weight Split',
        days: [
          {
            id: 'f-free-4-d1',
            name: 'Day 1: 臀部力量重訓 A (槓鈴臀推/相撲硬舉/分腿蹲)',
            subTitle: 'Glute Heavy Day A',
            durationMinutes: 50,
            exercises: [
              { id: 'f-f4-e1', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f4-e2', name: '相撲硬舉', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f4-e3', name: '保加利亞啞鈴分腿蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f4-e4', name: '懸垂抬腿', muscleGroup: 'core', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-free-4-d2',
            name: 'Day 2: 天鵝美背與直角肩 A (高位下拉/槓鈴划船/肩推)',
            subTitle: 'Back & Shoulder Power A',
            durationMinutes: 50,
            exercises: [
              { id: 'f-f4-e5', name: '高位下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f4-e6', name: '槓鈴划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f4-e7', name: '坐姿啞鈴肩推', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f4-e8', name: '啞鈴側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-free-4-d3',
            name: 'Day 3: 深蹲與臀部曲線 B (槓鈴深蹲/臀推/高腳杯)',
            subTitle: 'Squat & Glute Shape B',
            durationMinutes: 50,
            exercises: [
              { id: 'f-f4-e9', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f4-e10', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f4-e11', name: '啞鈴高腳杯蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-f4-e12', name: '羅馬椅抬腿', muscleGroup: 'core', defaultSets: 3, defaultReps: 12, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-free-4-d4',
            name: 'Day 4: 全身緊緻與美背 B (上斜划船/啞鈴推胸/後肩)',
            subTitle: 'Upper Sculpt & Core B',
            durationMinutes: 50,
            exercises: [
              { id: 'f-f4-e13', name: '上斜啞鈴划船', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f4-e14', name: '啞鈴平板臥推', muscleGroup: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-f4-e15', name: '俯身啞鈴反向飛鳥', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-f4-e16', name: '棒式', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 0 }
            ]
          }
        ]
      },
      5: {
        title: '5 日自由分化 · 女性極致曲線計畫',
        desc: '頂級女性分化計畫。臀部、美背、肩線、下肢與核心全方位深層雕刻。',
        englishTag: '5 Days Female Sculpt Plan',
        days: [
          {
            id: 'f-free-5-d1',
            name: 'Day 1: 蜜桃臀極限爆發 (槓鈴臀推/相撲硬舉/分腿蹲)',
            subTitle: 'Glutes Maximal Power',
            durationMinutes: 50,
            exercises: [
              { id: 'f-f5-e1', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f5-e2', name: '相撲硬舉', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f5-e3', name: '保加利亞啞鈴分腿蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-free-5-d2',
            name: 'Day 2: 天鵝美背線條 (引體輔助/高位下拉/槓鈴划船)',
            subTitle: 'Back Width & Posture',
            durationMinutes: 50,
            exercises: [
              { id: 'f-f5-e4', name: '引體向上輔助', muscleGroup: 'back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f5-e5', name: '高位下拉', muscleGroup: 'back', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f5-e6', name: '槓鈴划船', muscleGroup: 'back', defaultSets: 3, defaultReps: 10, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-free-5-d3',
            name: 'Day 3: 直角肩與鎖骨線 (坐姿啞鈴肩推/側平舉/面拉)',
            subTitle: 'Shoulder & Collarbone Line',
            durationMinutes: 50,
            exercises: [
              { id: 'f-f5-e7', name: '坐姿啞鈴肩推', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f5-e8', name: '啞鈴側平舉', muscleGroup: 'shoulders', defaultSets: 4, defaultReps: 15, defaultWeight: 0 },
              { id: 'f-f5-e9', name: '繩索面拉', muscleGroup: 'shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-free-5-d4',
            name: 'Day 4: 下肢深蹲曲線 (槓鈴深蹲/高腳杯蹲/臀推)',
            subTitle: 'Squat & Lower Curve',
            durationMinutes: 50,
            exercises: [
              { id: 'f-f5-e10', name: '槓鈴深蹲', muscleGroup: 'quads', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
              { id: 'f-f5-e11', name: '啞鈴高腳杯蹲', muscleGroup: 'quads', defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-f5-e12', name: '槓鈴臀推', muscleGroup: 'quads', defaultSets: 3, defaultReps: 10, defaultWeight: 0 }
            ]
          },
          {
            id: 'f-free-5-d5',
            name: 'Day 5: 核心小蠻腰 (懸垂抬腿/健腹輪/棒式)',
            subTitle: 'Core & Waistline Strength',
            durationMinutes: 45,
            exercises: [
              { id: 'f-f5-e13', name: '懸垂抬腿', muscleGroup: 'core', defaultSets: 4, defaultReps: 12, defaultWeight: 0 },
              { id: 'f-f5-e14', name: '健腹輪', muscleGroup: 'core', defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
              { id: 'f-f5-e15', name: '棒式', muscleGroup: 'core', defaultSets: 3, defaultReps: 1, defaultWeight: 0 }
            ]
          }
        ]
      }
    };
