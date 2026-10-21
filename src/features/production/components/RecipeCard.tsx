import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { RecipeResponse } from "@/types/production.types";
import {
  Eye,
  Edit,
  Trash2,
  ChefHat,
  Star,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { cn } from "@/utils/cn";

export interface RecipeCardProps {
  recipe: RecipeResponse;
  onView: (recipe: RecipeResponse) => void;
  onEdit: (recipe: RecipeResponse) => void;
  onDelete: (recipe: RecipeResponse) => void;
  onSetPrimary?: (recipe: RecipeResponse) => void;
  isActionLoading?: boolean;
}

export function RecipeCard({
  recipe,
  onView,
  onEdit,
  onDelete,
  onSetPrimary,
  isActionLoading = false,
}: RecipeCardProps) {
  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-indigo-700">
      {/* Top Banner & Status */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950/60 dark:text-indigo-400 dark:group-hover:bg-indigo-500 dark:group-hover:text-white">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <h3 className="line-clamp-1 font-semibold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                {recipe.productName || "Sản phẩm chưa đặt tên"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mã công thức: {recipe.id.slice(0, 8)}...
              </p>
            </div>
          </div>

          <div>
            {recipe.isPrimary ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-xs dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Star className="h-3.5 w-3.5 fill-current" />
                Công thức chính
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                Công thức phụ
              </span>
            )}
          </div>
        </div>

        {/* Instructions / Recipe notes */}
        <div className="mt-4 min-h-[48px] rounded-lg bg-slate-50/80 p-3 text-xs text-slate-600 border border-slate-100 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400 mb-1">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Hướng dẫn & Lưu ý:</span>
          </div>
          <p className="line-clamp-2 italic">
            {recipe.instructions?.trim() || "Chưa có ghi chú hoặc hướng dẫn pha chế."}
          </p>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="flex items-center gap-1">
          {!recipe.isPrimary && onSetPrimary && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isActionLoading}
              onClick={() => onSetPrimary(recipe)}
              className="h-8 gap-1 border-amber-200 text-xs font-medium text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-800/60 dark:text-amber-400 dark:hover:bg-amber-950/40"
              title="Đặt làm công thức chuẩn chính thức"
            >
              <Star className="h-3.5 w-3.5" />
              <span>Làm chính</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onView(recipe)}
            className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/50"
            title="Xem chi tiết định lượng"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(recipe)}
            className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/50"
            title="Sửa công thức"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(recipe)}
            className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/50"
            title="Xóa công thức"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
