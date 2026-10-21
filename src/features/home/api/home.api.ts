import axiosClient from "@/api/axiosClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { Result } from "@/api/types";
import type { HomeResponse } from "@/types/general.types";

// Type alias giữ tương thích ngược với code cũ, ánh xạ chuẩn tới HomeResponse
export type HomeOverviewData = HomeResponse;

export interface GetHomeOverviewParams {
  branchId?: string;
  productLimit?: number;
}

export const homeApi = {
  // Lấy dữ liệu tổng quan trang chủ từ RestaurantService (/home hoặc /api/home)
  getHomeOverview: async (params?: GetHomeOverviewParams): Promise<Result<HomeResponse>> => {
    return axiosClient.get(API_ENDPOINTS.GENERAL.HOME, {
      params: {
        productLimit: params?.productLimit ?? 1000,
        branchId: params?.branchId || undefined,
      },
    });
  },
};
