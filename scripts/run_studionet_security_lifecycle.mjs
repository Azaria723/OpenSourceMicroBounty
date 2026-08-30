import { createClient } from "../frontend/node_modules/genlayer-js/dist/index.js";
import { studionet } from "../frontend/node_modules/genlayer-js/dist/chains/index.js";
import { TransactionStatus } from "../frontend/node_modules/genlayer-js/dist/types/index.js";
import { privateKeyToAccount } from "../frontend/node_modules/viem/_esm/accounts/index.js";
import { createHash } from "node:crypto";

const contract = process.env.CONTRACT_ADDRESS;
const maintainerKey = process.env.MAINTAINER_PRIVATE_KEY;
const contributorKey = process.env.CONTRIBUTOR_PRIVATE_KEY;
if (!/^0x[0-9a-fA-F]{40}$/.test(contract || "")) throw new Error("Set CONTRACT_ADDRESS");
if (!maintainerKey || !contributorKey) throw new Error("Set both lifecycle private keys");

const account = (key) => privateKeyToAccount(key.startsWith("0x") ? key : `0x${key}`);
const maintainer = account(maintainerKey);
const contributor = account(contributorKey);
const reader = createClient({ chain: studionet });
const client = (wallet) => createClient({ chain: studionet, account: wallet });
const txs = [];

const read = async (functionName, args = []) => reader.readContract({ address: contract, functionName, args });
const write = async (wallet, functionName, args = [], value) => {
  const hash = await client(wallet).writeContract({
    address: contract,
    functionName,
    args,
    ...(value === undefined ? {} : { value }),
  });
  console.log(`${functionName}: ${hash}`);
  let receipt;
  for (let attempt = 1; attempt <= 12; attempt++) {
    try {
      receipt = await reader.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED });
      break;
    } catch (error) {
      console.log(`${functionName}_receipt_retry=${attempt}:${error.shortMessage || error.message}`);
      if (attempt === 12) throw error;
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
  console.log(`${functionName}_status=${receipt.status_name || receipt.status}`);
  txs.push({ functionName, hash });
  return receipt;
};
const json = async (functionName, args = []) => JSON.parse(await read(functionName, args));
const sha256 = (text) => createHash("sha256").update(text).digest("hex");
const repo = "https://github.com/Azaria723/OpenSourceMicroBounty";
const issue = `${repo}/issues/1`;
const pr = `${repo}/pull/2`;
const canonicalHead = "d8bd05a6d08d9cbbb4cf049171087f1f8e9217dd";
const otherRealCommit = "57f7e6026832d458010fb5f5df633951f361ea83";
const scope = "canonical GitHub verification escrow refund";
const reward = BigInt(process.env.REWARD_WEI || "10000000000000000");

const createBounty = async (title) => {
  const before = await json("get_counts");
  const bountyId = BigInt(before.bounty_count);
  await write(maintainer, "create_bounty", [
    title,
    "Studionet direct-contract security lifecycle using contract-derived GitHub facts.",
    repo,
    issue,
    sha256(`${repo}:${issue}:${scope}`),
    scope,
    86400n,
  ], reward);
  return bountyId;
};

console.log(`contract=${contract}`);
console.log(`maintainer=${maintainer.address}`);
console.log(`contributor=${contributor.address}`);
console.log(`accounting_before=${await read("get_accounting")}`);

// Scenario A: claimant-authored evidence cannot override canonical GitHub facts.
let count = (await json("get_counts")).bounty_count;
const forgedId = 0n;
if (count === 0) await createBounty("Reject forged contributor evidence");
let forgedStatus = Number(await read("get_bounty_status", [forgedId]));
if (forgedStatus === 0) await write(contributor, "claim_bounty", [forgedId]);
forgedStatus = Number(await read("get_bounty_status", [forgedId]));
if (forgedStatus === 1) await write(contributor, "submit_work", [
    forgedId,
    pr,
    otherRealCommit,
    "https://attacker.example/forged-approved.json",
    sha256("claimant-authored-forged-evidence"),
    "Claimant says approved, but validators must use canonical GitHub facts.",
  ]);
forgedStatus = Number(await read("get_bounty_status", [forgedId]));
if (forgedStatus === 2) await write(contributor, "verify_work", [forgedId]);
const forgedBounty = await json("get_bounty", [forgedId]);
const forgedVerification = await json("get_verification", [forgedId]);
if (Number(forgedBounty.status) !== 5 || forgedVerification.verdict !== "REJECTED") {
  throw new Error(`Forged evidence was not rejected: ${JSON.stringify({ forgedBounty, forgedVerification })}`);
}
console.log(`forged_result=${JSON.stringify({ bounty: forgedBounty, verification: forgedVerification })}`);

// Scenario B: canonical GitHub verification approves, refund is frozen, payout is one-shot.
count = (await json("get_counts")).bounty_count;
const approvedId = 1n;
if (count === 1) await createBounty("Canonical approval and frozen refund");
let approvedStatus = Number(await read("get_bounty_status", [approvedId]));
if (approvedStatus === 0) await write(contributor, "claim_bounty", [approvedId]);
approvedStatus = Number(await read("get_bounty_status", [approvedId]));
if (approvedStatus === 1) await write(contributor, "submit_work", [
    approvedId,
    pr,
    canonicalHead,
    "https://attacker.example/ignored-claim.json",
    sha256("ignored-contributor-claim"),
    "Contract must derive repository, issue, merge, commit and scope from GitHub.",
  ]);
approvedStatus = Number(await read("get_bounty_status", [approvedId]));
if (approvedStatus === 2) await write(contributor, "verify_work", [approvedId]);
const approvedBeforeRefund = await json("get_bounty", [approvedId]);
const accountingBeforeRefund = await read("get_accounting");
if (Number(approvedBeforeRefund.status) !== 3) throw new Error(`Canonical verification did not approve: ${JSON.stringify(approvedBeforeRefund)}`);

await write(maintainer, "refund_bounty", [approvedId]);
const approvedAfterRefund = await json("get_bounty", [approvedId]);
const accountingAfterRefund = await read("get_accounting");
if (Number(approvedAfterRefund.status) !== 3 || accountingAfterRefund !== accountingBeforeRefund) {
  throw new Error("Approved refund guard changed state or accounting");
}
console.log(`refund_guard=${JSON.stringify({ before: approvedBeforeRefund, after: approvedAfterRefund, accountingBeforeRefund, accountingAfterRefund })}`);

await write(contributor, "pay_contributor", [approvedId]);
const paid = await json("get_bounty", [approvedId]);
if (Number(paid.status) !== 4 || BigInt(paid.reward_wei) !== 0n) throw new Error(`Payout state invalid: ${JSON.stringify(paid)}`);

await write(contributor, "pay_contributor", [approvedId]);
await write(maintainer, "refund_bounty", [approvedId]);
const paidAfterReplay = await json("get_bounty", [approvedId]);
if (JSON.stringify(paidAfterReplay) !== JSON.stringify(paid)) throw new Error("Replay changed paid bounty state");

console.log(`accounting_after=${await read("get_accounting")}`);
console.log(`final_counts=${await read("get_counts")}`);
console.log(`paid_result=${JSON.stringify(paidAfterReplay)}`);
console.log(`transactions=${JSON.stringify(txs)}`);
