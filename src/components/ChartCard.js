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

ChartJS.register(
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const ChartCard = ({ title, chartType, data, notation }) =>
{
  let ChartComponent;
  switch (chartType)
  {
    case 'bar': ChartComponent = Bar; break;
    case 'doughnut': ChartComponent = Doughnut; break;
    case 'line':
    default:
      ChartComponent = Line;
  }

  let logMessage = `[ChartCard] Rendering "${title}" as a ${chartType} chart\n`;
  console.log(logMessage);
  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{title}</h3>
      <ChartComponent data={data} />
      {notation && <p style={styles.notation}>{notation}</p>}
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
  },
  notation: {
    marginTop: '1rem',
    fontSize: '0.875rem',
    color: '#555',
  },
};

export default ChartCard;