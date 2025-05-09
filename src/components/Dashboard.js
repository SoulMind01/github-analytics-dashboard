import React, { useState, useEffect } from 'react';
import ChartCard from './ChartCard';
import { processAttribute } from './statProcessor';

const Dashboard = () =>
{
  const [repoUrl, setRepoUrl] = useState('');
  const [stats, setStats] = useState(null);
  const [processedIssues, setProcessedIssues] = useState(null);
  const [processedPullRequests, setProcessedPullRequests] = useState(null);
  const [processedCommits, setProcessedCommits] = useState(null);
  const [processedReleases, setProcessedReleases] = useState(null);

  const handleFetch = async () =>
  {
    try
    {
      const response = await fetch('https://07vyu4znec.execute-api.us-west-1.amazonaws.com/test/github-analytics-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify
          (
            {
              repo: repoUrl,
              issuesNumber: "100",
              commitsNumber: "100",
              pullRequestsNumber: "10",
              releasesNumber: "0",
              workflowRunsNumber: "100",
            }
          )
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

  // Update stats
  useEffect(() =>
  {
    console.log("Updated stats: ", stats);
    window.stats = stats;
  }, [stats]);

  // Process issues, pull requests
  useEffect(() =>
  {
    if (stats)
    {
      setProcessedIssues(processAttribute(stats, 'issues'));
      setProcessedPullRequests(processAttribute(stats, 'pull_requests'))
      setProcessedCommits(processAttribute(stats, 'commits'))
    }
  }, [stats]);
  useEffect(() => 
  {
    window.processedIssues = processedIssues;
    window.processedPullRequests = processedPullRequests;
  }, [processedIssues, processedPullRequests]);
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
              labels: stats.contributors?.map(user => user.login) ?? ['No data'],
              datasets: [{
                label: 'Commits',
                data: stats.contributors?.map(user => user.contributions) ?? [0],
                borderColor: 'teal',
                tension: 0.4,
              }]
            }}
          />

          <ChartCard
            title="Commit Timeline"
            chartType="line"
            data={{
              labels: processedCommits?.map(commit => commit.date) ?? ['No data'],
              datasets: [{
                label: 'Commits',
                data: processedCommits?.map(commit => commit.count) ?? [0],
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
            notation={`Average issue resolution days: ${stats.avg_issue_resolution_days}`}
          />

          <ChartCard
            title="Pull Request Timeline"
            chartType="line"
            data={{
              labels: processedPullRequests?.map(issue => issue.date) ?? ['No data'],
              datasets: [{
                label: 'Pull Requests',
                data: processedPullRequests?.map(issue => issue.count) ?? [0],
                borderColor: 'teal',
                tension: 0.4,
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