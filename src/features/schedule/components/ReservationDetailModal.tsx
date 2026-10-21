import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { scheduleApi } from "../api/schedule.api";
import { ReservationStatusBadge } from "./Badges";
import type {
  ReservationDetailResponse,
  ReservationResponse,
} from "@/types/schedule.types";
import {
  CalendarDays,
  User,
  Phone,
  Mail,
  Clock,
  Users,
  MapPin,
  Building2,
  TableProperties,
  History,
  AlertTriangle,
  Loader2,
  MessageSquare,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface ReservationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: ReservationResponse | null;
}

export function ReservationDetailModal({
  isOpen,
  onClose,
  reservation,
}: ReservationDetailModalProps) {
  const [detail, setDetail] = useState<ReservationDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && reservation?.id) {
      setIsLoading(true);
      scheduleApi.reservations
        .getById(reservation.id)
        .then((res) => {
          if (res?.data) {
            setDetail(res.data);
          } else {
            setDetail(null);
          }
        })
        .catch(() => {
          setDetail(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setDetail(null);
    }
  }, [isOpen, reservation?.id]);

  if (!reservation) return null;

  const currentData = detail || reservation;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const formatTimeOnly = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Lịch đặt bàn #{currentData.reservationCode}</span>
              <ReservationStatusBadge status={currentData.status} />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nhận lịch lúc {formatDate(currentData.createdAt)}
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {isLoading && (
          <div className="flex items-center justify-center py-3 gap-2 text-teal-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">Đang tải chi tiết bàn và lịch sử đặt chỗ...</span>
          </div>
        )}

        {/* Customer & Party Info */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/60">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Người liên hệ
            </span>
            <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              <User className="h-4 w-4 text-teal-600" />
              <span>{currentData.contactName}</span>
              {currentData.customerId && (
                <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Thành viên
                </span>
              )}
            </div>
            <div className="mt-1.5 space-y-1 text-slate-600 dark:text-slate-400">
              <a
                href={`tel:${currentData.contactPhone}`}
                className="flex items-center gap-1.5 text-teal-600 hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                {currentData.contactPhone}
              </a>
              {currentData.contactEmail && (
                <a
                  href={`mailto:${currentData.contactEmail}`}
                  className="flex items-center gap-1.5 hover:underline"
                >
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {currentData.contactEmail}
                </a>
              )}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Quy mô & Chi nhánh
            </span>
            <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
                <Users className="h-4 w-4 text-indigo-600" />
                <span>{currentData.partySize} khách</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>{currentData.branchCode || "Chi nhánh chính"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Time Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Khung giờ đặt chỗ
          </span>
          <div className="flex items-center justify-between rounded-lg bg-teal-50/60 p-3 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/40">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <div>
                <span className="text-xs text-slate-500 block">Thời gian dùng bữa:</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {formatDate(currentData.reservedFrom)}
                  {currentData.reservedTo && ` — ${formatTimeOnly(currentData.reservedTo)}`}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">Số bàn xếp:</span>
              <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                {currentData.tableCount || currentData.tableNumbers?.length || 0} bàn
              </span>
            </div>
          </div>

          {/* Assigned Tables */}
          <div className="mt-3">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Vị trí bàn được phân bổ:
            </span>
            <div className="flex flex-wrap gap-2">
              {currentData.tableNumbers && currentData.tableNumbers.length > 0 ? (
                currentData.tableNumbers.map((tbl, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <TableProperties className="h-3.5 w-3.5 text-indigo-500" />
                    Bàn {tbl}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Chưa xếp bàn cụ thể
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {currentData.specialRequests && (
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-900/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Yêu cầu đặc biệt của khách:
            </span>
            <p className="text-slate-700 dark:text-slate-300 italic whitespace-pre-wrap">
              &ldquo;{currentData.specialRequests}&rdquo;
            </p>
          </div>
        )}

        {/* Cancellation Info */}
        {detail?.cancellationReason && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            <span className="font-bold block mb-0.5">Lý do hủy đặt bàn:</span>
            <p>{detail.cancellationReason}</p>
            {detail.cancelledAt && (
              <span className="text-[10px] text-rose-500 block mt-1">
                Thời điểm hủy: {formatDate(detail.cancelledAt)}
              </span>
            )}
          </div>
        )}

        {/* Status Histories */}
        {detail?.statusHistories && detail.statusHistories.length > 0 && (
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/40 space-y-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-slate-400" />
              Lịch sử cập nhật trạng thái ({detail.statusHistories.length})
            </span>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {detail.statusHistories.map((h, i) => (
                <div key={i} className="py-1.5 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {h.oldStatus} → {h.newStatus}
                    </span>
                    {h.reason && <span className="text-slate-400 ml-2">({h.reason})</span>}
                  </div>
                  <span className="text-slate-400">{formatDate(h.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap gap-2">
            <a
              href={`tel:${currentData.contactPhone}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-xs"
            >
              <Phone className="h-3.5 w-3.5" />
              Gọi điện thoại
            </a>
            {currentData.contactEmail && (
              <a
                href={`mailto:${currentData.contactEmail}?subject=${encodeURIComponent(
                  `[Nhà hàng] Xác nhận lịch đặt bàn #${currentData.reservationCode}`
                )}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <Mail className="h-3.5 w-3.5 text-blue-500" />
                Gửi email
              </a>
            )}
          </div>

          <Button type="button" variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
