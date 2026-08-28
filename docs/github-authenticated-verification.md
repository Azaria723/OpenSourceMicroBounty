# GitHub-authenticated verification

This change documents the hardened bounty verification path requested during steward review.

Validators derive repository, issue, pull-request, commit, merge, changed-file, patch, and scope facts from canonical `api.github.com` endpoints. Contributor-authored JSON is retained only as an optional supporting artifact and is never an approval authority.

Escrow safety is also tightened: submitted and approved bounties remain frozen, so a maintainer cannot refund an approved bounty before contributor payout.
