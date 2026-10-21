import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { catalogApi } from "../api/catalog.api";
import type { ProductResponse } from "@/types/catalog.types";
import type { BranchResponse } from "@/types/territory.types";
import { Currency } from "@/types/enums";
import { DollarSign, Building2, AlertCircle, Loader2, UtensilsCrossed, CheckCircle2, Search } from "lucide-react";

interface ProductBranchPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductResponse | null;
  products?: ProductResponse[];
  branches: BranchResponse[];
  initialBranchId?: string;
  onSuccess: (message: string) => void;
}

export function ProductBranchPriceModal({
  isOpen,
  onClose,
  product,
  products = [],
  branches,
  initialBranchId,
  onSuccess,
}: ProductBranchPriceModalProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [unitPrice, setUnitPrice] = useState<string>("");
  const [currency, setCurrency] = useState<string>(Currency.VND);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active product is either passed directly or picked from products list
  const activeProduct = product || products.find((p) => p.id === selectedProductId) || null;

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setSelectedProductId(product.id);
        setUnitPrice(
          product.unitPrice !== undefined && product.unitPrice !== null
            ? String(product.unitPrice)
            : ""
        );
        setCurrency(product.currency || Currency.VND);
      } else if (products.length > 0) {
        setSelectedProductId(products[0].id);
        setUnitPrice(
          products[0].unitPrice !== undefined && products[0].unitPrice !== null
            ? String(products[0].unitPrice)
            : ""
        );
        setCurrency(products[0].currency || Currency.VND);
      } else {
        setSelectedProductId("");
        setUnitPrice("");
      }

      // Default to initialBranchId or first available branch
      const defaultBranch =
        initialBranchId && branches.some((b) => b.id === initialBranchId)
          ? initialBranchId
          : branches[0]?.id || "";

      setSelectedBranchId(defaultBranch);
      setError(null);
    }
  }, [isOpen, product, products, initialBranchId, branches]);

  // When changing product in dropdown mode, sync default price
  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const chosen = products.find((p) => p.id === prodId);
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

    if (!activeProduct) {
      setError("Vui lòng chọn món ăn cần thiết lập giá.");
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
      // Use createPrice endpoint which implicitly creates/binds ProductBranch if not yet existing
      await catalogApi.products.createPrice({
        productPublicId: activeProduct.id,
        branchPublicId: selectedBranchId,
        unitPrice: priceNum,
        currency: Currency.VND,
      });

      const branchName =
        branches.find((b) => b.id === selectedBranchId)?.address ||
        branches.find((b) => b.id === selectedBranchId)?.city ||
        "chi nhánh đã chọn";

      onSuccess(
        `Đã thiết lập giá bán món "${activeProduct.name}" tại ${branchName} thành ${priceNum.toLocaleString("vi-VN")} đ.`
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
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <DollarSign className="h-5 w-5" />
          <span>Thiết lập Giá bán theo Chi nhánh</span>
        </div>
      }
      description="Thiết lập đơn giá niêm yết áp dụng riêng cho từng chi nhánh. Bản ghi chi nhánh sẽ tự động được liên kết."
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
                  {p.name} ({p.categoryName || "Chưa phân loại"})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Product mini info card */}
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
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{activeProduct.categoryName}</span>
                <span>•</span>
                <span>ĐVT: {activeProduct.unitSymbol || "Phần"}</span>
              </div>
            </div>
          </div>
        )}

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

        {/* Price Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
            Đơn giá niêm yết (VNĐ) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              type="number"
              min="0"
              step="500"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="Ví dụ: 45000"
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
            {[25000, 35000, 45000, 55000, 75000, 99000, 150000].map((preset) => (
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
              / {activeProduct?.unitSymbol || "Phần"}
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
            disabled={isLoading || branches.length === 0 || !activeProduct}
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
                Lưu giá chi nhánh
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
