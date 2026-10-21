import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import {
  UtensilsCrossed,
  Layers,
  MapPin,
  Building2,
  Users,
  CalendarCheck,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Server,
  Zap,
  Store,
  ChevronRight,
  CheckCircle2,
  Clock,
  Phone,
  RotateCcw,
  X,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { homeApi, type HomeOverviewData } from "@/features/home/api/home.api";
import { AdminLayout } from "@/layouts/AdminLayout";
import { APP_CONFIG, STORAGE_KEYS } from "@/constants/app.constants";
import type { BranchResponse } from "@/types/territory.types";

export function meta() {
  return [
    { title: "Tổng quan hệ thống | Restaurant Management Portal" },
    { name: "description", content: "Cổng thông tin quản trị chuỗi nhà hàng toàn diện" },
  ];
}

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<HomeOverviewData | null>(null);

  // Initialize selected branch ID from localstorage if present
  const [selectedBranchId, setSelectedBranchId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_BRANCH_ID) || "";
    }
    return "";
  });

  const loadData = useCallback(async (branchId?: string) => {
    setLoading(true);
    try {
      const res = await homeApi.getHomeOverview({ branchId: branchId || undefined });
      if (res.isSucceed && res.data) {
        setData(res.data);

        // If a branch was selected, sync its code to localStorage
        if (branchId && res.data.branches) {
          const matched = res.data.branches.find((b) => b.id === branchId);
          if (matched) {
            localStorage.setItem(STORAGE_KEYS.SELECTED_BRANCH_CODE, matched.branchCode);
          }
        }
      }
    } catch (err) {
      // Fallback or keep null
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(selectedBranchId);
  }, [loadData, selectedBranchId]);

  // Handle branch change in dropdown
  const handleBranchChange = (newBranchId: string) => {
    setSelectedBranchId(newBranchId);
    if (newBranchId) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_BRANCH_ID, newBranchId);
      const chosen = data?.branches?.find((b) => b.id === newBranchId);
      if (chosen) {
        localStorage.setItem(STORAGE_KEYS.SELECTED_BRANCH_CODE, chosen.branchCode);
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_BRANCH_ID);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_BRANCH_CODE);
    }
  };

  const handleClearBranch = () => {
    handleBranchChange("");
  };

  const branches = data?.branches || [];
  const activeBranch: BranchResponse | undefined = branches.find((b) => b.id === selectedBranchId);

  // Stats calculation
  const productCount = data?.products?.length ?? 48;
  const categoryCount = data?.productCategories?.length ?? 12;
  const brandCount = data?.brands?.length ?? 6;
  const branchCount = branches.length || 4;
  const recommendedCount = data?.recommendedProduct?.length ?? 0;

  const featureModules = [
    {
      title: "Thực đơn & Món ăn",
      description: "Quản lý danh mục món, giá bán, công thức định lượng và tồn kho theo thời gian thực.",
      icon: UtensilsCrossed,
      color: "from-blue-500 to-indigo-600",
      badge: "Catalog",
      link: selectedBranchId ? `/products?branchId=${selectedBranchId}` : "/products",
    },
    {
      title: "Vận hành Bàn & Khu vực",
      description: "Sơ đồ bàn thông minh, phân chia khu vực (VIP, Ngoài trời, Phòng lạnh) linh hoạt.",
      icon: MapPin,
      color: "from-emerald-500 to-teal-600",
      badge: "Territory",
      link: selectedBranchId ? `/tables?branchId=${selectedBranchId}` : "/tables",
    },
    {
      title: "Lịch Đặt bàn & Khách hàng",
      description: "Theo dõi tình trạng giữ chỗ, quản lý thời gian khách đến và lưu vết lịch sử.",
      icon: CalendarCheck,
      color: "from-amber-500 to-orange-600",
      badge: "Schedule",
      link: "/reservations",
    },
    {
      title: "Quản lý Chi nhánh",
      description: "Đồng bộ đa chi nhánh, phân quyền nhân sự theo cơ sở và giám sát kinh doanh.",
      icon: Building2,
      color: "from-purple-500 to-pink-600",
      badge: "Branches",
      link: "/branches",
    },
    {
      title: "Kho Nguyên liệu & Định lượng",
      description: "Kiểm soát số dư tồn kho nguyên vật liệu, cảnh báo hao hụt và công thức BOM.",
      icon: Layers,
      color: "from-teal-500 to-emerald-600",
      badge: "Inventory",
      link: selectedBranchId ? `/ingredients?branchId=${selectedBranchId}` : "/ingredients",
    },
    {
      title: "Tài khoản & Phân quyền",
      description: "Phân quyền chi tiết (RBAC) cho SuperAdmin, Quản lý chi nhánh, Thu ngân, Bếp.",
      icon: ShieldCheck,
      color: "from-rose-500 to-red-600",
      badge: "Security",
      link: "/users",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 pb-10">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl md:p-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 right-40 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-indigo-200 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Phiên bản v{APP_CONFIG.VERSION} — Kết nối RESTful API ASP.NET Core</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl">
              Hệ Thống Quản Trị Chuỗi Nhà Hàng
            </h1>

            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Chào mừng bạn đến với portal quản lý tập trung. Nền tảng kết nối trực tiếp với backend 
              <span className="font-semibold text-indigo-300"> RestaurantService</span>, hỗ trợ điều hành toàn bộ quy trình từ thực đơn, bàn ăn, chi nhánh cho đến nhân sự và báo cáo.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isAuthenticated && user ? (
                <Link to="/profile">
                  <Button size="lg" className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold gap-2 shadow-lg shadow-indigo-500/30">
                    <span>Hồ sơ cá nhân ({user.userName})</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button size="lg" className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold gap-2 shadow-lg shadow-indigo-500/30">
                    <span>Đăng nhập hệ thống</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}

              <a
                href="#features"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-white/20 bg-white/5 px-6 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/10 transition-colors"
              >
                Khám phá phân hệ
              </a>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* Branch Selector Bar (Lưu mã chi nhánh vào localStorage) */}
        {/* ==================================================================== */}
        <Card className="border border-indigo-100/80 bg-gradient-to-br from-indigo-50/40 via-white to-white p-5 shadow-xs dark:border-indigo-950/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Title & icon */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Chi nhánh làm việc (Active Branch)
                  </h3>
                  {activeBranch && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Mã: {activeBranch.branchCode}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Chọn chi nhánh cơ sở để đồng bộ giá, tồn kho và danh sách món ăn đề xuất (lưu tự động vào LocalStorage).
                </p>
              </div>
            </div>

            {/* Dropdown Selector */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-600 dark:text-indigo-400 pointer-events-none" />
                <select
                  value={selectedBranchId}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  className="w-full rounded-xl border border-indigo-200/80 bg-white pl-9 pr-8 py-2.5 text-sm font-medium text-slate-900 shadow-xs transition-all focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">-- Tất cả chi nhánh (Xem toàn hệ thống) --</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      [Mã: {b.branchCode}] {b.address ? `${b.address} (${b.city})` : b.city}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBranchId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearBranch}
                  title="Xóa lựa chọn chi nhánh"
                  className="h-10 text-xs text-slate-500 hover:text-red-600 border-slate-200 hover:border-red-200 dark:border-slate-800"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  <span>Toàn chuỗi</span>
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadData(selectedBranchId)}
                title="Làm mới dữ liệu trang chủ"
                className="h-10 text-xs border-indigo-200/80 hover:bg-indigo-50 dark:border-slate-800"
              >
                <RotateCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline ml-1">Làm mới</span>
              </Button>
            </div>
          </div>

          {/* Active branch detail summary strip */}
          {activeBranch && (
            <div className="mt-4 pt-4 border-t border-indigo-100/60 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">
                  {activeBranch.address ? `${activeBranch.address}, ${activeBranch.city}` : activeBranch.city}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Phone className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>{activeBranch.phoneNumber || "Chưa cập nhật SĐT"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>
                  {activeBranch.openTime && activeBranch.closeTime
                    ? `${activeBranch.openTime} - ${activeBranch.closeTime}`
                    : "Giờ mở cửa: Cả ngày"}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Link
                  to={`/tables?branchId=${activeBranch.id}`}
                  className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-xs"
                >
                  <span>Sơ đồ bàn cơ sở</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {activeBranch ? `Món tại ${activeBranch.branchCode}` : "Món ăn trên hệ thống"}
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {loading ? "..." : productCount}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <UtensilsCrossed className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-3 flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> 
                {activeBranch ? "Giá & kho tính theo cơ sở" : "Đồng bộ từ Catalog Service"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Danh mục món
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {loading ? "..." : categoryCount}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <Layers className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-3 flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                Phân loại đồ ăn, đồ uống
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {activeBranch ? "Món đề xuất tại cơ sở" : "Chi nhánh hoạt động"}
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {loading ? "..." : activeBranch ? recommendedCount : branchCount}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  {activeBranch ? <Sparkles className="h-6 w-6" /> : <Store className="h-6 w-6" />}
                </div>
              </div>
              <p className="mt-3 flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {activeBranch ? "Thuộc tính IsRecommended" : "Khu vực Territory"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Thương hiệu liên kết
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {loading ? "..." : brandCount}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  <Zap className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-3 flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                Đối tác cung ứng
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ==================================================================== */}
        {/* Recommended Products at Selected Branch (Nếu có chọn chi nhánh) */}
        {/* ==================================================================== */}
        {selectedBranchId && activeBranch && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/20" />
                  <span>
                    Món Ăn Đề Xuất Tại Cơ Sở ({activeBranch.city} - {activeBranch.branchCode})
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Danh sách món ăn được gắn cờ Đề xuất (IsRecommended) áp dụng riêng tại chi nhánh này
                </p>
              </div>
              <Link to={`/products?branchId=${selectedBranchId}`}>
                <Button variant="outline" size="sm" className="text-xs gap-1.5 border-indigo-200 hover:bg-indigo-50 dark:border-slate-800">
                  <span>Xem toàn bộ thực đơn cơ sở</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {data?.recommendedProduct && data.recommendedProduct.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.recommendedProduct.map((prod) => (
                  <Card
                    key={prod.id}
                    className="group overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-800 transition-all duration-300"
                  >
                    <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      {prod.primaryImage?.image?.url ? (
                        <img
                          src={prod.primaryImage.image.url}
                          alt={prod.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <UtensilsCrossed className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-amber-500 text-white px-2.5 py-0.5 text-[10px] font-bold shadow-md shadow-amber-500/30">
                        <Sparkles className="h-3 w-3 fill-current" />
                        Món đề xuất
                      </span>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-medium text-indigo-600 dark:text-indigo-400 truncate">
                          {prod.categoryName}
                        </span>
                        <span>/{prod.unitSymbol || "Phần"}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors" title={prod.name}>
                        {prod.name}
                      </h4>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider">Đơn giá</span>
                        <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                          {prod.unitPrice ? `${prod.unitPrice.toLocaleString("vi-VN")} đ` : "Liên hệ"}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/50">
                <UtensilsCrossed className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                <h4 className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Chưa có món đề xuất tại chi nhánh này
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Bạn có thể gắn cờ &quot;Món đề xuất&quot; (IsRecommended) cho các món bán chạy tại cơ sở này trong phần Quản lý Món ăn.
                </p>
                <Link to={`/products?branchId=${selectedBranchId}`}>
                  <Button size="sm" variant="outline" className="mt-4 text-xs gap-1.5 border-indigo-200">
                    <span>Mở danh sách món ăn</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Feature Modules Section */}
        <div id="features" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Các Phân Hệ Quản Trị Hệ Thống
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Lựa chọn phân hệ để xem chi tiết hoặc điều hướng nhanh qua thanh Sidebar
              </p>
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex gap-1.5 py-1">
              <Server className="h-3.5 w-3.5 text-indigo-500" />
              <span>Clean Architecture .NET 10 / React Router v8</span>
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featureModules.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card
                  key={idx}
                  className="group relative overflow-hidden border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${item.color} text-white shadow-md`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary">{item.badge}</Badge>
                    </div>
                    <CardTitle className="pt-3 text-base font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Link
                      to={item.link}
                      className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Truy cập phân hệ <ChevronRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* System Tech Overview Card */}
        <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white dark:border-indigo-950 dark:from-slate-900 dark:to-indigo-950/20">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Server className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>Kiến Trúc Tích Hợp Hệ Thống</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Management Portal giao tiếp với backend RestaurantService thông qua RESTful API tiêu chuẩn:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/60">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Xác thực & Bảo mật</span>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  JWT Access Token + Refresh Token tự động phục hồi qua Axios Interceptors khi 401.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/60">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Chuẩn dữ liệu Model</span>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  Đồng bộ 100% với cấu trúc <code>Result&lt;T&gt;</code> và <code>PaginationResult&lt;T&gt;</code> từ backend.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/60">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Giao diện Hiện đại</span>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  Điều hướng thanh Sidebar chuẩn phong cách shadcn/ui, thu gọn mượt mà, tối ưu trên thiết bị di động.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
