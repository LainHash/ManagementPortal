import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { recipeApi } from "@/features/production/api/recipe.api";
import { catalogApi } from "@/features/catalog/api/catalog.api";
import { inventoryApi } from "@/features/inventory/api/inventory.api";
import { territoryApi } from "@/features/territory/api/territory.api";
import { CatalogNav } from "@/features/catalog/components/CatalogNav";
import { RecipeCard } from "@/features/production/components/RecipeCard";
import { RecipeFormModal } from "@/features/production/components/RecipeFormModal";
import { RecipeDetailModal } from "@/features/production/components/RecipeDetailModal";
import { DeleteConfirmModal } from "@/features/catalog/components/DeleteConfirmModal";
import { CatalogAlert, type AlertState } from "@/features/catalog/components/CatalogAlert";
import { STORAGE_KEYS, APP_EVENTS } from "@/constants/app.constants";
import type {
  RecipeResponse,
  RecipeDetailResponse,
  CreateRecipeRequest,
  UpdateRecipeRequest,
} from "@/types/production.types";
import type { ProductResponse } from "@/types/catalog.types";
import type { IngredientResponse } from "@/types/inventory.types";
import type { BranchResponse } from "@/types/territory.types";
import {
  ChefHat,
  Plus,
  Search,
  RotateCcw,
  LayoutGrid,
  List,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
  BookOpen,
  Wheat,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Layers,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/utils/cn";

export function meta() {
  return [
    { title: "Quản lý Công thức & Định lượng (Recipe / BOM) | Restaurant Management Portal" },
    {
      name: "description",
      content: "Quản lý công thức định mức nguyên vật liệu tiêu hao (BOM), tỷ lệ pha chế và hướng dẫn chế biến món ăn.",
    },
  ];
}

export default function RecipesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const productIdParam = searchParams.get("productId");
  const recipeIdParam = searchParams.get("recipeId");
  const createParam = searchParams.get("create");
  const branchIdParam = searchParams.get("branchId");

  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filter & Search states
  const [keyword, setKeyword] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>(productIdParam || "");
  const [selectedPrimary, setSelectedPrimary] = useState<string>("all"); // "all" | "primary" | "secondary"

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Data states
  const [recipes, setRecipes] = useState<RecipeResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [ingredients, setIngredients] = useState<IngredientResponse[]>([]);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_BRANCH_ID) || "";
    }
    return "";
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingRecipe, setEditingRecipe] = useState<RecipeResponse | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [viewingRecipeId, setViewingRecipeId] = useState<string | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deletingRecipe, setDeletingRecipe] = useState<RecipeResponse | null>(null);

  // Fetch products, ingredients, and branches for selection
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [prodRes, ingRes, branchRes] = await Promise.all([
          catalogApi.products.getAll({ page: 1, pageSize: 200 }),
          inventoryApi.ingredients.getAll({ page: 1, pageSize: 200 }),
          territoryApi.branches.getAll({ pageSize: 100 }),
        ]);
        if (prodRes?.data) setProducts(prodRes.data);
        if (ingRes?.data) setIngredients(ingRes.data);
        if (branchRes?.data) setBranches(branchRes.data);
      } catch (err) {
        console.error("Failed to load products/ingredients/branches options", err);
      }
    };
    loadOptions();
  }, []);

  // Sync URL query params with modals and filter
  useEffect(() => {
    if (productIdParam) {
      setSelectedProduct(productIdParam);
    }
    if (branchIdParam) {
      setSelectedBranchId(branchIdParam);
    }
    if (recipeIdParam) {
      setViewingRecipeId(recipeIdParam);
      setIsDetailOpen(true);
    }
    if (createParam === "true") {
      setEditingRecipe(null);
      setIsFormOpen(true);
    }
  }, [productIdParam, recipeIdParam, createParam, branchIdParam]);

  // Listen for branch changes from Sidebar or other components
  useEffect(() => {
    const handleBranchChanged = (e: any) => {
      const newBranchId =
        e?.detail?.branchId !== undefined
          ? e.detail.branchId
          : localStorage.getItem(STORAGE_KEYS.SELECTED_BRANCH_ID) || "";
      setSelectedBranchId(newBranchId);
    };

    window.addEventListener(APP_EVENTS.BRANCH_CHANGED, handleBranchChanged);
    window.addEventListener("storage", handleBranchChanged);

    return () => {
      window.removeEventListener(APP_EVENTS.BRANCH_CHANGED, handleBranchChanged);
      window.removeEventListener("storage", handleBranchChanged);
    };
  }, []);

  // Fetch recipes
  const fetchRecipes = useCallback(async () => {
    setIsLoading(true);
    try {
      const isPrimaryParam =
        selectedPrimary === "primary" ? true : selectedPrimary === "secondary" ? false : undefined;

      const res = await recipeApi.recipes.getAll({
        page: currentPage,
        pageSize,
        keyword: keyword.trim() || undefined,
        productId: selectedProduct || undefined,
        isPrimary: isPrimaryParam,
      });

      if (res?.data) {
        let list = res.data;

        // In-memory product filter fallback if needed
        if (selectedProduct) {
          list = list.filter((r) => r.productPublicId === selectedProduct);
        }
        if (selectedPrimary === "primary") {
          list = list.filter((r) => r.isPrimary === true);
        } else if (selectedPrimary === "secondary") {
          list = list.filter((r) => r.isPrimary === false);
        }

        setRecipes(list);
        setTotalItems(res.totalItems || list.length);
        setTotalPages(res.totalPages || Math.ceil((res.totalItems || list.length) / pageSize) || 1);
      } else {
        setRecipes([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      setAlert({
        type: "error",
        message:
          err?.response?.data?.message || err?.message || "Không thể tải danh sách công thức định lượng.",
      });
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, keyword, selectedProduct, selectedPrimary]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Handle Form Submit (Create or Edit)
  const handleFormSubmit = async (
    data: CreateRecipeRequest | UpdateRecipeRequest,
    id?: string
  ) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await recipeApi.recipes.update(id, data as UpdateRecipeRequest);
        setAlert({
          type: "success",
          message: "Cập nhật công thức định lượng thành công!",
        });
      } else {
        await recipeApi.recipes.create(data as CreateRecipeRequest);
        setAlert({
          type: "success",
          message: "Tạo mới công thức định lượng thành công!",
        });
      }
      setIsFormOpen(false);
      setEditingRecipe(null);
      await fetchRecipes();
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Set Primary
  const handleSetPrimary = async (recipeId: string) => {
    try {
      await recipeApi.recipes.setPrimary(recipeId);
      setAlert({
        type: "success",
        message: "Đã cập nhật công thức làm công thức chuẩn chính thức!",
      });
      await fetchRecipes();
    } catch (err: any) {
      setAlert({
        type: "error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Không thể đặt công thức làm chính thức.",
      });
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deletingRecipe) return;
    setIsSubmitting(true);
    try {
      await recipeApi.recipes.delete(deletingRecipe.id);
      setAlert({
        type: "success",
        message: `Đã xóa công thức của món "${deletingRecipe.productName}".`,
      });
      setIsDeleteOpen(false);
      setDeletingRecipe(null);
      await fetchRecipes();
    } catch (err: any) {
      setAlert({
        type: "error",
        message:
          err?.response?.data?.message || err?.message || "Không thể xóa công thức này.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setKeyword("");
    setSelectedProduct("");
    setSelectedPrimary("all");
    setCurrentPage(1);
  };

  // Calculate high-level metrics
  const metrics = useMemo(() => {
    const totalRecipesCount = totalItems || recipes.length;
    const primaryCount = recipes.filter((r) => r.isPrimary).length;
    const uniqueProductsWithRecipe = new Set(recipes.map((r) => r.productPublicId)).size;

    return {
      totalRecipesCount,
      primaryCount,
      uniqueProductsWithRecipe,
      totalMenuProducts: products.length,
    };
  }, [recipes, totalItems, products]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <CatalogNav
          title="Công thức định lượng (Recipe & BOM)"
          description="Quản lý định mức nguyên vật liệu tiêu hao, công thức chế biến và danh sách BOM cho từng món ăn."
          actions={
            <Button
              type="button"
              variant="default"
              onClick={() => {
                setEditingRecipe(null);
                setIsFormOpen(true);
              }}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Tạo công thức mới</span>
            </Button>
          }
        />

        {/* Catalog Alert Notification */}
        {alert && (
          <CatalogAlert
            alert={alert}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="flex items-center gap-4 border border-slate-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Tổng số công thức
              </p>
              <h4 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {metrics.totalRecipesCount}
              </h4>
            </div>
          </Card>

          <Card className="flex items-center gap-4 border border-slate-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Star className="h-6 w-6 fill-current" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Công thức chuẩn (Primary)
              </p>
              <h4 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {metrics.primaryCount}
              </h4>
            </div>
          </Card>

          <Card className="flex items-center gap-4 border border-slate-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Món có định lượng
              </p>
              <h4 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {metrics.uniqueProductsWithRecipe} / {metrics.totalMenuProducts || "—"}
              </h4>
            </div>
          </Card>

          <Card className="flex items-center gap-4 border border-slate-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Wheat className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Nguyên liệu khả dụng
              </p>
              <h4 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {ingredients.length}
              </h4>
            </div>
          </Card>
        </div>

        {/* Filtered by Product Banner if active */}
        {selectedProduct && (
          <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/70 p-3.5 text-xs text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-200">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                <ChefHat className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold text-sm">
                  Đang xem công thức định lượng món:{" "}
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {products.find((p) => p.id === selectedProduct)?.name || "Món đã chọn"}
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Chỉ các công thức định lượng (Recipe / BOM) gắn với món ăn này được hiển thị bên dưới.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedProduct("");
                setSearchParams({});
              }}
              className="h-8 text-xs border-indigo-200 hover:bg-white dark:border-indigo-800"
            >
              Xem tất cả món
            </Button>
          </div>
        )}

        {/* Filter & Toolbar Card */}
        <Card className="border border-slate-200/80 bg-white/80 p-4 shadow-xs backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm công thức theo tên món, hướng dẫn pha chế..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 text-sm"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Product Filter */}
              <div className="min-w-[180px]">
                <select
                  value={selectedProduct}
                  onChange={(e) => {
                    setSelectedProduct(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="">Tất cả món ăn</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary Status Filter */}
              <div className="min-w-[160px]">
                <select
                  value={selectedPrimary}
                  onChange={(e) => {
                    setSelectedPrimary(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="all">Tất cả phân loại</option>
                  <option value="primary">Chỉ công thức chính</option>
                  <option value="secondary">Công thức phụ / thay thế</option>
                </select>
              </div>

              {/* Branch Selector for Inventory Context */}
              <div className="min-w-[180px]">
                <select
                  value={selectedBranchId}
                  onChange={(e) => {
                    const bId = e.target.value;
                    setSelectedBranchId(bId);
                    let branchCode = "";
                    if (typeof window !== "undefined") {
                      if (bId) {
                        localStorage.setItem(STORAGE_KEYS.SELECTED_BRANCH_ID, bId);
                        const matched = branches.find((b) => b.id === bId);
                        if (matched) {
                          branchCode = matched.branchCode;
                          localStorage.setItem(STORAGE_KEYS.SELECTED_BRANCH_CODE, matched.branchCode);
                        }
                      } else {
                        localStorage.removeItem(STORAGE_KEYS.SELECTED_BRANCH_ID);
                        localStorage.removeItem(STORAGE_KEYS.SELECTED_BRANCH_CODE);
                      }

                      window.dispatchEvent(
                        new CustomEvent(APP_EVENTS.BRANCH_CHANGED, {
                          detail: { branchId: bId, branchCode },
                        })
                      );
                    }
                  }}
                  className="w-full rounded-lg border border-indigo-200 bg-indigo-50/40 px-3 py-2 text-xs font-medium text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-indigo-900/50 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="">Chi nhánh xem tồn: Mặc định</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      [{b.branchCode}] {b.address ? `${b.address} (${b.city})` : b.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Filter Button */}
              {(keyword || selectedProduct || selectedPrimary !== "all") && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-9 gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Xóa lọc</span>
                </Button>
              )}

              {/* View Mode Toggle */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "rounded-md p-1.5 transition-colors",
                    viewMode === "grid"
                      ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-indigo-400"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  )}
                  title="Hiển thị dạng thẻ lưới"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "rounded-md p-1.5 transition-colors",
                    viewMode === "table"
                      ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-indigo-400"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  )}
                  title="Hiển thị dạng danh sách bảng"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Content Section: Grid or Table */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl border border-slate-200 bg-white/50 p-6 animate-pulse dark:border-slate-800 dark:bg-slate-900/50"
              />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <ChefHat className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
              Không tìm thấy công thức định lượng nào
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Hãy thử tìm kiếm từ khóa khác hoặc thiết lập công thức mới cho các món ăn.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingRecipe(null);
                setIsFormOpen(true);
              }}
              className="mt-4 gap-2 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tạo công thức ngay</span>
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onView={(r) => {
                  setViewingRecipeId(r.id);
                  setIsDetailOpen(true);
                }}
                onEdit={(r) => {
                  setEditingRecipe(r);
                  setIsFormOpen(true);
                }}
                onDelete={(r) => {
                  setDeletingRecipe(r);
                  setIsDeleteOpen(true);
                }}
                onSetPrimary={(r) => handleSetPrimary(r.id)}
                isActionLoading={isSubmitting}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Món ăn / Đồ uống</th>
                    <th className="px-5 py-3.5 text-center">Phân loại</th>
                    <th className="px-5 py-3.5">Hướng dẫn & Lưu ý</th>
                    <th className="px-5 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800/60 dark:text-slate-300">
                  {recipes.map((recipe) => (
                    <tr
                      key={recipe.id}
                      className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                            <ChefHat className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {recipe.productName}
                            </p>
                            <p className="text-xs font-normal text-slate-400">
                              Mã: {recipe.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {recipe.isPrimary ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <Star className="h-3 w-3 fill-current" />
                            Công thức chính
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                            Công thức phụ
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                          {recipe.instructions?.trim() || "Chưa có ghi chú"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!recipe.isPrimary && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetPrimary(recipe.id)}
                              className="h-8 gap-1 text-xs text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                              title="Đặt làm công thức chính"
                            >
                              <Star className="h-3.5 w-3.5" />
                              <span>Làm chính</span>
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setViewingRecipeId(recipe.id);
                              setIsDetailOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingRecipe(recipe);
                              setIsFormOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingRecipe(recipe);
                              setIsDeleteOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400"
                            title="Xóa công thức"
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
          </div>
        )}

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-4 py-4 sm:flex-row">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hiển thị <span className="font-medium">{recipes.length}</span> trên tổng số{" "}
              <span className="font-medium">{totalItems}</span> công thức
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Trước</span>
              </Button>
              <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="gap-1 text-xs"
              >
                <span>Sau</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Recipe Form Modal (Create / Edit) */}
        <RecipeFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingRecipe(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingRecipe}
          defaultProductId={productIdParam || selectedProduct || undefined}
          products={products}
          ingredients={ingredients}
          isLoading={isSubmitting}
        />

        {/* Recipe Detail Modal */}
        <RecipeDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setViewingRecipeId(null);
          }}
          recipeId={viewingRecipeId}
          branchId={selectedBranchId}
          branches={branches}
          onEdit={(detail) => {
            setEditingRecipe(detail);
            setIsFormOpen(true);
          }}
          onSetPrimary={async (id) => {
            await handleSetPrimary(id);
          }}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setDeletingRecipe(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Xác nhận xóa công thức"
          itemName={`Công thức của món ${deletingRecipe?.productName || ""}`}
          description="Lưu ý: Nếu xóa công thức chính, hệ thống sẽ tạm dừng trừ tồn kho tự động cho món này cho đến khi bạn tạo công thức mới."
          isLoading={isSubmitting}
        />
      </div>
    </AdminLayout>
  );
}
