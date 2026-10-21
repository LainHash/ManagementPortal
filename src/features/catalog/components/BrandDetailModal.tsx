import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { catalogApi } from "../api/catalog.api";
import { InventoryTypeBadge } from "./Badges";
import type { BrandResponse, BrandDetailResponse } from "@/types/catalog.types";
import { Layers, UtensilsCrossed, Loader2, Edit, AlertCircle, Image as ImageIcon } from "lucide-react";

interface BrandDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: BrandResponse | null;
  onEdit?: (brand: BrandResponse) => void;
}

export function BrandDetailModal({
  isOpen,
  onClose,
  brand,
  onEdit,
}: BrandDetailModalProps) {
  const [detail, setDetail] = useState<BrandDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && brand?.id) {
      setIsLoading(true);
      setError(null);
      catalogApi.brands
        .getById(brand.id)
        .then((res) => {
          if (res?.data) {
            setDetail(res.data);
          } else {
            setDetail(null);
          }
        })
        .catch((err) => {
          setError(err?.message || "Không thể tải chi tiết thương hiệu.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setDetail(null);
    }
  }, [isOpen, brand?.id]);

  if (!brand) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-indigo-600" />
          <span>Thương hiệu: {brand.name}</span>
        </div>
      }
      description="Xem thông tin và danh mục các món ăn thuộc nhãn hàng này"
    >
      <div className="space-y-4">
        {/* Brand Banner / Logo */}
        <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white border border-slate-200 shadow-xs dark:bg-slate-800 dark:border-slate-700">
            {brand.primaryImage?.image?.url ? (
              <img
                src={brand.primaryImage.image.url}
                alt={brand.name}
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <Layers className="h-8 w-8 text-indigo-500" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {brand.name}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {brand.description || "Chưa có mô tả định vị thương hiệu."}
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-8 gap-2 text-indigo-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Đang tải danh sách món ăn thuộc thương hiệu...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Brand Products list */}
        {!isLoading && detail && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Món ăn thuộc thương hiệu ({detail.products?.length || 0})
              </h4>
            </div>

            {detail.products && detail.products.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 max-h-64 overflow-y-auto">
                {detail.products.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                        <UtensilsCrossed className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {prod.name}
                        </p>
                        {prod.description && (
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {prod.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <InventoryTypeBadge type={prod.inventoryType} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400 dark:border-slate-800">
                Chưa có món ăn nào được gán cho thương hiệu này.
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          {onEdit && (
            <Button
              onClick={() => {
                onClose();
                onEdit(brand);
              }}
            >
              <Edit className="mr-1.5 h-4 w-4" />
              Chỉnh sửa thương hiệu
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
