import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ChefHat,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { APP_CONFIG } from "@/constants/app.constants";

export function meta() {
  return [
    { title: "Đăng nhập | Restaurant Management Portal" },
    {
      name: "description",
      content: "Đăng nhập hệ thống quản lý chuỗi nhà hàng",
    },
  ];
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already authenticated, allow redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim()) {
      setErrorMessage("Vui lòng nhập tên đăng nhập hoặc email.");
      return;
    }
    if (!password) {
      setErrorMessage("Vui lòng nhập mật khẩu.");
      return;
    }

    setIsLoading(true);
    const result = await login({
      identifier: identifier.trim(),
      password,
    });
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage("Đăng nhập thành công! Đang chuyển hướng...");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 700);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleFillDemo = (username: string, pass: string) => {
    setIdentifier(username);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/25">
            <ChefHat className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {APP_CONFIG.NAME}
          </h1>
          <p className="text-xs text-slate-400">
            Hệ thống điều hành và quản lý nội bộ nhà hàng
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-800 bg-slate-900/90 text-slate-100 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-white">
              Đăng nhập tài khoản
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Nhập thông tin xác thực để truy cập vào hệ thống
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Error Alert */}
              {errorMessage && (
                <div className="flex items-start gap-2.5 rounded-lg bg-red-950/60 border border-red-800/80 p-3 text-xs text-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Alert */}
              {successMessage && (
                <div className="flex items-start gap-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 p-3 text-xs text-emerald-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Username/Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Tên đăng nhập hoặc Email
                </label>
                <Input
                  type="text"
                  placeholder="admin hoặc email@domain.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  icon={<User className="h-4 w-4" />}
                  className="bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                  disabled={isLoading}
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">
                    Mật khẩu
                  </label>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock className="h-4 w-4" />}
                    className="bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500 pr-10 focus-visible:ring-indigo-500"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                isLoading={isLoading}
              >
                <span>Đăng nhập</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </form>

          {/* Demo account quick fill */}
          <CardFooter className="flex flex-col border-t border-slate-800/80 pt-4 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span>Gợi ý tài khoản demo từ hệ thống:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full pt-1">
              <button
                type="button"
                onClick={() => handleFillDemo("superadmin", "Admin@123456")}
                className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-2 text-left hover:border-indigo-500/60 transition-colors"
              >
                <span className="block font-semibold text-slate-200 text-[11px]">
                  SuperAdmin
                </span>
                <span className="block text-[10px] text-slate-400 truncate">
                  superadmin
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("manager", "Manager@123456")}
                className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-2 text-left hover:border-indigo-500/60 transition-colors"
              >
                <span className="block font-semibold text-slate-200 text-[11px]">
                  Manager
                </span>
                <span className="block text-[10px] text-slate-400 truncate">
                  manager
                </span>
              </button>
            </div>

            <div className="pt-2 text-center">
              <Link to="/" className="text-xs text-indigo-400 hover:underline">
                ← Quay lại trang tổng quan
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
