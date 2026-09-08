"use client";

import { supabase } from "@/lib/supabase/client";
import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Users, UserCheck, GraduationCap, Briefcase, Newspaper, CalendarDays, Loader2, Shield, Activity, Bell, Settings, BarChart3, FileText, UserPlus, Crown, Search, Filter, ChevronLeft, ChevronRight, Power, Trash2, CheckCircle2, XCircle, Edit2, Eye } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminContentDialogs } from "./AdminContentDialog";
import { getAdminUsers, updateAdminUserRole, updateAdminUserActiveStatus, deleteAdminUserProfile, getPendingAlumniApprovals, approveAlumniUser, rejectAlumniUser, getAlumniVerificationDetail, type AdminUserItem, type AlumniVerificationDetail } from "@/app/features/admin/services/adminUser.service";
import Swal from "sweetalert2";

import { getAdminOverview, getRecentAdminActivities } from "@/app/features/admin/services/adminDashboard.service";
import { Input } from "@/components/ui/input";

import { getNewsList, getEventsList, deleteNews, deleteEvent, toggleNewsPublished, toggleEventPublished } from "@/app/features/admin/services/adminContentManage.service";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { SuperAdminSystemSettings } from "@/app/features/admin/components/SuperAdminSystemSettings";

type Overview = {
  totalUsers: number;
  alumniCount: number;
  studentCount: number;
  adminCount: number;
  superAdminCount: number;
  jobCount: number;
  newsCount: number;
  eventCount: number;
};

type ActivityItem = {
  id: string;
  title: string;
  description: string | null;
  actorName?: string | null;
  acthorName?: string | null;
  actorId?: string | null;
  acthorId?: string | null;
  actorRole?: string | null;
  acthorRole?: string | null;
  type: string;
  createdAt: string;
};

const emptyOverview: Overview = {
  totalUsers: 0,
  alumniCount: 0,
  studentCount: 0,
  adminCount: 0,
  superAdminCount: 0,
  jobCount: 0,
  newsCount: 0,
  eventCount: 0,
};

const getActivityLabel = (type: string) => {
  switch (type) {
    case "news_created":
      return "สร้างข่าวสาร";
    case "event_created":
      return "สร้างกิจกรรม";
    case "job_created":
      return "โพสต์งานใหม่";
    case "job_applied":
      return "มีผู้สมัครงาน";
    case "profile_updated":
      return "อัปเดตโปรไฟล์";
    case "user_created":
      return "สร้างผู้ใช้ใหม่";
    default:
      return type;
  }
};

const getActivityCategory = (type: string) => {
  if (type.includes("news")) return "news";
  if (type.includes("event")) return "event";
  if (type.includes("profile")) return "profile";
  if (type.includes("job")) return "job";
  if (type.includes("user")) return "user";
  return "system";
};

const getActivityCategoryLabel = (category: string) => {
  switch (category) {
    case "news":
      return "ข่าวสาร";
    case "event":
      return "กิจกรรม";
    case "profile":
      return "โปรไฟล์";
    case "job":
      return "งาน";
    case "user":
      return "ผู้ใช้";
    case "system":
      return "ระบบ";
    default:
      return "ทั้งหมด";
  }
};

export default function AdminPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState<Overview>(emptyOverview);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogType, setDialogType] = useState<
    "news" | "event" | "user" | null
  >(null);
  const [activitySearch, setActivitySearch] = useState("");
  const [activityCategory, setActivityCategory] = useState("all");
  const [adminUsers, setAdminUsers] = useState<AdminUserItem[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [approvalUsers, setApprovalUsers] = useState<AdminUserItem[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState(false);
  const [approvalTodayStats, setApprovalTodayStats] = useState({
    approvedToday: 0,
    rejectedToday: 0,
  });
  const [selectedApprovalProfile, setSelectedApprovalProfile] =
    useState<AlumniVerificationDetail | null>(null);

  const [profilePreviewOpen, setProfilePreviewOpen] = useState(false);
  const [profilePreviewLoading, setProfilePreviewLoading] = useState(false);
  const [contentType, setContentType] = useState<"news" | "event">("news");
  const [contentList, setContentList] = useState<any[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentSearch, setContentSearch] = useState("");
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);

  const userPageSize = 10;

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const loadContent = async () => {
    try {
      setContentLoading(true);

      const data =
        contentType === "news"
          ? await getNewsList(contentSearch)
          : await getEventsList(contentSearch);

      setContentList(data);
    } catch (error) {
      console.error("LOAD CONTENT ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "โหลดข้อมูลไม่สำเร็จ",
      });
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "content") {
      loadContent();
    }
  }, [activeTab, contentType]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (activeTab === "content") loadContent();
    }, 400);

    return () => clearTimeout(delay);
  }, [contentSearch]);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      const [overviewData, activityData] = await Promise.all([
        getAdminOverview(),
        getRecentAdminActivities(),
      ]);

      setOverview({
        ...emptyOverview,
        ...overviewData,
      });

      setActivities(activityData ?? []);
    } catch (error) {
      console.error("LOAD ADMIN DATA ERROR:", error);
      alert("โหลดข้อมูล Admin ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const loadApprovalTodayStats = async () => {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("admin_activity_logs")
        .select("action_type, created_at")
        .in("action_type", ["alumni_approved", "alumni_rejected"])
        .gte("created_at", startOfToday.toISOString());

      if (error) throw error;

      setApprovalTodayStats({
        approvedToday:
          data?.filter((item) => item.action_type === "alumni_approved")
            .length ?? 0,
        rejectedToday:
          data?.filter((item) => item.action_type === "alumni_rejected")
            .length ?? 0,
      });
    } catch (error) {
      console.error("LOAD APPROVAL TODAY STATS ERROR:", error);
    }
  };

  const loadApprovals = async () => {
    try {
      setApprovalsLoading(true);

      const data = await getPendingAlumniApprovals();
      setApprovalUsers(data);
    } catch (error) {
      console.error("LOAD APPROVALS ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "โหลดรายการรออนุมัติไม่สำเร็จ",
        text: "ตรวจสอบ RLS Policy หรือ Console",
      });
    } finally {
      setApprovalsLoading(false);
    }
  };

  const loadAdminUsers = async () => {
    try {
      setUsersLoading(true);

      const result = await getAdminUsers({
        search: userSearch,
        role: userRoleFilter,
        page: userPage,
        pageSize: userPageSize,
      });

      setAdminUsers(result.users);
      setUserTotal(result.total);
    } catch (error) {
      console.error("LOAD ADMIN USERS ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "โหลดผู้ใช้ไม่สำเร็จ",
        text: "ตรวจสอบ Console หรือ RLS Policy",
      });
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && activeTab === "users") {
      loadAdminUsers();
    }
  }, [isAdmin, activeTab, userPage, userRoleFilter]);

  useEffect(() => {
    if (!isAdmin || activeTab !== "users") return;

    const timer = setTimeout(() => {
      setUserPage(1);
      loadAdminUsers();
    }, 400);

    return () => clearTimeout(timer);
  }, [userSearch]);

  useEffect(() => {
    if (isAdmin) {
      loadApprovals();
      loadApprovalTodayStats();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && activeTab === "approvals") {
      loadApprovals();
    }
  }, [isAdmin, activeTab]);

  const filteredActivities = useMemo(() => {
    const keyword = activitySearch.trim().toLowerCase();

    return activities.filter((item) => {
      const actorName = item.actorName ?? item.acthorName ?? "";
      const actorRole = item.actorRole ?? item.acthorRole ?? "";
      const category = getActivityCategory(item.type);

      const matchCategory =
        activityCategory === "all" || category === activityCategory;

      const searchableText = [
        item.title,
        item.description,
        item.type,
        getActivityLabel(item.type),
        actorName,
        actorRole,
        item.actorId,
        item.acthorId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch = !keyword || searchableText.includes(keyword);

      return matchCategory && matchSearch;
    });
  }, [activities, activitySearch, activityCategory]);

  const totalUserPages = Math.max(1, Math.ceil(userTotal / userPageSize));

  const getUserDisplayName = (item: AdminUserItem) => {
    const fullName = [item.firstName, item.lastName].filter(Boolean).join(" ");
    return fullName || item.email || "ไม่ระบุชื่อ";
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "student":
        return "นักศึกษา";
      case "alumni":
        return "ศิษย์เก่า";
      case "admin":
        return "Admin";
      case "super_admin":
        return "Super Admin";
      default:
        return role;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-300";
      case "admin":
        return "bg-blue-500/10 text-blue-700 border-blue-300";
      case "alumni":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-300";
      case "student":
        return "bg-violet-500/10 text-violet-700 border-violet-300";
      default:
        return "";
    }
  };

  const handleChangeUserRole = async (
    targetUser: AdminUserItem,
    nextRole: "student" | "alumni" | "admin",
  ) => {
    if (targetUser.role === "super_admin") {
      Swal.fire({ icon: "warning", title: "ไม่สามารถแก้ Super Admin ได้" });
      return;
    }

    if (user?.role !== "super_admin" && nextRole === "admin") {
      Swal.fire({
        icon: "warning",
        title: "เฉพาะ Super Admin เท่านั้นที่ตั้ง Admin ได้",
      });
      return;
    }

    const confirm = await Swal.fire({
      icon: "question",
      title: "ยืนยันการเปลี่ยน Role?",
      text: `${getUserDisplayName(targetUser)} → ${getRoleLabel(nextRole)}`,
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirm.isConfirmed) return;

    try {
      await updateAdminUserRole(targetUser.id, nextRole);
      await loadAdminUsers();
      await loadAdminData();

      Swal.fire({
        icon: "success",
        title: "อัปเดต Role สำเร็จ",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1800,
      });
    } catch (error) {
      console.error("CHANGE USER ROLE ERROR:", error);
      Swal.fire({ icon: "error", title: "อัปเดต Role ไม่สำเร็จ" });
    }
  };

  const handleToggleUserStatus = async (targetUser: AdminUserItem) => {
    if (targetUser.id === user?.id) {
      Swal.fire({ icon: "warning", title: "ไม่สามารถปิดบัญชีตัวเองได้" });
      return;
    }

    if (targetUser.role === "super_admin") {
      Swal.fire({
        icon: "warning",
        title: "ไม่สามารถปิดบัญชี Super Admin ได้",
      });
      return;
    }

    const nextStatus = !targetUser.isActive;

    const confirm = await Swal.fire({
      icon: "question",
      title: nextStatus
        ? "เปิดใช้งานบัญชีนี้?"
        : "หากปิดใช้งานบัญชีนี้ ผู้ใช้จะไม่สามารถเข้าใช้ระบบได้",
      text: getUserDisplayName(targetUser),
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirm.isConfirmed) return;

    try {
      await updateAdminUserActiveStatus(targetUser.id, nextStatus);
      await loadAdminUsers();

      Swal.fire({
        icon: "success",
        title: nextStatus ? "เปิดใช้งานบัญชีแล้ว" : "ปิดใช้งานบัญชีแล้ว",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1800,
      });
    } catch (error) {
      console.error("TOGGLE USER STATUS ERROR:", error);
      Swal.fire({ icon: "error", title: "อัปเดตสถานะไม่สำเร็จ" });
    }
  };

  const handleDeleteUser = async (targetUser: AdminUserItem) => {
    if (targetUser.id === user?.id) {
      Swal.fire({ icon: "warning", title: "ไม่สามารถลบบัญชีตัวเองได้" });
      return;
    }

    if (targetUser.role === "super_admin") {
      Swal.fire({ icon: "warning", title: "ไม่สามารถลบ Super Admin ได้" });
      return;
    }

    const confirm = await Swal.fire({
      icon: "warning",
      title: "ลบผู้ใช้นี้?",
      text: `ต้องการลบ ${getUserDisplayName(targetUser)} ใช่ไหม`,
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteAdminUserProfile(targetUser.id);
      await loadAdminUsers();
      await loadAdminData();

      Swal.fire({
        icon: "success",
        title: "ลบผู้ใช้สำเร็จ",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1800,
      });
    } catch (error) {
      console.error("DELETE USER ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "ลบผู้ใช้ไม่สำเร็จ",
        text: "ถ้าติด auth.users ต้องทำผ่าน server/service role",
      });
    }
  };

  const handleOpenApprovalProfile = async (targetUser: AdminUserItem) => {
    try {
      setProfilePreviewOpen(true);
      setProfilePreviewLoading(true);
      setSelectedApprovalProfile(null);

      const data = await getAlumniVerificationDetail(targetUser.id);
      setSelectedApprovalProfile(data);
    } catch (error) {
      console.error("LOAD APPROVAL PROFILE DETAIL ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "โหลดโปรไฟล์ไม่สำเร็จ",
        text: "ตรวจสอบ RLS Policy หรือ Console",
      });
      setProfilePreviewOpen(false);
    } finally {
      setProfilePreviewLoading(false);
    }
  };

  const handleApproveAlumni = async (targetUser: AdminUserItem) => {
    const confirm = await Swal.fire({
      icon: "question",
      title: "อนุมัติเป็นศิษย์เก่า?",
      text: getUserDisplayName(targetUser),
      showCancelButton: true,
      confirmButtonText: "อนุมัติ",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirm.isConfirmed) return;

    try {
      await approveAlumniUser(targetUser.id);

      await supabase.from("admin_activity_logs").insert({
        actor_id: user?.id,
        action_type: "alumni_approved",
        title: `อนุมัติศิษย์เก่า: ${getUserDisplayName(targetUser)}`,
        description: `อนุมัติบัญชี ${targetUser.email} เป็นศิษย์เก่า`,
        target_user_id: targetUser.id,
      });

      await loadApprovals();
      await loadAdminData();

      await loadApprovalTodayStats();

      Swal.fire({
        icon: "success",
        title: "อนุมัติศิษย์เก่าสำเร็จ",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1800,
      });
    } catch (error) {
      console.error("APPROVE ALUMNI ERROR:", error);
      Swal.fire({ icon: "error", title: "อนุมัติไม่สำเร็จ" });
    }
  };

  const handleRejectAlumni = async (targetUser: AdminUserItem) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "ปฏิเสธคำขอศิษย์เก่า?",
      text: `${getUserDisplayName(targetUser)} จะถูกเปลี่ยนเป็น role นักศึกษา`,
      showCancelButton: true,
      confirmButtonText: "ปฏิเสธและเปลี่ยนเป็นนักศึกษา",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    try {
      await rejectAlumniUser(targetUser.id);

      await supabase.from("admin_activity_logs").insert({
        actor_id: user?.id,
        action_type: "alumni_rejected",
        title: `ปฏิเสธศิษย์เก่า: ${getUserDisplayName(targetUser)}`,
        description: `เปลี่ยนบัญชี ${targetUser.email} กลับเป็นนักศึกษา`,
        target_user_id: targetUser.id,
      });

      await loadApprovals();
      await loadAdminData();

      await loadApprovalTodayStats();

      Swal.fire({
        icon: "success",
        title: "ปฏิเสธแล้ว",
        text: "ผู้ใช้ถูกเปลี่ยนเป็นนักศึกษา",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1800,
      });
    } catch (error) {
      console.error("REJECT ALUMNI ERROR:", error);
      Swal.fire({ icon: "error", title: "ปฏิเสธไม่สำเร็จ" });
    }
  };

  const pendingApprovalCount = approvalUsers.length;

  const userStatCards = [
    {
      title: "ผู้ใช้ทั้งหมด",
      value: overview.totalUsers,
      icon: Users,
      hint: "บัญชีทั้งหมดในระบบ",
      tone: "blue" as const,
    },
    {
      title: "ศิษย์เก่า",
      value: overview.alumniCount,
      icon: UserCheck,
      hint: "ผู้ใช้ role alumni",
      tone: "emerald" as const,
    },
    {
      title: "นักศึกษา",
      value: overview.studentCount,
      icon: GraduationCap,
      hint: "ผู้ใช้ role student",
      tone: "violet" as const,
    },
    {
      title: "Admin",
      value: overview.adminCount,
      icon: Shield,
      hint: "ผู้ดูแลระบบ",
      tone: "indigo" as const,
    },
    {
      title: "Super Admin",
      value: overview.superAdminCount,
      icon: Crown,
      hint: "ผู้ดูแลสูงสุด",
      tone: "yellow" as const,
    },
  ];

  const contentStatCards = [
    {
      title: "ข่าวสาร",
      value: overview.newsCount,
      icon: Newspaper,
      hint: "ข่าวสารทั้งหมด",
      tone: "cyan" as const,
    },
    {
      title: "กิจกรรม",
      value: overview.eventCount,
      icon: CalendarDays,
      hint: "กิจกรรมทั้งหมด",
      tone: "pink" as const,
    },
  ];

  const approvalStatCards = [
    {
      title: "รอการยืนยัน",
      value: pendingApprovalCount,
      icon: Loader2,
      hint: "คำขอศิษย์เก่าที่ยังรอตรวจสอบ",
      tone: "amber" as const,
    },
    {
      title: "อนุมัติแล้ววันนี้",
      value: approvalTodayStats.approvedToday,
      icon: CheckCircle2,
      hint: "จำนวนที่อนุมัติในวันนี้",
      tone: "emerald" as const,
    },
    {
      title: "ปฏิเสธวันนี้",
      value: approvalTodayStats.rejectedToday,
      icon: XCircle,
      hint: "จำนวนที่ปฏิเสธในวันนี้",
      tone: "red" as const,
    },
  ];

  const overviewStatCards = [
    ...userStatCards.slice(0, 3),
    {
      title: "ตำแหน่งงาน",
      value: overview.jobCount,
      icon: Briefcase,
      hint: "ประกาศโอกาสงานทั้งหมด",
      tone: "amber" as const,
    },
    ...contentStatCards,
    ...userStatCards.slice(3),
  ];

  const currentStatCards =
    activeTab === "overview"
      ? overviewStatCards
      : activeTab === "users"
        ? userStatCards
        : activeTab === "content"
          ? contentStatCards
          : activeTab === "approvals"
            ? approvalStatCards
            : [];

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-3">
            <Shield className="w-10 h-10 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">ไม่มีสิทธิ์เข้าถึง</h2>
            <p className="text-sm text-muted-foreground">
              หน้านี้สำหรับผู้ดูแลระบบเท่านั้น
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        กำลังโหลดข้อมูลผู้ดูแลระบบ...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">แดชบอร์ด Admin</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            จัดการระบบ ผู้ใช้ ข่าวสาร กิจกรรม และเนื้อหาทั้งหมด
          </p>
        </div>

        <Badge className="w-fit rounded-full px-4 py-2">
          {user.role === "super_admin" ? "Super Admin" : "Admin"}
        </Badge>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 14, scale: 0.98, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, scale: 0.98, filter: "blur(6px)" }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className={
            activeTab === "system"
              ? "hidden"
              : activeTab === "approvals"
                ? "grid grid-cols-1 md:grid-cols-3 gap-4"
                : activeTab === "content"
                  ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                  : activeTab === "users"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4"
                    : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
          }
        >
          {currentStatCards.map((card, index) => (
            <motion.div
              key={`${activeTab}-${card.title}`}
              initial={{ opacity: 0, x: -18, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                duration: 0.28,
                delay: index * 0.045,
                ease: "easeOut",
              }}
            >
              <StatCard
                title={card.title}
                value={card.value}
                icon={card.icon}
                hint={card.hint}
                tone={card.tone}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full max-w-3xl flex-wrap">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            ภาพรวม
          </TabsTrigger>

          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            จัดการผู้ใช้
          </TabsTrigger>

          <TabsTrigger value="content" className="gap-2">
            <FileText className="h-4 w-4" />
            จัดการเนื้อหา
          </TabsTrigger>

          <TabsTrigger value="approvals" className="gap-2 relative">
            <Shield className="h-4 w-4" />
            รออนุมัติ
            {pendingApprovalCount > 0 && (
              <span className="ml-1 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white">
                {pendingApprovalCount}
              </span>
            )}
          </TabsTrigger>

          {user?.role === "super_admin" && (
            <TabsTrigger value="system" className="gap-2">
              <Settings className="h-4 w-4" />
              ตั้งค่าระบบ
            </TabsTrigger>
          )}
        </TabsList>
      </Tabs>

      {activeTab === "overview" && (
        <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                กิจกรรมล่าสุด
              </CardTitle>
              <CardDescription>
                รายการล่าสุดจากผู้ใช้ โปรไฟล์ ข่าวสาร กิจกรรม งาน และการดูแลระบบ
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-[1fr_180px] gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    placeholder="ค้นหาชื่อ, role, รหัสผู้ใช้, รายละเอียด..."
                    className="pl-9"
                  />
                </div>

                <div className="relative">
                  <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <select
                    value={activityCategory}
                    onChange={(e) => setActivityCategory(e.target.value)}
                    className="w-full h-10 rounded-md border bg-background pl-9 pr-3 text-sm"
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="news">ข่าวสาร</option>
                    <option value="event">กิจกรรม</option>
                    <option value="profile">โปรไฟล์</option>
                    <option value="job">โอกาสอาชีพ</option>
                    <option value="user">ผู้ใช้</option>
                    <option value="system">ระบบ</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  "all",
                  "news",
                  "event",
                  "profile",
                  "job",
                  "user",
                  "system",
                ].map((category) => (
                  <Button
                    key={category}
                    type="button"
                    size="sm"
                    variant={
                      activityCategory === category ? "default" : "outline"
                    }
                    className="rounded-full"
                    onClick={() => setActivityCategory(category)}
                  >
                    {getActivityCategoryLabel(category)}
                  </Button>
                ))}
              </div>

              {filteredActivities.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  ไม่พบกิจกรรมที่ตรงกับเงื่อนไข
                </div>
              ) : (
                <div className="max-h-[520px] overflow-y-auto pr-2 space-y-3">
                  {filteredActivities.map((item) => {
                    const actorName = item.actorName ?? item.acthorName ?? null;
                    const actorRole = item.actorRole ?? item.acthorRole ?? "";
                    const category = getActivityCategory(item.type);

                    return (
                      <div
                        key={`${item.type}-${item.id}`}
                        className="flex items-start justify-between gap-4 rounded-xl border p-4 hover:bg-muted/30 transition"
                      >
                        <div className="flex gap-3">
                          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium">{item.title}</p>
                              <Badge
                                variant="secondary"
                                className="rounded-full"
                              >
                                {getActivityCategoryLabel(category)}
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description || getActivityLabel(item.type)}
                            </p>

                            <p className="text-xs text-muted-foreground mt-1">
                              {getActivityLabel(item.type)}
                            </p>

                            {actorName && (
                              <p className="text-xs text-muted-foreground mt-1">
                                โดย {actorName}
                                {actorRole ? ` • ${actorRole}` : ""}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="shrink-0 text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>ทางลัดสำหรับผู้ดูแลระบบ</CardDescription>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => setDialogType("news")}
              >
                <Newspaper className="w-5 h-5" />
                สร้างข่าวใหม่
              </Button>

              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => setDialogType("event")}
              >
                <CalendarDays className="w-5 h-5" />
                สร้างกิจกรรม
              </Button>

              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => setDialogType("user")}
              >
                <UserPlus className="w-5 h-5" />
                เพิ่มผู้ใช้
              </Button>

              <Button variant="outline" className="h-24 flex-col gap-2">
                <Bell className="w-5 h-5" />
                ส่งแจ้งเตือน
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "users" && (
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  จัดการผู้ใช้
                </CardTitle>
                <CardDescription>
                  ค้นหา กรอง role เปลี่ยนสิทธิ์ เปิด/ปิดสถานะ
                  และจัดการบัญชีผู้ใช้
                </CardDescription>
              </div>

              <Button onClick={() => setDialogType("user")}>
                <UserPlus className="w-4 h-4 mr-2" />
                เพิ่มผู้ใช้
              </Button>
            </div>

            <div className="grid md:grid-cols-[1fr_190px] gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="ค้นหาชื่อ, email, รหัสนักศึกษา..."
                  className="pl-9"
                />
              </div>

              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    setUserPage(1);
                  }}
                  className="w-full h-10 rounded-md border bg-background pl-9 pr-3 text-sm"
                >
                  <option value="all">ทุก role</option>
                  <option value="student">นักศึกษา</option>
                  <option value="alumni">ศิษย์เก่า</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>พบ {userTotal.toLocaleString("th-TH")} ผู้ใช้</span>

              {usersLoading && (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังโหลด...
                </span>
              )}
            </div>

            <div className="rounded-2xl border overflow-hidden">
              <div className="max-h-[560px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
                    <tr className="text-left">
                      <th className="p-4 font-medium">ผู้ใช้</th>
                      <th className="p-4 font-medium">Role</th>
                      <th className="p-4 font-medium">สถานะ</th>
                      <th className="p-4 font-medium">โปรไฟล์</th>
                      <th className="p-4 font-medium">วันที่สร้าง</th>
                      <th className="p-4 font-medium text-right">จัดการ</th>
                    </tr>
                  </thead>

                  <tbody>
                    {adminUsers.length === 0 && !usersLoading ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-10 text-center text-muted-foreground"
                        >
                          ไม่พบผู้ใช้ที่ตรงกับเงื่อนไข
                        </td>
                      </tr>
                    ) : (
                      adminUsers.map((item) => {
                        const displayName = getUserDisplayName(item);

                        const canEditRole =
                          item.role !== "super_admin" &&
                          (user?.role === "super_admin" ||
                            item.role !== "admin");

                        return (
                          <tr
                            key={item.id}
                            className="border-t hover:bg-muted/30 transition"
                          >
                            <td className="p-4">
                              <div className="space-y-1">
                                <p className="font-medium">{displayName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.email}
                                </p>
                                {item.studentId && (
                                  <p className="text-xs text-muted-foreground">
                                    รหัสนักศึกษา: {item.studentId}
                                  </p>
                                )}
                              </div>
                            </td>

                            <td className="p-4">
                              {canEditRole ? (
                                <select
                                  value={item.role}
                                  onChange={(e) =>
                                    handleChangeUserRole(
                                      item,
                                      e.target.value as
                                        | "student"
                                        | "alumni"
                                        | "admin",
                                    )
                                  }
                                  className="h-9 rounded-md border bg-background px-3 text-sm"
                                >
                                  <option value="student">นักศึกษา</option>
                                  <option value="alumni">ศิษย์เก่า</option>
                                  {user?.role === "super_admin" && (
                                    <option value="admin">Admin</option>
                                  )}
                                </select>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className={`rounded-full ${getRoleBadgeClass(item.role)}`}
                                >
                                  {getRoleLabel(item.role)}
                                </Badge>
                              )}
                            </td>

                            <td className="p-4">
                              <div className="flex flex-col gap-2">
                                <Badge
                                  variant="outline"
                                  className={
                                    item.isActive
                                      ? "w-fit rounded-full bg-emerald-500/10 text-emerald-700 border-emerald-300"
                                      : "w-fit rounded-full bg-red-500/10 text-red-700 border-red-300"
                                  }
                                >
                                  {item.isActive ? (
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                  ) : (
                                    <XCircle className="w-3 h-3 mr-1" />
                                  )}
                                  {item.isActive ? "Active" : "Disabled"}
                                </Badge>

                                {item.isVerified && (
                                  <Badge
                                    variant="secondary"
                                    className="w-fit rounded-full"
                                  >
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="w-32">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Completion</span>
                                  <span>{item.profileCompletion}%</span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className="h-full bg-primary"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        Math.max(0, item.profileCompletion),
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="p-4 text-muted-foreground">
                              {new Date(item.createdAt).toLocaleDateString(
                                "th-TH",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </td>

                            <td className="p-4">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleUserStatus(item)}
                                  disabled={item.role === "super_admin"}
                                >
                                  <Power className="w-4 h-4 mr-1" />
                                  {item.isActive ? "ปิด" : "เปิด"}
                                </Button>

                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteUser(item)}
                                  disabled={
                                    item.role === "super_admin" ||
                                    item.id === user?.id
                                  }
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  ลบ
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                หน้า {userPage} / {totalUserPages}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={userPage <= 1 || usersLoading}
                  onClick={() => setUserPage((prev) => Math.max(1, prev - 1))}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  ก่อนหน้า
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={userPage >= totalUserPages || usersLoading}
                  onClick={() =>
                    setUserPage((prev) => Math.min(totalUserPages, prev + 1))
                  }
                >
                  ถัดไป
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "content" && (
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex justify-between items-center">
              <CardTitle>จัดการเนื้อหา</CardTitle>

              <div className="flex gap-2">
                <Button
                  variant={contentType === "news" ? "default" : "outline"}
                  onClick={() => setContentType("news")}
                >
                  ข่าวสาร
                </Button>

                <Button
                  variant={contentType === "event" ? "default" : "outline"}
                  onClick={() => setContentType("event")}
                >
                  กิจกรรม
                </Button>
              </div>
            </div>

            <Input
              placeholder="ค้นหา..."
              value={contentSearch}
              onChange={(e) => setContentSearch(e.target.value)}
            />
          </CardHeader>

          <CardContent>
            {contentLoading ? (
              <div className="text-center py-10">
                <Loader2 className="animate-spin mx-auto" />
              </div>
            ) : (
              <div className="space-y-3">
                {contentList.map((item) => (
                  <div
                    key={item.id}
                    className="border p-4 rounded-xl flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString("th-TH")}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewItem(item)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant={item.is_published ? "outline" : "default"}
                        onClick={async () => {
                          try {
                            if (contentType === "news") {
                              await toggleNewsPublished(
                                item.id,
                                !item.is_published,
                              );
                            } else {
                              await toggleEventPublished(
                                item.id,
                                !item.is_published,
                              );
                            }

                            await loadContent();
                            await loadAdminData();

                            Swal.fire({
                              icon: "success",
                              title: item.is_published
                                ? "ซ่อนรายการแล้ว"
                                : "เผยแพร่รายการแล้ว",
                              toast: true,
                              position: "top-end",
                              timer: 1500,
                              showConfirmButton: false,
                            });
                          } catch (error) {
                            console.error(
                              "TOGGLE CONTENT PUBLISHED ERROR:",
                              error,
                            );
                            Swal.fire({
                              icon: "error",
                              title: "อัปเดตสถานะไม่สำเร็จ",
                            });
                          }
                        }}
                      >
                        {item.is_published ? "ซ่อน" : "เผยแพร่"}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditItem(item);
                          setDialogType(contentType);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          const confirm = await Swal.fire({
                            title: "ลบรายการนี้?",
                            icon: "warning",
                            showCancelButton: true,
                          });

                          if (!confirm.isConfirmed) return;

                          try {
                            if (contentType === "news") {
                              await deleteNews(item.id);
                            } else {
                              await deleteEvent(item.id);
                            }

                            await loadContent();

                            Swal.fire({
                              icon: "success",
                              title: "ลบสำเร็จ",
                              toast: true,
                              position: "top-end",
                              timer: 1500,
                              showConfirmButton: false,
                            });
                          } catch (err) {
                            Swal.fire({
                              icon: "error",
                              title: "ลบไม่สำเร็จ",
                            });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {contentList.length === 0 && (
                  <div className="text-center text-muted-foreground py-10">
                    ไม่มีข้อมูล
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "approvals" && (
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              อนุมัติศิษย์เก่า
            </CardTitle>
            <CardDescription>
              ตรวจสอบผู้ใช้ที่สมัครเข้ามาโดยเลือก role ศิษย์เก่า
              หากไม่ผ่านให้เปลี่ยนกลับเป็นนักศึกษา
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border bg-muted/30 p-4">
              <div>
                <p className="font-medium">รายการรออนุมัติ</p>
                <p className="text-sm text-muted-foreground">
                  พบ {approvalUsers.length.toLocaleString("th-TH")} รายการ
                </p>
              </div>

              <Button
                variant="outline"
                onClick={loadApprovals}
                disabled={approvalsLoading}
              >
                {approvalsLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4 mr-2" />
                )}
                รีเฟรช
              </Button>
            </div>

            {approvalsLoading ? (
              <div className="flex justify-center py-12 text-muted-foreground">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                กำลังโหลดรายการรออนุมัติ...
              </div>
            ) : approvalUsers.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-10 text-center">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 mb-3" />
                <p className="font-medium">ไม่มีรายการรออนุมัติ</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ตอนนี้ไม่มีผู้สมัคร role ศิษย์เก่าที่รอการตรวจสอบ
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border overflow-hidden">
                <div className="max-h-[560px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
                      <tr className="text-left">
                        <th className="p-4 font-medium">ผู้สมัคร</th>
                        <th className="p-4 font-medium">สถานะ</th>
                        <th className="p-4 font-medium">โปรไฟล์</th>
                        <th className="p-4 font-medium">วันที่สมัคร</th>
                        <th className="p-4 font-medium text-right">
                          การตรวจสอบ
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {approvalUsers.map((item) => {
                        const displayName = getUserDisplayName(item);

                        return (
                          <tr
                            key={item.id}
                            className="border-t hover:bg-muted/30 transition"
                          >
                            <td className="p-4">
                              <div className="space-y-1">
                                <p className="font-medium">{displayName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.email}
                                </p>
                                {item.studentId && (
                                  <p className="text-xs text-muted-foreground">
                                    รหัสนักศึกษา: {item.studentId}
                                  </p>
                                )}
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="flex flex-col gap-2">
                                <Badge
                                  variant="outline"
                                  className="w-fit rounded-full bg-emerald-500/10 text-emerald-700 border-emerald-300"
                                >
                                  ศิษย์เก่า
                                </Badge>

                                <Badge
                                  variant="outline"
                                  className="w-fit rounded-full bg-yellow-500/10 text-yellow-700 border-yellow-300"
                                >
                                  รอตรวจสอบ
                                </Badge>
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="w-32">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Completion</span>
                                  <span>{item.profileCompletion}%</span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className="h-full bg-primary"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        Math.max(0, item.profileCompletion),
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="p-4 text-muted-foreground">
                              {new Date(item.createdAt).toLocaleDateString(
                                "th-TH",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </td>

                            <td className="p-4">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleOpenApprovalProfile(item)
                                  }
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  ดูโปรไฟล์
                                </Button>

                                <Button
                                  size="sm"
                                  onClick={() => handleApproveAlumni(item)}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  อนุมัติ
                                </Button>

                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectAlumni(item)}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  ปฏิเสธ
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "system" && user?.role === "super_admin" && (
        <SuperAdminSystemSettings />
      )}

      <Dialog
        open={!!previewItem}
        onOpenChange={(open) => !open && setPreviewItem(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewItem?.title}</DialogTitle>
            <DialogDescription>
              {contentType === "news" ? "ตัวอย่างข่าวสาร" : "ตัวอย่างกิจกรรม"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {previewItem?.cover_image_url && (
              <img
                src={previewItem.cover_image_url}
                alt={previewItem.title}
                className="w-full max-h-80 object-cover rounded-xl border"
              />
            )}

            <div className="flex flex-wrap gap-2">
              {previewItem?.category && (
                <Badge variant="secondary">{previewItem.category}</Badge>
              )}

              <Badge
                variant={previewItem?.is_published ? "default" : "outline"}
              >
                {previewItem?.is_published ? "เผยแพร่แล้ว" : "แบบร่าง/ซ่อนอยู่"}
              </Badge>

              {previewItem?.is_featured && (
                <Badge variant="secondary">รายการเด่น</Badge>
              )}
            </div>

            {contentType === "news" ? (
              <>
                {previewItem?.excerpt && (
                  <div>
                    <p className="text-sm font-medium mb-1">คำโปรย</p>
                    <p className="text-muted-foreground leading-7">
                      {previewItem.excerpt}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium mb-1">เนื้อหา</p>
                  <p className="whitespace-pre-line text-muted-foreground leading-7">
                    {previewItem?.content || "-"}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border p-3">
                    <p className="text-muted-foreground">วันที่</p>
                    <p className="font-medium">
                      {previewItem?.event_date || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border p-3">
                    <p className="text-muted-foreground">เวลา</p>
                    <p className="font-medium">
                      {previewItem?.start_time || "-"} -{" "}
                      {previewItem?.end_time || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border p-3">
                    <p className="text-muted-foreground">สถานที่</p>
                    <p className="font-medium">
                      {previewItem?.location || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border p-3">
                    <p className="text-muted-foreground">จำนวนรับ</p>
                    <p className="font-medium">
                      {previewItem?.capacity ?? "-"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">รายละเอียดกิจกรรม</p>
                  <p className="whitespace-pre-line text-muted-foreground leading-7">
                    {previewItem?.description || "-"}
                  </p>
                </div>
              </>
            )}

            <div className="text-xs text-muted-foreground">
              สร้างเมื่อ{" "}
              {previewItem?.created_at
                ? new Date(previewItem.created_at).toLocaleString("th-TH")
                : "-"}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={profilePreviewOpen}
        onOpenChange={(open) => {
          setProfilePreviewOpen(open);
          if (!open) setSelectedApprovalProfile(null);
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              ตรวจสอบคำขอศิษย์เก่า
            </DialogTitle>
            <DialogDescription>
              ใช้ข้อมูลการศึกษา รหัสนักศึกษา ปีที่เข้า/จบ สาขา
              และประวัติประกอบการตัดสินใจ
            </DialogDescription>
          </DialogHeader>

          {profilePreviewLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              กำลังโหลดข้อมูลโปรไฟล์...
            </div>
          ) : !selectedApprovalProfile ? (
            <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
              ไม่พบข้อมูลโปรไฟล์
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-3xl border overflow-hidden">
                <div className="h-28 bg-gradient-to-r from-primary/80 via-sky-500/60 to-emerald-500/50" />

                <div className="p-6 -mt-12 flex flex-col md:flex-row md:items-end gap-4">
                  <div className="w-24 h-24 rounded-full border-4 border-background bg-muted overflow-hidden shadow">
                    {selectedApprovalProfile.avatarUrl ? (
                      <img
                        src={selectedApprovalProfile.avatarUrl}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                        {(
                          selectedApprovalProfile.firstName ||
                          selectedApprovalProfile.email
                        )
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold">
                        {[
                          selectedApprovalProfile.firstName,
                          selectedApprovalProfile.lastName,
                        ]
                          .filter(Boolean)
                          .join(" ") || "ไม่ระบุชื่อ"}
                      </h2>

                      <Badge
                        variant="outline"
                        className="rounded-full bg-emerald-500/10 text-emerald-700 border-emerald-300"
                      >
                        สมัครเป็นศิษย์เก่า
                      </Badge>

                      <Badge
                        variant="outline"
                        className="rounded-full bg-yellow-500/10 text-yellow-700 border-yellow-300"
                      >
                        รอตรวจสอบ
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedApprovalProfile.email}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        const target = approvalUsers.find(
                          (u) => u.id === selectedApprovalProfile.id,
                        );
                        if (target) handleApproveAlumni(target);
                        setProfilePreviewOpen(false);
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      อนุมัติ
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => {
                        const target = approvalUsers.find(
                          (u) => u.id === selectedApprovalProfile.id,
                        );
                        if (target) handleRejectAlumni(target);
                        setProfilePreviewOpen(false);
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      ปฏิเสธ
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <InfoBox
                  label="รหัสนักศึกษา"
                  value={selectedApprovalProfile.studentId || "ไม่ได้กรอก"}
                />
                <InfoBox
                  label="สถานะบัญชี"
                  value={
                    selectedApprovalProfile.isActive ? "Active" : "Disabled"
                  }
                />
                <InfoBox
                  label="ความสมบูรณ์โปรไฟล์"
                  value={`${selectedApprovalProfile.profileCompletion}%`}
                />
                <InfoBox
                  label="วันที่สมัคร"
                  value={new Date(
                    selectedApprovalProfile.createdAt,
                  ).toLocaleDateString("th-TH")}
                />
              </div>

              <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      ข้อมูลการศึกษา
                    </CardTitle>
                    <CardDescription>
                      จุดหลักที่ใช้พิจารณาว่าเข้าข่ายศิษย์เก่าหรือไม่
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {selectedApprovalProfile.educations.length === 0 ? (
                      <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
                        ยังไม่มีข้อมูลการศึกษา
                      </div>
                    ) : (
                      selectedApprovalProfile.educations.map((edu) => (
                        <div
                          key={edu.id}
                          className="rounded-2xl border p-4 space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium">
                              {edu.university || "ไม่ระบุมหาวิทยาลัย"}
                            </p>

                            {edu.isCurrent ? (
                              <Badge variant="outline">กำลังศึกษาอยู่</Badge>
                            ) : (
                              <Badge variant="secondary">จบการศึกษาแล้ว</Badge>
                            )}
                          </div>

                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <InfoLine label="คณะ" value={edu.faculty} />
                            <InfoLine label="สาขา" value={edu.major} />
                            <InfoLine
                              label="ระดับการศึกษา"
                              value={edu.degree}
                            />
                            <InfoLine
                              label="ปีที่เข้าศึกษา"
                              value={
                                edu.admissionYear
                                  ? `พ.ศ. ${edu.admissionYear}`
                                  : null
                              }
                            />
                            <InfoLine
                              label="ปีที่จบ"
                              value={
                                edu.graduationYear
                                  ? `พ.ศ. ${edu.graduationYear}`
                                  : null
                              }
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Checklist สำหรับ Admin
                    </CardTitle>
                    <CardDescription>
                      ข้อมูลเหล่านี้ใช้ตรวจสอบว่าเป็นศิษย์หรือไม่
                      ได้ในระดับเบื้องต้นเท่านั้น
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <CheckItem
                      ok={!!selectedApprovalProfile.studentId}
                      text="มีรหัสนักศึกษาหรือข้อมูลระบุตัวตน"
                    />
                    <CheckItem
                      ok={selectedApprovalProfile.educations.some(
                        (e) => !!e.admissionYear,
                      )}
                      text="มีปีที่เข้าศึกษา"
                    />
                    <CheckItem
                      ok={selectedApprovalProfile.educations.some(
                        (e) => !!e.graduationYear,
                      )}
                      text="มีปีที่จบการศึกษา"
                    />
                    <CheckItem
                      ok={selectedApprovalProfile.educations.some(
                        (e) => !!e.major,
                      )}
                      text="มีสาขาที่เรียน"
                    />
                    <CheckItem
                      ok={selectedApprovalProfile.profileCompletion >= 50}
                      text="โปรไฟล์กรอกข้อมูลพอสมควร"
                    />

                    <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground leading-6">
                      หมายเหตุ: ระบบนี้ยังไม่ได้ยืนยันจากฐานข้อมูลทะเบียนจริง
                      จึงเป็นการตรวจสอบเชิงข้อมูลที่ผู้ใช้กรอเป็นการชั่วคราว
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-5">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      ประสบการณ์ทำงาน
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {selectedApprovalProfile.careerExperiences.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        ยังไม่มีข้อมูลประสบการณ์ทำงาน
                      </p>
                    ) : (
                      selectedApprovalProfile.careerExperiences.map((item) => (
                        <div key={item.id} className="rounded-xl border p-3">
                          <p className="font-medium">
                            {item.position || "ไม่ระบุตำแหน่ง"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.company || "-"} • {item.startDate || "-"} -{" "}
                            {item.isCurrent ? "ปัจจุบัน" : item.endDate || "-"}
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      ผลงาน / ความสำเร็จ
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {selectedApprovalProfile.achievements.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        ยังไม่มีข้อมูลผลงาน
                      </p>
                    ) : (
                      selectedApprovalProfile.achievements.map((item) => (
                        <div key={item.id} className="rounded-xl border p-3">
                          <p className="font-medium">
                            {item.title || "ไม่ระบุชื่อผลงาน"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.issuer || "-"} • {item.achievementDate || "-"}
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AdminContentDialogs
        currentUserId={user.id}
        currentUserRole={user.role as any}
        openType={dialogType}
        editItem={editItem}
        onOpenChange={(value) => {
          setDialogType(value);
          if (!value) {
            setEditItem(null);
          }
        }}
        onSuccess={async () => {
          await loadAdminData();

          if (activeTab === "users") {
            await loadAdminUsers();
          }

          if (activeTab === "content") {
            await loadContent();
          }
        }}
      />
    </motion.div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  hint,
  tone = "blue",
}: {
  title: string;
  value: number;
  icon: any;
  hint: string;
  tone?:
    | "blue"
    | "emerald"
    | "violet"
    | "amber"
    | "cyan"
    | "pink"
    | "indigo"
    | "yellow"
    | "red";
}) {
  const toneMap = {
    blue: {
      card: "from-blue-500/10 to-blue-500/0 border-blue-200/70",
      icon: "bg-blue-500/15 text-blue-600",
      dot: "bg-blue-500",
    },
    emerald: {
      card: "from-emerald-500/10 to-emerald-500/0 border-emerald-200/70",
      icon: "bg-emerald-500/15 text-emerald-600",
      dot: "bg-emerald-500",
    },
    violet: {
      card: "from-violet-500/10 to-violet-500/0 border-violet-200/70",
      icon: "bg-violet-500/15 text-violet-600",
      dot: "bg-violet-500",
    },
    amber: {
      card: "from-amber-500/10 to-amber-500/0 border-amber-200/70",
      icon: "bg-amber-500/15 text-amber-600",
      dot: "bg-amber-500",
    },
    cyan: {
      card: "from-cyan-500/10 to-cyan-500/0 border-cyan-200/70",
      icon: "bg-cyan-500/15 text-cyan-600",
      dot: "bg-cyan-500",
    },
    pink: {
      card: "from-pink-500/10 to-pink-500/0 border-pink-200/70",
      icon: "bg-pink-500/15 text-pink-600",
      dot: "bg-pink-500",
    },
    indigo: {
      card: "from-indigo-500/10 to-indigo-500/0 border-indigo-200/70",
      icon: "bg-indigo-500/15 text-indigo-600",
      dot: "bg-indigo-500",
    },
    yellow: {
      card: "from-yellow-500/10 to-yellow-500/0 border-yellow-200/70",
      icon: "bg-yellow-500/15 text-yellow-600",
      dot: "bg-yellow-500",
    },
    red: {
      card: "from-red-500/10 to-red-500/0 border-red-200/70",
      icon: "bg-red-500/15 text-red-600",
      dot: "bg-red-500",
    },
  };

  const toneClass = toneMap[tone] ?? toneMap.blue;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`relative overflow-hidden border bg-gradient-to-br ${toneClass.card} hover:shadow-xl transition-all duration-300`}
      >
        <div className={`absolute left-0 top-0 h-full w-1 ${toneClass.dot}`} />

        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-3xl font-bold mt-2"
              >
                {value.toLocaleString("th-TH")}
              </motion.p>

              <p className="text-xs text-muted-foreground mt-2">{hint}</p>
            </div>

            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${toneClass.icon}`}
            >
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-muted/20 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold mt-1">{value}</p>
    </div>
  );
}

function InfoLine({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}

function CheckItem({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div
      className={[
        "flex items-center gap-2 rounded-xl border p-3 text-sm",
        ok
          ? "bg-emerald-500/10 border-emerald-200 text-emerald-800"
          : "bg-yellow-500/10 border-yellow-200 text-yellow-800",
      ].join(" ")}
    >
      {ok ? (
        <CheckCircle2 className="w-4 h-4 shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 shrink-0" />
      )}
      <span>{text}</span>
    </div>
  );
}

function ContentActionCard({
  title,
  description,
  icon: Icon,
  buttonText,
  onClick,
}: {
  title: string;
  description: string;
  icon: any;
  buttonText: string;
  onClick: () => void;
}) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <Button variant="outline" className="w-full" onClick={onClick}>
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}