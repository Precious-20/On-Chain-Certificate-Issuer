import React, { useState } from "react";
import type { FormattedCertificate } from "../contracts/types";
import { StatusBadge } from "./StatusBadge";
import { Award, Building2, Calendar, Copy, Check, ExternalLink, User, ShieldCheck, Wallet } from "lucide-react";
import { TARGET_NETWORK } from "../config/networkConfig";

interface CertificateResultCardProps {
  certificate: FormattedCertificate | null;
  notFound: boolean;
  searchedId?: string;
}

export const CertificateResultCard: React.FC<CertificateResultCardProps> = ({
  certificate,
  notFound,
  searchedId,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (notFound) {
    return (
      <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-8 text-center max-w-2xl mx-auto shadow-2xl backdrop-blur-md">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
          <StatusBadge type="not-found" size="lg" />
        </div>
        <h3 className="text-xl font-bold text-slate-100 mb-2">Certificate Not Found</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          No certificate exists on-chain for Certificate ID{" "}
          <span className="font-mono text-amber-300">#{searchedId}</span>. Please verify the ID and try again.
        </p>
      </div>
    );
  }

  if (!certificate) return null;

  return (
    <div
      className={`relative bg-gradient-to-b from-slate-900 to-slate-950 border rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto shadow-2xl overflow-hidden transition-all ${
        certificate.revoked
          ? "border-rose-500/40 shadow-rose-950/20"
          : "border-emerald-500/40 shadow-emerald-950/20"
      }`}
    >
      {/* Decorative seal / watermark background */}
      <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-indigo-400">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Verified On-Chain Certificate
              </span>
              <StatusBadge type={certificate.revoked ? "revoked" : "valid"} size="sm" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mt-0.5">
              Certificate #{certificate.id}
            </h2>
          </div>
        </div>

        <button
          onClick={() => copyToClipboard(window.location.href, "link")}
          className="self-start sm:self-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition"
        >
          {copiedField === "link" ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied Link
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" /> Share Verification
            </>
          )}
        </button>
      </div>

      {/* Certificate Main Body */}
      <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recipient Name */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-400" /> Recipient Name
          </span>
          <p className="text-lg font-semibold text-slate-100 mt-1">{certificate.recipientName}</p>
        </div>

        {/* Course Name */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-indigo-400" /> Course / Program
          </span>
          <p className="text-lg font-semibold text-slate-100 mt-1">{certificate.course}</p>
        </div>

        {/* Institution */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Issuing Institution
          </span>
          <p className="text-base font-semibold text-slate-100 mt-1">{certificate.institution}</p>
        </div>

        {/* Issue Date */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Issue Timestamp
          </span>
          <p className="text-base font-semibold text-slate-100 mt-1">{certificate.issueDateFormatted}</p>
        </div>

        {/* Recipient Wallet Address */}
        <div className="md:col-span-2 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-indigo-400" /> Recipient Wallet Address
            </span>
            <button
              onClick={() => copyToClipboard(certificate.recipient, "address")}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              {copiedField === "address" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedField === "address" ? "Copied" : "Copy Address"}
            </button>
          </div>
          <div className="mt-1 font-mono text-sm text-slate-200 break-all bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span>{certificate.recipient}</span>
            {TARGET_NETWORK.blockExplorerUrl !== "TBD" && (
              <a
                href={`${TARGET_NETWORK.blockExplorerUrl}/address/${certificate.recipient}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-slate-200 ml-2"
                title="View on Block Explorer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Status Verification Details */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-4 h-4 ${certificate.revoked ? "text-rose-400" : "text-emerald-400"}`} />
          <span>
            {certificate.revoked
              ? "Status: Revoked by Contract Owner on-chain"
              : "Status: Cryptographically Valid & Immutable"}
          </span>
        </div>
        <div className="font-mono text-slate-500">
          Certificate Token ID: #{certificate.id}
        </div>
      </div>
    </div>
  );
};
