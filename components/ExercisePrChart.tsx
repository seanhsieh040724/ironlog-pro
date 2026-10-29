import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { WorkoutSession } from '../types';
import { EXERCISE_MEDIA_ALIASES } from '../utils/fitnessMath';
import { TrendingUp, Trophy, Calendar, Sparkles, Target, ArrowUpRight } from 'lucide-react';
import { lightTheme } from '../themeStyles';

export interface ExercisePrPoint {
  dateTimestamp: number;
  dateStr: string;
  fullDateStr: string;
  maxWeight: number;
  bestReps: number;
  sessionTitle: string;
  isNewPr?: boolean;
}

interface ExercisePrChartProps {
  exerciseName: string;
  history: WorkoutSession[];
  onGoToLog?: () => void;
}

/**
 * 從歷史紀錄中彙整特定訓練動作的每次訓練 PR（最高實際重量）
 */
export const getExercisePrHistory = (exerciseName: string, history: WorkoutSession[]): ExercisePrPoint[] => {
  if (!exerciseName || !history || history.length === 0) return [];
  const cleanTarget = exerciseName.trim();
  const canonicalTarget = EXERCISE_MEDIA_ALIASES[cleanTarget] || cleanTarget;

  // 依日期（yyyy-MM-dd）彙整當天最高重量
  const dayMap = new Map<string, { timestamp: number; maxWeight: number; bestReps: number; sessionTitle: string }>();

  // 依訓練時間升冪排序（舊到新）
  const sortedSessions = [...history].sort((a, b) => a.startTime - b.startTime);

  for (const session of sortedSessions) {
    if (!session.exercises || session.exercises.length === 0) continue;
    const sessionDate = new Date(session.startTime);
    const dayKey = format(sessionDate, 'yyyy-MM-dd');

    for (const ex of session.exercises) {
      const exClean = (ex.name || '').trim();
      const exCanonical = EXERCISE_MEDIA_ALIASES[exClean] || exClean;

      if (exClean === cleanTarget || exCanonical === canonicalTarget) {
        // 僅篩選已完成且重量大於 0 的有效組數
        const validSets = (ex.sets || []).filter(
          s => s.completed && typeof s.weight === 'number' && s.weight > 0
        );

        for (const s of validSets) {
          const existing = dayMap.get(dayKey);
          if (!existing) {
            dayMap.set(dayKey, {
              timestamp: session.startTime,
              maxWeight: s.weight,
              bestReps: s.reps || 0,
              sessionTitle: session.title || '個人訓練'
            });
          } else {
            if (s.weight > existing.maxWeight) {
              existing.maxWeight = s.weight;
              existing.bestReps = s.reps || 0;
            } else if (s.weight === existing.maxWeight && (s.reps || 0) > existing.bestReps) {
              existing.bestReps = s.reps || 0;
            }
          }
        }
      }
    }
  }

  const points: ExercisePrPoint[] = [];
  let runningMax = 0;

  dayMap.forEach((val, dayKey) => {
    const isNewPr = val.maxWeight > runningMax;
    if (isNewPr) runningMax = val.maxWeight;

    points.push({
      dateTimestamp: val.timestamp,
      dateStr: format(new Date(val.timestamp), 'MM/dd'),
      fullDateStr: dayKey,
      maxWeight: val.maxWeight,
      bestReps: val.bestReps,
      sessionTitle: val.sessionTitle,
      isNewPr
    });
  });

  points.sort((a, b) => a.dateTimestamp - b.dateTimestamp);
  return points;
};

export const ExercisePrChart: React.FC<ExercisePrChartProps> = ({
  exerciseName,
  history,
  onGoToLog
}) => {
  const prData = useMemo(() => getExercisePrHistory(exerciseName, history), [exerciseName, history]);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  // 計算統計數值
  const stats = useMemo(() => {
    if (prData.length === 0) return null;
    const weights = prData.map(p => p.maxWeight);
    const allTimePr = Math.max(...weights);
    const initialPr = prData[0].maxWeight;
    const latestPr = prData[prData.length - 1].maxWeight;
    const totalGain = latestPr - initialPr;
    return {
      allTimePr,
      initialPr,
      latestPr,
      totalGain,
      count: prData.length
    };
  }, [prData]);

  const activePoint = selectedPointIndex !== null && prData[selectedPointIndex]
    ? prData[selectedPointIndex]
    : prData[prData.length - 1];

  // 1. 無紀錄之空狀態 (Zero Data State)
  if (prData.length === 0) {
    return (
      <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-black/5 flex flex-col items-center justify-center text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-[#CCFF00]/20 border border-[#CCFF00]/40 flex items-center justify-center mb-4 text-black">
          <TrendingUp className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h3 className="text-lg font-black text-black uppercase tracking-tight mb-2">
          尚無「{exerciseName}」PR 紀錄
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed font-medium mb-6">
          完成並儲存此動作的有效訓練組後，系統將自動記錄每次突破並繪製專屬的個人紀錄折線圖！
        </p>
        {onGoToLog && (
          <button
            type="button"
            onClick={onGoToLog}
            className="px-6 py-3 rounded-xl bg-black hover:bg-slate-800 active:scale-95 text-[#CCFF00] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Target className="w-4 h-4 stroke-[2.5]" />
            <span>立即前往錄入訓練</span>
          </button>
        )}
      </div>
    );
  }

  // 2. 僅有一筆紀錄 (Single Data Point State)
  if (prData.length === 1) {
    const single = prData[0];
    return (
      <div className="space-y-4">
        {/* 指標卡片 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
              歷史最高 PR
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-black">{single.maxWeight}</span>
              <span className="text-xs font-black text-slate-500 uppercase">kg</span>
            </div>
            <span className="text-[11px] font-bold text-slate-500 mt-1 block">
              完成次數：{single.bestReps} reps
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
              首發建立日期
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <Calendar className="w-4 h-4 text-black" />
              <span className="text-sm sm:text-base font-black text-black">{single.fullDateStr}</span>
            </div>
            <span className="text-[11px] font-black text-[#82CC00] mt-1 block">
              ★ 首發個人基準
            </span>
          </div>
        </div>

        {/* 單點圖表視覺呈現 */}
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-xs flex flex-col items-center justify-center text-center">
          <div className="relative w-full max-w-sm h-36 flex items-center justify-center">
            {/* 基準水平虛線 */}
            <div className="absolute w-full border-b-2 border-dashed border-slate-200" />
            
            {/* 單點視覺 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="px-3 py-1 bg-black text-[#CCFF00] rounded-lg text-xs font-black shadow-md mb-2 flex items-center gap-1 animate-bounce">
                <Trophy className="w-3.5 h-3.5 fill-[#CCFF00]" />
                <span>PR: {single.maxWeight} kg</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#CCFF00] border-4 border-black flex items-center justify-center shadow-md ring-4 ring-[#CCFF00]/30" />
              <span className="text-xs font-black text-slate-700 mt-2">{single.dateStr}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-4 py-2 rounded-xl mt-2">
            <Sparkles className="w-4 h-4 text-[#82CC00]" />
            <span>已成功建立基準紀錄！再完成一次訓練即可展開成長折線趨勢！</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. 兩筆以上紀錄：完整向量折線圖 (Multi-point Line Chart)
  // 計算 SVG 座標
  const chartWidth = 500;
  const chartHeight = 190;
  const padding = { top: 30, right: 28, bottom: 35, left: 45 };

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const weights = prData.map(d => d.maxWeight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const rangeW = maxW - minW === 0 ? 10 : maxW - minW;
  const yMin = Math.max(0, Math.floor(minW - rangeW * 0.15));
  const yMax = Math.ceil(maxW + rangeW * 0.2);
  const yRange = yMax - yMin;

  const points = prData.map((d, i) => {
    const x = padding.left + (i / (prData.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - ((d.maxWeight - yMin) / yRange) * innerHeight;
    return { x, y, data: d, index: i };
  });

  // 建立平滑或折線 path
  const linePath = points.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    return `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  // 閉合區域漸層 path
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${padding.top + innerHeight} Z`;

  // Y 軸刻度 (3-4 段)
  const yTicks = [yMin, Math.round(yMin + yRange * 0.5), yMax];

  return (
    <div className="space-y-4">
      {/* 統計摘要資訊條 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-black/5 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5 truncate">
            歷史最高 PR
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-black">{stats?.allTimePr}</span>
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase">kg</span>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-black/5 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5 truncate">
            累計訓練次數
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-black">{stats?.count}</span>
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase">次</span>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-black/5 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5 truncate">
            總進步幅度
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl sm:text-2xl font-black ${
              (stats?.totalGain || 0) >= 0 ? 'text-[#82CC00]' : 'text-red-500'
            }`}>
              {(stats?.totalGain || 0) >= 0 ? `+${stats?.totalGain}` : stats?.totalGain}
            </span>
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase">kg</span>
          </div>
        </div>
      </div>

      {/* 折線圖主卡片 */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/5 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] ring-2 ring-black" />
            <h4 className="text-xs sm:text-sm font-black text-black uppercase tracking-tight">
              每次訓練 PR 重量趨勢
            </h4>
          </div>
          {activePoint && (
            <span className="text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {activePoint.dateStr}: {activePoint.maxWeight} kg ({activePoint.bestReps} reps)
            </span>
          )}
        </div>

        {/* 向量 SVG 折線圖 */}
        <div className="w-full overflow-hidden select-none">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto overflow-visible"
            style={{ maxHeight: '230px' }}
          >
            <defs>
              <linearGradient id="prLineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#CCFF00" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Y 軸水平網格線與刻度標籤 */}
            {yTicks.map(t => {
              const yPos = padding.top + innerHeight - ((t - yMin) / yRange) * innerHeight;
              return (
                <g key={t}>
                  <line
                    x1={padding.left}
                    y1={yPos}
                    x2={chartWidth - padding.right}
                    y2={yPos}
                    stroke="#F1F5F9"
                    strokeWidth="1.2"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 8}
                    y={yPos + 4}
                    textAnchor="end"
                    fontSize="10"
                    fontWeight="800"
                    fill="#94A3B8"
                  >
                    {t}
                  </text>
                </g>
              );
            })}

            {/* 漸層填充面積 */}
            <path d={areaPath} fill="url(#prLineGradient)" />

            {/* 主折線 */}
            <path
              d={linePath}
              fill="none"
              stroke="#000000"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 每個訓練點 */}
            {points.map((p, idx) => {
              const isSelected = selectedPointIndex === idx;
              const isMaxPr = p.data.maxWeight === stats?.allTimePr;
              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onClick={() => setSelectedPointIndex(idx)}
                >
                  {/* 放大觸控點擊熱區 */}
                  <circle cx={p.x} cy={p.y} r="14" fill="transparent" />

                  {/* 選中或最高 PR 光環 */}
                  {(isSelected || isMaxPr) && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="8"
                      fill="#CCFF00"
                      fillOpacity="0.5"
                      className="animate-pulse"
                    />
                  )}

                  {/* 實體圓點 */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? "5.5" : "4"}
                    fill={isMaxPr ? "#CCFF00" : "#000000"}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />

                  {/* 最高 PR 標籤 callout */}
                  {isMaxPr && (
                    <g transform={`translate(${p.x}, ${p.y - 12})`}>
                      <rect
                        x="-14"
                        y="-12"
                        width="28"
                        height="13"
                        rx="4"
                        fill="#000000"
                      />
                      <text
                        x="0"
                        y="-3"
                        textAnchor="middle"
                        fontSize="8"
                        fontWeight="900"
                        fill="#CCFF00"
                      >
                        PR
                      </text>
                    </g>
                  )}

                  {/* X 軸日期標籤 */}
                  {(points.length <= 6 || idx === 0 || idx === points.length - 1 || idx % Math.ceil(points.length / 5) === 0) && (
                    <text
                      x={p.x}
                      y={chartHeight - 12}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="800"
                      fill={isSelected ? "#000000" : "#94A3B8"}
                    >
                      {p.data.dateStr}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 歷次訓練 PR 歷程清單 */}
      <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-black text-black uppercase tracking-wider">歷次記錄明細</span>
          <span className="text-[10px] font-bold text-slate-400">共 {prData.length} 次訓練</span>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {[...prData].reverse().map((record, i) => (
            <div
              key={record.fullDateStr + i}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-black font-mono">{record.fullDateStr}</span>
                {record.isNewPr && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#CCFF00] text-black">
                    PR 突破
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800">
                  {record.maxWeight} kg
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  × {record.bestReps} 次
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
