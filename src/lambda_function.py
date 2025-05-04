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

def get_issues(repo):
    url = f"https://api.github.com/repos/{repo}/issues?state=all&per_page=100"
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

def get_ci_cd_results(repo):
    url = f"https://api.github.com/repos/{repo}/pulls?state=all&per_page=10"
    return fetch_github_json(url)


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
        contributors = get_contributors(repo)
        issues = get_issues(repo)

        avg_resolution = calculate_avg_issue_resolution(issues)
        ci_cd_results = get_ci_cd_results(repo)
        # Mock CI/CD results
        success_count = 87
        failure_count = 13

        return {
            "statusCode": 200,
            "body": json.dumps({
                "repo": repo,
                "contributors": contributors,
                "issues": issues,
                "ci_cd_results": ci_cd_results,
                "avg_issue_resolution_days": avg_resolution,
                "success_count": success_count,
                "failure_count": failure_count
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": f"GitHub API call failed: {str(e)}"})
        }
