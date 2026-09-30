import React, { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../web3/walletContext";
import { issueCertificateOnChain } from "../web3/writes";
import { parseWeb3Error } from "../web3/errors";
import { isContractConfigured } from "../config/contractConfig";
import type { TxState } from "../contracts/types";
import { Award, Wallet, User, BookOpen, Building2, AlertCircle } from "lucide-react";
import { TransactionStatus } from "../components/TransactionStatus";
import { ErrorMessage } from "../components/ErrorMessage";
import { StatusBadge } from "../components/StatusBadge";

export const IssuePage: React.FC = () => {
  const { isConnected, isOwner, isIssuer, getSigner, connectWallet } = useWallet();

  const [recipient, setRecipient] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [course, setCourse] = useState("");
  const [institution, setInstitution] = useState("");

  const [txState, setTxState] = useState<TxState>({ status: "idle" });
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Connection check
    if (!isConnected) {
      setValidationError("Please connect an authorized Web3 wallet before issuing certificates.");
      return;
    }

    // 2. Form validation
    if (!recipient.trim() || !ethers.isAddress(recipient.trim())) {
      setValidationError("Please enter a valid EVM wallet address for the recipient (e.g. 0x...).");
      return;
    }

    if (!recipientName.trim()) {
      setValidationError("Recipient name is required.");
      return;
    }

    if (!course.trim()) {
      setValidationError("Course / Program name is required.");
      return;
    }

    if (!institution.trim()) {
      setValidationError("Issuing institution name is required.");
      return;
    }

    // 3. Check contract config
    if (!isContractConfigured()) {
      setValidationError(
        "Contract Not Configured: Cannot issue on-chain certificates without a deployed contract address. Team A will deploy and supply the address."
      );
      return;
    }

    try {
      setTxState({ status: "confirming" });
      const signer = await getSigner();
      if (!signer) {
        throw new Error("Could not acquire wallet signer. Please reconnect your wallet.");
      }

      const tx = await issueCertificateOnChain(
        signer,
        recipient.trim(),
        recipientName.trim(),
        course.trim(),
        institution.trim()
      );

      setTxState({
        status: "pending",
        txHash: tx.hash,
        message: "Transaction broadcasted to network...",
      });

      const receipt = await tx.wait();

      setTxState({
        status: "success",
        txHash: receipt?.hash || tx.hash,
        message: `Certificate successfully issued on-chain to ${recipientName}!`,
      });

      // Reset form fields after successful issuance
      setRecipient("");
      setRecipientName("");
      setCourse("");
      setInstitution("");
    } catch (err: any) {
      const parsed = parseWeb3Error(err);
      setTxState({
        status: "error",
        errorMessage: parsed.friendlyMessage,
        isUserRejected: parsed.isUserRejected,
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 px-4 pb-12">
      <TransactionStatus state={txState} onClose={() => setTxState({ status: "idle" })} />

      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
          <Award className="w-3.5 h-3.5" /> Authorized Issuer Console
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100">Issue On-Chain Certificate</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Mint a permanent, verifiable certificate recorded on the EVM blockchain.
        </p>
      </div>

      {/* Wallet connection banner if disconnected */}
      {!isConnected ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center backdrop-blur-md shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400">
            <Wallet className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Wallet Not Connected</h3>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
            You must connect an authorized issuer wallet to invoke the <code className="text-indigo-300">issueCertificate</code> contract function.
          </p>
          <button
            onClick={connectWallet}
            className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-indigo-600/30"
          >
            Connect Wallet to Continue
          </button>
        </div>
      ) : (
        /* Form container */
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6"
        >
          {/* Permission indicator bar */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Issuer Permission Status:</span>
            {isIssuer || isOwner ? (
              <StatusBadge type={isOwner ? "owner" : "issuer"} size="sm" />
            ) : (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Not Authorized (Will revert on-chain)
              </span>
            )}
          </div>

          {validationError && (
            <ErrorMessage message={validationError} onDismiss={() => setValidationError(null)} />
          )}

          {/* Field 1: Recipient Wallet Address */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Recipient Wallet Address (0x...)
            </label>
            <div className="relative flex items-center">
              <Wallet className="w-5 h-5 text-slate-500 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="0x1234567890abcdef1234567890abcdef12345678"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl py-3 pl-12 pr-4 text-slate-100 placeholder-slate-600 font-mono text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Field 2: Recipient Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Recipient Full Name
            </label>
            <div className="relative flex items-center">
              <User className="w-5 h-5 text-slate-500 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Satoshi Nakamoto"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl py-3 pl-12 pr-4 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Field 3: Course / Program */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Course / Program Title
            </label>
            <div className="relative flex items-center">
              <BookOpen className="w-5 h-5 text-slate-500 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Web3 Blockchain Engineering Capstone"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl py-3 pl-12 pr-4 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Field 4: Institution */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Issuing Institution / Organization
            </label>
            <div className="relative flex items-center">
              <Building2 className="w-5 h-5 text-slate-500 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. TechCrush Academy"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl py-3 pl-12 pr-4 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mt-4"
          >
            <Award className="w-5 h-5" />
            Issue Certificate On-Chain
          </button>
        </form>
      )}
    </div>
  );
};
