// ============================================================================
// RestaurantService Commerce DTOs
// Đối chiếu: API.Contract.DTOs.Commerce
// ============================================================================

import type { ProductResponse } from "./catalog.types";

// ----------------------------------------------------------------------------
// Cart & Cart Items
// ----------------------------------------------------------------------------

// Đối chiếu: API.Contract.DTOs.Commerce.CartItems.CartItemResponse
export interface CartItemResponse {
  id: string;
  product: ProductResponse;
  quantity: number;
}

// Đối chiếu: API.Contract.DTOs.Commerce.CartItems.AddCartItemRequest
export interface AddCartItemRequest {
  productId: string;
}

// Đối chiếu: API.Contract.DTOs.Commerce.CartItems.UpdateCartItemQuantityRequest
export interface UpdateCartItemQuantityRequest {
  productId: string;
  quantity: number;
}

// Đối chiếu: API.Contract.DTOs.Commerce.CartItems.RemoveCartItemRequest
export interface RemoveCartItemRequest {
  productId: string;
}

// Đối chiếu: API.Contract.DTOs.Commerce.Carts.CartResponse
export interface CartResponse {
  id: string;
  cartItems: CartItemResponse[];
}

// ----------------------------------------------------------------------------
// Wishlist & Wishlist Items
// ----------------------------------------------------------------------------

// Đối chiếu: API.Contract.DTOs.Commerce.WishlistItems.WishlistItemResponse
export interface WishlistItemResponse {
  id: string;
  product: ProductResponse;
}

// Đối chiếu: API.Contract.DTOs.Commerce.WishlistItems.AddWishlistItemRequest
export interface AddWishlistItemRequest {
  productId: string;
}

// Đối chiếu: API.Contract.DTOs.Commerce.WishlistItems.RemoveWishlistItemRequest
export interface RemoveWishlistItemRequest {
  productId: string;
}

// Đối chiếu: API.Contract.DTOs.Commerce.Wishlists.WishlistResponse
export interface WishlistResponse {
  id: string;
  wishlistItems: WishlistItemResponse[];
}
