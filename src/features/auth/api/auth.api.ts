import axiosClient from "@/api/axiosClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { Result } from "@/api/types";
import type {
  AuthenticationResponse,
  LoginRequest,
  RefreshTokenRequest,
  UserDetailResponse,
} from "../types/auth.types";

export const authApi = {
  // Đăng nhập hệ thống
  login: async (body: LoginRequest): Promise<Result<AuthenticationResponse>> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, body);
  },

  // Lấy thông tin tài khoản hiện tại từ token / cookie
  getCurrentUser: async (): Promise<Result<UserDetailResponse>> => {
    return axiosClient.get(API_ENDPOINTS.AUTH.ME);
  },

  // Đăng xuất
  logout: async (refreshToken?: string): Promise<Result> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
  },

  // Làm mới token
  refreshToken: async (body: RefreshTokenRequest): Promise<Result<AuthenticationResponse>> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.REFRESH, body);
  },
};
