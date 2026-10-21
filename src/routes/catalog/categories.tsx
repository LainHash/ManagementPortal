import React, { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { catalogApi } from "@/features/catalog/api/catalog.api";
import { CatalogNav } from "@/features/catalog/components/CatalogNav";
import { CategoryFormModal } from "@/features/catalog/components/CategoryFormModal";
import { CategoryDetailModal } from "@/features/catalog/components/CategoryDetailModal";
import { DeleteConfirmModal } from "@/features/catalog/components/DeleteConfirmModal";
import { CatalogAlert, type AlertState } from "@/features/catalog/components/CatalogAlert";
import { useCatalogOptions } from "@/features/catalog/hooks/useCatalogOptions";
import type {
  ProductCategoryResponse,
  CreateProductCategoryRequest,
  UpdateProductCategoryRequest,
} from "@/types/catalog.types";
import {
  Plus,
  Search,
  RotateCcw,
  Tags,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FolderTree,
} from "lucide-react";

export function meta() {
  return [
    { title: "Quản lý Danh mục món | Restaurant Management Portal" },
    {
      name: "description",
      content: "Quản lý cấu trúc nhóm thực đơn, phân loại món ăn ẩm thực chuỗi nhà hàng.",
    },
  ];
}

export default function CategoriesPage() {
  const { brands, units } = useCatalogOptions();

  const [categories, setCategories] = useState<ProductCategoryResponse[]>([]);
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
  const [editingCategory, setEditingCategory] = useState<ProductCategoryResponse | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [viewingCategory, setViewingCategory] = useState<ProductCategoryResponse | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deletingCategory, setDeletingCategory] = useState<ProductCategoryResponse | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await catalogApi.categories.getAll({
        page: currentPage,
        pageSize,
        keyword: keyword.trim() || undefined,
      });

      if (res?.data) {
        setCategories(res.data);
        setTotalItems(res.totalItems || res.data.length);
        setTotalPages(res.totalPages || Math.ceil((res.totalItems || res.data.length) / pageSize) || 1);
      } else {
        setCategories([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.message || "Không thể tải danh sách danh mục từ máy chủ.",
      });
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, keyword]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleFormSubmit = async (
    payload: CreateProductCategoryRequest | UpdateProductCategoryRequest,
    id?: string
  ) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await catalogApi.categories.update(id, payload);
        setAlert({
          type: "success",
          message: `Đã cập nhật danh mục "${payload.name}" thành công!`,
        });
      } else {
        await catalogApi.categories.create(payload);
        setAlert({
          type: "success",
          message: `Đã thêm danh mục mới "${payload.name}" thành công!`,
        });
      }
      setIsFormOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setIsSubmitting(true);
    try {
      await catalogApi.categories.delete(deletingCategory.id);
      setAlert({
        type: "success",
        message: `Đã xóa danh mục "${deletingCategory.name}".`,
      });
      setIsDeleteOpen(false);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Không thể xóa danh mục này.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <CatalogNav
          title="Danh mục món ăn"
          description="Phân loại nhóm món (Khai vị, Món nướng, Tráng miệng, Đồ uống...) để khách hàng dễ chọn lựa"
          stats={{
            totalCategories: totalItems,
            totalBrands: brands.length,
            totalUnits: units.length,
          }}
          actions={
            <Button
              onClick={() => {
                setEditingCategory(null);
                setIsFormOpen(true);
              }}
              className="shadow-md shadow-indigo-600/20"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Thêm danh mục
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
                placeholder="Tìm danh mục theo tên hoặc mô tả..."
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCategories()}
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
              <p className="text-sm text-slate-500">Đang tải danh mục món...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && categories.length === 0 && (
          <Card className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Tags className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
              Chưa có danh mục món nào
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Tạo danh mục mới để phân loại và sắp xếp các món ăn trong thực đơn khoa học hơn.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => {
                  setEditingCategory(null);
                  setIsFormOpen(true);
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Thêm danh mục mới
              </Button>
            </div>
          </Card>
        )}

        {/* Categories Grid */}
        {!isLoading && categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Card
                key={cat.id}
                className="group relative flex flex-col justify-between p-5 transition-all duration-300 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/60"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 dark:bg-indigo-950/60 dark:text-indigo-400">
                      <FolderTree className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setViewingCategory(cat);
                          setIsDetailOpen(true);
                        }}
                        className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                        title="Xem danh sách món trong danh mục"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingCategory(cat);
                          setIsFormOpen(true);
                        }}
                        className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                        title="Sửa danh mục"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingCategory(cat);
                          setIsDeleteOpen(true);
                        }}
                        className="h-8 w-8 text-slate-400 hover:text-red-600"
                        title="Xóa danh mục"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <h3
                    onClick={() => {
                      setViewingCategory(cat);
                      setIsDetailOpen(true);
                    }}
                    className="mt-4 text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer dark:text-white dark:group-hover:text-indigo-400"
                  >
                    {cat.name}
                  </h3>

                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                    {cat.description || "Chưa có mô tả chi tiết cho danh mục này."}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[11px] truncate max-w-[140px]">
                    ID: {cat.id.slice(0, 8)}...
                  </span>
                  <button
                    onClick={() => {
                      setViewingCategory(cat);
                      setIsDetailOpen(true);
                    }}
                    className="text-indigo-600 hover:underline font-medium dark:text-indigo-400 cursor-pointer"
                  >
                    Xem chi tiết →
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
              Trang {currentPage} / {totalPages} (Tổng số {totalItems} danh mục)
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
        <CategoryFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCategory(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingCategory}
          isLoading={isSubmitting}
        />

        <CategoryDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setViewingCategory(null);
          }}
          category={viewingCategory}
          onEdit={(cat) => {
            setEditingCategory(cat);
            setIsFormOpen(true);
          }}
        />

        <DeleteConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setDeletingCategory(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Xác nhận xóa danh mục món"
          itemName={deletingCategory?.name || "Danh mục"}
          description="Lưu ý: Món ăn thuộc danh mục này có thể cần được phân loại lại sau khi danh mục bị xóa."
          isLoading={isSubmitting}
        />

        <CatalogAlert alert={alert} onClose={() => setAlert(null)} />
      </div>
    </AdminLayout>
  );
}
