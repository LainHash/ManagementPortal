import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReservationStatusBadge } from "./Badges";
import { ReservationStatus } from "@/types/enums";
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
  CheckCircle2,
  UserCheck,
  CheckCheck,
} from "lucide-react";

interface ReservationCardProps {
  reservation: ReservationResponse;
  onViewDetail: (reservation: ReservationResponse) => void;
  onQuickStatusChange?: (
    reservation: ReservationResponse,
    targetStatus: ReservationStatus,
    label: string
  ) => void;
}

export function ReservationCard({
  reservation,
  onViewDetail,
  onQuickStatusChange,
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

  const steps: ReservationStatus[] = [
    ReservationStatus.Pending,
    ReservationStatus.Confirmed,
    ReservationStatus.Seated,
    ReservationStatus.Completed,
  ];
  const currentIdx = steps.indexOf(reservation.status);

  return (
    <Card
      onClick={() => onViewDetail(reservation)}
      className="group relative flex flex-col justify-between overflow-hidden p-4 transition-all duration-300 hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-900/60 cursor-pointer"
    >
      <div>
        {/* Top row: Reservation code & Status */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-extrabold text-sm text-slate-900 group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400 transition-colors">
            #{reservation.reservationCode}
          </span>
          <ReservationStatusBadge status={reservation.status} />
        </div>

        {/* Consecutive Lifecycle Indicator Dots */}
        <div className="flex items-center gap-1 my-2">
          {steps.map((st, i) => {
            const isCurrent = st === reservation.status;
            const isPast = currentIdx !== -1 && i < currentIdx;
            return (
              <div
                key={st}
                title={st}
                className={`h-1 flex-1 rounded-full transition-all ${
                  isCurrent
                    ? "bg-teal-600 dark:bg-teal-400"
                    : isPast
                    ? "bg-emerald-500/80"
                    : "bg-slate-200 dark:bg-slate-800"
                }`}
              />
            );
          })}
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

          <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-medium">
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

      {/* Bottom Bar: Branch, Assigned Tables, Quick Action */}
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

        <div className="flex items-center gap-1.5">
          {onQuickStatusChange && reservation.status === ReservationStatus.Pending && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onQuickStatusChange(reservation, ReservationStatus.Confirmed, "Đã xác nhận");
              }}
              className="h-7 px-2 text-[11px] bg-teal-600 hover:bg-teal-700 text-white font-bold"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Xác nhận
            </Button>
          )}

          {onQuickStatusChange && reservation.status === ReservationStatus.Confirmed && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onQuickStatusChange(reservation, ReservationStatus.Seated, "Đã nhận bàn");
              }}
              className="h-7 px-2 text-[11px] bg-teal-600 hover:bg-teal-700 text-white font-bold"
            >
              <UserCheck className="h-3 w-3 mr-1" />
              Nhận bàn
            </Button>
          )}

          {onQuickStatusChange && reservation.status === ReservationStatus.Seated && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onQuickStatusChange(reservation, ReservationStatus.Completed, "Hoàn tất");
              }}
              className="h-7 px-2 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Trả bàn
            </Button>
          )}

          <div className="flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform ml-1">
            <span>Chi tiết</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Card>
  );
}
