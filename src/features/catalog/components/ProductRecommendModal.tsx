import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { catalogApi } from "../api/catalog.api";
import type { ProductResponse } from "@/types/catalog.types";
import type { BranchResponse } from "@/types/territory.types";
import { Star, Building2, Check, Loader2, Sparkles, MapPin } from "lucide-react";

interface ProductRecommendModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductResponse | null;
  branches: BranchResponse[];
  selectedBranchId?: string;
  onSuccess: (message: string) => void;
}

export function ProductRecommendModal({
  isOpen,
  onClose,
  product,
  branches,
  selectedBranchId,
  onSuccess,
}: ProductRecommendModalProps) {
  const [loadingBranchId, setLoadingBranchId] = useState<string | null>(null);

  if (!product) return null;

  const handleToggle = async (branchId: string, branchName: string) => {
    setLoadingBranchId(branchId);
    try {
      await catalogApi.products.toggleRecommend(product.id, branchId);
      onSuccess(`Đã thay đổi trạng thái nổi bật của món "${product.name}" tại ${branchName}.`);
      onClose();
    } catch (err: any) {
      console.error("Failed to toggle recommend", err);
    } finally {
      setLoadingBranchId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-500 dark:bg-amber-950/60 dark:text-amber-400">
            <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
          </div>
          <span className="text-base font-semibold text-slate-900 dark:text-white">
            Thiết lập Món nổi bật (Recommended)
          </span>
        </div>
      }
      description={`Chọn chi nhánh áp dụng đề xuất nổi bật cho món "${product.name}"`}
    >
      <div className="space-y-4">
        {/* Info card */}
        <div className="flex items-start gap-3 rounded-xl bg-amber-50/70 p-3.5 border border-amber-200/60 dark:bg-amber-950/30 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs">
          <Sparkles className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Đặc quyền Món ăn nổi bật:</p>
            <p className="text-amber-700 dark:text-amber-300/90 leading-relaxed">
              Món ăn được đánh dấu dấu sao sẽ xuất hiện trên mục <strong>Gợi ý hôm nay / Món ngon đề xuất</strong> của thực khách tại chi nhánh tương ứng.
            </p>
          </div>
        </div>

        {/* Branch list */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Danh sách chi nhánh áp dụng:
          </label>
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {branches.map((b) => {
              const isSelected = selectedBranchId === b.id;
              const isLoading = loadingBranchId === b.id;

              return (
                <div
                  key={b.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isSelected
                      ? "border-amber-300 bg-amber-50/40 dark:border-amber-800 dark:bg-amber-950/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 mt-0.5">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {b.city}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded-full font-medium">
                            Đang lọc
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="line-clamp-1">{b.address}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={product.isRecommended && isSelected ? "default" : "outline"}
                    disabled={isLoading}
                    onClick={() => handleToggle(b.id, b.city)}
                    className="h-8 px-3 text-xs gap-1.5 shadow-xs"
                  >
                    {isLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Star
                        className={`h-3.5 w-3.5 ${
                          product.isRecommended && isSelected
                            ? "fill-amber-400 text-amber-400"
                            : "text-amber-500"
                        }`}
                      />
                    )}
                    <span>Bật / Tắt</span>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
