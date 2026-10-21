import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  Layers,
  ShoppingBag,
  CalendarDays,
  MapPin,
  Users,
  User,
  LogOut,
  LogIn,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ChefHat,
  Scale,
  Wheat,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import { STORAGE_KEYS, APP_CONFIG } from "@/constants/app.constants";

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ isMobileOpen = false, onCloseMobile }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Collapsed state for desktop
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === "true";
  });

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(nextState));
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuSections = [
    {
      title: "Tổng quan",
      items: [
        {
          label: "Giới thiệu & Tổng quan",
          href: "/",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Thực đơn & Danh mục",
      items: [
        {
          label: "Món ăn & Thực đơn",
          href: "/products",
          icon: UtensilsCrossed,
          badge: "Catalog",
        },
        {
          label: "Danh mục món",
          href: "/categories",
          icon: Tags,
        },
        {
          label: "Thương hiệu",
          href: "/brands",
          icon: Layers,
        },
        {
          label: "Đơn vị tính",
          href: "/units",
          icon: Scale,
        },
      ],
    },
    {
      title: "Kho & Nguyên liệu",
      items: [
        {
          label: "Kho nguyên liệu",
          href: "/ingredients",
          icon: Wheat,
          badge: "Inventory",
        },
      ],
    },
    {
      title: "Vận hành & Bán hàng",
      items: [
        {
          label: "Đơn hàng (Sale)",
          href: "/orders",
          icon: ShoppingBag,
        },
        {
          label: "Lịch đặt bàn",
          href: "/reservations",
          icon: CalendarDays,
        },
        {
          label: "Khu vực & Bàn",
          href: "/tables",
          icon: MapPin,
        },
      ],
    },
    {
      title: "Hệ thống & Tài khoản",
      items: [
        {
          label: "Tài khoản nhân sự",
          href: "/users",
          icon: Users,
        },
        {
          label: "Hồ sơ cá nhân",
          href: "/profile",
          icon: User,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-950 md:sticky md:z-30",
          isCollapsed ? "w-18" : "w-64",
          // Mobile responsive slide-in
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand / Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          <Link
            to="/"
            className="flex items-center gap-3 overflow-hidden"
            onClick={onCloseMobile}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <ChefHat className="h-6 w-6" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {APP_CONFIG.SHORT_NAME}
                </span>
                <span className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Restaurant Portal
                </span>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            className="hidden h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 md:flex"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          <nav className="space-y-6">
            {menuSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                {!isCollapsed ? (
                  <h4 className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                    {section.title}
                  </h4>
                ) : (
                  <div className="mx-auto my-2 h-[1px] w-6 bg-slate-200 dark:bg-slate-800" />
                )}

                <div className="space-y-1 pt-1">
                  {section.items.map((item) => {
                    const isActive =
                      item.href === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={onCloseMobile}
                        title={isCollapsed ? item.label : undefined}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-semibold"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200",
                          isCollapsed && "justify-center px-2"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-transform group-hover:scale-105",
                            isActive
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-slate-500 dark:text-slate-400"
                          )}
                        />
                        {!isCollapsed && (
                          <div className="flex flex-1 items-center justify-between overflow-hidden">
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-[10px] px-1.5 py-0"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile / Auth footer widget */}
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          {isAuthenticated && user ? (
            <div
              className={cn(
                "flex items-center gap-3 rounded-xl bg-slate-50 p-2 dark:bg-slate-900/80",
                isCollapsed ? "justify-center p-1.5" : ""
              )}
            >
              <Link
                to="/profile"
                className="flex items-center gap-3 overflow-hidden flex-1 group"
                onClick={onCloseMobile}
              >
                <Avatar
                  src={user.personalProfile?.avatarUrl}
                  fallbackText={
                    user.personalProfile?.firstName ||
                    user.userName ||
                    user.email
                  }
                  size={isCollapsed ? "sm" : "md"}
                />
                {!isCollapsed && (
                  <div className="flex flex-col overflow-hidden text-left">
                    <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {user.personalProfile?.firstName
                        ? `${user.personalProfile.firstName} ${
                            user.personalProfile.lastName || ""
                          }`.trim()
                        : user.userName}
                    </span>
                    <span className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {user.roleName || "Quản trị viên"}
                    </span>
                  </div>
                )}
              </Link>

              {!isCollapsed && (
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-red-600 dark:hover:bg-slate-800 dark:hover:text-red-400 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div className={cn(isCollapsed ? "text-center" : "")}>
              <Link
                to="/login"
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors",
                  isCollapsed ? "justify-center px-2" : "justify-center"
                )}
                title="Đăng nhập tài khoản"
              >
                <LogIn className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>Đăng nhập</span>}
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
