import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Shield, Check, AlertCircle } from "lucide-react";
import type { UserResponse, RoleResponse } from "@/types/identity.types";
import { usersApi } from "../api/users.api";

interface UserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  user: UserResponse | null;
  roles: RoleResponse[];
}

export function UserRoleModal({
  isOpen,
  onClose,
  onSuccess,
  user,
  roles,
}: UserRoleModalProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setSelectedRoleId(user.roleId);
      setErrorMsg(null);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await usersApi.updateRole(user.id, { roleId: selectedRoleId });
      if (res.isSucceed) {
        onSuccess(`Đã thay đổi vai trò của người dùng @${user.userName} thành công!`);
        onClose();
      } else {
        setErrorMsg(res.message || "Không thể cập nhật vai trò.");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMsg(
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi đổi vai trò."
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
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Phân Quyền Vai Trò
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cập nhật quyền hạn cho tài khoản @{user.userName}
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 text-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-2">
          {roles.map((r) => {
            const isSelected = selectedRoleId === r.id;
            return (
              <label
                key={r.id}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-indigo-50/70 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-700 shadow-xs"
                    : "bg-white border-slate-200/80 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/50"
                }`}
              >
                <input
                  type="radio"
                  name="roleSelection"
                  value={r.id}
                  checked={isSelected}
                  onChange={() => setSelectedRoleId(r.id)}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {r.name}
                    </span>
                    {user.roleId === r.id && (
                      <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">
                        Hiện tại
                      </span>
                    )}
                  </div>
                  {r.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {r.description}
                    </p>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Huỷ
          </Button>
          <Button
            type="submit"
            disabled={isLoading || selectedRoleId === user.roleId}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isLoading ? "Đang lưu..." : "Xác nhận đổi vai trò"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
