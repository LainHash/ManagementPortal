import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { DeactivationReasonType } from "@/types/enums";
import { AlertTriangle, Ban, Loader2 } from "lucide-react";

interface DeactivateModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTitle: string;
  onConfirm: (reasonType: DeactivationReasonType, reason: string) => Promise<void>;
}

export function DeactivateModal({
  isOpen,
  onClose,
  targetTitle,
  onConfirm,
}: DeactivateModalProps) {
  const [reasonType, setReasonType] = useState<DeactivationReasonType>(
    DeactivationReasonType.Other
  );
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do ngừng khai thác");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirm(reasonType, reason.trim());
      setReason("");
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể thực hiện thao tác ngừng khai thác."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Xác nhận ngừng khai thác`}
      description={`Ngừng khai thác đối với: ${targetTitle}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="rounded-xl border border-rose-200/80 bg-rose-50/70 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <span>
            Đối tượng sau khi ngừng khai thác sẽ không còn khả dụng để phục vụ hoặc tiếp nhận đơn đặt bàn. Thao tác này có thể khôi phục bất cứ lúc nào.
          </span>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-100 p-2.5 text-xs font-medium text-rose-800 dark:bg-rose-950 dark:text-rose-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Phân loại lý do <span className="text-rose-500">*</span>
          </label>
          <select
            value={reasonType}
            onChange={(e) =>
              setReasonType(e.target.value as DeactivationReasonType)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-rose-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value={DeactivationReasonType.Seasonal}>Theo mùa vụ (Seasonal)</option>
            <option value={DeactivationReasonType.AreaRenovation}>Cải tạo khu vực (AreaRenovation)</option>
            <option value={DeactivationReasonType.Understaffed}>Thiếu nhân sự (Understaffed)</option>
            <option value={DeactivationReasonType.DamagedAwaitingDisposal}>Hư hỏng chờ xử lý (Damaged)</option>
            <option value={DeactivationReasonType.EventSpace}>Dành cho sự kiện (EventSpace)</option>
            <option value={DeactivationReasonType.Other}>Lý do khác (Other)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Mô tả chi tiết lý do <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ghi rõ lý do ngừng khai thác để lưu lịch sử phục vụ đối soát..."
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-rose-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>

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
            className="gap-1.5 bg-rose-600 text-xs text-white hover:bg-rose-700 shadow-sm"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Ban className="h-3.5 w-3.5" />
            )}
            Xác nhận ngừng khai thác
          </Button>
        </div>
      </form>
    </Modal>
  );
}
