import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { StockStatusBadge } from "@/features/catalog/components/Badges";
import { recipeApi } from "@/features/production/api/recipe.api";
import { territoryApi } from "@/features/territory/api/territory.api";
import { STORAGE_KEYS, APP_EVENTS } from "@/constants/app.constants";
import type { RecipeDetailResponse } from "@/types/production.types";
import type { BranchResponse } from "@/types/territory.types";
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
  Store,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/utils/cn";

export interface RecipeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeId: string | null;
  branchId?: string;
  branches?: BranchResponse[];
  onEdit?: (detail: RecipeDetailResponse) => void;
  onSetPrimary?: (recipeId: string) => Promise<void>;
}

export function RecipeDetailModal({
  isOpen,
  onClose,
  recipeId,
  branchId: initialBranchId,
  branches: propBranches,
  onEdit,
  onSetPrimary,
}: RecipeDetailModalProps) {
  const [detail, setDetail] = useState<RecipeDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSettingPrimary, setIsSettingPrimary] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Branch states
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [branchesList, setBranchesList] = useState<BranchResponse[]>(propBranches || []);

  // Sync selected branch ID from prop or localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialBranchId !== undefined && initialBranchId !== "") {
        setSelectedBranchId(initialBranchId);
      } else if (typeof window !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_BRANCH_ID) || "";
        setSelectedBranchId(stored);
      }
    }
  }, [isOpen, initialBranchId]);

  // Load branches if not provided via props
  useEffect(() => {
    if (propBranches && propBranches.length > 0) {
      setBranchesList(propBranches);
    } else if (isOpen) {
      territoryApi.branches
        .getAll({ pageSize: 100 })
        .then((res) => {
          if (res?.data) {
            setBranchesList(res.data);
          }
        })
        .catch((err) => {
          console.error("Failed to load branches for recipe detail modal", err);
        });
    }
  }, [isOpen, propBranches]);

  // Fetch recipe detail with optional branchId
  const fetchDetail = useCallback(async (id: string, branchId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await recipeApi.recipes.getById(id, branchId || undefined);
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
      fetchDetail(recipeId, selectedBranchId);
    } else {
      setDetail(null);
      setError(null);
    }
  }, [isOpen, recipeId, selectedBranchId, fetchDetail]);

  const handleBranchChange = (newBranchId: string) => {
    setSelectedBranchId(newBranchId);
    let branchCode = "";
    if (typeof window !== "undefined") {
      if (newBranchId) {
        localStorage.setItem(STORAGE_KEYS.SELECTED_BRANCH_ID, newBranchId);
        const matched = branchesList.find((b) => b.id === newBranchId);
        if (matched) {
          branchCode = matched.branchCode;
          localStorage.setItem(STORAGE_KEYS.SELECTED_BRANCH_CODE, matched.branchCode);
        }
      } else {
        localStorage.removeItem(STORAGE_KEYS.SELECTED_BRANCH_ID);
        localStorage.removeItem(STORAGE_KEYS.SELECTED_BRANCH_CODE);
      }

      window.dispatchEvent(
        new CustomEvent(APP_EVENTS.BRANCH_CHANGED, {
          detail: { branchId: newBranchId, branchCode },
        })
      );
    }
  };

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

  // Compute portion capacity and bottleneck ingredient based on branch stock
  const portionAnalysis = useMemo(() => {
    if (
      !detail?.recipeIngredients ||
      detail.recipeIngredients.length === 0 ||
      !selectedBranchId
    ) {
      return null;
    }

    let minPortions = Infinity;
    let bottleneckIngredient: string | null = null;
    let hasOutOfStock = false;
    let deficitCount = 0;

    for (const item of detail.recipeIngredients) {
      const qty = Number(item.quantity);
      if (qty <= 0) continue;

      const avail = Number(item.ingredient?.availableQuantity ?? 0);
      if (avail <= 0) {
        hasOutOfStock = true;
      }
      if (avail < qty) {
        deficitCount++;
      }
      const portions = avail / qty;
      if (portions < minPortions) {
        minPortions = portions;
        bottleneckIngredient = item.ingredient?.name || "Nguyên liệu";
      }
    }

    if (minPortions === Infinity) {
      return null;
    }

    return {
      maxPortions: Math.floor(Math.max(0, minPortions)),
      bottleneckIngredient,
      hasOutOfStock,
      deficitCount,
    };
  }, [detail, selectedBranchId]);

  const selectedBranchLabel = useMemo(() => {
    const b = branchesList.find((br) => br.id === selectedBranchId);
    if (!b) return "";
    return `[${b.branchCode}] ${b.address ? `${b.address} (${b.city})` : b.city}`;
  }, [branchesList, selectedBranchId]);

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
              {detail &&
                (detail.isPrimary ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <Star className="h-3 w-3 fill-current" />
                    Công thức chính
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                    Công thức phụ
                  </span>
                ))}
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
            Đang tải dữ liệu định lượng & tồn kho...
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
            onClick={() => recipeId && fetchDetail(recipeId, selectedBranchId)}
            className="mt-3 border-red-300 text-xs text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300"
          >
            Thử lại
          </Button>
        </div>
      ) : detail ? (
        <div className="space-y-6">
          {/* Branch Selector Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                <Store className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Chi nhánh xem tồn kho:
                  </span>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="">-- Chưa chọn (Tồn kho chung) --</option>
                    {branchesList.map((b) => (
                      <option key={b.id} value={b.id}>
                        [{b.branchCode}] {b.address ? `${b.address} (${b.city})` : b.city}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedBranchId
                    ? `Đang hiển thị tồn kho & tình trạng nguyên liệu tại: ${selectedBranchLabel}`
                    : "Chọn một chi nhánh để xem chính xác số lượng tồn kho và khả năng phục vụ."}
                </p>
              </div>
            </div>

            {selectedBranchId && (
              <span className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Thời gian thực
              </span>
            )}
          </div>

          {/* Portion Analysis Card (When Branch is Selected) */}
          {portionAnalysis && (
            <div
              className={cn(
                "rounded-xl border p-4 transition-colors",
                portionAnalysis.deficitCount > 0
                  ? "border-rose-200 bg-rose-50/70 text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200"
                  : portionAnalysis.maxPortions <= 5
                  ? "border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200"
                  : "border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {portionAnalysis.deficitCount > 0 ? (
                    <AlertTriangle className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
                  ) : portionAnalysis.maxPortions <= 5 ? (
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold">
                      {portionAnalysis.deficitCount > 0
                        ? `Thiếu nguyên liệu: Hiện không thể hoàn thành 1 khẩu phần tại chi nhánh!`
                        : `Chi nhánh có thể chế biến tối đa: ~${portionAnalysis.maxPortions.toLocaleString("vi-VN")} khẩu phần`}
                    </h4>
                    <p className="mt-1 text-xs opacity-90">
                      {portionAnalysis.deficitCount > 0
                        ? `Có ${portionAnalysis.deficitCount} nguyên liệu không đủ số lượng để đáp ứng định lượng tiêu chuẩn.`
                        : portionAnalysis.bottleneckIngredient
                        ? `Giới hạn bởi nguyên liệu: "${portionAnalysis.bottleneckIngredient}".`
                        : "Tồn kho nguyên liệu đáp ứng đầy đủ."}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="block text-[11px] font-medium opacity-80 uppercase tracking-wider">
                    Công suất tồn kho
                  </span>
                  <span className="text-lg font-extrabold font-mono">
                    {portionAnalysis.maxPortions}{" "}
                    <span className="text-xs font-normal">suất</span>
                  </span>
                </div>
              </div>
            </div>
          )}

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

            {!detail.recipeIngredients || detail.recipeIngredients.length === 0 ? (
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
                      <th className="px-4 py-3 text-right">Định lượng (1 suất)</th>
                      <th className="px-4 py-3 text-center">Đơn vị</th>
                      <th className="px-4 py-3 text-center">Tồn kho chi nhánh</th>
                      {selectedBranchId && (
                        <th className="px-4 py-3 text-center">Khả năng đáp ứng</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                    {detail.recipeIngredients.map((item, idx) => {
                      const qty = Number(item.quantity);
                      const avail = Number(item.ingredient?.availableQuantity ?? 0);
                      const isDeficit = selectedBranchId && avail < qty;
                      const portions = qty > 0 ? Math.floor(avail / qty) : 0;

                      return (
                        <tr
                          key={item.id || idx}
                          className={cn(
                            "transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40",
                            isDeficit && "bg-rose-50/40 dark:bg-rose-950/15"
                          )}
                        >
                          <td className="px-4 py-3 text-center text-xs text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "h-2 w-2 rounded-full",
                                  isDeficit ? "bg-rose-500" : "bg-indigo-500"
                                )}
                              />
                              <span>
                                {item.ingredient?.name || "Nguyên liệu không xác định"}
                              </span>
                            </div>
                            {item.ingredient?.unitPrice ? (
                              <span className="text-[11px] font-normal text-slate-400 block ml-4">
                                Giá vốn: {Number(item.ingredient.unitPrice).toLocaleString("vi-VN")} đ
                              </span>
                            ) : null}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                            {item.ingredient?.categoryName || "—"}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                            {qty.toLocaleString("vi-VN", {
                              maximumFractionDigits: 4,
                            })}
                          </td>
                          <td className="px-4 py-3 text-center text-xs">
                            <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {item.ingredient?.unitSymbol ||
                                item.ingredient?.unitName ||
                                "đv"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {selectedBranchId ? (
                              <div className="flex flex-col items-center justify-center gap-1">
                                {item.ingredient?.stockStatus ? (
                                  <StockStatusBadge status={item.ingredient.stockStatus} />
                                ) : (
                                  <span className="text-xs text-slate-400">—</span>
                                )}
                                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                  {avail.toLocaleString("vi-VN", {
                                    maximumFractionDigits: 4,
                                  })}{" "}
                                  {item.ingredient?.unitSymbol ||
                                    item.ingredient?.unitName ||
                                    ""}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center text-xs text-slate-400">
                                <span>—</span>
                                <span className="text-[10px] italic">Chưa chọn CN</span>
                              </div>
                            )}
                          </td>
                          {selectedBranchId && (
                            <td className="px-4 py-3 text-center">
                              {isDeficit ? (
                                <div className="flex flex-col items-center">
                                  <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                                    Thiếu hàng
                                  </span>
                                  <span className="text-[10px] text-rose-500 mt-0.5 font-mono">
                                    -{(qty - avail).toLocaleString("vi-VN", {
                                      maximumFractionDigits: 2,
                                    })}{" "}
                                    {item.ingredient?.unitSymbol || ""}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <span
                                    className={cn(
                                      "font-mono text-xs font-bold",
                                      portions <= 5
                                        ? "text-amber-600 dark:text-amber-400"
                                        : "text-emerald-600 dark:text-emerald-400"
                                    )}
                                  >
                                    ~{portions.toLocaleString("vi-VN")} suất
                                  </span>
                                  <span className="text-[10px] text-slate-400">đáp ứng</span>
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
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
