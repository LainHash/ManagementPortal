import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/utils/cn";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ThemeToggle({
  className,
  showLabel = false,
  size = "md",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-4.5 w-4.5",
    lg: "h-5 w-5",
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
      title={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
      className={cn(
        "relative flex items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer",
        "border-slate-200/80 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs",
        "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80 dark:hover:text-white",
        sizeClasses[size],
        showLabel && "w-auto px-3 gap-2",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Sun Icon for Light Mode */}
        <Sun
          className={cn(
            iconSizes[size],
            "text-amber-500 transition-all duration-300",
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0 absolute"
          )}
        />
        {/* Moon Icon for Dark Mode */}
        <Moon
          className={cn(
            iconSizes[size],
            "text-indigo-500 transition-all duration-300",
            isDark
              ? "rotate-90 scale-0 opacity-0 absolute"
              : "rotate-0 scale-100 opacity-100"
          )}
        />
      </div>

      {showLabel && (
        <span className="text-xs font-semibold">
          {isDark ? "Chế độ sáng" : "Chế độ tối"}
        </span>
      )}
    </button>
  );
}
