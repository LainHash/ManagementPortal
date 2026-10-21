import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { DeactivationReasonBadge } from "./Badges";
import { DeactivationReasonType } from "@/types/enums";
import {
  History,
  Clock,
  User,
  CheckCircle2,
  Ban,
  FileText,
  Loader2,
  Calendar,
} from "lucide-react";

export interface DeactivationHistoryRecord {
  id: string;
  reasonType: DeactivationReasonType;
  reason: string;
  deactivatedAt: string;
  deactivatedBy: string;
  reactivatedAt?: string | null;
  reactivatedBy?: string | null;
  reactivationNote?: string | null;
  isActiveDeactivation: boolean;
}

interface DeactivationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTitle: string;
  loadHistory: () => Promise<DeactivationHistoryRecord[]>;
}

export function DeactivationHistoryModal({
  isOpen,
  onClose,
  targetTitle,
  loadHistory,
}: DeactivationHistoryModalProps) {
  const [history, setHistory] = useState<DeactivationHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      loadHistory()
        .then((data) => setHistory(data || []))
        .catch((err) => {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Không thể tải lịch sử ngừng khai thác."
          );
          setHistory([]);
        })
        .finally(() => setIsLoading(false));
    } else {
      setHistory([]);
    }
  }, [isOpen, loadHistory]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lịch sử ngừng khai thác"
      description={`Chi tiết các lần ngừng và khôi phục khai thác: ${targetTitle}`}
    >
      <div className="space-y-4 pt-2 max-h-[60vh] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <p className="text-xs text-slate-500">Đang tải lịch sử...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-rose-100 p-3 text-xs font-medium text-rose-800 dark:bg-rose-950 dark:text-rose-200">
            {error}
          </div>
        ) : history.length === 0 ? (
          <div className="flex h-36 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-800">
            <History className="h-6 w-6 text-slate-400" />
            <p className="text-xs text-slate-500">Chưa có lịch sử ngừng khai thác nào</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 pl-4 ml-2 dark:border-slate-700 space-y-5">
            {history.map((record, index) => (
              <div key={record.id || index} className="relative">
                {/* Node icon */}
                <div
                  className={`absolute -left-[23px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900 ${
                    record.isActiveDeactivation
                      ? "bg-rose-500 text-white"
                      : "bg-slate-400 text-white"
                  }`}
                >
                  <Ban className="h-2.5 w-2.5" />
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                  {/* Top: Reason badge and active tag */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <DeactivationReasonBadge reasonType={record.reasonType} />
                    {record.isActiveDeactivation ? (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        Đang áp dụng
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Đã khôi phục
                      </span>
                    )}
                  </div>

                  {/* Reason Text */}
                  <div className="text-xs text-slate-800 dark:text-slate-200 font-medium mb-2.5">
                    "{record.reason}"
                  </div>

                  {/* Deactivation details */}
                  <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 pt-2 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        Ngừng lúc: {formatDate(record.deactivatedAt)}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <User className="h-3 w-3 text-slate-400" />
                        {record.deactivatedBy || "Hệ thống"}
                      </span>
                    </div>

                    {/* Reactivation info if present */}
                    {record.reactivatedAt && (
                      <div className="mt-2 rounded-lg bg-emerald-50/70 p-2 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 space-y-0.5">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Khôi phục lúc: {formatDate(record.reactivatedAt)}
                          </span>
                          <span>Bởi: {record.reactivatedBy || "Hệ thống"}</span>
                        </div>
                        {record.reactivationNote && (
                          <div className="text-[11px] italic font-normal">
                            Ghi chú: {record.reactivationNote}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
