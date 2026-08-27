import argparse
import json


def main():
    parser = argparse.ArgumentParser(description="Release payment to contributor for approved work.")
    parser.add_argument("--bounty-id", type=int, default=0)
    args = parser.parse_args()

    payload = {
        "method": "pay_contributor",
        "bounty_id": args.bounty_id,
    }
    print("=== OpenSourceMicroBounty: Pay Contributor ===")
    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
