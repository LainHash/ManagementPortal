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
