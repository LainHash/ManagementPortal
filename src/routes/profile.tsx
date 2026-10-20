import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  User,
  Mail,
  Shield,
  Phone,
  MapPin,
  Calendar,
  KeyRound,
  RefreshCw,
  LogOut,
  AlertTriangle,
  LogIn,
  CheckCircle2,
  Clock,
  Sparkles,
  Fingerprint,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { AdminLayout } from "@/layouts/AdminLayout";

export function meta() {
  return [
    { title: "Hồ sơ cá nhân | Restaurant Management Portal" },
    {
      name: "description",
      content: "Xem và quản lý thông tin tài khoản người dùng",
    },
  ];
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, refreshUser, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUser();
    setIsRefreshing(false);
    setRefreshSuccess(true);
    setTimeout(() => setRefreshSuccess(false), 2500);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm text-slate-500">
              Đang tải thông tin cá nhân từ API...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-lg pt-12">
          <Card className="border-amber-200 bg-amber-50/50 text-center dark:border-amber-900/60 dark:bg-amber-950/20">
            <CardHeader>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <CardTitle className="text-xl">Chưa Đăng Nhập</CardTitle>
              <CardDescription>
                Bạn cần đăng nhập vào hệ thống để xem thông tin hồ sơ cá nhân và
                quyền hạn tài khoản.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center pb-6">
              <Link to="/login">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Đi tới trang Đăng nhập</span>
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const profile = user.personalProfile;
  const fullName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ""}`.trim()
    : user.userName;

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        {/* Profile Header Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="absolute right-0 top-0 h-32 w-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between pt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar
                src={profile?.avatarUrl}
                fallbackText={fullName}
                size="xl"
                className="ring-4 ring-white dark:ring-slate-900 shadow-md"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {fullName}
                  </h1>
                  <Badge variant="default" className="gap-1">
                    <Shield className="h-3 w-3" />
                    <span>{user.roleName || "Quản trị viên"}</span>
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{user.email || "Chưa cập nhật email"}</span>
                </p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Fingerprint className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    UUID:{" "}
                    <code className="font-mono text-indigo-500">{user.id}</code>
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                isLoading={isRefreshing}
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Đồng bộ từ API</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Đăng xuất</span>
              </Button>
            </div>
          </div>

          {refreshSuccess && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-2.5 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                Đã đồng bộ thông tin mới nhất từ API /Authentication/me
              </span>
            </div>
          )}
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Box 1: Account Information */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Thông Tin Tài Khoản Định Danh</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Dữ liệu tài khoản từ module Identity.Users của RestaurantService
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 py-2">
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  Tên đăng nhập (Username)
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {user.userName}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 py-2">
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  Email đăng ký
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {user.email}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 py-2">
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  Vai trò phân quyền (Role)
                </span>
                <Badge variant="secondary">{user.roleName || "User"}</Badge>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  Trạng thái xác thực
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Đã kích hoạt
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Box 2: Personal Profile */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Hồ Sơ Cá Nhân (Personal Profile)</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Thông tin liên hệ và bổ sung từ PersonalProfiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 py-2">
                <span className="font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>Họ và Tên</span>
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {profile?.firstName
                    ? `${profile.firstName} ${profile.lastName || ""}`
                    : "Chưa cập nhật"}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 py-2">
                <span className="font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>Số điện thoại</span>
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {profile?.phone || "Chưa cập nhật"}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 py-2">
                <span className="font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>Địa chỉ</span>
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {profile?.address || "Chưa cập nhật"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Ngày sinh</span>
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {profile?.dateOfBirth
                    ? new Date(profile.dateOfBirth).toLocaleDateString("vi-VN")
                    : "Chưa cập nhật"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security & Sessions */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <KeyRound className="h-4 w-4 text-amber-500" />
              <span>Bảo Mật & Quản Lý Phiên Làm Việc</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Trạng thái mã khóa xác thực và phiên đăng nhập hiện tại
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Cơ chế bảo mật Token tự động gia hạn</span>
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Phiên làm việc được bảo vệ bằng JWT. Axios Interceptor tự động
                  gửi Refresh Token khi phiên hết hạn.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="text-xs shrink-0"
              >
                Kiểm tra kết nối Token
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
