// ============================================================================
// RestaurantService Schedule DTOs
// Đối chiếu: API.Contract.DTOs.Schedule
// ============================================================================

import type {
  ReservationStatus,
  ReservationTableStatus,
  TableShape,
} from "./enums";

// Đối chiếu: API.Contract.DTOs.Schedule.Reservations.ReservationTableResponse
export interface ReservationTableResponse {
  tableId: string;
  tableNumber: string;
  capacity: number;
  shape: TableShape;
  assignedAt: string;
  releasedAt?: string | null;
  status: ReservationTableStatus;
}

// Đối chiếu: API.Contract.DTOs.Schedule.Reservations.ReservationStatusHistoryResponse
export interface ReservationStatusHistoryResponse {
  oldStatus: ReservationStatus;
  newStatus: ReservationStatus;
  changedBy: string;
  reason: string;
  createdAt: string;
}

// Đối chiếu: API.Contract.DTOs.Schedule.Reservations.ReservationResponse
export interface ReservationResponse {
  id: string;
  reservationCode: string;
  branchId: string;
  branchCode?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail?: string | null;
  partySize: number;
  reservedFrom: string;
  reservedTo: string;
  status: ReservationStatus;
  specialRequests?: string | null;
  tableCount: number;
  tableNumbers: string[];
  createdAt: string;
  updatedAt: string;
}

// Đối chiếu: API.Contract.DTOs.Schedule.Reservations.ReservationDetailResponse
export interface ReservationDetailResponse extends ReservationResponse {
  tables: ReservationTableResponse[];
  statusHistories: ReservationStatusHistoryResponse[];
  cancelledAt?: string | null;
  cancellationReason?: string | null;
}

// Đối chiếu: API.Contract.DTOs.Schedule.Reservations.CreateReservationRequest
export interface CreateReservationRequest {
  branchId: string;
  reservedFrom: string;
  reservedTo?: string | null;
  partySize: number;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  specialRequests?: string | null;
  tableIds?: string[] | null;
}
