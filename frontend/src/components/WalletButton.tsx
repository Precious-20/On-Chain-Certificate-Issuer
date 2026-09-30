import React, { useState } from "react";
import { useWallet } from "../web3/walletContext";
import { Wallet, AlertTriangle, Shield, CheckCircle, LogOut, ChevronDown, Copy, Check, RefreshCw } from "lucide-react";

export const WalletButton: React.FC = () => {
  const {
    address,
    isConnected,
    isConnecting,
    chainId,
    chainName,
    isSupportedNetwork,
    isOwner,
    isIssuer,
    connectWallet,
    disconnectWallet,
    refreshPermissions,
  } = useWallet();

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const truncatedAddress = address
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : "";

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/20 flex items-center gap-2"
      >
        <Wallet className="w-4 h-4" />
        {isConnecting ? "Connecting Wallet..." : "Connect Wallet"}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition flex items-center gap-2.5 ${
          !isSupportedNetwork
            ? "bg-rose-950/60 border-rose-800 text-rose-300"
            : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200"
        }`}
      >
        {!isSupportedNetwork ? (
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
        ) : (
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        )}
        <span className="font-mono text-xs">{truncatedAddress}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 text-left backdrop-blur-md">
          {/* Unsupported network alert */}
          {!isSupportedNetwork && (
            <div className="mb-3 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <strong className="font-semibold block">Unsupported Network</strong>
                Connected to {chainName} (Chain #{chainId}). Please switch to the correct deployment network once supplied by Team A.
              </div>
            </div>
          )}

          {/* Address & Copy */}
          <div className="pb-3 border-b border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Connected Address</span>
            <div className="mt-1 flex items-center justify-between font-mono text-xs text-slate-200 bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="truncate mr-2">{address}</span>
              <button onClick={handleCopy} className="text-slate-400 hover:text-white transition">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Network & Role Details */}
          <div className="py-3 border-b border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Network:</span>
              <span className="font-medium text-slate-200">{chainName}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Contract Owner:</span>
              <span className="font-medium">
                {isOwner ? (
                  <span className="text-purple-400 font-semibold flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Yes
                  </span>
                ) : (
                  <span className="text-slate-500">No</span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Authorized Issuer:</span>
              <span className="font-medium">
                {isIssuer ? (
                  <span className="text-cyan-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Yes
                  </span>
                ) : (
                  <span className="text-slate-500">No</span>
                )}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center gap-2">
            <button
              onClick={() => {
                refreshPermissions();
              }}
              className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-700"
            >
              <RefreshCw className="w-3 h-3" /> Refresh Role
            </button>
            <button
              onClick={() => {
                disconnectWallet();
                setIsOpen(false);
              }}
              className="flex-1 py-1.5 px-3 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-rose-800/80"
            >
              <LogOut className="w-3 h-3" /> Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
