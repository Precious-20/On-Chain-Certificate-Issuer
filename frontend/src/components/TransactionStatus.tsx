import React from "react";
import { Loader2, CheckCircle, AlertOctagon, ExternalLink, X } from "lucide-react";
import type { TxState } from "../contracts/types";
import { TARGET_NETWORK } from "../config/networkConfig";

interface TransactionStatusProps {
  state: TxState;
  onClose?: () => void;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({ state, onClose }) => {
  if (state.status === "idle") return null;

  const getExplorerLink = (txHash?: string) => {
    if (!txHash) return "#";
    if (TARGET_NETWORK.blockExplorerUrl !== "TBD") {
      return `${TARGET_NETWORK.blockExplorerUrl}/tx/${txHash}`;
    }
    return `#tx-${txHash}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-center">
        {onClose && state.status !== "confirming" && state.status !== "pending" && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* State 1: Confirming in wallet */}
        {state.status === "confirming" && (
          <div className="py-4">
            <div className="relative inline-block mb-4">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-100">Confirm in Wallet</h3>
            <p className="text-sm text-slate-400 mt-2">
              Please inspect and approve the transaction prompt in your browser wallet extension.
            </p>
          </div>
        )}

        {/* State 2: Transaction Pending on-chain */}
        {state.status === "pending" && (
          <div className="py-4">
            <div className="relative inline-block mb-4">
              <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-100">Transaction Pending</h3>
            <p className="text-sm text-slate-400 mt-2">
              Transaction broadcasted to blockchain node. Waiting for block confirmation...
            </p>
            {state.txHash && (
              <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 font-mono text-xs text-slate-400 flex items-center justify-between">
                <span className="truncate max-w-[240px]">{state.txHash}</span>
                {TARGET_NETWORK.blockExplorerUrl !== "TBD" && (
                  <a
                    href={getExplorerLink(state.txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-sans"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* State 3: Transaction Success */}
        {state.status === "success" && (
          <div className="py-4">
            <div className="relative inline-block mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-emerald-300">Transaction Successful!</h3>
            <p className="text-sm text-slate-300 mt-2">
              {state.message || "The state change was successfully executed on-chain."}
            </p>
            {state.txHash && (
              <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 font-mono text-xs text-slate-400 flex items-center justify-between">
                <span className="truncate max-w-[240px]">{state.txHash}</span>
                {TARGET_NETWORK.blockExplorerUrl !== "TBD" && (
                  <a
                    href={getExplorerLink(state.txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-sans"
                  >
                    Explorer <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
            <button
              onClick={onClose}
              className="mt-6 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition"
            >
              Continue
            </button>
          </div>
        )}

        {/* State 4: Transaction Error / Rejection */}
        {state.status === "error" && (
          <div className="py-4">
            <div className="relative inline-block mb-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <AlertOctagon className="w-8 h-8 text-rose-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-rose-300">
              {state.isUserRejected ? "Transaction Cancelled" : "Transaction Failed"}
            </h3>
            <p className="text-sm text-slate-300 mt-2">
              {state.errorMessage || "The transaction was rejected or reverted by smart contract."}
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition border border-slate-700"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
