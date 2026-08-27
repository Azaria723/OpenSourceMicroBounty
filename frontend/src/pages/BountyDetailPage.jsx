import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, GitPullRequest, GitCommit, CheckCircle2, ShieldCheck, DollarSign, RefreshCw, Lock, AlertCircle } from 'lucide-react';
import {
  STATUS_LABELS,
  fetchOnChainBounty,
  fetchOnChainSubmission,
  fetchOnChainVerification,
} from '../genlayer';

export default function BountyDetailPage({
  bountyId,
  bounties,
  setActiveRoute,
  onClaimBounty,
  onPayContributor,
  onRefundBounty,
  account,
}) {
  const [bounty, setBounty] = useState(
    bounties?.find((b) => b.bounty_id === Number(bountyId)) || {
      bounty_id: Number(bountyId),
      title: "Loading bounty task...",
      status: 0,
      reward_wei: "0",
    }
  );
  const [submission, setSubmission] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [bData, sData, vData] = await Promise.all([
          fetchOnChainBounty(bountyId),
          fetchOnChainSubmission(bountyId),
          fetchOnChainVerification(bountyId),
        ]);
        if (bData && bData.title) setBounty(bData);
        if (sData) setSubmission(sData);
        if (vData) setVerification(vData);
      } catch (err) {
        console.warn("Error fetching details for bounty", bountyId, err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [bountyId]);

  const badge = STATUS_LABELS[bounty.status] || { label: 'UNKNOWN', color: 'bg-surfaceDark' };
  const rewardGen = (Number(bounty.reward_wei || 0) / 1e18).toFixed(2);

  const isMaintainer = account && bounty.maintainer && account.toLowerCase() === bounty.maintainer.toLowerCase();
  const isContributor = account && bounty.contributor && account.toLowerCase() === bounty.contributor.toLowerCase();

  const timelineSteps = [
    { label: "OPEN", active: bounty.status >= 0 },
    { label: "CLAIMED", active: bounty.status >= 1 },
    { label: "SUBMITTED", active: bounty.status >= 2 },
    { label: bounty.status === 5 ? "REJECTED" : "APPROVED", active: bounty.status >= 3 },
    { label: bounty.status === 6 ? "REFUNDED" : "PAID", active: bounty.status === 4 || bounty.status === 6 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 space-y-10">
      {/* Navigation */}
      <button
        onClick={() => setActiveRoute('/bounties')}
        className="inline-flex items-center space-x-1.5 text-xs font-mono text-mutedText hover:text-deepInk transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Bounties List</span>
      </button>

      {/* Header Card */}
      <div className="bg-surface border border-borderLine p-6 sm:p-8 rounded-2xl space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-borderLine pb-6">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-xs font-bold text-mutedText">TASK #{bounty.bounty_id}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-deepInk mt-1">{bounty.title}</h1>
          </div>

          <div className="text-right">
            <div className="font-mono text-xs text-mutedText uppercase">Reward Locked</div>
            <div className="font-mono text-3xl font-extrabold text-violetAccent">{rewardGen} GEN</div>
          </div>
        </div>

        {/* Description & Links */}
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-deepInk leading-relaxed">{bounty.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-bgMain rounded-xl border border-borderLine">
              <div className="text-mutedText uppercase text-[10px]">Repository</div>
              <a
                href={bounty.repository_url}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-violetAccent hover:underline truncate block mt-0.5"
              >
                {bounty.repository_url}
              </a>
            </div>
            <div className="p-3 bg-bgMain rounded-xl border border-borderLine">
              <div className="text-mutedText uppercase text-[10px]">Target Issue</div>
              <a
                href={bounty.issue_url}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-violetAccent hover:underline truncate block mt-0.5"
              >
                {bounty.issue_url}
              </a>
            </div>
          </div>
        </div>

        {/* Counterparty Addresses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono pt-2 border-t border-borderLine">
          <div>
            <span className="text-mutedText text-[10px] uppercase">Maintainer:</span>
            <div className="font-semibold text-deepInk break-all">{bounty.maintainer || "N/A"}</div>
          </div>
          <div>
            <span className="text-mutedText text-[10px] uppercase">Contributor:</span>
            <div className="font-semibold text-deepInk break-all">
              {bounty.status >= 1 ? bounty.contributor : "Unclaimed (Open to all)"}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-surface border border-borderLine p-6 rounded-2xl space-y-4">
        <div className="font-mono text-xs uppercase tracking-wider text-mutedText">Lifecycle Progression</div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {timelineSteps.map((s, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl text-center border font-mono text-xs transition-all ${
                s.active
                  ? 'bg-lavenderSoft border-violetAccent text-violetAccent font-bold'
                  : 'bg-surfaceDark/50 border-borderLine text-mutedText'
              }`}
            >
              <div className="text-[10px] text-mutedText">STAGE {idx + 1}</div>
              <div>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns: Submission Evidence & Consensus Verdict */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Evidence Dossier */}
        <div className="bg-surface border border-borderLine p-6 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-deepInk uppercase tracking-wider border-b border-borderLine pb-3">
            <GitCommit className="w-4 h-4 text-violetAccent" />
            <span>Submission Evidence</span>
          </div>

          {submission?.pr_url ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-borderLine/50">
                <span className="text-mutedText">PR URL:</span>
                <a href={submission.pr_url} target="_blank" rel="noreferrer" className="text-violetAccent hover:underline truncate max-w-[200px]">
                  {submission.pr_url}
                </a>
              </div>
              <div className="flex justify-between py-1 border-b border-borderLine/50">
                <span className="text-mutedText">Commit SHA:</span>
                <span className="font-bold text-deepInk">{submission.commit_sha?.slice(0, 10)}...</span>
              </div>
              <div className="flex justify-between py-1 border-b border-borderLine/50">
                <span className="text-mutedText">Evidence Digest:</span>
                <span className="font-bold text-violetAccent text-[10px] truncate max-w-[180px]">{submission.evidence_digest}</span>
              </div>
              <div className="pt-1 text-mutedText text-[11px]">
                Summary: <span className="text-deepInk">{submission.summary}</span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs font-mono text-mutedText">
              No PR evidence submitted yet for this task.
            </div>
          )}
        </div>

        {/* Consensus Verification Panel */}
        <div className="bg-surface border border-borderLine p-6 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-deepInk uppercase tracking-wider border-b border-borderLine pb-3">
            <ShieldCheck className="w-4 h-4 text-greenStatus" />
            <span>GenLayer Consensus Verification</span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center p-2.5 bg-bgMain rounded-xl border border-borderLine">
              <span className="text-mutedText">Consensus Verdict:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${verification?.verdict === 'APPROVED' ? 'bg-greenStatus text-white' : 'bg-surfaceDark text-deepInk'}`}>
                {verification?.verdict || 'PENDING'}
              </span>
            </div>
            {verification?.reason && (
              <div className="p-3 bg-bgMain rounded-xl border border-borderLine text-[11px] text-mutedText">
                Reason Code: <span className="font-bold text-deepInk">{verification.reason}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contextual Action Bar */}
      <div className="bg-surfaceDark p-6 rounded-2xl border border-borderLine flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <div className="font-bold text-sm text-deepInk">Task Actions</div>
          <div className="text-xs text-mutedText">
            {bounty.status === 0 && "Bounty is OPEN. Anyone can claim this task."}
            {bounty.status === 1 && "Claimed. Contributor must submit PR evidence."}
            {bounty.status === 2 && "Submitted. Ready for GenLayer consensus review."}
            {bounty.status === 3 && "Approved! Release payout to contributor."}
            {(bounty.status === 5 || bounty.status === 7 || bounty.status === 8) && "Task unfulfilled. Maintainer can claim refund."}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Claim CTA */}
          {bounty.status === 0 && (
            <button
              onClick={() => onClaimBounty(bounty.bounty_id)}
              className="px-6 py-2.5 bg-violetAccent hover:bg-violetAccent/90 text-white rounded-full text-xs font-bold shadow-xs cursor-pointer"
            >
              Claim Bounty Task
            </button>
          )}

          {/* Submit Work CTA */}
          {bounty.status === 1 && (
            <button
              onClick={() => setActiveRoute(`/submit/${bounty.bounty_id}`)}
              className="px-6 py-2.5 bg-violetAccent hover:bg-violetAccent/90 text-white rounded-full text-xs font-bold shadow-xs cursor-pointer"
            >
              Submit PR Work
            </button>
          )}

          {/* Verify CTA */}
          {bounty.status === 2 && (
            <button
              onClick={() => setActiveRoute(`/verify/${bounty.bounty_id}`)}
              className="px-6 py-2.5 bg-violetAccent hover:bg-violetAccent/90 text-white rounded-full text-xs font-bold shadow-xs cursor-pointer"
            >
              Go to Verification Desk
            </button>
          )}

          {/* Pay Payout CTA */}
          {bounty.status === 3 && (
            <button
              onClick={() => onPayContributor(bounty.bounty_id)}
              className="px-6 py-2.5 bg-greenStatus hover:bg-greenStatus/90 text-white rounded-full text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              <span>Release Payout ({rewardGen} GEN)</span>
            </button>
          )}

          {/* Refund CTA */}
          {(bounty.status === 1 || bounty.status === 5 || bounty.status === 7 || bounty.status === 8) && isMaintainer && (
            <button
              onClick={() => onRefundBounty(bounty.bounty_id)}
              className="px-6 py-2.5 bg-roseStatus hover:bg-roseStatus/90 text-white rounded-full text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <span>Claim Refund ({rewardGen} GEN)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
