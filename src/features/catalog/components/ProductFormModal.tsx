import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InventoryType } from "@/types/enums";
import type {
  ProductResponse,
  ProductCategoryResponse,
  BrandResponse,
  UnitResponse,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/types/catalog.types";
import { AlertCircle, ChefHat, Package } from "lucide-react";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductRequest | UpdateProductRequest, id?: string) => Promise<void>;
  initialData?: ProductResponse | null;
  categories: ProductCategoryResponse[];
  brands: BrandResponse[];
  units: UnitResponse[];
  isLoading?: boolean;
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
  brands,
  units,
  isLoading = false,
}: ProductFormModalProps) {
  const isEdit = Boolean(initialData);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [inventoryType, setInventoryType] = useState<InventoryType>(InventoryType.MadeToOrder);
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Sync state when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || "");
        setDescription(initialData.description || "");
        setInventoryType(initialData.inventoryType || InventoryType.MadeToOrder);

        // Find matching category ID by name if not directly an ID
        const matchedCat = categories.find((c) => c.name === initialData.categoryName || c.id === (initialData as any).categoryId);
        setCategoryId(matchedCat ? matchedCat.id : categories[0]?.id || "");

        // Find matching brand ID by name
        const matchedBrand = brands.find((b) => b.name === initialData.brandName || b.id === (initialData as any).brandId);
        setBrandId(matchedBrand ? matchedBrand.id : "");

        // Find matching unit ID by symbol or name
        const matchedUnit = units.find((u) => u.symbol === initialData.unitSymbol || u.name === initialData.unitSymbol || u.id === (initialData as any).unitId);
        setUnitId(matchedUnit ? matchedUnit.id : units[0]?.id || "");
      } else {
        setName("");
        setDescription("");
        setInventoryType(InventoryType.MadeToOrder);
        setCategoryId(categories[0]?.id || "");
        setBrandId("");
        setUnitId(units[0]?.id || "");
      }
      setError(null);
    }
  }, [isOpen, initialData, categories, brands, units]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Vui lòng nhập tên món ăn/sản phẩm.");
      return;
    }

    if (!categoryId) {
      setError("Vui lòng chọn danh mục cho món ăn.");
      return;
    }

    if (!unitId) {
      setError("Vui lòng chọn đơn vị tính.");
      return;
    }

    try {
      if (isEdit && initialData) {
        const payload: UpdateProductRequest = {
          name: name.trim(),
          description: description.trim() || null,
          categoryPublicId: categoryId,
          brandPublicId: brandId || null,
          unitPublicId: unitId,
        };
        await onSubmit(payload, initialData.id);
      } else {
        const payload: CreateProductRequest = {
          name: name.trim(),
          description: description.trim() || null,
          inventoryType,
          categoryPublicId: categoryId,
          brandPublicId: brandId || null,
          unitPublicId: unitId,
        };
        await onSubmit(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Đã xảy ra lỗi khi lưu thông tin.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={isEdit ? "Chỉnh sửa món ăn / sản phẩm" : "Thêm mới món ăn / thực đơn"}
      description={
        isEdit
          ? "Cập nhật thông tin chi tiết của món ăn trong thực đơn"
          : "Điền đầy đủ thông tin để thêm món mới vào hệ thống quản lý"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tên món */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
            Tên món ăn / sản phẩm <span className="text-red-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Bò Bít Tết Sốt Tiêu Đen, Trà Đào Cam Sả..."
            required
          />
        </div>

        {/* Grid: Danh mục & Thương hiệu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Danh mục món <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              required
            >
              <option value="" disabled>-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Thương hiệu (Brand)
            </label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">-- Không phân thương hiệu --</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid: Đơn vị tính & Loại quản lý */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Đơn vị tính <span className="text-red-500">*</span>
            </label>
            <select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              required
            >
              <option value="" disabled>-- Chọn đơn vị tính --</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Phương thức kiểm kê
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => !isEdit && setInventoryType(InventoryType.MadeToOrder)}
                disabled={isEdit}
                className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition-colors ${
                  inventoryType === InventoryType.MadeToOrder
                    ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                } ${isEdit ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <ChefHat className="h-4 w-4" />
                Chế biến gọi món
              </button>
              <button
                type="button"
                onClick={() => !isEdit && setInventoryType(InventoryType.StockTracked)}
                disabled={isEdit}
                className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition-colors ${
                  inventoryType === InventoryType.StockTracked
                    ? "border-sky-600 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                } ${isEdit ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <Package className="h-4 w-4" />
                Theo dõi tồn kho
              </button>
            </div>
            {isEdit && (
              <p className="mt-1 text-[11px] text-slate-400">
                Phương thức kiểm kê được giữ nguyên sau khi tạo
              </p>
            )}
          </div>
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
            Mô tả chi tiết / Thành phần
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Mô tả hương vị, nguyên liệu đặc biệt hoặc ghi chú phục vụ..."
            className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy bỏ
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? "Lưu thay đổi" : "Tạo món mới"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
