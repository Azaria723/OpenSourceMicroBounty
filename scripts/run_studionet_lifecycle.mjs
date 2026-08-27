import { createClient } from "../frontend/node_modules/genlayer-js/dist/index.js";
import { studionet } from "../frontend/node_modules/genlayer-js/dist/chains/index.js";
import { TransactionStatus } from "../frontend/node_modules/genlayer-js/dist/types/index.js";
import { privateKeyToAccount } from "../frontend/node_modules/viem/_esm/accounts/index.js";
import { createHash as sha256 } from "node:crypto";

const contract = process.env.CONTRACT_ADDRESS || "0x25a47E3987c1e2150F8664Ff7Fd6204740783D50";
const maintainerKey = process.env.MAINTAINER_PRIVATE_KEY;
const contributorKey = process.env.CONTRIBUTOR_PRIVATE_KEY;
const rewardGen = process.env.REWARD_GEN || "0.1";
if (!maintainerKey || !contributorKey) throw new Error("Set MAINTAINER_PRIVATE_KEY and CONTRIBUTOR_PRIVATE_KEY");

const maintainer = privateKeyToAccount(maintainerKey.startsWith("0x") ? maintainerKey : `0x${maintainerKey}`);
const contributor = privateKeyToAccount(contributorKey.startsWith("0x") ? contributorKey : `0x${contributorKey}`);
const read = createClient({ chain: studionet });
const client = (account) => createClient({ chain: studionet, account });
const wait = async (hash) => read.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED });
const write = async (account, functionName, args, value) => {
  const hash = await client(account).writeContract({ address: contract, functionName, args, ...(value ? { value } : {}) });
  console.log(`${functionName}: ${hash}`);
  if (process.env.FIRE_AND_FORGET === "1") return hash;
  const receipt = await wait(hash);
  console.log(JSON.stringify(receipt));
  return hash;
};

const repo = "https://github.com/Azaria723/OpenSourceMicroBounty";
const issue = `${repo}/issues/1`;
const scope = "Add a deterministic evidence fixture and document the bounty lifecycle.";
const issueDigest = sha256("sha256").update(`${repo}:${issue}:${scope}`).digest("hex");
const evidenceUrl = "https://raw.githubusercontent.com/Azaria723/OpenSourceMicroBounty/main/live-bounty-demo.json";
const evidenceDigest = "f0bac694018675a3b25ebd08ede5a8113058c13016b6f8a103c03867d3cf3356";
const amount = BigInt(Math.round(Number(rewardGen) * 1e18));

console.log(`maintainer=${maintainer.address}`);
console.log(`contributor=${contributor.address}`);
console.log(`contract=${contract}`);
const bountyId = BigInt(process.env.BOUNTY_ID || "0");
let createHash = "skipped";
if (process.env.SKIP_CREATE !== "1") {
  createHash = await write(maintainer, "create_bounty", ["Improve retry handling", "Add a deterministic evidence fixture and document the bounty lifecycle.", repo, issue, issueDigest, scope, 86400n], amount);
}
if (process.env.ONLY_SETTLE !== "1") {
  await write(contributor, "claim_bounty", [bountyId]);
  await write(contributor, "submit_work", [bountyId, `${repo}/pull/2`, "0123456789abcdef0123456789abcdef01234567", evidenceUrl, evidenceDigest, "Added deterministic lifecycle evidence."]);
  await write(contributor, "verify_work", [bountyId]);
}
await write(maintainer, "approve_work", [bountyId]);
await write(maintainer, "pay_contributor", [bountyId]);
console.log(`created_tx=${createHash}`);
console.log("lifecycle complete; read get_counts/get_bounty/get_verification to confirm state");
