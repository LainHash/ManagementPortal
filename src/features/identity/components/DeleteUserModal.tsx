import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import type { UserResponse } from "@/types/identity.types";
import { usersApi } from "../api/users.api";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  user: UserResponse | null;
  mode?: "delete" | "restore";
}

export function DeleteUserModal({
  isOpen,
  onClose,
  onSuccess,
  user,
  mode = "delete",
}: DeleteUserModalProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const isDelete = mode === "delete";

  const handleConfirm = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = isDelete
        ? await usersApi.delete(user.id)
        : await usersApi.restore(user.id);

      if (res.isSucceed) {
        onSuccess(
          isDelete
            ? `Đã xoá mềm tài khoản @${user.userName}.`
            : `Đã khôi phục tài khoản @${user.userName}.`
        );
        onClose();
      } else {
        setErrorMsg(res.message || "Không thể thực hiện thao tác.");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMsg(
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi xử lý."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl ${
              isDelete
                ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {isDelete ? <Trash2 className="h-5 w-5" /> : <RotateCcw className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isDelete ? "Xác Nhận Xoá Tài Khoản" : "Xác Nhận Khôi Phục Tài Khoản"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Người dùng: @{user.userName} ({user.email})
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 text-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {isDelete ? (
            <>
              Bạn có chắc chắn muốn <strong>xoá người dùng</strong> này? Tài khoản sẽ chuyển sang
              trạng thái xoá mềm (Soft Deleted) và bị vô hiệu hoá. Dữ liệu lịch sử đơn hàng và đặt
              bàn vẫn được lưu giữ an toàn.
            </>
          ) : (
            <>
              Bạn có chắc chắn muốn <strong>khôi phục</strong> tài khoản người dùng này? Người dùng
              sẽ quay trở lại danh sách quản lý thông thường.
            </>
          )}
        </p>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Huỷ bỏ
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={handleConfirm}
            className={
              isDelete
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }
          >
            {isLoading
              ? "Đang xử lý..."
              : isDelete
              ? "Xoá tài khoản"
              : "Khôi phục tài khoản"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
