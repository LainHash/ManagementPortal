import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StockStatusBadge } from "@/features/catalog/components/Badges";
import type { IngredientResponse } from "@/types/inventory.types";
import {
  Wheat,
  Eye,
  Edit,
  Trash2,
  Tags,
  Layers,
  DollarSign,
  Boxes,
} from "lucide-react";

interface IngredientCardProps {
  ingredient: IngredientResponse;
  onViewDetail: (ingredient: IngredientResponse) => void;
  onEdit: (ingredient: IngredientResponse) => void;
  onDelete: (ingredient: IngredientResponse) => void;
  onUpdatePrice?: (ingredient: IngredientResponse) => void;
  onUpdateStock?: (ingredient: IngredientResponse) => void;
}

export function IngredientCard({
  ingredient,
  onViewDetail,
  onEdit,
  onDelete,
  onUpdatePrice,
  onUpdateStock,
}: IngredientCardProps) {
  const formatPrice = (price?: number | null, currency?: string | null) => {
    if (price === undefined || price === null) return "Chưa định giá";
    return `${price.toLocaleString("vi-VN")} ${currency || "đ"}`;
  };

  return (
    <Card className="group relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-900/60">
      {/* Top Banner / Icon Representation */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-emerald-500/10 via-slate-100 to-teal-500/10 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/30 flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md shadow-emerald-500/10 text-emerald-600 dark:bg-slate-800 dark:text-emerald-400 transition-transform duration-500 group-hover:scale-110">
          <Wheat className="h-8 w-8" />
        </div>

        {/* Status badges overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <StockStatusBadge status={ingredient.stockStatus} />
        </div>

        {/* Top-right Unit badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className="rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-bold text-slate-700 shadow-xs backdrop-blur-xs dark:bg-slate-900/90 dark:text-slate-200">
            /{ingredient.unitSymbol || "đơn vị"}
          </span>
        </div>
      </div>

      {/* Body content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category & Brand tags */}
        <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <Tags className="h-3 w-3" />
            {ingredient.categoryName}
          </span>
          {ingredient.brandName && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1 truncate">
                <Layers className="h-3 w-3" />
                {ingredient.brandName}
              </span>
            </>
          )}
        </div>

        {/* Ingredient Name */}
        <h3
          onClick={() => onViewDetail(ingredient)}
          className="cursor-pointer text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1 dark:text-white dark:group-hover:text-emerald-400"
          title={ingredient.name}
        >
          {ingredient.name}
        </h3>

        {/* Description snippet */}
        <p className="mt-1 flex-1 text-xs text-slate-500 line-clamp-2 dark:text-slate-400">
          {ingredient.description ||
            "Chưa có mô tả chi tiết cho nguyên liệu này."}
        </p>

        {/* Metrics: Price & Stock */}
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
              Đơn giá chi nhánh
            </span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatPrice(ingredient.unitPrice, ingredient.currency)}/
              {ingredient.unitSymbol || "đơn vị"}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
              Tồn kho khả dụng
            </span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
              {ingredient.availableQuantity !== null &&
              ingredient.availableQuantity !== undefined
                ? ingredient.availableQuantity
                : 0}{" "}
              <span className="text-xs font-medium text-slate-400">
                {ingredient.unitSymbol || ""}
              </span>
            </span>
          </div>
        </div>

        {/* Action bar */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <div className="flex items-center gap-1">
            {onUpdatePrice && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdatePrice(ingredient)}
                className="h-8 px-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                title="Cập nhật giá chi nhánh"
              >
                <DollarSign className="h-3.5 w-3.5 mr-1" />
                Giá
              </Button>
            )}
            {onUpdateStock && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdateStock(ingredient)}
                className="h-8 px-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                title="Cập nhật tồn kho"
              >
                <Boxes className="h-3.5 w-3.5 mr-1" />
                Kho
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetail(ingredient)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              title="Xem chi tiết"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(ingredient)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              title="Chỉnh sửa"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(ingredient)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
              title="Xóa nguyên liệu"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
