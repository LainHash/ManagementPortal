import React, { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { inventoryApi } from "@/features/inventory/api/inventory.api";
import { CatalogNav } from "@/features/catalog/components/CatalogNav";
import { IngredientCard } from "@/features/inventory/components/IngredientCard";
import { IngredientFormModal } from "@/features/inventory/components/IngredientFormModal";
import { IngredientDetailModal } from "@/features/inventory/components/IngredientDetailModal";
import { IngredientBranchPriceModal } from "@/features/inventory/components/IngredientBranchPriceModal";
import { IngredientBranchStockModal } from "@/features/inventory/components/IngredientBranchStockModal";
import { DeleteConfirmModal } from "@/features/catalog/components/DeleteConfirmModal";
import { CatalogAlert, type AlertState } from "@/features/catalog/components/CatalogAlert";
import { StockStatusBadge } from "@/features/catalog/components/Badges";
import { useInventoryOptions } from "@/features/inventory/hooks/useInventoryOptions";
import { StockStatus } from "@/types/enums";
import type {
  IngredientResponse,
  CreateIngredientRequest,
  UpdateIngredientRequest,
} from "@/types/inventory.types";
import {
  Plus,
  Search,
  RotateCcw,
  LayoutGrid,
  List,
  Wheat,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  DollarSign,
  Boxes,
  Building2,
  CheckCircle2,
  XCircle,
  PackageCheck,
} from "lucide-react";

export function meta() {
  return [
    { title: "Quản lý Kho Nguyên liệu | Restaurant Management Portal" },
    {
      name: "description",
      content: "Quản lý danh sách nguyên vật liệu, đơn giá nhập theo chi nhánh và định mức tồn kho.",
    },
  ];
}

export default function IngredientsPage() {
  // Inventory options (categories, brands, units, branches)
  const { categories, brands, units, branches } = useInventoryOptions();

  // View mode: grid vs table
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filter & Search states
  const [keyword, setKeyword] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Ingredients data
  const [ingredients, setIngredients] = useState<IngredientResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingIngredient, setEditingIngredient] = useState<IngredientResponse | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [viewingIngredient, setViewingIngredient] = useState<IngredientResponse | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deletingIngredient, setDeletingIngredient] = useState<IngredientResponse | null>(null);

  const [isPriceModalOpen, setIsPriceModalOpen] = useState<boolean>(false);
  const [priceModalIngredient, setPriceModalIngredient] = useState<IngredientResponse | null>(null);

  const [isStockModalOpen, setIsStockModalOpen] = useState<boolean>(false);
  const [stockModalIngredient, setStockModalIngredient] = useState<IngredientResponse | null>(null);

  // Fetch ingredients
  const fetchIngredients = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await inventoryApi.ingredients.getAll({
        page: currentPage,
        pageSize,
        keyword: keyword.trim() || undefined,
        branchId: selectedBranch || undefined,
        categoryId: selectedCategory || undefined,
        brandId: selectedBrand || undefined,
      });

      if (res?.data) {
        let list = res.data;

        // In-memory filter for stock status if specified
        if (selectedStockStatus) {
          list = list.filter((i) => i.stockStatus === selectedStockStatus);
        }

        setIngredients(list);
        setTotalItems(res.totalItems || list.length);
        setTotalPages(res.totalPages || Math.ceil((res.totalItems || list.length) / pageSize) || 1);
      } else {
        setIngredients([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Không thể tải danh sách nguyên liệu.",
      });
      setIngredients([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, keyword, selectedBranch, selectedCategory, selectedBrand, selectedStockStatus]);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  // Set default branch on first load if branches available and none selected
  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0].id);
    }
  }, [branches, selectedBranch]);

  // Handle Create / Update Submit
  const handleFormSubmit = async (
    data: CreateIngredientRequest | UpdateIngredientRequest,
    id?: string
  ) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await inventoryApi.ingredients.update(id, data as UpdateIngredientRequest);
        setAlert({
          type: "success",
          message: `Đã cập nhật thông tin nguyên liệu "${data.name}" thành công!`,
        });
      } else {
        await inventoryApi.ingredients.create(data as CreateIngredientRequest);
        setAlert({
          type: "success",
          message: `Đã thêm nguyên liệu "${data.name}" vào hệ thống kho thành công!`,
        });
      }
      setIsFormOpen(false);
      setEditingIngredient(null);
      fetchIngredients();
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deletingIngredient) return;
    setIsSubmitting(true);
    try {
      await inventoryApi.ingredients.delete(deletingIngredient.id);
      setAlert({
        type: "success",
        message: `Đã xóa nguyên liệu "${deletingIngredient.name}" khỏi hệ thống.`,
      });
      setIsDeleteOpen(false);
      setDeletingIngredient(null);
      fetchIngredients();
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Không thể xóa nguyên liệu này.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setKeyword("");
    setSelectedCategory("");
    setSelectedBrand("");
    setSelectedStockStatus("");
    setCurrentPage(1);
  };

  // Selected branch name
  const currentBranchName = branches.find((b) => b.id === selectedBranch)?.address;

  // Stats calculation
  const availableCount = ingredients.filter((i) => i.stockStatus === StockStatus.Available).length;
  const lowStockCount = ingredients.filter((i) => i.stockStatus === StockStatus.LowStock).length;
  const outOfStockCount = ingredients.filter((i) => i.stockStatus === StockStatus.OutOfStock).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <CatalogNav
          title="Kho Nguyên Liệu"
          description="Quản lý định lượng, đơn giá chi nhánh và trạng thái tồn kho thời gian thực"
          stats={{
            totalIngredients: totalItems,
            totalCategories: categories.length,
            totalBrands: brands.length,
            totalUnits: units.length,
          }}
          actions={
            <Button
              onClick={() => {
                setEditingIngredient(null);
                setIsFormOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-md shadow-emerald-600/20"
            >
              <Plus className="h-4 w-4" />
              Thêm nguyên liệu mới
            </Button>
          }
        />

        {/* Branch Context Selector & Statistics Bar */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="flex flex-col justify-between p-4 bg-gradient-to-br from-emerald-500/10 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 border-emerald-200/60 dark:border-emerald-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Tổng số nguyên liệu
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Wheat className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {totalItems}
              </span>
              <span className="text-xs text-slate-400">mặt hàng</span>
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-4 bg-gradient-to-br from-teal-500/10 via-white to-white dark:from-teal-950/20 dark:via-slate-900 dark:to-slate-900 border-teal-200/60 dark:border-teal-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Còn hàng khả dụng
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                <PackageCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">
                {availableCount}
              </span>
              <span className="text-xs text-slate-400">đang sẵn sàng</span>
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-4 bg-gradient-to-br from-amber-500/10 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 border-amber-200/60 dark:border-amber-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Cảnh báo sắp hết
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                {lowStockCount}
              </span>
              <span className="text-xs text-slate-400">cần nhập bổ sung</span>
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-4 bg-gradient-to-br from-rose-500/10 via-white to-white dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900 border-rose-200/60 dark:border-rose-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Đã hết hàng
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                <XCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                {outOfStockCount}
              </span>
              <span className="text-xs text-slate-400">mặt hàng cạn kho</span>
            </div>
          </Card>
        </div>

        {/* Filter Toolbar Card */}
        <Card className="p-4 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setCurrentPage(1);
                    fetchIngredients();
                  }
                }}
                placeholder="Tìm kiếm theo tên nguyên liệu, danh mục, xuất xứ..."
                className="pl-9 pr-4 text-sm"
              />
            </div>

            {/* Branch selector */}
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {branches.length === 0 ? (
                  <option value="">Chưa có chi nhánh</option>
                ) : (
                  branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.branchCode} - {b.address}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-1 dark:border-slate-800">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-emerald-600 text-white hover:bg-emerald-700 h-8 w-8 p-0" : "h-8 w-8 p-0 text-slate-500"}
                title="Dạng lưới"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className={viewMode === "table" ? "bg-emerald-600 text-white hover:bg-emerald-700 h-8 w-8 p-0" : "h-8 w-8 p-0 text-slate-500"}
                title="Dạng bảng"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Secondary Filters */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="flex items-center gap-1 font-semibold text-slate-500">
              <Filter className="h-3.5 w-3.5" />
              Bộ lọc:
            </span>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Brand filter */}
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="">Tất cả thương hiệu</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Stock Status filter */}
            <select
              value={selectedStockStatus}
              onChange={(e) => {
                setSelectedStockStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="">Tất cả trạng thái kho</option>
              <option value={StockStatus.Available}>Còn hàng</option>
              <option value={StockStatus.LowStock}>Sắp hết hàng</option>
              <option value={StockStatus.OutOfStock}>Hết hàng</option>
            </select>

            {/* Reset Filters button */}
            {(keyword || selectedCategory || selectedBrand || selectedStockStatus) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-7 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </Card>

        {/* Content Section: Loading vs Empty vs Grid/Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Wheat className="h-10 w-10 text-emerald-500 animate-bounce" />
            <span className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
              Đang tải danh sách nguyên vật liệu...
            </span>
          </div>
        ) : ingredients.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-4">
              <Wheat className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Không tìm thấy nguyên liệu nào
            </h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm dark:text-slate-400">
              {keyword || selectedCategory || selectedBrand || selectedStockStatus
                ? "Không có nguyên liệu nào khớp với bộ lọc đã chọn. Hãy thử điều chỉnh hoặc xóa bộ lọc."
                : "Hệ thống kho chưa có nguyên liệu nào. Hãy bắt đầu bằng cách thêm nguyên liệu mới."}
            </p>
            <div className="mt-5 flex gap-2">
              {keyword || selectedCategory || selectedBrand || selectedStockStatus ? (
                <Button variant="outline" onClick={handleResetFilters} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Xóa bộ lọc
                </Button>
              ) : null}
              <Button
                onClick={() => {
                  setEditingIngredient(null);
                  setIsFormOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <Plus className="h-4 w-4" />
                Thêm nguyên liệu đầu tiên
              </Button>
            </div>
          </Card>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ingredients.map((item) => (
              <IngredientCard
                key={item.id}
                ingredient={item}
                onViewDetail={(ing) => {
                  setViewingIngredient(ing);
                  setIsDetailOpen(true);
                }}
                onEdit={(ing) => {
                  setEditingIngredient(ing);
                  setIsFormOpen(true);
                }}
                onDelete={(ing) => {
                  setDeletingIngredient(ing);
                  setIsDeleteOpen(true);
                }}
                onUpdatePrice={(ing) => {
                  setPriceModalIngredient(ing);
                  setIsPriceModalOpen(true);
                }}
                onUpdateStock={(ing) => {
                  setStockModalIngredient(ing);
                  setIsStockModalOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="px-4 py-3.5">
                      Nguyên liệu
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Danh mục
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Đơn vị
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Thương hiệu
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Đơn giá chi nhánh
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Khả dụng
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Trạng thái
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ingredients.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/40"
                    >
                      {/* Name & Icon */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <Wheat className="h-4 w-4" />
                          </div>
                          <div>
                            <span
                              onClick={() => {
                                setViewingIngredient(item);
                                setIsDetailOpen(true);
                              }}
                              className="font-semibold text-slate-900 hover:text-emerald-600 cursor-pointer dark:text-white dark:hover:text-emerald-400"
                            >
                              {item.name}
                            </span>
                            {item.description && (
                              <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                        {item.categoryName}
                      </td>

                      {/* Unit */}
                      <td className="px-4 py-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {item.unitSymbol || item.unitName}
                      </td>

                      {/* Brand */}
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                        {item.brandName || "—"}
                      </td>

                      {/* Unit Price */}
                      <td className="px-4 py-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {item.unitPrice !== undefined && item.unitPrice !== null
                          ? `${item.unitPrice.toLocaleString("vi-VN")} ${item.currency || "đ"}`
                          : "Chưa đặt"}
                      </td>

                      {/* Available Stock */}
                      <td className="px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-200">
                        {item.availableQuantity !== null && item.availableQuantity !== undefined
                          ? item.availableQuantity
                          : 0}{" "}
                        <span className="text-[11px] font-normal text-slate-400">
                          {item.unitSymbol}
                        </span>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="px-4 py-3">
                        <StockStatusBadge status={item.stockStatus} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPriceModalIngredient(item);
                              setIsPriceModalOpen(true);
                            }}
                            className="h-8 px-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                            title="Cập nhật giá chi nhánh"
                          >
                            <DollarSign className="h-3.5 w-3.5 mr-1" />
                            Giá
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setStockModalIngredient(item);
                              setIsStockModalOpen(true);
                            }}
                            className="h-8 px-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                            title="Cập nhật tồn kho"
                          >
                            <Boxes className="h-3.5 w-3.5 mr-1" />
                            Kho
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setViewingIngredient(item);
                              setIsDetailOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingIngredient(item);
                              setIsFormOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingIngredient(item);
                              setIsDeleteOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                            title="Xóa nguyên liệu"
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

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row pt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Hiển thị{" "}
              <strong>
                {Math.min((currentPage - 1) * pageSize + 1, totalItems)} -{" "}
                {Math.min(currentPage * pageSize, totalItems)}
              </strong>{" "}
              trong tổng số <strong>{totalItems}</strong> nguyên liệu
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="h-4 w-4" />
                Trang trước
              </Button>

              <span className="text-xs font-semibold text-slate-700 px-2 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="gap-1 text-xs"
              >
                Trang sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal (Create / Edit) */}
      <IngredientFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingIngredient(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingIngredient}
        categories={categories}
        brands={brands}
        units={units}
        isLoading={isSubmitting}
      />

      {/* Detail Modal */}
      <IngredientDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setViewingIngredient(null);
        }}
        ingredient={viewingIngredient}
        branchId={selectedBranch}
        branchName={currentBranchName}
        onEdit={(ing) => {
          setIsDetailOpen(false);
          setEditingIngredient(ing);
          setIsFormOpen(true);
        }}
        onUpdatePrice={(ing) => {
          setIsDetailOpen(false);
          setPriceModalIngredient(ing);
          setIsPriceModalOpen(true);
        }}
        onUpdateStock={(ing) => {
          setIsDetailOpen(false);
          setStockModalIngredient(ing);
          setIsStockModalOpen(true);
        }}
      />

      {/* Branch Price Modal */}
      <IngredientBranchPriceModal
        isOpen={isPriceModalOpen}
        onClose={() => {
          setIsPriceModalOpen(false);
          setPriceModalIngredient(null);
        }}
        ingredient={priceModalIngredient}
        branches={branches}
        initialBranchId={selectedBranch}
        onSuccess={(msg) => {
          setAlert({ type: "success", message: msg });
          fetchIngredients();
        }}
      />

      {/* Branch Stock Modal */}
      <IngredientBranchStockModal
        isOpen={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false);
          setStockModalIngredient(null);
        }}
        ingredient={stockModalIngredient}
        branches={branches}
        initialBranchId={selectedBranch}
        onSuccess={(msg) => {
          setAlert({ type: "success", message: msg });
          fetchIngredients();
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingIngredient(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa nguyên liệu"
        itemName={deletingIngredient?.name || ""}
        description="Nguyên liệu sẽ được chuyển vào trạng thái lưu trữ tạm thời và có thể khôi phục lại khi cần."
        isLoading={isSubmitting}
      />

      {/* Toast Alert */}
      <CatalogAlert alert={alert} onClose={() => setAlert(null)} />
    </AdminLayout>
  );
}
