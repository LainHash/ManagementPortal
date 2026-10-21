import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { inventoryApi } from "../api/inventory.api";
import { StockStatusBadge } from "@/features/catalog/components/Badges";
import type { IngredientDetailResponse, IngredientResponse } from "@/types/inventory.types";
import {
  Wheat,
  Tags,
  Layers,
  Scale,
  DollarSign,
  Boxes,
  Edit,
  Loader2,
  Building2,
  AlertTriangle,
  Info,
} from "lucide-react";

interface IngredientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient: IngredientResponse | null;
  branchId?: string;
  branchName?: string;
  onEdit?: (ingredient: IngredientResponse) => void;
  onUpdatePrice?: (ingredient: IngredientResponse) => void;
  onUpdateStock?: (ingredient: IngredientResponse) => void;
}

export function IngredientDetailModal({
  isOpen,
  onClose,
  ingredient,
  branchId,
  branchName,
  onEdit,
  onUpdatePrice,
  onUpdateStock,
}: IngredientDetailModalProps) {
  const [detail, setDetail] = useState<IngredientDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && ingredient?.id) {
      setIsLoading(true);
      inventoryApi.ingredients
        .getById(ingredient.id, branchId)
        .then((res) => {
          if (res?.data) {
            setDetail(res.data);
          } else {
            setDetail(null);
          }
        })
        .catch(() => {
          setDetail(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setDetail(null);
    }
  }, [isOpen, ingredient?.id, branchId]);

  if (!ingredient) return null;

  const currentData = detail || ingredient;

  const formatPrice = (price?: number | null, currency?: string | null) => {
    if (price === undefined || price === null) return "Chưa định giá";
    return `${price.toLocaleString("vi-VN")} ${currency || "VND"}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Wheat className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Chi tiết nguyên liệu: {ingredient.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Thông số định lượng, phân loại và số dư tồn kho chi nhánh
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {isLoading && (
          <div className="flex items-center justify-center py-4 gap-2 text-emerald-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">Đang tải thông tin chi tiết từ máy chủ...</span>
          </div>
        )}

        {/* Branch Context Indicator */}
        {branchId && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-2.5 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Chi nhánh đang xem: <strong>{branchName || "Chi nhánh đã chọn"}</strong>
            </span>
            <StockStatusBadge status={currentData.stockStatus} />
          </div>
        )}

        {/* Core details grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Phân loại danh mục
            </span>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
              <Tags className="h-4 w-4 text-emerald-600" />
              <span>{currentData.categoryName}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Đơn vị đo lường
            </span>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
              <Scale className="h-4 w-4 text-indigo-600" />
              <span>
                {currentData.unitName} ({currentData.unitSymbol})
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Thương hiệu / Xuất xứ
            </span>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
              <Layers className="h-4 w-4 text-amber-600" />
              <span>{currentData.brandName || "Không xác định"}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Đơn giá tại chi nhánh
            </span>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
              <span>{formatPrice(currentData.unitPrice, currentData.currency)}</span>
            </div>
          </div>
        </div>

        {/* Stock Metrics Card */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2 dark:border-slate-800">
            <span className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <Boxes className="h-4 w-4 text-indigo-600" />
              Tình trạng tồn kho thực tế
            </span>
            <StockStatusBadge status={currentData.stockStatus} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
              <span className="text-[11px] text-slate-500 block mb-0.5">Khả dụng</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                {currentData.availableQuantity !== null && currentData.availableQuantity !== undefined
                  ? currentData.availableQuantity
                  : "0"}
              </span>
              <span className="text-xs text-slate-400 ml-1">{currentData.unitSymbol}</span>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
              <span className="text-[11px] text-slate-500 block mb-0.5">Đơn vị lưu kho</span>
              <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {currentData.unitSymbol || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Description section */}
        {currentData.description && (
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 dark:text-slate-300">
              <Info className="h-3.5 w-3.5 text-slate-400" />
              Mô tả & Ghi chú
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
              {currentData.description}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap gap-2">
            {onUpdatePrice && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onUpdatePrice(currentData)}
                className="gap-1.5 text-emerald-600 hover:text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950/40"
              >
                <DollarSign className="h-4 w-4" />
                Cập nhật giá
              </Button>
            )}
            {onUpdateStock && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onUpdateStock(currentData)}
                className="gap-1.5 text-indigo-600 hover:text-indigo-700 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-950/40"
              >
                <Boxes className="h-4 w-4" />
                Cập nhật kho
              </Button>
            )}
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEdit(currentData)}
                className="gap-1.5"
              >
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </Button>
            )}
          </div>

          <Button type="button" variant="default" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
