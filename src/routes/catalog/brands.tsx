import React, { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { catalogApi } from "@/features/catalog/api/catalog.api";
import { CatalogNav } from "@/features/catalog/components/CatalogNav";
import { BrandFormModal } from "@/features/catalog/components/BrandFormModal";
import { BrandDetailModal } from "@/features/catalog/components/BrandDetailModal";
import { DeleteConfirmModal } from "@/features/catalog/components/DeleteConfirmModal";
import { CatalogAlert, type AlertState } from "@/features/catalog/components/CatalogAlert";
import { useCatalogOptions } from "@/features/catalog/hooks/useCatalogOptions";
import type {
  BrandResponse,
  CreateBrandRequest,
  UpdateBrandRequest,
} from "@/types/catalog.types";
import {
  Plus,
  Search,
  RotateCcw,
  Layers,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Store,
} from "lucide-react";

export function meta() {
  return [
    { title: "Quản lý Thương hiệu ẩm thực | Restaurant Management Portal" },
    {
      name: "description",
      content: "Quản lý các nhãn hiệu, thương hiệu ẩm thực trong chuỗi nhà hàng.",
    },
  ];
}

export default function BrandsPage() {
  const { categories, units } = useCatalogOptions();

  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [keyword, setKeyword] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingBrand, setEditingBrand] = useState<BrandResponse | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [viewingBrand, setViewingBrand] = useState<BrandResponse | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deletingBrand, setDeletingBrand] = useState<BrandResponse | null>(null);

  const fetchBrands = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await catalogApi.brands.getAll({
        page: currentPage,
        pageSize,
        keyword: keyword.trim() || undefined,
      });

      if (res?.data) {
        setBrands(res.data);
        setTotalItems(res.totalItems || res.data.length);
        setTotalPages(res.totalPages || Math.ceil((res.totalItems || res.data.length) / pageSize) || 1);
      } else {
        setBrands([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.message || "Không thể tải danh sách thương hiệu từ máy chủ.",
      });
      setBrands([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, keyword]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleFormSubmit = async (
    payload: CreateBrandRequest | UpdateBrandRequest,
    id?: string
  ) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await catalogApi.brands.update(id, payload);
        setAlert({
          type: "success",
          message: `Đã cập nhật thương hiệu "${payload.name}" thành công!`,
        });
      } else {
        await catalogApi.brands.create(payload);
        setAlert({
          type: "success",
          message: `Đã thêm thương hiệu mới "${payload.name}" thành công!`,
        });
      }
      setIsFormOpen(false);
      setEditingBrand(null);
      fetchBrands();
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBrand) return;
    setIsSubmitting(true);
    try {
      await catalogApi.brands.delete(deletingBrand.id);
      setAlert({
        type: "success",
        message: `Đã xóa thương hiệu "${deletingBrand.name}".`,
      });
      setIsDeleteOpen(false);
      setDeletingBrand(null);
      fetchBrands();
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Không thể xóa thương hiệu này.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <CatalogNav
          title="Thương hiệu ẩm thực"
          description="Quản lý hệ thống nhận diện các thương hiệu hoặc nhãn ẩm thực thuộc chuỗi nhà hàng"
          stats={{
            totalBrands: totalItems,
            totalCategories: categories.length,
            totalUnits: units.length,
          }}
          actions={
            <Button
              onClick={() => {
                setEditingBrand(null);
                setIsFormOpen(true);
              }}
              className="shadow-md shadow-indigo-600/20"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Thêm thương hiệu
            </Button>
          }
        />

        {/* Search bar */}
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
                placeholder="Tìm thương hiệu theo tên hoặc định vị..."
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchBrands()}
              className="h-10"
            >
              <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline ml-1.5">Làm mới</span>
            </Button>
          </div>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <RotateCcw className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-sm text-slate-500">Đang tải danh sách thương hiệu...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && brands.length === 0 && (
          <Card className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
              <Layers className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
              Chưa có thương hiệu nào
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Thêm thương hiệu để gán món ăn theo phong cách ẩm thực hoặc chuỗi chi nhánh riêng biệt.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => {
                  setEditingBrand(null);
                  setIsFormOpen(true);
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Thêm thương hiệu mới
              </Button>
            </div>
          </Card>
        )}

        {/* Brands Grid */}
        {!isLoading && brands.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <Card
                key={brand.id}
                className="group relative flex flex-col justify-between p-5 transition-all duration-300 hover:shadow-md hover:border-sky-200 dark:hover:border-sky-900/60"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                      {brand.primaryImage?.image?.url ? (
                        <img
                          src={brand.primaryImage.image.url}
                          alt={brand.name}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <Store className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setViewingBrand(brand);
                          setIsDetailOpen(true);
                        }}
                        className="h-8 w-8 text-slate-500 hover:text-sky-600"
                        title="Xem danh sách món thuộc thương hiệu"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingBrand(brand);
                          setIsFormOpen(true);
                        }}
                        className="h-8 w-8 text-slate-500 hover:text-sky-600"
                        title="Sửa thương hiệu"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingBrand(brand);
                          setIsDeleteOpen(true);
                        }}
                        className="h-8 w-8 text-slate-400 hover:text-red-600"
                        title="Xóa thương hiệu"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <h3
                    onClick={() => {
                      setViewingBrand(brand);
                      setIsDetailOpen(true);
                    }}
                    className="mt-4 text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors cursor-pointer dark:text-white dark:group-hover:text-sky-400"
                  >
                    {brand.name}
                  </h3>

                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                    {brand.description || "Chưa có mô tả định vị cho thương hiệu này."}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[11px] truncate max-w-[140px]">
                    ID: {brand.id.slice(0, 8)}...
                  </span>
                  <button
                    onClick={() => {
                      setViewingBrand(brand);
                      setIsDetailOpen(true);
                    }}
                    className="text-sky-600 hover:underline font-medium dark:text-sky-400 cursor-pointer"
                  >
                    Xem thực đơn →
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalItems > pageSize && (
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-slate-500">
              Trang {currentPage} / {totalPages} (Tổng số {totalItems} thương hiệu)
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
        <BrandFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingBrand(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingBrand}
          isLoading={isSubmitting}
        />

        <BrandDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setViewingBrand(null);
          }}
          brand={viewingBrand}
          onEdit={(b) => {
            setEditingBrand(b);
            setIsFormOpen(true);
          }}
        />

        <DeleteConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setDeletingBrand(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Xác nhận xóa thương hiệu"
          itemName={deletingBrand?.name || "Thương hiệu"}
          description="Lưu ý: Các món ăn đang liên kết với thương hiệu này sẽ được chuyển về không phân thương hiệu."
          isLoading={isSubmitting}
        />

        <CatalogAlert alert={alert} onClose={() => setAlert(null)} />
      </div>
    </AdminLayout>
  );
}
