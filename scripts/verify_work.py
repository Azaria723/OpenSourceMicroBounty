import argparse
import json
import hashlib


def simulate_verification(bounty_repo, bounty_issue, sub_pr, sub_commit, sub_digest, evidence_data_bytes):
    calc_digest = hashlib.sha256(evidence_data_bytes).hexdigest()
    if calc_digest.lower() != sub_digest.lower():
        return {
            "verdict": "UNAVAILABLE",
            "verdict_code": 7,
            "reason_code": "EVIDENCE_DIGEST_MISMATCH",
            "repository_match": "FAIL",
            "issue_match": "FAIL",
            "merged": "FAIL",
            "scope_match": "FAIL",
        }

    try:
        data = json.loads(evidence_data_bytes.decode("utf-8"))
        repo_match = "PASS" if data.get("repository", "").lower() == bounty_repo.lower() else "FAIL"
        issue_match = "PASS" if data.get("issue_url", "").lower() == bounty_issue.lower() and data.get("pr_url", "").lower() == sub_pr.lower() else "FAIL"
        merged_match = "PASS" if data.get("merged") is True and data.get("commit_sha", "").lower() == sub_commit.lower() else "FAIL"
        scope_match = "PASS" if len(data.get("scope_summary", "")) > 0 else "FAIL"

        if repo_match == "PASS" and issue_match == "PASS" and merged_match == "PASS" and scope_match == "PASS":
            return {
                "verdict": "APPROVED",
                "verdict_code": 3,
                "reason_code": "PR_MERGED_AND_SCOPE_VERIFIED",
                "repository_match": repo_match,
                "issue_match": issue_match,
                "merged": merged_match,
                "scope_match": scope_match,
            }
        else:
            return {
                "verdict": "REJECTED",
                "verdict_code": 5,
                "reason_code": "SUBMISSION_FAILED_VALIDATOR_CHECKS",
                "repository_match": repo_match,
                "issue_match": issue_match,
                "merged": merged_match,
                "scope_match": scope_match,
            }
    except Exception as e:
        return {
            "verdict": "UNAVAILABLE",
            "verdict_code": 7,
            "reason_code": f"PARSE_ERROR: {str(e)}",
            "repository_match": "FAIL",
            "issue_match": "FAIL",
            "merged": "FAIL",
            "scope_match": "FAIL",
        }


def main():
    parser = argparse.ArgumentParser(description="Simulate GenLayer verification.")
    parser.add_argument("--evidence-file", type=str, default="samples/sample-pr-merged.json")
    args = parser.parse_args()

    raw_bytes = open(args.evidence_file, "rb").read()
    digest = hashlib.sha256(raw_bytes).hexdigest()

    result = simulate_verification(
        bounty_repo="https://github.com/genlayerlabs/genlayer-simulator",
        bounty_issue="https://github.com/genlayerlabs/genlayer-simulator/issues/104",
        sub_pr="https://github.com/genlayerlabs/genlayer-simulator/pull/112",
        sub_commit="d4f3a2b1c0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5",
        sub_digest=digest,
        evidence_data_bytes=raw_bytes,
    )

    print("=== OpenSourceMicroBounty: Verification Result ===")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
