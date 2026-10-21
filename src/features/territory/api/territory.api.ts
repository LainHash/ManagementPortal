import axiosClient from "@/api/axiosClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { PaginationQuery, PaginationResult, Result } from "@/types/common.types";
import type { BranchResponse, BranchDetailResponse } from "@/types/territory.types";
import { homeApi } from "@/features/home/api/home.api";

export const territoryApi = {
  branches: {
    getAll: async (params?: PaginationQuery): Promise<PaginationResult<BranchResponse>> => {
      try {
        const res = await axiosClient.get(API_ENDPOINTS.TERRITORY.BRANCHES, { params });
        return res as unknown as PaginationResult<BranchResponse>;
      } catch (err) {
        // Fallback to home API overview data if direct territory endpoint fails
        try {
          const home = await homeApi.getHomeOverview();
          if (home?.data?.branches) {
            return {
              isSucceed: true,
              message: "Success",
              statusCode: 200,
              data: home.data.branches,
              totalItems: home.data.branches.length,
              indexPage: 1,
              pageSize: home.data.branches.length,
              totalPages: 1,
            };
          }
        } catch {
          // ignore fallback error
        }
        throw err;
      }
    },
    getById: async (id: string): Promise<Result<BranchDetailResponse>> => {
      return axiosClient.get(API_ENDPOINTS.TERRITORY.BRANCH_DETAIL(id));
    },
  },
};
