# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

import json
import typing


class OpenSourceMicroBounty(gl.Contract):
    owner: Address
    bounty_count: u256
    total_escrowed_wei: u256
    total_paid_wei: u256
    total_refunded_wei: u256

    # Bounty Storage Maps
    bounty_titles: TreeMap[u256, str]
    bounty_descriptions: TreeMap[u256, str]
    bounty_repos: TreeMap[u256, str]
    bounty_issues: TreeMap[u256, str]
    bounty_issue_digests: TreeMap[u256, str]
    bounty_scopes: TreeMap[u256, str]
    bounty_maintainers: TreeMap[u256, Address]
    bounty_contributors: TreeMap[u256, Address]
    bounty_rewards: TreeMap[u256, u256]
    bounty_deadlines: TreeMap[u256, u256]
    bounty_created_ats: TreeMap[u256, u256]
    bounty_statuses: TreeMap[u256, u256]  # 0: OPEN, 1: CLAIMED, 2: SUBMITTED, 3: APPROVED, 4: PAID, 5: REJECTED, 6: REFUNDED, 7: UNAVAILABLE, 8: CONFLICTED, 9: EXPIRED
    bounty_nonces: TreeMap[u256, u256]

    # Submission & Verification Maps
    sub_pr_urls: TreeMap[u256, str]
    sub_commit_shas: TreeMap[u256, str]
    sub_evidence_urls: TreeMap[u256, str]
    sub_evidence_digests: TreeMap[u256, str]
    sub_summaries: TreeMap[u256, str]
    sub_submitted_ats: TreeMap[u256, u256]
    verif_verdicts: TreeMap[u256, str]
    verif_reasons: TreeMap[u256, str]
    verif_diagnostics_jsons: TreeMap[u256, str]

    def __init__(self):
        self.owner = gl.message.sender_address
        self.bounty_count = u256(0)
        self.total_escrowed_wei = u256(0)
        self.total_paid_wei = u256(0)
        self.total_refunded_wei = u256(0)

    # -------------------------------------------------------------------------
    # Internal Helpers
    # -------------------------------------------------------------------------

    def _is_valid_github_https_url(self, url: str) -> bool:
        if not url.startswith("https://github.com/") or len(url) > 512:
            return False
        stripped = url[19:]
        if "@" in stripped or ":" in stripped:
            return False
        return len(stripped) > 0

    def _is_valid_hex_sha(self, sha_str: str, expected_len: int) -> bool:
        if len(sha_str) != expected_len:
            return False
        valid_chars = "0123456789abcdefABCDEF"
        for c in sha_str:
            if c not in valid_chars:
                return False
        return True

    def _is_pr_under_repo(self, pr_url: str, repo_url: str) -> bool:
        clean_repo = repo_url.strip().lower()
        clean_pr = pr_url.strip().lower()
        if not clean_pr.startswith(clean_repo):
            return False
        remainder = clean_pr[len(clean_repo):]
        return remainder.startswith("/pull/") or remainder.startswith("/pulls/")

    def _is_issue_under_repo(self, issue_url: str, repo_url: str) -> bool:
        clean_repo = repo_url.strip().lower()
        clean_issue = issue_url.strip().lower()
        if not clean_issue.startswith(clean_repo):
            return False
        remainder = clean_issue[len(clean_repo):]
        return remainder.startswith("/issues/") or remainder.startswith("/issue/")

    def _github_repo_slug(self, repo_url: str) -> str:
        return repo_url.strip()[19:].strip("/")

    def _github_resource_number(self, resource_url: str) -> str:
        return resource_url.strip().rstrip("/").split("/")[-1]

    # -------------------------------------------------------------------------
    # Public Write Methods
    # -------------------------------------------------------------------------

    @gl.public.write.payable
    def create_bounty(
        self,
        title: str,
        description: str,
        repository_url: str,
        issue_url: str,
        issue_digest: str,
        required_scope: str,
        deadline_seconds: u256,
    ) -> typing.Any:
        maintainer = gl.message.sender_address
        reward_wei = u256(gl.message.value)

        if reward_wei <= u256(0):
            return "ATTACHED_REWARD_REQUIRED"
        if len(title) == 0 or len(title) > 256:
            return "INVALID_TITLE"
        if len(description) == 0 or len(description) > 2000:
            return "INVALID_DESCRIPTION"
        if not self._is_valid_github_https_url(repository_url):
            return "INVALID_GITHUB_REPOSITORY_URL"
        if not self._is_issue_under_repo(issue_url, repository_url):
            return "ISSUE_NOT_IN_REPOSITORY"
        if not self._is_valid_hex_sha(issue_digest, 64):
            return "INVALID_ISSUE_DIGEST"
        if len(required_scope) == 0 or len(required_scope) > 1000:
            return "INVALID_SCOPE"
        if deadline_seconds < u256(60) or deadline_seconds > u256(31536000):
            return "INVALID_DEADLINE"

        bounty_id = self.bounty_count

        self.bounty_titles[bounty_id] = title
        self.bounty_descriptions[bounty_id] = description
        self.bounty_repos[bounty_id] = repository_url.strip()
        self.bounty_issues[bounty_id] = issue_url.strip()
        self.bounty_issue_digests[bounty_id] = issue_digest.lower()
        self.bounty_scopes[bounty_id] = required_scope
        self.bounty_maintainers[bounty_id] = maintainer
        self.bounty_contributors[bounty_id] = maintainer  # Default initialized
        self.bounty_rewards[bounty_id] = reward_wei
        self.bounty_deadlines[bounty_id] = deadline_seconds
        self.bounty_created_ats[bounty_id] = u256(0)
        self.bounty_statuses[bounty_id] = u256(0)  # STATUS_OPEN
        self.bounty_nonces[bounty_id] = u256(0)

        self.sub_pr_urls[bounty_id] = ""
        self.sub_commit_shas[bounty_id] = ""
        self.sub_evidence_urls[bounty_id] = ""
        self.sub_evidence_digests[bounty_id] = ""
        self.sub_summaries[bounty_id] = ""
        self.sub_submitted_ats[bounty_id] = u256(0)
        self.verif_verdicts[bounty_id] = "PENDING"
        self.verif_reasons[bounty_id] = ""
        self.verif_diagnostics_jsons[bounty_id] = ""

        self.total_escrowed_wei = self.total_escrowed_wei + reward_wei
        self.bounty_count = bounty_id + u256(1)
        return bounty_id

    @gl.public.write
    def claim_bounty(self, bounty_id: u256) -> str:
        if bounty_id >= self.bounty_count:
            return "BOUNTY_NOT_FOUND"
        status = self.bounty_statuses.get(bounty_id, u256(99))
        if status != u256(0):  # Must be STATUS_OPEN
            return "BOUNTY_NOT_OPEN"

        caller = gl.message.sender_address
        maintainer = self.bounty_maintainers[bounty_id]
        if caller == maintainer:
            return "MAINTAINER_CANNOT_CLAIM_OWN_BOUNTY"

        self.bounty_contributors[bounty_id] = caller
        self.bounty_statuses[bounty_id] = u256(1)  # STATUS_CLAIMED
        return "BOUNTY_CLAIMED"

    @gl.public.write
    def submit_work(
        self,
        bounty_id: u256,
        pr_url: str,
        commit_sha: str,
        evidence_url: str,
        evidence_digest: str,
        summary: str,
    ) -> str:
        if bounty_id >= self.bounty_count:
            return "BOUNTY_NOT_FOUND"
        status = self.bounty_statuses.get(bounty_id, u256(99))
        if status != u256(1):  # Must be STATUS_CLAIMED
            return "BOUNTY_NOT_IN_CLAIMED_STATE"

        caller = gl.message.sender_address
        contributor = self.bounty_contributors[bounty_id]
        if caller != contributor:
            return "CALLER_NOT_CLAIMED_CONTRIBUTOR"

        repo_url = self.bounty_repos[bounty_id]
        if not self._is_pr_under_repo(pr_url, repo_url):
            return "PR_NOT_UNDER_REGISTERED_REPOSITORY"
        if not self._is_valid_hex_sha(commit_sha, 40):
            return "INVALID_COMMIT_SHA"
        if not evidence_url.startswith("https://"):
            return "INVALID_EVIDENCE_URL"
        if not self._is_valid_hex_sha(evidence_digest, 64):
            return "INVALID_EVIDENCE_DIGEST"

        self.sub_pr_urls[bounty_id] = pr_url.strip()
        self.sub_commit_shas[bounty_id] = commit_sha.strip().lower()
        self.sub_evidence_urls[bounty_id] = evidence_url.strip()
        self.sub_evidence_digests[bounty_id] = evidence_digest.strip().lower()
        self.sub_summaries[bounty_id] = summary[:500]
        self.sub_submitted_ats[bounty_id] = u256(1)

        self.bounty_statuses[bounty_id] = u256(2)  # STATUS_SUBMITTED
        old_nonce = self.bounty_nonces.get(bounty_id, u256(0))
        self.bounty_nonces[bounty_id] = old_nonce + u256(1)
        return "WORK_SUBMITTED"

    @gl.public.write
    def verify_work(self, bounty_id: u256) -> typing.Any:
        if bounty_id >= self.bounty_count:
            return "BOUNTY_NOT_FOUND"
        status = self.bounty_statuses.get(bounty_id, u256(99))
        if status != u256(2):  # Must be STATUS_SUBMITTED
            return "BOUNTY_NOT_IN_SUBMITTED_STATE"

        repo_url = self.bounty_repos[bounty_id]
        issue_url = self.bounty_issues[bounty_id]
        scope_req = self.bounty_scopes[bounty_id]
        pr_url = self.sub_pr_urls[bounty_id]
        expected_commit = self.sub_commit_shas[bounty_id]
        repo_slug = self._github_repo_slug(repo_url)
        pr_number = self._github_resource_number(pr_url)
        issue_number = self._github_resource_number(issue_url)

        def evaluate_consensus() -> str:
            repo_match = "FAIL"
            issue_match = "FAIL"
            merged_status = "FAIL"
            commit_match = "FAIL"
            scope_match = "FAIL"
            reason_code = "INITIAL"
            verdict = "REJECTED"
            verdict_code = 5  # STATUS_REJECTED

            # GitHub-controlled canonical sources are derived by the contract.
            # A contributor cannot redirect validators to self-authored JSON.
            fetch_ok = False
            try:
                pr_api = "https://api.github.com/repos/" + repo_slug + "/pulls/" + pr_number
                commit_api = "https://api.github.com/repos/" + repo_slug + "/commits/" + expected_commit
                issue_api = "https://api.github.com/repos/" + repo_slug + "/issues/" + issue_number
                files_api = pr_api + "/files"
                pr_resp = gl.nondet.web.get(pr_api)
                commit_resp = gl.nondet.web.get(commit_api)
                issue_resp = gl.nondet.web.get(issue_api)
                files_resp = gl.nondet.web.get(files_api)
                if (
                    pr_resp.status == 200 and commit_resp.status == 200
                    and issue_resp.status == 200 and files_resp.status == 200
                    and len(pr_resp.body) <= 30000 and len(commit_resp.body) <= 30000
                    and len(issue_resp.body) <= 30000 and len(files_resp.body) <= 60000
                ):
                    fetch_ok = True
                    pr_data = json.loads(pr_resp.body.decode("utf-8"))
                    commit_data = json.loads(commit_resp.body.decode("utf-8"))
                    issue_data = json.loads(issue_resp.body.decode("utf-8"))
                    files_data = json.loads(files_resp.body.decode("utf-8"))
                    canonical_repo = str(pr_data.get("base", {}).get("repo", {}).get("html_url", "")).rstrip("/").lower()
                    canonical_pr = str(pr_data.get("html_url", "")).rstrip("/").lower()
                    canonical_commit = str(commit_data.get("sha", "")).lower()
                    merge_commit = str(pr_data.get("merge_commit_sha", "")).lower()
                    head_commit = str(pr_data.get("head", {}).get("sha", "")).lower()
                    issue_html = str(issue_data.get("html_url", "")).rstrip("/").lower()
                    pr_text = (str(pr_data.get("title", "")) + " " + str(pr_data.get("body", ""))).lower()
                    scope_text = scope_req.strip().lower()
                    canonical_change_text = pr_text
                    for changed_file in files_data:
                        canonical_change_text += " " + str(changed_file.get("filename", "")).lower()
                        canonical_change_text += " " + str(changed_file.get("patch", "")).lower()

                    if canonical_repo == repo_url.rstrip("/").lower() and canonical_pr == pr_url.rstrip("/").lower():
                        repo_match = "PASS"
                    if issue_html == issue_url.rstrip("/").lower() and ("#" + issue_number) in pr_text:
                        issue_match = "PASS"
                    if pr_data.get("merged", False) is True:
                        merged_status = "PASS"
                    if canonical_commit == expected_commit and expected_commit in [head_commit, merge_commit]:
                        commit_match = "PASS"
                    scope_hits = 0
                    for scope_word in scope_text.replace(".", " ").replace(",", " ").split():
                        if len(scope_word) >= 5 and scope_word in canonical_change_text:
                            scope_hits += 1
                    if len(files_data) > 0 and scope_hits >= 2:
                        scope_match = "PASS"
            except Exception:
                fetch_ok = False

            # 2. Decision logic
            if not fetch_ok:
                verdict = "UNAVAILABLE"
                verdict_code = 7  # STATUS_UNAVAILABLE
                reason_code = "EVIDENCE_URL_UNREACHABLE_OR_TIMEOUT"
            elif (
                repo_match == "PASS"
                and issue_match == "PASS"
                and merged_status == "PASS"
                and commit_match == "PASS"
                and scope_match == "PASS"
            ):
                verdict = "APPROVED"
                verdict_code = 3  # STATUS_APPROVED
                reason_code = "PR_MERGED_AND_SCOPE_VERIFIED"
            else:
                verdict = "REJECTED"
                verdict_code = 5  # STATUS_REJECTED
                reason_code = "SUBMISSION_FAILED_VALIDATOR_CHECKS"

            diag = {
                "repository_match": repo_match,
                "issue_match": issue_match,
                "merged": merged_status,
                "commit_match": commit_match,
                "scope_match": scope_match,
                "verdict": verdict,
                "verdict_code": verdict_code,
                "reason_code": reason_code,
            }
            return json.dumps(diag, sort_keys=True, separators=(",", ":"))

        result_json_str = gl.eq_principle.strict_eq(evaluate_consensus)
        diag_data = json.loads(result_json_str)

        new_status = u256(int(diag_data["verdict_code"]))
        verdict_str = str(diag_data["verdict"])
        reason_str = str(diag_data["reason_code"])

        self.bounty_statuses[bounty_id] = new_status
        self.verif_verdicts[bounty_id] = verdict_str
        self.verif_reasons[bounty_id] = reason_str
        self.verif_diagnostics_jsons[bounty_id] = result_json_str

        return new_status

    @gl.public.write
    def approve_work(self, bounty_id: u256) -> str:
        if bounty_id >= self.bounty_count:
            return "BOUNTY_NOT_FOUND"
        maintainer = self.bounty_maintainers[bounty_id]
        if gl.message.sender_address != maintainer and gl.message.sender_address != self.owner:
            return "MAINTAINER_ONLY"

        status = self.bounty_statuses.get(bounty_id, u256(99))
        # Verification is authoritative; maintainer cannot bypass it.
        if status != u256(3):
            return "INVALID_STATUS_FOR_APPROVAL"

        self.bounty_statuses[bounty_id] = u256(3)  # STATUS_APPROVED
        self.verif_verdicts[bounty_id] = "APPROVED"
        self.verif_reasons[bounty_id] = "APPROVED_BY_MAINTAINER"
        return "WORK_APPROVED"

    @gl.public.write
    def pay_contributor(self, bounty_id: u256) -> str:
        if bounty_id >= self.bounty_count:
            return "BOUNTY_NOT_FOUND"
        status = self.bounty_statuses.get(bounty_id, u256(99))
        if status != u256(3):  # Must be STATUS_APPROVED
            return "BOUNTY_NOT_APPROVED"

        maintainer = self.bounty_maintainers[bounty_id]
        contributor = self.bounty_contributors[bounty_id]
        caller = gl.message.sender_address

        if caller != maintainer and caller != contributor and caller != self.owner:
            return "UNAUTHORIZED"

        reward = self.bounty_rewards.get(bounty_id, u256(0))
        if reward <= u256(0):
            return "ZERO_REWARD_BALANCE"

        # Checks-Effects-Interactions: Mutate state before external transfer
        self.bounty_statuses[bounty_id] = u256(4)  # STATUS_PAID
        self.bounty_rewards[bounty_id] = u256(0)
        self.total_paid_wei = self.total_paid_wei + reward

        gl.get_contract_at(contributor).emit_transfer(value=reward)
        return "PAYMENT_RELEASED_TO_CONTRIBUTOR"

    @gl.public.write
    def reject_work(self, bounty_id: u256, reason: str) -> str:
        if bounty_id >= self.bounty_count:
            return "BOUNTY_NOT_FOUND"
        maintainer = self.bounty_maintainers[bounty_id]
        if gl.message.sender_address != maintainer and gl.message.sender_address != self.owner:
            return "MAINTAINER_ONLY"

        status = self.bounty_statuses.get(bounty_id, u256(99))
        if status != u256(2) and status != u256(5):
            return "INVALID_STATUS_FOR_REJECTION"

        self.bounty_statuses[bounty_id] = u256(5)  # STATUS_REJECTED
        self.verif_verdicts[bounty_id] = "REJECTED"
        self.verif_reasons[bounty_id] = f"REJECTED: {reason[:200]}"
        return "WORK_REJECTED"

    @gl.public.write
    def refund_bounty(self, bounty_id: u256) -> str:
        if bounty_id >= self.bounty_count:
            return "BOUNTY_NOT_FOUND"
        maintainer = self.bounty_maintainers[bounty_id]
        # Contract ownership does not grant control over user-funded bounties.
        # Only the bounty's stored creator/funder can authorize its refund.
        if gl.message.sender_address != maintainer:
            return "MAINTAINER_ONLY"

        status = self.bounty_statuses.get(bounty_id, u256(99))
        # SUBMITTED and APPROVED escrow is frozen until adjudication/payout.
        if status not in [u256(0), u256(1), u256(5), u256(7), u256(8), u256(9)]:
            return "REFUND_NOT_ALLOWED_IN_CURRENT_STATE"

        reward = self.bounty_rewards.get(bounty_id, u256(0))
        if reward <= u256(0):
            return "ZERO_REWARD_BALANCE"

        # Checks-Effects-Interactions: Mutate state before transfer
        self.bounty_statuses[bounty_id] = u256(6)  # STATUS_REFUNDED
        self.bounty_rewards[bounty_id] = u256(0)
        self.total_refunded_wei = self.total_refunded_wei + reward

        gl.get_contract_at(maintainer).emit_transfer(value=reward)
        return "BOUNTY_REFUNDED_TO_MAINTAINER"

    # -------------------------------------------------------------------------
    # Public View Methods
    # -------------------------------------------------------------------------

    @gl.public.view
    def get_counts(self) -> str:
        res = {
            "bounty_count": int(self.bounty_count),
        }
        return json.dumps(res, sort_keys=True)

    @gl.public.view
    def get_accounting(self) -> str:
        res = {
            "total_escrowed_wei": str(self.total_escrowed_wei),
            "total_paid_wei": str(self.total_paid_wei),
            "total_refunded_wei": str(self.total_refunded_wei),
            "active_locked_wei": str(self.total_escrowed_wei - self.total_paid_wei - self.total_refunded_wei),
        }
        return json.dumps(res, sort_keys=True)

    @gl.public.view
    def get_bounty_status(self, bounty_id: u256) -> u256:
        if bounty_id >= self.bounty_count:
            return u256(99)
        return self.bounty_statuses.get(bounty_id, u256(0))

    @gl.public.view
    def get_bounty(self, bounty_id: u256) -> str:
        if bounty_id >= self.bounty_count:
            return "{}"
        record = {
            "bounty_id": int(bounty_id),
            "title": self.bounty_titles.get(bounty_id, ""),
            "description": self.bounty_descriptions.get(bounty_id, ""),
            "repository_url": self.bounty_repos.get(bounty_id, ""),
            "issue_url": self.bounty_issues.get(bounty_id, ""),
            "issue_digest": self.bounty_issue_digests.get(bounty_id, ""),
            "required_scope": self.bounty_scopes.get(bounty_id, ""),
            "maintainer": str(self.bounty_maintainers.get(bounty_id, "")),
            "contributor": str(self.bounty_contributors.get(bounty_id, "")),
            "reward_wei": str(self.bounty_rewards.get(bounty_id, u256(0))),
            "deadline_seconds": int(self.bounty_deadlines.get(bounty_id, u256(0))),
            "status": int(self.bounty_statuses.get(bounty_id, u256(0))),
            "nonce": int(self.bounty_nonces.get(bounty_id, u256(0))),
        }
        return json.dumps(record, sort_keys=True)

    @gl.public.view
    def get_submission(self, bounty_id: u256) -> str:
        if bounty_id >= self.bounty_count:
            return "{}"
        record = {
            "pr_url": self.sub_pr_urls.get(bounty_id, ""),
            "commit_sha": self.sub_commit_shas.get(bounty_id, ""),
            "evidence_url": self.sub_evidence_urls.get(bounty_id, ""),
            "evidence_digest": self.sub_evidence_digests.get(bounty_id, ""),
            "summary": self.sub_summaries.get(bounty_id, ""),
            "submitted_at": int(self.sub_submitted_ats.get(bounty_id, u256(0))),
        }
        return json.dumps(record, sort_keys=True)

    @gl.public.view
    def get_verification(self, bounty_id: u256) -> str:
        if bounty_id >= self.bounty_count:
            return "{}"
        record = {
            "verdict": self.verif_verdicts.get(bounty_id, "PENDING"),
            "reason": self.verif_reasons.get(bounty_id, ""),
            "diagnostics": self.verif_diagnostics_jsons.get(bounty_id, "{}"),
        }
        return json.dumps(record, sort_keys=True)
