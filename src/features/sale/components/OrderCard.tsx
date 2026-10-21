import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge, OrderTypeBadge } from "./Badges";
import type { OrderResponse } from "@/types/sale.types";
import {
  ShoppingBag,
  User,
  Clock,
  Building2,
  DollarSign,
  ArrowRight,
  UtensilsCrossed,
} from "lucide-react";

interface OrderCardProps {
  order: OrderResponse;
  onViewDetail: (order: OrderResponse) => void;
}

export function OrderCard({ order, onViewDetail }: OrderCardProps) {
  const formatPrice = (amount?: number | null) => {
    if (amount === undefined || amount === null) return "0 đ";
    return `${amount.toLocaleString("vi-VN")} đ`;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <Card
      onClick={() => onViewDetail(order)}
      className="group relative flex flex-col justify-between overflow-hidden p-4 transition-all duration-300 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-900/60 cursor-pointer"
    >
      <div>
        {/* Top row: Order code & Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors">
            #{order.orderCode}
          </span>
          <div className="flex items-center gap-1.5">
            <OrderTypeBadge type={order.type} />
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        {/* Customer & Branch */}
        <div className="space-y-1 mb-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
              <User className="h-3.5 w-3.5 text-slate-400" />
              {order.customerName || "Khách vãng lai"}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="h-3 w-3" />
              {formatDate(order.createdAt)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3 text-emerald-600" />
              {order.branchCode || "Chi nhánh"}
            </span>
            {order.tableNumber && (
              <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-700 font-semibold dark:bg-indigo-950 dark:text-indigo-300">
                Bàn {order.tableNumber}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="border-t border-slate-100 pt-3 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {order.totalItems} món • Tổng tiền
          </span>
          <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
            {formatPrice(order.totalAmount)}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
          <span>Chi tiết</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Card>
  );
}
