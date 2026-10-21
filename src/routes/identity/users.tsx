import React, { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CatalogAlert, type AlertState } from "@/features/catalog/components/CatalogAlert";
import { usersApi } from "@/features/identity/api/users.api";
import { UserRoleBadge } from "@/features/identity/components/UserRoleBadge";
import { UserStatusBadge } from "@/features/identity/components/UserStatusBadge";
import { UserFormModal } from "@/features/identity/components/UserFormModal";
import { UserDetailModal } from "@/features/identity/components/UserDetailModal";
import { UserRoleModal } from "@/features/identity/components/UserRoleModal";
import { UserStatusModal } from "@/features/identity/components/UserStatusModal";
import { ResetPasswordModal } from "@/features/identity/components/ResetPasswordModal";
import { DeleteUserModal } from "@/features/identity/components/DeleteUserModal";
import type { UserResponse, RoleResponse, UserQueryParams } from "@/types/identity.types";
import {
  Users,
  UserPlus,
  Search,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  Edit2,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Phone,
  Mail,
  User,
  Sparkles,
} from "lucide-react";

export function meta() {
  return [
    { title: "Quản lý Người dùng & Tài khoản | Restaurant Management Portal" },
    {
      name: "description",
      content:
        "Quản lý danh sách người dùng, nhân sự, phân quyền vai trò (RBAC) và kiểm soát tài khoản hệ thống.",
    },
  ];
}

export default function UsersPage() {
  // Data
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<AlertState | null>(null);

  // Filters
  const [keyword, setKeyword] = useState<string>("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  const [targetRoleUser, setTargetRoleUser] = useState<UserResponse | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [targetStatusUser, setTargetStatusUser] = useState<UserResponse | null>(null);

  const [isResetPwdOpen, setIsResetPwdOpen] = useState<boolean>(false);
  const [targetResetUser, setTargetResetUser] = useState<UserResponse | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deleteMode, setDeleteMode] = useState<"delete" | "restore">("delete");
  const [targetDeleteUser, setTargetDeleteUser] = useState<UserResponse | null>(null);

  // Fetch Roles
  useEffect(() => {
    usersApi
      .getRoles()
      .then((res) => {
        if (res.isSucceed && Array.isArray(res.data)) {
          setRoles(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: UserQueryParams = {
        keyword: keyword.trim() || undefined,
        roleId: selectedRoleId ? Number(selectedRoleId) : undefined,
        isActive:
          selectedStatus === "active"
            ? true
            : selectedStatus === "inactive"
            ? false
            : undefined,
        isDeleted: selectedStatus === "deleted" ? true : false,
        page: currentPage,
        pageSize: pageSize,
        sortField: "created_at",
        isAscending: false,
      };

      const res = await usersApi.getAll(params);
      if (res.isSucceed && Array.isArray(res.data)) {
        setUsers(res.data);
        setTotalItems(res.totalItems ?? res.data.length);
        setTotalPages(res.totalPages ?? (Math.ceil((res.totalItems || res.data.length) / pageSize) || 1));
      } else {
        setUsers([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setAlert({
        type: "error",
        message: error?.response?.data?.message || "Không thể tải danh sách người dùng.",
      });
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, selectedRoleId, selectedStatus, currentPage, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleResetFilters = () => {
    setKeyword("");
    setSelectedRoleId("");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  // Helper Stats Calculation
  const activeCount = users.filter((u) => u.isActive && !u.isDeleted).length;
  const lockedCount = users.filter((u) => !u.isActive && !u.isDeleted).length;
  const staffCount = users.filter((u) => {
    const r = u.roleName.toLowerCase();
    return r === "superadmin" || r === "admin" || r === "manager" || r === "employee";
  }).length;

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        {/* Toast Alert */}
        <CatalogAlert alert={alert} onClose={() => setAlert(null)} />

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 right-40 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Phân hệ Danh tính & Phân quyền (RBAC)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Quản Lý Người Dùng & Nhân Sự
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Kiểm soát danh sách tài khoản, hồ sơ nhân viên, phân quyền truy cập theo vai trò
                và quản trị an toàn bảo mật toàn hệ thống.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                id="refresh-users-btn"
                variant="outline"
                onClick={() => fetchUsers()}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-2 text-xs sm:text-sm"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Làm mới</span>
              </Button>

              <Button
                id="create-user-btn"
                onClick={() => {
                  setEditingUser(null);
                  setIsFormOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 shadow-lg shadow-indigo-600/30 text-xs sm:text-sm"
              >
                <UserPlus className="h-4 w-4" />
                <span>Thêm tài khoản</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Tổng tài khoản
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {totalItems}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Đang hoạt động
                </span>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {activeCount}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Tài khoản bị khoá
                </span>
                <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                  {lockedCount}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Nhân sự & Quản trị
                </span>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  {staffCount}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="search-user-input"
                type="text"
                placeholder="Tìm kiếm theo tên đăng nhập, email, họ tên, số điện thoại..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Role Filter */}
              <div className="min-w-[150px]">
                <select
                  id="filter-role-select"
                  value={selectedRoleId}
                  onChange={(e) => {
                    setSelectedRoleId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Tất cả vai trò</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="min-w-[140px]">
                <select
                  id="filter-status-select"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Đang bị khoá</option>
                  <option value="deleted">Đã xoá mềm</option>
                </select>
              </div>

              {/* Reset Filters */}
              {(keyword || selectedRoleId || selectedStatus !== "all") && (
                <Button
                  id="reset-filter-btn"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Xoá lọc</span>
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* User Table List */}
        <Card className="rounded-2xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/75 dark:bg-slate-900/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Người dùng & Tài khoản</th>
                  <th className="py-3.5 px-4">Vai trò</th>
                  <th className="py-3.5 px-4">Số điện thoại</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4">Ngày tạo</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="h-8 w-8 rounded-full border-3 border-indigo-600/20 border-t-indigo-600 animate-spin" />
                        <span className="text-xs text-slate-400">Đang tải danh sách tài khoản...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                          <Users className="h-8 w-8" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          Không tìm thấy người dùng phù hợp
                        </h4>
                        <p className="text-xs text-slate-500">
                          Thử thay đổi bộ lọc tìm kiếm hoặc tạo một tài khoản mới để bắt đầu.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResetFilters}
                          className="mt-2 text-xs"
                        >
                          Xoá bộ lọc
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const fullName = u.fullName || u.userName;
                    const initials = fullName
                      .split(" ")
                      .map((w) => w[0])
                      .filter(Boolean)
                      .slice(-2)
                      .join("")
                      .toUpperCase();

                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* User & Account */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                              {initials || <User className="h-4 w-4" />}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                                <span>{u.fullName || `@${u.userName}`}</span>
                                {u.fullName && (
                                  <span className="text-[11px] font-normal text-slate-400 truncate">
                                    (@{u.userName})
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                                <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                                <span className="truncate">{u.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <UserRoleBadge roleName={u.roleName} />
                        </td>

                        {/* Phone */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {u.phone ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{u.phone}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Chưa có</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <UserStatusBadge isActive={u.isActive} isDeleted={u.isDeleted} />
                        </td>

                        {/* Created At */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-slate-500">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                            : "-"}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            {/* View Detail */}
                            <button
                              id={`view-user-${u.id}`}
                              title="Xem chi tiết hồ sơ"
                              onClick={() => {
                                setDetailUserId(u.id);
                                setIsDetailOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {/* Edit */}
                            <button
                              id={`edit-user-${u.id}`}
                              title="Chỉnh sửa thông tin"
                              onClick={() => {
                                setEditingUser(u);
                                setIsFormOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>

                            {/* Change Role */}
                            <button
                              id={`role-user-${u.id}`}
                              title="Phân vai trò (Role)"
                              onClick={() => {
                                setTargetRoleUser(u);
                                setIsRoleModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                            >
                              <ShieldCheck className="h-4 w-4" />
                            </button>

                            {/* Reset Password */}
                            <button
                              id={`reset-pwd-user-${u.id}`}
                              title="Đặt lại mật khẩu"
                              onClick={() => {
                                setTargetResetUser(u);
                                setIsResetPwdOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                            >
                              <KeyRound className="h-4 w-4" />
                            </button>

                            {/* Lock / Unlock */}
                            <button
                              id={`status-user-${u.id}`}
                              title={u.isActive ? "Khoá tài khoản" : "Mở khoá tài khoản"}
                              onClick={() => {
                                setTargetStatusUser(u);
                                setIsStatusModalOpen(true);
                              }}
                              className={`p-1.5 rounded-lg transition-colors ${
                                u.isActive
                                  ? "text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                                  : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                              }`}
                            >
                              {u.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                            </button>

                            {/* Delete or Restore */}
                            {u.isDeleted ? (
                              <button
                                id={`restore-user-${u.id}`}
                                title="Khôi phục tài khoản"
                                onClick={() => {
                                  setTargetDeleteUser(u);
                                  setDeleteMode("restore");
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                id={`delete-user-${u.id}`}
                                title="Xoá mềm tài khoản"
                                onClick={() => {
                                  setTargetDeleteUser(u);
                                  setDeleteMode("delete");
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {!isLoading && users.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-xs">
              <div className="text-slate-500">
                Hiển thị từ{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                đến{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {Math.min(currentPage * pageSize, totalItems)}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {totalItems}
                </span>{" "}
                tài khoản
              </div>

              <div className="flex items-center gap-2">
                <Button
                  id="prev-page-btn"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage <= 1}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Trang trước</span>
                </Button>

                <span className="px-2 text-slate-600 dark:text-slate-400 font-semibold">
                  {currentPage} / {totalPages}
                </span>

                <Button
                  id="next-page-btn"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="gap-1 text-xs"
                >
                  <span>Trang sau</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Modal 1: Create & Edit User Form */}
        <UserFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingUser(null);
          }}
          onSuccess={(msg) => {
            setAlert({ type: "success", message: msg });
            fetchUsers();
          }}
          userToEdit={editingUser}
          roles={roles}
        />

        {/* Modal 2: View User Profile Details */}
        <UserDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setDetailUserId(null);
          }}
          userId={detailUserId}
          onEdit={(u) => {
            setEditingUser(u);
            setIsFormOpen(true);
          }}
          onChangeRole={(u) => {
            setTargetRoleUser(u);
            setIsRoleModalOpen(true);
          }}
          onResetPassword={(u) => {
            setTargetResetUser(u);
            setIsResetPwdOpen(true);
          }}
          onToggleStatus={(u) => {
            setTargetStatusUser(u);
            setIsStatusModalOpen(true);
          }}
        />

        {/* Modal 3: Change User Role */}
        <UserRoleModal
          isOpen={isRoleModalOpen}
          onClose={() => {
            setIsRoleModalOpen(false);
            setTargetRoleUser(null);
          }}
          onSuccess={(msg) => {
            setAlert({ type: "success", message: msg });
            fetchUsers();
          }}
          user={targetRoleUser}
          roles={roles}
        />

        {/* Modal 4: Lock / Unlock User Account */}
        <UserStatusModal
          isOpen={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            setTargetStatusUser(null);
          }}
          onSuccess={(msg) => {
            setAlert({ type: "success", message: msg });
            fetchUsers();
          }}
          user={targetStatusUser}
        />

        {/* Modal 5: Admin Force Reset Password */}
        <ResetPasswordModal
          isOpen={isResetPwdOpen}
          onClose={() => {
            setIsResetPwdOpen(false);
            setTargetResetUser(null);
          }}
          onSuccess={(msg) => {
            setAlert({ type: "success", message: msg });
          }}
          user={targetResetUser}
        />

        {/* Modal 6: Delete & Restore Confirmation */}
        <DeleteUserModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setTargetDeleteUser(null);
          }}
          onSuccess={(msg) => {
            setAlert({ type: "success", message: msg });
            fetchUsers();
          }}
          user={targetDeleteUser}
          mode={deleteMode}
        />
      </div>
    </AdminLayout>
  );
}
