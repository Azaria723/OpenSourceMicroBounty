import React, { useState } from 'react';
import { Wallet, History, ArrowUpRight } from 'lucide-react';
import { STATUS_LABELS } from '../genlayer';

export default function ActivityPage({ bounties, account, setActiveRoute, setSelectedBountyId }) {
  const [roleFilter, setRoleFilter] = useState('ALL');

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-lavenderSoft flex items-center justify-center mx-auto text-violetAccent">
          <Wallet className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-deepInk">Wallet Not Connected</h2>
        <p className="text-xs text-mutedText max-w-sm mx-auto">
          Please connect your MetaMask or Web3 browser wallet in the top navigation to view your bounty activity.
        </p>
      </div>
    );
  }

  const myBounties = (bounties || []).filter((b) => {
    const isMaintainer = b.maintainer?.toLowerCase() === account.toLowerCase();
    const isContributor = b.contributor?.toLowerCase() === account.toLowerCase();

    if (roleFilter === 'MAINTAINER') return isMaintainer;
    if (roleFilter === 'CONTRIBUTOR') return isContributor;
    return isMaintainer || isContributor;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-borderLine pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="font-mono text-xs text-violetAccent uppercase tracking-wider font-semibold mb-1">
            Account Activity Ledger
          </div>
          <h1 className="text-3xl font-extrabold text-deepInk tracking-tight">
            My Bounty Transactions
          </h1>
          <div className="font-mono text-xs text-mutedText mt-1">
            Address: <span className="text-deepInk font-semibold">{account}</span>
          </div>
        </div>

        {/* Role Filters */}
        <div className="flex items-center space-x-1.5 bg-surface p-1.5 rounded-full border border-borderLine text-xs font-mono">
          {['ALL', 'MAINTAINER', 'CONTRIBUTOR'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                roleFilter === r
                  ? 'bg-violetAccent text-white font-semibold'
                  : 'text-mutedText hover:text-deepInk'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {myBounties.length === 0 ? (
        <div className="p-12 bg-surface border border-borderLine rounded-2xl text-center text-xs font-mono text-mutedText space-y-3">
          <History className="w-8 h-8 text-mutedText mx-auto" />
          <p>No bounty tasks associated with this wallet address under filter [{roleFilter}].</p>
        </div>
      ) : (
        <div className="bg-surface border border-borderLine rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-surfaceDark/60 border-b border-borderLine text-[10px] uppercase text-mutedText">
                <th className="p-4">Task ID</th>
                <th className="p-4">Role</th>
                <th className="p-4">Title / Repository</th>
                <th className="p-4">Reward</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderLine/60">
              {myBounties.map((b) => {
                const isMaintainer = b.maintainer?.toLowerCase() === account.toLowerCase();
                const badge = STATUS_LABELS[b.status] || { label: 'UNKNOWN', color: 'bg-surfaceDark' };
                const rewardGen = (Number(b.reward_wei || 0) / 1e18).toFixed(2);

                return (
                  <tr key={b.bounty_id} className="hover:bg-bgMain/60 transition-colors">
                    <td className="p-4 font-bold text-deepInk">#{b.bounty_id}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isMaintainer ? 'bg-lavenderSoft text-violetAccent' : 'bg-greenStatus/20 text-greenStatus'}`}>
                        {isMaintainer ? 'MAINTAINER' : 'CONTRIBUTOR'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-deepInk">{b.title}</div>
                      <div className="text-[10px] text-mutedText">{b.repository_url?.replace('https://github.com/', '')}</div>
                    </td>
                    <td className="p-4 font-bold text-deepInk">{rewardGen} GEN</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedBountyId(b.bounty_id);
                          setActiveRoute(`/bounties/${b.bounty_id}`);
                        }}
                        className="p-1.5 bg-surfaceDark hover:bg-lavenderSoft rounded-lg text-deepInk inline-flex items-center space-x-1"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3 h-3 text-violetAccent" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
