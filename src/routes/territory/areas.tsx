import React, { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { territoryApi } from "@/features/territory/api/territory.api";
import { AreaStatusBadge } from "@/features/territory/components/Badges";
import { AreaFormModal } from "@/features/territory/components/AreaFormModal";
import { AreaDetailModal } from "@/features/territory/components/AreaDetailModal";
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
import { AreaStatus, DeactivationReasonType } from "@/types/enums";
import type {
  AreaResponse,
  BranchResponse,
  CreateAreaRequest,
  UpdateAreaRequest,
} from "@/types/territory.types";
import {
  Layers,
  Building2,
  Search,
  RotateCcw,
  Plus,
  Edit2,
  Trash2,
  Ban,
  PlayCircle,
  Wrench,
  History,
  Eye,
  CheckCircle2,
  AlertTriangle,
  LayoutGrid,
  List,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function meta() {
  return [
    { title: "Quản lý Khu vực (Areas) | Restaurant Management Portal" },
    {
      name: "description",
      content: "Theo dõi, quản lý danh sách khu vực mặt bằng nhà hàng, trạng thái khai thác, ngừng khai thác và bảo dưỡng.",
    },
  ];
}

export default function AreasPage() {
  // View mode: 'table' | 'grid'
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Branches
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  // Areas
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<AlertState | null>(null);

  // Filters
  const [keyword, setKeyword] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Detail Modal
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [viewingArea, setViewingArea] = useState<AreaResponse | null>(null);

  // Form Modal
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingArea, setEditingArea] = useState<AreaResponse | null>(null);

  // Deactivate / Reactivate / History
  const [targetArea, setTargetArea] = useState<AreaResponse | null>(null);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState<boolean>(false);
  const [isReactivateOpen, setIsReactivateOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Maintenance
  const [isCreateMaintenanceOpen, setIsCreateMaintenanceOpen] = useState<boolean>(false);
  const [isMaintenanceListOpen, setIsMaintenanceListOpen] = useState<boolean>(false);

  // Delete
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deletingArea, setDeletingArea] = useState<AreaResponse | null>(null);

  // Load branches on mount
  useEffect(() => {
    territoryApi.branches
      .getAll({ pageSize: 100 })
      .then((res) => {
        if (res?.data) {
          setBranches(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch areas
  const fetchAreas = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await territoryApi.areas.getAll({
        branchId: selectedBranchId || undefined,
        keyword: keyword.trim() || undefined,
        page: currentPage,
        pageSize,
      });

      if (res?.data) {
        let list = res.data;
        if (selectedStatus) {
          list = list.filter((a) => a.status === selectedStatus);
        }
        setAreas(list);
        setTotalItems(res.totalItems || list.length);
        setTotalPages(
          res.totalPages ||
            Math.ceil((res.totalItems || list.length) / pageSize) ||
            1
        );
      } else {
        setAreas([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      setAlert({
        type: "error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải danh sách khu vực.",
      });
      setAreas([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBranchId, keyword, selectedStatus, currentPage, pageSize]);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  // Save Area (Create / Update)
  const handleSaveArea = async (
    data: CreateAreaRequest | UpdateAreaRequest
  ) => {
    if (editingArea) {
      await territoryApi.areas.update(editingArea.id, data as UpdateAreaRequest);
      setAlert({
        type: "success",
        message: `Đã cập nhật khu vực: ${editingArea.name}.`,
      });
    } else {
      await territoryApi.areas.create(data as CreateAreaRequest);
      setAlert({
        type: "success",
        message: "Đã tạo khu vực mới thành công.",
      });
    }
    fetchAreas();
  };

  // Deactivate
  const handleDeactivate = async (
    reasonType: DeactivationReasonType,
    reason: string
  ) => {
    if (!targetArea) return;
    await territoryApi.areas.deactivate(targetArea.id, { reasonType, reason });
    setAlert({
      type: "success",
      message: `Đã ngừng khai thác khu vực: ${targetArea.name}.`,
    });
    fetchAreas();
  };

  // Reactivate
  const handleReactivate = async (note?: string) => {
    if (!targetArea) return;
    await territoryApi.areas.reactivate(targetArea.id, { reactivationNote: note });
    setAlert({
      type: "success",
      message: `Đã khôi phục khai thác khu vực: ${targetArea.name}.`,
    });
    fetchAreas();
  };

  // Delete
  const handleDeleteArea = async () => {
    if (!deletingArea) return;
    try {
      await territoryApi.areas.delete(deletingArea.id);
      setAlert({
        type: "success",
        message: `Đã xóa khu vực: ${deletingArea.name}.`,
      });
      setIsDeleteOpen(false);
      setDeletingArea(null);
      fetchAreas();
    } catch (err: any) {
      setAlert({
        type: "error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Không thể xóa khu vực.",
      });
    }
  };

  // Create Maintenance
  const handleCreateMaintenance = async (data: CreateMaintenanceFormData) => {
    if (!targetArea) return;
    await territoryApi.areas.createMaintenance(targetArea.id, {
      areaId: targetArea.id,
      ...data,
    });
    setAlert({
      type: "success",
      message: `Đã lên lịch bảo trì cho khu vực: ${targetArea.name}.`,
    });
    fetchAreas();
  };

  // Open detail modal
  const handleOpenDetail = (area: AreaResponse) => {
    setViewingArea(area);
    setIsDetailOpen(true);
  };

  // Find branch helper
  const getBranchInfo = (branchId?: string | null) => {
    if (!branchId) return null;
    return branches.find((b) => b.id === branchId) || null;
  };

  // Metrics
  const activeCount = areas.filter((a) => a.status === AreaStatus.Active).length;
  const maintenanceCount = areas.filter(
    (a) => a.status === AreaStatus.Maintenance
  ).length;
  const inactiveCount = areas.filter(
    (a) => a.status === AreaStatus.Inactive
  ).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Quản lý Khu vực (Areas)
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Phân chia không gian mặt bằng nhà hàng, sảnh tiệc, phòng VIP, sân vườn và điều phối kế hoạch bảo dưỡng
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAreas}
              disabled={isLoading}
              className="gap-1.5 text-xs text-slate-600 dark:text-slate-300"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Tải lại
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  viewMode === "table"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Bảng</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  viewMode === "grid"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Lưới</span>
              </button>
            </div>

            <Button
              size="sm"
              onClick={() => {
                setEditingArea(null);
                setIsFormOpen(true);
              }}
              className="gap-1.5 bg-indigo-600 text-xs text-white hover:bg-indigo-700 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm khu vực
            </Button>
          </div>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          <Card className="flex items-center gap-3.5 p-4 border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Layers className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                Tổng khu vực
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
                Ngừng khai thác
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
                placeholder="Tìm tên khu vực, mô tả không gian..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Branch filter */}
              <div className="w-44">
                <select
                  value={selectedBranchId}
                  onChange={(e) => {
                    setSelectedBranchId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="">Tất cả chi nhánh</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.branchCode} - {b.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div className="w-36">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value={AreaStatus.Active}>Hoạt động</option>
                  <option value={AreaStatus.Maintenance}>Bảo trì</option>
                  <option value={AreaStatus.Inactive}>Ngừng khai thác</option>
                </select>
              </div>

              {(keyword || selectedBranchId || selectedStatus) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setKeyword("");
                    setSelectedBranchId("");
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

        {/* Content Section */}
        {isLoading ? (
          <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <RotateCcw className="h-6 w-6 animate-spin text-indigo-600" />
            <p className="text-xs text-slate-500">Đang tải danh sách khu vực...</p>
          </div>
        ) : areas.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
            <Layers className="h-8 w-8 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Không tìm thấy khu vực nào
            </p>
            <p className="text-xs text-slate-500">
              Thử thay đổi bộ lọc hoặc thêm khu vực mới cho chi nhánh.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {areas.map((a) => {
              const branch = getBranchInfo(a.branchId);

              return (
                <Card
                  key={a.id}
                  className="group relative flex flex-col justify-between overflow-hidden p-4 transition-all duration-200 hover:shadow-md border-slate-200/80 dark:border-slate-800"
                >
                  <div>
                    {/* Header: Area name and Status badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        onClick={() => handleOpenDetail(a)}
                        className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors cursor-pointer truncate"
                      >
                        {a.name}
                      </span>
                      <AreaStatusBadge status={a.status} />
                    </div>

                    {/* Branch & Display Order */}
                    <div className="space-y-1 mb-2.5 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 truncate">
                        <Building2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          {branch?.branchCode ? `${branch.branchCode} - ${branch.city}` : "Chi nhánh"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span>Thứ tự: #{a.displayOrder}</span>
                        <span
                          className={`font-semibold ${
                            a.isActive ? "text-emerald-600" : "text-slate-400"
                          }`}
                        >
                          {a.isActive ? "Đang bật" : "Tắt"}
                        </span>
                      </div>
                    </div>

                    {/* Description preview */}
                    {a.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic mb-3">
                        "{a.description}"
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="border-t border-slate-100 pt-2.5 dark:border-slate-800 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDetail(a)}
                      className="h-7 gap-1 px-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Chi tiết</span>
                    </Button>

                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Chỉnh sửa khu vực"
                        onClick={() => {
                          setEditingArea(a);
                          setIsFormOpen(true);
                        }}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>

                      {a.status === AreaStatus.Inactive ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Khôi phục khai thác"
                          onClick={() => {
                            setTargetArea(a);
                            setIsReactivateOpen(true);
                          }}
                          className="h-7 w-7 p-0 text-emerald-600"
                        >
                          <PlayCircle className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Ngừng khai thác"
                          onClick={() => {
                            setTargetArea(a);
                            setIsDeactivateOpen(true);
                          }}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                        >
                          <Ban className="h-3 w-3" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        title="Lịch bảo trì"
                        onClick={() => {
                          setTargetArea(a);
                          setIsMaintenanceListOpen(true);
                        }}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                      >
                        <Wrench className="h-3 w-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        title="Lịch sử ngừng khai thác"
                        onClick={() => {
                          setTargetArea(a);
                          setIsHistoryOpen(true);
                        }}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                      >
                        <History className="h-3 w-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        title="Xóa khu vực"
                        onClick={() => {
                          setDeletingArea(a);
                          setIsDeleteOpen(true);
                        }}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] uppercase tracking-wider font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Tên khu vực
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Chi nhánh
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Mô tả
                    </th>
                    <th scope="col" className="px-4 py-3 text-center">
                      Thứ tự
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
                  {areas.map((a) => {
                    const branch = getBranchInfo(a.branchId);

                    return (
                      <tr
                        key={a.id}
                        className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(a)}
                            className="font-bold text-slate-900 hover:text-indigo-600 hover:underline dark:text-white flex items-center gap-2"
                          >
                            <Layers className="h-4 w-4 text-indigo-600 shrink-0" />
                            {a.name}
                          </button>
                        </td>

                        <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                          {branch?.branchCode ? `${branch.branchCode} - ${branch.city}` : "Chi nhánh"}
                        </td>

                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 max-w-sm truncate">
                          {a.description || "-"}
                        </td>

                        <td className="px-4 py-3.5 text-center font-bold text-slate-700 dark:text-slate-300">
                          #{a.displayOrder}
                        </td>

                        <td className="px-4 py-3.5">
                          <AreaStatusBadge status={a.status} />
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDetail(a)}
                              className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                              title="Chi tiết"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingArea(a);
                                setIsFormOpen(true);
                              }}
                              className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>

                            {a.status === AreaStatus.Inactive ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setTargetArea(a);
                                  setIsReactivateOpen(true);
                                }}
                                className="h-7 w-7 p-0 text-emerald-600"
                                title="Khôi phục"
                              >
                                <PlayCircle className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setTargetArea(a);
                                  setIsDeactivateOpen(true);
                                }}
                                className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                                title="Ngừng khai thác"
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setTargetArea(a);
                                setIsMaintenanceListOpen(true);
                              }}
                              className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                              title="Lịch bảo trì"
                            >
                              <Wrench className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setTargetArea(a);
                                setIsHistoryOpen(true);
                              }}
                              className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                              title="Lịch sử ngừng"
                            >
                              <History className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeletingArea(a);
                                setIsDeleteOpen(true);
                              }}
                              className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                              title="Xóa khu vực"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODALS */}
        {/* Detail Modal */}
        <AreaDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setViewingArea(null);
          }}
          area={viewingArea}
          branch={viewingArea ? getBranchInfo(viewingArea.branchId) : null}
        />

        {/* Form Modal */}
        <AreaFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingArea(null);
          }}
          area={editingArea}
          branches={branches}
          defaultBranchId={selectedBranchId}
          onSave={handleSaveArea}
        />

        {/* Deactivate Modal */}
        {targetArea && (
          <DeactivateModal
            isOpen={isDeactivateOpen}
            onClose={() => {
              setIsDeactivateOpen(false);
              setTargetArea(null);
            }}
            targetTitle={`Khu vực: ${targetArea.name}`}
            onConfirm={handleDeactivate}
          />
        )}

        {/* Reactivate Modal */}
        {targetArea && (
          <ReactivateModal
            isOpen={isReactivateOpen}
            onClose={() => {
              setIsReactivateOpen(false);
              setTargetArea(null);
            }}
            targetTitle={`Khu vực: ${targetArea.name}`}
            onConfirm={handleReactivate}
          />
        )}

        {/* Deactivation History Modal */}
        {targetArea && (
          <DeactivationHistoryModal
            isOpen={isHistoryOpen}
            onClose={() => {
              setIsHistoryOpen(false);
              setTargetArea(null);
            }}
            targetTitle={`Khu vực: ${targetArea.name}`}
            loadHistory={async () => {
              const res = await territoryApi.areas.getDeactivationHistory(
                targetArea.id
              );
              return (res?.data || []) as unknown as DeactivationHistoryRecord[];
            }}
          />
        )}

        {/* Maintenance List Modal */}
        {targetArea && (
          <MaintenanceListModal
            isOpen={isMaintenanceListOpen}
            onClose={() => {
              setIsMaintenanceListOpen(false);
              setTargetArea(null);
            }}
            targetTitle={`Khu vực: ${targetArea.name}`}
            loadMaintenances={async () => {
              const res = await territoryApi.areas.getMaintenances(
                targetArea.id
              );
              return (res?.data || []) as unknown as MaintenanceRecord[];
            }}
            onToggleComplete={async (mId) => {
              await territoryApi.areas.toggleCompleteMaintenance(mId);
              setAlert({
                type: "success",
                message: "Đã cập nhật trạng thái hoàn thành bảo trì.",
              });
            }}
            onCancelMaintenance={async (mId) => {
              await territoryApi.areas.cancelMaintenance(mId);
              setAlert({
                type: "success",
                message: "Đã hủy lịch bảo trì.",
              });
            }}
            onOpenCreate={() => {
              setIsMaintenanceListOpen(false);
              setIsCreateMaintenanceOpen(true);
            }}
          />
        )}

        {/* Create Maintenance Modal */}
        {targetArea && (
          <CreateMaintenanceModal
            isOpen={isCreateMaintenanceOpen}
            onClose={() => {
              setIsCreateMaintenanceOpen(false);
              setTargetArea(null);
            }}
            targetTitle={`Khu vực: ${targetArea.name}`}
            onConfirm={handleCreateMaintenance}
          />
        )}

        {/* Delete Confirm Modal */}
        <DeleteConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setDeletingArea(null);
          }}
          onConfirm={handleDeleteArea}
          title="Xác nhận xóa khu vực"
          itemName={`Khu vực: ${deletingArea?.name || ""}`}
          description="Thao tác này sẽ đánh dấu xóa khu vực khỏi hệ thống."
        />

        {/* Toast Alert */}
        <CatalogAlert alert={alert} onClose={() => setAlert(null)} />
      </div>
    </AdminLayout>
  );
}
