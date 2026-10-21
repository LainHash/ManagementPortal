import React, { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { territoryApi } from "@/features/territory/api/territory.api";
import { BranchStatusBadge } from "@/features/territory/components/Badges";
import { BranchFormModal } from "@/features/territory/components/BranchFormModal";
import { DeactivateModal } from "@/features/territory/components/DeactivateModal";
import { ReactivateModal } from "@/features/territory/components/ReactivateModal";
import {
  DeactivationHistoryModal,
  type DeactivationHistoryRecord,
} from "@/features/territory/components/DeactivationHistoryModal";
import {
  CreateMaintenanceModal,
  type CreateMaintenanceFormData,
} from "@/features/territory/components/CreateMaintenanceModal";
import {
  MaintenanceListModal,
  type MaintenanceRecord,
} from "@/features/territory/components/MaintenanceListModal";
import { CatalogAlert, type AlertState } from "@/features/catalog/components/CatalogAlert";
import { DeleteConfirmModal } from "@/features/catalog/components/DeleteConfirmModal";
import { BranchStatus, DeactivationReasonType } from "@/types/enums";
import type {
  BranchResponse,
  CreateBranchRequest,
  UpdateBranchRequest,
} from "@/types/territory.types";
import {
  Building2,
  Search,
  RotateCcw,
  Plus,
  Edit2,
  Trash2,
  PauseCircle,
  PlayCircle,
  Ban,
  Wrench,
  History,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ExternalLink,
} from "lucide-react";

export function meta() {
  return [
    { title: "Quản lý Chi nhánh (Branches) | Restaurant Management Portal" },
    {
      name: "description",
      content: "Theo dõi, quản lý danh sách chi nhánh, trạng thái hoạt động, ngừng khai thác và lịch bảo trì.",
    },
  ];
}

export default function BranchesPage() {
  // Data
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<AlertState | null>(null);

  // Filters
  const [keyword, setKeyword] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingBranch, setEditingBranch] = useState<BranchResponse | null>(null);

  const [isDeactivateOpen, setIsDeactivateOpen] = useState<boolean>(false);
  const [targetBranch, setTargetBranch] = useState<BranchResponse | null>(null);

  const [isReactivateOpen, setIsReactivateOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  const [isCreateMaintenanceOpen, setIsCreateMaintenanceOpen] =
    useState<boolean>(false);
  const [isMaintenanceListOpen, setIsMaintenanceListOpen] =
    useState<boolean>(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deletingBranch, setDeletingBranch] = useState<BranchResponse | null>(null);

  // Fetch branches
  const fetchBranches = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await territoryApi.branches.getAll({
        page: currentPage,
        pageSize,
        keyword: keyword.trim() || undefined,
      });

      if (res?.data) {
        let list = res.data;
        if (selectedCity) {
          list = list.filter((b) => b.city === selectedCity);
        }
        if (selectedStatus) {
          list = list.filter((b) => b.status === selectedStatus);
        }
        setBranches(list);
        setTotalItems(res.totalItems || list.length);
        setTotalPages(res.totalPages || Math.ceil((res.totalItems || list.length) / pageSize) || 1);
      } else {
        setBranches([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Không thể tải danh sách chi nhánh.",
      });
      setBranches([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, keyword, selectedCity, selectedStatus]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Unique cities list for filtering
  const cities = Array.from(new Set(branches.map((b) => b.city).filter(Boolean)));

  // Form Save
  const handleSaveBranch = async (
    data: CreateBranchRequest | UpdateBranchRequest
  ) => {
    if (editingBranch) {
      await territoryApi.branches.update(editingBranch.id, data as UpdateBranchRequest);
      setAlert({ type: "success", message: `Đã cập nhật chi nhánh #${editingBranch.branchCode} thành công.` });
    } else {
      await territoryApi.branches.create(data as CreateBranchRequest);
      setAlert({ type: "success", message: "Đã tạo mới chi nhánh thành công." });
    }
    fetchBranches();
  };

  // Toggle Temporarily Closed / Reopen
  const handleToggleTemporarilyClosed = async (branch: BranchResponse) => {
    try {
      if (branch.status === BranchStatus.TemporarilyClosed) {
        await territoryApi.branches.reopen(branch.id);
        setAlert({ type: "success", message: `Đã mở lại hoạt động chi nhánh #${branch.branchCode}.` });
      } else {
        await territoryApi.branches.closeTemporarily(branch.id);
        setAlert({ type: "success", message: `Đã tạm đóng cửa chi nhánh #${branch.branchCode}.` });
      }
      fetchBranches();
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Không thể cập nhật trạng thái hoạt động.",
      });
    }
  };

  // Deactivate
  const handleDeactivate = async (
    reasonType: DeactivationReasonType,
    reason: string
  ) => {
    if (!targetBranch) return;
    await territoryApi.branches.deactivate(targetBranch.id, { reasonType, reason });
    setAlert({ type: "success", message: `Đã ngừng khai thác chi nhánh #${targetBranch.branchCode}.` });
    fetchBranches();
  };

  // Reactivate
  const handleReactivate = async (note?: string) => {
    if (!targetBranch) return;
    await territoryApi.branches.reactivate(targetBranch.id, { reactivationNote: note });
    setAlert({ type: "success", message: `Đã khôi phục khai thác chi nhánh #${targetBranch.branchCode}.` });
    fetchBranches();
  };

  // Delete
  const handleDeleteBranch = async () => {
    if (!deletingBranch) return;
    try {
      await territoryApi.branches.delete(deletingBranch.id);
      setAlert({ type: "success", message: `Đã xóa chi nhánh #${deletingBranch.branchCode}.` });
      setIsDeleteOpen(false);
      setDeletingBranch(null);
      fetchBranches();
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Không thể xóa chi nhánh.",
      });
    }
  };

  // Create Maintenance
  const handleCreateMaintenance = async (data: CreateMaintenanceFormData) => {
    if (!targetBranch) return;
    await territoryApi.branches.createMaintenance(targetBranch.id, {
      branchId: targetBranch.id,
      ...data,
    });
    setAlert({ type: "success", message: `Đã lên lịch bảo trì cho chi nhánh #${targetBranch.branchCode}.` });
    fetchBranches();
  };

  // Counts
  const activeCount = branches.filter((b) => b.status === BranchStatus.Active).length;
  const maintenanceCount = branches.filter((b) => b.status === BranchStatus.Maintenance).length;
  const inactiveCount = branches.filter(
    (b) => b.status === BranchStatus.Inactive || b.status === BranchStatus.TemporarilyClosed
  ).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Quản lý Chi nhánh
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hệ thống các cơ sở nhà hàng, tình trạng khai thác mặt bằng và điều phối lịch bảo dưỡng
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBranches}
              disabled={isLoading}
              className="gap-1.5 text-xs text-slate-600 dark:text-slate-300"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Tải lại
            </Button>

            <Button
              size="sm"
              onClick={() => {
                setEditingBranch(null);
                setIsFormOpen(true);
              }}
              className="gap-1.5 bg-emerald-600 text-xs text-white hover:bg-emerald-700 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm chi nhánh
            </Button>
          </div>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          <Card className="flex items-center gap-3.5 p-4 border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                Tổng chi nhánh
              </p>
              <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {totalItems}
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-3.5 p-4 border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                Đang hoạt động
              </p>
              <p className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {activeCount}
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-3.5 p-4 border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                Đang bảo trì
              </p>
              <p className="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
                {maintenanceCount}
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-3.5 p-4 border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                Tạm đóng / Ngừng
              </p>
              <p className="text-xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                {inactiveCount}
              </p>
            </div>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Tìm mã chi nhánh, địa chỉ, số điện thoại..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="w-40">
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="">Tất cả tỉnh thành</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-40">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value={BranchStatus.Active}>Đang hoạt động</option>
                  <option value={BranchStatus.TemporarilyClosed}>Tạm đóng cửa</option>
                  <option value={BranchStatus.Maintenance}>Đang bảo trì</option>
                  <option value={BranchStatus.Inactive}>Ngừng khai thác</option>
                </select>
              </div>

              {(keyword || selectedCity || selectedStatus) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setKeyword("");
                    setSelectedCity("");
                    setSelectedStatus("");
                    setCurrentPage(1);
                  }}
                  className="gap-1 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                >
                  <RotateCcw className="h-3 w-3" />
                  Xóa lọc
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Branches Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] uppercase tracking-wider font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Chi nhánh
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Địa chỉ & Tỉnh thành
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Liên hệ
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Giờ mở cửa
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Đang tải danh sách chi nhánh...
                    </td>
                  </tr>
                ) : branches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Không tìm thấy chi nhánh nào
                    </td>
                  </tr>
                ) : (
                  branches.map((b) => (
                    <tr
                      key={b.id}
                      className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    >
                      {/* Branch Code */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              #{b.branchCode}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {b.city}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-start gap-1 max-w-xs">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">
                            {b.address}
                          </span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{b.phoneNumber || "-"}</span>
                          </div>
                          {b.email && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Mail className="h-3 w-3 text-slate-400" />
                              <span>{b.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Hours */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <Clock className="h-3.5 w-3.5 text-indigo-500" />
                          <span>
                            {b.openTime ? b.openTime.slice(0, 5) : "--"} -{" "}
                            {b.closeTime ? b.closeTime.slice(0, 5) : "--"}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <BranchStatusBadge status={b.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit */}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Chỉnh sửa thông tin"
                            onClick={() => {
                              setEditingBranch(b);
                              setIsFormOpen(true);
                            }}
                            className="h-7 w-7 p-0 text-slate-500 hover:text-indigo-600"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>

                          {/* Temporarily close / reopen */}
                          <Button
                            variant="ghost"
                            size="sm"
                            title={
                              b.status === BranchStatus.TemporarilyClosed
                                ? "Mở lại hoạt động"
                                : "Tạm đóng cửa"
                            }
                            onClick={() => handleToggleTemporarilyClosed(b)}
                            className="h-7 w-7 p-0 text-slate-500 hover:text-amber-600"
                          >
                            {b.status === BranchStatus.TemporarilyClosed ? (
                              <PlayCircle className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <PauseCircle className="h-3.5 w-3.5 text-amber-500" />
                            )}
                          </Button>

                          {/* Deactivate or Reactivate */}
                          {b.status === BranchStatus.Inactive ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Khôi phục khai thác"
                              onClick={() => {
                                setTargetBranch(b);
                                setIsReactivateOpen(true);
                              }}
                              className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-50"
                            >
                              <PlayCircle className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Ngừng khai thác"
                              onClick={() => {
                                setTargetBranch(b);
                                setIsDeactivateOpen(true);
                              }}
                              className="h-7 w-7 p-0 text-slate-500 hover:text-rose-600"
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </Button>
                          )}

                          {/* Deactivation History */}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Lịch sử ngừng khai thác"
                            onClick={() => {
                              setTargetBranch(b);
                              setIsHistoryOpen(true);
                            }}
                            className="h-7 w-7 p-0 text-slate-500 hover:text-indigo-600"
                          >
                            <History className="h-3.5 w-3.5" />
                          </Button>

                          {/* Maintenance List */}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Quản lý lịch bảo trì"
                            onClick={() => {
                              setTargetBranch(b);
                              setIsMaintenanceListOpen(true);
                            }}
                            className="h-7 w-7 p-0 text-slate-500 hover:text-indigo-600"
                          >
                            <Wrench className="h-3.5 w-3.5" />
                          </Button>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Xóa chi nhánh"
                            onClick={() => {
                              setDeletingBranch(b);
                              setIsDeleteOpen(true);
                            }}
                            className="h-7 w-7 p-0 text-slate-500 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        {/* Create / Edit Branch */}
        <BranchFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingBranch(null);
          }}
          branch={editingBranch}
          onSave={handleSaveBranch}
        />

        {/* Deactivate Branch */}
        {targetBranch && (
          <DeactivateModal
            isOpen={isDeactivateOpen}
            onClose={() => {
              setIsDeactivateOpen(false);
              setTargetBranch(null);
            }}
            targetTitle={`Chi nhánh #${targetBranch.branchCode} - ${targetBranch.address}`}
            onConfirm={handleDeactivate}
          />
        )}

        {/* Reactivate Branch */}
        {targetBranch && (
          <ReactivateModal
            isOpen={isReactivateOpen}
            onClose={() => {
              setIsReactivateOpen(false);
              setTargetBranch(null);
            }}
            targetTitle={`Chi nhánh #${targetBranch.branchCode} - ${targetBranch.address}`}
            onConfirm={handleReactivate}
          />
        )}

        {/* Deactivation History */}
        {targetBranch && (
          <DeactivationHistoryModal
            isOpen={isHistoryOpen}
            onClose={() => {
              setIsHistoryOpen(false);
              setTargetBranch(null);
            }}
            targetTitle={`Chi nhánh #${targetBranch.branchCode}`}
            loadHistory={async () => {
              const res = await territoryApi.branches.getDeactivationHistory(
                targetBranch.id
              );
              return (res?.data || []) as unknown as DeactivationHistoryRecord[];
            }}
          />
        )}

        {/* Maintenance List */}
        {targetBranch && (
          <MaintenanceListModal
            isOpen={isMaintenanceListOpen}
            onClose={() => {
              setIsMaintenanceListOpen(false);
              setTargetBranch(null);
            }}
            targetTitle={`Chi nhánh #${targetBranch.branchCode}`}
            loadMaintenances={async () => {
              const res = await territoryApi.branches.getMaintenances(
                targetBranch.id
              );
              return (res?.data || []) as unknown as MaintenanceRecord[];
            }}
            onToggleComplete={async (mId) => {
              await territoryApi.branches.toggleCompleteMaintenance(mId);
              setAlert({ type: "success", message: "Đã cập nhật trạng thái hoàn thành bảo trì." });
            }}
            onCancelMaintenance={async (mId) => {
              await territoryApi.branches.cancelMaintenance(mId);
              setAlert({ type: "success", message: "Đã hủy lịch bảo trì." });
            }}
            onOpenCreate={() => {
              setIsMaintenanceListOpen(false);
              setIsCreateMaintenanceOpen(true);
            }}
          />
        )}

        {/* Create Maintenance */}
        {targetBranch && (
          <CreateMaintenanceModal
            isOpen={isCreateMaintenanceOpen}
            onClose={() => {
              setIsCreateMaintenanceOpen(false);
              setTargetBranch(null);
            }}
            targetTitle={`Chi nhánh #${targetBranch.branchCode}`}
            onConfirm={handleCreateMaintenance}
          />
        )}

        {/* Delete Confirmation */}
        <DeleteConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setDeletingBranch(null);
          }}
          onConfirm={handleDeleteBranch}
          title="Xác nhận xóa chi nhánh"
          itemName={`Chi nhánh #${deletingBranch?.branchCode || ""} (${deletingBranch?.address || ""})`}
          description="Thao tác này sẽ đánh dấu xóa chi nhánh khỏi hệ thống."
        />

        {/* Toast Alert */}
        <CatalogAlert alert={alert} onClose={() => setAlert(null)} />
      </div>
    </AdminLayout>
  );
}
