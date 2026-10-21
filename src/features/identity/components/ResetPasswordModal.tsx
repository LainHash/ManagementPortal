import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import type { UserResponse } from "@/types/identity.types";
import { usersApi } from "../api/users.api";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  user: UserResponse | null;
}

export function ResetPasswordModal({
  isOpen,
  onClose,
  onSuccess,
  user,
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("Mật khẩu mới phải từ 6 ký tự trở lên.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await usersApi.resetPassword(user.id, { newPassword });
      if (res.isSucceed) {
        onSuccess(`Đặt lại mật khẩu cho tài khoản @${user.userName} thành công!`);
        setNewPassword("");
        setConfirmPassword("");
        onClose();
      } else {
        setErrorMsg(res.message || "Không thể đặt lại mật khẩu.");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMsg(
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi đổi mật khẩu."
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
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Đặt Lại Mật Khẩu (Admin Force Reset)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tài khoản: @{user.userName} ({user.email})
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 text-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Mật khẩu mới <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Input
              id="admin-reset-password-input"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Tối thiểu 6 ký tự"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Xác nhận lại mật khẩu mới <span className="text-rose-500">*</span>
          </label>
          <Input
            id="admin-confirm-password-input"
            type={showPassword ? "text" : "password"}
            required
            placeholder="Nhập lại chính xác mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Huỷ bỏ
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isLoading ? "Đang xử lý..." : "Cập nhật mật khẩu mới"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
