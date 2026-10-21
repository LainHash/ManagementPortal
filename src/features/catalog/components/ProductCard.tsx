import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StockStatusBadge, InventoryTypeBadge } from "./Badges";
import type { ProductResponse } from "@/types/catalog.types";
import { UtensilsCrossed, Eye, Edit, Trash2, Tags, Layers, DollarSign, Boxes } from "lucide-react";

interface ProductCardProps {
  product: ProductResponse;
  onViewDetail: (product: ProductResponse) => void;
  onEdit: (product: ProductResponse) => void;
  onDelete: (product: ProductResponse) => void;
  onUpdatePrice?: (product: ProductResponse) => void;
  onUpdateStock?: (product: ProductResponse) => void;
}

export function ProductCard({
  product,
  onViewDetail,
  onEdit,
  onDelete,
  onUpdatePrice,
  onUpdateStock,
}: ProductCardProps) {
  const imageUrl = product.primaryImage?.image?.url;
  const formatPrice = (price?: number | null, currency?: string | null) => {
    if (price === undefined || price === null) return "Liên hệ";
    return `${price.toLocaleString("vi-VN")} ${currency || "đ"}`;
  };

  return (
    <Card className="group relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-900/60">
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.primaryImage?.image?.altText || product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50/50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <UtensilsCrossed className="h-10 w-10 text-slate-300 dark:text-slate-600 transition-transform group-hover:scale-110" />
          </div>
        )}

        {/* Status badges overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <StockStatusBadge status={product.stockStatus} />
        </div>

        {/* Top-right Unit badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className="rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-xs backdrop-blur-xs dark:bg-slate-900/90 dark:text-slate-200">
            /{product.unitSymbol || "Phần"}
          </span>
        </div>
      </div>

      {/* Body content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category & Brand tags */}
        <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
            <Tags className="h-3 w-3" />
            {product.categoryName}
          </span>
          {product.brandName && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1 truncate">
                <Layers className="h-3 w-3" />
                {product.brandName}
              </span>
            </>
          )}
        </div>

        {/* Product Name */}
        <h3
          onClick={() => onViewDetail(product)}
          className="cursor-pointer text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 dark:text-white dark:group-hover:text-indigo-400"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Description snippet */}
        <p className="mt-1 flex-1 text-xs text-slate-500 line-clamp-2 dark:text-slate-400">
          {product.description || "Chưa có mô tả cho món ăn này."}
        </p>

        {/* Inventory type & Price */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
              Giá niêm yết
            </span>
            <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
              {formatPrice(product.unitPrice, product.currency)}
            </span>
          </div>
          <InventoryTypeBadge type={product.inventoryType} />
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetail(product)}
            className="h-8 px-2 text-xs text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            title="Xem chi tiết"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            Chi tiết
          </Button>
          {onUpdatePrice && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpdatePrice(product)}
              className="h-8 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
              title="Cập nhật giá theo chi nhánh"
            >
              <DollarSign className="h-3.5 w-3.5 mr-1" />
              Giá
            </Button>
          )}
          {onUpdateStock && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpdateStock(product)}
              className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
              title="Cập nhật tồn kho theo chi nhánh"
            >
              <Boxes className="h-3.5 w-3.5 mr-1" />
              Kho
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(product)}
            className="h-8 px-2 text-xs text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            title="Chỉnh sửa món"
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Sửa
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(product)}
            className="h-8 px-2 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            title="Xóa món ăn"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
