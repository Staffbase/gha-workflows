import argparse
from dataclasses import dataclass
from datetime import datetime
from datetime import timedelta
from dateutil.parser import parse
from github import Auth, Repository
from github import Github
from typing import Dict, List

MAX_FILENAME_LENGTH = 60


@dataclass
class CommitDigest:
    sha: str
    timestamp: datetime


@dataclass
class Occurrence:
    commit: CommitDigest
    check_url: str
    annotation_path: str


@dataclass
class AppState:
    auth_token: str
    org: str
    repo: str
    branch: str
    slack_channel: str | None
    prefix: str | None
    since: datetime | None
    until: datetime | None


def parse_since(s: str | None) -> datetime:
    if s is None:
        return datetime.now() - timedelta(days=7)
    return parse_datetime(s)


def parse_until(s: str | None) -> datetime:
    if s is None:
        return datetime.now()
    return parse_datetime(s)


def parse_datetime(s):
    if 'T' in s:
        return datetime.strptime(s, '%Y-%m-%dT%H:%M:%SZ')
    else:
        return datetime.strptime(s, '%Y-%m-%d')


def validate_and_split_repo(repo: str) -> (str, str):
    if '/' not in repo:
        raise ValueError(f"Invalid repo format: {repo}")
    org, repo = repo.split('/')
    return org, repo


def parse_args() -> AppState:
    """Parse CLI arguments. Exit if invalid or help requested."""
    parser = argparse.ArgumentParser(description='Find all occurrences of annotations in a GitHub repo.', add_help=True,
                                     exit_on_error=True)
    parser.add_argument('--auth-token', type=str, help='GitHub auth token (required)', required=True)
    parser.add_argument('--slack-channel', metavar="CHANNEL",
                        help='Format output for posting in Slack to given channel')
    parser.add_argument('--prefix', type=str, help='prefix to filter annotations by', required=True)
    parser.add_argument('--since', type=str,
                        help='date to start from, format YYYY-MM-DD defaults to start of day (midnight UTC), '
                             'format YYYY-MM-DDTHH:MM:SSZ is also supported. Defaults to start of day one week ago.')
    parser.add_argument('--until', type=str,
                        help='date to end at, format YYYY-MM-DD defaults to end of day (midnight of next day UTC), '
                             'format YYYY-MM-DDTHH:MM:SSZ is also supported. Defaults to now.')
    parser.add_argument("repo", metavar="repo", type=str,
                        help="GitHub repo to search in, format <org>/<repo> (required)")
    parser.add_argument("branch", metavar="branch", type=str, help="git branch to check (defaults to 'main')",
                        default="main")
    args = parser.parse_args()
    try:
        (org, repo) = validate_and_split_repo(args.repo)
        return AppState(
            auth_token=args.auth_token,
            org=org,
            repo=repo,
            branch=args.branch,
            since=parse_since(args.since),
            until=parse_until(args.until),
            slack_channel=args.slack_channel,
            prefix=args.prefix
        )
    except Exception as e:
        print(f"Error: {e}")
        parser.print_help()
        exit(1)


def print_for_humans(occurrences: List[Occurrence]):
    occurrences_by_ann_path: Dict[str, List[Occurrence]] = {}
    for o in occurrences:
        occurrences_by_ann_path.setdefault(o.annotation_path, []).append(o)
    for ann_path, occrs in occurrences_by_ann_path.items():
        print(f"{ann_path}:")
        for o in occrs:
            print(f"    in {o.commit.sha} on {o.commit.timestamp}, see {o.check_url}")


def truncate_left(s: str, n: int) -> str:
    if len(s) <= n:
        return s
    return "…" + s[-(n - 1):]


def render_msg_header(state: AppState) -> str:
    return ':snowflake: Search results for flaky tests in ' + \
        f'<https://github.com/{state.org}/{state.repo}|{state.repo}> ({state.branch}):'


def print_for_slack(occurrences: List[Occurrence], state: AppState):
    json = """
    {
        "channel": "@CHANNEL@",
        "text": "Flaky Tests Summary",
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "@HEADER@"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Top failed runs (limit=@LIMIT@):\\n@CONTENT@"
                }
            }
        ]
    }
    """

    occurrences_by_ann_path: Dict[str, List[Occurrence]] = {}
    for o in occurrences:
        occurrences_by_ann_path.setdefault(o.annotation_path, []).append(o)
    items = [i for i in occurrences_by_ann_path.items()]
    items.sort(key=lambda i: len(i[1]), reverse=True)  # sort by number of occurrences, highest first

    limit = 12  # limit to 12 items, to avoid running into issues with Slack API (limit 3000 chars)
    items = items[:limit]

    content = ""
    for ann_path, occrs in items:
        nice_path = truncate_left(ann_path, MAX_FILENAME_LENGTH)
        count = len(occrs)
        content += f"{count}x `{nice_path}`"
        occrs.sort(key=lambda o: o.commit.timestamp, reverse=True)
        most_recent_occr = occrs[0]
        content += f" <{most_recent_occr.check_url}|link>"
        content += '\\n'

    header = render_msg_header(state)
    json = json.replace("@HEADER@", header)
    json = json.replace("@LIMIT@", str(limit))
    json = json.replace("@CHANNEL@", state.slack_channel)
    json = json.replace("@CONTENT@", content)
    print(json)


def access_repo(state: AppState) -> Repository:
    auth = Auth.Token(state.auth_token)
    g = Github(auth=auth)
    o = g.get_organization(state.org)
    return o.get_repo(state.repo)


def list_occurrences(state: AppState, r: Repository) -> List[Occurrence]:
    occurrences: List[Occurrence] = []
    commits_pl = r.get_commits(sha=state.branch, since=state.since, until=state.until)
    for c in commits_pl:
        # ignore commit check suites that are not for the current branch (e.g. != master)
        ignore_commit = False
        for cs in c.get_check_suites():
            if cs.head_branch != state.branch:
                ignore_commit = True
                break
        if ignore_commit:
            continue

        c_ts = parse(c.last_modified)
        digest = CommitDigest(c.sha, c_ts)
        check_runs_pl = c.get_check_runs(filter="all")  # we want "all" runs, not just the latest one
        for cr in check_runs_pl:
            if cr.status != "completed":  # still running
                continue
            if cr.conclusion != "failure":  # we want only failures
                continue
            if cr.output.annotations_count == 0:  # small optimization, don't fetch what's not there
                continue
            annotations_pl = cr.get_annotations()
            for ann in annotations_pl:
                # filter out github meta annotation path, which is useless for our summary
                if ann.path == '.github':
                    continue
                # filter out build errors or other issues, which are not flaky tests
                if not ann.message.startswith(state.prefix):
                    continue
                # annotation path contains something like ".../packageA/TestA.xml" or ".../packageB/TestB.kt"
                occr = Occurrence(digest, cr.html_url, ann.path)
                occurrences.append(occr)
    return occurrences


def main():
    state: AppState = parse_args()
    r = access_repo(state)
    occurrences = list_occurrences(state, r)
    if state.slack_channel:
        print_for_slack(occurrences, state)
    else:
        print_for_humans(occurrences)


if __name__ == '__main__':
    main()
