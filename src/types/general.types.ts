// ============================================================================
// RestaurantService General DTOs
// Đối chiếu: API.Contract.DTOs.General
// ============================================================================

import type {
  BrandResponse,
  ProductCategoryResponse,
  ProductResponse,
} from "./catalog.types";
import type { BranchResponse } from "./territory.types";

// Đối chiếu: API.Contract.DTOs.General.HomeResponse
export interface HomeResponse {
  products: ProductResponse[];
  brands: BrandResponse[];
  productCategories: ProductCategoryResponse[];
  branches: BranchResponse[];
}
