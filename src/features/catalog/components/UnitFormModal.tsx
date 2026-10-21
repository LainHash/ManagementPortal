import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UnitType } from "@/types/enums";
import type {
  UnitResponse,
  CreateUnitRequest,
  UpdateUnitRequest,
} from "@/types/catalog.types";
import { AlertCircle, Scale, Beaker, Hash } from "lucide-react";

interface UnitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUnitRequest | UpdateUnitRequest, id?: string) => Promise<void>;
  initialData?: UnitResponse | null;
  units?: UnitResponse[];
  isLoading?: boolean;
}

export function UnitFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  units = [],
  isLoading = false,
}: UnitFormModalProps) {
  const isEdit = Boolean(initialData);

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState<UnitType>(UnitType.Quantity);
  const [conversionRate, setConversionRate] = useState<number>(1);
  const [parentId, setParentId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || "");
        setSymbol(initialData.symbol || "");
        setType(initialData.type || UnitType.Quantity);
        setConversionRate(initialData.conversionRate ?? 1);
        setParentId("");
      } else {
        setName("");
        setSymbol("");
        setType(UnitType.Quantity);
        setConversionRate(1);
        setParentId("");
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Vui lòng nhập tên đơn vị tính.");
      return;
    }

    if (!symbol.trim()) {
      setError("Vui lòng nhập ký hiệu đơn vị (ví dụ: kg, g, l, chai, đĩa).");
      return;
    }

    if (conversionRate <= 0) {
      setError("Hệ số quy đổi phải lớn hơn 0.");
      return;
    }

    try {
      const payload: CreateUnitRequest = {
        name: name.trim(),
        symbol: symbol.trim(),
        type,
        conversionRate,
        parentPublicId: parentId || null,
      };

      if (isEdit && initialData) {
        await onSubmit(payload, initialData.id);
      } else {
        await onSubmit(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Đã xảy ra lỗi khi lưu đơn vị tính.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-indigo-600" />
          <span>{isEdit ? "Chỉnh sửa đơn vị tính" : "Thêm mới đơn vị tính"}</span>
        </div>
      }
      description={
        isEdit
          ? "Cập nhật tên, ký hiệu và hệ số quy đổi đơn vị đo lường"
          : "Tạo đơn vị đo lường cho thực đơn, pha chế và quản lý kho định lượng"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Tên đơn vị <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Kilogram, Phần..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Ký hiệu hiển thị <span className="text-red-500">*</span>
            </label>
            <Input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Ví dụ: kg, ly, suất..."
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
            Loại đại lượng đo lường
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setType(UnitType.Quantity)}
              className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium cursor-pointer transition-colors ${
                type === UnitType.Quantity
                  ? "border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              <Hash className="h-4 w-4" />
              Số lượng
            </button>
            <button
              type="button"
              onClick={() => setType(UnitType.Weight)}
              className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium cursor-pointer transition-colors ${
                type === UnitType.Weight
                  ? "border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              <Scale className="h-4 w-4" />
              Khối lượng
            </button>
            <button
              type="button"
              onClick={() => setType(UnitType.Volume)}
              className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium cursor-pointer transition-colors ${
                type === UnitType.Volume
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              <Beaker className="h-4 w-4" />
              Thể tích
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Hệ số quy đổi chuẩn
            </label>
            <Input
              type="number"
              step="any"
              min="0.0001"
              value={conversionRate}
              onChange={(e) => setConversionRate(parseFloat(e.target.value) || 1)}
              required
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Ví dụ: 1 kg = 1000 g (hệ số 1000)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Đơn vị gốc (nếu quy đổi)
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">-- Đơn vị độc lập / Gốc --</option>
              {units
                .filter((u) => u.id !== initialData?.id)
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy bỏ
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? "Cập nhật" : "Tạo đơn vị"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
