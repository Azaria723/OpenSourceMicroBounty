import pytest


class MockBountyContract:
    def __init__(self):
        self.bounties = {}
        self.total_escrowed = 0
        self.total_paid = 0
        self.total_refunded = 0
        self.contract_balance = 0

    def create_bounty(self, bounty_id: int, maintainer: str, reward: int):
        assert reward > 0
        self.bounties[bounty_id] = {
            "maintainer": maintainer,
            "contributor": None,
            "reward": reward,
            "status": 0,  # OPEN
        }
        self.total_escrowed += reward
        self.contract_balance += reward

    def claim_bounty(self, bounty_id: int, contributor: str):
        b = self.bounties[bounty_id]
        assert b["status"] == 0
        assert contributor != b["maintainer"]
        b["contributor"] = contributor
        b["status"] = 1  # CLAIMED

    def submit_work(self, bounty_id: int, caller: str):
        b = self.bounties[bounty_id]
        assert b["status"] == 1
        assert caller == b["contributor"]
        b["status"] = 2  # SUBMITTED

    def set_verified(self, bounty_id: int, approved: bool):
        b = self.bounties[bounty_id]
        assert b["status"] == 2
        b["status"] = 3 if approved else 5  # 3: APPROVED, 5: REJECTED

    def pay_contributor(self, bounty_id: int, caller: str) -> int:
        b = self.bounties[bounty_id]
        assert b["status"] == 3  # Must be APPROVED
        assert caller in [b["maintainer"], b["contributor"]]
        reward = b["reward"]
        assert reward > 0
        assert self.contract_balance >= reward

        b["status"] = 4  # PAID
        b["reward"] = 0
        self.total_paid += reward
        self.contract_balance -= reward
        return reward

    def refund_bounty(self, bounty_id: int, caller: str) -> int:
        b = self.bounties[bounty_id]
        assert b["status"] in [0, 1, 2, 5, 7, 8, 9]
        assert caller == b["maintainer"]
        reward = b["reward"]
        assert reward > 0
        assert self.contract_balance >= reward

        b["status"] = 6  # REFUNDED
        b["reward"] = 0
        self.total_refunded += reward
        self.contract_balance -= reward
        return reward

    def assert_accounting_conservation(self):
        active_locked = sum(b["reward"] for b in self.bounties.values())
        assert self.contract_balance == active_locked
        assert self.total_escrowed == (self.total_paid + self.total_refunded + self.contract_balance)


def test_happy_path_payout_and_accounting():
    sys = MockBountyContract()
    sys.create_bounty(0, "0xMaintainer", 1000)
    sys.claim_bounty(0, "0xContributor")
    sys.submit_work(0, "0xContributor")
    sys.set_verified(0, approved=True)

    sys.assert_accounting_conservation()
    payout = sys.pay_contributor(0, "0xContributor")
    assert payout == 1000
    assert sys.contract_balance == 0
    assert sys.total_paid == 1000
    sys.assert_accounting_conservation()


def test_refund_path_and_accounting():
    sys = MockBountyContract()
    sys.create_bounty(1, "0xMaintainer", 2500)
    sys.claim_bounty(1, "0xContributor")
    sys.submit_work(1, "0xContributor")
    sys.set_verified(1, approved=False)  # REJECTED

    sys.assert_accounting_conservation()
    refund = sys.refund_bounty(1, "0xMaintainer")
    assert refund == 2500
    assert sys.contract_balance == 0
    assert sys.total_refunded == 2500
    sys.assert_accounting_conservation()


if __name__ == "__main__":
    pytest.main(["-v", __file__])
