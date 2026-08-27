import argparse
import json

STATUS_NAMES = {
    0: "OPEN",
    1: "CLAIMED",
    2: "SUBMITTED",
    3: "APPROVED",
    4: "PAID",
    5: "REJECTED",
    6: "REFUNDED",
    7: "UNAVAILABLE",
    8: "CONFLICTED",
    9: "EXPIRED",
}


def print_formatted_bounty(bounty_dict, sub_dict, verif_dict):
    b_id = bounty_dict.get("bounty_id", 0)
    status_num = bounty_dict.get("status", 0)
    status_label = STATUS_NAMES.get(status_num, f"UNKNOWN({status_num})")
    reward_wei = int(bounty_dict.get("reward_wei", 0))
    reward_gen = reward_wei / 1e18

    print("=" * 65)
    print(f" BOUNTY #{b_id} — [{status_label}]")
    print("=" * 65)
    print(f" Title:        {bounty_dict.get('title')}")
    print(f" Repository:   {bounty_dict.get('repository_url')}")
    print(f" Issue:        {bounty_dict.get('issue_url')}")
    print(f" Scope:        {bounty_dict.get('required_scope')}")
    print(f" Maintainer:   {bounty_dict.get('maintainer')}")
    print(f" Contributor:  {bounty_dict.get('contributor')}")
    print(f" Reward:       {reward_gen} GEN ({reward_wei} wei)")
    print(f" Deadline:     {bounty_dict.get('deadline_seconds')}s")

    if sub_dict.get("pr_url"):
        print("-" * 65)
        print(" SUBMISSION EVIDENCE:")
        print(f" PR URL:       {sub_dict.get('pr_url')}")
        print(f" Commit SHA:   {sub_dict.get('commit_sha')}")
        print(f" Evidence URL: {sub_dict.get('evidence_url')}")
        print(f" Digest:       {sub_dict.get('evidence_digest')}")
        print(f" Summary:      {sub_dict.get('summary')}")

    if verif_dict.get("verdict") and verif_dict.get("verdict") != "PENDING":
        print("-" * 65)
        print(" GENLAYER VERIFICATION RESULT:")
        print(f" Verdict:      {verif_dict.get('verdict')}")
        print(f" Reason Code:  {verif_dict.get('reason')}")
        print(f" Diagnostics:  {verif_dict.get('diagnostics')}")
    print("=" * 65 + "\n")


def main():
    sample_bounty = {
        "bounty_id": 0,
        "title": "Fix websocket reconnect backoff logic in simulator core",
        "repository_url": "https://github.com/genlayerlabs/genlayer-simulator",
        "issue_url": "https://github.com/genlayerlabs/genlayer-simulator/issues/104",
        "required_scope": "Core websocket connection resilience without breaking simulation event stream.",
        "maintainer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "contributor": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "reward_wei": "2500000000000000000",
        "deadline_seconds": 1209600,
        "status": 3,
    }
    sample_sub = {
        "pr_url": "https://github.com/genlayerlabs/genlayer-simulator/pull/112",
        "commit_sha": "d4f3a2b1c0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5",
        "evidence_url": "https://raw.githubusercontent.com/genlayerlabs/genlayer-simulator/main/evidence.json",
        "evidence_digest": "4a5b6c7d8e9f...",
        "summary": "Implemented exponential backoff with jitter on reconnect",
    }
    sample_verif = {
        "verdict": "APPROVED",
        "reason": "PR_MERGED_AND_SCOPE_VERIFIED",
        "diagnostics": '{"repository_match":"PASS","issue_match":"PASS","merged":"PASS","scope_match":"PASS"}',
    }
    print_formatted_bounty(sample_bounty, sample_sub, sample_verif)


if __name__ == "__main__":
    main()
