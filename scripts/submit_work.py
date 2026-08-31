import argparse
import json
import hashlib


def main():
    parser = argparse.ArgumentParser(description="Submit PR and evidence for bounty.")
    parser.add_argument("--bounty-id", type=int, default=0)
    parser.add_argument("--pr-url", type=str, default="https://github.com/genlayerlabs/genlayer-simulator/pull/112")
    parser.add_argument("--commit-sha", type=str, default="d4f3a2b1c0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5")
    args = parser.parse_args()

    parts = args.pr_url.rstrip("/").split("/")
    evidence_url = f"https://api.github.com/repos/{parts[-4]}/{parts[-3]}/pulls/{parts[-1]}"
    evidence_digest = hashlib.sha256(evidence_url.encode("utf-8")).hexdigest()

    payload = {
        "method": "submit_work",
        "bounty_id": args.bounty_id,
        "pr_url": args.pr_url,
        "commit_sha": args.commit_sha,
        "evidence_url": evidence_url,
        "evidence_digest": evidence_digest,
        "summary": "Implemented exponential backoff with jitter on reconnect",
    }

    print("=== OpenSourceMicroBounty: Submit Work ===")
    print(json.dumps(payload, indent=2))
    print(f"Evidence Digest SHA-256: {evidence_digest}")


if __name__ == "__main__":
    main()
