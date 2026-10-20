import axiosClient from "@/api/axiosClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { Result } from "@/api/types";

export interface HomeOverviewData {
  products: Array<{
    id: string;
    name: string;
    description?: string;
    categoryName: string;
    unitPrice?: number;
    currency?: string;
    stockStatus?: string;
  }>;
  brands: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  productCategories: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  branches: Array<{
    id: string;
    name: string;
    address?: string;
    phoneNumber?: string;
  }>;
}

export const homeApi = {
  // Lấy dữ liệu tổng quan trang chủ từ RestaurantService (/home hoặc /api/home)
  getHomeOverview: async (): Promise<Result<HomeOverviewData>> => {
    return axiosClient.get(API_ENDPOINTS.GENERAL.HOME, {
      params: { productLimit: 1000 },
    });
  },
};
