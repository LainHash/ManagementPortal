import React from "react";
import { Badge } from "@/components/ui/badge";
import { StockStatus, InventoryType, UnitType } from "@/types/enums";
import { CheckCircle2, AlertTriangle, XCircle, ChefHat, Package, Scale, Beaker, Hash } from "lucide-react";

export function StockStatusBadge({ status }: { status?: StockStatus | null }) {
  switch (status) {
    case StockStatus.Available:
      return (
        <Badge variant="success" className="gap-1 font-medium">
          <CheckCircle2 className="h-3 w-3" />
          Còn hàng
        </Badge>
      );
    case StockStatus.LowStock:
      return (
        <Badge variant="warning" className="gap-1 font-medium">
          <AlertTriangle className="h-3 w-3" />
          Sắp hết hàng
        </Badge>
      );
    case StockStatus.OutOfStock:
      return (
        <Badge variant="destructive" className="gap-1 font-medium">
          <XCircle className="h-3 w-3" />
          Hết hàng
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="gap-1 font-normal">
          Chưa rõ
        </Badge>
      );
  }
}

export function InventoryTypeBadge({ type }: { type: InventoryType }) {
  if (type === InventoryType.MadeToOrder) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 dark:bg-purple-950/40 dark:text-purple-300 dark:ring-purple-400/20">
        <ChefHat className="h-3 w-3" />
        Chế biến gọi món
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-700/10 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-400/20">
      <Package className="h-3 w-3" />
      Theo dõi tồn kho
    </span>
  );
}

export function UnitTypeBadge({ type }: { type: UnitType }) {
  switch (type) {
    case UnitType.Weight:
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-700/10 dark:bg-teal-950/40 dark:text-teal-300 dark:ring-teal-400/20">
          <Scale className="h-3 w-3" />
          Khối lượng
        </span>
      );
    case UnitType.Volume:
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-400/20">
          <Beaker className="h-3 w-3" />
          Thể tích
        </span>
      );
    case UnitType.Quantity:
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-700/10 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-400/20">
          <Hash className="h-3 w-3" />
          Số lượng
        </span>
      );
  }
}
