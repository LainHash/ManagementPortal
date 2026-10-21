import React from "react";
import { ShieldAlert, ShieldCheck, Briefcase, UserCheck, User } from "lucide-react";
import { cn } from "@/utils/cn";

interface UserRoleBadgeProps {
  roleName?: string;
  className?: string;
}

export function UserRoleBadge({ roleName = "Customer", className }: UserRoleBadgeProps) {
  const normalized = roleName.toLowerCase();

  if (normalized === "superadmin") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/80 shadow-xs",
          className
        )}
      >
        <ShieldAlert className="h-3 w-3 text-rose-600 dark:text-rose-400" />
        <span>Super Admin</span>
      </span>
    );
  }

  if (normalized === "admin") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/80 shadow-xs",
          className
        )}
      >
        <ShieldCheck className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
        <span>Quản trị viên</span>
      </span>
    );
  }

  if (normalized === "manager") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/80 shadow-xs",
          className
        )}
      >
        <Briefcase className="h-3 w-3 text-amber-600 dark:text-amber-400" />
        <span>Quản lý chi nhánh</span>
      </span>
    );
  }

  if (normalized === "employee") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80 shadow-xs",
          className
        )}
      >
        <UserCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
        <span>Nhân viên</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/80 shadow-xs",
        className
      )}
    >
      <User className="h-3 w-3 text-sky-600 dark:text-sky-400" />
      <span>{roleName || "Khách hàng"}</span>
    </span>
  );
}
