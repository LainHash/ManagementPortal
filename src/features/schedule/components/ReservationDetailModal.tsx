import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { scheduleApi } from "../api/schedule.api";
import { ReservationStatusBadge } from "./Badges";
import { ReservationStatus } from "@/types/enums";
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
  Building2,
  TableProperties,
  History,
  AlertTriangle,
  Loader2,
  MessageSquare,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Check,
  CheckCheck,
  UserCheck,
  UserX,
} from "lucide-react";

interface ReservationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: ReservationResponse | null;
  onStatusChanged?: (message: string) => void;
}

export function ReservationDetailModal({
  isOpen,
  onClose,
  reservation,
  onStatusChanged,
}: ReservationDetailModalProps) {
  const [detail, setDetail] = useState<ReservationDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cancellation prompt
  const [showCancelPrompt, setShowCancelPrompt] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>("");

  const fetchDetail = () => {
    if (reservation?.id) {
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
    }
  };

  useEffect(() => {
    if (isOpen && reservation?.id) {
      fetchDetail();
      setError(null);
      setShowCancelPrompt(false);
      setCancelReason("");
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

  // Define consecutive lifecycle pipeline steps
  const steps = [
    {
      status: ReservationStatus.Pending,
      label: "Chờ xác nhận",
      shortLabel: "Chờ duyệt",
      icon: Clock,
    },
    {
      status: ReservationStatus.Confirmed,
      label: "Xác nhận đặt bàn",
      shortLabel: "Đã xác nhận",
      icon: CheckCircle2,
    },
    {
      status: ReservationStatus.Seated,
      label: "Khách đến & Nhận bàn",
      shortLabel: "Đã nhận bàn",
      icon: UserCheck,
    },
    {
      status: ReservationStatus.Completed,
      label: "Hoàn tất dùng bữa",
      shortLabel: "Hoàn tất",
      icon: CheckCheck,
    },
  ];

  const currentStepIdx = steps.findIndex((s) => s.status === currentData.status);
  const isTerminalStatus =
    currentData.status === ReservationStatus.Completed ||
    currentData.status === ReservationStatus.Cancelled ||
    currentData.status === ReservationStatus.NoShow;

  // Handle direct transition to target status
  const handleUpdateStatus = async (
    targetStatus: ReservationStatus,
    label: string,
    reason?: string
  ) => {
    setIsActionLoading(true);
    setError(null);
    try {
      const res = await scheduleApi.reservations.updateStatus(currentData.id, {
        status: targetStatus,
        reason: reason || undefined,
      });
      if (res?.data) {
        setDetail(res.data);
      }
      onStatusChanged?.(`Đã chuyển trạng thái lịch #${currentData.reservationCode} sang "${label}" thành công!`);
      setShowCancelPrompt(false);
      setCancelReason("");
      fetchDetail();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể cập nhật trạng thái lịch đặt bàn."
      );
    } finally {
      setIsActionLoading(false);
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
      <div className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-2 gap-2 text-teal-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">Đang tải chi tiết bàn và lịch sử đặt chỗ...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Reservation Lifecycle Pipeline: Consecutive Individual Status Buttons */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tiến trình đặt bàn (Lifecycle)
            </span>
            {currentData.status === ReservationStatus.Cancelled && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                <XCircle className="h-3 w-3" />
                Đã hủy đặt bàn
              </span>
            )}
            {currentData.status === ReservationStatus.NoShow && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <UserX className="h-3 w-3" />
                Khách vắng mặt (No-Show)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isCurrent = step.status === currentData.status;
              const isPast = currentStepIdx !== -1 && idx < currentStepIdx;
              const isNext = currentStepIdx !== -1 && idx === currentStepIdx + 1;
              const isFuture = currentStepIdx !== -1 && idx > currentStepIdx;
              const canClick = isFuture && !isTerminalStatus && !isActionLoading;

              return (
                <React.Fragment key={step.status}>
                  {idx > 0 && (
                    <ChevronRight
                      className={`h-3.5 w-3.5 shrink-0 ${
                        isPast
                          ? "text-emerald-500"
                          : isCurrent
                          ? "text-teal-500"
                          : "text-slate-300 dark:text-slate-700"
                      }`}
                    />
                  )}

                  <button
                    type="button"
                    disabled={!canClick && !isCurrent}
                    onClick={() => canClick && handleUpdateStatus(step.status, step.label)}
                    title={
                      isCurrent
                        ? `Trạng thái hiện tại: ${step.label}`
                        : canClick
                        ? `Nhấp để chuyển sang: ${step.label}`
                        : step.label
                    }
                    className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                      isCurrent
                        ? "bg-teal-600 text-white shadow-md ring-2 ring-teal-400 dark:bg-teal-500"
                        : isPast
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                        : isNext
                        ? "bg-white text-teal-700 border-2 border-teal-500 shadow-xs hover:bg-teal-50 hover:shadow-md cursor-pointer animate-pulse dark:bg-slate-800 dark:border-teal-400 dark:text-teal-300 dark:hover:bg-teal-950/50"
                        : canClick
                        ? "bg-white text-slate-700 border border-slate-200 hover:border-teal-300 hover:text-teal-600 cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-750"
                        : "bg-slate-100 text-slate-400 border border-slate-200/50 dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-600 cursor-not-allowed opacity-60"
                    }`}
                  >
                    {isPast ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span>{step.shortLabel}</span>
                    {isCurrent && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

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
            Khung giờ đặt chỗ & Vị trí bàn
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
        {(detail?.cancellationReason || currentData.status === ReservationStatus.Cancelled || currentData.status === ReservationStatus.NoShow) && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            <span className="font-bold block mb-0.5">Lý do hủy / ghi chú trạng thái:</span>
            <p>{detail?.cancellationReason || "Đã hủy theo yêu cầu"}</p>
            {detail?.cancelledAt && (
              <span className="text-[10px] text-rose-500 block mt-1">
                Thời điểm ghi nhận: {formatDate(detail.cancelledAt)}
              </span>
            )}
          </div>
        )}

        {/* Cancellation input prompt */}
        {showCancelPrompt && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs space-y-2 dark:border-rose-900 dark:bg-rose-950/50">
            <span className="font-bold text-rose-800 dark:text-rose-300 block">
              Xác nhận hủy lịch đặt bàn #{currentData.reservationCode}
            </span>
            <input
              type="text"
              placeholder="Nhập lý do hủy (khách đổi lịch, không liên lạc được, ...)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 dark:border-rose-800 dark:bg-slate-900 dark:text-white"
            />
            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                disabled={isActionLoading}
                onClick={() =>
                  handleUpdateStatus(
                    ReservationStatus.Cancelled,
                    "Đã hủy",
                    cancelReason || "Khách yêu cầu hủy"
                  )
                }
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-7"
              >
                Xác nhận hủy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelPrompt(false)}
                className="text-xs h-7"
              >
                Đóng
              </Button>
            </div>
          </div>
        )}

        {/* Status Histories */}
        {detail?.statusHistories && detail.statusHistories.length > 0 && (
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/40 space-y-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-slate-400" />
              Lịch sử cập nhật trạng thái ({detail.statusHistories.length})
            </span>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-36 overflow-y-auto">
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

        {/* Action Controls: Consecutive individual status buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            {!isTerminalStatus ? (
              <>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">
                  Chuyển trạng thái:
                </span>

                {/* Consecutive Status Buttons depending on current state */}
                {currentData.status === ReservationStatus.Pending && (
                  <>
                    <Button
                      size="sm"
                      disabled={isActionLoading}
                      onClick={() =>
                        handleUpdateStatus(ReservationStatus.Confirmed, "Đã xác nhận")
                      }
                      className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8.5 font-bold gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Xác nhận đặt bàn
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isActionLoading}
                      onClick={() =>
                        handleUpdateStatus(ReservationStatus.Seated, "Đã xếp bàn")
                      }
                      className="border-teal-500 text-teal-700 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-950/50 text-xs h-8.5 font-semibold gap-1"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Khách đến (Nhận bàn)
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isActionLoading}
                      onClick={() =>
                        handleUpdateStatus(
                          ReservationStatus.NoShow,
                          "Khách vắng mặt",
                          "Khách không đến (No-show)"
                        )
                      }
                      className="text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/50 text-xs h-8.5 gap-1"
                    >
                      <UserX className="h-3.5 w-3.5" />
                      Vắng mặt (No-Show)
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isActionLoading}
                      onClick={() => setShowCancelPrompt(true)}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs h-8.5 gap-1"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Hủy đặt bàn
                    </Button>
                  </>
                )}

                {currentData.status === ReservationStatus.Confirmed && (
                  <>
                    <Button
                      size="sm"
                      disabled={isActionLoading}
                      onClick={() =>
                        handleUpdateStatus(ReservationStatus.Seated, "Đã xếp bàn")
                      }
                      className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8.5 font-bold gap-1 shadow-xs"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Khách đến / Nhận bàn
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isActionLoading}
                      onClick={() =>
                        handleUpdateStatus(ReservationStatus.Completed, "Hoàn tất")
                      }
                      className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 text-xs h-8.5 font-semibold gap-1"
                    >
                      <CheckCheck className="h-3.5 w-3.5 text-indigo-500" />
                      Hoàn tất trực tiếp
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isActionLoading}
                      onClick={() =>
                        handleUpdateStatus(
                          ReservationStatus.NoShow,
                          "Khách vắng mặt",
                          "Khách không đến (No-show)"
                        )
                      }
                      className="text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/50 text-xs h-8.5 gap-1"
                    >
                      <UserX className="h-3.5 w-3.5" />
                      Vắng mặt (No-Show)
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isActionLoading}
                      onClick={() => setShowCancelPrompt(true)}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs h-8.5 gap-1"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Hủy đặt bàn
                    </Button>
                  </>
                )}

                {currentData.status === ReservationStatus.Seated && (
                  <>
                    <Button
                      size="sm"
                      disabled={isActionLoading}
                      onClick={() =>
                        handleUpdateStatus(
                          ReservationStatus.Completed,
                          "Hoàn tất & Trả bàn"
                        )
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8.5 font-bold gap-1.5 shadow-xs"
                    >
                      <CheckCheck className="h-4 w-4" />
                      Khách đã về (Trả bàn & Hoàn tất)
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isActionLoading}
                      onClick={() => setShowCancelPrompt(true)}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs h-8.5 gap-1"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Hủy lịch
                    </Button>
                  </>
                )}
              </>
            ) : (
              <span className="text-xs italic text-slate-400">
                Lịch đặt bàn đã kết thúc ({currentData.status}).
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${currentData.contactPhone}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 h-8.5"
            >
              <Phone className="h-3.5 w-3.5 text-teal-600" />
              Gọi
            </a>

            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8.5 text-xs">
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
