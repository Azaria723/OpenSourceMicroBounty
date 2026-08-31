# Contract Design: OpenSourceMicroBounty

## 1. Policy Boundary

The contract acts strictly as an automated, evidence-bound financial escrow rail. It evaluates consistency between public GitHub events (repository, issue, pull request merged status, and commit digest) and agreed bounty terms. It does not replace code reviews or guarantee software security.

---

## 2. Threat Model & Mitigations

| Threat | Attack Vector | Contract Mitigation |
|---|---|---|
| **Self-Claim Exploitation** | Maintainer claims own bounty to fake activity | Enforces `caller != maintainer` in `claim_bounty` |
| **Imposter PR Submission** | Submitting a PR from an unrelated repository | Enforces `pr_url.startswith(repository_url)` |
| **Unmerged Work Exploitation** | Submitting an open or closed unmerged PR | Consensus validator strictly verifies `merged == true` |
| **Tampered Evidence Payload** | Changing payload bytes post-commitment | Cryptographic SHA-256 digest verification before web fetch |
| **Double Payout Replay** | Replaying payment method on an approved task | State mutates to `PAID` and reward zeroed before transfer |
| **GitHub Server Outage** | Temporary 500 error on GitHub | Routes to `UNAVAILABLE`; enables retry or maintainer refund |
| **Global Owner Refund Override** | Contract deployer refunds a bounty they did not create or fund | Removed owner override; only the bounty's stored maintainer may call `refund_bounty` |

---

## 3. Custody & Accounting Rules

- Deposits are handled through `@gl.public.write.payable` in `create_bounty`.
- Native GEN transfers use `gl.get_contract_at(recipient).emit_transfer(value=reward)`.
- Reentrancy / race condition mitigation: State is updated and reward is zeroed before any external transfer call.
- Balance conservation is guaranteed across all lifecycle states.
