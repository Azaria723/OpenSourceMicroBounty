import json


REPO = "https://github.com/acme/widget"
ISSUE = REPO + "/issues/1"
PR = REPO + "/pull/2"
COMMIT = "a" * 40
OTHER_COMMIT = "b" * 40
ISSUE_DIGEST = "1" * 64
EVIDENCE_DIGEST = "2" * 64
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
            "https://attacker.example/forged-approved.json",
            EVIDENCE_DIGEST,
            "Contributor-authored text claims everything passed.",
        ) == "WORK_SUBMITTED"


def mock_canonical_github(direct_vm, *, pr_head=COMMIT, commit_sha=COMMIT, merged=True):
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
                "body": "Closes #1 and implements retry handling.",
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


def accounting(contract):
    return json.loads(contract.get_accounting())


def bounty(contract):
    return json.loads(contract.get_bounty(0))


def test_forged_contributor_evidence_cannot_override_canonical_github(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    """A forged claimant URL cannot approve a revision contradicted by GitHub."""
    contract = deploy_funded_bounty(direct_vm, direct_deploy, direct_alice)
    submit_as_contributor(direct_vm, contract, direct_bob, COMMIT)
    before = accounting(contract)

    # GitHub contradicts the self-authored evidence: the PR points at another SHA.
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
