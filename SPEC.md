# OpenSourceMicroBounty — Technical Specification

## 1. Executive Summary

`OpenSourceMicroBounty` is a decentralized escrow and settlement protocol on GenLayer for open-source development. Maintainers post GitHub issues and lock native GEN into contract custody. Contributors claim tasks, solve issues, and submit pull requests. GenLayer consensus validators evaluate bounded GitHub evidence (repository, issue cross-linkage, PR merged status, and scope) on-chain before releasing payments or processing refunds.

---

## 2. Escrow State Machine

```text
               ┌───────────────┐
               │     OPEN      │
               └───────┬───────┘
                       │ claim_bounty (contributor)
               ┌───────▼───────┐
               │    CLAIMED    │
               └───────┬───────┘
                       │ submit_work (PR + commit + digest)
               ┌───────▼───────┐
               │   SUBMITTED   │
               └───────┬───────┘
                       │ verify_work (GenLayer nondet consensus)
               ┌───────▼───────┐
               │ UNDER REVIEW  │
               └───────┬───────┘
     ┌─────────────────┼─────────────────┬─────────────────┐
     │                 │                 │                 │
┌────▼────┐      ┌─────▼──────┐    ┌─────▼────────┐  ┌─────▼────────┐
│APPROVED │      │  REJECTED  │    │ UNAVAILABLE  │  │  CONFLICTED  │
└────┬────┘      └─────┬──────┘    └─────┬────────┘  └─────┬────────┘
     │ pay_contributor │ refund          │ refund          │ refund
┌────▼────┐      ┌─────▼──────┐    ┌─────▼────────┐  ┌─────▼────────┐
│  PAID   │      │  REFUNDED  │    │   REFUNDED   │  │   REFUNDED   │
└─────────┘      └────────────┘    └──────────────┘  └──────────────┘
```

---

## 3. Consensus Binding Matrix

| Field | Source Origin | Persisted | Consensus Binding Mechanism | Differential Failure Effect |
|---|---|---|---|---|
| `repository_match` | GitHub Repo URL | Yes | Strict string equality inside `strict_eq` | Imposter repo $\rightarrow$ `REJECTED` |
| `issue_match` | Target Issue URL | Yes | Strict cross-reference match | Unlinked PR $\rightarrow$ `REJECTED` |
| `merged` | GitHub PR State | Yes | Strict boolean merge validation | Open / Closed unmerged $\rightarrow$ `REJECTED` |
| `scope_match` | PR diff & summary | Yes | Scope non-empty & boundary check | Out of scope $\rightarrow$ `REJECTED` |
| `digest_ok` | Raw Evidence Bytes | Yes | SHA-256 digest match | Tampered payload $\rightarrow$ `UNAVAILABLE` |

---

## 4. Balance Conservation Invariant

$$\sum \text{Escrowed Wei} \equiv \sum \text{Paid Wei} + \sum \text{Refunded Wei} + \text{Active Locked Balance}$$

- Payouts: `gl.get_contract_at(contributor).emit_transfer(value=reward)`
- Refunds: `gl.get_contract_at(maintainer).emit_transfer(value=reward)`
- Checks-Effects-Interactions pattern enforced before every external transfer.
