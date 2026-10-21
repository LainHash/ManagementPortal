// ============================================================================
// RestaurantService Inventory DTOs
// Đối chiếu: API.Contract.DTOs.Inventory
// ============================================================================

import type { Currency, StockStatus } from "./enums";

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
  unitPrice?: number | null;
  currency?: string | null;
  availableQuantity?: number | null;
  stockStatus?: StockStatus;
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

// ----------------------------------------------------------------------------
// Branch Price & Stock
// ----------------------------------------------------------------------------

// Đối chiếu: API.Contract.DTOs.Inventory.Ingredients.UpdateIngredientBranchPriceRequest
export interface UpdateIngredientBranchPriceRequest {
  unitPrice: number;
  currency?: Currency;
}

// Đối chiếu: API.Contract.DTOs.Inventory.Ingredients.IngredientBranchPriceResponse
export interface IngredientBranchPriceResponse {
  ingredientPublicId: string;
  ingredientName: string;
  branchPublicId: string;
  branchCode: string;
  branchAddress: string;
  unitPrice: number;
  currency: string;
  updatedAt: string;
}

// Đối chiếu: API.Contract.DTOs.Inventory.Ingredients.UpdateIngredientBranchStockRequest
export interface UpdateIngredientBranchStockRequest {
  quantityOnHand: number;
  reorderLevel?: number | null;
}

// Đối chiếu: API.Contract.DTOs.Inventory.Ingredients.IngredientBranchStockResponse
export interface IngredientBranchStockResponse {
  ingredientPublicId: string;
  ingredientName: string;
  branchPublicId: string;
  branchCode: string;
  branchAddress: string;
  quantityOnHand: number;
  quantityReserved: number;
  availableQuantity: number;
  reorderLevel: number;
  stockStatus: StockStatus;
  updatedAt: string;
}

// Đối chiếu: API.Contract.DTOs.Inventory.Ingredients.CreateIngredientPriceRequest
export interface CreateIngredientPriceRequest {
  ingredientPublicId: string;
  branchPublicId: string;
  unitPrice: number;
  currency?: Currency;
}

// Đối chiếu: API.Contract.DTOs.Inventory.Ingredients.CreateIngredientStockRequest
export interface CreateIngredientStockRequest {
  ingredientPublicId: string;
  branchPublicId: string;
  quantityOnHand: number;
  reorderLevel?: number | null;
}

