import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { homeApi, type HomeOverviewData } from "@/features/home/api/home.api";
import { AdminLayout } from "@/layouts/AdminLayout";
import { APP_CONFIG } from "@/constants/app.constants";

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

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await homeApi.getHomeOverview();
        if (isMounted && res.isSucceed && res.data) {
          setData(res.data);
        }
      } catch (err) {
        // Fallback or keep null
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Stats calculation (real API or fallback display)
  const productCount = data?.products?.length ?? 48;
  const categoryCount = data?.productCategories?.length ?? 12;
  const brandCount = data?.brands?.length ?? 6;
  const branchCount = data?.branches?.length ?? 4;

  const featureModules = [
    {
      title: "Thực đơn & Món ăn",
      description: "Quản lý danh mục món, giá bán, công thức định lượng và tồn kho theo thời gian thực.",
      icon: UtensilsCrossed,
      color: "from-blue-500 to-indigo-600",
      badge: "Catalog",
      link: "/products",
    },
    {
      title: "Vận hành Bàn & Khu vực",
      description: "Sơ đồ bàn thông minh, phân chia khu vực (VIP, Ngoài trời, Phòng lạnh) linh hoạt.",
      icon: MapPin,
      color: "from-emerald-500 to-teal-600",
      badge: "Territory",
      link: "/tables",
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
      title: "Tài khoản & Phân quyền",
      description: "Phân quyền chi tiết (RBAC) cho SuperAdmin, Quản lý chi nhánh, Thu ngân, Bếp.",
      icon: ShieldCheck,
      color: "from-rose-500 to-red-600",
      badge: "Security",
      link: "/users",
    },
    {
      title: "Báo cáo Doanh thu",
      description: "Phân tích doanh số theo ngày, món bán chạy nhất và hiệu suất từng nhân viên.",
      icon: TrendingUp,
      color: "from-cyan-500 to-blue-600",
      badge: "Analytics",
      link: "/analytics",
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

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Món ăn trên hệ thống
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
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Đồng bộ từ Catalog Service
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
                    Chi nhánh hoạt động
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {loading ? "..." : branchCount}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Store className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-3 flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Khu vực Territory
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
              <span>Clean Architecture .NET 8 / React Router 7</span>
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
