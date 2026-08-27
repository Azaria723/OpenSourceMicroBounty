import React, { useState } from 'react';
import { Search, Filter, RefreshCw, Loader2, ArrowUpRight, Plus, GitBranch, ExternalLink } from 'lucide-react';
import { STATUS_LABELS } from '../genlayer';

export default function ExplorePage({ bounties, setActiveRoute, setSelectedBountyId, onRefresh, loading }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filterOptions = [
    'ALL',
    'OPEN',
    'CLAIMED',
    'SUBMITTED',
    'APPROVED',
    'PAID',
    'REJECTED',
    'REFUNDED',
  ];

  const filteredBounties = (bounties || []).filter((item) => {
    const statusObj = STATUS_LABELS[item.status] || { label: 'UNKNOWN' };
    const matchesFilter = filterStatus === 'ALL' || statusObj.label === filterStatus;
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.repository_url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.issue_url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.bounty_id) === searchQuery;
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-borderLine pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="font-mono text-xs text-violetAccent uppercase tracking-wider font-semibold mb-1">
            Open-Source Tasks
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-deepInk tracking-tight">
            Explore Micro-Bounties
          </h1>
          <p className="text-xs text-mutedText mt-1">
            Browse open issues, claim tasks, and earn GEN for verified pull requests.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3.5 py-1.5 bg-surface hover:bg-surfaceDark border border-borderLine rounded-full font-mono text-xs text-deepInk flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-violetAccent' : 'text-mutedText'}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh On-Chain'}</span>
          </button>
          <div className="font-mono text-xs text-mutedText">
            Total on-chain: <span className="font-bold text-deepInk">{bounties?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Controls: Search & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-surface p-4 rounded-2xl border border-borderLine">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-mutedText absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, repository, issue URL or Bounty ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bgMain border border-borderLine rounded-xl text-xs font-mono focus:outline-none focus:border-violetAccent"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-mutedText shrink-0 mr-1" />
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setFilterStatus(opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                filterStatus === opt
                  ? 'bg-violetAccent text-white font-semibold shadow-xs'
                  : 'bg-bgMain text-mutedText hover:text-deepInk border border-borderLine'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      {loading && bounties.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-borderLine rounded-2xl space-y-3">
          <Loader2 className="w-8 h-8 text-violetAccent animate-spin mx-auto" />
          <div className="font-mono text-xs text-mutedText">Reading live contract state from GenLayer Studionet...</div>
        </div>
      ) : filteredBounties.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-borderLine rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-lavenderSoft flex items-center justify-center text-violetAccent mx-auto">
            <GitBranch className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-deepInk">No public bounties yet</h3>
            <p className="text-xs text-mutedText max-w-md mx-auto">
              Create the first task and fund useful work on GenLayer Studionet.
            </p>
          </div>
          <button
            onClick={() => setActiveRoute('/create')}
            className="px-6 py-3 bg-violetAccent hover:bg-violetAccent/90 text-white rounded-full text-xs font-bold inline-flex items-center space-x-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create the First Task</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBounties.map((b) => {
            const badge = STATUS_LABELS[b.status] || { label: 'UNKNOWN', color: 'bg-surfaceDark' };
            const rewardGen = (Number(b.reward_wei || 0) / 1e18).toFixed(2);

            return (
              <div
                key={b.bounty_id}
                className="bg-surface hover:bg-surface/80 border border-borderLine hover:border-violetAccent/50 p-6 rounded-2xl space-y-5 transition-all shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-mutedText font-semibold">BOUNTY #{b.bounty_id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-deepInk line-clamp-2">{b.title}</h3>

                  <div className="space-y-1.5 text-xs font-mono pt-1">
                    <div className="text-mutedText text-[11px] truncate">
                      Repo: <span className="text-deepInk">{b.repository_url?.replace('https://github.com/', '')}</span>
                    </div>
                    <div className="text-mutedText text-[11px] truncate">
                      Maintainer: <span className="text-deepInk">{b.maintainer?.slice(0, 8)}...{b.maintainer?.slice(-6)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-borderLine space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-mono text-mutedText">Bounty Value:</span>
                    <span className="font-mono text-base font-bold text-violetAccent">{rewardGen} GEN</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedBountyId(b.bounty_id);
                      setActiveRoute(`/bounties/${b.bounty_id}`);
                    }}
                    className="w-full py-2.5 bg-surfaceDark hover:bg-lavenderSoft text-deepInk rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <span>Inspect Task Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-violetAccent" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
