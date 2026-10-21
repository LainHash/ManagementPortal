import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Mail,
  Lock,
  Shield,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import type {
  UserResponse,
  UserDetailResponse,
  RoleResponse,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/types/identity.types";
import { usersApi } from "../api/users.api";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  userToEdit?: UserResponse | null;
  roles: RoleResponse[];
}

export function UserFormModal({
  isOpen,
  onClose,
  onSuccess,
  userToEdit,
  roles,
}: UserFormModalProps) {
  const isEdit = Boolean(userToEdit);

  // Active Tab: 'account' | 'profile'
  const [activeTab, setActiveTab] = useState<"account" | "profile">("account");

  // Account State
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [roleId, setRoleId] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Personal Profile State
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [gender, setGender] = useState<boolean>(true);
  const [citizenCardId, setCitizenCardId] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [country, setCountry] = useState<string>("Việt Nam");

  // UI State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize or fetch details on open
  useEffect(() => {
    if (!isOpen) {
      setErrorMsg(null);
      setActiveTab("account");
      return;
    }

    if (userToEdit) {
      setUserName(userToEdit.userName || "");
      setEmail(userToEdit.email || "");
      setPassword("");
      setRoleId(userToEdit.roleId || (roles[0]?.id ?? 1));
      setIsActive(userToEdit.isActive ?? true);
      setPhone(userToEdit.phone || "");

      // Split full name if present
      if (userToEdit.fullName) {
        const parts = userToEdit.fullName.trim().split(" ");
        if (parts.length > 1) {
          setFirstName(parts.slice(0, -1).join(" "));
          setLastName(parts[parts.length - 1]);
        } else {
          setFirstName(userToEdit.fullName);
          setLastName("");
        }
      }

      // Fetch full details if needed
      usersApi
        .getById(userToEdit.id)
        .then((res) => {
          if (res?.isSucceed && res.data?.personalProfile) {
            const p = res.data.personalProfile;
            setFirstName(p.firstName || "");
            setLastName(p.lastName || "");
            setPhone(p.phone || "");
            setDateOfBirth(p.dateOfBirth || "");
            setGender(p.gender ?? true);
            setCitizenCardId(p.citizenCardId || "");
            setAddress(p.address || "");
            setCity(p.city || "");
            setCountry(p.country || "Việt Nam");
          }
        })
        .catch(() => {});
    } else {
      // Create mode defaults
      setUserName("");
      setEmail("");
      setPassword("");
      setRoleId(roles.find((r) => r.name.toLowerCase() === "employee")?.id || roles[0]?.id || 1);
      setIsActive(true);
      setFirstName("");
      setLastName("");
      setPhone("");
      setDateOfBirth("");
      setGender(true);
      setCitizenCardId("");
      setAddress("");
      setCity("");
      setCountry("Việt Nam");
    }
  }, [isOpen, userToEdit, roles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic validation
    if (!userName.trim() || userName.trim().length < 3) {
      setErrorMsg("Tên đăng nhập phải có ít nhất 3 ký tự.");
      setActiveTab("account");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Email không đúng định dạng.");
      setActiveTab("account");
      return;
    }

    if (!isEdit && (!password || password.length < 6)) {
      setErrorMsg("Mật khẩu khởi tạo phải từ 6 ký tự trở lên.");
      setActiveTab("account");
      return;
    }

    if (!roleId) {
      setErrorMsg("Vui lòng chọn vai trò cho người dùng.");
      setActiveTab("account");
      return;
    }

    setIsLoading(true);

    try {
      if (isEdit && userToEdit) {
        const body: UpdateUserRequest = {
          userName: userName.trim(),
          email: email.trim(),
          roleId: Number(roleId),
          isActive,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          phone: phone.trim() || undefined,
          dateOfBirth: dateOfBirth || undefined,
          gender,
          citizenCardId: citizenCardId.trim() || undefined,
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          country: country.trim() || undefined,
        };

        const res = await usersApi.update(userToEdit.id, body);
        if (res.isSucceed) {
          onSuccess("Cập nhật thông tin người dùng thành công!");
          onClose();
        } else {
          setErrorMsg(res.message || "Không thể cập nhật người dùng.");
        }
      } else {
        const body: CreateUserRequest = {
          userName: userName.trim(),
          email: email.trim(),
          password,
          roleId: Number(roleId),
          isActive,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          phone: phone.trim() || undefined,
          dateOfBirth: dateOfBirth || undefined,
          gender,
          citizenCardId: citizenCardId.trim() || undefined,
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          country: country.trim() || undefined,
        };

        const res = await usersApi.create(body);
        if (res.isSucceed) {
          onSuccess("Khởi tạo tài khoản người dùng mới thành công!");
          onClose();
        } else {
          setErrorMsg(res.message || "Không thể khởi tạo người dùng.");
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMsg(
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi lưu người dùng."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEdit ? "Cập Nhật Tài Khoản Người Dùng" : "Tạo Mới Tài Khoản Người Dùng"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEdit
                ? "Chỉnh sửa thông tin đăng nhập, vai trò và hồ sơ cá nhân"
                : "Cung cấp thông tin truy cập hệ thống và hồ sơ nhân sự"}
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 text-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
          <button
            type="button"
            id="tab-account-btn"
            onClick={() => setActiveTab("account")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "account"
                ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-indigo-300"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Thông tin đăng nhập</span>
          </button>
          <button
            type="button"
            id="tab-profile-btn"
            onClick={() => setActiveTab("profile")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "profile"
                ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-indigo-300"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Hồ sơ cá nhân & Liên hệ</span>
          </button>
        </div>

        {/* TAB 1: Account Information */}
        {activeTab === "account" && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên đăng nhập (Username) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="user-username-input"
                    type="text"
                    required
                    placeholder="vd: manager_hoankiem"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Địa chỉ Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="user-email-input"
                    type="email"
                    required
                    placeholder="vd: staff@restaurant.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Password Field (Only on Create or Optional Info on Edit) */}
            {!isEdit ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mật khẩu khởi tạo <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="user-password-input"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Mật khẩu được lưu trữ dưới dạng mã hoá băm an toàn (BCrypt).</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  Dùng chức năng "Đặt lại mật khẩu" nếu cần đổi.
                </span>
              </div>
            )}

            {/* Role & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Vai trò hệ thống <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <select
                    id="user-role-select"
                    value={roleId}
                    onChange={(e) => setRoleId(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} {r.description ? `— ${r.description}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Trạng thái tài khoản
                </label>
                <div className="flex items-center gap-3 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <input
                    id="user-isactive-checkbox"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="user-isactive-checkbox"
                    className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    {isActive ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Kích hoạt (Cho phép đăng nhập)
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">
                        Khoá tài khoản (Vô hiệu hoá)
                      </span>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Personal Profile & Contact */}
        {activeTab === "profile" && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Họ & Tên đệm
                </label>
                <Input
                  id="user-firstname-input"
                  type="text"
                  placeholder="vd: Nguyễn Văn"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên
                </label>
                <Input
                  id="user-lastname-input"
                  type="text"
                  placeholder="vd: An"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="user-phone-input"
                    type="tel"
                    placeholder="0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ngày sinh
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="user-dob-input"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Giới tính
                </label>
                <select
                  id="user-gender-select"
                  value={gender ? "true" : "false"}
                  onChange={(e) => setGender(e.target.value === "true")}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="true">Nam</option>
                  <option value="false">Nữ</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Số CCCD / CMND
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="user-citizen-input"
                    type="text"
                    placeholder="001200000000"
                    value={citizenCardId}
                    onChange={(e) => setCitizenCardId(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tỉnh / Thành phố
                </label>
                <Input
                  id="user-city-input"
                  type="text"
                  placeholder="vd: Hà Nội, TP.HCM"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Địa chỉ chi tiết (Thường trú / Tạm trú)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="user-address-input"
                  type="text"
                  placeholder="vd: Số 123 Đường Cầu Giấy, Phường Quan Hoa"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            id="user-cancel-btn"
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Huỷ bỏ
          </Button>
          <Button
            id="user-submit-btn"
            type="submit"
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang lưu...
              </span>
            ) : isEdit ? (
              "Lưu thay đổi"
            ) : (
              "Tạo tài khoản"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
