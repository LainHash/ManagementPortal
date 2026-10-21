import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { catalogApi } from "../api/catalog.api";
import { StockStatusBadge, InventoryTypeBadge } from "./Badges";
import type { ProductDetailResponse, ProductResponse } from "@/types/catalog.types";
import {
  UtensilsCrossed,
  Tags,
  Layers,
  Scale,
  DollarSign,
  ChefHat,
  Image as ImageIcon,
  BookOpen,
  Edit,
  Loader2,
  Calendar,
  Boxes,
} from "lucide-react";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductResponse | null;
  branchId?: string;
  onEdit?: (product: ProductResponse) => void;
  onUpdatePrice?: (product: ProductResponse) => void;
  onUpdateStock?: (product: ProductResponse) => void;
}

export function ProductDetailModal({
  isOpen,
  onClose,
  product,
  branchId,
  onEdit,
  onUpdatePrice,
  onUpdateStock,
}: ProductDetailModalProps) {
  const [detail, setDetail] = useState<ProductDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  useEffect(() => {
    if (isOpen && product?.id) {
      setIsLoading(true);
      catalogApi.products
        .getById(product.id, branchId)
        .then((res) => {
          if (res?.data) {
            setDetail(res.data);
          } else {
            setDetail(null);
          }
        })
        .catch(() => {
          setDetail(null);
        })
        .finally(() => {
          setIsLoading(false);
          setActiveImageIndex(0);
        });
    } else {
      setDetail(null);
    }
  }, [isOpen, product?.id, branchId]);

  if (!product) return null;

  const currentData = detail || product;
  const images = (detail?.productImages && detail.productImages.length > 0)
    ? detail.productImages.map((pi) => pi.image)
    : product.primaryImage?.image
    ? [product.primaryImage.image]
    : [];

  const formatPrice = (price?: number | null, currency?: string | null) => {
    if (price === undefined || price === null) return "Chưa định giá";
    return `${price.toLocaleString("vi-VN")} ${currency || "VND"}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-indigo-600" />
          <span>Chi tiết món ăn: {product.name}</span>
        </div>
      }
      description="Xem thông tin chi tiết, hình ảnh thực tế và công thức chế biến"
    >
      <div className="space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center py-6 gap-2 text-indigo-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Đang tải dữ liệu chi tiết từ máy chủ...</span>
          </div>
        )}

        {/* Gallery / Image preview */}
        <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800/80 aspect-video flex items-center justify-center border border-slate-200 dark:border-slate-800">
          {images.length > 0 ? (
            <img
              src={images[activeImageIndex]?.url}
              alt={images[activeImageIndex]?.altText || product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
              <ImageIcon className="h-12 w-12 stroke-[1.5]" />
              <span className="text-xs">Chưa có hình ảnh món ăn</span>
            </div>
          )}

          {/* Quick status overlays */}
          <div className="absolute top-3 left-3 flex gap-2">
            <StockStatusBadge status={currentData.stockStatus} />
            <InventoryTypeBadge type={currentData.inventoryType} />
          </div>
        </div>

        {/* Image thumbnails if more than 1 */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  activeImageIndex === idx
                    ? "border-indigo-600 ring-2 ring-indigo-500/30"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img.url} alt={img.altText} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Tags className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Danh mục món</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {currentData.categoryName || "Chưa phân loại"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Thương hiệu</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {currentData.brandName || "Thương hiệu nội bộ"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Đơn vị tính</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {currentData.unitSymbol || "Món / Phần"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Giá bán cơ bản</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatPrice(currentData.unitPrice, currentData.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Mô tả */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Mô tả món ăn
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed rounded-lg bg-white p-3 border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            {currentData.description || "Chưa có mô tả chi tiết cho món ăn này."}
          </p>
        </div>

        {/* Công thức chế biến (Recipes) nếu có */}
        {detail?.recipes && detail.recipes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              <span>Công thức định lượng & Chế biến ({detail.recipes.length})</span>
            </div>
            <div className="space-y-2">
              {detail.recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {recipe.productName}
                    </span>
                    {recipe.isPrimary && (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                        Công thức chính
                      </span>
                    )}
                  </div>
                  {recipe.instructions && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {recipe.instructions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {onUpdatePrice && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onUpdatePrice(product);
                }}
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400"
              >
                <DollarSign className="mr-1.5 h-4 w-4" />
                Chỉnh giá chi nhánh
              </Button>
            )}
            {onUpdateStock && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onUpdateStock(product);
                }}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400"
              >
                <Boxes className="mr-1.5 h-4 w-4" />
                Chỉnh tồn kho
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            {onEdit && (
              <Button
                onClick={() => {
                  onClose();
                  onEdit(product);
                }}
              >
                <Edit className="mr-1.5 h-4 w-4" />
                Chỉnh sửa món này
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
