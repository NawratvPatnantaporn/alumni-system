"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Home, Users, Newspaper, Briefcase, BarChart3, Settings, User, Shield, Calendar, HelpCircle, GraduationCap, Slice, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useSystemSettings } from "@/contexts/system-settings-context";

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const mainNavItems = [
  {
    href: "/dashboard",
    label: "หน้าหลัก",
    icon: Home,
    roles: ["alumni", "student", "admin", "super_admin"],
  },
  {
    href: "/directory",
    label: "ค้นหาศิษย์เก่า",
    icon: Users,
    roles: ["alumni", "admin", "super_admin"],
  },
  {
    href: "/news",
    label: "ข่าวสาร",
    icon: Newspaper,
    roles: ["alumni", "student", "admin", "super_admin"],
  },
  {
    href: "/events",
    label: "กิจกรรม",
    icon: Calendar,
    roles: ["alumni", "student", "admin", "super_admin"],
  },
  {
    href: "/opportunities",
    label: "โอกาสอาชีพ",
    icon: Briefcase,
    roles: ["alumni", "student", "admin", "super_admin"],
  },
  {
    href: "/messages",
    label: "ข้อความ",
    icon: MessageCircle,
    roles: ["alumni", "student", "admin", "super_admin"],
  },
];

const adminNavItems = [
  { href: "/admin", label: "แดชบอร์ด Admin", icon: Shield },
  {
    href: "/insights",
    label: "วิเคราะห์ข้อมูล",
    icon: BarChart3,
    roles: ["admin", "super_admin"],
  },
  // { href: "/admin/analytics", label: "วิเคราะห์ข้อมูล", icon: BarChart3 },
  // { href: "/admin/users", label: "จัดการผู้ใช้", icon: Users },
  // { href: "/admin/news", label: "จัดการข่าวสาร", icon: Newspaper },
  // { href: "/admin/verify", label: "ยืนยันศิษย์เก่า", icon: GraduationCap },
];

const bottomNavItems = [
  { href: "/profile", label: "โปรไฟล์", icon: User },
  { href: "/settings", label: "ตั้งค่า", icon: Settings },
  { href: "/help", label: "ช่วยเหลือ", icon: HelpCircle },
];

const isAdminRole = (role?: string) =>
  role === "admin" || role === "super_admin";

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { settings } = useSystemSettings();

  if (!user) return null;

  const filteredMainNav = mainNavItems.filter((item) =>
    item.roles.includes(user.role),
  );

  const getRoleColor = () => {
    switch (user.role) {
      case "super_admin":
        return "bg-super-admin";
      case "admin":
        return "bg-admin";
      case "alumni":
        return "bg-alumni";
      case "student":
        return "bg-student";
      default:
        return "bg-primary";
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-sidebar transition-transform text-sidebar-foreground border-r border-sidebar-border duration-300 flex-1 flex flex-col lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 border-b border-sidebar-border">
          <div className=" flex items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-sidebar-primary-foreground" />
              </div>
              <span className="font-bold text-lg">
                {settings.systemShortName}
              </span>
            </Link>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-sidebar-accent lg:hidden">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* User Profile Summary */}
        <div className="rounded-xl bg-sidebar-accent/50 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={user.avatar || ""}
                alt={user.firstName}
              />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                {`${user.firstName?.slice(0, 1) || ""}${user.lastName?.slice(0, 1) || ""}`}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {user.firstName} {user.lastName}
              </p>
              <Badge
                className={cn(
                  "text-[10px] mt-0.5",
                  getRoleColor(),
                  "text-white",
                )}
              >
                {user.role === "super_admin"
                  ? "Super Admin"
                  : user.role === "admin"
                    ? "Admin"
                    : user.role === "alumni"
                      ? "ศิษย์เก่า"
                      : "นักศึกษา"}
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-sidebar-foreground/70">โปรไฟล์สมบูรณ์</span>
              <span className="font-medium">{user.profileCompletion}%</span>
            </div>
            <Progress value={user.profileCompletion} className="h-1.5" />
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2 px-3">
            เมนูหลัก
          </p>
          {filteredMainNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </motion.div>
              </Link>
            );
          })}

          {/* Admin Section */}
          {isAdminRole(user.role) && (
            <>
              <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mt-6 mb-2 px-3">
                การจัดการ
              </p>
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Bottom Navigation */}
        <div className="mt-auto p-4 border-t border-sidebar-border space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
