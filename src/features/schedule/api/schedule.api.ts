import axiosClient from "@/api/axiosClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { PaginationQuery, PaginationResult, Result } from "@/types/common.types";
import type {
  ReservationDetailResponse,
  ReservationResponse,
  CreateReservationRequest,
} from "@/types/schedule.types";
import type { ReservationStatus } from "@/types/enums";

export interface GetAllReservationsParams extends PaginationQuery {
  branchId?: string;
  customerId?: string;
  restaurantTableId?: string;
  status?: ReservationStatus;
  partySize?: number;
  fromDate?: string;
  toDate?: string;
}

export const scheduleApi = {
  reservations: {
    getAll: async (
      params?: GetAllReservationsParams
    ): Promise<PaginationResult<ReservationResponse>> => {
      return axiosClient.get(API_ENDPOINTS.SCHEDULE.RESERVATIONS, { params });
    },
    getById: async (id: string): Promise<Result<ReservationDetailResponse>> => {
      return axiosClient.get(API_ENDPOINTS.SCHEDULE.RESERVATION_DETAIL(id));
    },
    create: async (
      body: CreateReservationRequest
    ): Promise<Result<ReservationResponse>> => {
      return axiosClient.post(API_ENDPOINTS.SCHEDULE.RESERVATIONS, body);
    },
  },
};
