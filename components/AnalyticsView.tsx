
import React, { useMemo } from 'react';
import { WorkoutSession } from '../types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export const AnalyticsView: React.FC<{ history: WorkoutSession[] }> = ({ history }) => {
  // Extract data for "Squat" or first found exercise for demo
  const exerciseNames = Array.from(new Set(history.flatMap(s => s.exercises.map(e => e.name))));
  const targetEx = exerciseNames[0] || "";

  const chartData = useMemo(() => {
    if (!targetEx) return null;
    
    const relevantSessions = [...history]
      .reverse()
      .filter(s => s.exercises.some(e => e.name === targetEx));
    
    const labels = relevantSessions.map(s => new Date(s.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' }));
    const dataPoints = relevantSessions.map(s => {
      const ex = s.exercises.find(e => e.name === targetEx);
      return Math.max(...(ex?.sets.map(set => set.weight) || [0]));
    });

    return {
      labels,
      datasets: [
        {
          label: `${targetEx} 最高重量 (KG)`,
          data: dataPoints,
          borderColor: '#00D4FF',
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#00D4FF',
          pointBorderColor: '#000000',
          pointBorderWidth: 2,
          pointRadius: 5,
        },
      ],
    };
  }, [history, targetEx]);

  const options = {
    responsive: true,
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
      x: { grid: { display: false }, ticks: { color: '#64748b' } }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111',
        titleFont: { weight: 'bold' },
        padding: 12,
        cornerRadius: 12,
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-black italic uppercase tracking-tight mb-2">訓練進度分析</h2>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Visualizing your progress</p>
      </div>

      {chartData ? (
        <div className="glass-card rounded-[32px] p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black italic text-electric uppercase tracking-tighter">{targetEx} 重量成長趨勢</h3>
          </div>
          <div className="h-64">
            <Line data={chartData} options={options} />
          </div>
        </div>
      ) : (
        <div className="py-20 text-center opacity-30 italic font-medium">紀錄更多訓練以生成圖表</div>
      )}

      <div className="grid grid-cols-2 gap-4">
         <StatCard label="總訓練次數" value={history.length} />
         <StatCard label="總運動分鐘" value={history.reduce((acc, s) => acc + Math.round(((s.endTime || Date.now()) - s.startTime) / 60000), 0)} />
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: any) => (
  <div className="glass-card rounded-3xl p-5 border-white/5">
    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</div>
    <div className="text-3xl font-black text-white italic">{value}</div>
  </div>
);
