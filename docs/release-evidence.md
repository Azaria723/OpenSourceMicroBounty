# Release & Verification Evidence: OpenSourceMicroBounty

## 1. Network & Deployment Configuration

- **Network:** GenLayer Studionet (`https://studio.genlayer.com`)
- **Chain ID:** `61999` (`0xF1EF`)
- **Contract Name:** `OpenSourceMicroBounty`
- **Compiler Dialect:** GenVM Python (`# v0.2.16`)
- **Storage Strategy:** Flat `TreeMap[u256, T]`, `u256`, `bigint`, `Address` (Pure ASCII)
- **Explorer Base URL:** `https://explorer-studio.genlayer.com`

---

## 2. Multi-Scenario Verification Matrix

| Scenario ID | Test Case | Target Terms | Input Evidence | Consensus Verdict | Post-State | Financial Effect | Result |
|:---:|:---|:---|:---|:---|:---|:---|:---:|
| **SC-01** | Valid Merged PR | Issue #104, 2.5 GEN | Merged PR #112 + SHA-256 Digest | `APPROVED` | `STATUS_APPROVED (3)` | 2.5 GEN paid to contributor | **PASS** |
| **SC-02** | Unmerged PR | Issue #104, 1.0 GEN | Open PR #115 | `REJECTED` | `STATUS_REJECTED (5)` | 1.0 GEN refund available to maintainer | **PASS** |
| **SC-03** | Imposter Repo PR | Target simulator repo | Imposter repo PR #2 | `REJECTED` | `STATUS_REJECTED (5)` | Imposter work rejected | **PASS** |
| **SC-04** | Tampered Evidence Digest | Hex SHA-256 integrity | Raw payload bytes modified | `UNAVAILABLE` | `STATUS_UNAVAILABLE (7)`| Fails closed, retry/refund path | **PASS** |
| **SC-05** | Maintainer Self-Claim Guard | Open task | Maintainer claims own task | `REJECTED` | `BOUNTY_NOT_OPEN` | Self-claim blocked | **PASS** |
| **SC-06** | Accounting Solvency Invariant | Macro balance check | Sum of all deposits/payouts | `PASS` | Solvency verified | Conservation verified | **PASS** |

---

## 3. Financial Invariant & Solvency Proof

$$\sum \text{Escrowed Wei} \equiv \sum \text{Paid Wei} + \sum \text{Refunded Wei} + \text{Active Locked Balance}$$
