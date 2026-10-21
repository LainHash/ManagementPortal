import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { communicationApi } from "../api/communication.api";
import { ContactStatusBadge, ContactEmailStatusBadge } from "./Badges";
import type {
  ContactMessageDetailResponse,
  ContactMessageResponse,
} from "@/types/communication.types";
import {
  MessageSquare,
  User,
  Mail,
  Phone,
  Clock,
  Shield,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  Send,
  Calendar,
} from "lucide-react";

interface ContactMessageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: ContactMessageResponse | null;
}

export function ContactMessageDetailModal({
  isOpen,
  onClose,
  message,
}: ContactMessageDetailModalProps) {
  const [detail, setDetail] = useState<ContactMessageDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && message?.id) {
      setIsLoading(true);
      communicationApi.contactMessages
        .getById(message.id)
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
  }, [isOpen, message?.id]);

  if (!message) return null;

  const currentData = detail || message;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Chưa có";
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

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const initials = currentData.fullName
    ? currentData.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : "KH";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Chi tiết liên hệ: {currentData.fullName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nhận lúc {formatDate(currentData.createdAt)}
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {isLoading && (
          <div className="flex items-center justify-center py-3 gap-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">Đang tải chi tiết kỹ thuật từ máy chủ...</span>
          </div>
        )}

        {/* Customer Header Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white shadow-xs">
              {initials}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {currentData.fullName}
                {currentData.customerId && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Thành viên
                  </span>
                )}
              </h4>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {currentData.email}
                  <button
                    onClick={() => copyToClipboard(currentData.email, "email")}
                    className="p-0.5 text-slate-400 hover:text-slate-600"
                    title="Sao chép email"
                  >
                    {copiedField === "email" ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </span>

                {currentData.phoneNumber && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {currentData.phoneNumber}
                    <button
                      onClick={() =>
                        copyToClipboard(currentData.phoneNumber!, "phone")
                      }
                      className="p-0.5 text-slate-400 hover:text-slate-600"
                      title="Sao chép SĐT"
                    >
                      {copiedField === "phone" ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ContactStatusBadge status={currentData.status} />
            <ContactEmailStatusBadge status={currentData.emailStatus} />
          </div>
        </div>

        {/* Message Content Box */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 border-b border-slate-100 pb-2 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Tiêu đề thông điệp
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {currentData.subject}
            </h3>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Nội dung phản hồi / yêu cầu
          </span>
          <div className="rounded-lg bg-slate-50/80 p-3.5 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap dark:bg-slate-800/60 dark:text-slate-200 font-sans border border-slate-100 dark:border-slate-800">
            {currentData.message}
          </div>
        </div>

        {/* System & Delivery Details */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
          {/* Email dispatch info */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50 space-y-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-blue-500" />
              Thông tin Email tự động
            </span>
            <div className="text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Trạng thái gửi:</span>
                <ContactEmailStatusBadge status={currentData.emailStatus} />
              </div>
              <div className="flex justify-between">
                <span>Thời điểm gửi:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {formatDate(currentData.emailSentAt)}
                </span>
              </div>
              {detail && detail.emailRetryCount > 0 && (
                <div className="flex justify-between">
                  <span>Số lần thử lại:</span>
                  <span className="font-semibold text-amber-600">
                    {detail.emailRetryCount} lần
                  </span>
                </div>
              )}
              {detail?.emailFailureReason && (
                <div className="mt-1 rounded bg-rose-50 p-1.5 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                  Lỗi: {detail.emailFailureReason}
                </div>
              )}
            </div>
          </div>

          {/* Device & Session metadata */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50 space-y-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Laptop className="h-3.5 w-3.5 text-indigo-500" />
              Thông tin thiết bị & phiên
            </span>
            <div className="text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Địa chỉ IP:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {detail?.ipAddress || "Không ghi nhận"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mã phiên (Session):</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[140px]" title={currentData.sessionId || ""}>
                  {currentData.sessionId || "—"}
                </span>
              </div>
              {detail?.userAgent && (
                <div className="truncate text-[11px] text-slate-400" title={detail.userAgent}>
                  {detail.userAgent}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin Notes (if available) */}
        {detail?.adminNotes && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs dark:border-amber-900 dark:bg-amber-950/40">
            <span className="font-bold text-amber-900 dark:text-amber-200 block mb-1">
              Ghi chú nội bộ:
            </span>
            <p className="text-amber-800 dark:text-amber-300 whitespace-pre-wrap">
              {detail.adminNotes}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap gap-2">
            <a
              href={`mailto:${currentData.email}?subject=${encodeURIComponent(
                `[Phản hồi từ Nhà hàng] ${currentData.subject}`
              )}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs"
            >
              <Send className="h-3.5 w-3.5" />
              Trả lời qua Email
            </a>

            {currentData.phoneNumber && (
              <a
                href={`tel:${currentData.phoneNumber}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                Gọi điện: {currentData.phoneNumber}
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
