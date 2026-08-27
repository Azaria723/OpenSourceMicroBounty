import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

export const chain = studionet;

export const CONTRACT = import.meta.env.VITE_CONTRACT_ADDRESS || "";

export const configured = /^0x[a-fA-F0-9]{40}$/.test(CONTRACT);

export const EXPLORER_ADDRESS_URL = configured
  ? `https://explorer-studio.genlayer.com/address/${CONTRACT}`
  : "https://explorer-studio.genlayer.com";

export const reader = () => {
  return createClient({ chain });
};

export const writer = (userAccount) => {
  const provider = window.ethereum;
  if (!provider) {
    throw new Error("Install MetaMask or a Web3 compatible browser wallet.");
  }
  return createClient({
    chain,
    provider,
    account: userAccount,
  });
};

export const STATUS_LABELS = {
  0: { label: "OPEN", color: "bg-lavenderSoft text-violetAccent border border-lavenderDark/40" },
  1: { label: "CLAIMED", color: "bg-surfaceDark text-deepInk border border-borderLine" },
  2: { label: "SUBMITTED", color: "bg-lavenderDark/20 text-violetAccent border border-violetAccent/30" },
  3: { label: "APPROVED", color: "bg-greenStatus/20 text-greenStatus border border-greenStatus/40 font-semibold" },
  4: { label: "PAID", color: "bg-greenStatus text-white font-bold" },
  5: { label: "REJECTED", color: "bg-roseStatus/20 text-roseStatus border border-roseStatus/30" },
  6: { label: "REFUNDED", color: "bg-surfaceDark text-mutedText border border-borderLine" },
  7: { label: "UNAVAILABLE", color: "bg-amberStatus/20 text-amberStatus border border-amberStatus/30" },
  8: { label: "CONFLICTED", color: "bg-roseStatus text-white font-bold" },
  9: { label: "EXPIRED", color: "bg-surfaceDark text-mutedText" },
};

// ----------------------------------------------------------------------------
// Real On-Chain Read Methods (Zero Mock)
// ----------------------------------------------------------------------------

export async function fetchOnChainCounts() {
  if (!configured) return { bounty_count: 0 };
  try {
    const client = reader();
    const raw = await client.readContract({
      address: CONTRACT,
      functionName: "get_counts",
      args: [],
    });
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (err) {
    console.warn("fetchOnChainCounts error:", err);
    return { bounty_count: 0 };
  }
}

export async function fetchOnChainAccounting() {
  if (!configured) return {
    total_escrowed_wei: "0",
    total_paid_wei: "0",
    total_refunded_wei: "0",
    active_locked_wei: "0",
  };
  try {
    const client = reader();
    const raw = await client.readContract({
      address: CONTRACT,
      functionName: "get_accounting",
      args: [],
    });
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (err) {
    console.warn("fetchOnChainAccounting error:", err);
    return {
      total_escrowed_wei: "0",
      total_paid_wei: "0",
      total_refunded_wei: "0",
      active_locked_wei: "0",
    };
  }
}

export async function fetchOnChainBounty(bountyId) {
  if (!configured) return null;
  try {
    const client = reader();
    const raw = await client.readContract({
      address: CONTRACT,
      functionName: "get_bounty",
      args: [BigInt(bountyId)],
    });
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (err) {
    console.warn("fetchOnChainBounty error:", err);
    return null;
  }
}

export async function fetchOnChainSubmission(bountyId) {
  if (!configured) return null;
  try {
    const client = reader();
    const raw = await client.readContract({
      address: CONTRACT,
      functionName: "get_submission",
      args: [BigInt(bountyId)],
    });
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (err) {
    console.warn("fetchOnChainSubmission error:", err);
    return null;
  }
}

export async function fetchOnChainVerification(bountyId) {
  if (!configured) return null;
  try {
    const client = reader();
    const raw = await client.readContract({
      address: CONTRACT,
      functionName: "get_verification",
      args: [BigInt(bountyId)],
    });
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (err) {
    console.warn("fetchOnChainVerification error:", err);
    return null;
  }
}

export async function fetchAllOnChainBounties() {
  if (!configured) return [];
  try {
    const counts = await fetchOnChainCounts();
    const total = counts.bounty_count || 0;
    if (total === 0) return [];

    const promises = [];
    for (let i = 0; i < total; i++) {
      promises.push(fetchOnChainBounty(i));
    }
    const list = await Promise.all(promises);
    return list.filter((b) => b && b.title);
  } catch (err) {
    console.warn("fetchAllOnChainBounties error:", err);
    return [];
  }
}
