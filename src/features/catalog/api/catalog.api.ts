import axiosClient from "@/api/axiosClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { PaginationQuery, PaginationResult, Result } from "@/types/common.types";
import type {
  BrandDetailResponse,
  BrandResponse,
  CreateBrandRequest,
  CreateProductCategoryRequest,
  CreateProductPriceRequest,
  CreateProductRequest,
  CreateProductStockRequest,
  CreateUnitRequest,
  ProductBranchPriceResponse,
  ProductBranchStockResponse,
  ProductCategoryDetailResponse,
  ProductCategoryResponse,
  ProductDetailResponse,
  ProductResponse,
  UnitDetailResponse,
  UnitResponse,
  UpdateBrandRequest,
  UpdateProductBranchPriceRequest,
  UpdateProductBranchStockRequest,
  UpdateProductCategoryRequest,
  UpdateProductRequest,
  UpdateUnitRequest,
} from "@/types/catalog.types";

export interface GetAllProductsParams extends PaginationQuery {
  categoryId?: string;
  brandId?: string;
  branchId?: string;
  isRecommended?: boolean;
}

export const catalogApi = {
  // --------------------------------------------------------------------------
  // Products API
  // --------------------------------------------------------------------------
  products: {
    getAll: async (params?: GetAllProductsParams): Promise<PaginationResult<ProductResponse>> => {
      return axiosClient.get(API_ENDPOINTS.CATALOG.PRODUCTS, { params });
    },
    getById: async (id: string, branchId?: string): Promise<Result<ProductDetailResponse>> => {
      return axiosClient.get(API_ENDPOINTS.CATALOG.PRODUCT_DETAIL(id), {
        params: branchId ? { branchId } : undefined,
      });
    },
    create: async (body: CreateProductRequest): Promise<Result<ProductResponse>> => {
      return axiosClient.post(API_ENDPOINTS.CATALOG.PRODUCTS, body);
    },
    update: async (id: string, body: UpdateProductRequest): Promise<Result<ProductResponse>> => {
      return axiosClient.put(API_ENDPOINTS.CATALOG.PRODUCT_DETAIL(id), body);
    },
    delete: async (id: string): Promise<Result<void>> => {
      return axiosClient.delete(API_ENDPOINTS.CATALOG.PRODUCT_DETAIL(id));
    },
    restore: async (id: string): Promise<Result<void>> => {
      return axiosClient.patch(API_ENDPOINTS.CATALOG.PRODUCT_RESTORE(id));
    },
    updateBranchPrice: async (
      productId: string,
      branchId: string,
      body: UpdateProductBranchPriceRequest
    ): Promise<Result<ProductBranchPriceResponse>> => {
      return axiosClient.put(API_ENDPOINTS.CATALOG.PRODUCT_BRANCH_PRICE(productId, branchId), body);
    },
    updateBranchStock: async (
      productId: string,
      branchId: string,
      body: UpdateProductBranchStockRequest
    ): Promise<Result<ProductBranchStockResponse>> => {
      return axiosClient.put(API_ENDPOINTS.CATALOG.PRODUCT_BRANCH_STOCK(productId, branchId), body);
    },
    createPrice: async (
      body: CreateProductPriceRequest
    ): Promise<Result<ProductBranchPriceResponse>> => {
      return axiosClient.post(API_ENDPOINTS.CATALOG.PRODUCT_CREATE_PRICE, body);
    },
    createStock: async (
      body: CreateProductStockRequest
    ): Promise<Result<ProductBranchStockResponse>> => {
      return axiosClient.post(API_ENDPOINTS.CATALOG.PRODUCT_CREATE_STOCK, body);
    },
  },

  // --------------------------------------------------------------------------
  // Product Categories API
  // --------------------------------------------------------------------------
  categories: {
    getAll: async (params?: PaginationQuery): Promise<PaginationResult<ProductCategoryResponse>> => {
      return axiosClient.get(API_ENDPOINTS.CATALOG.CATEGORIES, { params });
    },
    getById: async (id: string): Promise<Result<ProductCategoryDetailResponse>> => {
      return axiosClient.get(API_ENDPOINTS.CATALOG.CATEGORY_DETAIL(id));
    },
    create: async (body: CreateProductCategoryRequest): Promise<Result<ProductCategoryResponse>> => {
      return axiosClient.post(API_ENDPOINTS.CATALOG.CATEGORIES, body);
    },
    update: async (id: string, body: UpdateProductCategoryRequest): Promise<Result<ProductCategoryResponse>> => {
      return axiosClient.put(API_ENDPOINTS.CATALOG.CATEGORY_DETAIL(id), body);
    },
    delete: async (id: string): Promise<Result<void>> => {
      return axiosClient.delete(API_ENDPOINTS.CATALOG.CATEGORY_DETAIL(id));
    },
    restore: async (id: string): Promise<Result<void>> => {
      return axiosClient.patch(API_ENDPOINTS.CATALOG.CATEGORY_RESTORE(id));
    },
  },

  // --------------------------------------------------------------------------
  // Brands API
  // --------------------------------------------------------------------------
  brands: {
    getAll: async (params?: PaginationQuery): Promise<PaginationResult<BrandResponse>> => {
      return axiosClient.get(API_ENDPOINTS.CATALOG.BRANDS, { params });
    },
    getById: async (id: string): Promise<Result<BrandDetailResponse>> => {
      return axiosClient.get(API_ENDPOINTS.CATALOG.BRAND_DETAIL(id));
    },
    create: async (body: CreateBrandRequest): Promise<Result<BrandResponse>> => {
      return axiosClient.post(API_ENDPOINTS.CATALOG.BRANDS, body);
    },
    update: async (id: string, body: UpdateBrandRequest): Promise<Result<BrandResponse>> => {
      return axiosClient.put(API_ENDPOINTS.CATALOG.BRAND_DETAIL(id), body);
    },
    delete: async (id: string): Promise<Result<void>> => {
      return axiosClient.delete(API_ENDPOINTS.CATALOG.BRAND_DETAIL(id));
    },
    restore: async (id: string): Promise<Result<void>> => {
      return axiosClient.patch(API_ENDPOINTS.CATALOG.BRAND_RESTORE(id));
    },
  },

  // --------------------------------------------------------------------------
  // Units API
  // --------------------------------------------------------------------------
  units: {
    getAll: async (params?: PaginationQuery): Promise<PaginationResult<UnitResponse>> => {
      return axiosClient.get(API_ENDPOINTS.CATALOG.UNITS, { params });
    },
    getById: async (id: string): Promise<Result<UnitDetailResponse>> => {
      return axiosClient.get(API_ENDPOINTS.CATALOG.UNIT_DETAIL(id));
    },
    create: async (body: CreateUnitRequest): Promise<Result<UnitResponse>> => {
      return axiosClient.post(API_ENDPOINTS.CATALOG.UNITS, body);
    },
    update: async (id: string, body: UpdateUnitRequest): Promise<Result<UnitResponse>> => {
      return axiosClient.put(API_ENDPOINTS.CATALOG.UNIT_DETAIL(id), body);
    },
    delete: async (id: string): Promise<Result<void>> => {
      return axiosClient.delete(API_ENDPOINTS.CATALOG.UNIT_DETAIL(id));
    },
    restore: async (id: string): Promise<Result<void>> => {
      return axiosClient.patch(API_ENDPOINTS.CATALOG.UNIT_RESTORE(id));
    },
  },
};
