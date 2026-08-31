import React, { useState } from 'react';
import { ArrowLeft, GitPullRequest, GitCommit, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SubmitWorkPage({ bountyId, bounties, onSubmitWork, setActiveRoute, account }) {
  const bounty = bounties?.find(b => b.bounty_id === Number(bountyId)) || {
    bounty_id: Number(bountyId),
    title: "Task #" + bountyId,
    repository_url: "https://github.com/org/repo",
  };

  const [formData, setFormData] = useState({
    prUrl: '',
    commitSha: '',
    summary: '',
  });

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const isRepoMatch = formData.prUrl.toLowerCase().startsWith(bounty.repository_url?.toLowerCase() || '');
  const isCommitValid = /^[a-fA-F0-9]{40}$/.test(formData.commitSha.trim());
  const isCanonicalPr = /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+$/.test(formData.prUrl.trim());
  const canSubmit = isRepoMatch && isCanonicalPr && isCommitValid && formData.summary.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmitWork(Number(bountyId), formData);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 space-y-8">
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
          Contributor Delivery Portal
        </div>
        <h1 className="text-3xl font-extrabold text-deepInk tracking-tight">
          Submit PR Work for Bounty #{bountyId}
        </h1>
        <p className="text-xs text-mutedText mt-1">
          Task: <span className="font-semibold text-deepInk">{bounty.title}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface p-6 sm:p-8 rounded-2xl border border-borderLine space-y-6 shadow-sm">
        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-deepInk">Merged Pull Request HTTPS URL *</label>
            <input
              type="url"
              placeholder={`${bounty.repository_url}/pull/112`}
              value={formData.prUrl}
              onChange={(e) => handleChange('prUrl', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-bgMain border border-borderLine rounded-xl text-xs font-mono focus:outline-none focus:border-violetAccent"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-deepInk">Commit SHA (40-char Hex) *</label>
              <input
                type="text"
                placeholder="d4f3a2b1c0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5"
                value={formData.commitSha}
                onChange={(e) => handleChange('commitSha', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-bgMain border border-borderLine rounded-xl text-xs font-mono focus:outline-none focus:border-violetAccent"
                required
              />
            </div>

          </div>

          <div className="p-3 rounded-xl bg-lavenderSoft/50 text-[11px] text-mutedText">
            The canonical GitHub API locator and its SHA-256 binding are derived automatically from the pull request URL. Contributors cannot select an evidence host.
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-deepInk">Implementation Summary *</label>
            <textarea
              rows={3}
              placeholder="Brief explanation of how the bug was solved or feature implemented..."
              value={formData.summary}
              onChange={(e) => handleChange('summary', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-bgMain border border-borderLine rounded-xl text-xs focus:outline-none focus:border-violetAccent"
              required
            />
          </div>
        </div>

        {/* Realtime Pre-Flight Gate */}
        <div className="p-4 bg-surfaceDark rounded-xl border border-borderLine space-y-2 font-mono text-xs">
          <div className="text-mutedText uppercase text-[10px] font-bold">Pre-Flight Verification Checklist</div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className={`flex items-center space-x-1.5 ${isRepoMatch && formData.prUrl ? 'text-greenStatus' : 'text-mutedText'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>PR belongs to registered Repo</span>
            </div>
            <div className={`flex items-center space-x-1.5 ${isCommitValid ? 'text-greenStatus' : 'text-mutedText'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>40-Hex Commit SHA valid</span>
            </div>
            <div className={`flex items-center space-x-1.5 ${isCanonicalPr ? 'text-greenStatus' : 'text-mutedText'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Canonical PR identity</span>
            </div>
            <div className={`flex items-center space-x-1.5 ${isCanonicalPr ? 'text-greenStatus' : 'text-mutedText'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Evidence locator derived</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3 bg-violetAccent disabled:opacity-40 hover:bg-violetAccent/90 text-white rounded-full text-xs font-bold shadow-xs cursor-pointer"
        >
          Submit Work & Commit On-Chain
        </button>
      </form>
    </div>
  );
}
