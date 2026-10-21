import React, { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { communicationApi } from "@/features/communication/api/communication.api";
import { ContactMessageCard } from "@/features/communication/components/ContactMessageCard";
import { ContactMessageDetailModal } from "@/features/communication/components/ContactMessageDetailModal";
import {
  ContactStatusBadge,
  ContactEmailStatusBadge,
} from "@/features/communication/components/Badges";
import { CatalogAlert, type AlertState } from "@/features/catalog/components/CatalogAlert";
import { ContactStatus, ContactEmailStatus } from "@/types/enums";
import type { ContactMessageResponse } from "@/types/communication.types";
import {
  Search,
  RotateCcw,
  LayoutGrid,
  List,
  MessageSquare,
  Filter,
  Eye,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Inbox,
  Send,
  Calendar,
} from "lucide-react";

export function meta() {
  return [
    { title: "Tin nhắn Liên hệ Khách hàng | Restaurant Management Portal" },
    {
      name: "description",
      content: "Quản lý và phản hồi danh sách tin nhắn, câu hỏi và yêu cầu hỗ trợ từ khách hàng.",
    },
  ];
}

export default function ContactMessagesPage() {
  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  // Filters
  const [keyword, setKeyword] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedEmailStatus, setSelectedEmailStatus] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Data & State
  const [messages, setMessages] = useState<ContactMessageResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<AlertState | null>(null);

  // Detail Modal
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [viewingMessage, setViewingMessage] = useState<ContactMessageResponse | null>(null);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
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

      const res = await communicationApi.contactMessages.getAll({
        page: currentPage,
        pageSize,
        keyword: keyword.trim() || undefined,
        status: (selectedStatus as ContactStatus) || undefined,
        emailStatus: (selectedEmailStatus as ContactEmailStatus) || undefined,
        fromDate,
        toDate,
      });

      if (res?.data) {
        setMessages(res.data);
        setTotalItems(res.totalItems || res.data.length);
        setTotalPages(res.totalPages || Math.ceil((res.totalItems || res.data.length) / pageSize) || 1);
      } else {
        setMessages([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      setAlert({
        type: "error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải danh sách tin nhắn liên hệ.",
      });
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, keyword, selectedStatus, selectedEmailStatus, dateFilter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleResetFilters = () => {
    setKeyword("");
    setSelectedStatus("");
    setSelectedEmailStatus("");
    setDateFilter("");
    setCurrentPage(1);
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
  const newCount = messages.filter((m) => m.status === ContactStatus.New).length;
  const inProgressCount = messages.filter((m) => m.status === ContactStatus.InProgress).length;
  const resolvedCount = messages.filter((m) => m.status === ContactStatus.Resolved).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <MessageSquare className="h-4 w-4" />
              <span>Trung tâm liên hệ & hỗ trợ</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Tin Nhắn Liên Hệ Khách Hàng
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Theo dõi, xử lý và phản hồi các yêu cầu liên hệ, góp ý và đặt câu hỏi từ khách hàng
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMessages}
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
          <Card className="flex flex-col justify-between p-4 bg-gradient-to-br from-blue-500/10 via-white to-white dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900 border-blue-200/60 dark:border-blue-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Tổng số tin nhắn
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <Inbox className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {totalItems}
              </span>
              <span className="text-xs text-slate-400">tin nhắn</span>
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-4 bg-gradient-to-br from-sky-500/10 via-white to-white dark:from-sky-950/20 dark:via-slate-900 dark:to-slate-900 border-sky-200/60 dark:border-sky-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Mới tiếp nhận
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">
                {newCount}
              </span>
              <span className="text-xs text-slate-400">cần phản hồi</span>
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-4 bg-gradient-to-br from-amber-500/10 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 border-amber-200/60 dark:border-amber-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Đang xử lý
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                {inProgressCount}
              </span>
              <span className="text-xs text-slate-400">đang theo dõi</span>
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-4 bg-gradient-to-br from-emerald-500/10 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 border-emerald-200/60 dark:border-emerald-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Đã giải quyết
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {resolvedCount}
              </span>
              <span className="text-xs text-slate-400">hoàn tất</span>
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
                    fetchMessages();
                  }
                }}
                placeholder="Tìm theo họ tên khách, email, SĐT hoặc tiêu đề tin nhắn..."
                className="pl-9 pr-4 text-sm"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-1 dark:border-slate-800 self-end lg:self-auto">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className={
                  viewMode === "table"
                    ? "bg-blue-600 text-white hover:bg-blue-700 h-8 w-8 p-0"
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
                    ? "bg-blue-600 text-white hover:bg-blue-700 h-8 w-8 p-0"
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

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 font-medium"
            >
              <option value="">Tất cả trạng thái xử lý</option>
              <option value={ContactStatus.New}>Mới tiếp nhận</option>
              <option value={ContactStatus.InProgress}>Đang xử lý</option>
              <option value={ContactStatus.Resolved}>Đã giải quyết</option>
              <option value={ContactStatus.Closed}>Đã đóng</option>
            </select>

            {/* Email Status filter */}
            <select
              value={selectedEmailStatus}
              onChange={(e) => {
                setSelectedEmailStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 font-medium"
            >
              <option value="">Tất cả trạng thái Email</option>
              <option value={ContactEmailStatus.Sent}>Đã gửi email</option>
              <option value={ContactEmailStatus.Pending}>Đang chờ gửi</option>
              <option value={ContactEmailStatus.Failed}>Gửi lỗi</option>
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
              <option value="">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày gần nhất</option>
              <option value="month">30 ngày gần nhất</option>
            </select>

            {/* Reset Filters button */}
            {(keyword || selectedStatus || selectedEmailStatus || dateFilter) && (
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
            <MessageSquare className="h-10 w-10 text-blue-500 animate-bounce" />
            <span className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
              Đang tải danh sách tin nhắn liên hệ...
            </span>
          </div>
        ) : messages.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 mb-4">
              <Inbox className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Không có tin nhắn liên hệ nào
            </h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm dark:text-slate-400">
              {keyword || selectedStatus || selectedEmailStatus || dateFilter
                ? "Không tìm thấy tin nhắn nào khớp với bộ lọc. Hãy thử điều chỉnh hoặc xóa bộ lọc."
                : "Hộp thư liên hệ hiện đang trống. Mọi phản hồi từ khách hàng sẽ xuất hiện tại đây."}
            </p>
            {(keyword || selectedStatus || selectedEmailStatus || dateFilter) && (
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
            {messages.map((item) => (
              <ContactMessageCard
                key={item.id}
                message={item}
                onViewDetail={(msg) => {
                  setViewingMessage(msg);
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
                      Khách hàng
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Thông tin liên hệ
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Tiêu đề & Nội dung
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Trạng thái xử lý
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Email thông báo
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Thời gian gửi
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {messages.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/40"
                    >
                      {/* Customer Info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-bold text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {item.fullName
                              ? item.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(-2)
                                  .join("")
                                  .toUpperCase()
                              : "KH"}
                          </div>
                          <div>
                            <span
                              onClick={() => {
                                setViewingMessage(item);
                                setIsDetailOpen(true);
                              }}
                              className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer dark:text-white dark:hover:text-blue-400 block"
                            >
                              {item.fullName}
                            </span>
                            {item.customerId && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                Thành viên
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact details (Email, Phone) */}
                      <td className="px-4 py-3 text-xs">
                        <div className="space-y-0.5">
                          <a
                            href={`mailto:${item.email}`}
                            className="flex items-center gap-1 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                            title={item.email}
                          >
                            <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{item.email}</span>
                          </a>
                          {item.phoneNumber && (
                            <a
                              href={`tel:${item.phoneNumber}`}
                              className="flex items-center gap-1 text-slate-500 hover:text-emerald-600 dark:text-slate-400"
                            >
                              <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                              <span>{item.phoneNumber}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Subject & Preview */}
                      <td className="px-4 py-3 max-w-xs">
                        <p
                          onClick={() => {
                            setViewingMessage(item);
                            setIsDetailOpen(true);
                          }}
                          className="font-semibold text-xs text-slate-900 hover:text-blue-600 cursor-pointer truncate dark:text-white dark:hover:text-blue-400"
                          title={item.subject}
                        >
                          {item.subject}
                        </p>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5" title={item.message}>
                          {item.message}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <ContactStatusBadge status={item.status} />
                      </td>

                      {/* Email Status */}
                      <td className="px-4 py-3">
                        <ContactEmailStatusBadge status={item.emailStatus} />
                      </td>

                      {/* Time */}
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setViewingMessage(item);
                              setIsDetailOpen(true);
                            }}
                            className="h-8 px-2.5 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/50"
                            title="Xem chi tiết tin nhắn"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Xem
                          </Button>
                          <a
                            href={`mailto:${item.email}?subject=${encodeURIComponent(
                              `[Phản hồi từ Nhà hàng] ${item.subject}`
                            )}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                            title="Gửi email phản hồi"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </a>
                        </div>
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
              trong tổng số <strong>{totalItems}</strong> tin nhắn
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
      <ContactMessageDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setViewingMessage(null);
        }}
        message={viewingMessage}
      />

      {/* Toast Alert */}
      <CatalogAlert alert={alert} onClose={() => setAlert(null)} />
    </AdminLayout>
  );
}
