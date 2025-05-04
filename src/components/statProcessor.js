function processIssues(stats)
{
  try
  {
    const issues = stats.issues;
    if (!issues) throw new Error("Stat doesn't have issues field");
    // Sort the issues by date
    const sortedIssues = issues.map(x => x.created_at.slice(5, 10)).sort();
    const issueCountsByDate = sortedIssues.reduce((acc, date) =>
    {
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {})
    const issueCountArray = Object.entries(issueCountsByDate).map(([date, count]) => ({ date, count }));
    return issueCountArray;
  }
  catch (exception)
  {
    console.log(exception);
  }
}

export default processIssues;