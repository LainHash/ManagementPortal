// ============================================================================
// RestaurantService Inventory DTOs
// Đối chiếu: API.Contract.DTOs.Inventory
// ============================================================================

// Đối chiếu: API.Contract.DTOs.Inventory.IngredientCategories.IngredientCategoryResponse
export interface IngredientCategoryResponse {
  id: string;
  name: string;
  description?: string | null;
}

// Đối chiếu: API.Contract.DTOs.Inventory.IngredientCategories.IngredientCategoryDetailResponse
export interface IngredientCategoryDetailResponse extends IngredientCategoryResponse {
  ingredients: IngredientMinimalResponse[];
}

// Đối chiếu: API.Contract.DTOs.Inventory.IngredientCategories.CreateIngredientCategoryRequest
export interface CreateIngredientCategoryRequest {
  name: string;
  description?: string | null;
}

// Đối chiếu: API.Contract.DTOs.Inventory.IngredientCategories.UpdateIngredientCategoryRequest
export interface UpdateIngredientCategoryRequest {
  name: string;
  description?: string | null;
}

// Đối chiếu: API.Contract.DTOs.Inventory.Ingredients.IngredientResponse
export interface IngredientResponse {
  id: string;
  name: string;
  description?: string | null;
  categoryPublicId: string;
  categoryName: string;
  unitPublicId: string;
  unitName: string;
  unitSymbol: string;
  brandPublicId?: string | null;
  brandName?: string | null;
}

// Đối chiếu: API.Contract.DTOs.Inventory.Ingredients.IngredientMinimalResponse
export interface IngredientMinimalResponse {
  id: string;
  name: string;
  unitSymbol: string;
}

// Đối chiếu: API.Contract.DTOs.Inventory.Ingredients.IngredientDetailResponse
export interface IngredientDetailResponse extends IngredientResponse {}

// Đối chiếu: API.Contract.DTOs.Inventory.Ingredients.CreateIngredientRequest
export interface CreateIngredientRequest {
  name: string;
  description?: string | null;
  categoryPublicId: string;
  unitPublicId: string;
  brandPublicId?: string | null;
}

// Đối chiếu: API.Contract.DTOs.Inventory.Ingredients.UpdateIngredientRequest
export interface UpdateIngredientRequest {
  name: string;
  description?: string | null;
  categoryPublicId: string;
  unitPublicId: string;
  brandPublicId?: string | null;
}
