import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  BrandResponse,
  CreateBrandRequest,
  UpdateBrandRequest,
} from "@/types/catalog.types";
import { AlertCircle, Layers } from "lucide-react";

interface BrandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBrandRequest | UpdateBrandRequest, id?: string) => Promise<void>;
  initialData?: BrandResponse | null;
  isLoading?: boolean;
}

export function BrandFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: BrandFormModalProps) {
  const isEdit = Boolean(initialData);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || "");
        setDescription(initialData.description || "");
      } else {
        setName("");
        setDescription("");
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Vui lòng nhập tên thương hiệu.");
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
      };

      if (isEdit && initialData) {
        await onSubmit(payload, initialData.id);
      } else {
        await onSubmit(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Đã xảy ra lỗi khi lưu thương hiệu.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-indigo-600" />
          <span>{isEdit ? "Chỉnh sửa thương hiệu" : "Thêm mới thương hiệu"}</span>
        </div>
      }
      description={
        isEdit
          ? "Cập nhật thông tin nhận diện thương hiệu trong chuỗi nhà hàng"
          : "Đăng ký thương hiệu ẩm thực hoặc nhãn hàng thành viên mới"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
            Tên thương hiệu <span className="text-red-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Golden Lotus Bistro, Zen Tea House..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
            Mô tả thương hiệu / Định vị
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Phong cách ẩm thực, định vị phân khúc khách hàng..."
            className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy bỏ
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? "Cập nhật" : "Tạo thương hiệu"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
