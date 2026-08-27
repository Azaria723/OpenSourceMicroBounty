import React from 'react';
import { GitPullRequest, ShieldCheck, AlertTriangle, CheckCircle2, HelpCircle, ArrowRight } from 'lucide-react';

export default function GuidePage({ setActiveRoute }) {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="border-b border-borderLine pb-6">
        <div className="font-mono text-xs text-violetAccent uppercase tracking-wider font-semibold mb-1">
          Knowledge Base
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-deepInk tracking-tight">
          Open-Source Bounty Protocol Guide
        </h1>
        <p className="text-xs text-mutedText mt-1">
          An in-depth manual on how GenLayer smart contracts verify merged pull requests and automate open-source developer compensation.
        </p>
      </div>

      {/* Section 1: How it Works */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-deepInk">1. The Micro-Bounty Mechanism</h2>
        <p className="text-xs leading-relaxed text-mutedText">
          Traditional open-source maintenance suffers from funding friction: maintainers lack automated escrow rails to incentivize external contributors, while contributors risk working on issues without guaranteed payouts.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs pt-2">
          <div className="p-4 bg-surface rounded-2xl border border-borderLine space-y-1.5">
            <div className="font-bold text-violetAccent">1. Lock Capital</div>
            <p className="text-[11px] text-mutedText">Maintainer creates a bounty task and locks native GEN in the contract.</p>
          </div>
          <div className="p-4 bg-surface rounded-2xl border border-borderLine space-y-1.5">
            <div className="font-bold text-violetAccent">2. Ship Code</div>
            <p className="text-[11px] text-mutedText">Contributor claims the issue and submits a pull request with evidence hash.</p>
          </div>
          <div className="p-4 bg-surface rounded-2xl border border-borderLine space-y-1.5">
            <div className="font-bold text-violetAccent">3. Verify & Settle</div>
            <p className="text-[11px] text-mutedText">GenLayer consensus checks merge status and unlocks payment automatically.</p>
          </div>
        </div>
      </section>

      {/* Section 2: Verification Scope */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-deepInk">2. What GenLayer Checks</h2>
        <ul className="space-y-3 font-mono text-xs text-deepInk">
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-greenStatus shrink-0 mt-0.5" />
            <span><strong>Target Repository:</strong> Verifies the pull request is hosted on the registered GitHub repo.</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-greenStatus shrink-0 mt-0.5" />
            <span><strong>Issue Cross-Reference:</strong> Confirms the pull request explicitly closes or addresses the target issue.</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-greenStatus shrink-0 mt-0.5" />
            <span><strong>Merge Confirmation:</strong> Validates that the pull request has been merged into the main codebase by a repository maintainer.</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-greenStatus shrink-0 mt-0.5" />
            <span><strong>Scope Consistency:</strong> Ensures commit changes match the registered task boundary.</span>
          </li>
        </ul>
      </section>

      {/* Section 3: Protocol Boundary */}
      <section className="p-6 sm:p-8 bg-surfaceDark rounded-2xl border border-borderLine space-y-3">
        <div className="flex items-center space-x-2 text-deepInk font-bold text-xs uppercase tracking-wider font-mono">
          <AlertTriangle className="w-4 h-4 text-violetAccent" />
          <span>Security Boundary & Non-Claims</span>
        </div>
        <p className="text-xs text-mutedText leading-relaxed">
          GenLayer consensus verifies that bounded GitHub evidence is consistent with the registered task. It does <strong>not</strong> prove that the code is secure, bug-free, or production-ready. Maintainers should thoroughly review code quality before clicking "Merge" on GitHub.
        </p>
      </section>

      {/* CTA */}
      <div className="pt-4 flex justify-center">
        <button
          onClick={() => setActiveRoute('/create')}
          className="px-8 py-3.5 bg-violetAccent hover:bg-violetAccent/90 text-white rounded-full text-xs font-bold flex items-center space-x-2 shadow-sm cursor-pointer"
        >
          <span>Create Your First Bounty</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
