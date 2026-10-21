// ============================================================================
// RestaurantService Identity DTOs
// Đối chiếu: API.Contract.DTOs.Identity
// ============================================================================

import type { OtpPurpose } from "./enums";
import type { PaginationQuery } from "./common.types";

// Đối chiếu: API.Contract.DTOs.Identity.OtpVerifications.ResendVerificationRequest
export interface ResendVerificationRequest {
  email: string;
  purpose: OtpPurpose;
}

// Đối chiếu: API.Contract.DTOs.Identity.OtpVerifications.VerifyEmailRequest
export interface VerifyEmailRequest {
  email: string;
  code: string;
}

// Đối chiếu: API.Contract.DTOs.Identity.OtpVerifications.VerifyPasswordResetOtpRequest
export interface VerifyPasswordResetOtpRequest {
  email: string;
  code: string;
}

// Đối chiếu: API.Contract.DTOs.Identity.OtpVerifications.VerifyPasswordResetOtpResponse
export interface VerifyPasswordResetOtpResponse {
  resetToken: string;
}

// Đối chiếu: API.Contract.DTOs.Identity.PersonalProfiles.PersonalProfileResponse
export interface PersonalProfileResponse {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // DateOnly -> ISO "YYYY-MM-DD"
  gender: boolean;
  address: string;
  city: string;
  country: string;
  phone: string;
  citizenCardId: string;
  avatarUrl?: string | null;
  bio?: string | null;
}

// Đối chiếu: API.Contract.DTOs.Identity.PersonalProfiles.CreatePersonalProfileRequest
export interface CreatePersonalProfileRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: boolean;
  address: string;
  city: string;
  country: string;
  phone: string;
  citizenCardId: string;
}

// Đối chiếu: API.Contract.DTOs.Identity.PersonalProfiles.UpdatePersonalProfileRequest
export interface UpdatePersonalProfileRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: boolean;
  address: string;
  city: string;
  country: string;
  phone: string;
  citizenCardId: string;
}

// Đối chiếu: API.Contract.DTOs.Identity.PersonalProfiles.CompleteProfileRequest
export interface CompleteProfileRequest {
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: boolean;
  address: string;
  city: string;
  country: string;
  phone: string;
  citizenCardId: string;
}

// Đối chiếu: API.Contract.DTOs.Identity.Roles.RoleResponse
export interface RoleResponse {
  id: number;
  publicId: string;
  name: string;
  description?: string | null;
}

// Đối chiếu: API.Contract.DTOs.Identity.Users.UserResponse
export interface UserResponse {
  id: string;
  userName: string;
  email: string;
  roleId: number;
  roleName: string;
  isActive: boolean;
  isDeleted: boolean;
  fullName?: string | null;
  phone?: string | null;
  createdAt: string;
}

// Đối chiếu: API.Contract.DTOs.Identity.Users.UserDetailResponse
export interface UserDetailResponse {
  id: string;
  userName: string;
  email: string;
  roleId?: number;
  roleName: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  personalProfile?: PersonalProfileResponse | null;
}

// Đối chiếu: API.Contract.DTOs.Identity.Users.CreateUserRequest
export interface CreateUserRequest {
  userName: string;
  email: string;
  password: string;
  roleId: number;
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: boolean;
  phone?: string;
  citizenCardId?: string;
  address?: string;
  city?: string;
  country?: string;
}

// Đối chiếu: API.Contract.DTOs.Identity.Users.UpdateUserRequest
export interface UpdateUserRequest {
  userName: string;
  email: string;
  roleId: number;
  isActive: boolean;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: boolean;
  phone?: string;
  citizenCardId?: string;
  address?: string;
  city?: string;
  country?: string;
}

// Đối chiếu: API.Contract.DTOs.Identity.Users.UpdateUserStatusRequest
export interface UpdateUserStatusRequest {
  isActive: boolean;
}

// Đối chiếu: API.Contract.DTOs.Identity.Users.UpdateUserRoleRequest
export interface UpdateUserRoleRequest {
  roleId: number;
}

// Đối chiếu: API.Contract.DTOs.Identity.Users.AdminResetPasswordRequest
export interface AdminResetPasswordRequest {
  newPassword: string;
}

// Query parameters cho GetAll Users
export interface UserQueryParams extends PaginationQuery {
  roleId?: number;
  isActive?: boolean;
  isDeleted?: boolean;
}
