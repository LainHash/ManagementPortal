// ============================================================================
// RestaurantService Storage DTOs
// Đối chiếu: API.Contract.DTOs.Storage
// ============================================================================

// Đối chiếu: API.Contract.DTOs.Storage.Images.ImageResponse
export interface ImageResponse {
  id: string;
  altText: string;
  url: string;
}

// Đối chiếu: API.Contract.DTOs.Storage.Images.UploadImageRequest
export interface UploadImageRequest {
  altText?: string | null;
}

// Đối chiếu: API.Contract.DTOs.Storage.Images.UploadImageResponse
export interface UploadImageResponse {
  imagePublicId: string;
  url: string;
  publicId: string;
  altText: string;
}

// Đối chiếu: API.Contract.DTOs.Storage.BrandImages.BrandImageResponse
export interface BrandImageResponse {
  id: string;
  displayOrder?: number | null;
  isPrimary?: boolean | null;
  image: ImageResponse;
}

// Đối chiếu: API.Contract.DTOs.Storage.BrandImages.UploadBrandImageRequest
export interface UploadBrandImageRequest {
  altText?: string | null;
  isPrimary: boolean;
}

// Đối chiếu: API.Contract.DTOs.Storage.ProductImages.ProductImageResponse
export interface ProductImageResponse {
  id: string;
  displayOrder?: number | null;
  isPrimary?: boolean | null;
  image: ImageResponse;
}

// Đối chiếu: API.Contract.DTOs.Storage.ProductImages.UploadProductImageRequest
export interface UploadProductImageRequest {
  altText?: string | null;
  isPrimary: boolean;
}
