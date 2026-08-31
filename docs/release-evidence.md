# Studionet E2E evidence — OpenSourceMicroBounty

> Historical record: these transactions belong to a superseded contract revision. The current hardened source requires a new deployment and fresh on-chain lifecycle evidence before resubmission.

This ledger records only calls actually finalized and state actually read from the deployed contract.

## Deployment and canonical resources

- Network: GenLayer Studionet, chain ID `61999`
- Contract: `0x93f03f950aAaAaEb5677B506A134F1b04728DE85`
- Maintainer: `0x67A1A08Fc4cf7D05c859d0d3D8398a3A30B1677e`
- Contributor: `0x7C87B10a3d43F3b3551414401F8b26B9F662bAB5`
- Repository: `https://github.com/Azaria723/OpenSourceMicroBounty`
- Issue: `https://github.com/Azaria723/OpenSourceMicroBounty/issues/1`
- Merged PR: `https://github.com/Azaria723/OpenSourceMicroBounty/pull/2`
- Canonical PR head: `d8bd05a6d08d9cbbb4cf049171087f1f8e9217dd`
- Execution date: 2026-08-30

Before the run, `get_counts` returned `0` and all accounting fields were zero.

## Scenario A — contributor evidence cannot override GitHub

The contributor supplied an attacker-controlled evidence URL but claimed a real repository commit that is not the PR head or merge commit. The contract derived its own GitHub API endpoints from the registered repository, issue and PR.

| Step | Transaction | Finalized observation |
|---|---|---|
| Create bounty `0`, fund 0.01 GEN | `0xdbc00e3866f122bdf1cd084ed1619628747c5dc66ccd5b843895d902fb2d7083` | Bounty created; reward locked |
| Claim | `0xa91a24da7ef4a21d28eadc6b64038a9f4bc0891e5335f483c7cb8620a34a6828` | Contributor assigned |
| Submit forged claim | `0x7ac316a81f7d2382fd736b4a59c9cd67f9e101a0937c6d97579fc45eed02d18e` | Submitted with `https://attacker.example/forged-approved.json` |
| Verify | `0x6a45ac0b685b28f5cb3e4a3931b47524d72c1d211230303a2c205c3caa4bb42a` | `REJECTED (5)` |

Stored diagnostics after verification:

```json
{"commit_match":"FAIL","issue_match":"PASS","merged":"PASS","reason_code":"SUBMISSION_FAILED_VALIDATOR_CHECKS","repository_match":"PASS","scope_match":"PASS","verdict":"REJECTED","verdict_code":5}
```

The bounty retained `reward_wei = 10000000000000000`; adjudication did not release the forged claim.

## Scenario B — canonical approval, frozen refund and one-shot payout

| Step | Transaction | Finalized observation |
|---|---|---|
| Create bounty `1`, fund 0.01 GEN | `0x665f2fead80ed7a47a11ae09d9e4a5541b1bba7a2ebb22cf55264f5cd5f66f4d` | Bounty created; reward locked |
| Claim | `0x1b187c1427dbabb3aa7010f304aaad74ec7645bcc601878503bed3e963b1686a` | Contributor assigned |
| Submit canonical PR head | `0x562c0acffbfd004beeabfd3dfeca846ce634d0994939bbe8449e53b3a2dc5206` | Submitted |
| Verify GitHub facts | `0xa844256bac16601444288b095c7b09e72c2a39f508c61541fa3d8b4cfc944dc0` | Status became `APPROVED (3)` |
| Attempt refund after approval | `0x71aa07a27c6ef936cc6ea689eae24804f24b4186b27ac88e5b653d74613246a2` | Status stayed `3`; reward and accounting unchanged |
| Contributor payout | `0x418258de97f92380297e6868b20994c7bc931030aa573aecc56bafe76e7f4408` | Status `PAID (4)`; reward became zero |
| Replay payout | `0x8d156175e79ef6306128af24f78662c3ee566a98c2e25d9a9cf7160ba7cb6b62` | Paid state unchanged |
| Refund after payment | `0xb8098b573cc4080804cc136356184a238cbc54b6619e07a1b30f357577b1f299` | Paid state unchanged |

Immediately before and after the approved-refund attempt, accounting was identical:

```json
{"active_locked_wei":"20000000000000000","total_escrowed_wei":"20000000000000000","total_paid_wei":"0","total_refunded_wei":"0"}
```

Final state:

```json
{"bounty_count":2,"active_locked_wei":"10000000000000000","total_escrowed_wei":"20000000000000000","total_paid_wei":"10000000000000000","total_refunded_wei":"0"}
```

The remaining locked 0.01 GEN belongs to intentionally rejected bounty `0`; it was not presented as a completed payout.

## Local direct-contract verification

The on-chain run complements, rather than replaces, direct tests against `contracts/OpenSourceMicroBounty.py`:

```text
python -m pytest tests -q -p no:cacheprovider  -> 18 passed
genvm-lint check contracts/OpenSourceMicroBounty.py -> lint and validation passed
npm run build (frontend) -> passed
```

The reproducible Studionet runner is `scripts/run_studionet_security_lifecycle.mjs`. It requires private keys through environment variables; no private key is committed.
