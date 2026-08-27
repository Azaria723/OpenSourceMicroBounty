import pytest


def derive_consensus_verdict(repo_match: str, issue_match: str, merged: str, scope_match: str, fetch_ok: bool = True) -> str:
    if not fetch_ok:
        return "UNAVAILABLE"
    if (
        repo_match == "PASS"
        and issue_match == "PASS"
        and merged == "PASS"
        and scope_match == "PASS"
    ):
        return "APPROVED"
    return "REJECTED"


def test_baseline_all_pass_yields_approved():
    assert derive_consensus_verdict("PASS", "PASS", "PASS", "PASS", True) == "APPROVED"


def test_differential_field_mutations():
    # Mutate repo_match -> FAIL
    assert derive_consensus_verdict("FAIL", "PASS", "PASS", "PASS", True) == "REJECTED"

    # Mutate issue_match -> FAIL
    assert derive_consensus_verdict("PASS", "FAIL", "PASS", "PASS", True) == "REJECTED"

    # Mutate merged -> FAIL
    assert derive_consensus_verdict("PASS", "PASS", "FAIL", "PASS", True) == "REJECTED"

    # Mutate scope_match -> FAIL
    assert derive_consensus_verdict("PASS", "PASS", "PASS", "FAIL", True) == "REJECTED"


def test_network_unreachable_yields_unavailable():
    assert derive_consensus_verdict("PASS", "PASS", "PASS", "PASS", fetch_ok=False) == "UNAVAILABLE"


if __name__ == "__main__":
    pytest.main(["-v", __file__])
