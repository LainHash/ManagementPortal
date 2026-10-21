import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  IngredientResponse,
  IngredientCategoryResponse,
  CreateIngredientRequest,
  UpdateIngredientRequest,
} from "@/types/inventory.types";
import type { BrandResponse, UnitResponse } from "@/types/catalog.types";
import { AlertCircle, Wheat, Loader2, Save } from "lucide-react";

interface IngredientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateIngredientRequest | UpdateIngredientRequest, id?: string) => Promise<void>;
  initialData?: IngredientResponse | null;
  categories: IngredientCategoryResponse[];
  brands: BrandResponse[];
  units: UnitResponse[];
  isLoading?: boolean;
}

export function IngredientFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
  brands,
  units,
  isLoading = false,
}: IngredientFormModalProps) {
  const isEdit = Boolean(initialData);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryPublicId, setCategoryPublicId] = useState("");
  const [unitPublicId, setUnitPublicId] = useState("");
  const [brandPublicId, setBrandPublicId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || "");
        setDescription(initialData.description || "");

        // Find matching category ID by ID or Name
        const matchedCat = categories.find(
          (c) => c.id === initialData.categoryPublicId || c.name === initialData.categoryName
        );
        setCategoryPublicId(matchedCat ? matchedCat.id : categories[0]?.id || "");

        // Find matching unit ID by ID or Symbol/Name
        const matchedUnit = units.find(
          (u) =>
            u.id === initialData.unitPublicId ||
            u.symbol === initialData.unitSymbol ||
            u.name === initialData.unitName
        );
        setUnitPublicId(matchedUnit ? matchedUnit.id : units[0]?.id || "");

        // Find matching brand ID
        const matchedBrand = brands.find(
          (b) => b.id === initialData.brandPublicId || b.name === initialData.brandName
        );
        setBrandPublicId(matchedBrand ? matchedBrand.id : "");
      } else {
        setName("");
        setDescription("");
        setCategoryPublicId(categories[0]?.id || "");
        setUnitPublicId(units[0]?.id || "");
        setBrandPublicId("");
      }
      setError(null);
    }
  }, [isOpen, initialData, categories, brands, units]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Vui lòng nhập tên nguyên liệu.");
      return;
    }

    if (!categoryPublicId) {
      setError("Vui lòng chọn danh mục cho nguyên liệu.");
      return;
    }

    if (!unitPublicId) {
      setError("Vui lòng chọn đơn vị tính.");
      return;
    }

    try {
      if (isEdit && initialData) {
        const payload: UpdateIngredientRequest = {
          name: name.trim(),
          description: description.trim() || null,
          categoryPublicId,
          unitPublicId,
          brandPublicId: brandPublicId || null,
        };
        await onSubmit(payload, initialData.id);
      } else {
        const payload: CreateIngredientRequest = {
          name: name.trim(),
          description: description.trim() || null,
          categoryPublicId,
          unitPublicId,
          brandPublicId: brandPublicId || null,
        };
        await onSubmit(payload);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Có lỗi xảy ra khi lưu nguyên liệu. Vui lòng thử lại."
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Wheat className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isEdit ? "Cập nhật nguyên liệu" : "Thêm nguyên liệu mới"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEdit
                ? `Chỉnh sửa thông tin nguyên liệu "${initialData?.name}"`
                : "Điền thông tin để tạo nguyên liệu trong hệ thống kho"}
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tên nguyên liệu */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Tên nguyên liệu <span className="text-rose-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Bột mì hoa ngọc lan, Thịt bò Úc, Sữa tươi tiệt trùng..."
            required
            className="text-sm font-medium"
          />
        </div>

        {/* Danh mục & Đơn vị tính */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Danh mục nguyên liệu <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryPublicId}
              onChange={(e) => setCategoryPublicId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              required
            >
              {categories.length === 0 ? (
                <option value="">Không có danh mục nào</option>
              ) : (
                categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Đơn vị tính (Unit) <span className="text-rose-500">*</span>
            </label>
            <select
              value={unitPublicId}
              onChange={(e) => setUnitPublicId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              required
            >
              {units.length === 0 ? (
                <option value="">Không có đơn vị nào</option>
              ) : (
                units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Thương hiệu / Nhà cung cấp (tùy chọn) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Thương hiệu / Nhà cung cấp (Tùy chọn)
          </label>
          <select
            value={brandPublicId}
            onChange={(e) => setBrandPublicId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="">-- Không chọn thương hiệu --</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mô tả chi tiết */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Mô tả chi tiết nguyên liệu
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ghi chú về xuất xứ, tiêu chuẩn bảo quản, hạn dùng khuyến nghị..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEdit ? "Cập nhật" : "Tạo nguyên liệu"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
