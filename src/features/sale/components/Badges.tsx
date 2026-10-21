import React from "react";
import { Badge } from "@/components/ui/badge";
import { OrderStatus, OrderType, PreparationStatus } from "@/types/enums";
import {
  FileText,
  Clock,
  CheckCircle2,
  ChefHat,
  Bell,
  UtensilsCrossed,
  Truck,
  CheckCheck,
  XCircle,
  ShoppingBag,
  HelpCircle,
} from "lucide-react";

export function OrderStatusBadge({ status }: { status?: OrderStatus | null }) {
  switch (status) {
    case OrderStatus.Draft:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-600/10 dark:bg-slate-800 dark:text-slate-300">
          <FileText className="h-3 w-3" />
          Bản nháp
        </span>
      );
    case OrderStatus.Pending:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-700/10 dark:bg-amber-950/40 dark:text-amber-300">
          <Clock className="h-3 w-3 text-amber-500 animate-pulse" />
          Chờ xác nhận
        </span>
      );
    case OrderStatus.Confirmed:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-950/40 dark:text-blue-300">
          <CheckCircle2 className="h-3 w-3 text-blue-500" />
          Đã xác nhận
        </span>
      );
    case OrderStatus.Preparing:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700 ring-1 ring-inset ring-orange-700/10 dark:bg-orange-950/40 dark:text-orange-300">
          <ChefHat className="h-3 w-3 text-orange-500" />
          Đang chế biến
        </span>
      );
    case OrderStatus.Ready:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 ring-1 ring-inset ring-purple-700/10 dark:bg-purple-950/40 dark:text-purple-300">
          <Bell className="h-3 w-3 text-purple-500" />
          Món đã sẵn sàng
        </span>
      );
    case OrderStatus.Served:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-700/10 dark:bg-teal-950/40 dark:text-teal-300">
          <UtensilsCrossed className="h-3 w-3 text-teal-500" />
          Đã phục vụ
        </span>
      );
    case OrderStatus.Delivering:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-700/10 dark:bg-sky-950/40 dark:text-sky-300">
          <Truck className="h-3 w-3 text-sky-500" />
          Đang giao hàng
        </span>
      );
    case OrderStatus.Completed:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-700/10 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCheck className="h-3 w-3 text-emerald-500" />
          Hoàn tất
        </span>
      );
    case OrderStatus.Cancelled:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-700/10 dark:bg-rose-950/40 dark:text-rose-300">
          <XCircle className="h-3 w-3 text-rose-500" />
          Đã hủy
        </span>
      );
    default:
      return (
        <Badge variant="secondary" className="gap-1 font-normal">
          <HelpCircle className="h-3 w-3" />
          {status || "Chưa rõ"}
        </Badge>
      );
  }
}

export function OrderTypeBadge({ type }: { type?: OrderType | null }) {
  switch (type) {
    case OrderType.DineIn:
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
          <UtensilsCrossed className="h-3 w-3" />
          Tại bàn
        </span>
      );
    case OrderType.TakeAway:
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          <ShoppingBag className="h-3 w-3" />
          Mang về
        </span>
      );
    case OrderType.Delivery:
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
          <Truck className="h-3 w-3" />
          Giao hàng
        </span>
      );
    default:
      return null;
  }
}

export function PreparationStatusBadge({ status }: { status?: PreparationStatus | null }) {
  switch (status) {
    case PreparationStatus.Pending:
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <Clock className="h-2.5 w-2.5" />
          Chờ bếp
        </span>
      );
    case PreparationStatus.Preparing:
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
          <ChefHat className="h-2.5 w-2.5" />
          Đang nấu
        </span>
      );
    case PreparationStatus.Ready:
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-2.5 w-2.5" />
          Xong
        </span>
      );
    case PreparationStatus.Served:
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
          <UtensilsCrossed className="h-2.5 w-2.5" />
          Đã dọn
        </span>
      );
    case PreparationStatus.Cancelled:
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          <XCircle className="h-2.5 w-2.5" />
          Hủy món
        </span>
      );
    default:
      return null;
  }
}
