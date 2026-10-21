import axiosClient from "@/api/axiosClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { PaginationQuery, PaginationResult, Result } from "@/types/common.types";
import type {
  IngredientCategoryDetailResponse,
  IngredientCategoryResponse,
  IngredientDetailResponse,
  IngredientResponse,
  CreateIngredientCategoryRequest,
  CreateIngredientPriceRequest,
  CreateIngredientRequest,
  CreateIngredientStockRequest,
  IngredientBranchPriceResponse,
  IngredientBranchStockResponse,
  UpdateIngredientBranchPriceRequest,
  UpdateIngredientBranchStockRequest,
  UpdateIngredientCategoryRequest,
  UpdateIngredientRequest,
} from "@/types/inventory.types";

export interface GetAllIngredientsParams extends PaginationQuery {
  categoryId?: string;
  brandId?: string;
  unitId?: string;
  branchId?: string;
}

export const inventoryApi = {
  // --------------------------------------------------------------------------
  // Ingredients API
  // --------------------------------------------------------------------------
  ingredients: {
    getAll: async (params?: GetAllIngredientsParams): Promise<PaginationResult<IngredientResponse>> => {
      return axiosClient.get(API_ENDPOINTS.INVENTORY.INGREDIENTS, { params });
    },
    getById: async (id: string, branchId?: string): Promise<Result<IngredientDetailResponse>> => {
      return axiosClient.get(API_ENDPOINTS.INVENTORY.INGREDIENT_DETAIL(id), {
        params: branchId ? { branchId } : undefined,
      });
    },
    create: async (body: CreateIngredientRequest): Promise<Result<IngredientResponse>> => {
      return axiosClient.post(API_ENDPOINTS.INVENTORY.INGREDIENTS, body);
    },
    update: async (id: string, body: UpdateIngredientRequest): Promise<Result<IngredientResponse>> => {
      return axiosClient.put(API_ENDPOINTS.INVENTORY.INGREDIENT_DETAIL(id), body);
    },
    delete: async (id: string): Promise<Result<void>> => {
      return axiosClient.delete(API_ENDPOINTS.INVENTORY.INGREDIENT_DETAIL(id));
    },
    restore: async (id: string): Promise<Result<void>> => {
      return axiosClient.patch(API_ENDPOINTS.INVENTORY.INGREDIENT_RESTORE(id));
    },
    updateBranchPrice: async (
      ingredientId: string,
      branchId: string,
      body: UpdateIngredientBranchPriceRequest
    ): Promise<Result<IngredientBranchPriceResponse>> => {
      return axiosClient.put(API_ENDPOINTS.INVENTORY.INGREDIENT_BRANCH_PRICE(ingredientId, branchId), body);
    },
    updateBranchStock: async (
      ingredientId: string,
      branchId: string,
      body: UpdateIngredientBranchStockRequest
    ): Promise<Result<IngredientBranchStockResponse>> => {
      return axiosClient.put(API_ENDPOINTS.INVENTORY.INGREDIENT_BRANCH_STOCK(ingredientId, branchId), body);
    },
    createPrice: async (
      body: CreateIngredientPriceRequest
    ): Promise<Result<IngredientBranchPriceResponse>> => {
      return axiosClient.post(API_ENDPOINTS.INVENTORY.INGREDIENT_CREATE_PRICE, body);
    },
    createStock: async (
      body: CreateIngredientStockRequest
    ): Promise<Result<IngredientBranchStockResponse>> => {
      return axiosClient.post(API_ENDPOINTS.INVENTORY.INGREDIENT_CREATE_STOCK, body);
    },
  },

  // --------------------------------------------------------------------------
  // Ingredient Categories API
  // --------------------------------------------------------------------------
  categories: {
    getAll: async (params?: PaginationQuery): Promise<PaginationResult<IngredientCategoryResponse>> => {
      return axiosClient.get(API_ENDPOINTS.INVENTORY.CATEGORIES, { params });
    },
    getById: async (id: string): Promise<Result<IngredientCategoryDetailResponse>> => {
      return axiosClient.get(API_ENDPOINTS.INVENTORY.CATEGORY_DETAIL(id));
    },
    create: async (body: CreateIngredientCategoryRequest): Promise<Result<IngredientCategoryResponse>> => {
      return axiosClient.post(API_ENDPOINTS.INVENTORY.CATEGORIES, body);
    },
    update: async (id: string, body: UpdateIngredientCategoryRequest): Promise<Result<IngredientCategoryResponse>> => {
      return axiosClient.put(API_ENDPOINTS.INVENTORY.CATEGORY_DETAIL(id), body);
    },
    delete: async (id: string): Promise<Result<void>> => {
      return axiosClient.delete(API_ENDPOINTS.INVENTORY.CATEGORY_DETAIL(id));
    },
    restore: async (id: string): Promise<Result<void>> => {
      return axiosClient.patch(API_ENDPOINTS.INVENTORY.CATEGORY_RESTORE(id));
    },
  },
};
