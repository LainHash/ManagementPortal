// ============================================================================
// RestaurantService Sale DTOs
// Đối chiếu: API.Contract.DTOs.Sale
// ============================================================================

import type { ProductResponse } from "./catalog.types";
import type { OrderStatus, OrderType, PreparationStatus } from "./enums";

// ----------------------------------------------------------------------------
// Order Items
// ----------------------------------------------------------------------------

// Đối chiếu: API.Contract.DTOs.Sale.OrderItems.OrderItemResponse
export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  note?: string | null;
  preparationStatus?: PreparationStatus | null;
  product: ProductResponse;
}

// ----------------------------------------------------------------------------
// Order Preparations
// ----------------------------------------------------------------------------

// Đối chiếu: API.Contract.DTOs.Sale.OrderPreparations.UpdatePreparationStatusRequest
export interface UpdatePreparationStatusRequest {
  status: PreparationStatus;
}

// Đối chiếu: API.Contract.DTOs.Sale.OrderPreparations.BatchUpdatePreparationStatusRequest
export interface BatchUpdatePreparationStatusRequest {
  itemIds?: string[] | null;
  status: PreparationStatus;
}

// ----------------------------------------------------------------------------
// Orders
// ----------------------------------------------------------------------------

// Đối chiếu: API.Contract.DTOs.Sale.Orders.CreateOrderItemRequest
export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
  note?: string | null;
}

// Đối chiếu: API.Contract.DTOs.Sale.Orders.CreateDeliveryOrderRequest
export interface CreateDeliveryOrderRequest {
  branchId: string;
  deliveryAddress: string;
  note?: string | null;
  deliveryFee: number;
  items?: CreateOrderItemRequest[] | null;
}

// Đối chiếu: API.Contract.DTOs.Sale.Orders.OrderResponse
export interface OrderResponse {
  id: string;
  orderCode: string;
  customerId?: string | null;
  customerName?: string | null;
  employeeId?: string | null;
  employeeName?: string | null;
  branchId: string;
  branchCode?: string | null;
  restaurantTableId?: string | null;
  tableNumber?: string | null;
  status: OrderStatus;
  type: OrderType;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  note?: string | null;
  deliveryAddress?: string | null;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

// Đối chiếu: API.Contract.DTOs.Sale.Orders.OrderDetailResponse
export interface OrderDetailResponse extends OrderResponse {
  orderItems: OrderItemResponse[];
}

// Đối chiếu: API.Contract.DTOs.Sale.Orders.PaymentQrResponse
export interface PaymentQrResponse {
  provider: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  transferContent: string;
  qrCodeUrl: string;
  expiresAt: string;
}

// Đối chiếu: API.Contract.DTOs.Sale.Orders.DeliveryOrderCheckoutResponse
export interface DeliveryOrderCheckoutResponse {
  order: OrderDetailResponse;
  payment: PaymentQrResponse;
}

// Đối chiếu: API.Contract.DTOs.Sale.Orders.OrderPaymentStatusResponse
export interface OrderPaymentStatusResponse {
  id: string;
  orderCode: string;
  status: OrderStatus;
  isPaid: boolean;
  success: boolean;
  totalAmount: number;
}

// Đối chiếu: API.Contract.DTOs.Sale.Orders.UpdateOrderStatusRequest
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

// Đối chiếu: API.Contract.DTOs.Sale.Orders.ReportOrderRequest
export interface ReportOrderRequest {
  subject?: string | null;
  message: string;
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
}

// Đối chiếu: API.Contract.DTOs.Sale.Orders.SePayWebhookRequest
export interface SePayWebhookRequest {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  subAccount?: string | null;
  code?: string | null;
  content: string;
  transferType: string;
  transferAmount: number;
  accumulated: number;
  referenceCode?: string | null;
}

// Đối chiếu: API.Contract.DTOs.Sale.Orders.SePayWebhookResponse
export interface SePayWebhookResponse {
  success: boolean;
  isSucceed: boolean;
  message: string;
  statusCode: number;
}
