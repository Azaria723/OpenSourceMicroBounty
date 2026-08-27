import argparse
import json


def main():
    parser = argparse.ArgumentParser(description="Refund bounty deposit to maintainer.")
    parser.add_argument("--bounty-id", type=int, default=0)
    args = parser.parse_args()

    payload = {
        "method": "refund_bounty",
        "bounty_id": args.bounty_id,
    }
    print("=== OpenSourceMicroBounty: Refund Bounty ===")
    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
