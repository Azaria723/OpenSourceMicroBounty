import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Play, Loader2, CheckCircle2, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { fetchOnChainBounty, fetchOnChainSubmission, fetchOnChainVerification } from '../genlayer';

export default function VerificationDeskPage({ bountyId, onVerifyWork, setActiveRoute, account }) {
  const [bounty, setBounty] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [b, s, v] = await Promise.all([
          fetchOnChainBounty(bountyId),
          fetchOnChainSubmission(bountyId),
          fetchOnChainVerification(bountyId),
        ]);
        if (b) setBounty(b);
        if (s) setSubmission(s);
        if (v) setVerification(v);
      } catch (err) {
        console.warn("VerificationDesk load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bountyId]);

  const diag = verification?.diagnostics ? (() => {
    try { return JSON.parse(verification.diagnostics); } catch { return {}; }
  })() : {};

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 space-y-8">
      {/* Navigation */}
      <button
        onClick={() => setActiveRoute(`/bounties/${bountyId}`)}
        className="inline-flex items-center space-x-1.5 text-xs font-mono text-mutedText hover:text-deepInk transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Bounty #{bountyId}</span>
      </button>

      {/* Header */}
      <div className="border-b border-borderLine pb-6">
        <div className="font-mono text-xs text-violetAccent uppercase tracking-wider font-semibold mb-1">
          GenLayer Consensus Adjudication
        </div>
        <h1 className="text-3xl font-extrabold text-deepInk tracking-tight">
          Verification Desk — Bounty #{bountyId}
        </h1>
        <p className="text-xs text-mutedText mt-1">
          Task: <span className="font-semibold text-deepInk">{bounty?.title || `Bounty #${bountyId}`}</span>
        </p>
      </div>

      {/* Verification Checklist */}
      <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-borderLine space-y-6 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-borderLine pb-3 font-bold text-sm text-deepInk">
          <ShieldCheck className="w-5 h-5 text-violetAccent" />
          <span>Consensus Validation Criteria</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
          {[
            { label: "1. Repository Identity Match", val: diag?.repository_match || "PENDING", ok: diag?.repository_match === "PASS" },
            { label: "2. Issue & PR Cross-Linkage", val: diag?.issue_match || "PENDING", ok: diag?.issue_match === "PASS" },
            { label: "3. PR Merged Confirmation", val: diag?.merged || "PENDING", ok: diag?.merged === "PASS" },
            { label: "4. Scope Consistency Check", val: diag?.scope_match || "PENDING", ok: diag?.scope_match === "PASS" },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 bg-bgMain rounded-xl border border-borderLine flex justify-between items-center">
              <span className="text-mutedText">{item.label}</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${item.ok ? 'bg-greenStatus/20 text-greenStatus' : 'bg-surfaceDark text-mutedText'}`}>
                {item.val}
              </span>
            </div>
          ))}
        </div>

        {/* Verdict Display */}
        {verification?.verdict && verification.verdict !== "PENDING" && (
          <div className="p-4 bg-lavenderSoft/50 border border-lavenderDark/40 rounded-xl space-y-1 font-mono text-xs">
            <div className="text-mutedText uppercase text-[10px]">On-Chain Consensus Verdict:</div>
            <div className="text-sm font-bold text-violetAccent">{verification.verdict}</div>
            {verification.reason && (
              <div className="text-[11px] text-mutedText">Reason: {verification.reason}</div>
            )}
          </div>
        )}

        {/* Execution Trigger */}
        <div className="pt-2">
          <button
            onClick={() => onVerifyWork(Number(bountyId))}
            className="w-full py-3.5 bg-violetAccent hover:bg-violetAccent/90 text-white rounded-full text-xs font-bold flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Run GenLayer Semantic Verification</span>
          </button>
        </div>
      </div>

      {/* Protocol Boundary Notice */}
      <div className="p-6 bg-surfaceDark rounded-2xl border border-borderLine flex items-start space-x-3 text-xs text-mutedText">
        <AlertTriangle className="w-5 h-5 text-violetAccent shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Protocol Notice:</strong> GenLayer evaluates bounded GitHub evidence directly from public repositories. It does not perform full dynamic code execution or replace maintainer judgment.
        </p>
      </div>
    </div>
  );
}
