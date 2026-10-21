import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { catalogApi } from "../api/catalog.api";
import type { ProductResponse, ProductDetailResponse } from "@/types/catalog.types";
import type { RecipeResponse } from "@/types/production.types";
import type { BranchResponse } from "@/types/territory.types";
import { InventoryType } from "@/types/enums";
import { InventoryTypeBadge } from "./Badges";
import {
  Boxes,
  Building2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  UtensilsCrossed,
  CheckCircle2,
  Info,
  ChefHat,
  ArrowRight,
  BookOpen,
  Plus,
  Star,
} from "lucide-react";

interface ProductBranchStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductResponse | null;
  products?: ProductResponse[];
  branches: BranchResponse[];
  initialBranchId?: string;
  onSuccess: (message: string) => void;
}

export function ProductBranchStockModal({
  isOpen,
  onClose,
  product,
  products = [],
  branches,
  initialBranchId,
  onSuccess,
}: ProductBranchStockModalProps) {
  const navigate = useNavigate();

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [quantityOnHand, setQuantityOnHand] = useState<string>("");
  const [reorderLevel, setReorderLevel] = useState<string>("10");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // For MadeToOrder details (recipes)
  const [productDetail, setProductDetail] = useState<ProductDetailResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Active product is either passed directly or picked from products list
  const activeProduct = product || products.find((p) => p.id === selectedProductId) || null;
  const isMadeToOrder = activeProduct?.inventoryType === InventoryType.MadeToOrder;

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setSelectedProductId(product.id);
      } else if (products.length > 0) {
        setSelectedProductId(products[0].id);
      } else {
        setSelectedProductId("");
      }

      const defaultBranch =
        initialBranchId && branches.some((b) => b.id === initialBranchId)
          ? initialBranchId
          : branches[0]?.id || "";

      setSelectedBranchId(defaultBranch);
      setQuantityOnHand("");
      setReorderLevel("10");
      setError(null);
    }
  }, [isOpen, product, products, initialBranchId, branches]);

  // Fetch recipe info if product is MadeToOrder
  useEffect(() => {
    if (isOpen && activeProduct?.id && isMadeToOrder) {
      setIsLoadingDetail(true);
      catalogApi.products
        .getById(activeProduct.id)
        .then((res) => {
          if (res?.data) {
            setProductDetail(res.data);
          } else {
            setProductDetail(null);
          }
        })
        .catch(() => {
          setProductDetail(null);
        })
        .finally(() => {
          setIsLoadingDetail(false);
        });
    } else {
      setProductDetail(null);
    }
  }, [isOpen, activeProduct?.id, isMadeToOrder]);

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    setQuantityOnHand("");
  };

  const handleNavigateToRecipeDetail = (recipeId?: string) => {
    if (!activeProduct) return;
    onClose();
    if (recipeId) {
      navigate(`/recipes?productId=${activeProduct.id}&recipeId=${recipeId}`);
    } else {
      navigate(`/recipes?productId=${activeProduct.id}`);
    }
  };

  const handleCreateNewRecipe = () => {
    if (!activeProduct) return;
    onClose();
    navigate(`/recipes?productId=${activeProduct.id}&create=true`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMadeToOrder) {
      handleNavigateToRecipeDetail();
      return;
    }
    setError(null);

    if (!activeProduct) {
      setError("Vui lòng chọn món ăn cần cập nhật tồn kho.");
      return;
    }

    if (!selectedBranchId) {
      setError("Vui lòng chọn chi nhánh áp dụng tồn kho.");
      return;
    }

    const qty = Number(quantityOnHand);
    if (isNaN(qty) || qty < 0) {
      setError("Số lượng tồn kho thực tế phải là số hợp lệ và lớn hơn hoặc bằng 0.");
      return;
    }

    const reorder = reorderLevel ? Number(reorderLevel) : 0;
    if (isNaN(reorder) || reorder < 0) {
      setError("Mức cảnh báo tồn kho tối thiểu phải lớn hơn hoặc bằng 0.");
      return;
    }

    setIsLoading(true);
    try {
      // Use createStock endpoint which implicitly creates/binds ProductBranch if not yet existing
      await catalogApi.products.createStock({
        productPublicId: activeProduct.id,
        branchPublicId: selectedBranchId,
        quantityOnHand: qty,
        reorderLevel: reorder,
      });

      const branchName =
        branches.find((b) => b.id === selectedBranchId)?.address ||
        branches.find((b) => b.id === selectedBranchId)?.city ||
        "chi nhánh đã chọn";

      onSuccess(
        `Đã cập nhật tồn kho món "${activeProduct.name}" tại ${branchName}: ${qty} ${activeProduct.unitSymbol || "Phần"} (Tối thiểu: ${reorder}).`
      );
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể cập nhật tồn kho cho chi nhánh này. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={isMadeToOrder ? "lg" : "md"}
      title={
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          {isMadeToOrder ? <ChefHat className="h-5 w-5 text-amber-600 dark:text-amber-400" /> : <Boxes className="h-5 w-5" />}
          <span>
            {isMadeToOrder
              ? "Tồn kho & Công thức món Chế biến (MadeToOrder)"
              : "Thiết lập / Cập nhật Tồn kho Chi nhánh"}
          </span>
        </div>
      }
      description={
        isMadeToOrder
          ? "Món ăn chế biến theo công thức. Tồn kho thành phẩm phụ thuộc định lượng nguyên vật liệu (Recipe / BOM)."
          : "Quản lý số lượng tồn thực tế và ngưỡng cảnh báo tồn kho cho chi nhánh."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/50">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Product selector if not fixed */}
        {!product && products.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <UtensilsCrossed className="h-3.5 w-3.5 text-indigo-600" />
              Chọn món ăn <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductChange(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} [{p.inventoryType === InventoryType.MadeToOrder ? "Chế biến gọi món" : "Hàng đóng gói"}]
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Product mini info */}
        {activeProduct && (
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
              {activeProduct.primaryImage?.image?.url ? (
                <img
                  src={activeProduct.primaryImage.image.url}
                  alt={activeProduct.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UtensilsCrossed className="h-5 w-5 text-slate-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-slate-900 truncate dark:text-white">
                {activeProduct.name}
              </h4>
              <div className="mt-1 flex items-center gap-2">
                <InventoryTypeBadge type={activeProduct.inventoryType} />
                <span className="text-xs text-slate-500">
                  ĐVT: {activeProduct.unitSymbol || "Phần"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* If MadeToOrder -> display notice and navigate to Recipe detail */}
        {isMadeToOrder ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-semibold text-sm">
                    Món ăn chế biến theo công thức định lượng (Recipe / BOM)
                  </p>
                  <p>
                    Món ăn này thuộc phân loại <strong>Chế biến gọi món (MadeToOrder)</strong>. Tình trạng sẵn có và khả năng đáp ứng đơn hàng được hệ thống tự động kiểm tra, trừ lùi và tính toán trực tiếp dựa trên tồn kho thực tế của các nguyên vật liệu thành phần trong công thức.
                  </p>
                </div>
              </div>
            </div>

            {/* Recipe detail card if loaded */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Công thức định mức của món ({productDetail?.recipes?.length || 0})
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCreateNewRecipe}
                  className="h-7 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Thêm công thức
                </Button>
              </div>

              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-6 gap-2 text-indigo-600 text-xs">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang tải công thức định lượng...</span>
                </div>
              ) : productDetail?.recipes && productDetail.recipes.length > 0 ? (
                <div className="mt-3 space-y-2.5">
                  {productDetail.recipes.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-xs transition-hover hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {rec.productName}
                          </span>
                          {rec.isPrimary && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                              <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                              Công thức chính
                            </span>
                          )}
                        </div>
                        {rec.instructions && (
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {rec.instructions}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleNavigateToRecipeDetail(rec.id)}
                        className="ml-3 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 shadow-xs"
                      >
                        <span>Chi tiết Recipe</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Món ăn này chưa có công thức định lượng nào.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateNewRecipe}
                    className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Tạo công thức định lượng ngay
                  </Button>
                </div>
              )}
            </div>

            {/* Modal actions for MadeToOrder */}
            <div className="mt-6 flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={onClose}>
                Đóng
              </Button>
              <Button
                type="button"
                onClick={() => handleNavigateToRecipeDetail()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs gap-1.5"
              >
                <ChefHat className="h-4 w-4" />
                <span>Chuyển đến trang Quản lý Công thức</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Branch selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                Chi nhánh áp dụng <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                disabled={isLoading || branches.length === 0}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                {branches.length === 0 ? (
                  <option value="">Không có chi nhánh khả dụng</option>
                ) : (
                  branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.address ? `${b.address} (${b.city})` : b.city} [Mã: {b.branchCode}]
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Quantity on hand input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Boxes className="h-3.5 w-3.5 text-indigo-600" />
                Số lượng tồn kho thực tế (OnHand) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={quantityOnHand}
                  onChange={(e) => setQuantityOnHand(e.target.value)}
                  placeholder="Nhập số lượng tồn hiện có..."
                  disabled={isLoading}
                  required
                  className="pr-16 text-base font-semibold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  {activeProduct?.unitSymbol || "Phần"}
                </span>
              </div>
            </div>

            {/* Reorder level input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Mức cảnh báo tồn kho tối thiểu (Reorder Level)</span>
                <span className="text-[11px] text-slate-400 font-normal">Tùy chọn</span>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={reorderLevel}
                  onChange={(e) => setReorderLevel(e.target.value)}
                  placeholder="Ví dụ: 10"
                  disabled={isLoading}
                  className="pr-16 text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  {activeProduct?.unitSymbol || "Phần"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Info className="h-3 w-3 shrink-0" />
                Khi số lượng tồn ≤ mức này, hệ thống sẽ tự động gán trạng thái <strong>Sắp hết hàng (Low Stock)</strong>.
              </p>
            </div>

            {/* Modal actions */}
            <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isLoading || branches.length === 0 || !activeProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Đang lưu tồn kho...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Lưu tồn kho chi nhánh
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
