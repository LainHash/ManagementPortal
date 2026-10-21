import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableShape, TableStatus } from "@/types/enums";
import type {
  RestaurantTableResponse,
  AreaResponse,
  CreateRestaurantTableRequest,
  UpdateRestaurantTableRequest,
} from "@/types/territory.types";
import { Loader2, Save, Users } from "lucide-react";

interface TableFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: RestaurantTableResponse | null;
  areas: AreaResponse[];
  defaultAreaId?: string;
  onSave: (data: CreateRestaurantTableRequest | UpdateRestaurantTableRequest) => Promise<void>;
}

export function TableFormModal({
  isOpen,
  onClose,
  table,
  areas,
  defaultAreaId,
  onSave,
}: TableFormModalProps) {
  const isEdit = !!table;

  const [areaId, setAreaId] = useState<string>("");
  const [tableNumber, setTableNumber] = useState<string>("");
  const [capacity, setCapacity] = useState<number>(4);
  const [shape, setShape] = useState<TableShape>(TableShape.Square);
  const [status, setStatus] = useState<TableStatus>(TableStatus.Available);
  const [positionX, setPositionX] = useState<number>(0);
  const [positionY, setPositionY] = useState<number>(0);
  const [width, setWidth] = useState<number>(80);
  const [height, setHeight] = useState<number>(80);
  const [rotation, setRotation] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (table) {
      setAreaId(table.areaId || defaultAreaId || "");
      setTableNumber(table.tableNumber || "");
      setCapacity(table.capacity || 4);
      setShape(table.shape || TableShape.Square);
      setStatus(table.status || TableStatus.Available);
      setPositionX(table.positionX || 0);
      setPositionY(table.positionY || 0);
      setWidth(table.width || 80);
      setHeight(table.height || 80);
      setRotation(table.rotation || 0);
    } else {
      setAreaId(defaultAreaId || (areas.length > 0 ? areas[0].id : ""));
      setTableNumber("");
      setCapacity(4);
      setShape(TableShape.Square);
      setStatus(TableStatus.Available);
      setPositionX(0);
      setPositionY(0);
      setWidth(80);
      setHeight(80);
      setRotation(0);
    }
    setError(null);
  }, [table, defaultAreaId, areas, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaId) {
      setError("Vui lòng chọn khu vực đặt bàn.");
      return;
    }
    if (!tableNumber.trim()) {
      setError("Vui lòng nhập mã / số hiệu bàn.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload: CreateRestaurantTableRequest | UpdateRestaurantTableRequest = {
        areaId,
        tableNumber: tableNumber.trim(),
        capacity: Number(capacity) || 1,
        shape,
        status,
        positionX: Number(positionX) || 0,
        positionY: Number(positionY) || 0,
        width: Number(width) || 80,
        height: Number(height) || 80,
        rotation: Number(rotation) || 0,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể lưu thông tin bàn ăn."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Chỉnh sửa bàn: #${table.tableNumber}` : "Thêm bàn ăn mới"}
      description={
        isEdit
          ? "Cập nhật số hiệu bàn, sức chứa, kiểu dáng và vị trí bàn."
          : "Tạo bàn ăn mới trong khu vực được chọn của nhà hàng."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1 max-h-[70vh] overflow-y-auto pr-1">
        {error && (
          <div className="rounded-lg bg-rose-100 p-2.5 text-xs font-medium text-rose-800 dark:bg-rose-950 dark:text-rose-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Khu vực đặt bàn <span className="text-rose-500">*</span>
          </label>
          <select
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="">-- Chọn khu vực --</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Số / Mã bàn <span className="text-rose-500">*</span>
            </label>
            <Input
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="VD: T01, B12, VIP-01..."
              className="text-xs font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sức chứa (Số khách) <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              min={1}
              max={100}
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
              className="text-xs"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kiểu dáng bàn
            </label>
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value as TableShape)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value={TableShape.Square}>Bàn vuông (Square)</option>
              <option value={TableShape.Rectangle}>Bàn chữ nhật (Rectangle)</option>
              <option value={TableShape.Round}>Bàn tròn (Round)</option>
              <option value={TableShape.Long}>Bàn dài dãy (Long)</option>
              <option value={TableShape.Other}>Kiểu khác (Other)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Trạng thái bàn
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TableStatus)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value={TableStatus.Available}>Bàn trống (Available)</option>
              <option value={TableStatus.Occupied}>Đang có khách (Occupied)</option>
              <option value={TableStatus.Maintenance}>Bảo trì (Maintenance)</option>
              <option value={TableStatus.Inactive}>Ngừng khai thác (Inactive)</option>
            </select>
          </div>
        </div>

        {/* Layout coordinates & dimensions */}
        <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
            Tọa độ & Kích thước trên sơ đồ (Layout Floorplan)
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div>
              <label className="text-[10px] text-slate-500">Tọa độ X</label>
              <Input
                type="number"
                value={positionX}
                onChange={(e) => setPositionX(parseInt(e.target.value) || 0)}
                className="text-xs h-7"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500">Tọa độ Y</label>
              <Input
                type="number"
                value={positionY}
                onChange={(e) => setPositionY(parseInt(e.target.value) || 0)}
                className="text-xs h-7"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500">Rộng (px)</label>
              <Input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 80)}
                className="text-xs h-7"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500">Dài (px)</label>
              <Input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 80)}
                className="text-xs h-7"
              />
            </div>
          </div>
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
            {isEdit ? "Cập nhật bàn" : "Tạo bàn ăn mới"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
