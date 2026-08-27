import React from 'react';
import { Loader2, CheckCircle2, XCircle, ExternalLink, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { EXPLORER_ADDRESS_URL } from '../genlayer';

export default function TransactionModal({ isOpen, onClose, txState }) {
  if (!isOpen) return null;

  const { status, title, message, txHash, result, readbackState } = txState;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deepInk/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-surface border border-borderLine rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            {status === 'pending' && (
              <div className="w-10 h-10 rounded-full bg-lavenderSoft flex items-center justify-center text-violetAccent animate-spin">
                <Loader2 className="w-5 h-5" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-10 h-10 rounded-full bg-greenStatus/20 flex items-center justify-center text-greenStatus">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-10 h-10 rounded-full bg-roseStatus/20 flex items-center justify-center text-roseStatus">
                <XCircle className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-base text-deepInk">{title || "Transaction Execution"}</h3>
              <p className="text-xs text-mutedText mt-0.5">{message}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-mutedText hover:text-deepInk hover:bg-surfaceDark cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transaction Hash & Explorer Link */}
        {txHash && (
          <div className="p-3 bg-surfaceDark rounded-xl border border-borderLine space-y-1 font-mono text-xs">
            <div className="text-mutedText uppercase text-[10px]">Transaction Hash</div>
            <div className="font-semibold text-deepInk break-all">{txHash}</div>
          </div>
        )}

        {/* Real Consensus / Readback Feedback */}
        {result && (
          <div className="p-3.5 bg-lavenderSoft/50 border border-lavenderDark/40 rounded-xl space-y-1 text-xs">
            <div className="flex items-center space-x-1.5 font-semibold text-violetAccent">
              <ShieldCheck className="w-4 h-4" />
              <span>GenVM State Transition</span>
            </div>
            <div className="font-mono text-deepInk">{result}</div>
            {readbackState && (
              <div className="text-[11px] text-mutedText pt-1 border-t border-lavenderDark/30">
                Synchronized State: <span className="font-mono text-deepInk font-medium">{readbackState}</span>
              </div>
            )}
          </div>
        )}

        {/* Dismiss / Action CTA */}
        <div className="pt-2">
          {status !== 'pending' && (
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-violetAccent hover:bg-violetAccent/90 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              Done & Return
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
