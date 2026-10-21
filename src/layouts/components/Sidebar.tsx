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
  MessageSquareText,
  Building2,
  Store,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import {
  STORAGE_KEYS,
  APP_CONFIG,
  APP_EVENTS,
} from "@/constants/app.constants";
import { territoryApi } from "@/features/territory/api/territory.api";
import type { BranchResponse } from "@/types/territory.types";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

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

  // Branch management states
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(STORAGE_KEYS.SELECTED_BRANCH_ID) || "";
  });
  const [isLoadingBranches, setIsLoadingBranches] = useState<boolean>(false);

  // Fetch branches for sidebar selector
  useEffect(() => {
    let isMounted = true;
    setIsLoadingBranches(true);
    territoryApi.branches
      .getAll({ pageSize: 100 })
      .then((res) => {
        if (isMounted && res?.data) {
          setBranches(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load branches in Sidebar", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingBranches(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for branch changes from other parts of the application
  useEffect(() => {
    const handleBranchChanged = (e: any) => {
      const newBranchId =
        e?.detail?.branchId !== undefined
          ? e.detail.branchId
          : localStorage.getItem(STORAGE_KEYS.SELECTED_BRANCH_ID) || "";
      setSelectedBranchId(newBranchId);
    };

    window.addEventListener(APP_EVENTS.BRANCH_CHANGED, handleBranchChanged);
    window.addEventListener("storage", handleBranchChanged);

    return () => {
      window.removeEventListener(
        APP_EVENTS.BRANCH_CHANGED,
        handleBranchChanged,
      );
      window.removeEventListener("storage", handleBranchChanged);
    };
  }, []);

  const handleBranchSelect = (newBranchId: string) => {
    setSelectedBranchId(newBranchId);
    let branchCode = "";
    if (typeof window !== "undefined") {
      if (newBranchId) {
        localStorage.setItem(STORAGE_KEYS.SELECTED_BRANCH_ID, newBranchId);
        const matched = branches.find((b) => b.id === newBranchId);
        if (matched) {
          branchCode = matched.branchCode;
          localStorage.setItem(
            STORAGE_KEYS.SELECTED_BRANCH_CODE,
            matched.branchCode,
          );
        }
      } else {
        localStorage.removeItem(STORAGE_KEYS.SELECTED_BRANCH_ID);
        localStorage.removeItem(STORAGE_KEYS.SELECTED_BRANCH_CODE);
      }

      window.dispatchEvent(
        new CustomEvent(APP_EVENTS.BRANCH_CHANGED, {
          detail: { branchId: newBranchId, branchCode },
        }),
      );
    }
  };

  const activeBranch = branches.find((b) => b.id === selectedBranchId);

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
      title: "Kho & Định lượng",
      items: [
        {
          label: "Kho nguyên liệu",
          href: "/ingredients",
          icon: Wheat,
          badge: "Inventory",
        },
        {
          label: "Công thức định lượng",
          href: "/recipes",
          icon: ChefHat,
          badge: "BOM",
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
          label: "Chi nhánh",
          href: "/branches",
          icon: Building2,
          badge: "Territory",
        },
        {
          label: "Khu vực (Areas)",
          href: "/areas",
          icon: Layers,
        },
        {
          label: "Bàn ăn (Tables)",
          href: "/tables",
          icon: MapPin,
        },
        {
          label: "Tin nhắn liên hệ",
          href: "/contact-messages",
          icon: MessageSquareText,
          badge: "Contact",
        },
      ],
    },
    {
      title: "Hệ thống & Tài khoản",
      items: [
        {
          label: "Người dùng",
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
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
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

        {/* ============================================================== */}
        {/* Branch Selector Widget */}
        {/* ============================================================== */}
        {!isCollapsed ? (
          <div className="border-b border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-1.5 flex items-center justify-between px-0.5">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Store className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                Chi nhánh làm việc
              </span>
              {activeBranch && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/70 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {activeBranch.branchCode}
                </span>
              )}
            </div>

            <div className="relative">
              <select
                value={selectedBranchId}
                onChange={(e) => handleBranchSelect(e.target.value)}
                disabled={isLoadingBranches}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-7 text-xs font-semibold text-slate-800 shadow-2xs transition-colors hover:border-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 cursor-pointer"
              >
                <option value="">-- Toàn hệ thống (Tất cả) --</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    [{b.branchCode}]{" "}
                    {b.address ? `${b.address} (${b.city})` : b.city}
                  </option>
                ))}
              </select>
              <Building2 className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {activeBranch ? (
              <p
                className="mt-1.5 truncate px-0.5 text-[11px] text-slate-500 dark:text-slate-400"
                title={
                  activeBranch.address
                    ? `${activeBranch.address}, ${activeBranch.city}`
                    : activeBranch.city
                }
              >
                {activeBranch.address
                  ? `${activeBranch.address}, ${activeBranch.city}`
                  : activeBranch.city}
              </p>
            ) : (
              <p className="mt-1.5 px-0.5 text-[11px] text-slate-400 italic">
                Đang xem dữ liệu toàn chuỗi
              </p>
            )}
          </div>
        ) : (
          <div className="border-b border-slate-200 p-2 text-center dark:border-slate-800">
            <div
              className={cn(
                "group relative mx-auto flex h-10 w-10 items-center justify-center rounded-xl transition-all shadow-2xs",
                activeBranch
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200/70 dark:bg-slate-900 dark:text-slate-400 border border-slate-200 dark:border-slate-800",
              )}
              title={
                activeBranch
                  ? `Chi nhánh đang chọn: [${activeBranch.branchCode}] ${activeBranch.address || activeBranch.city} (Bấm để đổi)`
                  : "Chọn chi nhánh làm việc (Toàn hệ thống)"
              }
            >
              <Store className="h-5 w-5" />
              {activeBranch && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950" />
                </span>
              )}
              <select
                value={selectedBranchId}
                onChange={(e) => handleBranchSelect(e.target.value)}
                disabled={isLoadingBranches}
                title="Chọn chi nhánh làm việc"
                aria-label="Chọn chi nhánh làm việc"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              >
                <option value="">-- Toàn hệ thống (Tất cả) --</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    [{b.branchCode}]{" "}
                    {b.address ? `${b.address} (${b.city})` : b.city}
                  </option>
                ))}
              </select>
            </div>
            {activeBranch ? (
              <span className="mt-1 block truncate text-[10px] font-bold text-slate-700 dark:text-slate-300">
                {activeBranch.branchCode}
              </span>
            ) : (
              <span className="mt-1 block text-[10px] font-medium text-slate-400">
                Toàn HT
              </span>
            )}
          </div>
        )}

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
                          isCollapsed && "justify-center px-2",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-transform group-hover:scale-105",
                            isActive
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-slate-500 dark:text-slate-400",
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
        <div className="border-t border-slate-200 p-3 dark:border-slate-800 space-y-2">
          {!isCollapsed ? (
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Giao diện
              </span>
              <ThemeToggle size="sm" showLabel />
            </div>
          ) : (
            <div className="flex justify-center pb-0.5">
              <ThemeToggle size="sm" />
            </div>
          )}

          {isAuthenticated && user ? (
            <div
              className={cn(
                "flex items-center gap-3 rounded-xl bg-slate-50 p-2 dark:bg-slate-900/80",
                isCollapsed ? "justify-center p-1.5" : "",
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
                  isCollapsed ? "justify-center px-2" : "justify-center",
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
