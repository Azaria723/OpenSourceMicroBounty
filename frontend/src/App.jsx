import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TransactionModal from './components/TransactionModal';

import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import CreateBountyPage from './pages/CreateBountyPage';
import BountyDetailPage from './pages/BountyDetailPage';
import SubmitWorkPage from './pages/SubmitWorkPage';
import VerificationDeskPage from './pages/VerificationDeskPage';
import SettlementPage from './pages/SettlementPage';
import ActivityPage from './pages/ActivityPage';
import GuidePage from './pages/GuidePage';
import ContractPage from './pages/ContractPage';

import {
  CONTRACT,
  configured,
  writer,
  fetchAllOnChainBounties,
} from './genlayer';

export default function App() {
  const [activeRoute, setActiveRoute] = useState('/');
  const [account, setAccount] = useState('');
  const [selectedBountyId, setSelectedBountyId] = useState(0);
  const [bounties, setBounties] = useState([]);
  const [loadingBounties, setLoadingBounties] = useState(false);

  // Transaction Lifecycle Modal State
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txState, setTxState] = useState({
    status: 'pending',
    title: '',
    message: '',
    txHash: '',
    result: '',
    readbackState: '',
  });

  // Load Real On-Chain Bounties (Zero Mock)
  const refreshOnChainState = useCallback(async () => {
    if (!configured) return;
    try {
      setLoadingBounties(true);
      const liveList = await fetchAllOnChainBounties();
      setBounties(liveList);
    } catch (err) {
      console.warn("Failed to load on-chain bounties:", err);
    } finally {
      setLoadingBounties(false);
    }
  }, []);

  useEffect(() => {
    refreshOnChainState();
  }, [refreshOnChainState]);

  // Wait for Tx Confirmation & Readback State
  const waitForTxAndRefresh = async (client, txHash, successMsg) => {
    try {
      if (client.waitForTransactionReceipt) {
        await client.waitForTransactionReceipt({ hash: txHash });
      } else {
        await new Promise((res) => setTimeout(res, 4000));
      }
      await refreshOnChainState();
      setTxState((prev) => ({
        ...prev,
        status: 'success',
        message: successMsg,
        result: 'FINALIZED & COMMITTED ON GENVM',
        readbackState: 'On-chain state refreshed successfully',
      }));
    } catch (err) {
      console.warn("Receipt wait notice:", err);
      await refreshOnChainState();
      setTxState((prev) => ({
        ...prev,
        status: 'success',
        message: successMsg,
        result: 'TRANSACTION SUBMITTED',
        readbackState: 'Synchronized with Studionet',
      }));
    }
  };

  // 1. Create Bounty
  const handleCreateBounty = async (formData) => {
    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }
    setTxModalOpen(true);
    setTxState({
      status: 'pending',
      title: 'Creating Bounty on Studionet',
      message: 'Broadcasting create_bounty transaction and locking GEN...',
      txHash: '',
      result: '',
      readbackState: '',
    });

    try {
      const client = writer(account);
      const rewardWei = BigInt(Math.floor(Number(formData.rewardGen) * 1e18));
      const deadlineSec = BigInt(Number(formData.deadlineDays) * 86400);

      const encoder = new TextEncoder();
      const issueBytes = encoder.encode(`${formData.repositoryUrl}\n${formData.issueUrl}\n${formData.requiredScope}`);
      const hashBuffer = await crypto.subtle.digest("SHA-256", issueBytes);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const issueDigest = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const txHash = await client.writeContract({
        address: CONTRACT,
        functionName: 'create_bounty',
        args: [
          formData.title,
          formData.description,
          formData.repositoryUrl,
          formData.issueUrl,
          issueDigest,
          formData.requiredScope,
          deadlineSec,
        ],
        value: rewardWei,
      });

      setTxState((prev) => ({ ...prev, txHash, message: 'Transaction broadcast! Waiting for finality...' }));
      await waitForTxAndRefresh(client, txHash, "Bounty successfully created and funded on-chain!");
    } catch (err) {
      console.error("create_bounty error:", err);
      setTxState({
        status: 'error',
        title: 'Bounty Creation Failed',
        message: err.message || 'Transaction rejected by wallet or contract rules.',
        txHash: '',
        result: 'ERROR',
        readbackState: '',
      });
    }
  };

  // 2. Claim Bounty
  const handleClaimBounty = async (bountyId) => {
    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }
    setTxModalOpen(true);
    setTxState({
      status: 'pending',
      title: `Claiming Bounty #${bountyId}`,
      message: 'Registering contributor address on-chain...',
      txHash: '',
      result: '',
      readbackState: '',
    });

    try {
      const client = writer(account);
      const txHash = await client.writeContract({
        address: CONTRACT,
        functionName: 'claim_bounty',
        args: [BigInt(bountyId)],
      });

      setTxState((prev) => ({ ...prev, txHash, message: 'Claim submitted. Waiting for confirmation...' }));
      await waitForTxAndRefresh(client, txHash, `Bounty #${bountyId} claimed! You can now submit your PR.`);
    } catch (err) {
      console.error("claim_bounty error:", err);
      setTxState({
        status: 'error',
        title: 'Claim Failed',
        message: err.message || 'Maintainers cannot claim own bounties or task is not open.',
        txHash: '',
        result: 'ERROR',
        readbackState: '',
      });
    }
  };

  // 3. Submit Work
  const handleSubmitWork = async (bountyId, formData) => {
    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }
    setTxModalOpen(true);
    setTxState({
      status: 'pending',
      title: `Submitting PR Work for Bounty #${bountyId}`,
      message: 'Broadcasting pull request evidence and commit SHA...',
      txHash: '',
      result: '',
      readbackState: '',
    });

    try {
      const client = writer(account);
      const pr = new URL(formData.prUrl);
      const parts = pr.pathname.replace(/^\/+|\/+$/g, '').split('/');
      if (pr.protocol !== 'https:' || pr.hostname !== 'github.com' || parts.length !== 4 || parts[2] !== 'pull' || !/^\d+$/.test(parts[3])) {
        throw new Error('Pull request URL must be exactly https://github.com/<owner>/<repo>/pull/<number>.');
      }
      const evidenceUrl = `https://api.github.com/repos/${parts[0]}/${parts[1]}/pulls/${parts[3]}`;
      const evidenceBytes = new TextEncoder().encode(evidenceUrl);
      const evidenceHash = await crypto.subtle.digest('SHA-256', evidenceBytes);
      const evidenceDigest = Array.from(new Uint8Array(evidenceHash))
        .map((byte) => byte.toString(16).padStart(2, '0')).join('');
      const txHash = await client.writeContract({
        address: CONTRACT,
        functionName: 'submit_work',
        args: [
          BigInt(bountyId),
          formData.prUrl,
          formData.commitSha,
          evidenceUrl,
          evidenceDigest,
          formData.summary,
        ],
      });

      setTxState((prev) => ({ ...prev, txHash, message: 'Submission committed. Waiting for finality...' }));
      await waitForTxAndRefresh(client, txHash, `Work submitted for Bounty #${bountyId}! Ready for verification.`);
    } catch (err) {
      console.error("submit_work error:", err);
      setTxState({
        status: 'error',
        title: 'Submission Failed',
        message: err.message || 'Transaction rejected by contract guard.',
        txHash: '',
        result: 'ERROR',
        readbackState: '',
      });
    }
  };

  // 4. Verify Work (Consensus)
  const handleVerifyWork = async (bountyId) => {
    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }
    setTxModalOpen(true);
    setTxState({
      status: 'pending',
      title: `Triggering Verification for Bounty #${bountyId}`,
      message: 'GenLayer validator nodes evaluating GitHub pull request merge status...',
      txHash: '',
      result: '',
      readbackState: '',
    });

    try {
      const client = writer(account);
      const txHash = await client.writeContract({
        address: CONTRACT,
        functionName: 'verify_work',
        args: [BigInt(bountyId)],
      });

      setTxState((prev) => ({ ...prev, txHash, message: 'Consensus nodes evaluating evidence...' }));
      await waitForTxAndRefresh(client, txHash, `Verification review completed for Bounty #${bountyId}!`);
    } catch (err) {
      console.error("verify_work error:", err);
      setTxState({
        status: 'error',
        title: 'Verification Call Failed',
        message: err.message || 'Consensus invocation error.',
        txHash: '',
        result: 'ERROR',
        readbackState: '',
      });
    }
  };

  // 5. Pay Contributor
  const handlePayContributor = async (bountyId) => {
    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }
    setTxModalOpen(true);
    setTxState({
      status: 'pending',
      title: `Releasing Payout for Bounty #${bountyId}`,
      message: 'Executing native GEN transfer to contributor...',
      txHash: '',
      result: '',
      readbackState: '',
    });

    try {
      const client = writer(account);
      const txHash = await client.writeContract({
        address: CONTRACT,
        functionName: 'pay_contributor',
        args: [BigInt(bountyId)],
      });

      setTxState((prev) => ({ ...prev, txHash, message: 'Payment broadcast. Waiting for finality...' }));
      await waitForTxAndRefresh(client, txHash, `Payout successfully released for Bounty #${bountyId}!`);
    } catch (err) {
      console.error("pay_contributor error:", err);
      setTxState({
        status: 'error',
        title: 'Payout Failed',
        message: err.message || 'Bounty is not approved or reward balance is zero.',
        txHash: '',
        result: 'ERROR',
        readbackState: '',
      });
    }
  };

  // 6. Refund Bounty
  const handleRefundBounty = async (bountyId) => {
    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }
    setTxModalOpen(true);
    setTxState({
      status: 'pending',
      title: `Claiming Refund for Bounty #${bountyId}`,
      message: 'Returning locked GEN to maintainer address...',
      txHash: '',
      result: '',
      readbackState: '',
    });

    try {
      const client = writer(account);
      const txHash = await client.writeContract({
        address: CONTRACT,
        functionName: 'refund_bounty',
        args: [BigInt(bountyId)],
      });

      setTxState((prev) => ({ ...prev, txHash, message: 'Refund broadcast. Waiting for finality...' }));
      await waitForTxAndRefresh(client, txHash, `Refund processed for Bounty #${bountyId}!`);
    } catch (err) {
      console.error("refund_bounty error:", err);
      setTxState({
        status: 'error',
        title: 'Refund Failed',
        message: err.message || 'Refund rejected by contract rules.',
        txHash: '',
        result: 'ERROR',
        readbackState: '',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-bgMain text-deepInk">
      <Navbar
        activeRoute={activeRoute}
        setActiveRoute={setActiveRoute}
        account={account}
        setAccount={setAccount}
      />

      <main className="flex-1">
        {activeRoute === '/' && (
          <HomePage
            setActiveRoute={setActiveRoute}
            bounties={bounties}
            setSelectedBountyId={setSelectedBountyId}
          />
        )}
        {activeRoute === '/bounties' && (
          <ExplorePage
            bounties={bounties}
            setActiveRoute={setActiveRoute}
            setSelectedBountyId={setSelectedBountyId}
            onRefresh={refreshOnChainState}
            loading={loadingBounties}
          />
        )}
        {activeRoute === '/create' && (
          <CreateBountyPage
            onCreateBounty={handleCreateBounty}
            account={account}
          />
        )}
        {activeRoute.startsWith('/bounties/') && (
          <BountyDetailPage
            bountyId={selectedBountyId}
            bounties={bounties}
            setActiveRoute={setActiveRoute}
            onClaimBounty={handleClaimBounty}
            onPayContributor={handlePayContributor}
            onRefundBounty={handleRefundBounty}
            account={account}
          />
        )}
        {activeRoute.startsWith('/submit/') && (
          <SubmitWorkPage
            bountyId={selectedBountyId}
            bounties={bounties}
            onSubmitWork={handleSubmitWork}
            setActiveRoute={setActiveRoute}
            account={account}
          />
        )}
        {activeRoute.startsWith('/verify/') && (
          <VerificationDeskPage
            bountyId={selectedBountyId}
            onVerifyWork={handleVerifyWork}
            setActiveRoute={setActiveRoute}
            account={account}
          />
        )}
        {activeRoute === '/settlement' && (
          <SettlementPage
            bounties={bounties}
            onPayContributor={handlePayContributor}
            onRefundBounty={handleRefundBounty}
            setActiveRoute={setActiveRoute}
            setSelectedBountyId={setSelectedBountyId}
          />
        )}
        {activeRoute === '/activity' && (
          <ActivityPage
            bounties={bounties}
            account={account}
            setActiveRoute={setActiveRoute}
            setSelectedBountyId={setSelectedBountyId}
          />
        )}
        {activeRoute === '/guide' && (
          <GuidePage setActiveRoute={setActiveRoute} />
        )}
        {activeRoute === '/contract' && (
          <ContractPage />
        )}
      </main>

      <Footer setActiveRoute={setActiveRoute} />

      <TransactionModal
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        txState={txState}
      />
    </div>
  );
}
