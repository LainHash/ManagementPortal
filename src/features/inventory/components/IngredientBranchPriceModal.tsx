import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inventoryApi } from "../api/inventory.api";
import type { IngredientResponse } from "@/types/inventory.types";
import type { BranchResponse } from "@/types/territory.types";
import { Currency } from "@/types/enums";
import { DollarSign, Building2, AlertCircle, Loader2, Wheat, CheckCircle2 } from "lucide-react";

interface IngredientBranchPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient?: IngredientResponse | null;
  ingredients?: IngredientResponse[];
  branches: BranchResponse[];
  initialBranchId?: string;
  onSuccess: (message: string) => void;
}

export function IngredientBranchPriceModal({
  isOpen,
  onClose,
  ingredient,
  ingredients = [],
  branches,
  initialBranchId,
  onSuccess,
}: IngredientBranchPriceModalProps) {
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [unitPrice, setUnitPrice] = useState<string>("");
  const [currency, setCurrency] = useState<string>(Currency.VND);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active ingredient is either passed directly or picked from ingredients list
  const activeIngredient = ingredient || ingredients.find((i) => i.id === selectedIngredientId) || null;

  useEffect(() => {
    if (isOpen) {
      if (ingredient) {
        setSelectedIngredientId(ingredient.id);
        setUnitPrice(
          ingredient.unitPrice !== undefined && ingredient.unitPrice !== null
            ? String(ingredient.unitPrice)
            : ""
        );
        setCurrency(ingredient.currency || Currency.VND);
      } else if (ingredients.length > 0) {
        setSelectedIngredientId(ingredients[0].id);
        setUnitPrice(
          ingredients[0].unitPrice !== undefined && ingredients[0].unitPrice !== null
            ? String(ingredients[0].unitPrice)
            : ""
        );
        setCurrency(ingredients[0].currency || Currency.VND);
      } else {
        setSelectedIngredientId("");
        setUnitPrice("");
      }

      const defaultBranch =
        initialBranchId && branches.some((b) => b.id === initialBranchId)
          ? initialBranchId
          : branches[0]?.id || "";

      setSelectedBranchId(defaultBranch);
      setError(null);
    }
  }, [isOpen, ingredient, ingredients, initialBranchId, branches]);

  const handleIngredientChange = (ingId: string) => {
    setSelectedIngredientId(ingId);
    const chosen = ingredients.find((i) => i.id === ingId);
    if (chosen) {
      setUnitPrice(
        chosen.unitPrice !== undefined && chosen.unitPrice !== null ? String(chosen.unitPrice) : ""
      );
    }
  };

  const handlePricePreset = (val: number) => {
    setUnitPrice(String(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!activeIngredient) {
      setError("Vui lòng chọn nguyên liệu cần thiết lập giá.");
      return;
    }

    if (!selectedBranchId) {
      setError("Vui lòng chọn chi nhánh áp dụng giá.");
      return;
    }

    const priceNum = Number(unitPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Đơn giá phải là số hợp lệ và lớn hơn hoặc bằng 0.");
      return;
    }

    setIsLoading(true);
    try {
      // Use createPrice endpoint which implicitly creates/binds IngredientBranch if not yet existing
      await inventoryApi.ingredients.createPrice({
        ingredientPublicId: activeIngredient.id,
        branchPublicId: selectedBranchId,
        unitPrice: priceNum,
        currency: Currency.VND,
      });

      const branchName =
        branches.find((b) => b.id === selectedBranchId)?.address ||
        branches.find((b) => b.id === selectedBranchId)?.city ||
        "chi nhánh đã chọn";

      onSuccess(
        `Đã thiết lập đơn giá nguyên liệu "${activeIngredient.name}" tại ${branchName} thành ${priceNum.toLocaleString("vi-VN")} đ.`
      );
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể cập nhật giá cho chi nhánh này. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Thiết lập giá nguyên liệu chi nhánh
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Thiết lập đơn giá mua / hạch toán nguyên liệu theo chi nhánh (tự động liên kết cơ sở)
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/50">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Ingredient selector if not fixed */}
        {!ingredient && ingredients.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Wheat className="h-3.5 w-3.5 text-emerald-600" />
              Chọn nguyên liệu <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedIngredientId}
              onChange={(e) => handleIngredientChange(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
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
              <Wheat className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {activeIngredient.name}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Đơn vị:{" "}
                  <strong className="text-slate-700 dark:text-slate-300">
                    {activeIngredient.unitSymbol || "kg"}
                  </strong>
                </span>
                <span>•</span>
                <span>{activeIngredient.categoryName}</span>
              </div>
            </div>
          </div>
        )}

        {/* Branch selection */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Chi nhánh áp dụng <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            disabled={isLoading || branches.length === 0}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
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

        {/* Price Input */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Đơn giá hạch toán / mua vào (VNĐ) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              type="number"
              min="0"
              step="500"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="Ví dụ: 30000"
              disabled={isLoading}
              required
              className="pr-12 text-base font-semibold text-emerald-600 dark:text-emerald-400"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              VNĐ
            </span>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[10000, 25000, 50000, 80000, 120000, 200000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePricePreset(preset)}
                className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                {preset.toLocaleString("vi-VN")} đ
              </button>
            ))}
          </div>

          {unitPrice && !isNaN(Number(unitPrice)) && Number(unitPrice) > 0 && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Định dạng hiển thị:{" "}
              <strong className="text-slate-700 dark:text-slate-300">
                {Number(unitPrice).toLocaleString("vi-VN")} đ
              </strong>{" "}
              / {activeIngredient?.unitSymbol || "đơn vị"}
            </p>
          )}
        </div>

        {/* Modal actions */}
        <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isLoading || branches.length === 0 || !activeIngredient}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Đang lưu giá...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                Lưu giá nguyên liệu
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
