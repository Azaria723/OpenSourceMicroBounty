import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Lock, ShieldAlert, GitPullRequest, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CreateBountyPage({ onCreateBounty, account }) {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    repositoryUrl: '',
    issueUrl: '',
    requiredScope: '',
    rewardGen: '1.0',
    deadlineDays: '14',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStep1Valid =
    formData.title.trim().length > 0 &&
    formData.description.trim().length > 0 &&
    formData.repositoryUrl.startsWith('https://github.com/') &&
    formData.issueUrl.includes('/issues/') &&
    formData.requiredScope.trim().length > 0;

  const isStep2Valid = Number(formData.rewardGen) > 0 && Number(formData.deadlineDays) >= 1;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isStep1Valid || !isStep2Valid) return;
    onCreateBounty(formData);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-borderLine pb-6">
        <div className="font-mono text-xs text-violetAccent uppercase tracking-wider font-semibold mb-1">
          Maintainer Portal
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-deepInk tracking-tight">
          Create & Lock Bounty
        </h1>
        <p className="text-xs text-mutedText mt-1">
          Post an open-source issue, specify acceptance criteria, and deposit native GEN into escrow custody.
        </p>
      </div>

      {/* 3-Step Progress Indicator */}
      <div className="grid grid-cols-3 gap-2 font-mono text-xs">
        {[
          { num: 1, label: "Task Spec" },
          { num: 2, label: "Reward & Lock" },
          { num: 3, label: "Review & Sign" },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-3 rounded-xl border text-center transition-all ${
              step === s.num
                ? 'bg-lavenderSoft border-violetAccent text-violetAccent font-bold shadow-xs'
                : step > s.num
                ? 'bg-surface border-greenStatus/50 text-greenStatus font-semibold'
                : 'bg-surfaceDark/50 border-borderLine text-mutedText'
            }`}
          >
            <div className="text-[10px]">STEP {s.num}</div>
            <div>{s.label}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-surface p-6 sm:p-8 rounded-2xl border border-borderLine space-y-6 shadow-sm">
        {/* Step 1: Task Spec */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-deepInk border-b border-borderLine pb-3">1. GitHub Issue Specification</h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-deepInk">Task Title *</label>
              <input
                type="text"
                placeholder="e.g. Fix websocket reconnect backoff logic in simulator core"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-bgMain border border-borderLine rounded-xl text-xs focus:outline-none focus:border-violetAccent"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-deepInk">Detailed Problem Description *</label>
              <textarea
                rows={3}
                placeholder="Explain the background, reproduction steps, or acceptance behavior..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-bgMain border border-borderLine rounded-xl text-xs focus:outline-none focus:border-violetAccent"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-deepInk">GitHub Repository HTTPS URL *</label>
                <input
                  type="url"
                  placeholder="https://github.com/org/repo"
                  value={formData.repositoryUrl}
                  onChange={(e) => handleChange('repositoryUrl', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-bgMain border border-borderLine rounded-xl text-xs font-mono focus:outline-none focus:border-violetAccent"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-deepInk">Target GitHub Issue URL *</label>
                <input
                  type="url"
                  placeholder="https://github.com/org/repo/issues/104"
                  value={formData.issueUrl}
                  onChange={(e) => handleChange('issueUrl', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-bgMain border border-borderLine rounded-xl text-xs font-mono focus:outline-none focus:border-violetAccent"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-deepInk">Required Code Scope & Acceptance Boundary *</label>
              <input
                type="text"
                placeholder="e.g. Core websocket connection resilience without breaking simulation stream"
                value={formData.requiredScope}
                onChange={(e) => handleChange('requiredScope', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-bgMain border border-borderLine rounded-xl text-xs focus:outline-none focus:border-violetAccent"
                required
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                disabled={!isStep1Valid}
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-violetAccent disabled:opacity-40 text-white rounded-full text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Continue to Reward</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Reward & Lock */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-deepInk border-b border-borderLine pb-3">2. Bounty Reward & Deadlines</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-deepInk">Reward Amount (GEN) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="2.5"
                  value={formData.rewardGen}
                  onChange={(e) => handleChange('rewardGen', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-bgMain border border-borderLine rounded-xl text-xs font-mono focus:outline-none focus:border-violetAccent"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-deepInk">Deadline (Days) *</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.deadlineDays}
                  onChange={(e) => handleChange('deadlineDays', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-bgMain border border-borderLine rounded-xl text-xs font-mono focus:outline-none focus:border-violetAccent"
                  required
                />
              </div>
            </div>

            <div className="p-4 bg-surfaceDark rounded-xl border border-borderLine font-mono text-xs space-y-1">
              <div className="text-mutedText text-[10px] uppercase">Maintainer Address Preview:</div>
              <div className="font-semibold text-deepInk break-all">{account || "Please connect wallet in navbar"}</div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 bg-surfaceDark text-deepInk rounded-full text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={!isStep2Valid}
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-violetAccent disabled:opacity-40 text-white rounded-full text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Review Terms</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Lock */}
        {step === 3 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-deepInk border-b border-borderLine pb-3">3. Review & Lock Escrow</h3>

            <div className="p-4 bg-bgMain rounded-xl border border-borderLine space-y-2 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-borderLine/60">
                <span className="text-mutedText">Repository:</span>
                <span className="font-bold text-deepInk truncate max-w-[240px]">{formData.repositoryUrl}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-borderLine/60">
                <span className="text-mutedText">Issue URL:</span>
                <span className="font-bold text-deepInk truncate max-w-[240px]">{formData.issueUrl}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-borderLine/60">
                <span className="text-mutedText">Scope:</span>
                <span className="font-bold text-deepInk truncate max-w-[240px]">{formData.requiredScope}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-borderLine/60">
                <span className="text-mutedText">Locked Reward:</span>
                <span className="font-bold text-violetAccent">{formData.rewardGen} GEN</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-mutedText">Deadline:</span>
                <span className="font-bold text-deepInk">{formData.deadlineDays} Days</span>
              </div>
            </div>

            <div className="p-4 bg-amberStatus/10 border border-amberStatus/40 rounded-xl flex items-start space-x-3 text-xs text-amberStatus">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Important Notice:</strong> This transaction will lock exactly <strong>{formData.rewardGen} GEN</strong> into the GenLayer escrow smart contract. Funds are released automatically once GenLayer consensus confirms the pull request is merged.
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-surfaceDark text-deepInk rounded-full text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-violetAccent hover:bg-violetAccent/90 text-white rounded-full text-xs font-bold flex items-center space-x-2 shadow-sm cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Create and Lock Bounty ({formData.rewardGen} GEN)</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
