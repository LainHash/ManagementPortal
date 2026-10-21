import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MaintenanceStatus, MaintenanceType } from "@/types/enums";
import { Wrench, Calendar, Loader2, Clock } from "lucide-react";

export interface CreateMaintenanceFormData {
  startAt?: string;
  expectedCompletionAt?: string;
  reason: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
}

interface CreateMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTitle: string;
  onConfirm: (data: CreateMaintenanceFormData) => Promise<void>;
}

export function CreateMaintenanceModal({
  isOpen,
  onClose,
  targetTitle,
  onConfirm,
}: CreateMaintenanceModalProps) {
  const [type, setType] = useState<MaintenanceType>(MaintenanceType.Preventive);
  const [status, setStatus] = useState<MaintenanceStatus>(
    MaintenanceStatus.Scheduled
  );
  const [reason, setReason] = useState<string>("");
  const [startAt, setStartAt] = useState<string>("");
  const [expectedCompletionAt, setExpectedCompletionAt] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do và nội dung bảo trì.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirm({
        type,
        status,
        reason: reason.trim(),
        startAt: startAt ? new Date(startAt).toISOString() : undefined,
        expectedCompletionAt: expectedCompletionAt
          ? new Date(expectedCompletionAt).toISOString()
          : undefined,
      });
      // Reset form
      setReason("");
      setStartAt("");
      setExpectedCompletionAt("");
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tạo lịch bảo trì."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo lịch bảo trì"
      description={`Lên kế hoạch bảo trì kỹ thuật cho: ${targetTitle}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="rounded-lg bg-rose-100 p-2.5 text-xs font-medium text-rose-800 dark:bg-rose-950 dark:text-rose-200">
            {error}
          </div>
        )}

        {/* Type & Initial Status */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Loại hình bảo trì <span className="text-rose-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MaintenanceType)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value={MaintenanceType.Preventive}>Bảo trì định kỳ (Preventive)</option>
              <option value={MaintenanceType.Corrective}>Sửa chữa khắc phục (Corrective)</option>
              <option value={MaintenanceType.Emergency}>Sự cố khẩn cấp (Emergency)</option>
              <option value={MaintenanceType.Inspection}>Kiểm tra kỹ thuật (Inspection)</option>
              <option value={MaintenanceType.Renovation}>Nâng cấp cải tạo (Renovation)</option>
              <option value={MaintenanceType.Cleaning}>Vệ sinh tổng thể (Cleaning)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Trạng thái ban đầu
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value={MaintenanceStatus.Scheduled}>Đã lên lịch (Scheduled)</option>
              <option value={MaintenanceStatus.InProgress}>Bắt đầu ngay (InProgress)</option>
            </select>
          </div>
        </div>

        {/* Start At & Expected Completion At */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Thời gian bắt đầu
            </label>
            <Input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Dự kiến hoàn thành
            </label>
            <Input
              type="datetime-local"
              value={expectedCompletionAt}
              onChange={(e) => setExpectedCompletionAt(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        {/* Reason / Details */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Lý do & Nội dung bảo trì <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Mô tả các hạng mục cần bảo trì, sửa chữa, thay thế linh kiện..."
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="gap-1.5 bg-indigo-600 text-xs text-white hover:bg-indigo-700 shadow-sm"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Wrench className="h-3.5 w-3.5" />
            )}
            Lên lịch bảo trì
          </Button>
        </div>
      </form>
    </Modal>
  );
}
