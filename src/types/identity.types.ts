// ============================================================================
// RestaurantService Identity DTOs
// Đối chiếu: API.Contract.DTOs.Identity
// ============================================================================

import type { OtpPurpose } from "./enums";

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
  avatarUrl?: string | null; // Thuộc tính mở rộng UI cho avatar hiển thị
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

// Đối chiếu: API.Contract.DTOs.Identity.Users.UserResponse
export interface UserResponse {
  id: string;
  userName: string;
  email: string;
  roleName: string;
}

// Đối chiếu: API.Contract.DTOs.Identity.Users.UserDetailResponse
export interface UserDetailResponse {
  id: string;
  userName: string;
  email: string;
  roleName: string;
  personalProfile?: PersonalProfileResponse | null;
}
