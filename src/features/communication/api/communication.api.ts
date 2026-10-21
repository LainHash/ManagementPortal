import axiosClient from "@/api/axiosClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { PaginationQuery, PaginationResult, Result } from "@/types/common.types";
import type {
  ContactMessageDetailResponse,
  ContactMessageResponse,
  CreateContactMessageRequest,
} from "@/types/communication.types";
import type { ContactEmailStatus, ContactStatus } from "@/types/enums";

export interface GetAllContactMessagesParams extends PaginationQuery {
  customerId?: string;
  status?: ContactStatus;
  emailStatus?: ContactEmailStatus;
  sessionId?: string;
  fromDate?: string;
  toDate?: string;
}

export const communicationApi = {
  contactMessages: {
    getAll: async (
      params?: GetAllContactMessagesParams
    ): Promise<PaginationResult<ContactMessageResponse>> => {
      return axiosClient.get(API_ENDPOINTS.COMMUNICATION.CONTACT_MESSAGES, { params });
    },
    getById: async (id: string): Promise<Result<ContactMessageDetailResponse>> => {
      return axiosClient.get(API_ENDPOINTS.COMMUNICATION.CONTACT_MESSAGE_DETAIL(id));
    },
    create: async (
      body: CreateContactMessageRequest
    ): Promise<Result<ContactMessageResponse>> => {
      return axiosClient.post(API_ENDPOINTS.COMMUNICATION.CONTACT_MESSAGES, body);
    },
  },
};
