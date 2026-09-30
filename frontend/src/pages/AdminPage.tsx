import React, { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../web3/walletContext";
import { authorizeIssuerOnChain, removeIssuerOnChain, revokeCertificateOnChain } from "../web3/writes";
import { checkIsAuthorizedIssuerOnChain } from "../web3/reads";
import { parseWeb3Error } from "../web3/errors";
import { isContractConfigured, CONTRACT_ADDRESS } from "../config/contractConfig";
import type { TxState } from "../contracts/types";
import { Lock, Key, FileText, UserPlus, UserMinus, Search, Hash, AlertTriangle, RefreshCw, Info } from "lucide-react";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { TransactionStatus } from "../components/TransactionStatus";
import { ErrorMessage } from "../components/ErrorMessage";
import { StatusBadge } from "../components/StatusBadge";

export const AdminPage: React.FC = () => {
  const {
    address,
    isConnected,
    isOwner,
    ownerAddress,
    chainId,
    chainName,
    getSigner,
    getProvider,
    connectWallet,
    refreshPermissions,
  } = useWallet();

  const [activeSubTab, setActiveSubTab] = useState<"certificates" | "issuers" | "contract">("certificates");

  // State: Revoke Certificate
  const [revokeCertId, setRevokeCertId] = useState("");
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  // State: Issuer Management
  const [issuerAddressInput, setIssuerAddressInput] = useState("");
  const [checkIssuerAddress, setCheckIssuerAddress] = useState("");
  const [checkIssuerResult, setCheckIssuerResult] = useState<boolean | null>(null);
  const [checkingIssuer, setCheckingIssuer] = useState(false);

  // State: Confirmation modals
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  // Transaction & Error handling
  const [txState, setTxState] = useState<TxState>({ status: "idle" });
  const [adminError, setAdminError] = useState<string | null>(null);

  // --- Handlers ---
  const handleRevokeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    const trimmed = revokeCertId.trim();
    if (!trimmed || isNaN(Number(trimmed)) || Number(trimmed) <= 0) {
      setAdminError("Please enter a valid numeric Certificate ID.");
      return;
    }

    if (!isContractConfigured()) {
      setAdminError("Contract Not Configured: Deployed contract address must be provided by Team A.");
      return;
    }

    setShowRevokeConfirm(true);
  };

  const executeRevoke = async () => {
    setShowRevokeConfirm(false);
    try {
      setTxState({ status: "confirming" });
      const signer = await getSigner();
      if (!signer) throw new Error("Wallet signer not available.");

      const tx = await revokeCertificateOnChain(signer, revokeCertId.trim());
      setTxState({ status: "pending", txHash: tx.hash, message: "Revocation transaction pending..." });

      const receipt = await tx.wait();
      setTxState({
        status: "success",
        txHash: receipt?.hash || tx.hash,
        message: `Certificate #${revokeCertId} has been revoked on-chain!`,
      });
      setRevokeCertId("");
    } catch (err: any) {
      const parsed = parseWeb3Error(err);
      setTxState({
        status: "error",
        errorMessage: parsed.friendlyMessage,
        isUserRejected: parsed.isUserRejected,
      });
    }
  };

  const handleAuthorizeIssuer = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    const targetAddr = issuerAddressInput.trim();
    if (!targetAddr || !ethers.isAddress(targetAddr)) {
      setAdminError("Please enter a valid EVM address to authorize.");
      return;
    }

    if (!isContractConfigured()) {
      setAdminError("Contract Not Configured: Deployed contract address is missing.");
      return;
    }

    try {
      setTxState({ status: "confirming" });
      const signer = await getSigner();
      if (!signer) throw new Error("Wallet signer not available.");

      const tx = await authorizeIssuerOnChain(signer, targetAddr);
      setTxState({ status: "pending", txHash: tx.hash, message: `Authorizing ${targetAddr}...` });

      const receipt = await tx.wait();
      setTxState({
        status: "success",
        txHash: receipt?.hash || tx.hash,
        message: `Address ${targetAddr} is now an Authorized Issuer on-chain!`,
      });
      setIssuerAddressInput("");
    } catch (err: any) {
      const parsed = parseWeb3Error(err);
      setTxState({
        status: "error",
        errorMessage: parsed.friendlyMessage,
        isUserRejected: parsed.isUserRejected,
      });
    }
  };

  const executeRemoveIssuer = async () => {
    setShowRemoveConfirm(false);
    const targetAddr = issuerAddressInput.trim();

    try {
      setTxState({ status: "confirming" });
      const signer = await getSigner();
      if (!signer) throw new Error("Wallet signer not available.");

      const tx = await removeIssuerOnChain(signer, targetAddr);
      setTxState({ status: "pending", txHash: tx.hash, message: `Removing issuer ${targetAddr}...` });

      const receipt = await tx.wait();
      setTxState({
        status: "success",
        txHash: receipt?.hash || tx.hash,
        message: `Issuer authorization removed for ${targetAddr}!`,
      });
      setIssuerAddressInput("");
    } catch (err: any) {
      const parsed = parseWeb3Error(err);
      setTxState({
        status: "error",
        errorMessage: parsed.friendlyMessage,
        isUserRejected: parsed.isUserRejected,
      });
    }
  };

  const handleCheckIssuerStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setCheckIssuerResult(null);

    const targetAddr = checkIssuerAddress.trim();
    if (!targetAddr || !ethers.isAddress(targetAddr)) {
      setAdminError("Please enter a valid EVM address to query authorization status.");
      return;
    }

    if (!isContractConfigured()) {
      setAdminError("Contract Not Configured: Contract address is unset.");
      return;
    }

    try {
      setCheckingIssuer(true);
      const provider = getProvider();
      if (!provider) throw new Error("Web3 provider not available.");

      const isAuth = await checkIsAuthorizedIssuerOnChain(provider, targetAddr);
      setCheckIssuerResult(isAuth);
    } catch (err: any) {
      const parsed = parseWeb3Error(err);
      setAdminError(parsed.friendlyMessage);
    } finally {
      setCheckingIssuer(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 pb-12">
      <TransactionStatus state={txState} onClose={() => setTxState({ status: "idle" })} />

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showRevokeConfirm}
        title="Revoke Certificate On-Chain?"
        description={`Are you sure you want to revoke Certificate #${revokeCertId}? Revoking a certificate is a permanent smart contract action.`}
        confirmText="Revoke Certificate"
        isDangerous={true}
        onConfirm={executeRevoke}
        onCancel={() => setShowRevokeConfirm(false)}
      />

      <ConfirmationModal
        isOpen={showRemoveConfirm}
        title="Remove Issuer Permissions?"
        description={`Are you sure you want to revoke issuing authority from ${issuerAddressInput}? This address will no longer be able to mint certificates.`}
        confirmText="Remove Issuer"
        isDangerous={true}
        onConfirm={executeRemoveIssuer}
        onCancel={() => setShowRemoveConfirm(false)}
      />

      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5" /> Smart Contract Governance
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Manage certificate revocation, issuer authorization, and view contract details.
        </p>
      </div>

      {/* Wallet Connection Status */}
      {!isConnected ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center backdrop-blur-md shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 text-purple-400">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Connect Wallet for Admin Actions</h3>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
            Connect the Contract Owner wallet to perform administrative management tasks.
          </p>
          <button
            onClick={connectWallet}
            className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-indigo-600/30"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <>
          {/* Non-owner Warning Banner */}
          {!isOwner && (
            <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-4 text-amber-200 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-sm text-amber-300">
                  Read-Only / Non-Owner Notice
                </strong>
                Your connected wallet (<code className="font-mono text-amber-200">{address}</code>) is not recognized as the Contract Owner. Owner-only action buttons are restricted in the UI, and will be rejected by smart contract modifier <code className="text-amber-300">onlyOwner</code> on-chain.
              </div>
            </div>
          )}

          {adminError && <ErrorMessage message={adminError} onDismiss={() => setAdminError(null)} />}

          {/* Sub-tab Navigation */}
          <div className="flex border-b border-slate-800 space-x-4">
            <button
              onClick={() => setActiveSubTab("certificates")}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                activeSubTab === "certificates"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" /> Certificate Management
            </button>
            <button
              onClick={() => setActiveSubTab("issuers")}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                activeSubTab === "issuers"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Key className="w-4 h-4" /> Issuer Management
            </button>
            <button
              onClick={() => setActiveSubTab("contract")}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                activeSubTab === "contract"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Info className="w-4 h-4" /> Contract & Network Info
            </button>
          </div>

          {/* TAB 1: Certificate Revocation */}
          {activeSubTab === "certificates" && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" /> Revoke Certificate
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  Owner-only operation. Invalidates a previously issued certificate on-chain by invoking <code className="text-rose-300">revokeCertificate(certificateId)</code>.
                </p>
              </div>

              <form onSubmit={handleRevokeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Target Certificate ID
                  </label>
                  <div className="relative flex items-center">
                    <Hash className="w-5 h-5 text-slate-500 absolute left-4 pointer-events-none" />
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 1, 42"
                      value={revokeCertId}
                      onChange={(e) => setRevokeCertId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-slate-100 font-mono text-sm focus:outline-none focus:border-rose-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isOwner || !revokeCertId.trim()}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {!isOwner ? "Owner Permission Required to Revoke" : "Revoke Certificate"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Issuer Management */}
          {activeSubTab === "issuers" && (
            <div className="space-y-6">
              {/* Section 1: Authorize / Remove Issuer */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-indigo-400" /> Manage Authorized Issuers
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Grant or revoke certificate issuance permissions for specific institution or admin wallets.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Issuer Wallet Address (0x...)
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={issuerAddressInput}
                    onChange={(e) => setIssuerAddressInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3 px-4 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAuthorizeIssuer}
                    disabled={!isOwner || !issuerAddressInput.trim()}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" /> Authorize Issuer
                  </button>

                  <button
                    onClick={() => {
                      if (ethers.isAddress(issuerAddressInput.trim())) {
                        setShowRemoveConfirm(true);
                      } else {
                        setAdminError("Please enter a valid address to remove.");
                      }
                    }}
                    disabled={!isOwner || !issuerAddressInput.trim()}
                    className="flex-1 py-3 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 disabled:bg-slate-800 disabled:border-slate-800 disabled:text-slate-600 text-rose-300 font-bold rounded-2xl text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <UserMinus className="w-4 h-4" /> Remove Issuer Authority
                  </button>
                </div>
              </div>

              {/* Section 2: Check Issuer Status */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Search className="w-5 h-5 text-cyan-400" /> Check Issuer Authorization Status
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Public read query to verify if an address is stored in <code className="text-cyan-300">authorizedIssuers(address)</code>.
                  </p>
                </div>

                <form onSubmit={handleCheckIssuerStatus} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter wallet address to check..."
                    value={checkIssuerAddress}
                    onChange={(e) => setCheckIssuerAddress(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl py-3 px-4 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500 transition"
                  />
                  <button
                    type="submit"
                    disabled={checkingIssuer || !checkIssuerAddress.trim()}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs transition border border-slate-700"
                  >
                    {checkingIssuer ? "Checking..." : "Query Status"}
                  </button>
                </form>

                {checkIssuerResult !== null && (
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono truncate max-w-[280px]">
                      {checkIssuerAddress}
                    </span>
                    <StatusBadge
                      type={checkIssuerResult ? "issuer" : "not-found"}
                      label={checkIssuerResult ? "Authorized Issuer" : "Not Authorized"}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Contract & Network Info */}
          {activeSubTab === "contract" && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-slate-100">Contract & Wallet Details</h3>
                <button
                  onClick={refreshPermissions}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Info
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Connected Wallet */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-slate-400 font-medium">Connected Wallet</span>
                  <p className="font-mono text-slate-200 truncate">{address || "Disconnected"}</p>
                </div>

                {/* Network Status */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-slate-400 font-medium">Network Connection</span>
                  <p className="font-medium text-slate-200">
                    {chainName} {chainId ? `(Chain #${chainId})` : ""}
                  </p>
                </div>

                {/* Contract Owner */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-slate-400 font-medium">Smart Contract Owner</span>
                  <p className="font-mono text-slate-200 truncate">
                    {ownerAddress || "Unfetched / Contract Unconfigured"}
                  </p>
                </div>

                {/* Contract Address Config */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-slate-400 font-medium">Deployed Contract Address</span>
                  <p className="font-mono text-slate-200 truncate">
                    {CONTRACT_ADDRESS || "TBD (Awaiting Team A Deployment)"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
