import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { saleApi } from "../api/sale.api";
import { OrderStatusBadge, OrderTypeBadge, PreparationStatusBadge } from "./Badges";
import { OrderStatus, OrderType } from "@/types/enums";
import type { OrderDetailResponse, OrderResponse } from "@/types/sale.types";
import {
  ShoppingBag,
  User,
  MapPin,
  Clock,
  UtensilsCrossed,
  ChefHat,
  ChevronRight,
  AlertTriangle,
  Loader2,
  DollarSign,
  Receipt,
  Truck,
  CheckCircle2,
  XCircle,
  Building2,
} from "lucide-react";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderResponse | null;
  onStatusChanged?: (message: string) => void;
}

export function OrderDetailModal({
  isOpen,
  onClose,
  order,
  onStatusChanged,
}: OrderDetailModalProps) {
  const [detail, setDetail] = useState<OrderDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = () => {
    if (order?.id) {
      setIsLoading(true);
      saleApi.orders
        .getById(order.id)
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
    }
  };

  useEffect(() => {
    if (isOpen && order?.id) {
      fetchDetail();
      setError(null);
    } else {
      setDetail(null);
    }
  }, [isOpen, order?.id]);

  if (!order) return null;

  const currentData = detail || order;

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
        year: "numeric",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  // Next status action title
  const getNextStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return "Xác nhận đơn";
      case OrderStatus.Confirmed:
        return "Chuyển chế biến (Bếp)";
      case OrderStatus.Preparing:
        return "Món sẵn sàng";
      case OrderStatus.Ready:
        return currentData.type === OrderType.Delivery ? "Bắt đầu giao hàng" : "Phục vụ tại bàn";
      case OrderStatus.Delivering:
      case OrderStatus.Served:
        return "Hoàn tất đơn hàng";
      default:
        return "Chuyển tiếp";
    }
  };

  // Handle Advance Status
  const handleAdvanceStatus = async () => {
    setIsActionLoading(true);
    setError(null);
    try {
      await saleApi.orders.advanceStatus(currentData.id);
      onStatusChanged?.(`Đã chuyển trạng thái đơn hàng #${currentData.orderCode} thành công!`);
      fetchDetail();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Không thể chuyển trạng thái đơn hàng.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Cancel Order
  const handleCancelOrder = async () => {
    if (!confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${currentData.orderCode}?`)) return;
    setIsActionLoading(true);
    setError(null);
    try {
      await saleApi.orders.cancel(currentData.id);
      onStatusChanged?.(`Đã hủy đơn hàng #${currentData.orderCode}.`);
      fetchDetail();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Không thể hủy đơn hàng.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Advance single item preparation
  const handleAdvanceItem = async (itemId: string) => {
    try {
      await saleApi.orders.advanceItemPreparation(currentData.id, itemId);
      fetchDetail();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Không thể cập nhật món này.");
    }
  };

  const isTerminalStatus =
    currentData.status === OrderStatus.Completed || currentData.status === OrderStatus.Cancelled;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Đơn hàng: #{currentData.orderCode}</span>
              <OrderStatusBadge status={currentData.status} />
              <OrderTypeBadge type={currentData.type} />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tạo lúc {formatDate(currentData.createdAt)}
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {isLoading && (
          <div className="flex items-center justify-center py-3 gap-2 text-indigo-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">Đang tải chi tiết món ăn và thanh toán...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Customer & Location Summary Card */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-900/60">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Khách hàng
            </span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <User className="h-3.5 w-3.5 text-indigo-600" />
              <span>{currentData.customerName || "Khách vãng lai"}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Chi nhánh / Địa điểm
            </span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <Building2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>{currentData.branchCode || "Chi nhánh chính"}</span>
              {currentData.tableNumber && (
                <span className="ml-1 rounded bg-indigo-100 px-1.5 py-0.2 text-[10px] text-indigo-700 font-bold dark:bg-indigo-950 dark:text-indigo-300">
                  Bàn {currentData.tableNumber}
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Hình thức phục vụ
            </span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <OrderTypeBadge type={currentData.type} />
            </div>
          </div>

          {currentData.deliveryAddress && (
            <div className="sm:col-span-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Địa chỉ giao hàng:
              </span>
              <p className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                {currentData.deliveryAddress}
              </p>
            </div>
          )}

          {currentData.note && (
            <div className="sm:col-span-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Ghi chú đơn hàng:
              </span>
              <p className="text-slate-600 dark:text-slate-400 italic">
                &ldquo;{currentData.note}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Order Items Table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden dark:border-slate-800">
          <div className="bg-slate-50/75 px-4 py-2.5 border-b border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <UtensilsCrossed className="h-4 w-4 text-indigo-600" />
              Danh sách món ăn ({detail?.orderItems?.length || currentData.totalItems || 0})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-900/30">
                <tr>
                  <th className="px-4 py-2.5">Tên món</th>
                  <th className="px-3 py-2.5 text-right">Đơn giá</th>
                  <th className="px-3 py-2.5 text-center">SL</th>
                  <th className="px-3 py-2.5 text-right">Thành tiền</th>
                  <th className="px-3 py-2.5 text-center">Trạng thái bếp</th>
                  <th className="px-3 py-2.5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {detail?.orderItems && detail.orderItems.length > 0 ? (
                  detail.orderItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-2.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {item.productName}
                        </span>
                        {item.note && (
                          <span className="text-[10px] text-slate-400 italic">
                            Ghi chú: {item.note}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-600 dark:text-slate-400">
                        {formatPrice(item.unitPrice)}
                      </td>
                      <td className="px-3 py-2.5 text-center font-bold text-slate-900 dark:text-white">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-indigo-600 dark:text-indigo-400">
                        {formatPrice(item.lineTotal)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <PreparationStatusBadge status={item.preparationStatus} />
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAdvanceItem(item.id)}
                          className="h-6 px-1.5 text-[10px] text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400"
                          title="Chuyển bước chế biến món"
                        >
                          Chuyển bước
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 text-center text-slate-400">
                      Đang tải danh sách món...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="max-w-xs ml-auto space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Tạm tính món ăn:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatPrice(currentData.subtotal)}
              </span>
            </div>
            {currentData.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Giảm giá:</span>
                <span>-{formatPrice(currentData.discountAmount)}</span>
              </div>
            )}
            {currentData.taxAmount > 0 && (
              <div className="flex justify-between">
                <span>Thuế VAT:</span>
                <span>+{formatPrice(currentData.taxAmount)}</span>
              </div>
            )}
            {currentData.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span>Phí giao hàng:</span>
                <span>+{formatPrice(currentData.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-extrabold text-slate-900 dark:text-white">
              <span>Tổng thanh toán:</span>
              <span className="text-base text-indigo-600 dark:text-indigo-400">
                {formatPrice(currentData.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap gap-2">
            {!isTerminalStatus && (
              <>
                <Button
                  onClick={handleAdvanceStatus}
                  isLoading={isActionLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {getNextStatusLabel(currentData.status)}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleCancelOrder}
                  disabled={isActionLoading}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Hủy đơn
                </Button>
              </>
            )}
          </div>

          <Button type="button" variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
