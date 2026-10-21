import React from "react";
import { Badge } from "@/components/ui/badge";
import { ContactStatus, ContactEmailStatus } from "@/types/enums";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  CheckCheck,
  MailCheck,
  Mail,
  MailX,
  HelpCircle,
} from "lucide-react";

export function ContactStatusBadge({ status }: { status?: ContactStatus | null }) {
  switch (status) {
    case ContactStatus.New:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-400/20">
          <Sparkles className="h-3 w-3 text-blue-500 animate-pulse" />
          Mới tiếp nhận
        </span>
      );
    case ContactStatus.InProgress:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-700/10 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-400/20">
          <Clock className="h-3 w-3 text-amber-500" />
          Đang xử lý
        </span>
      );
    case ContactStatus.Resolved:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-700/10 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-400/20">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          Đã giải quyết
        </span>
      );
    case ContactStatus.Closed:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-600/10 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-400/20">
          <CheckCheck className="h-3 w-3 text-slate-500" />
          Đã đóng
        </span>
      );
    default:
      return (
        <Badge variant="secondary" className="gap-1 font-normal">
          <HelpCircle className="h-3 w-3" />
          {status || "Chưa rõ"}
        </Badge>
      );
  }
}

export function ContactEmailStatusBadge({ status }: { status?: ContactEmailStatus | null }) {
  switch (status) {
    case ContactEmailStatus.Sent:
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <MailCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          Đã gửi
        </span>
      );
    case ContactEmailStatus.Pending:
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          <Mail className="h-3 w-3 text-amber-600 dark:text-amber-400" />
          Chờ gửi
        </span>
      );
    case ContactEmailStatus.Failed:
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          <MailX className="h-3 w-3 text-rose-600 dark:text-rose-400" />
          Gửi lỗi
        </span>
      );
    default:
      return null;
  }
}
