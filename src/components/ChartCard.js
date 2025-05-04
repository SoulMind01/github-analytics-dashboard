import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import
{
  Chart as ChartJS,
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

// ✅ REGISTER ALL ELEMENTS YOU USE
ChartJS.register(
  LineElement,
  BarElement,
  ArcElement,         // <-- required for Doughnut/Pie charts
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const ChartCard = ({ title, chartType, data }) =>
{
  console.log(`[ChartCard] Rendering: ${title}`);
  let ChartComponent;
  switch (chartType)
  {
    case 'bar': ChartComponent = Bar; break;
    case 'doughnut': ChartComponent = Doughnut; break;
    case 'line':
    default:
      ChartComponent = Line;
  }

  // ✅ Debug logs: what kind of chart, and what data it's getting
  console.log(`[ChartCard] Rendering "${title}" as a ${chartType} chart`);
  console.log(`[ChartCard] Data:`, data);

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{title}</h3>
      <ChartComponent data={data} />
    </div>
  );
};


const styles = {
  card: {
    padding: '1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: '1rem',
    fontSize: '1.25rem',
  }
};

export default ChartCard;
