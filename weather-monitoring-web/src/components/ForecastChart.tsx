import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ForecastChartProps {
  title: string;
  labels: string[];
  dataSeries: Array<{ label: string; data: number[]; borderColor?: string }>;
}

const ForecastChart: React.FC<ForecastChartProps> = ({ title, labels, dataSeries }) => {
  const data = {
    labels,
    datasets: dataSeries.map((s) => ({
      label: s.label,
      data: s.data,
      borderColor: s.borderColor || '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.2)',
      tension: 0.2,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: title },
    },
  };

  return <Line data={data} options={options} />;
};

export default ForecastChart;
