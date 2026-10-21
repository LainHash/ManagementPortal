import React, { useEffect, useState, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  MaintenanceStatusBadge,
  MaintenanceTypeBadge,
} from "./Badges";
import { MaintenanceStatus, MaintenanceType } from "@/types/enums";
import {
  Wrench,
  Calendar,
  Clock,
  Plus,
  Check,
  Ban,
  Loader2,
  AlertCircle,
} from "lucide-react";

export interface MaintenanceRecord {
  id: string;
  reason: string;
  status: MaintenanceStatus;
  type: MaintenanceType;
  startAt?: string | null;
  expectedCompletionAt?: string | null;
  createdAt?: string;
}

interface MaintenanceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTitle: string;
  loadMaintenances: () => Promise<MaintenanceRecord[]>;
  onToggleComplete: (id: string) => Promise<void>;
  onCancelMaintenance: (id: string) => Promise<void>;
  onOpenCreate: () => void;
}

export function MaintenanceListModal({
  isOpen,
  onClose,
  targetTitle,
  loadMaintenances,
  onToggleComplete,
  onCancelMaintenance,
  onOpenCreate,
}: MaintenanceListModalProps) {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(() => {
    setIsLoading(true);
    setError(null);
    loadMaintenances()
      .then((data) => setRecords(data || []))
      .catch((err) => {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Không thể tải danh sách bảo trì."
        );
        setRecords([]);
      })
      .finally(() => setIsLoading(false));
  }, [loadMaintenances]);

  useEffect(() => {
    if (isOpen) {
      fetchRecords();
    } else {
      setRecords([]);
    }
  }, [isOpen, fetchRecords]);

  const handleToggle = async (id: string) => {
    setActionId(id);
    try {
      await onToggleComplete(id);
      fetchRecords();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể cập nhật trạng thái hoàn thành."
      );
    } finally {
      setActionId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn hủy lịch bảo trì này?")) return;
    setActionId(id);
    try {
      await onCancelMaintenance(id);
      fetchRecords();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể hủy lịch bảo trì."
      );
    } finally {
      setActionId(null);
    }
  };

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

  const filteredRecords = filterStatus
    ? records.filter((r) => r.status === filterStatus)
    : records;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quản lý lịch bảo trì"
      description={`Danh sách các đợt bảo trì, bảo dưỡng của: ${targetTitle}`}
    >
      <div className="space-y-4 pt-1 max-h-[65vh] overflow-y-auto pr-1">
        {/* Top bar: Status Filter & Button New Maintenance */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="">Tất cả trạng thái</option>
              <option value={MaintenanceStatus.Scheduled}>Đã lên lịch</option>
              <option value={MaintenanceStatus.InProgress}>Đang thực hiện</option>
              <option value={MaintenanceStatus.Completed}>Đã hoàn thành</option>
              <option value={MaintenanceStatus.Cancelled}>Đã hủy</option>
            </select>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={onOpenCreate}
            className="gap-1.5 bg-indigo-600 text-xs text-white hover:bg-indigo-700 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Tạo lịch bảo trì mới
          </Button>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-100 p-2.5 text-xs font-medium text-rose-800 dark:bg-rose-950 dark:text-rose-200">
            {error}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <p className="text-xs text-slate-500">Đang tải danh sách bảo trì...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex h-36 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-800">
            <Wrench className="h-6 w-6 text-slate-400" />
            <p className="text-xs text-slate-500">
              Không có đợt bảo trì nào phù hợp
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((item) => {
              const canAction =
                item.status === MaintenanceStatus.Scheduled ||
                item.status === MaintenanceStatus.InProgress;
              const isWorking = actionId === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 flex flex-col justify-between gap-3"
                >
                  <div>
                    {/* Header: Type and Status */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <MaintenanceTypeBadge type={item.type} />
                        <MaintenanceStatusBadge status={item.status} />
                      </div>
                    </div>

                    {/* Reason */}
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-100">
                      {item.reason}
                    </p>

                    {/* Time Window */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-indigo-500" />
                        Bắt đầu: {formatDate(item.startAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        Dự kiến xong: {formatDate(item.expectedCompletionAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions for Scheduled / InProgress */}
                  {canAction && (
                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isWorking}
                        onClick={() => handleCancel(item.id)}
                        className="h-7 gap-1 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                      >
                        <Ban className="h-3 w-3" />
                        Hủy lịch
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        disabled={isWorking}
                        onClick={() => handleToggle(item.id)}
                        className="h-7 gap-1 bg-emerald-600 text-xs text-white hover:bg-emerald-700 shadow-2xs"
                      >
                        {isWorking ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                        Đánh dấu hoàn thành
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
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
