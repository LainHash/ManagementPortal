import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { catalogApi } from "../api/catalog.api";
import { InventoryTypeBadge } from "./Badges";
import type {
  ProductCategoryResponse,
  ProductCategoryDetailResponse,
} from "@/types/catalog.types";
import { Tags, UtensilsCrossed, Loader2, Edit, AlertCircle } from "lucide-react";

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ProductCategoryResponse | null;
  onEdit?: (category: ProductCategoryResponse) => void;
}

export function CategoryDetailModal({
  isOpen,
  onClose,
  category,
  onEdit,
}: CategoryDetailModalProps) {
  const [detail, setDetail] = useState<ProductCategoryDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && category?.id) {
      setIsLoading(true);
      setError(null);
      catalogApi.categories
        .getById(category.id)
        .then((res) => {
          if (res?.data) {
            setDetail(res.data);
          } else {
            setDetail(null);
          }
        })
        .catch((err) => {
          setError(err?.message || "Không thể tải chi tiết danh mục.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setDetail(null);
    }
  }, [isOpen, category?.id]);

  if (!category) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <Tags className="h-5 w-5 text-indigo-600" />
          <span>Danh mục: {category.name}</span>
        </div>
      }
      description="Xem thông tin và danh sách các món ăn thuộc danh mục này"
    >
      <div className="space-y-4">
        {/* Description */}
        <div className="rounded-lg bg-slate-50 p-3.5 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Mô tả
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {category.description || "Chưa có mô tả cho danh mục này."}
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-8 gap-2 text-indigo-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Đang tải danh sách món ăn thuộc danh mục...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Products list in category */}
        {!isLoading && detail && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Món ăn trong danh mục ({detail.products?.length || 0})
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
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
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
                Chưa có món ăn nào trong danh mục này.
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
                onEdit(category);
              }}
            >
              <Edit className="mr-1.5 h-4 w-4" />
              Chỉnh sửa danh mục
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
