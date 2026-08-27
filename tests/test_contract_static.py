import pytest


def is_valid_github_https_url(url: str) -> bool:
    if not url.startswith("https://github.com/") or len(url) > 512:
        return False
    stripped = url[19:]
    if "@" in stripped or ":" in stripped:
        return False
    return len(stripped) > 0


def is_pr_under_repo(pr_url: str, repo_url: str) -> bool:
    clean_repo = repo_url.strip().lower()
    clean_pr = pr_url.strip().lower()
    if not clean_pr.startswith(clean_repo):
        return False
    remainder = clean_pr[len(clean_repo):]
    return remainder.startswith("/pull/") or remainder.startswith("/pulls/")


def is_issue_under_repo(issue_url: str, repo_url: str) -> bool:
    clean_repo = repo_url.strip().lower()
    clean_issue = issue_url.strip().lower()
    if not clean_issue.startswith(clean_repo):
        return False
    remainder = clean_issue[len(clean_repo):]
    return remainder.startswith("/issues/") or remainder.startswith("/issue/")


def is_valid_hex_sha(sha_str: str, expected_len: int) -> bool:
    if len(sha_str) != expected_len:
        return False
    valid_chars = "0123456789abcdefABCDEF"
    return all(c in valid_chars for c in sha_str)


def test_github_repository_url_sanitization():
    assert is_valid_github_https_url("https://github.com/genlayerlabs/genlayer-simulator") is True
    # Rejects non-HTTPS
    assert is_valid_github_https_url("http://github.com/genlayerlabs/genlayer-simulator") is False
    # Rejects userinfo / credentials
    assert is_valid_github_https_url("https://github.com/@attacker/repo") is False
    # Rejects malformed
    assert is_valid_github_https_url("https://gitlab.com/other/repo") is False


def test_pr_and_issue_belong_to_registered_repo():
    repo = "https://github.com/genlayerlabs/genlayer-simulator"
    valid_issue = "https://github.com/genlayerlabs/genlayer-simulator/issues/104"
    valid_pr = "https://github.com/genlayerlabs/genlayer-simulator/pull/112"
    attacker_pr = "https://github.com/attacker/imposter-repo/pull/1"

    assert is_issue_under_repo(valid_issue, repo) is True
    assert is_pr_under_repo(valid_pr, repo) is True
    assert is_pr_under_repo(attacker_pr, repo) is False


def test_sha_commit_and_digest_formatting():
    commit_sha = "d4f3a2b1c0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5"
    digest_sha = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

    assert is_valid_hex_sha(commit_sha, 40) is True
    assert is_valid_hex_sha(digest_sha, 64) is True
    assert is_valid_hex_sha("short_commit", 40) is False
    assert is_valid_hex_sha("g4f3a2b1c0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5", 40) is False


if __name__ == "__main__":
    pytest.main(["-v", __file__])
