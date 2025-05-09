import json
import os
import urllib.request
from datetime import datetime

# GitHub API setup
GITHUB_TOKEN = os.environ['GITHUB_TOKEN']
HEADERS = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json",
    "User-Agent": "lambda-function"
}

def fetch_github_json(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read())

def get_contributors(repo):
    url = f"https://api.github.com/repos/{repo}/contributors"
    return fetch_github_json(url)

def get_issues(repo, number=100):
    if number == 0:
        return []
    url = f"https://api.github.com/repos/{repo}/issues?state=all&per_page={number}"
    return fetch_github_json(url)

def calculate_avg_issue_resolution(issues):
    resolution_days = []
    for issue in issues:
        if issue.get("state") == "closed" and "created_at" in issue and "closed_at" in issue:
            created = datetime.fromisoformat(issue["created_at"].replace("Z", "+00:00"))
            closed = datetime.fromisoformat(issue["closed_at"].replace("Z", "+00:00"))
            delta = (closed - created).days
            resolution_days.append(delta)
    if resolution_days:
        return round(sum(resolution_days) / len(resolution_days), 2)
    return None

def get_pull_requests(repo, number=10):
    if number == 0:
        return []
    url = f"https://api.github.com/repos/{repo}/pulls?state=all&per_page={number}"
    return fetch_github_json(url)

def get_releases(repo, number=10):
    if number == 0:
        return []
    url = f"https://api.github.com/repos/{repo}/releases?per_page={number}"
    return fetch_github_json(url)

def get_commits(repo, number=10):
    if number == 0:
        return []
    url = f"https://api.github.com/repos/{repo}/commits?per_page={number}"
    return fetch_github_json(url)

def get_workflow_runs(repo, number=50):
    if number ==0:
        return []
    url = f"https://api.github.com/repos/{repo}/actions/runs?per_page={number}"
    return fetch_github_json(url).get('workflow_runs', [])

def calculate_ci_cd_success_rate(workflow_runs):
    success_count = 0
    failure_count = 0
    for run in workflow_runs:
        if run["conclusion"] == "success":
            success_count += 1
        elif run["conclusion"] == "failure":
            failure_count += 1
    return success_count, failure_count

def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        repo = body.get("repo", "octocat/Hello-World")
    except Exception as e:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": f"Invalid input: {str(e)}"})
        }

    try:
        issuesNumber = int(body.get("issuesNumber", 100))
        commitsNumber = int(body.get("commitsNumber", 5))
        pullRequestsNumber = int(body.get("pullRequestsNumber", 10))
        releasesNumber = int(body.get("releasesNumber", 0))
        workflowRunsNumber = int(body.get("workflowRunsNumber", 10))

        contributors = get_contributors(repo)
        issues = get_issues(repo, issuesNumber)  
        pull_requests = get_pull_requests(repo, pullRequestsNumber)
        releases = get_releases(repo, releasesNumber)
        commits = get_commits(repo, commitsNumber)
        workflow_runs = get_workflow_runs(repo, workflowRunsNumber)

        avg_resolution = calculate_avg_issue_resolution(issues)

        success_count, failure_count = calculate_ci_cd_success_rate(workflow_runs)

        return {
            "statusCode": 200,
            "body": json.dumps({
                "repo": repo,
                "contributors": contributors,
                "issues": issues,
                "pull_requests": pull_requests,
                "avg_issue_resolution_days": avg_resolution,
                "success_count": success_count,
                "failure_count": failure_count,
                "releases": releases,
                "commits": commits,
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": f"GitHub API call failed: {str(e)}"})
        }
