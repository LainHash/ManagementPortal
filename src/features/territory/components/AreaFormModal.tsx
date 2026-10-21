import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  AreaResponse,
  BranchResponse,
  CreateAreaRequest,
  UpdateAreaRequest,
} from "@/types/territory.types";
import { Loader2, Save, MapPin } from "lucide-react";

interface AreaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  area: AreaResponse | null;
  branches: BranchResponse[];
  defaultBranchId?: string;
  onSave: (data: CreateAreaRequest | UpdateAreaRequest) => Promise<void>;
}

export function AreaFormModal({
  isOpen,
  onClose,
  area,
  branches,
  defaultBranchId,
  onSave,
}: AreaFormModalProps) {
  const isEdit = !!area;

  const [branchId, setBranchId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (area) {
      setBranchId(area.branchId || defaultBranchId || "");
      setName(area.name || "");
      setDescription(area.description || "");
      setDisplayOrder(area.displayOrder || 1);
      setIsActive(area.isActive ?? true);
    } else {
      setBranchId(defaultBranchId || (branches.length > 0 ? branches[0].id : ""));
      setName("");
      setDescription("");
      setDisplayOrder(1);
      setIsActive(true);
    }
    setError(null);
  }, [area, defaultBranchId, branches, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId) {
      setError("Vui lòng chọn chi nhánh cho khu vực.");
      return;
    }
    if (!name.trim()) {
      setError("Vui lòng nhập tên khu vực.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload: CreateAreaRequest | UpdateAreaRequest = {
        branchId,
        name: name.trim(),
        description: description.trim() || undefined,
        displayOrder: Number(displayOrder) || 1,
        ...(isEdit ? { isActive } : {}),
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể lưu thông tin khu vực."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Chỉnh sửa khu vực: ${area.name}` : "Thêm khu vực mới"}
      description={
        isEdit
          ? "Cập nhật tên, mô tả và thứ tự hiển thị của khu vực."
          : "Tạo khu vực bố trí bàn ăn mới trong chi nhánh (VD: Tầng 1, Sân vườn, VIP...)."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {error && (
          <div className="rounded-lg bg-rose-100 p-2.5 text-xs font-medium text-rose-800 dark:bg-rose-950 dark:text-rose-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Thuộc chi nhánh <span className="text-rose-500">*</span>
          </label>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            disabled={isEdit}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="">-- Chọn chi nhánh --</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.branchCode} - {b.address} ({b.city})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Tên khu vực <span className="text-rose-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Sảnh chính Tầng 1, Khu vực Sân vườn, Phòng VIP 01..."
            className="text-xs"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Mô tả khu vực
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả không gian, tầm nhìn, trang thiết bị của khu vực..."
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Thứ tự hiển thị
            </label>
            <Input
              type="number"
              min={1}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
              className="text-xs"
            />
          </div>

          {isEdit && (
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Kích hoạt khu vực (Active)
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="gap-1.5 bg-indigo-600 text-xs text-white hover:bg-indigo-700 shadow-xs"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {isEdit ? "Cập nhật khu vực" : "Tạo khu vực mới"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
