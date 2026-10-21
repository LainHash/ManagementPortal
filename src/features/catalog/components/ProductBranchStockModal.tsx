import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { catalogApi } from "../api/catalog.api";
import type { ProductResponse } from "@/types/catalog.types";
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
} from "lucide-react";

interface ProductBranchStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductResponse | null;
  branches: BranchResponse[];
  initialBranchId?: string;
  onSuccess: (message: string) => void;
}

export function ProductBranchStockModal({
  isOpen,
  onClose,
  product,
  branches,
  initialBranchId,
  onSuccess,
}: ProductBranchStockModalProps) {
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [quantityOnHand, setQuantityOnHand] = useState<string>("");
  const [reorderLevel, setReorderLevel] = useState<string>("10");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isMadeToOrder = product?.inventoryType === InventoryType.MadeToOrder;

  useEffect(() => {
    if (isOpen && product) {
      const defaultBranch =
        initialBranchId && branches.some((b) => b.id === initialBranchId)
          ? initialBranchId
          : branches[0]?.id || "";

      setSelectedBranchId(defaultBranch);
      setQuantityOnHand("");
      setReorderLevel("10");
      setError(null);
    }
  }, [isOpen, product, initialBranchId, branches]);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMadeToOrder) return;
    setError(null);

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
      const res = await catalogApi.products.updateBranchStock(
        product.id,
        selectedBranchId,
        {
          quantityOnHand: qty,
          reorderLevel: reorder,
        }
      );

      const branchName =
        branches.find((b) => b.id === selectedBranchId)?.address || "chi nhánh đã chọn";

      onSuccess(
        `Đã cập nhật tồn kho món "${product.name}" tại ${branchName}: ${qty} ${product.unitSymbol || "Phần"} (Tối thiểu: ${reorder}).`
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
      maxWidth="md"
      title={
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Boxes className="h-5 w-5" />
          <span>Cập nhật Tồn kho theo Chi nhánh</span>
        </div>
      }
      description="Quản lý số lượng tồn thực tế và ngưỡng cảnh báo tồn kho cho chi nhánh."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/50">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Product mini info */}
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
            {product.primaryImage?.image?.url ? (
              <img
                src={product.primaryImage.image.url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <UtensilsCrossed className="h-5 w-5 text-slate-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-slate-900 truncate dark:text-white">
              {product.name}
            </h4>
            <div className="mt-1 flex items-center gap-2">
              <InventoryTypeBadge type={product.inventoryType} />
              <span className="text-xs text-slate-500">
                ĐVT: {product.unitSymbol || "Phần"}
              </span>
            </div>
          </div>
        </div>

        {/* If MadeToOrder -> display notice and prevent direct edits */}
        {isMadeToOrder ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
                <p className="font-semibold text-sm">Món ăn chế biến theo công thức</p>
                <p>
                  Món ăn này thuộc loại <strong>Chế biến gọi món (MadeToOrder)</strong>. Tình trạng sẵn có và tồn kho của món được hệ thống tự động kiểm tra và tính toán dựa trên mức tồn kho thực tế của các nguyên liệu trong công thức (Recipe).
                </p>
                <p className="text-slate-500 dark:text-slate-400 pt-1">
                  💡 Để điều chỉnh nguyên liệu, vui lòng cập nhật tại mục <em>Quản lý Kho Nguyên liệu</em> hoặc <em>Công thức món ăn</em>.
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Đã hiểu & Đóng
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
                  {product.unitSymbol || "Phần"}
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
                  {product.unitSymbol || "Phần"}
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
                disabled={isLoading || branches.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Đang lưu tồn kho...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Cập nhật tồn kho
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
