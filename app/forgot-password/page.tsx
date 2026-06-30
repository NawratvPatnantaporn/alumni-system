"use client";

import React from "react"

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  GraduationCap,
  ArrowLeft,
  Mail,
  Loader2,
  CheckCircle2,
  KeyRound,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
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
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-sidebar-primary flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-sidebar-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">Alumni Connect</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6 text-balance">
              ลืมรหัสผ่าน?
              <br />
              <span className="text-sidebar-primary">ไม่ต้องกังวล</span>
            </h1>

            <p className="text-lg text-sidebar-foreground/80 max-w-md leading-relaxed">
              กรอกอีเมลที่ลงทะเบียนไว้ เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้คุณ
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-12 space-y-4"
          >
            <div className="flex items-center gap-4 p-4 bg-sidebar-accent/30 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-sidebar-primary" />
              </div>
              <div>
                <div className="font-medium">ขั้นตอนที่ 1</div>
                <div className="text-sm text-sidebar-foreground/70">
                  กรอกอีเมลที่ลงทะเบียนไว้
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-sidebar-accent/30 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-sidebar-primary" />
              </div>
              <div>
                <div className="font-medium">ขั้นตอนที่ 2</div>
                <div className="text-sm text-sidebar-foreground/70">
                  ตรวจสอบกล่องจดหมายของคุณ
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-sidebar-accent/30 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-sidebar-primary" />
              </div>
              <div>
                <div className="font-medium">ขั้นตอนที่ 3</div>
                <div className="text-sm text-sidebar-foreground/70">
                  ตั้งรหัสผ่านใหม่
                </div>
              </div>
            </div>
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

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Alumni Connect</span>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center">
                รีเซ็ตรหัสผ่าน
              </CardTitle>
              <CardDescription className="text-center">
                กรอกอีเมลที่ลงทะเบียนไว้เพื่อรับลิงก์รีเซ็ตรหัสผ่าน
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email">อีเมล</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-destructive text-center"
                      >
                        {error}
                      </motion.p>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "ส่งลิงก์รีเซ็ตรหัสผ่าน"
                      )}
                    </Button>

                    <div className="text-center">
                      <Link
                        href="/login"
                        className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        กลับไปหน้าเข้าสู่ระบบ
                      </Link>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                      className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-4 flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-2">
                      ส่งอีเมลเรียบร้อยแล้ว
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยัง
                      <br />
                      <span className="font-medium text-foreground">
                        {email}
                      </span>
                      <br />
                      กรุณาตรวจสอบกล่องจดหมายของคุณ
                    </p>

                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => {
                          setIsSubmitted(false);
                          setEmail("");
                        }}
                      >
                        ส่งอีกครั้ง
                      </Button>
                      <Link href="/login">
                        <Button variant="ghost" className="w-full">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          กลับไปหน้าเข้าสู่ระบบ
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-muted/50 rounded-xl text-center"
          >
            <p className="text-sm text-muted-foreground">
              ไม่ได้รับอีเมล? ตรวจสอบโฟลเดอร์ Spam หรือ
              <br />
              <Link href="/help" className="text-primary hover:underline">
                ติดต่อฝ่ายสนับสนุน
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
