import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Plugin
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { HometownStats } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  stats: HometownStats[];
}

export const AthleteDistributionChart: React.FC<Props> = ({ stats }) => {
  // Sort and take top 5 for clarity as requested
  const topStats = useMemo(() => {
    return [...stats]
      .sort((a, b) => (b.olympicCount + b.paralympicCount) - (a.olympicCount + a.paralympicCount))
      .slice(0, 5);
  }, [stats]);

  const data = {
    labels: topStats.map(s => s.hometown),
    datasets: [
      {
        label: 'Olympians',
        data: topStats.map(s => s.olympicCount),
        backgroundColor: '#0057B8',
        borderColor: '#00479b',
        borderWidth: 1,
      },
      {
        label: 'Paralympians',
        data: topStats.map(s => s.paralympicCount),
        backgroundColor: '#D50032',
        borderColor: '#b3002a',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 10,
            family: "'Segoe UI', sans-serif",
            weight: 'bold' as const
          },
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Hometowns that could help find Olympians and Paralympians',
        font: {
          size: 12,
          family: "'Segoe UI', sans-serif",
          weight: 'bold' as const
        },
        padding: { bottom: 10 }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.x} Number of athletes represented`;
          },
          footer: () => {
            return 'Data reflects participation, not performance.';
          }
        },
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
        footerFont: { size: 10, style: 'italic' as const },
        padding: 10,
        cornerRadius: 4,
        displayColors: true
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of athletes represented',
          font: { size: 10, weight: 'bold' as const }
        },
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.05)'
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 10 }
        }
      }
    }
  };

  // Watermark Plugin
  const watermarkPlugin: Plugin = {
    id: 'watermark',
    beforeDraw: (chart) => {
      const { ctx, chartArea: { top, left, width, height } } = chart;
      ctx.save();
      ctx.globalAlpha = 0.05; // Faint watermark
      ctx.font = 'bold 40px sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Drawing a placeholder for the "tri-composite logo" as text/shapes
      // since the specific asset isn't provided as a URL
      ctx.translate(left + width / 2, top + height / 2);
      ctx.fillText('TWO FLAGS', 0, -20);
      ctx.fillText('ONE TEAM', 0, 20);
      
      ctx.restore();
    }
  };

  return (
    <div className="w-full h-full p-2 bg-white flex flex-col">
       <div className="flex-1 min-h-[300px]">
          <Bar data={data} options={options} plugins={[watermarkPlugin]} />
       </div>
       <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded text-[10px] text-slate-500 italic">
          * This analysis shows potential talent identification hotspots based on existing representation data.
       </div>
    </div>
  );
};
