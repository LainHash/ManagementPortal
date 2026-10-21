import axiosClient from "@/api/axiosClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { PaginationQuery, PaginationResult, Result } from "@/types/common.types";
import type {
  BranchResponse,
  BranchDetailResponse,
  CreateBranchRequest,
  UpdateBranchRequest,
  DeactivateBranchRequest,
  ReactivateBranchRequest,
  BranchDeactivationHistoryResponse,
  BranchMaintenanceResponse,
  CreateBranchMaintenanceRequest,
  AreaResponse,
  AreaDetailResponse,
  CreateAreaRequest,
  UpdateAreaRequest,
  DeactivateAreaRequest,
  ReactivateAreaRequest,
  AreaDeactivationHistoryResponse,
  AreaMaintenanceResponse,
  CreateAreaMaintenanceRequest,
  RestaurantTableResponse,
  RestaurantTableMinimalResponse,
  CreateRestaurantTableRequest,
  UpdateRestaurantTableRequest,
  DeactivateTableRequest,
  ReactivateTableRequest,
  TableDeactivationHistoryResponse,
  TableMaintenanceResponse,
  CreateTableMaintenanceRequest,
} from "@/types/territory.types";
import type { MaintenanceStatus } from "@/types/enums";
import { homeApi } from "@/features/home/api/home.api";

export interface GetAllAreasParams extends PaginationQuery {
  branchId?: string;
  branchCode?: string;
}

export interface GetAllTablesParams extends PaginationQuery {
  branchId?: string;
  areaId?: string;
}

export interface GetMaintenanceParams extends PaginationQuery {
  status?: MaintenanceStatus;
  fromDate?: string;
  toDate?: string;
}

export const territoryApi = {
  // ==========================================================================
  // Branches
  // ==========================================================================
  branches: {
    getAll: async (
      params?: PaginationQuery
    ): Promise<PaginationResult<BranchResponse>> => {
      try {
        const res = await axiosClient.get(API_ENDPOINTS.TERRITORY.BRANCHES, {
          params,
        });
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

    create: async (body: CreateBranchRequest): Promise<Result<BranchResponse>> => {
      return axiosClient.post(API_ENDPOINTS.TERRITORY.BRANCHES, body);
    },

    update: async (
      id: string,
      body: UpdateBranchRequest
    ): Promise<Result<BranchResponse>> => {
      return axiosClient.put(API_ENDPOINTS.TERRITORY.BRANCH_DETAIL(id), body);
    },

    delete: async (id: string): Promise<Result<void>> => {
      return axiosClient.delete(API_ENDPOINTS.TERRITORY.BRANCH_DETAIL(id));
    },

    restore: async (id: string): Promise<Result<void>> => {
      return axiosClient.patch(API_ENDPOINTS.TERRITORY.BRANCH_RESTORE(id));
    },

    closeTemporarily: async (id: string): Promise<Result<void>> => {
      return axiosClient.post(
        API_ENDPOINTS.TERRITORY.BRANCH_CLOSE_TEMPORARILY(id)
      );
    },

    reopen: async (id: string): Promise<Result<void>> => {
      return axiosClient.post(API_ENDPOINTS.TERRITORY.BRANCH_REOPEN(id));
    },

    deactivate: async (
      id: string,
      body: DeactivateBranchRequest
    ): Promise<Result<void>> => {
      return axiosClient.post(API_ENDPOINTS.TERRITORY.BRANCH_DEACTIVATE(id), body);
    },

    reactivate: async (
      id: string,
      body?: ReactivateBranchRequest
    ): Promise<Result<void>> => {
      return axiosClient.post(
        API_ENDPOINTS.TERRITORY.BRANCH_REACTIVATE(id),
        body || {}
      );
    },

    getDeactivationHistory: async (
      id: string
    ): Promise<Result<BranchDeactivationHistoryResponse[]>> => {
      return axiosClient.get(
        API_ENDPOINTS.TERRITORY.BRANCH_DEACTIVATION_HISTORY(id)
      );
    },

    getMaintenances: async (
      id: string,
      params?: GetMaintenanceParams
    ): Promise<PaginationResult<BranchMaintenanceResponse>> => {
      return axiosClient.get(API_ENDPOINTS.TERRITORY.BRANCH_MAINTENANCES(id), {
        params,
      });
    },

    createMaintenance: async (
      id: string,
      body: CreateBranchMaintenanceRequest
    ): Promise<Result<BranchMaintenanceResponse>> => {
      return axiosClient.post(
        API_ENDPOINTS.TERRITORY.BRANCH_MAINTENANCES(id),
        body
      );
    },

    toggleCompleteMaintenance: async (
      maintenanceId: string
    ): Promise<Result<void>> => {
      return axiosClient.patch(
        API_ENDPOINTS.TERRITORY.BRANCH_MAINTENANCE_TOGGLE(maintenanceId)
      );
    },

    cancelMaintenance: async (maintenanceId: string): Promise<Result<void>> => {
      return axiosClient.post(
        API_ENDPOINTS.TERRITORY.BRANCH_MAINTENANCE_CANCEL(maintenanceId)
      );
    },
  },

  // ==========================================================================
  // Areas
  // ==========================================================================
  areas: {
    getAll: async (
      params?: GetAllAreasParams
    ): Promise<PaginationResult<AreaResponse>> => {
      return axiosClient.get(API_ENDPOINTS.TERRITORY.AREAS, { params });
    },

    getById: async (id: string): Promise<Result<AreaDetailResponse>> => {
      return axiosClient.get(API_ENDPOINTS.TERRITORY.AREA_DETAIL(id));
    },

    create: async (body: CreateAreaRequest): Promise<Result<AreaResponse>> => {
      return axiosClient.post(API_ENDPOINTS.TERRITORY.AREAS, body);
    },

    update: async (
      id: string,
      body: UpdateAreaRequest
    ): Promise<Result<AreaResponse>> => {
      return axiosClient.put(API_ENDPOINTS.TERRITORY.AREA_DETAIL(id), body);
    },

    delete: async (id: string): Promise<Result<void>> => {
      return axiosClient.delete(API_ENDPOINTS.TERRITORY.AREA_DETAIL(id));
    },

    restore: async (id: string): Promise<Result<void>> => {
      return axiosClient.patch(API_ENDPOINTS.TERRITORY.AREA_RESTORE(id));
    },

    deactivate: async (
      id: string,
      body: DeactivateAreaRequest
    ): Promise<Result<void>> => {
      return axiosClient.post(API_ENDPOINTS.TERRITORY.AREA_DEACTIVATE(id), body);
    },

    reactivate: async (
      id: string,
      body?: ReactivateAreaRequest
    ): Promise<Result<void>> => {
      return axiosClient.post(
        API_ENDPOINTS.TERRITORY.AREA_REACTIVATE(id),
        body || {}
      );
    },

    getDeactivationHistory: async (
      id: string
    ): Promise<Result<AreaDeactivationHistoryResponse[]>> => {
      return axiosClient.get(
        API_ENDPOINTS.TERRITORY.AREA_DEACTIVATION_HISTORY(id)
      );
    },

    getMaintenances: async (
      id: string,
      params?: GetMaintenanceParams
    ): Promise<PaginationResult<AreaMaintenanceResponse>> => {
      return axiosClient.get(API_ENDPOINTS.TERRITORY.AREA_MAINTENANCES(id), {
        params,
      });
    },

    createMaintenance: async (
      id: string,
      body: CreateAreaMaintenanceRequest
    ): Promise<Result<AreaMaintenanceResponse>> => {
      return axiosClient.post(
        API_ENDPOINTS.TERRITORY.AREA_MAINTENANCES(id),
        body
      );
    },

    toggleCompleteMaintenance: async (
      maintenanceId: string
    ): Promise<Result<void>> => {
      return axiosClient.patch(
        API_ENDPOINTS.TERRITORY.AREA_MAINTENANCE_TOGGLE(maintenanceId)
      );
    },

    cancelMaintenance: async (maintenanceId: string): Promise<Result<void>> => {
      return axiosClient.post(
        API_ENDPOINTS.TERRITORY.AREA_MAINTENANCE_CANCEL(maintenanceId)
      );
    },
  },

  // ==========================================================================
  // Restaurant Tables
  // ==========================================================================
  tables: {
    getAll: async (
      params?: GetAllTablesParams
    ): Promise<PaginationResult<RestaurantTableResponse>> => {
      return axiosClient.get(API_ENDPOINTS.TERRITORY.TABLES, { params });
    },

    getById: async (
      id: string
    ): Promise<Result<RestaurantTableResponse>> => {
      return axiosClient.get(API_ENDPOINTS.TERRITORY.TABLE_DETAIL(id));
    },

    create: async (
      body: CreateRestaurantTableRequest
    ): Promise<Result<RestaurantTableResponse>> => {
      return axiosClient.post(API_ENDPOINTS.TERRITORY.TABLES, body);
    },

    update: async (
      id: string,
      body: UpdateRestaurantTableRequest
    ): Promise<Result<RestaurantTableResponse>> => {
      return axiosClient.put(API_ENDPOINTS.TERRITORY.TABLE_DETAIL(id), body);
    },

    delete: async (id: string): Promise<Result<void>> => {
      return axiosClient.delete(API_ENDPOINTS.TERRITORY.TABLE_DETAIL(id));
    },

    restore: async (id: string): Promise<Result<void>> => {
      return axiosClient.patch(API_ENDPOINTS.TERRITORY.TABLE_RESTORE(id));
    },

    deactivate: async (
      id: string,
      body: DeactivateTableRequest
    ): Promise<Result<void>> => {
      return axiosClient.post(API_ENDPOINTS.TERRITORY.TABLE_DEACTIVATE(id), body);
    },

    reactivate: async (
      id: string,
      body?: ReactivateTableRequest
    ): Promise<Result<void>> => {
      return axiosClient.post(
        API_ENDPOINTS.TERRITORY.TABLE_REACTIVATE(id),
        body || {}
      );
    },

    getDeactivationHistory: async (
      id: string
    ): Promise<Result<TableDeactivationHistoryResponse[]>> => {
      return axiosClient.get(
        API_ENDPOINTS.TERRITORY.TABLE_DEACTIVATION_HISTORY(id)
      );
    },

    toggleOccupied: async (id: string): Promise<Result<void>> => {
      return axiosClient.patch(API_ENDPOINTS.TERRITORY.TABLE_TOGGLE_OCCUPIED(id));
    },

    occupy: async (id: string): Promise<Result<void>> => {
      return axiosClient.post(API_ENDPOINTS.TERRITORY.TABLE_OCCUPY(id));
    },

    release: async (id: string): Promise<Result<void>> => {
      return axiosClient.post(API_ENDPOINTS.TERRITORY.TABLE_RELEASE(id));
    },

    getMaintenances: async (
      id: string,
      params?: GetMaintenanceParams
    ): Promise<PaginationResult<TableMaintenanceResponse>> => {
      return axiosClient.get(API_ENDPOINTS.TERRITORY.TABLE_MAINTENANCES(id), {
        params,
      });
    },

    createMaintenance: async (
      id: string,
      body: CreateTableMaintenanceRequest
    ): Promise<Result<TableMaintenanceResponse>> => {
      return axiosClient.post(
        API_ENDPOINTS.TERRITORY.TABLE_MAINTENANCES(id),
        body
      );
    },

    toggleCompleteMaintenance: async (
      maintenanceId: string
    ): Promise<Result<void>> => {
      return axiosClient.patch(
        API_ENDPOINTS.TERRITORY.TABLE_MAINTENANCE_TOGGLE(maintenanceId)
      );
    },

    cancelMaintenance: async (maintenanceId: string): Promise<Result<void>> => {
      return axiosClient.post(
        API_ENDPOINTS.TERRITORY.TABLE_MAINTENANCE_CANCEL(maintenanceId)
      );
    },
  },
};
