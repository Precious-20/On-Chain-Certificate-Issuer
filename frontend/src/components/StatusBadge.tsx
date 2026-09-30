import React from "react";
import { CheckCircle2, XCircle, AlertCircle, ShieldCheck, Clock, Key } from "lucide-react";

export type BadgeType = "valid" | "revoked" | "not-found" | "pending" | "owner" | "issuer";

interface StatusBadgeProps {
  type: BadgeType;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, label, size = "md" }) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-medium gap-1",
    md: "px-3 py-1 text-xs font-semibold gap-1.5",
    lg: "px-4 py-1.5 text-sm font-semibold gap-2",
  }[size];

  switch (type) {
    case "valid":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{label || "Valid Certificate"}</span>
        </span>
      );
    case "revoked":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 ${sizeClasses}`}
        >
          <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{label || "Revoked"}</span>
        </span>
      );
    case "not-found":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 ${sizeClasses}`}
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{label || "Not Found"}</span>
        </span>
      );
    case "pending":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 ${sizeClasses}`}
        >
          <Clock className="w-4 h-4 shrink-0 animate-spin text-sky-400" />
          <span>{label || "Pending"}</span>
        </span>
      );
    case "owner":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 ${sizeClasses}`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0 text-purple-400" />
          <span>{label || "Contract Owner"}</span>
        </span>
      );
    case "issuer":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 ${sizeClasses}`}
        >
          <Key className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>{label || "Authorized Issuer"}</span>
        </span>
      );
  }
};
