import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, Layers, ShieldCheck, Database, Code2 } from 'lucide-react';
import { CONTRACT, configured, EXPLORER_ADDRESS_URL, fetchOnChainAccounting, fetchOnChainCounts } from '../genlayer';

export default function ContractPage() {
  const [accounting, setAccounting] = useState({
    total_escrowed_wei: '0',
    total_paid_wei: '0',
    total_refunded_wei: '0',
    active_locked_wei: '0',
  });

  const [counts, setCounts] = useState({
    bounty_count: 0,
  });

  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [acc, cnt] = await Promise.all([
        fetchOnChainAccounting(),
        fetchOnChainCounts(),
      ]);
      if (acc) setAccounting(acc);
      if (cnt) setCounts(cnt);
    } catch (err) {
      console.warn("Could not read contract live accounting", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const publicMethods = [
    { name: "create_bounty", type: "PAYABLE WRITE", desc: "Instantiates a new bounty and locks native GEN into escrow custody." },
    { name: "claim_bounty", type: "WRITE", desc: "Contributor claims an open task (maintainer self-claim is forbidden)." },
    { name: "submit_work", type: "WRITE", desc: "Contributor commits PR URL, commit SHA, and SHA-256 evidence digest." },
    { name: "verify_work", type: "WRITE (NONDET)", desc: "Triggers GenLayer consensus nodes to verify live GitHub merge status." },
    { name: "approve_work", type: "WRITE", desc: "Maintainer manual confirmation hook following successful verification." },
    { name: "pay_contributor", type: "WRITE", desc: "Releases native GEN payment to contributor for approved work." },
    { name: "reject_work", type: "WRITE", desc: "Rejects unfulfilled submission and marks task as REJECTED." },
    { name: "refund_bounty", type: "WRITE", desc: "Returns locked GEN reward to maintainer upon task expiration/breach." },
    { name: "get_bounty", type: "VIEW", desc: "Returns metadata for a given Bounty ID." },
    { name: "get_submission", type: "VIEW", desc: "Returns submitted evidence URLs, commits, and digests." },
    { name: "get_verification", type: "VIEW", desc: "Returns consensus diagnostics and categorical check results." },
    { name: "get_accounting", type: "VIEW", desc: "Returns macro balance conservation totals." },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="border-b border-borderLine pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="font-mono text-xs text-violetAccent uppercase tracking-wider font-semibold mb-1">
            Smart Contract Infrastructure
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-deepInk tracking-tight">
            On-Chain Protocol Architecture
          </h1>
          <p className="text-xs text-mutedText mt-1">
            Technical parameters, accounting solvency, and public interface of OpenSourceMicroBounty.
          </p>
        </div>

        <button
          onClick={loadStats}
          disabled={loading}
          className="px-3.5 py-1.5 bg-surface hover:bg-surfaceDark border border-borderLine rounded-full font-mono text-xs text-deepInk flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-violetAccent' : 'text-mutedText'}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh On-Chain'}</span>
        </button>
      </div>

      {/* Network & Contract Pillar */}
      <div className="bg-surface border border-borderLine p-6 sm:p-8 rounded-2xl space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-borderLine pb-6">
          <div>
            <span className="font-mono text-[10px] uppercase text-mutedText font-semibold">Contract Deployment Address</span>
            <div className="font-mono text-sm sm:text-base font-bold text-deepInk break-all">
              {configured ? CONTRACT : "Configured via .env on deployment"}
            </div>
          </div>
          {configured && (
            <a
              href={EXPLORER_ADDRESS_URL}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-surfaceDark hover:bg-lavenderSoft text-deepInk border border-borderLine rounded-full text-xs font-mono font-medium inline-flex items-center space-x-1.5 transition-colors"
            >
              <span>Open on Explorer</span>
              <ExternalLink className="w-3.5 h-3.5 text-violetAccent" />
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div>
            <span className="text-mutedText uppercase text-[10px]">Network:</span>
            <div className="font-bold text-deepInk">GenLayer Studionet</div>
          </div>
          <div>
            <span className="text-mutedText uppercase text-[10px]">Chain ID:</span>
            <div className="font-bold text-deepInk">61999 (0xF1EF)</div>
          </div>
          <div>
            <span className="text-mutedText uppercase text-[10px]">Bytecode Dialect:</span>
            <div className="font-bold text-deepInk">GenVM Python (v0.2.16)</div>
          </div>
          <div>
            <span className="text-mutedText uppercase text-[10px]">Total Bounties:</span>
            <div className="font-bold text-violetAccent">{counts.bounty_count} Tasks</div>
          </div>
        </div>
      </div>

      {/* Macro Accounting Solvency */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-deepInk">Macro Accounting & Solvency</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono">
          <div className="bg-surface p-6 rounded-2xl border border-borderLine space-y-2 shadow-xs">
            <span className="text-mutedText text-xs uppercase">Total Escrowed</span>
            <div className="text-2xl font-bold text-deepInk">
              {(Number(accounting.total_escrowed_wei) / 1e18).toFixed(2)} GEN
            </div>
            <p className="text-[10px] text-mutedText">Cumulative deposits locked into contract</p>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-borderLine space-y-2 shadow-xs">
            <span className="text-mutedText text-xs uppercase">Total Disbursed (Paid)</span>
            <div className="text-2xl font-bold text-greenStatus">
              {(Number(accounting.total_paid_wei) / 1e18).toFixed(2)} GEN
            </div>
            <p className="text-[10px] text-mutedText">Released to verified contributors</p>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-borderLine space-y-2 shadow-xs">
            <span className="text-mutedText text-xs uppercase">Total Refunded</span>
            <div className="text-2xl font-bold text-roseStatus">
              {(Number(accounting.total_refunded_wei) / 1e18).toFixed(2)} GEN
            </div>
            <p className="text-[10px] text-mutedText">Returned to maintainers upon expiration</p>
          </div>
        </div>
      </div>

      {/* ABI Table */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-deepInk">Public Contract Interface (ABI)</h3>
        <div className="bg-surface border border-borderLine rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-surfaceDark/60 border-b border-borderLine text-[10px] uppercase text-mutedText">
                <th className="p-4">Method Name</th>
                <th className="p-4">Execution Type</th>
                <th className="p-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderLine/60">
              {publicMethods.map((m, idx) => (
                <tr key={idx} className="hover:bg-bgMain/60 transition-colors">
                  <td className="p-4 font-bold text-deepInk">{m.name}()</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${m.type.includes('PAYABLE') ? 'bg-violetAccent text-white' : m.type.includes('WRITE') ? 'bg-lavenderSoft text-violetAccent' : 'bg-surfaceDark text-mutedText'}`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="p-4 text-mutedText">{m.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
