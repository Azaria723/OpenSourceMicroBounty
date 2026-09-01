# Hardened Studionet lifecycle evidence

Date: 2026-09-01

Network: GenLayer Studionet (`61999`)

Contract: [`0x213B16f1F49934f6E964cB26C22a78F13028fecB`](https://explorer-studio.genlayer.com/address/0x213B16f1F49934f6E964cB26C22a78F13028fecB)

Source commit: [`d074e1259e8d9b89f2bf8a1f0adcaaa2951ff4bb`](https://github.com/Azaria723/OpenSourceMicroBounty/commit/d074e1259e8d9b89f2bf8a1f0adcaaa2951ff4bb)

## Actors and custody

- Bounty creator/funder: `0x67A1A08Fc4cf7D05c859d0d3D8398a3A30B1677e`
- Contributor: `0x7C87B10a3d43F3b3551414401F8b26B9F662bAB5`
- Escrow: `0.001 GEN` (`1000000000000000` wei)
- Bounty: `0`

## Finalized lifecycle transactions

| Check | Transaction | Verified result |
|---|---|---|
| Create and fund | [`0xf9dc...d18b9`](https://explorer-studio.genlayer.com/transactions/0xf9dc1698b2babe3e072ee9a9f85c0a57d14abe911f2bac349832d5013d3d18b9) | Bounty `0`; `0.001 GEN` locked |
| Claim | [`0xf440...82637`](https://explorer-studio.genlayer.com/transactions/0xf440f6db8c0a35b4099c03d959a5d40d6f91aa71968c46b3dc4546c080582637) | Contributor fixed on bounty |
| Refund while claimed | [`0x3e10...6c4f9`](https://explorer-studio.genlayer.com/transactions/0x3e10cc7b4f21c499ad90ce5ad354e264ddf49cd6534390e02b9938929e36c4f9) | Rejected by state guard; exact state/accounting unchanged |
| Submit canonical PR | [`0x052e...1411d`](https://explorer-studio.genlayer.com/transactions/0x052e8e6775f11ddf7151e24f1cb6b845e0cc11af6ad0f6decb4a0443eda1411d) | GitHub API locator and SHA-256 identity binding stored |
| Validator verification | [`0xaff3...31a52`](https://explorer-studio.genlayer.com/transactions/0xaff349d651ab6f8f9f952410b49e4abb833cbf8fb93a54a277da027574631a52) | `APPROVED`; repository, issue, merge, commit and scope all `PASS` |
| Refund while approved | [`0x93ec...8585`](https://explorer-studio.genlayer.com/transactions/0x93ecbaf568ccd349625a953afa3f74cc1d85b29a25b4acd8410879beaf048585) | Rejected by state guard; exact state/accounting unchanged |
| Payout | [`0xad1c...c9f2`](https://explorer-studio.genlayer.com/transactions/0xad1c675a9c1f3e227c2424fd4076e4c3105c81fe36620f7e05ae8cfe5301c9f2) | `0.001 GEN` released to contributor |
| Replay payout | [`0x3098...8aa4`](https://explorer-studio.genlayer.com/transactions/0x3098fcb548b0e2fbb6e737759c623d709f74d966733c010f4b8a7b8e66708aa4) | Rejected; no second transfer |
| Refund after payout | [`0x8c2d...6f8a`](https://explorer-studio.genlayer.com/transactions/0x8c2d93829bb57cc27b8ef6af3bf938501e4805031d9c8b500cb361b894ea6f8a) | Rejected; paid state unchanged |

## Consensus readback

```json
{
  "commit_match": "PASS",
  "issue_match": "PASS",
  "merged": "PASS",
  "reason_code": "PR_MERGED_AND_SCOPE_VERIFIED",
  "repository_match": "PASS",
  "scope_match": "PASS",
  "verdict": "APPROVED",
  "verdict_code": 3
}
```

## Final custody readback

```json
{
  "bounty_status": 4,
  "reward_wei": "0",
  "active_locked_wei": "0",
  "total_escrowed_wei": "1000000000000000",
  "total_paid_wei": "1000000000000000",
  "total_refunded_wei": "0"
}
```

The transaction status alone is not used as proof. Each negative call is paired with on-chain state and accounting readback showing no unauthorized mutation or transfer.
