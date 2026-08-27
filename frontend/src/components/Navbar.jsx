import React, { useState, useEffect } from 'react';
import { GitPullRequest, Wallet, ExternalLink, Menu, X, PlusCircle } from 'lucide-react';
import { CONTRACT, configured, EXPLORER_ADDRESS_URL } from '../genlayer';

export default function Navbar({ activeRoute, setActiveRoute, account, setAccount }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then((accs) => {
        if (accs && accs.length > 0) setAccount(accs[0]);
      });
      window.ethereum.on('accountsChanged', (accs) => {
        if (accs && accs.length > 0) setAccount(accs[0]);
        else setAccount('');
      });
    }
  }, [setAccount]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to connect your wallet.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) setAccount(accounts[0]);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  const navLinks = [
    { label: "Browse fixes", path: "/bounties" },
    { label: "Post a task", path: "/create" },
    { label: "Payout desk", path: "/settlement" },
    { label: "Ledger", path: "/activity" },
    { label: "How it works", path: "/guide" },
    { label: "Protocol", path: "/contract" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-borderLine">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => setActiveRoute('/')}
          className="flex items-center space-x-2.5 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-lavenderSoft flex items-center justify-center text-violetAccent group-hover:bg-violetAccent group-hover:text-white transition-all shadow-sm">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="font-bold text-sm text-deepInk tracking-tight font-sans">OpenSourceMicroBounty</div>
            <div className="text-[10px] font-mono text-mutedText leading-none">Fund useful code. Pay when it ships.</div>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-1 font-medium text-xs">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => setActiveRoute(link.path)}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                activeRoute === link.path
                  ? 'bg-lavenderSoft text-violetAccent font-bold'
                  : 'text-mutedText hover:text-deepInk hover:bg-surfaceDark'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Actions / Wallet */}
        <div className="hidden md:flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-surfaceDark rounded-full border border-borderLine font-mono text-[11px] text-mutedText">
            <span className="w-2 h-2 rounded-full bg-greenStatus"></span>
            <span>Studionet (61999)</span>
          </div>

          {account ? (
            <div className="px-3.5 py-1.5 bg-lavenderSoft/60 border border-lavenderDark/50 rounded-full font-mono text-xs text-violetAccent font-semibold flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-violetAccent"></span>
              <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="px-4 py-1.5 bg-violetAccent hover:bg-violetAccent/90 text-white rounded-full text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-deepInk hover:bg-surfaceDark rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-borderLine bg-surface p-4 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  setActiveRoute(link.path);
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-lg text-left text-xs font-medium ${
                  activeRoute === link.path
                    ? 'bg-lavenderSoft text-violetAccent font-bold'
                    : 'text-mutedText hover:text-deepInk'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
          <div className="pt-2 border-t border-borderLine flex flex-col space-y-2">
            {account ? (
              <div className="p-2 bg-lavenderSoft/50 rounded font-mono text-xs text-violetAccent break-all">
                Connected: {account}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="w-full py-2.5 bg-violetAccent text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
