import React, { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { saleApi } from "@/features/sale/api/sale.api";
import { territoryApi } from "@/features/territory/api/territory.api";
import { OrderCard } from "@/features/sale/components/OrderCard";
import { OrderDetailModal } from "@/features/sale/components/OrderDetailModal";
import { OrderStatusBadge, OrderTypeBadge } from "@/features/sale/components/Badges";
import { CatalogAlert, type AlertState } from "@/features/catalog/components/CatalogAlert";
import { OrderStatus, OrderType } from "@/types/enums";
import type { OrderResponse } from "@/types/sale.types";
import type { BranchResponse } from "@/types/territory.types";
import {
  Search,
  RotateCcw,
  LayoutGrid,
  List,
  ShoppingBag,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  DollarSign,
  ChefHat,
  Truck,
  Receipt,
  User,
  ArrowRight,
} from "lucide-react";

export function meta() {
  return [
    { title: "Quản lý Đơn hàng (Orders) | Restaurant Management Portal" },
    {
      name: "description",
      content: "Theo dõi, quản lý tiến trình chế biến và thanh toán đơn hàng toàn hệ thống.",
    },
  ];
}

export default function OrdersPage() {
  // View mode
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Options
  const [branches, setBranches] = useState<BranchResponse[]>([]);

  // Filters
  const [keyword, setKeyword] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Data & State
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<AlertState | null>(null);

  // Detail Modal
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [viewingOrder, setViewingOrder] = useState<OrderResponse | null>(null);

  // Load branches
  useEffect(() => {
    territoryApi.branches
      .getAll({ pageSize: 100 })
      .then((res) => {
        if (res?.data) setBranches(res.data);
      })
      .catch(() => {});
  }, []);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      let fromDate: string | undefined = undefined;
      let toDate: string | undefined = undefined;

      if (dateFilter === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        fromDate = today.toISOString();
      } else if (dateFilter === "week") {
        const pastWeek = new Date();
        pastWeek.setDate(pastWeek.getDate() - 7);
        fromDate = pastWeek.toISOString();
      } else if (dateFilter === "month") {
        const pastMonth = new Date();
        pastMonth.setDate(pastMonth.getDate() - 30);
        fromDate = pastMonth.toISOString();
      }

      const res = await saleApi.orders.getAll({
        page: currentPage,
        pageSize,
        keyword: keyword.trim() || undefined,
        branchId: selectedBranch || undefined,
        status: (selectedStatus as OrderStatus) || undefined,
        type: (selectedType as OrderType) || undefined,
        fromDate,
        toDate,
      });

      if (res?.data) {
        setOrders(res.data);
        setTotalItems(res.totalItems || res.data.length);
        setTotalPages(res.totalPages || Math.ceil((res.totalItems || res.data.length) / pageSize) || 1);
      } else {
        setOrders([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Không thể tải danh sách đơn hàng.",
      });
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, keyword, selectedBranch, selectedStatus, selectedType, dateFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleResetFilters = () => {
    setKeyword("");
    setSelectedBranch("");
    setSelectedStatus("");
    setSelectedType("");
    setDateFilter("");
    setCurrentPage(1);
  };

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

  // Stats calculation
  const pendingOrConfirmedCount = orders.filter(
    (o) => o.status === OrderStatus.Pending || o.status === OrderStatus.Confirmed
  ).length;

  const inKitchenOrDeliveringCount = orders.filter(
    (o) =>
      o.status === OrderStatus.Preparing ||
      o.status === OrderStatus.Ready ||
      o.status === OrderStatus.Delivering
  ).length;

  const completedRevenue = orders
    .filter((o) => o.status === OrderStatus.Completed)
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <ShoppingBag className="h-4 w-4" />
              <span>Bán hàng & Phục vụ (Sale)</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Quản Lý Đơn Hàng
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Theo dõi luồng phục vụ từ tiếp nhận món, chế biến bếp đến bàn ăn và giao hàng
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrders}
              disabled={isLoading}
              className="gap-1.5 text-xs"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="flex flex-col justify-between p-4 bg-gradient-to-br from-indigo-500/10 via-white to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 border-indigo-200/60 dark:border-indigo-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Tổng đơn hàng
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {totalItems}
              </span>
              <span className="text-xs text-slate-400">đơn</span>
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-4 bg-gradient-to-br from-amber-500/10 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 border-amber-200/60 dark:border-amber-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Chờ xác nhận & chuẩn bị
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                {pendingOrConfirmedCount}
              </span>
              <span className="text-xs text-slate-400">đơn đang chờ</span>
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-4 bg-gradient-to-br from-orange-500/10 via-white to-white dark:from-orange-950/20 dark:via-slate-900 dark:to-slate-900 border-orange-200/60 dark:border-orange-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Bếp nấu & Đang giao
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                <ChefHat className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">
                {inKitchenOrDeliveringCount}
              </span>
              <span className="text-xs text-slate-400">đang phục vụ</span>
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-4 bg-gradient-to-br from-emerald-500/10 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 border-emerald-200/60 dark:border-emerald-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Doanh thu đơn hoàn tất
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
                {formatPrice(completedRevenue)}
              </span>
            </div>
          </Card>
        </div>

        {/* Filter Toolbar Card */}
        <Card className="p-4 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setCurrentPage(1);
                    fetchOrders();
                  }
                }}
                placeholder="Tìm kiếm theo mã đơn (#ORD), tên khách hàng, số bàn..."
                className="pl-9 pr-4 text-sm"
              />
            </div>

            {/* Branch selector */}
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-600 shrink-0" />
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="">Tất cả chi nhánh</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.branchCode} - {b.address}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-1 dark:border-slate-800 self-end lg:self-auto">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className={
                  viewMode === "table"
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 h-8 w-8 p-0"
                    : "h-8 w-8 p-0 text-slate-500"
                }
                title="Dạng bảng chi tiết"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={
                  viewMode === "grid"
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 h-8 w-8 p-0"
                    : "h-8 w-8 p-0 text-slate-500"
                }
                title="Dạng lưới thẻ"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Secondary Filters */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="flex items-center gap-1 font-semibold text-slate-500">
              <Filter className="h-3.5 w-3.5" />
              Bộ lọc:
            </span>

            {/* Order Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 font-medium"
            >
              <option value="">Tất cả trạng thái đơn</option>
              <option value={OrderStatus.Pending}>Chờ xác nhận</option>
              <option value={OrderStatus.Confirmed}>Đã xác nhận</option>
              <option value={OrderStatus.Preparing}>Đang chế biến</option>
              <option value={OrderStatus.Ready}>Món đã sẵn sàng</option>
              <option value={OrderStatus.Served}>Đã phục vụ tại bàn</option>
              <option value={OrderStatus.Delivering}>Đang giao hàng</option>
              <option value={OrderStatus.Completed}>Hoàn tất</option>
              <option value={OrderStatus.Cancelled}>Đã hủy</option>
            </select>

            {/* Order Type filter */}
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 font-medium"
            >
              <option value="">Tất cả loại hình phục vụ</option>
              <option value={OrderType.DineIn}>Ăn tại bàn (Dine-in)</option>
              <option value={OrderType.TakeAway}>Mang về (Take-away)</option>
              <option value={OrderType.Delivery}>Giao hàng (Delivery)</option>
            </select>

            {/* Date filter */}
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 font-medium"
            >
              <option value="">Mọi thời điểm</option>
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
            </select>

            {/* Reset Filters button */}
            {(keyword || selectedBranch || selectedStatus || selectedType || dateFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-7 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </Card>

        {/* Content Section: Loading vs Empty vs Grid/Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ShoppingBag className="h-10 w-10 text-indigo-500 animate-bounce" />
            <span className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
              Đang tải danh sách đơn hàng...
            </span>
          </div>
        ) : orders.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 mb-4">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Không tìm thấy đơn hàng nào
            </h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm dark:text-slate-400">
              {keyword || selectedBranch || selectedStatus || selectedType || dateFilter
                ? "Không có đơn hàng nào khớp với bộ lọc đã chọn. Hãy thử điều chỉnh hoặc xóa bộ lọc."
                : "Hệ thống hiện chưa có đơn hàng nào phát sinh."}
            </p>
            {(keyword || selectedBranch || selectedStatus || selectedType || dateFilter) && (
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="mt-4 gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Xóa bộ lọc
              </Button>
            )}
          </Card>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {orders.map((item) => (
              <OrderCard
                key={item.id}
                order={item}
                onViewDetail={(ord) => {
                  setViewingOrder(ord);
                  setIsDetailOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="px-4 py-3.5">
                      Mã đơn
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Khách hàng
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Chi nhánh & Bàn
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Loại đơn
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-center">
                      Số món
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right">
                      Tổng tiền
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Trạng thái
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Thời gian tạo
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {orders.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/40"
                    >
                      {/* Order Code */}
                      <td className="px-4 py-3">
                        <span
                          onClick={() => {
                            setViewingOrder(item);
                            setIsDetailOpen(true);
                          }}
                          className="font-extrabold text-indigo-600 hover:text-indigo-800 cursor-pointer dark:text-indigo-400 block"
                        >
                          #{item.orderCode}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {item.customerName || "Khách vãng lai"}
                      </td>

                      {/* Branch & Table */}
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3 w-3 text-emerald-600" />
                          <span>{item.branchCode || "Chi nhánh"}</span>
                          {item.tableNumber && (
                            <span className="rounded bg-indigo-50 px-1.5 py-0.2 text-[10px] text-indigo-700 font-bold dark:bg-indigo-950 dark:text-indigo-300">
                              Bàn {item.tableNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Order Type */}
                      <td className="px-4 py-3">
                        <OrderTypeBadge type={item.type} />
                      </td>

                      {/* Item Count */}
                      <td className="px-4 py-3 text-center text-xs font-bold text-slate-700 dark:text-slate-300">
                        {item.totalItems}
                      </td>

                      {/* Total Amount */}
                      <td className="px-4 py-3 text-right text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                        {formatPrice(item.totalAmount)}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={item.status} />
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setViewingOrder(item);
                            setIsDetailOpen(true);
                          }}
                          className="h-8 px-2.5 text-xs text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row pt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Hiển thị{" "}
              <strong>
                {Math.min((currentPage - 1) * pageSize + 1, totalItems)} -{" "}
                {Math.min(currentPage * pageSize, totalItems)}
              </strong>{" "}
              trong tổng số <strong>{totalItems}</strong> đơn hàng
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="h-4 w-4" />
                Trang trước
              </Button>

              <span className="text-xs font-semibold text-slate-700 px-2 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="gap-1 text-xs"
              >
                Trang sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <OrderDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setViewingOrder(null);
        }}
        order={viewingOrder}
        onStatusChanged={(msg) => {
          setAlert({ type: "success", message: msg });
          fetchOrders();
        }}
      />

      {/* Toast Alert */}
      <CatalogAlert alert={alert} onClose={() => setAlert(null)} />
    </AdminLayout>
  );
}
