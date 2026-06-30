"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useSystemSettings } from "@/contexts/system-settings-context";
import { GraduationCap, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { settings } = useSystemSettings();

  const showWarning = (title: string, text: string) => {
    Swal.fire({
      icon: "warning",
      title,
      text,
      confirmButtonText: "ตกลง",
      confirmButtonColor: "#f59e0b", // amber-500
    });
  };

  const showError = (text: string) => {
    Swal.fire({
      icon: "error",
      title: "เข้าสู่ระบบไม่สำเร็จ",
      text,
      confirmButtonText: "ตกลง",
      confirmButtonColor: "#ef4444", // red-500
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔴 ตรวจว่ากรอกครบหรือยัง
    if (!email || !password) {
      showWarning(
        "ข้อมูลไม่ครบถ้วน",
        "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วนก่อนเข้าสู่ระบบ",
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await login(email, password);

      if (result.success) {
        router.push("/dashboard");
      } else {
        showError(result.error || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch {
      showError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const result = await loginWithGoogle();

    if (!result.success) {
      showError(result.error || "Google login failed");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-sidebar-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="mb-10 space-y-6">
              <div>
                <p className="text-sm text-sidebar-foreground/70">
                  ยินดีต้อนรับสู่
                </p>
                <h1 className="mt-1 text-3xl font-bold leading-tight">
                  {settings.systemName}
                </h1>
              </div>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6 text-balance">
              เชื่อมต่อศิษย์เก่า
              <br />
              <span className="text-sidebar-primary">
                สร้างเครือข่ายที่แข็งแกร่ง
              </span>
            </h1>

            <p className="text-lg text-sidebar-foreground/80 max-w-md leading-relaxed">
              {settings.systemTagline}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-12 grid grid-cols-3 gap-6"
          >
            {[
              { value: "10K+", label: "ศิษย์เก่า" },
              { value: "500+", label: "บริษัท" },
              { value: "1K+", label: "โอกาสงาน" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-sidebar-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-sidebar-foreground/70">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke="currentColor"
              strokeWidth="0.5"
              fill="none"
            />
            <circle
              cx="100"
              cy="100"
              r="60"
              stroke="currentColor"
              strokeWidth="0.5"
              fill="none"
            />
            <circle
              cx="100"
              cy="100"
              r="40"
              stroke="currentColor"
              strokeWidth="0.5"
              fill="none"
            />
          </svg>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="mb-8 flex flex-col items-center justify-center gap-4 text-center lg:hidden">
            {settings.loginLogoUrl ? (
              <img
                src={settings.loginLogoUrl}
                alt={settings.systemName}
                className="h-auto max-h-24 w-auto max-w-[240px] object-contain"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
            )}

            <div>
              <p className="mt-1 text-sm text-muted-foreground">
                {settings.systemTagline}
              </p>
            </div>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center">
                เข้าสู่ระบบ
              </CardTitle>
              <CardDescription className="text-center">
                กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} noValidate className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">อีเมล</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">รหัสผ่าน</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="รหัสผ่านของคุณ"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 "
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        เข้าสู่ระบบ
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="text-center text-sm">
                    <Link
                      href="/forgot-password"
                      className="text-primary hover:underline"
                    >
                      ลืมรหัสผ่าน?
                    </Link>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        หรือ
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 text-base font-medium bg-transparent"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    เข้าสู่ระบบด้วย Google
                  </Button>
                </div>

                {/* Register Link */}
                <div className="text-center text-sm text-muted-foreground">
                  ยังไม่มีบัญชี?{" "}
                  <Link
                    href="/register"
                    className="text-primary hover:underline font-medium"
                  >
                    ลงทะเบียนที่นี่
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
