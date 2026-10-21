import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { recipeApi } from "@/features/production/api/recipe.api";
import type {
  RecipeResponse,
  RecipeDetailResponse,
  CreateRecipeRequest,
  UpdateRecipeRequest,
  CreateRecipeIngredientItem,
} from "@/types/production.types";
import type { ProductResponse } from "@/types/catalog.types";
import type { IngredientResponse } from "@/types/inventory.types";
import {
  ChefHat,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  Save,
  Star,
  BookOpen,
  Wheat,
  Scale,
} from "lucide-react";
import { cn } from "@/utils/cn";

export interface RecipeIngredientRow {
  ingredientPublicId: string;
  quantity: number | "";
}

export interface RecipeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRecipeRequest | UpdateRecipeRequest, id?: string) => Promise<void>;
  initialData?: RecipeResponse | RecipeDetailResponse | null;
  defaultProductId?: string;
  products: ProductResponse[];
  ingredients: IngredientResponse[];
  isLoading?: boolean;
}

export function RecipeFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultProductId,
  products,
  ingredients,
  isLoading = false,
}: RecipeFormModalProps) {
  const isEdit = Boolean(initialData);

  const [productId, setProductId] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [isPrimary, setIsPrimary] = useState<boolean>(true);
  const [rows, setRows] = useState<RecipeIngredientRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Initialize or fetch full details when opening
  useEffect(() => {
    if (!isOpen) {
      setProductId("");
      setInstructions("");
      setIsPrimary(true);
      setRows([]);
      setError(null);
      return;
    }

    if (initialData) {
      setProductId(initialData.productPublicId || "");
      setInstructions(initialData.instructions || "");
      setIsPrimary(initialData.isPrimary ?? false);

      // If initialData already has recipeIngredients (is RecipeDetailResponse)
      const detail = initialData as RecipeDetailResponse;
      if (detail.recipeIngredients && Array.isArray(detail.recipeIngredients)) {
        setRows(
          detail.recipeIngredients.map((item) => ({
            ingredientPublicId: item.ingredient?.id || "",
            quantity: item.quantity,
          }))
        );
      } else {
        // Fetch full detail with ingredients
        setIsLoadingDetail(true);
        recipeApi.recipes
          .getById(initialData.id)
          .then((res) => {
            if (res?.data?.recipeIngredients) {
              setRows(
                res.data.recipeIngredients.map((item) => ({
                  ingredientPublicId: item.ingredient?.id || "",
                  quantity: item.quantity,
                }))
              );
            }
          })
          .catch((err) => {
            setError("Không thể tải danh sách nguyên liệu của công thức.");
          })
          .finally(() => {
            setIsLoadingDetail(false);
          });
      }
    } else {
      // Create mode
      const selectedDefault =
        defaultProductId && products.some((p) => p.id === defaultProductId)
          ? defaultProductId
          : products[0]?.id || "";
      setProductId(selectedDefault);
      setInstructions("");
      setIsPrimary(true);
      setRows([{ ingredientPublicId: ingredients[0]?.id || "", quantity: 1 }]);
      setError(null);
    }
  }, [isOpen, initialData, defaultProductId, products, ingredients]);

  // Handle adding an ingredient row
  const handleAddRow = () => {
    // Pick the first unused ingredient, or just the first ingredient
    const usedIds = new Set(rows.map((r) => r.ingredientPublicId));
    const nextAvailable = ingredients.find((i) => !usedIds.has(i.id)) || ingredients[0];

    setRows((prev) => [
      ...prev,
      {
        ingredientPublicId: nextAvailable ? nextAvailable.id : "",
        quantity: 1,
      },
    ]);
  };

  // Handle removing a row
  const handleRemoveRow = (index: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Handle changing ingredient
  const handleIngredientChange = (index: number, newIngredientId: string) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ingredientPublicId: newIngredientId };
      return copy;
    });
  };

  // Handle changing quantity
  const handleQuantityChange = (index: number, valueStr: string) => {
    const val = valueStr === "" ? "" : parseFloat(valueStr);
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], quantity: isNaN(val as number) ? "" : val };
      return copy;
    });
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isEdit && !productId) {
      setError("Vui lòng chọn món ăn cần tạo công thức.");
      return;
    }

    if (rows.length === 0) {
      setError("Công thức cần ít nhất một nguyên liệu định lượng.");
      return;
    }

    // Check for empty or invalid ingredients
    const selectedIds = new Set<string>();
    const preparedIngredients: CreateRecipeIngredientItem[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.ingredientPublicId) {
        setError(`Dòng thứ ${i + 1}: Vui lòng chọn nguyên liệu.`);
        return;
      }
      if (selectedIds.has(row.ingredientPublicId)) {
        const dupIng = ingredients.find((ing) => ing.id === row.ingredientPublicId);
        setError(`Nguyên liệu "${dupIng?.name || "được chọn"}" bị lặp lại nhiều lần trong công thức.`);
        return;
      }
      selectedIds.add(row.ingredientPublicId);

      const qty = typeof row.quantity === "number" ? row.quantity : parseFloat(String(row.quantity));
      if (isNaN(qty) || qty <= 0) {
        setError(`Dòng thứ ${i + 1}: Định lượng phải lớn hơn 0.`);
        return;
      }

      preparedIngredients.push({
        ingredientPublicId: row.ingredientPublicId,
        quantity: qty,
      });
    }

    try {
      if (isEdit && initialData) {
        const updateBody: UpdateRecipeRequest = {
          instructions: instructions.trim() || null,
          isPrimary,
          ingredients: preparedIngredients,
        };
        await onSubmit(updateBody, initialData.id);
      } else {
        const createBody: CreateRecipeRequest = {
          productPublicId: productId,
          instructions: instructions.trim() || null,
          isPrimary,
          ingredients: preparedIngredients,
        };
        await onSubmit(createBody);
      }
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Đã xảy ra lỗi khi lưu công thức định lượng."
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {isEdit ? "Cập nhật công thức định lượng" : "Tạo công thức định lượng mới"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEdit
                ? `Món ăn: ${initialData?.productName || "Đang chọn"}`
                : "Thiết lập định mức nguyên vật liệu tiêu hao cho món ăn"}
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {isLoadingDetail ? (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mr-2" />
            <span>Đang tải thông tin công thức...</span>
          </div>
        ) : (
          <>
            {/* Product selection & Primary flag */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Món ăn / Đồ uống áp dụng <span className="text-red-500">*</span>
                </label>
                {isEdit ? (
                  <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {initialData?.productName || "Sản phẩm"}
                  </div>
                ) : (
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="" disabled>
                      -- Chọn món ăn từ thực đơn --
                    </option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.categoryName ? `(${p.categoryName})` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 dark:border-slate-700 dark:hover:border-indigo-700 cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      Công thức chuẩn chính thức (Primary Recipe)
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Được hệ thống tự động trừ kho nguyên liệu khi món được gọi hoặc chế biến.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Hướng dẫn pha chế & Quy cách chế biến
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={2}
                placeholder="Ví dụ: Bước 1: 30ml siro + 100ml sữa tươi. Lắc đều với đá..."
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Dynamic Ingredient Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wheat className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Danh sách nguyên liệu định lượng <span className="text-red-500">*</span>
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRow}
                  className="h-8 gap-1 border-indigo-200 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Thêm nguyên liệu</span>
                </Button>
              </div>

              {rows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
                  <Wheat className="mx-auto h-7 w-7 text-slate-400" />
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    Chưa có nguyên liệu nào trong công thức.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddRow}
                    className="mt-3 text-xs"
                  >
                    Thêm nguyên liệu đầu tiên
                  </Button>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-3 py-2.5 w-10 text-center">#</th>
                        <th className="px-3 py-2.5">Nguyên liệu</th>
                        <th className="px-3 py-2.5 w-40 text-right">Định lượng</th>
                        <th className="px-3 py-2.5 w-24 text-center">Đơn vị</th>
                        <th className="px-3 py-2.5 w-12 text-center">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {rows.map((row, idx) => {
                        const matchedIngredient = ingredients.find(
                          (ing) => ing.id === row.ingredientPublicId
                        );

                        return (
                          <tr
                            key={idx}
                            className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                          >
                            <td className="px-3 py-2 text-center text-xs text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={row.ingredientPublicId}
                                onChange={(e) => handleIngredientChange(idx, e.target.value)}
                                required
                                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                              >
                                <option value="" disabled>
                                  -- Chọn nguyên liệu --
                                </option>
                                {ingredients.map((ing) => (
                                  <option key={ing.id} value={ing.id}>
                                    {ing.name}{" "}
                                    {ing.unitSymbol ? `(${ing.unitSymbol})` : ing.unitName ? `(${ing.unitName})` : ""}
                                    {ing.categoryName ? ` • ${ing.categoryName}` : ""}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <Input
                                type="number"
                                step="any"
                                min="0.0001"
                                placeholder="0.00"
                                value={row.quantity}
                                onChange={(e) => handleQuantityChange(idx, e.target.value)}
                                required
                                className="h-8 text-right font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className="inline-block rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {matchedIngredient?.unitSymbol || matchedIngredient?.unitName || "—"}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(idx)}
                                className="rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                                title="Xóa dòng này"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={isLoading}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isEdit ? "Lưu thay đổi" : "Tạo công thức"}</span>
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
