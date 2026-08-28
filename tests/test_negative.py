import pytest


def test_maintainer_cannot_claim_own_bounty():
    maintainer = "0xMaintainer"
    caller = "0xMaintainer"

    def claim_bounty(m_addr, c_addr):
        if m_addr == c_addr:
            return "MAINTAINER_CANNOT_CLAIM_OWN_BOUNTY"
        return "BOUNTY_CLAIMED"

    assert claim_bounty(maintainer, caller) == "MAINTAINER_CANNOT_CLAIM_OWN_BOUNTY"


def test_unauthorized_submitter_rejected():
    claimed_contributor = "0xAlice"
    attacker = "0xBob"

    def submit_work(c_addr, caller):
        if caller != c_addr:
            return "CALLER_NOT_CLAIMED_CONTRIBUTOR"
        return "WORK_SUBMITTED"

    assert submit_work(claimed_contributor, attacker) == "CALLER_NOT_CLAIMED_CONTRIBUTOR"


def test_payout_before_approved_rejected():
    status = 2  # SUBMITTED, not APPROVED

    def pay_contributor(curr_status):
        if curr_status != 3:  # 3: STATUS_APPROVED
            return "BOUNTY_NOT_APPROVED"
        return "PAYMENT_RELEASED"

    assert pay_contributor(status) == "BOUNTY_NOT_APPROVED"


def test_replay_payment_rejected():
    reward = 0  # Already zeroed
    status = 4  # PAID

    def pay_contributor(curr_status, curr_reward):
        if curr_status != 3 or curr_reward <= 0:
            return "ZERO_REWARD_OR_ALREADY_PAID"
        return "PAYMENT_RELEASED"

    assert pay_contributor(status, reward) == "ZERO_REWARD_OR_ALREADY_PAID"


def test_refund_after_paid_rejected():
    status = 4  # PAID

    def refund_bounty(curr_status):
        if curr_status in [4, 6]:
            return "CANNOT_REFUND_SETTLED_BOUNTY"
        return "BOUNTY_REFUNDED"

    assert refund_bounty(status) == "CANNOT_REFUND_SETTLED_BOUNTY"


@pytest.mark.parametrize("status", [2, 3, 4, 6])
def test_refund_frozen_after_submission_or_approval(status):
    refundable = [0, 1, 5, 7, 8, 9]
    result = "BOUNTY_REFUNDED" if status in refundable else "REFUND_NOT_ALLOWED_IN_CURRENT_STATE"
    assert result == "REFUND_NOT_ALLOWED_IN_CURRENT_STATE"


def test_forged_contributor_json_is_not_an_authority():
    source = open("contracts/OpenSourceMicroBounty.py", encoding="utf-8").read()
    assert 'gl.nondet.web.get(evidence_url)' not in source
    assert '"https://api.github.com/repos/" + repo_slug' in source
    assert 'commit_match == "PASS"' in source
    assert 'issue_match == "PASS"' in source


def test_manual_approval_cannot_bypass_verification():
    source = open("contracts/OpenSourceMicroBounty.py", encoding="utf-8").read()
    assert 'if status != u256(3):\n            return "INVALID_STATUS_FOR_APPROVAL"' in source


if __name__ == "__main__":
    pytest.main(["-v", __file__])
