import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BranchStatus } from "@/types/enums";
import type {
  BranchResponse,
  CreateBranchRequest,
  UpdateBranchRequest,
} from "@/types/territory.types";
import { Building2, Loader2, Save } from "lucide-react";

interface BranchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: BranchResponse | null;
  onSave: (data: CreateBranchRequest | UpdateBranchRequest) => Promise<void>;
}

export function BranchFormModal({
  isOpen,
  onClose,
  branch,
  onSave,
}: BranchFormModalProps) {
  const isEdit = !!branch;

  const [city, setCity] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [openTime, setOpenTime] = useState<string>("08:00");
  const [closeTime, setCloseTime] = useState<string>("22:00");
  const [status, setStatus] = useState<BranchStatus>(BranchStatus.Active);
  const [latitude, setLatitude] = useState<number>(10.7769);
  const [longitude, setLongitude] = useState<number>(106.7009);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (branch) {
      setCity(branch.city || "");
      setPhoneNumber(branch.phoneNumber || "");
      setEmail(branch.email || "");
      setAddress(branch.address || "");
      setOpenTime(branch.openTime ? branch.openTime.slice(0, 5) : "08:00");
      setCloseTime(branch.closeTime ? branch.closeTime.slice(0, 5) : "22:00");
      setStatus(branch.status || BranchStatus.Active);
      setLatitude(branch.latitude || 10.7769);
      setLongitude(branch.longitude || 106.7009);
    } else {
      setCity("");
      setPhoneNumber("");
      setEmail("");
      setAddress("");
      setOpenTime("08:00");
      setCloseTime("22:00");
      setStatus(BranchStatus.Active);
      setLatitude(10.7769);
      setLongitude(106.7009);
    }
    setError(null);
  }, [branch, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !address.trim() || !phoneNumber.trim()) {
      setError("Vui lòng điền đầy đủ Tỉnh/Thành phố, Địa chỉ và Số điện thoại.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const formattedOpenTime =
        openTime.length === 5 ? `${openTime}:00` : openTime;
      const formattedCloseTime =
        closeTime.length === 5 ? `${closeTime}:00` : closeTime;

      const payload: CreateBranchRequest = {
        city: city.trim(),
        address: address.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        openTime: formattedOpenTime,
        closeTime: formattedCloseTime,
        status,
        latitude: Number(latitude) || 0,
        longitude: Number(longitude) || 0,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể lưu thông tin chi nhánh."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Chỉnh sửa chi nhánh #${branch.branchCode}` : "Thêm chi nhánh mới"}
      description={
        isEdit
          ? "Cập nhật địa chỉ, liên hệ và thời gian hoạt động của chi nhánh."
          : "Khởi tạo một chi nhánh nhà hàng mới vào hệ thống."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1 max-h-[70vh] overflow-y-auto pr-1">
        {error && (
          <div className="rounded-lg bg-rose-100 p-2.5 text-xs font-medium text-rose-800 dark:bg-rose-950 dark:text-rose-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tỉnh / Thành phố <span className="text-rose-500">*</span>
            </label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="VD: TP. Hồ Chí Minh, Hà Nội..."
              className="text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Số điện thoại <span className="text-rose-500">*</span>
            </label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="VD: 028 1234 5678"
              className="text-xs"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Địa chỉ cụ thể <span className="text-rose-500">*</span>
          </label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="VD: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1"
            className="text-xs"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Email liên hệ
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="chinhanh@restaurant.vn"
            className="text-xs"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Giờ mở cửa
            </label>
            <Input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Giờ đóng cửa
            </label>
            <Input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Trạng thái
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BranchStatus)}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value={BranchStatus.Active}>Đang hoạt động</option>
              <option value={BranchStatus.TemporarilyClosed}>Tạm đóng cửa</option>
              <option value={BranchStatus.Maintenance}>Đang bảo trì</option>
              <option value={BranchStatus.Inactive}>Ngừng khai thác</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Vĩ độ (Latitude)
            </label>
            <Input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kinh độ (Longitude)
            </label>
            <Input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
              className="text-xs"
            />
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
            {isEdit ? "Cập nhật chi nhánh" : "Tạo chi nhánh mới"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
