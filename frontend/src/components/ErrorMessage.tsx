import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = "Blockchain Error",
  message,
  onDismiss,
  actionButton,
}) => {
  return (
    <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 text-rose-200 relative shadow-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-rose-300">{title}</h4>
          <p className="text-sm text-rose-300/80 mt-1 leading-relaxed break-words">{message}</p>
          {actionButton && (
            <button
              onClick={actionButton.onClick}
              className="mt-3 px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 border border-rose-700/60 rounded-lg text-xs font-semibold transition"
            >
              {actionButton.label}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-rose-400/60 hover:text-rose-200 transition p-1 rounded-lg hover:bg-rose-900/40"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
