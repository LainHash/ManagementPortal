import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { STORAGE_KEYS } from "@/constants/app.constants";
import { authApi } from "@/features/auth/api/auth.api";
import type {
  LoginRequest,
  UserDetailResponse,
} from "@/features/auth/types/auth.types";

interface AuthContextType {
  user: UserDetailResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserDetailResponse | null>(() => {
    if (typeof window === "undefined") return null;
    const cached = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async () => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await authApi.getCurrentUser();
      if (res.isSucceed && res.data) {
        setUser(res.data);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(res.data));
      } else {
        setUser(null);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
    } catch {
      // Token might be invalid or network issue
      setUser(null);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (
    credentials: LoginRequest
  ): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials);
      if (res.isSucceed && res.data) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, res.data.token);
        if (res.data.refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, res.data.refreshToken);
        }

        // Fetch detailed profile immediately
        const userRes = await authApi.getCurrentUser();
        if (userRes.isSucceed && userRes.data) {
          setUser(userRes.data);
          localStorage.setItem(
            STORAGE_KEYS.USER_DATA,
            JSON.stringify(userRes.data)
          );
        } else {
          // Fallback basic user from auth response
          const basicUser: UserDetailResponse = {
            id: res.data.userId,
            userName: res.data.userName,
            email: res.data.email,
            roleName: "User",
          };
          setUser(basicUser);
          localStorage.setItem(
            STORAGE_KEYS.USER_DATA,
            JSON.stringify(basicUser)
          );
        }

        return {
          success: true,
          message: res.message || "Đăng nhập thành công!",
        };
      } else {
        return {
          success: false,
          message: res.message || "Đăng nhập không thành công, vui lòng kiểm tra lại thông tin.",
        };
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.title ||
        err.message ||
        "Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.";
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || undefined
        : undefined;

    try {
      await authApi.logout(refreshToken);
    } catch {
      // Ignore logout errors
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      }
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
