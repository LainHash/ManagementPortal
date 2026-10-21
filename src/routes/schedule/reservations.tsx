import React, { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { scheduleApi } from "@/features/schedule/api/schedule.api";
import { territoryApi } from "@/features/territory/api/territory.api";
import { ReservationCard } from "@/features/schedule/components/ReservationCard";
import { ReservationDetailModal } from "@/features/schedule/components/ReservationDetailModal";
import { ReservationStatusBadge } from "@/features/schedule/components/Badges";
import { CatalogAlert, type AlertState } from "@/features/catalog/components/CatalogAlert";
import { ReservationStatus } from "@/types/enums";
import type { ReservationResponse } from "@/types/schedule.types";
import type { BranchResponse } from "@/types/territory.types";
import {
  Search,
  RotateCcw,
  LayoutGrid,
  List,
  CalendarDays,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  Phone,
  Mail,
  TableProperties,
  ArrowRight,
  UserCheck,
} from "lucide-react";

export function meta() {
  return [
    { title: "Lịch đặt bàn (Reservations) | Restaurant Management Portal" },
    {
      name: "description",
      content: "Theo dõi, quản lý và điều phối lịch đặt bàn, phân bàn và đón khách toàn hệ thống.",
    },
  ];
}

export default function ReservationsPage() {
  // View mode
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Options
  const [branches, setBranches] = useState<BranchResponse[]>([]);

  // Filters
  const [keyword, setKeyword] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Data & State
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<AlertState | null>(null);

  // Detail Modal
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [viewingReservation, setViewingReservation] = useState<ReservationResponse | null>(null);

  // Load branches
  useEffect(() => {
    territoryApi.branches
      .getAll({ pageSize: 100 })
      .then((res) => {
        if (res?.data) setBranches(res.data);
      })
      .catch(() => {});
  }, []);

  // Fetch reservations
  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      let fromDate: string | undefined = undefined;
      let toDate: string | undefined = undefined;

      if (dateFilter === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        fromDate = today.toISOString();
        const endToday = new Date();
        endToday.setHours(23, 59, 59, 999);
        toDate = endToday.toISOString();
      } else if (dateFilter === "week") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        fromDate = today.toISOString();
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(23, 59, 59, 999);
        toDate = nextWeek.toISOString();
      } else if (dateFilter === "month") {
        const pastMonth = new Date();
        pastMonth.setDate(pastMonth.getDate() - 30);
        pastMonth.setHours(0, 0, 0, 0);
        fromDate = pastMonth.toISOString();
      }

      const res = await scheduleApi.reservations.getAll({
        page: currentPage,
        pageSize,
        keyword: keyword.trim() || undefined,
        branchId: selectedBranch || undefined,
        status: (selectedStatus as ReservationStatus) || undefined,
        fromDate,
        toDate,
      });

      if (res?.data) {
        setReservations(res.data);
        setTotalItems(res.totalItems || res.data.length);
        setTotalPages(
          res.totalPages ||
            Math.ceil((res.totalItems || res.data.length) / pageSize) ||
            1
        );
      } else {
        setReservations([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      setAlert({
        type: "error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải danh sách lịch đặt bàn.",
      });
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, keyword, selectedBranch, selectedStatus, dateFilter]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Handle open detail
  const handleOpenDetail = (reservation: ReservationResponse) => {
    setViewingReservation(reservation);
    setIsDetailOpen(true);
  };

  // Quick update status
  const handleQuickStatusChange = async (
    reservation: ReservationResponse,
    targetStatus: ReservationStatus,
    label: string
  ) => {
    try {
      await scheduleApi.reservations.updateStatus(reservation.id, {
        status: targetStatus,
      });
      setAlert({
        type: "success",
        message: `Đã chuyển lịch #${reservation.reservationCode} sang "${label}" thành công!`,
      });
      fetchReservations();
    } catch (err: any) {
      setAlert({
        type: "error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Không thể cập nhật trạng thái.",
      });
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setKeyword("");
    setSelectedBranch("");
    setSelectedStatus("");
    setDateFilter("");
    setCurrentPage(1);
  };

  // Format date time helper
  const formatDateTime = (
    fromStr?: string | null,
    toStr?: string | null
  ): { timeRange: string; date: string } => {
    if (!fromStr) return { timeRange: "-", date: "" };
    try {
      const fromDate = new Date(fromStr);
      const timeFormatter = new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const startTime = timeFormatter.format(fromDate);
      const datePart = dateFormatter.format(fromDate);

      if (toStr) {
        const toDate = new Date(toStr);
        const endTime = timeFormatter.format(toDate);
        return {
          timeRange: `${startTime} - ${endTime}`,
          date: datePart,
        };
      }
      return {
        timeRange: startTime,
        date: datePart,
      };
    } catch {
      return { timeRange: fromStr, date: "" };
    }
  };

  // Metrics
  const pendingCount = reservations.filter(
    (r) => r.status === ReservationStatus.Pending
  ).length;
  const confirmedCount = reservations.filter(
    (r) => r.status === ReservationStatus.Confirmed
  ).length;
  const seatedCount = reservations.filter(
    (r) => r.status === ReservationStatus.Seated
  ).length;

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Lịch đặt bàn
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Quản lý và điều phối lịch hẹn, phân bổ bàn và đón khách toàn hệ thống
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReservations}
              disabled={isLoading}
              className="gap-1.5 text-xs text-slate-600 dark:text-slate-300"
            >
              <RotateCcw
                className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
              Tải lại
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  viewMode === "table"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Bảng</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  viewMode === "grid"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Lưới</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          <Card className="flex items-center gap-3.5 p-4 border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                Tổng lịch hẹn
              </p>
              <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {totalItems}
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-3.5 p-4 border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                Chờ xác nhận
              </p>
              <p className="text-xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                {pendingCount}
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-3.5 p-4 border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                Đã xác nhận
              </p>
              <p className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {confirmedCount}
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-3.5 p-4 border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <Users className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                Đã vào bàn
              </p>
              <p className="text-xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
                {seatedCount}
              </p>
            </div>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Tìm mã đặt bàn, tên khách, số điện thoại..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 text-xs"
              />
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Branch filter */}
              <div className="w-40 sm:w-44">
                <select
                  value={selectedBranch}
                  onChange={(e) => {
                    setSelectedBranch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="">Tất cả chi nhánh</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.branchCode} - {b.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div className="w-36 sm:w-40">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value={ReservationStatus.Pending}>Chờ xác nhận</option>
                  <option value={ReservationStatus.Confirmed}>Đã xác nhận</option>
                  <option value={ReservationStatus.Seated}>Đã vào bàn</option>
                  <option value={ReservationStatus.Completed}>Hoàn tất</option>
                  <option value={ReservationStatus.Cancelled}>Đã hủy</option>
                  <option value={ReservationStatus.NoShow}>Vắng mặt (No-show)</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="w-32 sm:w-36">
                <select
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="">Tất cả thời gian</option>
                  <option value="today">Hôm nay</option>
                  <option value="week">7 ngày tới</option>
                  <option value="month">30 ngày qua</option>
                </select>
              </div>

              {/* Reset button */}
              {(keyword || selectedBranch || selectedStatus || dateFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="gap-1 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                >
                  <RotateCcw className="h-3 w-3" />
                  Xóa lọc
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Đang tải danh sách lịch đặt bàn...
            </p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/30">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Không tìm thấy lịch đặt bàn nào
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh các bộ lọc trạng thái và thời gian.
              </p>
            </div>
            {(keyword || selectedBranch || selectedStatus || dateFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="mt-2 text-xs"
              >
                Xóa tất cả bộ lọc
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {reservations.map((item) => (
              <ReservationCard
                key={item.id}
                reservation={item}
                onViewDetail={handleOpenDetail}
                onQuickStatusChange={handleQuickStatusChange}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] uppercase tracking-wider font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Mã đặt bàn
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Khách hàng
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Chi nhánh & Bàn
                    </th>
                    <th scope="col" className="px-4 py-3 text-center">
                      Số khách
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Thời gian hẹn
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Trạng thái
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {reservations.map((r) => {
                    const dt = formatDateTime(r.reservedFrom, r.reservedTo);
                    return (
                      <tr
                        key={r.id}
                        className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                      >
                        {/* Reservation Code */}
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(r)}
                            className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            #{r.reservationCode}
                          </button>
                        </td>

                        {/* Customer Info */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              {r.contactName}
                            </span>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-slate-400" />
                                {r.contactPhone}
                              </span>
                              {r.contactEmail && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-slate-400" />
                                  {r.contactEmail}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Branch & Assigned Tables */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                              <Building2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span>{r.branchCode || "Chi nhánh"}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                              <TableProperties className="h-3 w-3 text-slate-400 shrink-0" />
                              {r.tableNumbers && r.tableNumbers.length > 0 ? (
                                <span className="rounded bg-indigo-50 px-1.5 py-0.2 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                  Bàn {r.tableNumbers.join(", ")}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">
                                  Chưa xếp bàn
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Party Size */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <Users className="h-3 w-3 text-indigo-500" />
                            {r.partySize}
                          </span>
                        </td>

                        {/* Dining Time */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                              <Clock className="h-3 w-3 text-indigo-500" />
                              {dt.timeRange}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {dt.date}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <ReservationStatusBadge status={r.status} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {r.status === ReservationStatus.Pending && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleQuickStatusChange(
                                    r,
                                    ReservationStatus.Confirmed,
                                    "Đã xác nhận"
                                  )
                                }
                                className="h-7 px-2 text-[11px] bg-teal-600 hover:bg-teal-700 text-white font-bold"
                              >
                                Xác nhận
                              </Button>
                            )}

                            {r.status === ReservationStatus.Confirmed && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleQuickStatusChange(
                                    r,
                                    ReservationStatus.Seated,
                                    "Đã nhận bàn"
                                  )
                                }
                                className="h-7 px-2 text-[11px] bg-teal-600 hover:bg-teal-700 text-white font-bold"
                              >
                                Nhận bàn
                              </Button>
                            )}

                            {r.status === ReservationStatus.Seated && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleQuickStatusChange(
                                    r,
                                    ReservationStatus.Completed,
                                    "Hoàn tất"
                                  )
                                }
                                className="h-7 px-2 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                              >
                                Trả bàn
                              </Button>
                            )}

                            {r.contactPhone && (
                              <a
                                href={`tel:${r.contactPhone}`}
                                title={`Gọi cho ${r.contactName}`}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-teal-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-teal-400"
                              >
                                <Phone className="h-3.5 w-3.5" />
                              </a>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDetail(r)}
                              className="h-7 gap-1 px-2 text-xs text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Chi tiết</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Hiển thị{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                {(currentPage - 1) * pageSize + 1}
              </strong>{" "}
              -{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                {Math.min(currentPage * pageSize, totalItems)}
              </strong>{" "}
              trên tổng số{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                {totalItems}
              </strong>{" "}
              lịch hẹn
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage <= 1 || isLoading}
                className="h-8 gap-1 px-2.5 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Trước
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber = currentPage;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`h-8 w-8 rounded-md text-xs font-medium transition-colors ${
                      currentPage === pageNumber
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages || isLoading}
                className="h-8 gap-1 px-2.5 text-xs"
              >
                Sau
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        <ReservationDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setViewingReservation(null);
          }}
          reservation={viewingReservation}
          onStatusChanged={(msg) => {
            setAlert({ type: "success", message: msg });
            fetchReservations();
          }}
        />

        {/* Toast Alert */}
        <CatalogAlert alert={alert} onClose={() => setAlert(null)} />
      </div>
    </AdminLayout>
  );
}
