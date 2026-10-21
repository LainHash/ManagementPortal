import React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface NavbarProps {
  onToggleMobileMenu: () => void;
}

export function Navbar({ onToggleMobileMenu }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = React.useState(false);

  const getPageTitle = (pathname: string) => {
    if (pathname === "/") return "Tổng quan hệ thống";
    if (pathname === "/profile") return "Thông tin cá nhân";
    if (pathname === "/login") return "Đăng nhập";
    if (pathname.startsWith("/products")) return "Quản lý món ăn";
    if (pathname.startsWith("/categories")) return "Danh mục sản phẩm";
    if (pathname.startsWith("/users")) return "Quản lý người dùng";
    return "Quản lý";
  };

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 md:px-6">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Mở menu điều hướng"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link
            to="/"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            Portal
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {getPageTitle(location.pathname)}
          </span>
        </div>
      </div>

      {/* Right: Quick actions & User menu */}
      <div className="flex items-center gap-3">
        {/* Connection status indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>API Connected</span>
        </div>

        {/* Theme Toggle Button (Sáng / Tối) */}
        <ThemeToggle size="md" />

        {isAuthenticated && user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2.5 rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <Avatar
                src={user.personalProfile?.avatarUrl}
                fallbackText={
                  user.personalProfile?.firstName ||
                  user.userName ||
                  user.email
                }
                size="sm"
              />
              <span className="hidden text-xs font-semibold text-slate-700 dark:text-slate-200 md:inline-block">
                {user.userName}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 z-40 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                  <div className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {user.userName}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user.email}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>{user.roleName || "Quản trị viên"}</span>
                    </div>
                  </div>

                  <div className="p-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <User className="h-4 w-4" />
                      <span>Xem thông tin cá nhân</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 p-1 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link to="/login">
            <Button size="sm" variant="default" className="gap-2">
              <User className="h-4 w-4" />
              <span>Đăng nhập</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
