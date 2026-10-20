// ============================================================================
// RestaurantService Communication DTOs
// Đối chiếu: API.Contract.DTOs.Communication
// ============================================================================

import type { ContactEmailStatus, ContactStatus } from "./enums";

// Đối chiếu: API.Contract.DTOs.Communication.ContactMessages.CreateContactMessageRequest
export interface CreateContactMessageRequest {
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  subject: string;
  message: string;
}

// Đối chiếu: API.Contract.DTOs.Communication.ContactMessages.ContactMessageResponse
export interface ContactMessageResponse {
  id: string;
  customerId?: string | null;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  subject: string;
  message: string;
  sessionId?: string | null;
  status: ContactStatus;
  emailStatus: ContactEmailStatus;
  emailSentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Đối chiếu: API.Contract.DTOs.Communication.ContactMessages.ContactMessageDetailResponse
export interface ContactMessageDetailResponse extends ContactMessageResponse {
  ipAddress?: string | null;
  userAgent?: string | null;
  emailFailureReason?: string | null;
  emailRetryCount: number;
  handledBy?: string | null;
  adminNotes?: string | null;
  resolvedAt?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
}
