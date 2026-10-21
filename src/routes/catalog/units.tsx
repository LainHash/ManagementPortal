import React, { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { catalogApi } from "@/features/catalog/api/catalog.api";
import { CatalogNav } from "@/features/catalog/components/CatalogNav";
import { UnitFormModal } from "@/features/catalog/components/UnitFormModal";
import { DeleteConfirmModal } from "@/features/catalog/components/DeleteConfirmModal";
import { CatalogAlert, type AlertState } from "@/features/catalog/components/CatalogAlert";
import { UnitTypeBadge } from "@/features/catalog/components/Badges";
import { useCatalogOptions } from "@/features/catalog/hooks/useCatalogOptions";
import { UnitType } from "@/types/enums";
import type {
  UnitResponse,
  CreateUnitRequest,
  UpdateUnitRequest,
} from "@/types/catalog.types";
import {
  Plus,
  Search,
  RotateCcw,
  Scale,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Hash,
  Beaker,
} from "lucide-react";

export function meta() {
  return [
    { title: "Quản lý Đơn vị tính | Restaurant Management Portal" },
    {
      name: "description",
      content: "Quản lý các đơn vị đo lường, tỷ lệ quy đổi trong pha chế, chế biến và thực đơn.",
    },
  ];
}

export default function UnitsPage() {
  const { categories, brands } = useCatalogOptions();

  const [units, setUnits] = useState<UnitResponse[]>([]);
  const [keyword, setKeyword] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingUnit, setEditingUnit] = useState<UnitResponse | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deletingUnit, setDeletingUnit] = useState<UnitResponse | null>(null);

  const fetchUnits = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await catalogApi.units.getAll({
        page: currentPage,
        pageSize,
        keyword: keyword.trim() || undefined,
      });

      if (res?.data) {
        let list = res.data;
        if (selectedType) {
          list = list.filter((u) => u.type === selectedType);
        }
        setUnits(list);
        setTotalItems(res.totalItems || list.length);
        setTotalPages(res.totalPages || Math.ceil((res.totalItems || list.length) / pageSize) || 1);
      } else {
        setUnits([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.message || "Không thể tải danh sách đơn vị tính.",
      });
      setUnits([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, keyword, selectedType]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleFormSubmit = async (
    payload: CreateUnitRequest | UpdateUnitRequest,
    id?: string
  ) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await catalogApi.units.update(id, payload as UpdateUnitRequest);
        setAlert({
          type: "success",
          message: `Đã cập nhật đơn vị tính "${payload.name}" thành công!`,
        });
      } else {
        await catalogApi.units.create(payload as CreateUnitRequest);
        setAlert({
          type: "success",
          message: `Đã thêm đơn vị tính mới "${payload.name}" thành công!`,
        });
      }
      setIsFormOpen(false);
      setEditingUnit(null);
      fetchUnits();
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUnit) return;
    setIsSubmitting(true);
    try {
      await catalogApi.units.delete(deletingUnit.id);
      setAlert({
        type: "success",
        message: `Đã xóa đơn vị tính "${deletingUnit.name}".`,
      });
      setIsDeleteOpen(false);
      setDeletingUnit(null);
      fetchUnits();
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Không thể xóa đơn vị tính này.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <CatalogNav
          title="Đơn vị tính & Đo lường"
          description="Thiết lập các đơn vị đo lường (kg, gram, lít, chai, suất...) phục vụ công thức chế biến và báo giá"
          stats={{
            totalUnits: totalItems,
            totalCategories: categories.length,
            totalBrands: brands.length,
          }}
          actions={
            <Button
              onClick={() => {
                setEditingUnit(null);
                setIsFormOpen(true);
              }}
              className="shadow-md shadow-indigo-600/20"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Thêm đơn vị mới
            </Button>
          }
        />

        {/* Search & Filter Bar */}
        <Card className="p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm theo tên đơn vị hoặc ký hiệu (kg, lít, phần...)"
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">-- Tất cả loại đại lượng --</option>
                <option value={UnitType.Quantity}>Số lượng</option>
                <option value={UnitType.Weight}>Khối lượng</option>
                <option value={UnitType.Volume}>Thể tích</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchUnits()}
                className="h-10"
              >
                <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline ml-1.5">Làm mới</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <RotateCcw className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-sm text-slate-500">Đang tải danh sách đơn vị tính...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && units.length === 0 && (
          <Card className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <Scale className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
              Chưa có đơn vị tính nào
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Định nghĩa các đơn vị tính cơ bản để phục vụ việc bán món và nhập kho định lượng.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => {
                  setEditingUnit(null);
                  setIsFormOpen(true);
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Thêm đơn vị mới ngay
              </Button>
            </div>
          </Card>
        )}

        {/* Units Table */}
        {!isLoading && units.length > 0 && (
          <Card className="overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-900/60 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Tên đơn vị tính</th>
                    <th className="px-5 py-3.5">Ký hiệu</th>
                    <th className="px-5 py-3.5">Loại đại lượng</th>
                    <th className="px-5 py-3.5">Tỷ lệ quy đổi</th>
                    <th className="px-5 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {units.map((unit) => (
                    <tr
                      key={unit.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400 font-semibold">
                            <Scale className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {unit.name}
                            </span>
                            <p className="text-[11px] font-mono text-slate-400">
                              ID: {unit.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {unit.symbol}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <UnitTypeBadge type={unit.type} />
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                        {unit.conversionRate}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingUnit(unit);
                              setIsFormOpen(true);
                            }}
                            className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                            title="Sửa đơn vị tính"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeletingUnit(unit);
                              setIsDeleteOpen(true);
                            }}
                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                            title="Xóa đơn vị tính"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Pagination */}
        {!isLoading && totalItems > pageSize && (
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-slate-500">
              Trang {currentPage} / {totalPages} (Tổng số {totalItems} đơn vị)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Modals */}
        <UnitFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingUnit(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingUnit}
          units={units}
          isLoading={isSubmitting}
        />

        <DeleteConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setDeletingUnit(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Xác nhận xóa đơn vị tính"
          itemName={`${deletingUnit?.name || "Đơn vị"} (${deletingUnit?.symbol || ""})`}
          description="Lưu ý: Các món ăn hoặc nguyên vật liệu đang dùng đơn vị này có thể bị ảnh hưởng."
          isLoading={isSubmitting}
        />

        <CatalogAlert alert={alert} onClose={() => setAlert(null)} />
      </div>
    </AdminLayout>
  );
}
