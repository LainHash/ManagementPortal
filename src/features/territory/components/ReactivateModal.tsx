import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, PlayCircle } from "lucide-react";

interface ReactivateModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTitle: string;
  onConfirm: (note?: string) => Promise<void>;
}

export function ReactivateModal({
  isOpen,
  onClose,
  targetTitle,
  onConfirm,
}: ReactivateModalProps) {
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirm(note.trim() || undefined);
      setNote("");
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể thực hiện thao tác khôi phục khai thác."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Khôi phục khai thác"
      description={`Mở lại hoạt động đối với: ${targetTitle}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300 flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
          <span>
            Đối tượng sẽ được chuyển về trạng thái hoạt động bình thường, sẵn sàng đón khách hoặc phục vụ.
          </span>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-100 p-2.5 text-xs font-medium text-rose-800 dark:bg-rose-950 dark:text-rose-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Ghi chú khôi phục (Tùy chọn)
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ghi chú về việc khôi phục khai thác (ví dụ: đã sửa xong, hoàn thành sự kiện)..."
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
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
            className="gap-1.5 bg-emerald-600 text-xs text-white hover:bg-emerald-700 shadow-sm"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <PlayCircle className="h-3.5 w-3.5" />
            )}
            Xác nhận khôi phục
          </Button>
        </div>
      </form>
    </Modal>
  );
}
