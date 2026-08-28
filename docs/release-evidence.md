# Studionet release evidence

This document records only tests actually executed against the deployed revision.

## Deployment

- Network: GenLayer Studionet, chain ID `61999`
- Contract: `0x6428a731aEfB3C1611A864eb455408550FcF8159`
- GitHub issue: `https://github.com/Azaria723/OpenSourceMicroBounty/issues/1`
- Merged pull request: `https://github.com/Azaria723/OpenSourceMicroBounty/pull/2`
- Merge commit: `0fdaccecf5f56a9ba0efa20789022751a1933776`

## Canonical verification lifecycle — bounty 0

| Step | Transaction | Observed result |
|---|---|---|
| Create with 0.1 GEN | `0x4700f3755ea9be861739e50e101a6f773fa3044ed862fe01f1711cfa68663046` | Bounty `0` |
| Claim | `0x0c80cbfd9d21145c2fe69aec0c8e799289d1dab3c82cc3debc2565c23a999988` | Claimed |
| Submit | `0xed2cb0b00c60067d8f4755849c043a9351eeead92667add75d464db4c6717679` | Submitted |
| Verify | `0x81bf5ebb97edcc7deca7297805cf783690a4164d259445cc2a5b59a10e2e793b` | `APPROVED` |
| Approve acknowledgement | `0x17474b6d53963b40dbb59c82f234e2dbcc867bea8b3e5f06a09b6585c7b81518` | `WORK_APPROVED` |
| Pay contributor | `0x8e422b45468c19049523f2d07baa306427297fb04ca9eb07f1fd897787dfa6c6` | Payment released |

Stored diagnostics were observed as `PASS` for repository, issue linkage, merged state, commit identity, and scope. Final state was `PAID (4)` with `reward_wei = 0`.

## Approved-refund guard

- Bounty `2` was observed in `APPROVED (3)` with `100000000000000000` wei locked.
- Refund attempt: `0x43f38b6701c6d1c5e265bfc468c756b4f0b58a5829b311c5387db98604254ba5`
- Return value: `REFUND_NOT_ALLOWED_IN_CURRENT_STATE`
- Consensus: `MAJORITY_AGREE`; transaction finalized.
- A later payout settled the bounty; the rejected refund did not move funds.

## Local verification

- Python contract tests: `20 passed`
- Python AST parse: passed
- Frontend production build: passed

The issue, PR, and commit above are repository-controlled GitHub resources. Contributor-authored JSON is not used as the approval authority in this revision.
