# Direct contract regression evidence

These steward-requested regressions deploy and call `contracts/OpenSourceMicroBounty.py` itself through `genlayer-test` Direct Mode. They replace the earlier source-string forged-evidence assertion and the separate mock lifecycle implementation.

## Forged contributor evidence

The test creates a funded bounty, claims it as a contributor, and submits a self-authored HTTPS JSON URL claiming approval. Contract-derived mocked GitHub APIs then report that the pull request points at a different immutable revision.

Observed assertions:

- `verify_work(0)` returns status `5` (`REJECTED`).
- `commit_match` is `FAIL`.
- The attacker-controlled evidence URL is not authoritative.
- Reward remains locked.
- Escrow accounting is unchanged by the rejected adjudication.

## Approved escrow refund prevention

The test creates a funded bounty and mocks matching canonical repository, issue, merged pull request, commit, and changed-file API responses.

Observed assertions:

- `verify_work(0)` reaches status `3` (`APPROVED`).
- Maintainer `refund_bounty(0)` returns `REFUND_NOT_ALLOWED_IN_CURRENT_STATE`.
- Status, reward, and accounting remain exactly unchanged after the failed refund.
- Contributor payout succeeds once.
- A second payout and post-payment refund are rejected.

## Creator-bound refund authority

The regression deploys the protocol with Alice, then creates and funds bounty `0` with Bob so the protocol owner and bounty maintainer are deliberately different actors.

Observed assertions:

- Alice, the contract deployer/owner, receives `MAINTAINER_ONLY`.
- Charlie, an unrelated wallet, receives `MAINTAINER_ONLY`.
- Both rejected calls preserve the exact bounty record and accounting snapshot.
- Bob, the stored bounty creator/funder, can refund.
- Refund transfers to the fixed maintainer recipient, clears the reward, records status `6`, and conserves accounting.

## Reproduction

```powershell
python -m pytest tests/test_lifecycle.py -q -p no:cacheprovider
# 3 passed

python -m pytest tests -q -p no:cacheprovider
# 19 passed

$env:PYTHONIOENCODING='utf-8'
genvm-lint check contracts/OpenSourceMicroBounty.py
# Lint passed; Validation passed
```
