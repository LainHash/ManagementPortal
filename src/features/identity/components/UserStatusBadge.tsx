import React from "react";
import { CheckCircle2, Lock, Archive } from "lucide-react";
import { cn } from "@/utils/cn";

interface UserStatusBadgeProps {
  isActive: boolean;
  isDeleted?: boolean;
  className?: string;
}

export function UserStatusBadge({
  isActive,
  isDeleted = false,
  className,
}: UserStatusBadgeProps) {
  if (isDeleted) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
          className
        )}
      >
        <Archive className="h-3 w-3 text-slate-500" />
        <span>Đã xoá</span>
      </span>
    );
  }

  if (isActive) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80",
          className
        )}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span>Hoạt động</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/80",
        className
      )}
    >
      <Lock className="h-3 w-3 text-rose-500" />
      <span>Bị khoá</span>
    </span>
  );
}
