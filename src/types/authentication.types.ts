// ============================================================================
// RestaurantService Authentication DTOs
// Đối chiếu: API.Contract.DTOs.Authentication
// ============================================================================

// Đối chiếu: API.Contract.DTOs.Authentication.LoginRequest
export interface LoginRequest {
  identifier: string;
  password: string;
}

// Đối chiếu: API.Contract.DTOs.Authentication.RegisterRequest
export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Đối chiếu: API.Contract.DTOs.Authentication.AuthenticationResponse
export interface AuthenticationResponse {
  userId: string;
  userName: string;
  email: string;
  token: string;
  refreshToken: string;
}

// Đối chiếu: API.Contract.DTOs.Authentication.RefreshTokenRequest
export interface RefreshTokenRequest {
  refreshToken: string;
}

// Đối chiếu: API.Contract.DTOs.Authentication.ChangePasswordRequest
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Đối chiếu: API.Contract.DTOs.Authentication.ForgotPasswordRequest
export interface ForgotPasswordRequest {
  email: string;
}

// Đối chiếu: API.Contract.DTOs.Authentication.ResetPasswordRequest
export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}
