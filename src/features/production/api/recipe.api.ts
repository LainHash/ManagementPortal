import axiosClient from "@/api/axiosClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { PaginationResult, Result } from "@/types/common.types";
import type {
  RecipeResponse,
  RecipeDetailResponse,
  CreateRecipeRequest,
  UpdateRecipeRequest,
  GetAllRecipesParams,
} from "@/types/production.types";

export const recipeApi = {
  // --------------------------------------------------------------------------
  // Recipes API (Định lượng & Công thức sản xuất / BOM)
  // --------------------------------------------------------------------------
  recipes: {
    getAll: async (params?: GetAllRecipesParams): Promise<PaginationResult<RecipeResponse>> => {
      return axiosClient.get(API_ENDPOINTS.PRODUCTION.RECIPES, { params });
    },
    getById: async (id: string, branchId?: string): Promise<Result<RecipeDetailResponse>> => {
      return axiosClient.get(API_ENDPOINTS.PRODUCTION.RECIPE_DETAIL(id), {
        params: branchId ? { branchId } : undefined,
      });
    },
    create: async (body: CreateRecipeRequest): Promise<Result<RecipeDetailResponse>> => {
      return axiosClient.post(API_ENDPOINTS.PRODUCTION.RECIPES, body);
    },
    update: async (id: string, body: UpdateRecipeRequest): Promise<Result<RecipeDetailResponse>> => {
      return axiosClient.put(API_ENDPOINTS.PRODUCTION.RECIPE_DETAIL(id), body);
    },
    delete: async (id: string): Promise<Result<void>> => {
      return axiosClient.delete(API_ENDPOINTS.PRODUCTION.RECIPE_DETAIL(id));
    },
    restore: async (id: string): Promise<Result<void>> => {
      return axiosClient.patch(API_ENDPOINTS.PRODUCTION.RECIPE_RESTORE(id));
    },
    setPrimary: async (id: string): Promise<Result<void>> => {
      return axiosClient.patch(API_ENDPOINTS.PRODUCTION.RECIPE_PRIMARY(id));
    },
  },
};
