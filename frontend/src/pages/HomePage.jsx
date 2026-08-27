import React from 'react';
import { GitPullRequest, GitCommit, GitBranch, ArrowRight, ShieldCheck, CheckCircle2, Lock, Coins, Search, FileCode } from 'lucide-react';
import { STATUS_LABELS } from '../genlayer';

export default function HomePage({ setActiveRoute, bounties, setSelectedBountyId }) {
  const openBounties = bounties?.filter(b => b.status === 0 || b.status === 1) || [];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="pt-16 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-lavenderSoft border border-lavenderDark/50 rounded-full text-xs font-semibold text-violetAccent">
              <span className="w-2 h-2 rounded-full bg-violetAccent"></span>
              <span>Open-Source Settlement Protocol</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-deepInk tracking-tight leading-[1.1]">
              Fund the fix.<br />
              <span className="text-violetAccent">Reward the merge.</span>
            </h1>

            <p className="text-base sm:text-lg text-mutedText max-w-xl leading-relaxed">
              A transparent GEN bounty rail for open-source maintenance. Maintainers lock funds, contributors solve issues, and GenLayer consensus verifies merged GitHub pull requests on-chain.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <button
                onClick={() => setActiveRoute('/create')}
                className="px-6 py-3.5 bg-violetAccent hover:bg-violetAccent/90 text-white rounded-full text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Create a bounty</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveRoute('/bounties')}
                className="px-6 py-3.5 bg-surface hover:bg-surfaceDark text-deepInk border border-borderLine rounded-full text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Search className="w-4 h-4 text-mutedText" />
                <span>Explore open tasks</span>
              </button>
            </div>
          </div>

          {/* Right Hero Visual: Custom Git Branch Line */}
          <div className="lg:col-span-5 bg-surface p-8 rounded-2xl border border-borderLine shadow-sm space-y-6 relative overflow-hidden">
            <div className="font-mono text-xs text-mutedText uppercase tracking-widest border-b border-borderLine pb-3 flex items-center justify-between">
              <span>On-Chain Git Rail</span>
              <span className="text-violetAccent">GEN Settlement</span>
            </div>

            {/* Visual Branch Nodes */}
            <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-lavenderDark">
              {/* Node 1 */}
              <div className="relative flex items-start space-x-3">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-violetAccent ring-4 ring-surface"></div>
                <div>
                  <div className="font-bold text-xs text-deepInk">1. Issue Bountied & Locked</div>
                  <div className="text-[11px] font-mono text-mutedText">Maintainer deposits GEN into custody</div>
                </div>
              </div>

              {/* Node 2 */}
              <div className="relative flex items-start space-x-3">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-lavenderDark ring-4 ring-surface"></div>
                <div>
                  <div className="font-bold text-xs text-deepInk">2. Contributor Pull Request</div>
                  <div className="text-[11px] font-mono text-mutedText">Code submitted with SHA-256 evidence digest</div>
                </div>
              </div>

              {/* Node 3 */}
              <div className="relative flex items-start space-x-3">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-greenStatus ring-4 ring-surface"></div>
                <div>
                  <div className="font-bold text-xs text-deepInk">3. GenLayer Verification</div>
                  <div className="text-[11px] font-mono text-mutedText">Validators confirm PR merged into main repo</div>
                </div>
              </div>

              {/* Payout Badge Node */}
              <div className="p-3 bg-lavenderSoft/60 border border-lavenderDark/50 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-violetAccent" />
                  <span className="font-bold text-xs text-deepInk">Instant Payout Released</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-greenStatus text-white text-[10px] font-bold">PAID</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Why Micro-Bounties? */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        <div className="border-b border-borderLine pb-4">
          <div className="font-mono text-xs text-violetAccent uppercase tracking-wider font-semibold">The Challenge</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-deepInk tracking-tight mt-1">Why Open-Source Needs Escrow Rails</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-6 bg-surface rounded-2xl border border-borderLine space-y-3">
            <div className="w-8 h-8 rounded-full bg-lavenderSoft flex items-center justify-center text-violetAccent font-bold">01</div>
            <h3 className="font-bold text-sm text-deepInk">Uncertain Compensation</h3>
            <p className="text-mutedText leading-relaxed">
              Developers hesitate to spend hours solving critical bugs without a guarantee that bounty funds are actually reserved and liquid.
            </p>
          </div>

          <div className="p-6 bg-surface rounded-2xl border border-borderLine space-y-3">
            <div className="w-8 h-8 rounded-full bg-lavenderSoft flex items-center justify-center text-violetAccent font-bold">02</div>
            <h3 className="font-bold text-sm text-deepInk">Centralized Discretion</h3>
            <p className="text-mutedText leading-relaxed">
              Traditional bounty platforms act as centralized custodians that take hefty platform fees or hold funds indefinitely.
            </p>
          </div>

          <div className="p-6 bg-surface rounded-2xl border border-borderLine space-y-3">
            <div className="w-8 h-8 rounded-full bg-lavenderSoft flex items-center justify-center text-violetAccent font-bold">03</div>
            <h3 className="font-bold text-sm text-deepInk">Evidence Tampering</h3>
            <p className="text-mutedText leading-relaxed">
              Without cryptographic digests and on-chain verification, imposter repositories or spoofed PRs can exploit payment rails.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: What GenLayer Checks */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        <div className="border-b border-borderLine pb-4">
          <div className="font-mono text-xs text-violetAccent uppercase tracking-wider font-semibold">Consensus Specification</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-deepInk tracking-tight mt-1">What GenLayer Validators Verify</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-5 bg-surface rounded-xl border border-borderLine space-y-2">
            <div className="flex items-center space-x-2 text-violetAccent font-bold">
              <ShieldCheck className="w-4 h-4 text-greenStatus" />
              <span>Repository Match</span>
            </div>
            <p className="text-[11px] text-mutedText">The pull request belongs to the registered official repository URL.</p>
          </div>

          <div className="p-5 bg-surface rounded-xl border border-borderLine space-y-2">
            <div className="flex items-center space-x-2 text-violetAccent font-bold">
              <ShieldCheck className="w-4 h-4 text-greenStatus" />
              <span>Issue Linkage</span>
            </div>
            <p className="text-[11px] text-mutedText">The PR explicitly addresses and links to the target bountied issue.</p>
          </div>

          <div className="p-5 bg-surface rounded-xl border border-borderLine space-y-2">
            <div className="flex items-center space-x-2 text-violetAccent font-bold">
              <ShieldCheck className="w-4 h-4 text-greenStatus" />
              <span>PR Merged Status</span>
            </div>
            <p className="text-[11px] text-mutedText">The pull request has been accepted and merged into the main branch.</p>
          </div>

          <div className="p-5 bg-surface rounded-xl border border-borderLine space-y-2">
            <div className="flex items-center space-x-2 text-violetAccent font-bold">
              <ShieldCheck className="w-4 h-4 text-greenStatus" />
              <span>Scope & Digest Integrity</span>
            </div>
            <p className="text-[11px] text-mutedText">The commit changes fit the scope and match the committed SHA-256 digest.</p>
          </div>
        </div>
      </section>

      {/* Section 3: Latest Bounties */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-6">
        <div className="flex justify-between items-end border-b border-borderLine pb-4">
          <div>
            <div className="font-mono text-xs text-violetAccent uppercase tracking-wider font-semibold">Active Tasks</div>
            <h2 className="text-2xl font-bold text-deepInk tracking-tight mt-1">Open Bounties</h2>
          </div>
          <button
            onClick={() => setActiveRoute('/bounties')}
            className="text-xs font-semibold text-violetAccent hover:underline flex items-center space-x-1"
          >
            <span>View all bounties</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {openBounties.length === 0 ? (
          <div className="p-10 bg-surface rounded-2xl border border-borderLine text-center space-y-3">
            <FileCode className="w-8 h-8 text-mutedText mx-auto" />
            <h3 className="font-bold text-sm text-deepInk">No open bounties yet</h3>
            <p className="text-xs text-mutedText max-w-sm mx-auto">
              Create the first task on GenLayer Studionet and fund useful open-source code.
            </p>
            <button
              onClick={() => setActiveRoute('/create')}
              className="px-5 py-2 bg-violetAccent text-white text-xs font-semibold rounded-full shadow-xs cursor-pointer"
            >
              Create Bounty
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {openBounties.slice(0, 3).map((b) => {
              const badge = STATUS_LABELS[b.status] || { label: 'UNKNOWN', color: 'bg-surfaceDark' };
              const rewardGen = (Number(b.reward_wei || 0) / 1e18).toFixed(2);
              return (
                <div key={b.bounty_id} className="p-6 bg-surface rounded-2xl border border-borderLine space-y-4 shadow-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-mutedText">#{b.bounty_id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-deepInk line-clamp-2">{b.title}</h4>
                    <p className="text-[11px] font-mono text-mutedText truncate">{b.repository_url}</p>
                  </div>

                  <div className="pt-3 border-t border-borderLine flex justify-between items-center">
                    <div className="font-mono text-sm font-bold text-violetAccent">{rewardGen} GEN</div>
                    <button
                      onClick={() => {
                        setSelectedBountyId(b.bounty_id);
                        setActiveRoute(`/bounties/${b.bounty_id}`);
                      }}
                      className="px-3 py-1.5 bg-surfaceDark hover:bg-lavenderSoft text-deepInk rounded-full text-xs font-semibold"
                    >
                      View Task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="p-8 sm:p-12 bg-lavenderSoft/70 border border-lavenderDark/60 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold text-deepInk">Ready to fund open-source development?</h3>
            <p className="text-xs text-mutedText max-w-md">
              Create a task in minutes, lock native GEN, and let GenLayer handle automated merge verification.
            </p>
          </div>
          <button
            onClick={() => setActiveRoute('/create')}
            className="px-8 py-3.5 bg-violetAccent hover:bg-violetAccent/90 text-white rounded-full text-xs font-bold shadow-sm cursor-pointer whitespace-nowrap"
          >
            Create a Bounty Now
          </button>
        </div>
      </section>
    </div>
  );
}
