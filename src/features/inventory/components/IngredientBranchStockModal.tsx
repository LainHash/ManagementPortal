import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inventoryApi } from "../api/inventory.api";
import type { IngredientResponse } from "@/types/inventory.types";
import type { BranchResponse } from "@/types/territory.types";
import {
  Boxes,
  Building2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Wheat,
  CheckCircle2,
  Info,
} from "lucide-react";

interface IngredientBranchStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient?: IngredientResponse | null;
  ingredients?: IngredientResponse[];
  branches: BranchResponse[];
  initialBranchId?: string;
  onSuccess: (message: string) => void;
}

export function IngredientBranchStockModal({
  isOpen,
  onClose,
  ingredient,
  ingredients = [],
  branches,
  initialBranchId,
  onSuccess,
}: IngredientBranchStockModalProps) {
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [quantityOnHand, setQuantityOnHand] = useState<string>("");
  const [reorderLevel, setReorderLevel] = useState<string>("10");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active ingredient is either passed directly or picked from ingredients list
  const activeIngredient = ingredient || ingredients.find((i) => i.id === selectedIngredientId) || null;

  useEffect(() => {
    if (isOpen) {
      if (ingredient) {
        setSelectedIngredientId(ingredient.id);
        setQuantityOnHand(
          ingredient.availableQuantity !== undefined && ingredient.availableQuantity !== null
            ? String(ingredient.availableQuantity)
            : ""
        );
      } else if (ingredients.length > 0) {
        setSelectedIngredientId(ingredients[0].id);
        setQuantityOnHand(
          ingredients[0].availableQuantity !== undefined && ingredients[0].availableQuantity !== null
            ? String(ingredients[0].availableQuantity)
            : ""
        );
      } else {
        setSelectedIngredientId("");
        setQuantityOnHand("");
      }

      const defaultBranch =
        initialBranchId && branches.some((b) => b.id === initialBranchId)
          ? initialBranchId
          : branches[0]?.id || "";

      setSelectedBranchId(defaultBranch);
      setReorderLevel("10");
      setError(null);
    }
  }, [isOpen, ingredient, ingredients, initialBranchId, branches]);

  const handleIngredientChange = (ingId: string) => {
    setSelectedIngredientId(ingId);
    const chosen = ingredients.find((i) => i.id === ingId);
    if (chosen) {
      setQuantityOnHand(
        chosen.availableQuantity !== undefined && chosen.availableQuantity !== null
          ? String(chosen.availableQuantity)
          : ""
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!activeIngredient) {
      setError("Vui lòng chọn nguyên liệu cần cập nhật tồn kho.");
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
      // Use createStock endpoint which implicitly creates/binds IngredientBranch if not yet existing
      await inventoryApi.ingredients.createStock({
        ingredientPublicId: activeIngredient.id,
        branchPublicId: selectedBranchId,
        quantityOnHand: qty,
        reorderLevel: reorder,
      });

      const branchName =
        branches.find((b) => b.id === selectedBranchId)?.address ||
        branches.find((b) => b.id === selectedBranchId)?.city ||
        "chi nhánh đã chọn";

      onSuccess(
        `Đã cập nhật tồn kho nguyên liệu "${activeIngredient.name}" tại ${branchName}: ${qty} ${activeIngredient.unitSymbol || "đơn vị"} (Cảnh báo: ${reorder}).`
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

  const previewQty = Number(quantityOnHand) || 0;
  const previewReorder = Number(reorderLevel) || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cập nhật tồn kho nguyên liệu chi nhánh
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kiểm kê và điều chỉnh số lượng tồn kho theo chi nhánh (tự động liên kết cơ sở)
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Ingredient selector if not fixed */}
        {!ingredient && ingredients.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Wheat className="h-3.5 w-3.5 text-indigo-600" />
              Chọn nguyên liệu <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedIngredientId}
              onChange={(e) => handleIngredientChange(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              {ingredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} ({ing.unitSymbol || "Đơn vị"} - {ing.categoryName})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Ingredient quick info */}
        {activeIngredient && (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs dark:bg-slate-800">
              <Wheat className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {activeIngredient.name}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Đơn vị:{" "}
                  <strong className="text-slate-700 dark:text-slate-300">
                    {activeIngredient.unitSymbol || "đơn vị"}
                  </strong>
                </span>
                <span>•</span>
                <span>{activeIngredient.categoryName}</span>
              </div>
            </div>
          </div>
        )}

        {/* Branch select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Chi nhánh áp dụng <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {branches.length === 0 ? (
                <option value="">Không có chi nhánh nào</option>
              ) : (
                branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.branchCode} - {b.address ? `${b.address} (${b.city})` : b.city}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Quantity on hand input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Số lượng tồn kho thực tế ({activeIngredient?.unitSymbol || "đơn vị"}) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Input
              type="number"
              min="0"
              step="any"
              value={quantityOnHand}
              onChange={(e) => setQuantityOnHand(e.target.value)}
              placeholder="VD: 50"
              className="pl-9 pr-16 font-semibold text-slate-900 dark:text-white"
              required
            />
            <Boxes className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              {activeIngredient?.unitSymbol || "đơn vị"}
            </span>
          </div>
        </div>

        {/* Reorder level input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Mức cảnh báo tồn kho tối thiểu (Reorder Level)
          </label>
          <div className="relative">
            <Input
              type="number"
              min="0"
              step="any"
              value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value)}
              placeholder="VD: 10"
              className="pl-9 pr-16 text-slate-900 dark:text-white"
            />
            <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              {activeIngredient?.unitSymbol || "đơn vị"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
            <Info className="h-3 w-3 shrink-0" />
            Hệ thống sẽ gắn thẻ cảnh báo &quot;Sắp hết hàng&quot; khi lượng khả dụng ≤ mức này.
          </p>
        </div>

        {/* Status preview banner */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Trạng thái dự kiến:</span>
            {previewQty <= 0 ? (
              <span className="font-semibold text-rose-600 dark:text-rose-400">Hết hàng (Out of Stock)</span>
            ) : previewQty <= previewReorder ? (
              <span className="font-semibold text-amber-600 dark:text-amber-400">Sắp hết hàng (Low Stock)</span>
            ) : (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Còn hàng (Available)</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
            disabled={isLoading || branches.length === 0 || !activeIngredient}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang lưu tồn kho...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Lưu tồn kho chi nhánh
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
