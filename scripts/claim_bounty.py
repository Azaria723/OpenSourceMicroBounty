import argparse
import json


def main():
    parser = argparse.ArgumentParser(description="Claim an open bounty as contributor.")
    parser.add_argument("--bounty-id", type=int, default=0)
    parser.add_argument("--contributor", type=str, default="0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
    args = parser.parse_args()

    payload = {
        "method": "claim_bounty",
        "bounty_id": args.bounty_id,
        "caller": args.contributor,
    }
    print("=== OpenSourceMicroBounty: Claim Bounty ===")
    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
