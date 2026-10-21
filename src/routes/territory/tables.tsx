import React, { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { territoryApi } from "@/features/territory/api/territory.api";
import {
  TableStatusBadge,
  TableShapeBadge,
  AreaStatusBadge,
} from "@/features/territory/components/Badges";
import { TableFormModal } from "@/features/territory/components/TableFormModal";
import { AreaFormModal } from "@/features/territory/components/AreaFormModal";
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
import {
  TableStatus,
  TableShape,
  AreaStatus,
  DeactivationReasonType,
} from "@/types/enums";
import type {
  BranchResponse,
  AreaResponse,
  RestaurantTableResponse,
  CreateRestaurantTableRequest,
  UpdateRestaurantTableRequest,
  CreateAreaRequest,
  UpdateAreaRequest,
} from "@/types/territory.types";
import {
  TableProperties,
  MapPin,
  Building2,
  Search,
  RotateCcw,
  Plus,
  Edit2,
  Trash2,
  PlayCircle,
  PauseCircle,
  Ban,
  Wrench,
  History,
  Users,
  CheckCircle2,
  AlertTriangle,
  LayoutGrid,
  List,
  Layers,
  Sparkles,
  ArrowUpDown,
  Square,
} from "lucide-react";

export function meta() {
  return [
    { title: "Khu vực & Bàn ăn (Tables & Areas) | Restaurant Management Portal" },
    {
      name: "description",
      content: "Quản lý sơ đồ khu vực, danh sách bàn ăn, trạng thái phục vụ, ngừng khai thác và bảo trì bàn.",
    },
  ];
}

export default function TablesAndAreasPage() {
  // Tabs: 'tables' | 'areas'
  const [activeTab, setActiveTab] = useState<"tables" | "areas">("tables");

  // View mode for tables: 'grid' | 'table'
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Branches
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  // Areas
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");

  // Tables
  const [tables, setTables] = useState<RestaurantTableResponse[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedShape, setSelectedShape] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<AlertState | null>(null);

  // Modals for Tables
  const [isTableFormOpen, setIsTableFormOpen] = useState<boolean>(false);
  const [editingTable, setEditingTable] = useState<RestaurantTableResponse | null>(null);

  // Modals for Areas
  const [isAreaFormOpen, setIsAreaFormOpen] = useState<boolean>(false);
  const [editingArea, setEditingArea] = useState<AreaResponse | null>(null);

  // Generic Deactivation / Reactivation / History / Maintenance
  const [deactivateTarget, setDeactivateTarget] = useState<{
    type: "table" | "area";
    id: string;
    title: string;
  } | null>(null);

  const [reactivateTarget, setReactivateTarget] = useState<{
    type: "table" | "area";
    id: string;
    title: string;
  } | null>(null);

  const [historyTarget, setHistoryTarget] = useState<{
    type: "table" | "area";
    id: string;
    title: string;
  } | null>(null);

  const [maintenanceTarget, setMaintenanceTarget] = useState<{
    type: "table" | "area";
    id: string;
    title: string;
  } | null>(null);

  const [isCreateMaintenanceOpen, setIsCreateMaintenanceOpen] = useState<boolean>(false);
  const [isMaintenanceListOpen, setIsMaintenanceListOpen] = useState<boolean>(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "table" | "area";
    id: string;
    title: string;
  } | null>(null);

  // Load branches on mount
  useEffect(() => {
    territoryApi.branches
      .getAll({ pageSize: 100 })
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setBranches(res.data);
          setSelectedBranchId(res.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Areas when selectedBranchId changes
  const fetchAreas = useCallback(async () => {
    if (!selectedBranchId) {
      setAreas([]);
      return;
    }
    try {
      const res = await territoryApi.areas.getAll({
        branchId: selectedBranchId,
        pageSize: 100,
      });
      if (res?.data) {
        setAreas(res.data);
      } else {
        setAreas([]);
      }
    } catch {
      setAreas([]);
    }
  }, [selectedBranchId]);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  // Fetch Tables
  const fetchTables = useCallback(async () => {
    if (!selectedBranchId) {
      setTables([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await territoryApi.tables.getAll({
        branchId: selectedBranchId,
        areaId: selectedAreaId || undefined,
        pageSize: 200,
      });
      if (res?.data) {
        let list = res.data;
        if (selectedStatus) {
          list = list.filter((t) => t.status === selectedStatus);
        }
        if (selectedShape) {
          list = list.filter((t) => t.shape === selectedShape);
        }
        if (keyword.trim()) {
          const kw = keyword.trim().toLowerCase();
          list = list.filter((t) => t.tableNumber.toLowerCase().includes(kw));
        }
        setTables(list);
      } else {
        setTables([]);
      }
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Không thể tải danh sách bàn.",
      });
      setTables([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBranchId, selectedAreaId, selectedStatus, selectedShape, keyword]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Refresh current view
  const handleRefresh = () => {
    fetchAreas();
    fetchTables();
  };

  // Toggle Table Occupied status
  const handleToggleOccupied = async (table: RestaurantTableResponse) => {
    try {
      await territoryApi.tables.toggleOccupied(table.id);
      setAlert({
        type: "success",
        message: `Đã đổi trạng thái bàn #${table.tableNumber} sang ${
          table.status === TableStatus.Available ? "Đang có khách" : "Bàn trống"
        }.`,
      });
      fetchTables();
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Không thể cập nhật trạng thái bàn.",
      });
    }
  };

  // Save Table
  const handleSaveTable = async (
    data: CreateRestaurantTableRequest | UpdateRestaurantTableRequest
  ) => {
    if (editingTable) {
      await territoryApi.tables.update(editingTable.id, data as UpdateRestaurantTableRequest);
      setAlert({ type: "success", message: `Đã cập nhật bàn #${editingTable.tableNumber}.` });
    } else {
      await territoryApi.tables.create(data as CreateRestaurantTableRequest);
      setAlert({ type: "success", message: "Đã thêm bàn mới thành công." });
    }
    fetchTables();
  };

  // Save Area
  const handleSaveArea = async (
    data: CreateAreaRequest | UpdateAreaRequest
  ) => {
    if (editingArea) {
      await territoryApi.areas.update(editingArea.id, data as UpdateAreaRequest);
      setAlert({ type: "success", message: `Đã cập nhật khu vực: ${editingArea.name}.` });
    } else {
      await territoryApi.areas.create(data as CreateAreaRequest);
      setAlert({ type: "success", message: "Đã tạo khu vực mới thành công." });
    }
    fetchAreas();
  };

  // Deactivate handler (area or table)
  const handleConfirmDeactivate = async (
    reasonType: DeactivationReasonType,
    reason: string
  ) => {
    if (!deactivateTarget) return;
    if (deactivateTarget.type === "table") {
      await territoryApi.tables.deactivate(deactivateTarget.id, { reasonType, reason });
      setAlert({ type: "success", message: `Đã ngừng khai thác ${deactivateTarget.title}.` });
      fetchTables();
    } else {
      await territoryApi.areas.deactivate(deactivateTarget.id, { reasonType, reason });
      setAlert({ type: "success", message: `Đã ngừng khai thác ${deactivateTarget.title}.` });
      fetchAreas();
    }
  };

  // Reactivate handler (area or table)
  const handleConfirmReactivate = async (note?: string) => {
    if (!reactivateTarget) return;
    if (reactivateTarget.type === "table") {
      await territoryApi.tables.reactivate(reactivateTarget.id, { reactivationNote: note });
      setAlert({ type: "success", message: `Đã khôi phục khai thác ${reactivateTarget.title}.` });
      fetchTables();
    } else {
      await territoryApi.areas.reactivate(reactivateTarget.id, { reactivationNote: note });
      setAlert({ type: "success", message: `Đã khôi phục khai thác ${reactivateTarget.title}.` });
      fetchAreas();
    }
  };

  // Create Maintenance handler
  const handleConfirmCreateMaintenance = async (data: CreateMaintenanceFormData) => {
    if (!maintenanceTarget) return;
    if (maintenanceTarget.type === "table") {
      await territoryApi.tables.createMaintenance(maintenanceTarget.id, {
        restaurantTableId: maintenanceTarget.id,
        ...data,
      });
      setAlert({ type: "success", message: `Đã lên lịch bảo trì cho ${maintenanceTarget.title}.` });
      fetchTables();
    } else {
      await territoryApi.areas.createMaintenance(maintenanceTarget.id, {
        areaId: maintenanceTarget.id,
        ...data,
      });
      setAlert({ type: "success", message: `Đã lên lịch bảo trì cho ${maintenanceTarget.title}.` });
      fetchAreas();
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "table") {
        await territoryApi.tables.delete(deleteTarget.id);
        setAlert({ type: "success", message: `Đã xóa ${deleteTarget.title}.` });
        fetchTables();
      } else {
        await territoryApi.areas.delete(deleteTarget.id);
        setAlert({ type: "success", message: `Đã xóa ${deleteTarget.title}.` });
        fetchAreas();
      }
      setDeleteTarget(null);
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Không thể xóa đối tượng.",
      });
    }
  };

  // Stats for tables
  const availableCount = tables.filter((t) => t.status === TableStatus.Available).length;
  const occupiedCount = tables.filter((t) => t.status === TableStatus.Occupied).length;
  const maintenanceCount = tables.filter((t) => t.status === TableStatus.Maintenance).length;
  const inactiveCount = tables.filter((t) => t.status === TableStatus.Inactive).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Branch Selector */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <TableProperties className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Khu vực & Bàn ăn
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Điều phối sơ đồ bàn, tình trạng chỗ ngồi theo khu vực và lập kế hoạch bảo dưỡng
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Branch Selector Dropdown */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 shadow-2xs dark:border-slate-700 dark:bg-slate-900">
              <Building2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <select
                value={selectedBranchId}
                onChange={(e) => {
                  setSelectedBranchId(e.target.value);
                  setSelectedAreaId("");
                }}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden dark:text-slate-200"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.branchCode} - {b.address}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="gap-1.5 text-xs text-slate-600 dark:text-slate-300"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Tải lại
            </Button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("tables")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                activeTab === "tables"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <TableProperties className="h-3.5 w-3.5" />
              Bàn ăn ({tables.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("areas")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                activeTab === "areas"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Khu vực ({areas.length})
            </button>
          </div>

          <div>
            {activeTab === "tables" ? (
              <Button
                size="sm"
                onClick={() => {
                  setEditingTable(null);
                  setIsTableFormOpen(true);
                }}
                className="gap-1.5 bg-indigo-600 text-xs text-white hover:bg-indigo-700 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm bàn mới
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  setEditingArea(null);
                  setIsAreaFormOpen(true);
                }}
                className="gap-1.5 bg-indigo-600 text-xs text-white hover:bg-indigo-700 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm khu vực mới
              </Button>
            )}
          </div>
        </div>

        {/* TAB 1: TABLES */}
        {activeTab === "tables" && (
          <div className="space-y-4">
            {/* Stats Metrics Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
              <Card className="flex items-center gap-3.5 p-3.5 border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <TableProperties className="h-5 w-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Tổng số bàn
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {tables.length}
                  </p>
                </div>
              </Card>

              <Card className="flex items-center gap-3.5 p-3.5 border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Bàn trống (Available)
                  </p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {availableCount}
                  </p>
                </div>
              </Card>

              <Card className="flex items-center gap-3.5 p-3.5 border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                  <PlayCircle className="h-5 w-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Có khách (Occupied)
                  </p>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {occupiedCount}
                  </p>
                </div>
              </Card>

              <Card className="flex items-center gap-3.5 p-3.5 border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                  <Wrench className="h-5 w-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Bảo trì / Ngừng
                  </p>
                  <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                    {maintenanceCount + inactiveCount}
                  </p>
                </div>
              </Card>
            </div>

            {/* Filter Bar & View Toggle */}
            <Card className="p-3.5 border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Tìm số hiệu bàn (VD: T01)..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="pl-8 text-xs"
                    />
                  </div>

                  {/* Area Filter */}
                  <div className="w-40">
                    <select
                      value={selectedAreaId}
                      onChange={(e) => setSelectedAreaId(e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option value="">Tất cả khu vực</option>
                      {areas.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="w-36">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option value="">Tất cả trạng thái</option>
                      <option value={TableStatus.Available}>Bàn trống</option>
                      <option value={TableStatus.Occupied}>Đang có khách</option>
                      <option value={TableStatus.Maintenance}>Đang bảo trì</option>
                      <option value={TableStatus.Inactive}>Ngừng khai thác</option>
                    </select>
                  </div>

                  {/* Shape Filter */}
                  <div className="w-32">
                    <select
                      value={selectedShape}
                      onChange={(e) => setSelectedShape(e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option value="">Tất cả kiểu</option>
                      <option value={TableShape.Square}>Bàn vuông</option>
                      <option value={TableShape.Rectangle}>Chữ nhật</option>
                      <option value={TableShape.Round}>Bàn tròn</option>
                      <option value={TableShape.Long}>Bàn dài</option>
                    </select>
                  </div>

                  {(keyword || selectedAreaId || selectedStatus || selectedShape) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setKeyword("");
                        setSelectedAreaId("");
                        setSelectedStatus("");
                        setSelectedShape("");
                      }}
                      className="gap-1 text-xs text-rose-600 hover:bg-rose-50"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Xóa lọc
                    </Button>
                  )}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-0.5 dark:border-slate-800 self-end lg:self-auto">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      viewMode === "grid"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                    }`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Lưới
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      viewMode === "table"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                    Bảng
                  </button>
                </div>
              </div>
            </Card>

            {/* Tables Content */}
            {isLoading ? (
              <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <RotateCcw className="h-6 w-6 animate-spin text-indigo-600" />
                <p className="text-xs text-slate-500">Đang tải danh sách bàn...</p>
              </div>
            ) : tables.length === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
                <TableProperties className="h-8 w-8 text-slate-400" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Chưa có bàn nào trong bộ lọc này
                </p>
                <p className="text-xs text-slate-500">
                  Thử đổi bộ lọc hoặc thêm bàn mới vào khu vực.
                </p>
              </div>
            ) : viewMode === "grid" ? (
              /* Grid of Tables */
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {tables.map((t) => {
                  const isAvailable = t.status === TableStatus.Available;
                  const isOccupied = t.status === TableStatus.Occupied;

                  return (
                    <Card
                      key={t.id}
                      className="group relative flex flex-col justify-between overflow-hidden p-3.5 transition-all duration-200 hover:shadow-md border-slate-200/80 dark:border-slate-800"
                    >
                      <div>
                        {/* Header: Table number and shape */}
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                            #{t.tableNumber}
                          </span>
                          <TableShapeBadge shape={t.shape} />
                        </div>

                        {/* Area name & Capacity */}
                        <div className="space-y-1 mb-3 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">
                            <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{t.areaName || "Khu vực"}</span>
                          </div>
                          <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                            <Users className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                            <span>{t.capacity} chỗ ngồi</span>
                          </div>
                        </div>

                        <div className="mb-2">
                          <TableStatusBadge status={t.status} />
                        </div>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="border-t border-slate-100 pt-2 dark:border-slate-800 flex items-center justify-between gap-1">
                        {/* Toggle occupied */}
                        {(isAvailable || isOccupied) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleOccupied(t)}
                            title={isAvailable ? "Nhận khách (Occupied)" : "Trả bàn (Available)"}
                            className={`h-7 px-2 text-[11px] font-bold ${
                              isAvailable
                                ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            }`}
                          >
                            {isAvailable ? "Nhận khách" : "Trả bàn"}
                          </Button>
                        )}

                        <div className="flex items-center gap-0.5 ml-auto">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTable(t);
                              setIsTableFormOpen(true);
                            }}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                            title="Chỉnh sửa bàn"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>

                          {/* Deactivate / Reactivate */}
                          {t.status === TableStatus.Inactive ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setReactivateTarget({
                                  type: "table",
                                  id: t.id,
                                  title: `Bàn #${t.tableNumber}`,
                                })
                              }
                              className="h-7 w-7 p-0 text-emerald-600"
                              title="Khôi phục khai thác"
                            >
                              <PlayCircle className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setDeactivateTarget({
                                  type: "table",
                                  id: t.id,
                                  title: `Bàn #${t.tableNumber}`,
                                })
                              }
                              className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                              title="Ngừng khai thác"
                            >
                              <Ban className="h-3 w-3" />
                            </Button>
                          )}

                          {/* Maintenance */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setMaintenanceTarget({
                                type: "table",
                                id: t.id,
                                title: `Bàn #${t.tableNumber}`,
                              });
                              setIsMaintenanceListOpen(true);
                            }}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                            title="Lịch bảo trì bàn"
                          >
                            <Wrench className="h-3 w-3" />
                          </Button>

                          {/* History */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setHistoryTarget({
                                type: "table",
                                id: t.id,
                                title: `Bàn #${t.tableNumber}`,
                              })
                            }
                            className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                            title="Lịch sử ngừng khai thác"
                          >
                            <History className="h-3 w-3" />
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
                        <th className="px-4 py-3">Mã bàn</th>
                        <th className="px-4 py-3">Khu vực</th>
                        <th className="px-4 py-3 text-center">Sức chứa</th>
                        <th className="px-4 py-3">Kiểu dáng</th>
                        <th className="px-4 py-3">Trạng thái</th>
                        <th className="px-4 py-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {tables.map((t) => (
                        <tr
                          key={t.id}
                          className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        >
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            #{t.tableNumber}
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {t.areaName || "Khu vực"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              <Users className="h-3 w-3 text-indigo-500" />
                              {t.capacity}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <TableShapeBadge shape={t.shape} />
                          </td>
                          <td className="px-4 py-3">
                            <TableStatusBadge status={t.status} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Toggle Occupied */}
                              {(t.status === TableStatus.Available ||
                                t.status === TableStatus.Occupied) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleOccupied(t)}
                                  className="h-7 px-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                                >
                                  {t.status === TableStatus.Available
                                    ? "Nhận khách"
                                    : "Trả bàn"}
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingTable(t);
                                  setIsTableFormOpen(true);
                                }}
                                className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                                title="Chỉnh sửa"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>

                              {t.status === TableStatus.Inactive ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setReactivateTarget({
                                      type: "table",
                                      id: t.id,
                                      title: `Bàn #${t.tableNumber}`,
                                    })
                                  }
                                  className="h-7 w-7 p-0 text-emerald-600"
                                  title="Khôi phục"
                                >
                                  <PlayCircle className="h-3.5 w-3.5" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setDeactivateTarget({
                                      type: "table",
                                      id: t.id,
                                      title: `Bàn #${t.tableNumber}`,
                                    })
                                  }
                                  className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                                  title="Ngừng khai thác"
                                >
                                  <Ban className="h-3 w-3" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setMaintenanceTarget({
                                    type: "table",
                                    id: t.id,
                                    title: `Bàn #${t.tableNumber}`,
                                  });
                                  setIsMaintenanceListOpen(true);
                                }}
                                className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                                title="Bảo trì"
                              >
                                <Wrench className="h-3 w-3" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setHistoryTarget({
                                    type: "table",
                                    id: t.id,
                                    title: `Bàn #${t.tableNumber}`,
                                  })
                                }
                                className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                                title="Lịch sử ngừng"
                              >
                                <History className="h-3 w-3" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setDeleteTarget({
                                    type: "table",
                                    id: t.id,
                                    title: `Bàn #${t.tableNumber}`,
                                  })
                                }
                                className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                                title="Xóa bàn"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AREAS */}
        {activeTab === "areas" && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] uppercase tracking-wider font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3">Tên khu vực</th>
                      <th className="px-4 py-3">Mô tả</th>
                      <th className="px-4 py-3 text-center">Thứ tự hiển thị</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {areas.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          Chưa có khu vực nào trong chi nhánh này
                        </td>
                      </tr>
                    ) : (
                      areas.map((a) => (
                        <tr
                          key={a.id}
                          className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        >
                          <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Layers className="h-4 w-4 text-indigo-600 shrink-0" />
                            {a.name}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 max-w-sm truncate">
                            {a.description || "-"}
                          </td>
                          <td className="px-4 py-3.5 text-center font-bold text-slate-700 dark:text-slate-300">
                            {a.displayOrder}
                          </td>
                          <td className="px-4 py-3.5">
                            <AreaStatusBadge status={a.status} />
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingArea(a);
                                  setIsAreaFormOpen(true);
                                }}
                                className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                                title="Chỉnh sửa khu vực"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>

                              {a.status === AreaStatus.Inactive ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setReactivateTarget({
                                      type: "area",
                                      id: a.id,
                                      title: `Khu vực: ${a.name}`,
                                    })
                                  }
                                  className="h-7 w-7 p-0 text-emerald-600"
                                  title="Khôi phục khai thác"
                                >
                                  <PlayCircle className="h-3.5 w-3.5" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setDeactivateTarget({
                                      type: "area",
                                      id: a.id,
                                      title: `Khu vực: ${a.name}`,
                                    })
                                  }
                                  className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                                  title="Ngừng khai thác"
                                >
                                  <Ban className="h-3 w-3" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setMaintenanceTarget({
                                    type: "area",
                                    id: a.id,
                                    title: `Khu vực: ${a.name}`,
                                  });
                                  setIsMaintenanceListOpen(true);
                                }}
                                className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                                title="Lịch bảo trì"
                              >
                                <Wrench className="h-3 w-3" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setHistoryTarget({
                                    type: "area",
                                    id: a.id,
                                    title: `Khu vực: ${a.name}`,
                                  })
                                }
                                className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                                title="Lịch sử ngừng khai thác"
                              >
                                <History className="h-3 w-3" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setDeleteTarget({
                                    type: "area",
                                    id: a.id,
                                    title: `Khu vực: ${a.name}`,
                                  })
                                }
                                className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                                title="Xóa khu vực"
                              >
                                <Trash2 className="h-3 w-3" />
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
          </div>
        )}

        {/* MODALS */}

        {/* Table Form Modal */}
        <TableFormModal
          isOpen={isTableFormOpen}
          onClose={() => {
            setIsTableFormOpen(false);
            setEditingTable(null);
          }}
          table={editingTable}
          areas={areas}
          defaultAreaId={selectedAreaId || (areas.length > 0 ? areas[0].id : "")}
          onSave={handleSaveTable}
        />

        {/* Area Form Modal */}
        <AreaFormModal
          isOpen={isAreaFormOpen}
          onClose={() => {
            setIsAreaFormOpen(false);
            setEditingArea(null);
          }}
          area={editingArea}
          branches={branches}
          defaultBranchId={selectedBranchId}
          onSave={handleSaveArea}
        />

        {/* Deactivate Modal */}
        {deactivateTarget && (
          <DeactivateModal
            isOpen={true}
            onClose={() => setDeactivateTarget(null)}
            targetTitle={deactivateTarget.title}
            onConfirm={handleConfirmDeactivate}
          />
        )}

        {/* Reactivate Modal */}
        {reactivateTarget && (
          <ReactivateModal
            isOpen={true}
            onClose={() => setReactivateTarget(null)}
            targetTitle={reactivateTarget.title}
            onConfirm={handleConfirmReactivate}
          />
        )}

        {/* Deactivation History Modal */}
        {historyTarget && (
          <DeactivationHistoryModal
            isOpen={true}
            onClose={() => setHistoryTarget(null)}
            targetTitle={historyTarget.title}
            loadHistory={async () => {
              if (historyTarget.type === "table") {
                const res = await territoryApi.tables.getDeactivationHistory(
                  historyTarget.id
                );
                return (res?.data || []) as unknown as DeactivationHistoryRecord[];
              } else {
                const res = await territoryApi.areas.getDeactivationHistory(
                  historyTarget.id
                );
                return (res?.data || []) as unknown as DeactivationHistoryRecord[];
              }
            }}
          />
        )}

        {/* Maintenance List Modal */}
        {maintenanceTarget && (
          <MaintenanceListModal
            isOpen={isMaintenanceListOpen}
            onClose={() => {
              setIsMaintenanceListOpen(false);
              setMaintenanceTarget(null);
            }}
            targetTitle={maintenanceTarget.title}
            loadMaintenances={async () => {
              if (maintenanceTarget.type === "table") {
                const res = await territoryApi.tables.getMaintenances(
                  maintenanceTarget.id
                );
                return (res?.data || []) as unknown as MaintenanceRecord[];
              } else {
                const res = await territoryApi.areas.getMaintenances(
                  maintenanceTarget.id
                );
                return (res?.data || []) as unknown as MaintenanceRecord[];
              }
            }}
            onToggleComplete={async (mId) => {
              if (maintenanceTarget.type === "table") {
                await territoryApi.tables.toggleCompleteMaintenance(mId);
              } else {
                await territoryApi.areas.toggleCompleteMaintenance(mId);
              }
              setAlert({ type: "success", message: "Đã cập nhật trạng thái bảo trì." });
            }}
            onCancelMaintenance={async (mId) => {
              if (maintenanceTarget.type === "table") {
                await territoryApi.tables.cancelMaintenance(mId);
              } else {
                await territoryApi.areas.cancelMaintenance(mId);
              }
              setAlert({ type: "success", message: "Đã hủy lịch bảo trì." });
            }}
            onOpenCreate={() => {
              setIsMaintenanceListOpen(false);
              setIsCreateMaintenanceOpen(true);
            }}
          />
        )}

        {/* Create Maintenance Modal */}
        {maintenanceTarget && (
          <CreateMaintenanceModal
            isOpen={isCreateMaintenanceOpen}
            onClose={() => {
              setIsCreateMaintenanceOpen(false);
              setMaintenanceTarget(null);
            }}
            targetTitle={maintenanceTarget.title}
            onConfirm={handleConfirmCreateMaintenance}
          />
        )}

        {/* Delete Confirm Modal */}
        <DeleteConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          title="Xác nhận xóa"
          itemName={deleteTarget?.title || ""}
          description="Thao tác này sẽ đánh dấu xóa đối tượng khỏi hệ thống."
        />

        {/* Toast Alert */}
        <CatalogAlert alert={alert} onClose={() => setAlert(null)} />
      </div>
    </AdminLayout>
  );
}
