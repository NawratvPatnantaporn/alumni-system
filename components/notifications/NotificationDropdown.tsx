"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Briefcase, CheckCheck, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getMyNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/app/features/notifications/services/notification.service";
import { cn } from "@/lib/utils";

type NotificationDropdownProps = {
  variant?: "icon" | "button";
};

export function NotificationDropdown({
  variant = "icon",
}: NotificationDropdownProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const loadNotifications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await getMyNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error("LOAD NOTIFICATIONS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    loadNotifications();

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadNotifications();
        },
      )
      .subscribe();

    return () => {
      setTimeout(() => {
        supabase.removeChannel(channel);
      }, 0)
    };
  }, [user?.id]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      loadNotifications();
    }
  };

  const handleNotificationClick = async (notification: any) => {
    try {
      if (!notification.is_read) {
        await markNotificationAsRead(notification.id);

        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  is_read: true,
                  read_at: new Date().toISOString(),
                }
              : item,
          ),
        );
      }

      setOpen(false);

      if (notification.related_job_post_id) {
        router.push(`/opportunities/${notification.related_job_post_id}`);
        return;
      }

      router.push("/opportunities");
    } catch (error) {
      console.error("HANDLE NOTIFICATION CLICK ERROR:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    try {
      await markAllNotificationsAsRead(user.id);

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          is_read: true,
          read_at: new Date().toISOString(),
        })),
      );
    } catch (error) {
      console.error("MARK ALL NOTIFICATIONS ERROR:", error);
    }
  };

  const formatNotificationTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("th-TH", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) return null;

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        {variant === "icon" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("relative z-[89] grid h-11 w-11 place-items-center rounded-xl transition-all pointer-events-auto", "hover:bg-primary/10 hover:text-primary",
                open && "bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground",
            )}
          >
            <Bell className="pointer-events-none w-5 h-5" />

            {unreadCount > 0 && (
              <span className="pointer-events-none absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="relative rounded-xl gap-2"
          >
            <Bell className="w-4 h-4" />
            การแจ้งเตือน

            {unreadCount > 0 && (
              <Badge className="ml-1 bg-destructive text-destructive-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="z-[9999] w-[390px] p-0 overflow-hidden rounded-2xl shadow-2xl"
      >
        <div className="bg-gradient-to-br from-primary/10 via-background to-background px-4 py-4 border-b">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-base">การแจ้งเตือน</p>
              <p className="text-xs text-muted-foreground mt-1">
                {unreadCount > 0
                  ? `มีรายการที่ยังไม่ได้อ่าน ${unreadCount} รายการ`
                  : "ไม่มีการแจ้งเตือนใหม่"}
              </p>
            </div>

            {unreadCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                อ่านทั้งหมด
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-[430px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              กำลังโหลดการแจ้งเตือน...
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">ยังไม่มีการแจ้งเตือน</p>
              <p className="text-xs text-muted-foreground mt-1">
                เมื่อมีงานที่ตรงกับทักษะของคุณ ระบบจะแจ้งที่นี่
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleNotificationClick(notification)}
                className={`w-full text-left px-4 py-3 border-b transition hover:bg-muted/70 ${
                  !notification.is_read ? "bg-primary/5" : "bg-background"
                }`}
              >
                <div className="flex gap-3">
                  <div
                    className={`mt-1 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      !notification.is_read
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold line-clamp-1">
                        {notification.title}
                      </p>

                      {!notification.is_read && (
                        <span className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>

                    {notification.matched_skill_names?.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {notification.matched_skill_names.map((skill: string) => (
                          <Badge
                            key={`${notification.id}-${skill}`}
                            variant="secondary"
                            className="text-xs"
                          >
                            ตรงกับ {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    )}                      

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-muted-foreground">
                        {formatNotificationTime(notification.created_at)}
                      </span>

                      {notification.related_job_post_id && (
                        <span className="text-[11px] text-primary font-medium">
                          ดูโพสต์งาน
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="border-t px-4 py-3 bg-muted/20">
          <Link
            href="/opportunities"
            onClick={() => setOpen(false)}
            className="text-xs text-primary hover:underline font-medium"
          >
            ดูโอกาสงานทั้งหมด
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}