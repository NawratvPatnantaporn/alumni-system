import React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/contexts/auth-context";
import { SystemSettingsProvider } from "@/contexts/system-settings-context";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sripatum Alumni",
  description:
    "แพลตฟอร์มสำหรับศิษย์เก่า นักศึกษา และมหาวิทยาลัย เพื่อเชื่อมต่อ แบ่งปันโอกาส และสร้างความสำเร็จร่วมกัน",
  generator: "v0.app",
};

export const viewport: Viewport = {
  themeColor: "#3730a3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="font-sans antialiased">
        <AuthProvider>
          <SystemSettingsProvider>
          {children}
          </SystemSettingsProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}