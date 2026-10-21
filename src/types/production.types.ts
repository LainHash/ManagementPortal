// ============================================================================
// RestaurantService Production DTOs
// Đối chiếu: API.Contract.DTOs.Production
// ============================================================================

import type { IngredientResponse } from "./inventory.types";

// Đối chiếu: API.Contract.DTOs.Production.Recipes.RecipeResponse
export interface RecipeResponse {
  id: string;
  productPublicId: string;
  productName: string;
  instructions?: string | null;
  isPrimary: boolean;
}

// Đối chiếu: API.Contract.DTOs.Production.Recipes.RecipeIngredientResponse
export interface RecipeIngredientResponse {
  id: string;
  quantity: number;
  ingredient: IngredientResponse;
}

// Đối chiếu: API.Contract.DTOs.Production.Recipes.RecipeDetailResponse
export interface RecipeDetailResponse extends RecipeResponse {
  recipeIngredients: RecipeIngredientResponse[];
}

// Đối chiếu: API.Contract.DTOs.Production.Recipes.CreateRecipeIngredientItem
export interface CreateRecipeIngredientItem {
  ingredientPublicId: string;
  quantity: number;
}

// Đối chiếu: API.Contract.DTOs.Production.Recipes.CreateRecipeRequest
export interface CreateRecipeRequest {
  productPublicId: string;
  instructions?: string | null;
  isPrimary?: boolean;
  ingredients: CreateRecipeIngredientItem[];
}

// Đối chiếu: API.Contract.DTOs.Production.Recipes.UpdateRecipeRequest
export interface UpdateRecipeRequest {
  instructions?: string | null;
  isPrimary: boolean;
  ingredients: CreateRecipeIngredientItem[];
}

// Query parameters cho Recipes
export interface GetAllRecipesParams {
  productId?: string;
  isPrimary?: boolean;
  keyword?: string;
  page?: number;
  pageSize?: number;
  sortField?: string;
  isAscending?: boolean;
}

