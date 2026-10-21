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
  ingredient: IngredientResponse | null;
  branches: BranchResponse[];
  initialBranchId?: string;
  onSuccess: (message: string) => void;
}

export function IngredientBranchPriceModal({
  isOpen,
  onClose,
  ingredient,
  branches,
  initialBranchId,
  onSuccess,
}: IngredientBranchPriceModalProps) {
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [unitPrice, setUnitPrice] = useState<string>("");
  const [currency, setCurrency] = useState<string>(Currency.VND);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && ingredient) {
      const defaultBranch =
        initialBranchId && branches.some((b) => b.id === initialBranchId)
          ? initialBranchId
          : branches[0]?.id || "";

      setSelectedBranchId(defaultBranch);
      setUnitPrice(
        ingredient.unitPrice !== undefined && ingredient.unitPrice !== null
          ? String(ingredient.unitPrice)
          : ""
      );
      setCurrency(ingredient.currency || Currency.VND);
      setError(null);
    }
  }, [isOpen, ingredient, initialBranchId, branches]);

  if (!ingredient) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      await inventoryApi.ingredients.updateBranchPrice(
        ingredient.id,
        selectedBranchId,
        {
          unitPrice: priceNum,
          currency: Currency.VND,
        }
      );

      const branchName =
        branches.find((b) => b.id === selectedBranchId)?.address || "chi nhánh đã chọn";

      onSuccess(
        `Đã cập nhật đơn giá nguyên liệu "${ingredient.name}" tại ${branchName} thành ${priceNum.toLocaleString("vi-VN")} đ.`
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
              Cập nhật giá nguyên liệu
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Thiết lập đơn giá cho nguyên liệu theo từng chi nhánh
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ingredient quick info */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs dark:bg-slate-800">
            <Wheat className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {ingredient.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Đơn vị: <strong className="text-slate-700 dark:text-slate-300">{ingredient.unitSymbol || "kg"}</strong></span>
              <span>•</span>
              <span>{ingredient.categoryName}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
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
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {branches.length === 0 ? (
                <option value="">Không có chi nhánh nào</option>
              ) : (
                branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.branchCode} - {b.address}
                  </option>
                ))
              )}
            </select>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Mỗi chi nhánh có thể áp dụng giá nhập/mua nguyên liệu khác nhau.
          </p>
        </div>

        {/* Unit Price input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Đơn vị giá (VND/{ingredient.unitSymbol || "đơn vị"}) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Input
              type="number"
              min="0"
              step="100"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="VD: 45000"
              className="pl-9 pr-14 font-semibold text-slate-900 dark:text-white"
              required
            />
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              VNĐ
            </span>
          </div>
          {unitPrice && !isNaN(Number(unitPrice)) && Number(unitPrice) > 0 && (
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              = {Number(unitPrice).toLocaleString("vi-VN")} đ / {ingredient.unitSymbol || "đơn vị"}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            disabled={isLoading || branches.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Lưu đơn giá
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
