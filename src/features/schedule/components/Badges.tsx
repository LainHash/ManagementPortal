import React from "react";
import { Badge } from "@/components/ui/badge";
import { ReservationStatus } from "@/types/enums";
import {
  Clock,
  CheckCircle2,
  Users,
  CheckCheck,
  XCircle,
  UserX,
  HelpCircle,
} from "lucide-react";

export function ReservationStatusBadge({
  status,
}: {
  status?: ReservationStatus | null;
}) {
  switch (status) {
    case ReservationStatus.Pending:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-700/10 dark:bg-amber-950/40 dark:text-amber-300">
          <Clock className="h-3 w-3 text-amber-500 animate-pulse" />
          Chờ xác nhận
        </span>
      );
    case ReservationStatus.Confirmed:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-950/40 dark:text-blue-300">
          <CheckCircle2 className="h-3 w-3 text-blue-500" />
          Đã xác nhận
        </span>
      );
    case ReservationStatus.Seated:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 ring-1 ring-inset ring-purple-700/10 dark:bg-purple-950/40 dark:text-purple-300">
          <Users className="h-3 w-3 text-purple-500" />
          Đã vào bàn
        </span>
      );
    case ReservationStatus.Completed:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-700/10 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCheck className="h-3 w-3 text-emerald-500" />
          Hoàn tất
        </span>
      );
    case ReservationStatus.Cancelled:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-700/10 dark:bg-rose-950/40 dark:text-rose-300">
          <XCircle className="h-3 w-3 text-rose-500" />
          Đã hủy
        </span>
      );
    case ReservationStatus.NoShow:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-600/10 dark:bg-slate-800 dark:text-slate-300">
          <UserX className="h-3 w-3 text-slate-500" />
          Vắng mặt (No-show)
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
