import axiosClient from "@/api/axiosClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { PaginationResult, Result } from "@/types/common.types";
import type {
  UserResponse,
  UserDetailResponse,
  RoleResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  UpdateUserRoleRequest,
  AdminResetPasswordRequest,
  UserQueryParams,
} from "@/types/identity.types";

export const usersApi = {
  // Lấy danh sách người dùng phân trang & tìm kiếm
  getAll: async (
    params?: UserQueryParams
  ): Promise<PaginationResult<UserResponse>> => {
    return axiosClient.get(API_ENDPOINTS.USERS.LIST, {
      params,
    }) as unknown as Promise<PaginationResult<UserResponse>>;
  },

  // Lấy danh sách vai trò hệ thống
  getRoles: async (): Promise<Result<RoleResponse[]>> => {
    return axiosClient.get(
      API_ENDPOINTS.USERS.ROLES
    ) as unknown as Promise<Result<RoleResponse[]>>;
  },

  // Xem chi tiết tài khoản & hồ sơ
  getById: async (id: string): Promise<Result<UserDetailResponse>> => {
    return axiosClient.get(
      API_ENDPOINTS.USERS.DETAIL(id)
    ) as unknown as Promise<Result<UserDetailResponse>>;
  },

  // Tạo tài khoản mới (Admin / Staff)
  create: async (body: CreateUserRequest): Promise<Result<UserResponse>> => {
    return axiosClient.post(
      API_ENDPOINTS.USERS.CREATE,
      body
    ) as unknown as Promise<Result<UserResponse>>;
  },

  // Cập nhật thông tin tài khoản
  update: async (
    id: string,
    body: UpdateUserRequest
  ): Promise<Result<UserResponse>> => {
    return axiosClient.put(
      API_ENDPOINTS.USERS.UPDATE(id),
      body
    ) as unknown as Promise<Result<UserResponse>>;
  },

  // Cập nhật trạng thái kích hoạt / khoá
  updateStatus: async (
    id: string,
    body: UpdateUserStatusRequest
  ): Promise<Result> => {
    return axiosClient.patch(
      API_ENDPOINTS.USERS.UPDATE_STATUS(id),
      body
    ) as unknown as Promise<Result>;
  },

  // Cập nhật vai trò tài khoản
  updateRole: async (
    id: string,
    body: UpdateUserRoleRequest
  ): Promise<Result> => {
    return axiosClient.patch(
      API_ENDPOINTS.USERS.UPDATE_ROLE(id),
      body
    ) as unknown as Promise<Result>;
  },

  // Đặt lại mật khẩu từ quản trị viên
  resetPassword: async (
    id: string,
    body: AdminResetPasswordRequest
  ): Promise<Result> => {
    return axiosClient.post(
      API_ENDPOINTS.USERS.RESET_PASSWORD(id),
      body
    ) as unknown as Promise<Result>;
  },

  // Xoá mềm tài khoản
  delete: async (id: string): Promise<Result> => {
    return axiosClient.delete(
      API_ENDPOINTS.USERS.DELETE(id)
    ) as unknown as Promise<Result>;
  },

  // Khôi phục tài khoản đã xoá mềm
  restore: async (id: string): Promise<Result> => {
    return axiosClient.patch(
      API_ENDPOINTS.USERS.RESTORE(id)
    ) as unknown as Promise<Result>;
  },
};
