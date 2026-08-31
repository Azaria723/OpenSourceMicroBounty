import json
import hashlib
import pytest


REPO = "https://github.com/acme/widget"
ISSUE = REPO + "/issues/1"
PR = REPO + "/pull/2"
COMMIT = "a" * 40
OTHER_COMMIT = "b" * 40
ISSUE_DIGEST = hashlib.sha256((REPO + "\n" + ISSUE + "\nretry handling").encode()).hexdigest()
EVIDENCE_URL = "https://api.github.com/repos/acme/widget/pulls/2"
EVIDENCE_DIGEST = hashlib.sha256(EVIDENCE_URL.encode()).hexdigest()
REWARD = 1_000_000_000_000_000


def deploy_funded_bounty(direct_vm, direct_deploy, maintainer):
    direct_vm.strict_mocks = True
    direct_vm.check_pickling = True
    with direct_vm.prank(maintainer):
        contract = direct_deploy("contracts/OpenSourceMicroBounty.py")
        direct_vm.value = REWARD
        bounty_id = contract.create_bounty(
            "Fix retry handling",
            "Implement bounded retries for transient failures.",
            REPO,
            ISSUE,
            ISSUE_DIGEST,
            "retry handling",
            3600,
        )
        direct_vm.value = 0
    assert bounty_id == 0
    return contract


def submit_as_contributor(direct_vm, contract, contributor, commit=COMMIT):
    with direct_vm.prank(contributor):
        assert contract.claim_bounty(0) == "BOUNTY_CLAIMED"
        assert contract.submit_work(
            0,
            PR,
            commit,
            EVIDENCE_URL,
            EVIDENCE_DIGEST,
            "Contributor-authored text claims everything passed.",
        ) == "WORK_SUBMITTED"


def mock_canonical_github(
    direct_vm, *, pr_head=COMMIT, commit_sha=COMMIT, merged=True,
    pr_body="Closes #1 and implements retry handling.", scope_match="PASS"
):
    direct_vm.mock_web(
        r"https://api\.github\.com/repos/acme/widget/pulls/2$",
        {
            "status": 200,
            "body": json.dumps({
                "html_url": PR,
                "merged": merged,
                "merge_commit_sha": pr_head,
                "head": {"sha": pr_head},
                "base": {"repo": {"html_url": REPO}},
                "title": "Fix retry handling",
                "body": pr_body,
            }),
        },
    )
    direct_vm.mock_web(
        r"https://api\.github\.com/repos/acme/widget/commits/[0-9a-f]{40}$",
        {"status": 200, "body": json.dumps({"sha": commit_sha})},
    )
    direct_vm.mock_web(
        r"https://api\.github\.com/repos/acme/widget/issues/1$",
        {"status": 200, "body": json.dumps({"html_url": ISSUE})},
    )
    direct_vm.mock_web(
        r"https://api\.github\.com/repos/acme/widget/pulls/2/files$",
        {"status": 200, "body": json.dumps([{
            "filename": "src/retry_handler.py",
            "patch": "+ add bounded retry handling",
        }])},
    )
    direct_vm.mock_llm(
        r"Assess whether the GitHub-controlled pull request evidence.*",
        json.dumps({"scope_match": scope_match}),
    )


def accounting(contract):
    return json.loads(contract.get_accounting())


def bounty(contract):
    return json.loads(contract.get_bounty(0))


def test_forged_contributor_evidence_cannot_override_canonical_github(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    """A claimant summary cannot approve a revision contradicted by GitHub."""
    contract = deploy_funded_bounty(direct_vm, direct_deploy, direct_alice)
    submit_as_contributor(direct_vm, contract, direct_bob, COMMIT)
    before = accounting(contract)

    # GitHub contradicts the claimant-authored summary: the PR points at another SHA.
    mock_canonical_github(direct_vm, pr_head=OTHER_COMMIT, commit_sha=COMMIT)
    assert int(contract.verify_work(0)) == 5

    record = bounty(contract)
    verification = json.loads(contract.get_verification(0))
    diagnostics = json.loads(verification["diagnostics"])
    after = accounting(contract)
    assert record["status"] == 5
    assert record["reward_wei"] == str(REWARD)
    assert verification["verdict"] == "REJECTED"
    assert diagnostics["commit_match"] == "FAIL"
    assert diagnostics["verdict"] == "REJECTED"
    assert after == before
    assert after["active_locked_wei"] == str(REWARD)


def test_noncanonical_evidence_locator_and_bad_binding_digests_fail_before_mutation(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = deploy_funded_bounty(direct_vm, direct_deploy, direct_alice)
    with direct_vm.prank(direct_bob):
        assert contract.claim_bounty(0) == "BOUNTY_CLAIMED"
    claimed = bounty(contract)
    with direct_vm.prank(direct_bob):
        assert contract.submit_work(
            0, PR, COMMIT, "https://attacker.example/forged.json",
            hashlib.sha256(b"https://attacker.example/forged.json").hexdigest(), "forged",
        ) == "EVIDENCE_URL_NOT_CANONICAL_GITHUB_API"
        assert contract.submit_work(
            0, PR, COMMIT, EVIDENCE_URL, "2" * 64, "bad digest",
        ) == "EVIDENCE_LOCATOR_DIGEST_MISMATCH"
    assert bounty(contract) == claimed


def test_invalid_payable_create_reverts_before_accounting_or_record_mutation(
    direct_vm, direct_deploy, direct_alice
):
    direct_vm.strict_mocks = True
    direct_vm.check_pickling = True
    with direct_vm.prank(direct_alice):
        contract = direct_deploy("contracts/OpenSourceMicroBounty.py")
    initial_counts = json.loads(contract.get_counts())
    initial_accounting = accounting(contract)

    direct_vm.value = REWARD
    with direct_vm.prank(direct_alice):
        with pytest.raises(Exception, match="INVALID_GITHUB_REPOSITORY_URL"):
            contract.create_bounty(
                "Invalid host", "Must revert attached value atomically.",
                "https://github.com.evil.example/acme/widget", ISSUE,
                ISSUE_DIGEST, "retry handling", 3600,
            )
    direct_vm.value = 0
    assert json.loads(contract.get_counts()) == initial_counts
    assert accounting(contract) == initial_accounting


def test_issue_reference_boundary_and_semantic_scope_are_consequential(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = deploy_funded_bounty(direct_vm, direct_deploy, direct_alice)
    submit_as_contributor(direct_vm, contract, direct_bob, COMMIT)
    mock_canonical_github(
        direct_vm,
        pr_body="Closes #10. Mentions retry handling without implementing it.",
        scope_match="FAIL",
    )
    assert int(contract.verify_work(0)) == 5
    diagnostics = json.loads(json.loads(contract.get_verification(0))["diagnostics"])
    assert diagnostics["issue_match"] == "FAIL"
    assert diagnostics["scope_match"] == "FAIL"
    assert diagnostics["verdict"] == "REJECTED"


def test_authoritative_source_outage_freezes_escrow_and_can_be_retried(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = deploy_funded_bounty(direct_vm, direct_deploy, direct_alice)
    submit_as_contributor(direct_vm, contract, direct_bob, COMMIT)

    # No GitHub mocks: canonical acquisition fails closed as UNAVAILABLE.
    assert int(contract.verify_work(0)) == 7
    unavailable = bounty(contract)
    unavailable_accounting = accounting(contract)
    with direct_vm.prank(direct_alice):
        assert contract.refund_bounty(0) == "REFUND_NOT_ALLOWED_IN_CURRENT_STATE"
    assert bounty(contract) == unavailable
    assert accounting(contract) == unavailable_accounting

    # Once the authoritative source recovers, the same submission is retriable.
    mock_canonical_github(direct_vm)
    assert int(contract.verify_work(0)) == 3
    assert bounty(contract)["status"] == 3


def test_approved_contract_escrow_cannot_be_refunded_and_remains_payable(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    """Approval freezes refund while preserving exactly one contributor payout."""
    contract = deploy_funded_bounty(direct_vm, direct_deploy, direct_alice)
    submit_as_contributor(direct_vm, contract, direct_bob, COMMIT)
    mock_canonical_github(direct_vm)
    assert int(contract.verify_work(0)) == 3

    approved_before = bounty(contract)
    accounting_before = accounting(contract)
    with direct_vm.prank(direct_alice):
        assert contract.refund_bounty(0) == "REFUND_NOT_ALLOWED_IN_CURRENT_STATE"

    approved_after = bounty(contract)
    accounting_after = accounting(contract)
    assert approved_after == approved_before
    assert approved_after["status"] == 3
    assert approved_after["reward_wei"] == str(REWARD)
    assert accounting_after == accounting_before
    assert accounting_after["total_refunded_wei"] == "0"
    assert accounting_after["active_locked_wei"] == str(REWARD)

    with direct_vm.prank(direct_bob):
        assert contract.pay_contributor(0) == "PAYMENT_RELEASED_TO_CONTRIBUTOR"
    paid = bounty(contract)
    final_accounting = accounting(contract)
    assert paid["status"] == 4
    assert paid["reward_wei"] == "0"
    assert final_accounting["total_paid_wei"] == str(REWARD)
    assert final_accounting["total_refunded_wei"] == "0"
    assert final_accounting["active_locked_wei"] == "0"

    with direct_vm.prank(direct_bob):
        assert contract.pay_contributor(0) == "BOUNTY_NOT_APPROVED"
    with direct_vm.prank(direct_alice):
        assert contract.refund_bounty(0) == "REFUND_NOT_ALLOWED_IN_CURRENT_STATE"


def test_only_bounty_creator_can_trigger_refund_even_when_caller_is_contract_owner(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    """Contract ownership must never grant refund authority over another user's bounty."""
    direct_vm.strict_mocks = True
    direct_vm.check_pickling = True

    # Alice deploys the protocol, but Bob independently creates and funds bounty 0.
    with direct_vm.prank(direct_alice):
        contract = direct_deploy("contracts/OpenSourceMicroBounty.py")
    direct_vm.value = REWARD
    with direct_vm.prank(direct_bob):
        assert contract.create_bounty(
            "Fix retry handling",
            "Implement bounded retries for transient failures.",
            REPO,
            ISSUE,
            ISSUE_DIGEST,
            "retry handling",
            3600,
        ) == 0
    direct_vm.value = 0

    initial_bounty = bounty(contract)
    initial_accounting = accounting(contract)
    assert initial_bounty["maintainer"].lower() != str(direct_alice).lower()

    # Neither the protocol deployer/owner nor an unrelated wallet participated.
    with direct_vm.prank(direct_alice):
        assert contract.refund_bounty(0) == "MAINTAINER_ONLY"
    assert bounty(contract) == initial_bounty
    assert accounting(contract) == initial_accounting

    with direct_vm.prank(direct_charlie):
        assert contract.refund_bounty(0) == "MAINTAINER_ONLY"
    assert bounty(contract) == initial_bounty
    assert accounting(contract) == initial_accounting

    # Only Bob, the creator/funder stored for this bounty, can trigger refund.
    with direct_vm.prank(direct_bob):
        assert contract.refund_bounty(0) == "BOUNTY_REFUNDED_TO_MAINTAINER"
    refunded = bounty(contract)
    final_accounting = accounting(contract)
    assert refunded["status"] == 6
    assert refunded["reward_wei"] == "0"
    assert final_accounting["total_refunded_wei"] == str(REWARD)
    assert final_accounting["active_locked_wei"] == "0"


def test_protocol_owner_has_no_per_bounty_approve_reject_or_payout_authority(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    """Deployment ownership must not imply participation in user-created bounties."""
    direct_vm.strict_mocks = True
    direct_vm.check_pickling = True
    with direct_vm.prank(direct_alice):
        contract = direct_deploy("contracts/OpenSourceMicroBounty.py")

    direct_vm.value = REWARD
    with direct_vm.prank(direct_bob):
        assert contract.create_bounty(
            "Fix retry handling",
            "Implement bounded retries for transient failures.",
            REPO,
            ISSUE,
            ISSUE_DIGEST,
            "retry handling",
            3600,
        ) == 0
    direct_vm.value = 0
    submit_as_contributor(direct_vm, contract, direct_charlie, COMMIT)

    submitted = bounty(contract)
    submitted_verification = json.loads(contract.get_verification(0))
    with direct_vm.prank(direct_alice):
        assert contract.reject_work(0, "owner override") == "MAINTAINER_ONLY"
    assert bounty(contract) == submitted
    assert json.loads(contract.get_verification(0)) == submitted_verification

    # Even the real maintainer cannot bypass validator adjudication.
    with direct_vm.prank(direct_bob):
        assert contract.reject_work(0, "manual bypass") == "VERIFICATION_REJECTION_REQUIRED"
    assert bounty(contract) == submitted
    assert json.loads(contract.get_verification(0)) == submitted_verification

    mock_canonical_github(direct_vm)
    assert int(contract.verify_work(0)) == 3
    approved = bounty(contract)
    approved_verification = json.loads(contract.get_verification(0))
    approved_accounting = accounting(contract)

    with direct_vm.prank(direct_alice):
        assert contract.approve_work(0) == "MAINTAINER_ONLY"
        assert contract.pay_contributor(0) == "UNAUTHORIZED"
    assert bounty(contract) == approved
    assert json.loads(contract.get_verification(0)) == approved_verification
    assert accounting(contract) == approved_accounting

    with direct_vm.prank(direct_charlie):
        assert contract.pay_contributor(0) == "PAYMENT_RELEASED_TO_CONTRIBUTOR"
    assert bounty(contract)["status"] == 4


def test_claimed_bounty_cannot_be_refunded_until_real_deadline_expiry(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    """A maintainer cannot rug a claimed bounty; expiry is time-bound and permissionless."""
    direct_vm.strict_mocks = True
    direct_vm.check_pickling = True
    direct_vm.warp("2026-08-31T00:00:00+00:00")
    with direct_vm.prank(direct_alice):
        contract = direct_deploy("contracts/OpenSourceMicroBounty.py")

    direct_vm.value = REWARD
    with direct_vm.prank(direct_bob):
        assert contract.create_bounty(
            "Fix retry handling",
            "Implement bounded retries for transient failures.",
            REPO,
            ISSUE,
            ISSUE_DIGEST,
            "retry handling",
            3600,
        ) == 0
    direct_vm.value = 0
    created = bounty(contract)
    assert created["deadline_at"] - created["created_at"] == 3600

    with direct_vm.prank(direct_charlie):
        assert contract.claim_bounty(0) == "BOUNTY_CLAIMED"
    claimed = bounty(contract)
    locked = accounting(contract)

    with direct_vm.prank(direct_bob):
        assert contract.refund_bounty(0) == "REFUND_NOT_ALLOWED_IN_CURRENT_STATE"
    assert bounty(contract) == claimed
    assert accounting(contract) == locked

    direct_vm.warp("2026-08-31T01:00:00+00:00")
    assert contract.expire_bounty(0) == "BOUNTY_DEADLINE_NOT_PASSED"
    direct_vm.warp("2026-08-31T01:00:01+00:00")
    with direct_vm.prank(direct_charlie):
        assert contract.submit_work(
            0, PR, COMMIT, EVIDENCE_URL, EVIDENCE_DIGEST, "late submission"
        ) == "BOUNTY_DEADLINE_PASSED"
    with direct_vm.prank(direct_alice):
        assert contract.expire_bounty(0) == "BOUNTY_EXPIRED"
    assert bounty(contract)["status"] == 9

    with direct_vm.prank(direct_alice):
        assert contract.refund_bounty(0) == "MAINTAINER_ONLY"
    with direct_vm.prank(direct_bob):
        assert contract.refund_bounty(0) == "BOUNTY_REFUNDED_TO_MAINTAINER"
    assert accounting(contract)["active_locked_wei"] == "0"
