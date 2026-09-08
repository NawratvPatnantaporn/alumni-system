"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getFullName, getMyChatUnreadSummary } from "@/app/features/chat/services/chat.service";
import type { ChatUnreadSummaryItem } from "@/app/features/chat/types/chat";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, permissions } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Menu, X, Home, Users, Newspaper, Briefcase, BarChart3, Settings, LogOut, User, Bell, ChevronDown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationDropdown } from "../notifications/NotificationDropdown";
import { useSystemSettings } from "@/contexts/system-settings-context";

const navItems = [
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
    href: "/opportunities",
    label: "โอกาสงาน",
    icon: Briefcase,
    roles: ["alumni", "student", "admin", "super_admin"],
  },
  {
    href: "/insights",
    label: "วิเคราะห์ข้อมูล",
    icon: BarChart3,
    roles: ["admin", "super_admin"],
  },
  {
    href: "/admin",
    label: "จัดการระบบ",
    icon: Shield,
    roles: ["admin", "super_admin"],
  },
];

export function Navbar({
  onMenuClick,
  showBurger,
}: {
  onMenuClick: () => void;
  showBurger: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isMessagesPage = pathname?.startsWith("/messages");
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const chatSummaryRequestRef = useRef(0);
  const navbarMountedRef = useRef(false);

  const [messageDropdownOpen, setMessageDropdownOpen] = useState(false);
  const [chatUnreadItems, setChatUnreadItems] = useState<
    ChatUnreadSummaryItem[]
  >([]);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [chatUnreadLoading, setChatUnreadLoading] = useState(false);
  const messageDropdownRef = useRef<HTMLDivElement | null>(null);

  const { settings } = useSystemSettings();

  if (!user) return null;

  const filteredNavItems = navItems.filter(
    (item) => user?.role && item.roles.includes(user.role),
  );

  const getRoleBadge = () => {
    if (!user) return null;

    const roleConfig: Record<
      string,
      {
        label: string;
        className: string;
      }
    > = {
      super_admin: {
        label: "Super Admin",
        className: "bg-yellow-500 text-white",
      },
      admin: {
        label: "Admin",
        className: "bg-admin text-admin-foreground",
      },
      alumni: {
        label: "ศิษย์เก่า",
        className: "bg-alumni text-alumni-foreground",
      },
      student: {
        label: "นักศึกษา",
        className: "bg-student text-student-foreground",
      },
    };

    const config = roleConfig[user.role] ?? {
      label: "ผู้ใช้",
      className: "bg-muted text-muted-foreground",
    };

    return (
      <Badge className={cn("text-xs", config.className)}>{config.label}</Badge>
    );
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const formatChatTime = (value?: string | null) => {
    if (!value) return;

    const date = new Date(value);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const difMinutes = Math.floor(diffMs / 60000);
    const difHours = Math.floor(diffMs / 3600000);
    const difDays = Math.floor(diffMs / 86400000);

    if (difMinutes < 1) return "เมื่อสักครู่";
    if (difMinutes < 60) return `${difMinutes} นาทีที่แล้ว`;
    if (difHours < 24) return `${difHours} ชั่วโมงที่แล้ว`;
    if (difDays < 7) return `${difDays} วันที่แล้ว`;

    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
    });
  };

  const getChatProfileName = (item: ChatUnreadSummaryItem) => {
    const fullName =
      `${item.other_first_name ?? ""} ${item.other_last_name ?? ""}`.trim();
    return fullName || item.other_email || "ไม่ทราบชื่อ";
  };

  const getChatInitials = (item: ChatUnreadSummaryItem) => {
    return getChatProfileName(item).slice(0, 2).toUpperCase();
  };

  const loadChatUnreadSummary = async (options?: { silent?: boolean }) => {
  if (!user?.id) return;

  const requestId = Date.now();
  chatSummaryRequestRef.current = requestId;

    try {
      if (!options?.silent) {
        setChatUnreadLoading(true);
      }

      const result = await getMyChatUnreadSummary(8);

      if (!navbarMountedRef.current) return;
      if (chatSummaryRequestRef.current !== requestId) return;

      if ((result as any).aborted) {
        return;
      }

      setChatUnreadItems(result.items);
      setChatUnreadCount(result.totalUnread);
    } catch (error: any) {
      const message = String(error?.message ?? error ?? "");

      const isAbortError =
        error?.name === "AbortError" ||
        message.includes("AbortError") ||
        message.includes("signal is aborted") ||
        message.includes("Request was aborted") ||
        message.includes("timeout or manual cancellation");

      if (!isAbortError) {
        console.error("LOAD CHAT UNREAD SUMMARY ERROR:", error);
      }
    } finally {
      if (
        navbarMountedRef.current &&
        chatSummaryRequestRef.current === requestId &&
        !options?.silent
      ) {
        setChatUnreadLoading(false);
      }
    }
  };

  useEffect(() => {
    navbarMountedRef.current = true;

    return () => {
      navbarMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    if (!isMessagesPage) {
      loadChatUnreadSummary();
    } else {
      setChatUnreadItems([]);
      setChatUnreadCount(0);
    }

    const interval = window.setInterval(() => {
      if (!isMessagesPage) {
        loadChatUnreadSummary({ silent: true });
      }
    }, 15000);

    return () => {
      window.clearInterval(interval);
    };
  }, [user?.id, isMessagesPage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!messageDropdownRef.current) return;

      if (!messageDropdownRef.current.contains(event.target as Node)) {
        setMessageDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-[99970] w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="w-full px-6">
        <div className="flex h-16 items-center justify-between">
          {showBurger && (
            <Button variant="ghost" size="icon" onClick={onMenuClick}>
              <Menu className="w-6 h-6" />
            </Button>
          )}

          {/* Logo */}
          <Link
            href={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-2.5"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center"
            >
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <span className="font-bold text-lg hidden sm:block">
              {settings.systemShortName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "realative z-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="pointer-events-none absolute inset-0 -z-10 bg-primary/10 rounded-lg"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Side */}
          <div className="relative z-[99980] flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {/* Messages */}
                <div ref={messageDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (isMessagesPage) {
                        setMessageDropdownOpen(false);
                        return;
                      }

                      setMessageDropdownOpen((prev) => !prev);
                      loadChatUnreadSummary({ silent: true });
                    }}
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-muted ${
                      isMessagesPage ? "bg-muted text-primary" : ""
                    }`}
                    aria-label="ข้อความ"
                  >
                    <MessageCircle className="h-5 w-5" />

                    {chatUnreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                        {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                      </span>
                    )}
                  </button>

                  {messageDropdownOpen && !isMessagesPage && (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-[99980] cursor-default bg-transparent"
                        onClick={() => setMessageDropdownOpen(false)}
                        aria-label="ปิดกล่องข้อความ"
                      />

                      <div className="fixed right-4 top-[72px] z-[99990] w-[calc(100vw-2rem)] max-w-[380px] overflow-hidden rounded-3xl border bg-background shadow-2xl md:right-24">
                        <div className="flex items-center justify-between border-b p-4">
                          <div>
                            <h3 className="text-lg font-bold">ข้อความ</h3>
                            <p className="text-xs text-muted-foreground">
                              ข้อความที่ยังไม่ได้อ่าน
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setMessageDropdownOpen(false);
                              router.push("/messages");
                            }}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            ดูทั้งหมด
                          </button>
                        </div>

                        <div className="max-h-[420px] overflow-y-auto p-2">
                          {chatUnreadLoading ? (
                            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              กำลังโหลดข้อความ...
                            </div>
                          ) : chatUnreadItems.length === 0 ? (
                            <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed p-4 text-center">
                              <MessageCircle className="mb-2 h-8 w-8 text-muted-foreground" />
                              <p className="text-sm font-medium">
                                ไม่มีข้อความใหม่
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                ข้อความที่ยังไม่ได้อ่านจะแสดงตรงนี้
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {chatUnreadItems.map((item) => (
                                <button
                                  key={item.conversation_id}
                                  type="button"
                                  onClick={() => {
                                    setMessageDropdownOpen(false);
                                    router.push(
                                      `/messages?conversationId=${item.conversation_id}`,
                                    );
                                  }}
                                  className="flex w-full gap-3 rounded-2xl p-3 text-left transition hover:bg-muted"
                                >
                                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-primary/10 text-primary">
                                    {item.other_avatar_url ? (
                                      <img
                                        src={item.other_avatar_url}
                                        alt={getChatProfileName(item)}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-sm font-bold">
                                        {getChatInitials(item)}
                                      </div>
                                    )}

                                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-blue-500" />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="truncate text-sm font-bold">
                                        {getChatProfileName(item)}
                                      </p>
                                      <span className="shrink-0 text-xs text-muted-foreground">
                                        {formatChatTime(item.last_message_at)}
                                      </span>
                                    </div>

                                    <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                                      {item.last_message || "ส่งข้อความถึงคุณ"}
                                    </p>

                                    <div className="mt-2 flex items-center justify-between">
                                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                                        {item.other_role === "student"
                                          ? "นักศึกษา"
                                          : item.other_role === "alumni"
                                            ? "ศิษย์เก่า"
                                            : item.other_role === "admin"
                                              ? "Admin"
                                              : item.other_role ===
                                                  "super_admin"
                                                ? "Super Admin"
                                                : "ผู้ใช้"}
                                      </span>

                                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                                        {item.unread_count > 99
                                          ? "99+"
                                          : item.unread_count}
                                      </span>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="border-t p-2">
                          <button
                            type="button"
                            onClick={() => {
                              setMessageDropdownOpen(false);
                              router.push("/messages");
                            }}
                            className="w-full rounded-2xl p-3 text-center text-sm font-medium text-primary transition hover:bg-muted"
                          >
                            เปิดข้อความทั้งหมด
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Notifications */}
                <NotificationDropdown variant="icon" />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 px-2"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={user.avatar || ""}
                          alt={user.firstName}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {`${user.firstName?.slice(0, 1) || ""}${user.lastName?.slice(0, 1) || ""}`}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden lg:flex flex-col items-start">
                        <span className="text-sm font-medium">
                          {user.firstName} {user.lastName}
                        </span>
                        {getRoleBadge()}
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        โปรไฟล์ของฉัน
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        ตั้งค่า
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      ออกจากระบบ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Menu Button */}
                {user.role === "alumni" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <Menu className="w-5 h-5" />
                    )}
                  </Button>
                )}
              </>
            ) : (
              <Link href="/login">
                <Button>เข้าสู่ระบบ</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
