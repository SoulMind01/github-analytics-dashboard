import React, { useState, useEffect } from 'react';
import ChartCard from './ChartCard';
import processIssues from './statProcessor';

const Dashboard = () =>
{
  const [repoUrl, setRepoUrl] = useState('');
  const [stats, setStats] = useState(null);
  const [processedIssues, setProcessedIssues] = useState(null);

  const handleFetch = async () =>
  {
    try
    {
      const response = await fetch('https://07vyu4znec.execute-api.us-west-1.amazonaws.com/test/github-analytics-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: repoUrl })
      });

      console.log("📡 HTTP status:", response.status);

      if (!response.ok)
      {
        const errText = await response.text();
        console.error("❌ API Error Response Text:", errText);
        throw new Error(`Error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      console.log("📦 Full Lambda response:", data);

      // ✅ Lambda already returns final object — no .body parsing needed
      setStats(data);

      console.log("✅ Parsed Lambda output for Dashboard:", data);
    } catch (error)
    {
      alert(`Failed to fetch data: ${error.message}`);
      console.error('🚨 Error fetching data:', error);
    }
  };



  useEffect(() =>
  {
    console.log("Updated stats: ", stats);
    window.stats = stats;
  }, [stats]);

  // Process issues only after `stats` is ready
  useEffect(() =>
  {
    if (stats)
    {
      const processed = processIssues(stats);
      setProcessedIssues(processed);
    }
    window.processedIssues = processedIssues;
  }, [stats]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center' }}>GitHub Repository Analytics Dashboard</h1>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="Enter GitHub repo like owner/repo"
          style={{ padding: '8px', width: '300px', marginRight: '10px' }}
        />
        <button onClick={handleFetch} style={{ padding: '8px 16px' }}>
          Load Data
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p>Stats is {stats ? 'set ✅' : 'not set ❌'}</p>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <ChartCard
            title="Contributor Activity"
            chartType="line"
            data={{
              labels: stats.contributors.map(user => user.login) ?? ['No data'],
              datasets: [{
                label: 'Commits',
                data: stats.contributors.map(user => user.contributions) ?? [0],
                borderColor: 'teal',
                tension: 0.4,
              }]
            }}
          />

          <ChartCard
            title="Issue Timeline"
            chartType="line"
            data={{
              labels: processedIssues?.map(issue => issue.date) ?? ['No data'],
              datasets: [{
                label: 'Issues',
                data: processedIssues?.map(issue => issue.count) ?? [0],
                borderColor: 'teal',
                tension: 0.4,
              }]
            }}
          />

          <ChartCard
            title="Issue Resolution Time"
            chartType="bar"
            data={{
              labels: ['Avg Resolution (Days)'],
              datasets: [{
                label: 'Avg. Days to Close',
                data: [stats.avg_issue_resolution_days ?? 0],
                backgroundColor: ['#fbc02d']
              }]
            }}
          />

          <ChartCard
            title="CI/CD Success Rate"
            chartType="doughnut"
            data={{
              labels: ['Success', 'Failure'],
              datasets: [{
                data: [stats.success_count ?? 85, stats.failure_count ?? 15],
                backgroundColor: ['#4caf50', '#f44336']
              }]
            }}
          />
        </div>
      )}

    </div>
  );


};
export default Dashboard;