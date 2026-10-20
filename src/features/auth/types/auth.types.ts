// ============================================================================
// Auth Feature Types
// Re-export từ @/types để đảm bảo tính nhất quán và Single Source of Truth
// ============================================================================

export type {
  LoginRequest,
  RegisterRequest,
  AuthenticationResponse,
  RefreshTokenRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/types/authentication.types";

export type {
  UserResponse,
  UserDetailResponse,
  PersonalProfileResponse,
  CreatePersonalProfileRequest,
  UpdatePersonalProfileRequest,
  CompleteProfileRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  VerifyPasswordResetOtpRequest,
  VerifyPasswordResetOtpResponse,
} from "@/types/identity.types";
