import React, { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { catalogApi } from "@/features/catalog/api/catalog.api";
import { CatalogNav } from "@/features/catalog/components/CatalogNav";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { ProductFormModal } from "@/features/catalog/components/ProductFormModal";
import { ProductDetailModal } from "@/features/catalog/components/ProductDetailModal";
import { ProductBranchPriceModal } from "@/features/catalog/components/ProductBranchPriceModal";
import { ProductBranchStockModal } from "@/features/catalog/components/ProductBranchStockModal";
import { DeleteConfirmModal } from "@/features/catalog/components/DeleteConfirmModal";
import { CatalogAlert, type AlertState } from "@/features/catalog/components/CatalogAlert";
import { StockStatusBadge, InventoryTypeBadge } from "@/features/catalog/components/Badges";
import { useCatalogOptions } from "@/features/catalog/hooks/useCatalogOptions";
import { StockStatus, InventoryType } from "@/types/enums";
import type {
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/types/catalog.types";
import {
  Plus,
  Search,
  RotateCcw,
  LayoutGrid,
  List,
  UtensilsCrossed,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  DollarSign,
  Boxes,
} from "lucide-react";

export function meta() {
  return [
    { title: "Quản lý Món ăn & Thực đơn | Restaurant Management Portal" },
    {
      name: "description",
      content: "Quản lý danh mục món ăn, giá niêm yết, công thức chế biến và tình trạng kho.",
    },
  ];
}

export default function ProductsPage() {
  // Catalog options (categories, brands, units, branches)
  const { categories, brands, units, branches, refreshOptions } = useCatalogOptions();

  // View mode: grid vs table
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filter & Search states
  const [keyword, setKeyword] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>("");
  const [selectedInventoryType, setSelectedInventoryType] = useState<string>("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Products data
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [viewingProduct, setViewingProduct] = useState<ProductResponse | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deletingProduct, setDeletingProduct] = useState<ProductResponse | null>(null);

  const [isPriceModalOpen, setIsPriceModalOpen] = useState<boolean>(false);
  const [priceModalProduct, setPriceModalProduct] = useState<ProductResponse | null>(null);

  const [isStockModalOpen, setIsStockModalOpen] = useState<boolean>(false);
  const [stockModalProduct, setStockModalProduct] = useState<ProductResponse | null>(null);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await catalogApi.products.getAll({
        page: currentPage,
        pageSize,
        keyword: keyword.trim() || undefined,
        branchId: selectedBranch || undefined,
        categoryId: selectedCategory || undefined,
        brandId: selectedBrand || undefined,
      });

      if (res?.data) {
        let list = res.data;

        // In-memory filter fallback for stock status & inventory type if backend doesn't filter directly
        if (selectedStockStatus) {
          list = list.filter((p) => p.stockStatus === selectedStockStatus);
        }
        if (selectedInventoryType) {
          list = list.filter((p) => p.inventoryType === selectedInventoryType);
        }

        setProducts(list);
        setTotalItems(res.totalItems || list.length);
        setTotalPages(res.totalPages || Math.ceil((res.totalItems || list.length) / pageSize) || 1);
      } else {
        setProducts([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.message || "Không thể tải danh sách món ăn từ máy chủ.",
      });
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    keyword,
    selectedBranch,
    selectedCategory,
    selectedBrand,
    selectedStockStatus,
    selectedInventoryType,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle Form Submit (Create / Edit)
  const handleFormSubmit = async (
    payload: CreateProductRequest | UpdateProductRequest,
    id?: string
  ) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await catalogApi.products.update(id, payload as UpdateProductRequest);
        setAlert({
          type: "success",
          message: `Đã cập nhật món ăn "${payload.name}" thành công!`,
        });
      } else {
        await catalogApi.products.create(payload as CreateProductRequest);
        setAlert({
          type: "success",
          message: `Đã thêm mới món ăn "${payload.name}" vào thực đơn!`,
        });
      }
      setIsFormOpen(false);
      setEditingProduct(null);
      fetchProducts();
      refreshOptions();
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setIsSubmitting(true);
    try {
      await catalogApi.products.delete(deletingProduct.id);
      setAlert({
        type: "success",
        message: `Đã xóa món ăn "${deletingProduct.name}" khỏi thực đơn.`,
      });
      setIsDeleteOpen(false);
      setDeletingProduct(null);
      fetchProducts();
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Không thể xóa món ăn này.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prod: ProductResponse) => {
    setEditingProduct(prod);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (prod: ProductResponse) => {
    setViewingProduct(prod);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (prod: ProductResponse) => {
    setDeletingProduct(prod);
    setIsDeleteOpen(true);
  };

  const handleOpenUpdatePrice = (prod: ProductResponse) => {
    setPriceModalProduct(prod);
    setIsPriceModalOpen(true);
  };

  const handleOpenUpdateStock = (prod: ProductResponse) => {
    setStockModalProduct(prod);
    setIsStockModalOpen(true);
  };

  const handlePriceSuccess = (msg: string) => {
    setAlert({ type: "success", message: msg });
    fetchProducts();
  };

  const handleStockSuccess = (msg: string) => {
    setAlert({ type: "success", message: msg });
    fetchProducts();
  };

  const formatPrice = (price?: number | null, currency?: string | null) => {
    if (price === undefined || price === null) return "Liên hệ";
    return `${price.toLocaleString("vi-VN")} ${currency || "đ"}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <CatalogNav
          title="Món ăn & Thực đơn"
          description="Danh mục các món ăn, đồ uống, bảng giá niêm yết và công thức chế biến"
          stats={{
            totalProducts: totalItems,
            totalCategories: categories.length,
            totalBrands: brands.length,
            totalUnits: units.length,
          }}
          actions={
            <Button onClick={handleOpenCreate} className="shadow-md shadow-indigo-600/20">
              <Plus className="mr-1.5 h-4 w-4" />
              Thêm món mới
            </Button>
          }
        />

        {/* Filter and Search Bar */}
        <Card className="p-4 shadow-xs">
          <div className="flex flex-col gap-4">
            {/* Top row: search + view toggle + refresh */}
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
                  placeholder="Tìm theo tên món, mã hoặc từ khóa..."
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchProducts()}
                  title="Làm mới dữ liệu"
                  className="h-10"
                >
                  <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline ml-1.5">Làm mới</span>
                </Button>

                <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-900">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                    title="Hiển thị dạng thẻ ảnh (Grid)"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "table"
                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                    title="Hiển thị dạng bảng chi tiết (Table)"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom row: Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              {/* Branch filter */}
              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Chi nhánh
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => {
                    setSelectedBranch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="">-- Tất cả chi nhánh --</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category filter */}
              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Danh mục
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="">-- Tất cả danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand filter */}
              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Thương hiệu
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="">-- Tất cả thương hiệu --</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock status filter */}
              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Tình trạng kho
                </label>
                <select
                  value={selectedStockStatus}
                  onChange={(e) => {
                    setSelectedStockStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="">-- Tất cả tình trạng --</option>
                  <option value={StockStatus.Available}>Còn hàng</option>
                  <option value={StockStatus.LowStock}>Sắp hết hàng</option>
                  <option value={StockStatus.OutOfStock}>Hết hàng</option>
                </select>
              </div>

              {/* Inventory type filter */}
              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Loại kiểm kê
                </label>
                <select
                  value={selectedInventoryType}
                  onChange={(e) => {
                    setSelectedInventoryType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="">-- Tất cả loại --</option>
                  <option value={InventoryType.MadeToOrder}>Chế biến gọi món</option>
                  <option value={InventoryType.StockTracked}>Theo dõi tồn kho</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <RotateCcw className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-sm text-slate-500">Đang tải danh sách món ăn từ catalog...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && products.length === 0 && (
          <Card className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <UtensilsCrossed className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
              Không tìm thấy món ăn nào
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Không có món ăn nào phù hợp với bộ lọc hiện tại, hoặc bạn chưa thêm món ăn vào hệ thống.
            </p>
            <div className="mt-6">
              <Button onClick={handleOpenCreate}>
                <Plus className="mr-1.5 h-4 w-4" />
                Thêm món mới ngay
              </Button>
            </div>
          </Card>
        )}

        {/* Content Presentation: Grid View */}
        {!isLoading && products.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetail={handleOpenDetail}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onUpdatePrice={handleOpenUpdatePrice}
                onUpdateStock={handleOpenUpdateStock}
              />
            ))}
          </div>
        )}

        {/* Content Presentation: Table View */}
        {!isLoading && products.length > 0 && viewMode === "table" && (
          <Card className="overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-900/60 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">Món ăn / Mặt hàng</th>
                    <th className="px-4 py-3.5">Danh mục</th>
                    <th className="px-4 py-3.5">Thương hiệu</th>
                    <th className="px-4 py-3.5">ĐVT</th>
                    <th className="px-4 py-3.5">Giá bán</th>
                    <th className="px-4 py-3.5">Loại quản lý</th>
                    <th className="px-4 py-3.5">Tình trạng</th>
                    <th className="px-4 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {products.map((prod) => (
                    <tr
                      key={prod.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            {prod.primaryImage?.image?.url ? (
                              <img
                                src={prod.primaryImage.image.url}
                                alt={prod.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UtensilsCrossed className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <button
                              onClick={() => handleOpenDetail(prod)}
                              className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors text-left dark:text-white dark:hover:text-indigo-400 cursor-pointer"
                            >
                              {prod.name}
                            </button>
                            {prod.description && (
                              <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                                {prod.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                        {prod.categoryName}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {prod.brandName || "—"}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {prod.unitSymbol || "Phần"}
                      </td>
                      <td className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400">
                        {formatPrice(prod.unitPrice, prod.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <InventoryTypeBadge type={prod.inventoryType} />
                      </td>
                      <td className="px-4 py-3">
                        <StockStatusBadge status={prod.stockStatus} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDetail(prod)}
                            className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenUpdatePrice(prod)}
                            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                            title="Cập nhật giá theo chi nhánh"
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenUpdateStock(prod)}
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                            title="Cập nhật tồn kho theo chi nhánh"
                          >
                            <Boxes className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(prod)}
                            className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                            title="Sửa món"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDelete(prod)}
                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                            title="Xóa món"
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

        {/* Pagination Controls */}
        {!isLoading && totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
              <span>trên tổng số <strong>{totalItems}</strong> món ăn</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Trang {currentPage} / {totalPages}
              </span>
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
        <ProductFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingProduct}
          categories={categories}
          brands={brands}
          units={units}
          isLoading={isSubmitting}
        />

        <ProductDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setViewingProduct(null);
          }}
          product={viewingProduct}
          branchId={selectedBranch || undefined}
          onEdit={handleOpenEdit}
          onUpdatePrice={handleOpenUpdatePrice}
          onUpdateStock={handleOpenUpdateStock}
        />

        <ProductBranchPriceModal
          isOpen={isPriceModalOpen}
          onClose={() => {
            setIsPriceModalOpen(false);
            setPriceModalProduct(null);
          }}
          product={priceModalProduct}
          branches={branches}
          initialBranchId={selectedBranch}
          onSuccess={handlePriceSuccess}
        />

        <ProductBranchStockModal
          isOpen={isStockModalOpen}
          onClose={() => {
            setIsStockModalOpen(false);
            setStockModalProduct(null);
          }}
          product={stockModalProduct}
          branches={branches}
          initialBranchId={selectedBranch}
          onSuccess={handleStockSuccess}
        />

        <DeleteConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setDeletingProduct(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Xác nhận xóa món ăn"
          itemName={deletingProduct?.name || "Món ăn"}
          description="Hành động này sẽ tạm gỡ bỏ món ăn khỏi thực đơn gọi món tại tất cả các cơ sở."
          isLoading={isSubmitting}
        />

        {/* Toast Alert */}
        <CatalogAlert alert={alert} onClose={() => setAlert(null)} />
      </div>
    </AdminLayout>
  );
}