import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  subtext?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Querying blockchain...",
  subtext = "Retrieving verified data from smart contract...",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-md animate-pulse" />
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin relative z-10" />
      </div>
      <h3 className="text-lg font-semibold text-slate-100">{message}</h3>
      {subtext && <p className="text-sm text-slate-400 mt-1 max-w-md">{subtext}</p>}
    </div>
  );
};
