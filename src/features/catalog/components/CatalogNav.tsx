import React from "react";
import { Link, useLocation } from "react-router";
import { UtensilsCrossed, Tags, Layers, Scale, Sparkles } from "lucide-react";
import { cn } from "@/utils/cn";

export interface CatalogNavProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
  stats?: {
    totalProducts?: number;
    totalCategories?: number;
    totalBrands?: number;
    totalUnits?: number;
  };
}

export function CatalogNav({ title, description, actions, stats }: CatalogNavProps) {
  const location = useLocation();

  const navItems = [
    {
      label: "Món ăn & Thực đơn",
      href: "/products",
      icon: UtensilsCrossed,
      count: stats?.totalProducts,
    },
    {
      label: "Danh mục món",
      href: "/categories",
      icon: Tags,
      count: stats?.totalCategories,
    },
    {
      label: "Thương hiệu",
      href: "/brands",
      icon: Layers,
      count: stats?.totalBrands,
    },
    {
      label: "Đơn vị tính",
      href: "/units",
      icon: Scale,
      count: stats?.totalUnits,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-4 w-4" />
            <span>Quản lý danh mục & thực đơn</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1" aria-label="Tabs">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-semibold"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
                  )}
                />
                <span>{item.label}</span>
                {typeof item.count === "number" && (
                  <span
                    className={cn(
                      "ml-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                      isActive
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
