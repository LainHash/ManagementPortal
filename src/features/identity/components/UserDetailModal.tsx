import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Shield,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  Clock,
  KeyRound,
  Edit2,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Hash,
} from "lucide-react";
import type { UserDetailResponse, UserResponse } from "@/types/identity.types";
import { UserRoleBadge } from "./UserRoleBadge";
import { UserStatusBadge } from "./UserStatusBadge";
import { usersApi } from "../api/users.api";

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  onEdit?: (user: UserResponse) => void;
  onChangeRole?: (user: UserResponse) => void;
  onResetPassword?: (user: UserResponse) => void;
  onToggleStatus?: (user: UserResponse) => void;
}

export function UserDetailModal({
  isOpen,
  onClose,
  userId,
  onEdit,
  onChangeRole,
  onResetPassword,
  onToggleStatus,
}: UserDetailModalProps) {
  const [detail, setDetail] = useState<UserDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !userId) {
      setDetail(null);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    usersApi
      .getById(userId)
      .then((res) => {
        if (res.isSucceed && res.data) {
          setDetail(res.data);
        } else {
          setErrorMsg(res.message || "Không thể tải chi tiết người dùng.");
        }
      })
      .catch((err) => {
        setErrorMsg(err?.message || "Lỗi kết nối khi tải chi tiết người dùng.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const profile = detail?.personalProfile;
  const fullName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : detail?.userName || "Người dùng";

  // Derive initial letters for avatar
  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(-2)
    .join("")
    .toUpperCase();

  const userAsResponse: UserResponse | null = detail
    ? {
        id: detail.id,
        userName: detail.userName,
        email: detail.email,
        roleId: detail.roleId ?? 0,
        roleName: detail.roleName,
        isActive: detail.isActive ?? true,
        isDeleted: detail.isDeleted ?? false,
        fullName: profile ? `${profile.firstName} ${profile.lastName}`.trim() : null,
        phone: profile?.phone || null,
        createdAt: detail.createdAt ?? new Date().toISOString(),
      }
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {initials || <User className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{fullName}</span>
              {detail && (
                <UserStatusBadge
                  isActive={detail.isActive ?? true}
                  isDeleted={detail.isDeleted ?? false}
                />
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              @{detail?.userName || "username"} • {detail?.email}
            </p>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 rounded-full border-3 border-indigo-600/20 border-t-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500">Đang tải hồ sơ chi tiết...</p>
        </div>
      ) : errorMsg ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      ) : detail ? (
        <div className="space-y-6">
          {/* Top Quick Info Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                Vai trò hệ thống
              </span>
              <div className="mt-1">
                <UserRoleBadge roleName={detail.roleName} />
              </div>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                Ngày tham gia
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                {detail.createdAt
                  ? new Date(detail.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "Chưa rõ"}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                Mã định danh (PublicId)
              </span>
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-1 block truncate">
                {detail.id}
              </span>
            </div>
          </div>

          {/* Section 1: Thông tin tài khoản */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-indigo-500" />
              <span>Thông tin tài khoản</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 flex items-center gap-3">
                <User className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Tên đăng nhập</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {detail.userName}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Email liên hệ</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {detail.email}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Hồ sơ cá nhân */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-indigo-500" />
              <span>Hồ sơ cá nhân & Liên lạc</span>
            </h4>

            {profile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Số điện thoại</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {profile.phone || "Chưa cập nhật"}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Ngày sinh & Giới tính</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {profile.dateOfBirth || "Chưa cập nhật"} • {profile.gender ? "Nam" : "Nữ"}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-slate-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Số CCCD / CMND</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {profile.citizenCardId || "Chưa cập nhật"}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Khu vực / Thành phố</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {profile.city ? `${profile.city}, ${profile.country || "Việt Nam"}` : "Chưa cập nhật"}
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] text-slate-400">Địa chỉ thường trú</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {profile.address || "Chưa cập nhật"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                Người dùng chưa hoàn thiện hồ sơ cá nhân (PersonalProfile).
              </div>
            )}
          </div>

          {/* Quick Actions Toolbar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {onEdit && userAsResponse && (
                <Button
                  id="detail-edit-user-btn"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onEdit(userAsResponse);
                  }}
                  className="gap-1.5 text-xs"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Sửa thông tin</span>
                </Button>
              )}

              {onChangeRole && userAsResponse && (
                <Button
                  id="detail-change-role-btn"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onChangeRole(userAsResponse);
                  }}
                  className="gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Phân vai trò</span>
                </Button>
              )}

              {onResetPassword && userAsResponse && (
                <Button
                  id="detail-reset-pwd-btn"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onResetPassword(userAsResponse);
                  }}
                  className="gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Đổi mật khẩu</span>
                </Button>
              )}

              {onToggleStatus && userAsResponse && (
                <Button
                  id="detail-toggle-status-btn"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onToggleStatus(userAsResponse);
                  }}
                  className={`gap-1.5 text-xs ${
                    detail.isActive
                      ? "text-rose-600 dark:text-rose-400 hover:bg-rose-50"
                      : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50"
                  }`}
                >
                  {detail.isActive ? (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      <span>Khoá tài khoản</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="h-3.5 w-3.5" />
                      <span>Mở khoá</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            <Button id="detail-close-btn" variant="outline" size="sm" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
