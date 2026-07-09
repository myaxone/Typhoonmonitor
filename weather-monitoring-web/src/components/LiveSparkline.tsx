import React, { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';

interface LiveSparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

const LiveSparkline: React.FC<LiveSparklineProps> = ({ data, color = '#10b981', height = 60 }) => {
  const labels = data.map((_, i) => i.toString());
  const chartData = {
    labels,
    datasets: [
      {
        data,
        borderColor: color,
        backgroundColor: 'rgba(16,185,129,0.15)',
        fill: true,
        pointRadius: 0,
        tension: 0.25,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { display: false }, y: { display: false } },
    plugins: { legend: { display: false } },
  };

  return (
    <div style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LiveSparkline;
