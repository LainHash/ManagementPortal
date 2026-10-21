import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { StockStatusBadge } from "@/features/catalog/components/Badges";
import { recipeApi } from "@/features/production/api/recipe.api";
import type { RecipeDetailResponse } from "@/types/production.types";
import {
  ChefHat,
  Star,
  BookOpen,
  Wheat,
  Scale,
  Edit,
  Loader2,
  AlertCircle,
  Hash,
  Boxes,
} from "lucide-react";
import { cn } from "@/utils/cn";

export interface RecipeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeId: string | null;
  onEdit?: (detail: RecipeDetailResponse) => void;
  onSetPrimary?: (recipeId: string) => Promise<void>;
}

export function RecipeDetailModal({
  isOpen,
  onClose,
  recipeId,
  onEdit,
  onSetPrimary,
}: RecipeDetailModalProps) {
  const [detail, setDetail] = useState<RecipeDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSettingPrimary, setIsSettingPrimary] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await recipeApi.recipes.getById(id);
      if (res?.data) {
        setDetail(res.data);
      } else {
        setError("Không tìm thấy dữ liệu chi tiết công thức.");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải chi tiết công thức định lượng."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && recipeId) {
      fetchDetail(recipeId);
    } else {
      setDetail(null);
      setError(null);
    }
  }, [isOpen, recipeId, fetchDetail]);

  const handleSetPrimary = async () => {
    if (!detail) return;
    setIsSettingPrimary(true);
    try {
      if (onSetPrimary) {
        await onSetPrimary(detail.id);
      } else {
        await recipeApi.recipes.setPrimary(detail.id);
      }
      setDetail((prev) => (prev ? { ...prev, isPrimary: true } : prev));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể đặt làm công thức chính.");
    } finally {
      setIsSettingPrimary(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {detail?.productName || "Chi tiết công thức định lượng"}
              </h2>
              {detail && (
                detail.isPrimary ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <Star className="h-3 w-3 fill-current" />
                    Công thức chính
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                    Công thức phụ
                  </span>
                )
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mã định danh: {recipeId || "—"}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex w-full items-center justify-between">
          <div>
            {detail && !detail.isPrimary && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSetPrimary}
                disabled={isSettingPrimary || isLoading}
                className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/50"
              >
                {isSettingPrimary ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Star className="h-4 w-4" />
                )}
                <span>Đặt làm công thức chính</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {detail && onEdit && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(detail);
                }}
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Edit className="h-4 w-4" />
                <span>Chỉnh sửa công thức</span>
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Đang tải dữ liệu định lượng...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="h-4 w-4" />
            <span>Không thể xem chi tiết</span>
          </div>
          <p className="mt-1 text-xs">{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => recipeId && fetchDetail(recipeId)}
            className="mt-3 border-red-300 text-xs text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300"
          >
            Thử lại
          </Button>
        </div>
      ) : detail ? (
        <div className="space-y-6">
          {/* Instructions Box */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              <span>Hướng dẫn & Ghi chú pha chế</span>
            </div>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {detail.instructions?.trim() || "Chưa có hướng dẫn pha chế hoặc lưu ý chế biến."}
            </p>
          </div>

          {/* Ingredients Breakdown Table */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wheat className="h-4 w-4 text-amber-500" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Danh mục thành phần nguyên liệu (BOM)
                </h3>
              </div>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                {detail.recipeIngredients?.length || 0} thành phần
              </span>
            </div>

            {(!detail.recipeIngredients || detail.recipeIngredients.length === 0) ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                <Boxes className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Công thức này chưa có nguyên liệu nào được chỉ định.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3 w-12 text-center">#</th>
                      <th className="px-4 py-3">Nguyên liệu</th>
                      <th className="px-4 py-3">Danh mục</th>
                      <th className="px-4 py-3 text-right">Định lượng</th>
                      <th className="px-4 py-3 text-center">Đơn vị</th>
                      <th className="px-4 py-3 text-center">Tồn kho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                    {detail.recipeIngredients.map((item, idx) => (
                      <tr
                        key={item.id || idx}
                        className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-4 py-3 text-center text-xs text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-indigo-500" />
                            <span>{item.ingredient?.name || "Nguyên liệu không xác định"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                          {item.ingredient?.categoryName || "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                          {Number(item.quantity).toLocaleString("vi-VN", {
                            maximumFractionDigits: 4,
                          })}
                        </td>
                        <td className="px-4 py-3 text-center text-xs">
                          <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {item.ingredient?.unitSymbol || item.ingredient?.unitName || "đv"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.ingredient?.stockStatus ? (
                            <StockStatusBadge status={item.ingredient.stockStatus} />
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
