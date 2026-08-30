# OpenSourceMicroBounty

`OpenSourceMicroBounty` is a transparent Web3 bounty protocol on GenLayer for open-source development. Maintainers post GitHub issues and lock native GEN into escrow. Contributors claim tasks and submit merged pull requests. GenLayer consensus validators verify GitHub merge evidence on-chain before unlocking payments or processing refunds.

- Studionet contract: `0x93f03f950aAaAaEb5677B506A134F1b04728DE85`
- Verified Studionet ledger: [`docs/release-evidence.md`](docs/release-evidence.md)

---

## 1. Why GenLayer? (GenLayer Fit)

Traditional smart contracts cannot verify whether an off-chain GitHub pull request was merged into the official repository without centralized middle-man oracles.

`OpenSourceMicroBounty` leverages GenLayer's **Decentralized Web & Code Consensus**:
- Validators directly fetch and parse public GitHub PR and commit metadata over HTTPS without centralized API keys.
- Cryptographic SHA-256 evidence digests ensure submission integrity.
- Closed categorical enums (`repository_match`, `issue_match`, `merged`, `scope_match`) ensure deterministic consensus outcomes.

---

## 2. Escrow State Machine

```text
OPEN → CLAIMED → SUBMITTED → UNDER_REVIEW → APPROVED ────→ PAID (Payment Released)
                                           ↳ REJECTED ───→ REFUNDED (Capital Returned)
                                           ↳ UNAVAILABLE ─→ REFUNDED
                                           ↳ CONFLICTED ─→ REFUNDED
```

---

## 3. Project Structure

```text
G:\Genlayer Azaria\OpenSourceMicroBounty\
├── contracts\
│   └── OpenSourceMicroBounty.py    # GenLayer Intelligent Contract (Header # v0.2.16, Pure ASCII)
├── tests\
│   ├── test_contract_static.py     # Schema, sanitization & hash tests
│   ├── test_lifecycle.py           # Direct contract GitHub-forgery & escrow regressions
│   ├── test_negative.py            # Security bounds & unauthorized access tests
│   └── test_differential.py       # Single-field mutation tests
├── scripts\
│   ├── create_bounty.py            # CLI bounty creation tool
│   ├── claim_bounty.py             # CLI claim tool
│   ├── submit_work.py              # CLI submission tool
│   ├── verify_work.py              # Consensus simulation tool
│   ├── pay_contributor.py          # Settlement & payout release
│   ├── refund_bounty.py            # Maintainer refund tool
│   ├── read_state.py               # On-chain state inspector
│   ├── run_e2e.py                  # Local scenario runner
│   └── run_studionet_security_lifecycle.mjs # Real Studionet security lifecycle
├── samples\
│   ├── sample-pr-merged.json
│   ├── sample-pr-open-unmerged.json
│   ├── sample-wrong-repo.json
│   └── sample-tampered-digest.json
├── frontend\                       # 10-Page Lavender & Violet DApp
│   ├── src\
│   │   ├── components\ (Navbar, Footer, TransactionModal)
│   │   ├── pages\ (10 distinct routes: Home, Explore, Create, Detail, Submit, Verify, Settlement, Activity, Guide, Contract)
│   │   ├── genlayer.js (Zero-mock Web3 client)
│   │   └── App.jsx
│   └── package.json
├── SPEC.md
├── contract.md
├── docs\
│   └── release-evidence.md
├── requirements.txt
└── README.md
```

---

## 4. Local Testing & Verification

### Run Automated Contract Test Suite
```bash
python -m pytest tests/ -v
# Output: 18 passed
```

Two steward-requested regressions deploy and call the submitted contract itself through `genlayer-test` Direct Mode:

- A contributor submits a self-authored HTTPS evidence URL claiming approval while mocked canonical GitHub APIs bind the PR to a different commit. `verify_work` returns `REJECTED`; `commit_match` is `FAIL`; reward and accounting remain locked and unchanged.
- A canonical merged GitHub PR reaches `APPROVED`. A maintainer refund attempt returns `REFUND_NOT_ALLOWED_IN_CURRENT_STATE` with exact bounty/accounting readback unchanged. Contributor payout then succeeds exactly once; replayed payout and post-payment refund are rejected.

These are contract-level regression tests, not source-string assertions or a parallel mock lifecycle implementation.

### Run End-to-End Simulation Matrix
```bash
python scripts/run_e2e.py
# Output: 6/6 scenarios PASSED successfully!
```

### Build Frontend Application
```bash
cd frontend
npm install
npm run build
```

---

## 5. Security Boundary & Non-Claims

GenLayer checks whether bounded GitHub evidence is consistent with the registered task. It does **not** prove that the code is secure, bug-free, or production-ready. Maintainers remain responsible for final code review before merging pull requests.
