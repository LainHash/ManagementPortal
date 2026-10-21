import axiosClient from "@/api/axiosClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { PaginationQuery, PaginationResult, Result } from "@/types/common.types";
import type {
  OrderDetailResponse,
  OrderResponse,
  OrderItemResponse,
  CreateDeliveryOrderRequest,
  UpdateOrderStatusRequest,
  UpdatePreparationStatusRequest,
} from "@/types/sale.types";
import type { OrderStatus, OrderType, PreparationStatus } from "@/types/enums";

export interface GetAllOrdersParams extends PaginationQuery {
  branchId?: string;
  customerId?: string;
  employeeId?: string;
  restaurantTableId?: string;
  status?: OrderStatus;
  type?: OrderType;
  fromDate?: string;
  toDate?: string;
}

export const saleApi = {
  orders: {
    getAll: async (params?: GetAllOrdersParams): Promise<PaginationResult<OrderResponse>> => {
      return axiosClient.get(API_ENDPOINTS.SALE.ORDERS, { params });
    },
    getById: async (id: string): Promise<Result<OrderDetailResponse>> => {
      return axiosClient.get(API_ENDPOINTS.SALE.ORDER_DETAIL(id));
    },
    createDeliveryOrder: async (body: CreateDeliveryOrderRequest): Promise<Result<OrderDetailResponse>> => {
      return axiosClient.post(API_ENDPOINTS.SALE.ORDERS, body);
    },
    advanceStatus: async (id: string): Promise<Result<OrderResponse>> => {
      return axiosClient.post(API_ENDPOINTS.SALE.ADVANCE_STATUS(id));
    },
    updateStatus: async (id: string, body: UpdateOrderStatusRequest): Promise<Result<OrderResponse>> => {
      return axiosClient.patch(API_ENDPOINTS.SALE.UPDATE_STATUS(id), body);
    },
    cancel: async (id: string): Promise<Result<OrderResponse>> => {
      return axiosClient.post(API_ENDPOINTS.SALE.CANCEL(id));
    },
    confirmDelivered: async (id: string): Promise<Result<OrderResponse>> => {
      return axiosClient.post(API_ENDPOINTS.SALE.CONFIRM_DELIVERED(id));
    },
    advanceItemPreparation: async (orderId: string, itemId: string): Promise<Result<OrderItemResponse>> => {
      return axiosClient.post(API_ENDPOINTS.SALE.ADVANCE_ITEM_PREPARATION(orderId, itemId));
    },
    updateItemPreparation: async (
      orderId: string,
      itemId: string,
      status: PreparationStatus
    ): Promise<Result<OrderItemResponse>> => {
      return axiosClient.patch(API_ENDPOINTS.SALE.UPDATE_ITEM_PREPARATION(orderId, itemId), { status });
    },
  },
};
