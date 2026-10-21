// ============================================================================
// RestaurantService Catalog DTOs
// Đối chiếu: API.Contract.DTOs.Catalog
// ============================================================================

import type { Currency, InventoryType, StockStatus, UnitType } from "./enums";
import type { RecipeResponse } from "./production.types";
import type { BrandImageResponse, ProductImageResponse } from "./storage.types";

// ----------------------------------------------------------------------------
// Brands
// ----------------------------------------------------------------------------

// Đối chiếu: API.Contract.DTOs.Catalog.Brands.BrandResponse
export interface BrandResponse {
  id: string;
  name: string;
  description?: string | null;
  primaryImage?: BrandImageResponse | null;
}

// Đối chiếu: API.Contract.DTOs.Catalog.Brands.BrandDetailResponse
export interface BrandDetailResponse extends BrandResponse {
  brandImages: BrandImageResponse[];
  products: ProductMinimalResponse[];
}

// Đối chiếu: API.Contract.DTOs.Catalog.Brands.CreateBrandRequest
export interface CreateBrandRequest {
  name: string;
  description?: string | null;
}

// Đối chiếu: API.Contract.DTOs.Catalog.Brands.UpdateBrandRequest
export interface UpdateBrandRequest extends CreateBrandRequest {}

// ----------------------------------------------------------------------------
// Product Categories
// ----------------------------------------------------------------------------

// Đối chiếu: API.Contract.DTOs.Catalog.ProductCategories.ProductCategoryResponse
export interface ProductCategoryResponse {
  id: string;
  name: string;
  description?: string | null;
}

// Đối chiếu: API.Contract.DTOs.Catalog.ProductCategories.ProductCategoryDetailResponse
export interface ProductCategoryDetailResponse extends ProductCategoryResponse {
  products: ProductMinimalResponse[];
}

// Đối chiếu: API.Contract.DTOs.Catalog.ProductCategories.CreateProductCategoryRequest
export interface CreateProductCategoryRequest {
  name: string;
  description?: string | null;
}

// Đối chiếu: API.Contract.DTOs.Catalog.ProductCategories.UpdateProductCategoryRequest
export interface UpdateProductCategoryRequest extends CreateProductCategoryRequest {}

// ----------------------------------------------------------------------------
// Products
// ----------------------------------------------------------------------------

// Đối chiếu: API.Contract.DTOs.Catalog.Products.ProductMinimalResponse
export interface ProductMinimalResponse {
  id: string;
  name: string;
  description?: string | null;
  inventoryType: InventoryType;
}

// Đối chiếu: API.Contract.DTOs.Catalog.Products.ProductResponse
export interface ProductResponse {
  id: string;
  name: string;
  description?: string | null;
  inventoryType: InventoryType;
  brandName?: string | null;
  categoryName: string;
  unitSymbol: string;
  unitPrice?: number | null;
  currency?: string | null;
  stockStatus: StockStatus;
  primaryImage?: ProductImageResponse | null;
}

// Đối chiếu: API.Contract.DTOs.Catalog.Products.PopularProductResponse
export interface PopularProductResponse extends ProductResponse {
  totalQuantitySold: number;
}

// Đối chiếu: API.Contract.DTOs.Catalog.Products.ProductDetailResponse
export interface ProductDetailResponse extends ProductResponse {
  productImages: ProductImageResponse[];
  recipes: RecipeResponse[];
}

// Đối chiếu: API.Contract.DTOs.Catalog.Products.CreateProductRequest
export interface CreateProductRequest {
  name: string;
  description?: string | null;
  inventoryType: InventoryType;
  brandPublicId?: string | null;
  categoryPublicId: string;
  unitPublicId: string;
}

// Đối chiếu: API.Contract.DTOs.Catalog.Products.UpdateProductRequest
export interface UpdateProductRequest {
  name: string;
  description?: string | null;
  brandPublicId?: string | null;
  categoryPublicId: string;
  unitPublicId: string;
}

// Đối chiếu: API.Contract.DTOs.Catalog.Products.UpdateProductBranchPriceRequest
export interface UpdateProductBranchPriceRequest {
  unitPrice: number;
  currency?: Currency;
}

// Đối chiếu: API.Contract.DTOs.Catalog.Products.ProductBranchPriceResponse
export interface ProductBranchPriceResponse {
  productPublicId: string;
  productName: string;
  branchPublicId: string;
  branchCode: string;
  branchAddress: string;
  unitPrice: number;
  currency: string;
  updatedAt: string;
}

// Đối chiếu: API.Contract.DTOs.Catalog.Products.UpdateProductBranchStockRequest
export interface UpdateProductBranchStockRequest {
  quantityOnHand: number;
  reorderLevel?: number | null;
}

// Đối chiếu: API.Contract.DTOs.Catalog.Products.ProductBranchStockResponse
export interface ProductBranchStockResponse {
  productPublicId: string;
  productName: string;
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

// ----------------------------------------------------------------------------
// Units
// ----------------------------------------------------------------------------

// Đối chiếu: API.Contract.DTOs.Catalog.Units.UnitResponse
export interface UnitResponse {
  id: string;
  name: string;
  symbol: string;
  type: UnitType;
  conversionRate: number;
}

// Đối chiếu: API.Contract.DTOs.Catalog.Units.UnitDetailResponse
export interface UnitDetailResponse extends UnitResponse {}

// Đối chiếu: API.Contract.DTOs.Catalog.Units.CreateUnitRequest
export interface CreateUnitRequest {
  name: string;
  symbol: string;
  type: UnitType;
  conversionRate: number;
  parentPublicId?: string | null;
}

// Đối chiếu: API.Contract.DTOs.Catalog.Units.UpdateUnitRequest
export interface UpdateUnitRequest extends CreateUnitRequest {}
