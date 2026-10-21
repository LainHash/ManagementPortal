import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  itemName: string;
  description?: string;
  isRestore?: boolean;
  isLoading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  description,
  isRestore = false,
  isLoading = false,
}: DeleteConfirmModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          {isRestore ? (
            <RotateCcw className="h-5 w-5 text-indigo-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600" />
          )}
          <span>{title}</span>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {isRestore
            ? `Bạn có chắc chắn muốn khôi phục lại "${itemName}"?`
            : `Bạn có chắc chắn muốn xóa "${itemName}" khỏi hệ thống?`}
        </p>

        {description && (
          <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {description}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy bỏ
          </Button>
          <Button
            variant={isRestore ? "default" : "destructive"}
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            {isRestore ? (
              <>
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Khôi phục
              </>
            ) : (
              <>
                <Trash2 className="mr-1.5 h-4 w-4" />
                Xác nhận xóa
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
