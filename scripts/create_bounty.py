import argparse
import json
import hashlib


def parse_args():
    parser = argparse.ArgumentParser(description="Create a new OpenSourceMicroBounty task.")
    parser.add_argument("--title", type=str, default="Fix websocket reconnect backoff logic in simulator core")
    parser.add_argument("--description", type=str, default="Issue #104 requires adding exponential backoff to websocket reconnection handlers.")
    parser.add_argument("--repo", type=str, default="https://github.com/genlayerlabs/genlayer-simulator")
    parser.add_argument("--issue", type=str, default="https://github.com/genlayerlabs/genlayer-simulator/issues/104")
    parser.add_argument("--scope", type=str, default="Core websocket connection resilience without breaking simulation event stream.")
    parser.add_argument("--reward-gen", type=float, default=2.5)
    parser.add_argument("--deadline-days", type=int, default=14)
    return parser.parse_args()


def main():
    args = parse_args()
    issue_digest = hashlib.sha256(f"{args.repo}\n{args.issue}\n{args.scope}".encode("utf-8")).hexdigest()
    reward_wei = int(args.reward_gen * 1e18)
    deadline_seconds = args.deadline_days * 86400

    payload = {
        "title": args.title,
        "description": args.description,
        "repository_url": args.repo,
        "issue_url": args.issue,
        "issue_digest": issue_digest,
        "required_scope": args.scope,
        "reward_wei": reward_wei,
        "deadline_seconds": deadline_seconds,
    }

    print("=== OpenSourceMicroBounty: Create Bounty Payload ===")
    print(json.dumps(payload, indent=2))
    print(f"\nIssue Digest SHA-256: {issue_digest}")
    print(f"Locked Amount: {args.reward_gen} GEN ({reward_wei} wei)")


if __name__ == "__main__":
    main()
