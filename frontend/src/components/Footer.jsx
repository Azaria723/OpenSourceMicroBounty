import React from 'react';
import { GitPullRequest, ExternalLink, ShieldAlert, Cpu } from 'lucide-react';
import { CONTRACT, configured, EXPLORER_ADDRESS_URL } from '../genlayer';

export default function Footer({ setActiveRoute }) {
  return (
    <footer className="border-t border-borderLine bg-surface py-12 text-xs text-mutedText">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2 text-deepInk font-bold text-sm">
              <div className="w-6 h-6 rounded-full bg-lavenderSoft flex items-center justify-center text-violetAccent">
                <GitPullRequest className="w-3.5 h-3.5" />
              </div>
              <span>OpenSourceMicroBounty</span>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-mutedText">
              Decentralized escrow settlement rail for open-source development. Maintainers lock GEN, contributors ship code, and GenLayer validators verify GitHub pull requests on-chain.
            </p>
            <div className="pt-2 font-mono text-[11px] text-mutedText">
              Deployed Contract:{' '}
              {configured ? (
                <a
                  href={EXPLORER_ADDRESS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-violetAccent hover:underline inline-flex items-center space-x-1"
                >
                  <span>{CONTRACT.slice(0, 10)}...{CONTRACT.slice(-8)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-amberStatus">Not Configured in .env</span>
              )}
            </div>
          </div>

          {/* Nav Col */}
          <div className="space-y-2">
            <div className="font-semibold text-deepInk uppercase tracking-wider text-[10px]">Navigation</div>
            <ul className="space-y-1.5 font-medium">
              <li><button onClick={() => setActiveRoute('/bounties')} className="hover:text-violetAccent">Explore Bounties</button></li>
              <li><button onClick={() => setActiveRoute('/create')} className="hover:text-violetAccent">Create a Task</button></li>
              <li><button onClick={() => setActiveRoute('/settlement')} className="hover:text-violetAccent">Settlement Desk</button></li>
              <li><button onClick={() => setActiveRoute('/activity')} className="hover:text-violetAccent">Wallet Activity</button></li>
              <li><button onClick={() => setActiveRoute('/guide')} className="hover:text-violetAccent">Protocol Guide</button></li>
              <li><button onClick={() => setActiveRoute('/contract')} className="hover:text-violetAccent">Contract ABI</button></li>
            </ul>
          </div>

          {/* Policy Col */}
          <div className="space-y-2">
            <div className="font-semibold text-deepInk uppercase tracking-wider text-[10px]">Security Boundary</div>
            <p className="text-[11px] leading-relaxed text-mutedText">
              GenLayer checks whether bounded GitHub evidence matches the task parameters. It does not replace code security audits or guarantee that software is free of bugs.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-borderLine/60 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px]">
          <div>&copy; 2026 OpenSourceMicroBounty. Built on GenLayer Studionet.</div>
          <div className="flex items-center space-x-4">
            <span>GenVM Python v0.2.16</span>
            <span>Chain ID 61999</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
