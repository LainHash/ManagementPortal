import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/utils/cn";

export interface AlertState {
  type: "success" | "error";
  message: string;
}

interface CatalogAlertProps {
  alert: AlertState | null;
  onClose: () => void;
  autoCloseMs?: number;
}

export function CatalogAlert({
  alert,
  onClose,
  autoCloseMs = 4000,
}: CatalogAlertProps) {
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [alert, onClose, autoCloseMs]);

  if (!alert) return null;

  const isSuccess = alert.type === "success";

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg border backdrop-blur-md max-w-md",
          isSuccess
            ? "bg-emerald-50/95 border-emerald-200 text-emerald-900 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-100"
            : "bg-rose-50/95 border-rose-200 text-rose-900 dark:bg-rose-950/90 dark:border-rose-800 dark:text-rose-100"
        )}
      >
        {isSuccess ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        ) : (
          <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
        )}
        <p className="text-sm font-medium flex-1">{alert.message}</p>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
