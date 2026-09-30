import React, { useState } from "react";
import { useWallet } from "../web3/walletContext";
import { fetchCertificateOnChain } from "../web3/reads";
import { parseWeb3Error } from "../web3/errors";
import { isContractConfigured } from "../config/contractConfig";
import { TARGET_NETWORK } from "../config/networkConfig";
import { getReadOnlyProvider } from "../web3/provider";
import type { FormattedCertificate } from "../contracts/types";
import { Search, Hash, ShieldCheck } from "lucide-react";
import { LoadingState } from "../components/LoadingState";
import { ErrorMessage } from "../components/ErrorMessage";
import { CertificateResultCard } from "../components/CertificateResultCard";

export const VerifyPage: React.FC = () => {
  const { getProvider } = useWallet();

  const [inputCertId, setInputCertId] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchedId, setSearchedId] = useState("");
  const [certificate, setCertificate] = useState<FormattedCertificate | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setCertificate(null);
    setNotFound(false);

    const trimmedId = inputCertId.trim();
    if (!trimmedId || isNaN(Number(trimmedId)) || Number(trimmedId) <= 0) {
      setErrorMsg("Please enter a valid positive numeric Certificate ID.");
      return;
    }

    if (!isContractConfigured()) {
      setErrorMsg("Contract Not Configured: Deployed contract address has not been provided yet.");
      return;
    }

    try {
      setLoading(true);
      setSearchedId(trimmedId);

      const activeProvider = getProvider() || (await getReadOnlyProvider(TARGET_NETWORK.rpcUrl));
      const result = await fetchCertificateOnChain(activeProvider, trimmedId);
      setCertificate(result);
    } catch (err: any) {
      const parsed = parseWeb3Error(err);
      if (parsed.isNotFound) {
        setNotFound(true);
      } else {
        setErrorMsg(parsed.friendlyMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 pb-12">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" /> Direct On-Chain Query
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100">Certificate Verification</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Enter any issued Certificate ID to query real-time smart contract state on the blockchain.
        </p>
      </div>

      {/* Verification Input Form */}
      <form
        onSubmit={handleVerify}
        className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md max-w-xl mx-auto"
      >
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Certificate Identification Number
        </label>

        <div className="relative flex items-center">
          <Hash className="w-5 h-5 text-slate-500 absolute left-4 pointer-events-none" />
          <input
            type="number"
            min="1"
            placeholder="e.g. 1, 2, 42"
            value={inputCertId}
            onChange={(e) => setInputCertId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl py-3.5 pl-12 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-base transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !inputCertId.trim()}
          className="mt-5 w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          {loading ? "Querying Smart Contract..." : "Verify Certificate"}
        </button>
      </form>

      {/* Error display */}
      {errorMsg && (
        <div className="max-w-xl mx-auto">
          <ErrorMessage message={errorMsg} onDismiss={() => setErrorMsg(null)} />
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="max-w-xl mx-auto">
          <LoadingState message={`Fetching Certificate #${inputCertId}...`} />
        </div>
      )}

      {/* Certificate result display */}
      {!loading && (certificate || notFound) && (
        <div className="pt-4">
          <CertificateResultCard
            certificate={certificate}
            notFound={notFound}
            searchedId={searchedId}
          />
        </div>
      )}
    </div>
  );
};