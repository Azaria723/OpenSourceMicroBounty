import React from 'react';
import { DollarSign, RefreshCw, CheckCircle2, ArrowUpRight, Coins } from 'lucide-react';
import { STATUS_LABELS } from '../genlayer';

export default function SettlementPage({ bounties, onPayContributor, onRefundBounty, setActiveRoute, setSelectedBountyId }) {
  const approvedQueue = (bounties || []).filter(b => b.status === 3);
  const refundQueue = (bounties || []).filter(b => b.status === 1 || b.status === 5 || b.status === 7 || b.status === 8 || b.status === 9);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="border-b border-borderLine pb-6">
        <div className="font-mono text-xs text-violetAccent uppercase tracking-wider font-semibold mb-1">
          Settlement Rail
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-deepInk tracking-tight">
          Bounty Settlement & Payout Desk
        </h1>
        <p className="text-xs text-mutedText mt-1">
          Disburse earned GEN rewards to contributors for verified merged code or process guaranteed maintainer refunds.
        </p>
      </div>

      {/* Approved Queue */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-borderLine pb-3">
          <h2 className="text-xl font-bold text-deepInk flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-greenStatus"></span>
            <span>Approved Bounties Ready for Payout ({approvedQueue.length})</span>
          </h2>
          <span className="text-xs font-mono text-mutedText">Direct Native GEN Transfer</span>
        </div>

        {approvedQueue.length === 0 ? (
          <div className="p-8 bg-surface border border-borderLine rounded-2xl text-center text-xs font-mono text-mutedText">
            No bounties currently in APPROVED settlement queue.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {approvedQueue.map((b) => {
              const rewardGen = (Number(b.reward_wei || 0) / 1e18).toFixed(2);
              return (
                <div key={b.bounty_id} className="bg-surface border border-greenStatus/50 p-6 rounded-2xl space-y-4 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono text-xs text-mutedText">TASK #{b.bounty_id}</div>
                      <h3 className="font-bold text-base text-deepInk">{b.title}</h3>
                    </div>
                    <div className="font-mono text-lg font-bold text-greenStatus">{rewardGen} GEN</div>
                  </div>

                  <div className="p-3 bg-bgMain rounded-xl border border-borderLine text-xs font-mono space-y-1">
                    <div className="flex justify-between text-mutedText">
                      <span>Contributor Recipient:</span>
                      <span className="font-semibold text-deepInk">{b.contributor?.slice(0, 8)}...{b.contributor?.slice(-6)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={() => onPayContributor(b.bounty_id)}
                      className="flex-1 py-2.5 bg-greenStatus hover:bg-greenStatus/90 text-white rounded-full font-mono text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Release {rewardGen} GEN Payout</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBountyId(b.bounty_id);
                        setActiveRoute(`/bounties/${b.bounty_id}`);
                      }}
                      className="px-3 py-2 bg-surfaceDark rounded-full hover:bg-lavenderSoft text-xs font-mono"
                    >
                      <ArrowUpRight className="w-4 h-4 text-violetAccent" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Refundable Queue */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-borderLine pb-3">
          <h2 className="text-xl font-bold text-deepInk flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-roseStatus"></span>
            <span>Refund Eligible Tasks ({refundQueue.length})</span>
          </h2>
          <span className="text-xs font-mono text-mutedText">Maintainer Capital Protection</span>
        </div>

        {refundQueue.length === 0 ? (
          <div className="p-8 bg-surface border border-borderLine rounded-2xl text-center text-xs font-mono text-mutedText">
            No bounties currently pending refund claims.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {refundQueue.map((b) => {
              const rewardGen = (Number(b.reward_wei || 0) / 1e18).toFixed(2);
              const badge = STATUS_LABELS[b.status] || { label: 'UNKNOWN', color: 'bg-surfaceDark' };

              return (
                <div key={b.bounty_id} className="bg-surface border border-borderLine p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2 font-mono text-xs text-mutedText">
                        <span>TASK #{b.bounty_id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${badge.color}`}>{badge.label}</span>
                      </div>
                      <h3 className="font-bold text-base text-deepInk">{b.title}</h3>
                    </div>
                    <div className="font-mono text-lg font-bold text-deepInk">{rewardGen} GEN</div>
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={() => onRefundBounty(b.bounty_id)}
                      className="flex-1 py-2.5 bg-roseStatus hover:bg-roseStatus/90 text-white rounded-full font-mono text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Claim Refund ({rewardGen} GEN)</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBountyId(b.bounty_id);
                        setActiveRoute(`/bounties/${b.bounty_id}`);
                      }}
                      className="px-3 py-2 bg-surfaceDark rounded-full hover:bg-lavenderSoft text-xs font-mono"
                    >
                      <ArrowUpRight className="w-4 h-4 text-violetAccent" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
