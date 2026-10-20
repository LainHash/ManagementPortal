// Đối chiếu: API.Contract.DTOs.Authentication.LoginRequest
export interface LoginRequest {
  identifier: string;
  password: string;
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

// Đối chiếu: API.Contract.DTOs.Identity.PersonalProfiles.PersonalProfileResponse
export interface PersonalProfileResponse {
  id?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  address?: string;
  dateOfBirth?: string;
  bio?: string;
}

// Đối chiếu: API.Contract.DTOs.Identity.Users.UserDetailResponse
export interface UserDetailResponse {
  id: string;
  userName: string;
  email: string;
  roleName: string;
  personalProfile?: PersonalProfileResponse | null;
}
