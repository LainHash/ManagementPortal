import React from "react";
import { Card } from "@/components/ui/card";
import { ReservationStatusBadge } from "./Badges";
import type { ReservationResponse } from "@/types/schedule.types";
import {
  Users,
  Calendar,
  Clock,
  Building2,
  Phone,
  ArrowRight,
  Sparkles,
  TableProperties,
} from "lucide-react";

interface ReservationCardProps {
  reservation: ReservationResponse;
  onViewDetail: (reservation: ReservationResponse) => void;
}

export function ReservationCard({
  reservation,
  onViewDetail,
}: ReservationCardProps) {
  const formatDateTime = (fromStr?: string | null, toStr?: string | null) => {
    if (!fromStr) return "";
    try {
      const fromDate = new Date(fromStr);
      const timeFormatter = new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const startTime = timeFormatter.format(fromDate);
      const datePart = dateFormatter.format(fromDate);

      if (toStr) {
        const toDate = new Date(toStr);
        const endTime = timeFormatter.format(toDate);
        return `${startTime} - ${endTime}, ${datePart}`;
      }
      return `${startTime}, ${datePart}`;
    } catch {
      return fromStr;
    }
  };

  return (
    <Card
      onClick={() => onViewDetail(reservation)}
      className="group relative flex flex-col justify-between overflow-hidden p-4 transition-all duration-300 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-900/60 cursor-pointer"
    >
      <div>
        {/* Top row: Reservation code & Status */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors">
            #{reservation.reservationCode}
          </span>
          <ReservationStatusBadge status={reservation.status} />
        </div>

        {/* Guest contact & Party size */}
        <div className="space-y-1.5 mb-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 truncate max-w-[65%]">
              {reservation.contactName}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Users className="h-3 w-3 text-indigo-500" />
              {reservation.partySize} khách
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Phone className="h-3 w-3 text-slate-400 shrink-0" />
            <span>{reservation.contactPhone}</span>
          </div>

          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[11.5px]">
              {formatDateTime(reservation.reservedFrom, reservation.reservedTo)}
            </span>
          </div>
        </div>

        {/* Special requests preview if present */}
        {reservation.specialRequests && (
          <div className="mb-3 rounded bg-amber-50/70 p-2 text-[11px] text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 line-clamp-1 italic flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
            <span className="truncate">{reservation.specialRequests}</span>
          </div>
        )}
      </div>

      {/* Bottom Bar: Branch & Assigned Tables */}
      <div className="border-t border-slate-100 pt-3 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <Building2 className="h-3 w-3 text-emerald-600 shrink-0" />
            {reservation.branchCode || "Chi nhánh"}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
            <TableProperties className="h-3 w-3 text-slate-400 shrink-0" />
            {reservation.tableNumbers && reservation.tableNumbers.length > 0
              ? `Bàn ${reservation.tableNumbers.join(", ")}`
              : "Chưa xếp bàn"}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
          <span>Chi tiết</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Card>
  );
}
