"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Newspaper,
  Star,
  TrendingUp,
  Users,
  GraduationCap,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Swal from "sweetalert2";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type NewsItem = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  cover_image_url: string | null;
  created_at: string;
};

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  cover_image_url: string | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  capacity: number | null;
  registrationCount: number;
};

type FeaturedAlumniItem = {
  id: string;
  name: string;
  position: string;
  company: string;
  avatar: string | null;
  graduationYear: number | null;
};

type FeaturedStudentItem = {
  id: string;
  name: string;
  avatar: string | null;
  faculty: string;
  major: string;
  admissionYear: number | null;
};

type DashboardStats = {
  alumniCount: number;
  studentCount: number;
  jobCount: number;
  newsCount: number;
  upcomingEventCount: number;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function formatThaiDate(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-muted/20 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium mt-1">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [joiningEvent, setJoiningEvent] = useState(false);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [featuredAlumni, setFeaturedAlumni] = useState<FeaturedAlumniItem[]>(
    [],
  );
  const [featuredStudents, setFeaturedStudents] = useState<
    FeaturedStudentItem[]
  >([]);
  const [stats, setStats] = useState<DashboardStats>({
    alumniCount: 0,
    studentCount: 0,
    jobCount: 0,
    newsCount: 0,
    upcomingEventCount: 0,
  });

  const isStudent = user?.role === "student";
  const isAlumni = user?.role === "alumni";
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const loadMyEventRegistrations = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("event_registrations")
      .select("event_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("LOAD MY EVENT REGISTRATIONS ERROR:", error);
      return;
    }

    setRegisteredEventIds((data ?? []).map((item: any) => item.event_id));
  };

  useEffect(() => {
    if (!user?.role) return;

    const loadDashboard = async () => {
      try {
        setLoading(true);

        const today = new Date().toISOString().slice(0, 10);

        const [
          alumniCountRes,
          studentCountRes,
          jobCountRes,
          newsCountRes,
          upcomingEventCountRes,
          newsRes,
          eventsRes,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "alumni")
            .eq("is_verified", true),

          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "student"),

          supabase
            .from("job_posts")
            .select("id", { count: "exact", head: true })
            .eq("is_active", true),

          supabase
            .from("news_posts")
            .select("id", { count: "exact", head: true })
            .eq("is_published", true),

          supabase
            .from("events")
            .select("id", { count: "exact", head: true })
            .eq("is_published", true)
            .gte("event_date", today),

          supabase
            .from("news_posts")
            .select(
              "id, title, excerpt, content, category, cover_image_url, created_at",
            )
            .eq("is_published", true)
            .order("created_at", { ascending: false })
            .limit(3),

          supabase
            .from("events")
            .select(
              "id, title, description, category, cover_image_url, event_date, start_time, end_time, location, capacity",
            )
            .eq("is_published", true)
            .gte("event_date", today)
            .order("event_date", { ascending: true })
            .limit(3),
        ]);

        setStats({
          alumniCount: alumniCountRes.count ?? 0,
          studentCount: studentCountRes.count ?? 0,
          jobCount: jobCountRes.count ?? 0,
          newsCount: newsCountRes.count ?? 0,
          upcomingEventCount: upcomingEventCountRes.count ?? 0,
        });

        setRecentNews((newsRes.data ?? []) as NewsItem[]);

        const eventRows = (eventsRes.data ?? []) as Omit<
          EventItem,
          "registrationCount"
        >[];

        const eventIds = eventRows.map((item) => item.id);

        let registrationMap = new Map<string, number>();

        if (eventIds.length > 0) {
          const { data: registrations } = await supabase
            .from("event_registrations")
            .select("event_id")
            .in("event_id", eventIds);

          registrationMap = new Map();

          (registrations ?? []).forEach((item: any) => {
            registrationMap.set(
              item.event_id,
              (registrationMap.get(item.event_id) ?? 0) + 1,
            );
          });
        }

        setUpcomingEvents(
          eventRows.map((item) => ({
            ...item,
            registrationCount: registrationMap.get(item.id) ?? 0,
          })),
        );

        if (user.role === "student") {
          const { data: studentData, error: studentError } = await supabase
            .from("profiles")
            .select(
              `
              id,
              first_name,
              last_name,
              avatar_url,
              profile_completion,
              educations (
                faculty,
                major,
                admission_year,
                display_order
              )
            `,
            )
            .eq("role", "student")
            .eq("is_active", true)
            .neq("id", user.id)
            .order("profile_completion", { ascending: false })
            .limit(3);

          if (studentError) throw studentError;

          setFeaturedStudents(
            (studentData ?? []).map((item: any) => {
              const education =
                item.educations?.find((e: any) => e.major || e.faculty) ??
                item.educations?.[0];

              return {
                id: item.id,
                name:
                  [item.first_name, item.last_name].filter(Boolean).join(" ") ||
                  "ไม่ระบุชื่อ",
                avatar: item.avatar_url ?? null,
                faculty: education?.faculty ?? "ไม่ระบุคณะ",
                major: education?.major ?? "ไม่ระบุสาขา",
                admissionYear: education?.admission_year ?? null,
              };
            }),
          );
        } else {
          setFeaturedStudents([]);
        }

        if (user.role === "alumni") {
          const { data: alumniData, error: alumniError } = await supabase
            .from("profiles")
            .select(
              `
              id,
              first_name,
              last_name,
              avatar_url,
              career_experiences (
                company,
                position,
                is_current,
                start_date
              ),
              educations (
                graduation_year,
                display_order
              )
            `,
            )
            .eq("role", "alumni")
            .eq("is_verified", true)
            .eq("is_active", true)
            .order("profile_completion", { ascending: false })
            .limit(3);

          if (alumniError) throw alumniError;

          setFeaturedAlumni(
            (alumniData ?? []).map((item: any) => {
              const career =
                item.career_experiences?.find((c: any) => c.is_current) ??
                item.career_experiences?.[0];

              const education =
                item.educations?.find((e: any) => e.graduation_year) ??
                item.educations?.[0];

              return {
                id: item.id,
                name:
                  [item.first_name, item.last_name].filter(Boolean).join(" ") ||
                  "ไม่ระบุชื่อ",
                position: career?.position ?? "ไม่ระบุตำแหน่ง",
                company: career?.company ?? "ไม่ระบุบริษัท",
                avatar: item.avatar_url ?? null,
                graduationYear: education?.graduation_year ?? null,
              };
            }),
          );
        } else {
          setFeaturedAlumni([]);
        }
      } catch (error) {
        console.error("LOAD DASHBOARD ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user?.role]);

  useEffect(() => {
    if (user?.id) {
      loadMyEventRegistrations();
    }
  }, [user?.id]);

  const statsCards = [
    {
      label: "ศิษย์เก่าในระบบ",
      value: stats.alumniCount.toLocaleString("th-TH"),
      icon: Users,
      color: "text-chart-1",
      visible: !isStudent,
    },
    {
      label: "นักศึกษาในระบบ",
      value: stats.studentCount.toLocaleString("th-TH"),
      icon: GraduationCap,
      color: "text-chart-5",
      visible: !isAlumni,
    },
    {
      label: "ตำแหน่งงาน",
      value: stats.jobCount.toLocaleString("th-TH"),
      icon: Briefcase,
      color: "text-chart-2",
      visible: true,
    },
    {
      label: "ข่าวสารใหม่",
      value: stats.newsCount.toLocaleString("th-TH"),
      icon: Newspaper,
      color: "text-chart-3",
      visible: true,
    },
    {
      label: "กิจกรรมที่กำลังจะมาถึง",
      value: stats.upcomingEventCount.toLocaleString("th-TH"),
      icon: Calendar,
      color: "text-chart-4",
      visible: true,
    },
  ].filter((item) => item.visible);

  const handleJoinEvent = async () => {
    if (!user?.id || !selectedEvent) return;

    const alreadyRegistered = registeredEventIds.includes(selectedEvent.id);

    if (alreadyRegistered) {
      await Swal.fire({
        icon: "info",
        title: "ลงทะเบียนแล้ว",
        text: "คุณลงทะเบียนกิจกรรมนี้ไปแล้ว",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    if (
      selectedEvent.capacity !== null &&
      selectedEvent.registrationCount >= selectedEvent.capacity
    ) {
      await Swal.fire({
        icon: "warning",
        title: "กิจกรรมเต็มแล้ว",
        text: "ไม่สามารถลงทะเบียนกิจกรรมนี้ได้",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    try {
      setJoiningEvent(true);

      const { error } = await supabase.from("event_registrations").insert({
        event_id: selectedEvent.id,
        user_id: user.id,
        status: "registered",
        registered_at: new Date().toISOString(),
      });

      if (error) throw error;

      setRegisteredEventIds((prev) => [...prev, selectedEvent.id]);

      setUpcomingEvents((prev) =>
        prev.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                registrationCount: event.registrationCount + 1,
              }
            : event,
        ),
      );

      setSelectedEvent((prev) =>
        prev
          ? {
              ...prev,
              registrationCount: prev.registrationCount + 1,
            }
          : prev,
      );

      await Swal.fire({
        icon: "success",
        title: "ลงทะเบียนสำเร็จ",
        text: "คุณลงทะเบียนเข้าร่วมกิจกรรมเรียบร้อยแล้ว",
        confirmButtonText: "ตกลง",
        timer: 1800,
        timerProgressBar: true,
      });
    } catch (error: any) {
      console.error("JOIN EVENT ERROR:", error);

      const message =
        error?.code === "23505"
          ? "คุณลงทะเบียนกิจกรรมนี้ไปแล้ว"
          : error?.message || "ลงทะเบียนไม่สำเร็จ";

      await Swal.fire({
        icon: "error",
        title: "ลงทะเบียนไม่สำเร็จ",
        text: message,
        confirmButtonText: "ตกลง",
      });
    } finally {
      setJoiningEvent(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              สวัสดี, {user?.firstName}
            </h1>
            <p className="text-muted-foreground mt-1">
              ยินดีต้อนรับกลับสู่ Alumni Connect
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NotificationDropdown variant="button" />
            <Link href="/profile">
              <Button size="sm">
                อัปเดตโปรไฟล์
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {user && user.profileCompletion < 100 && (
        <motion.div variants={itemVariants}>
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-warning" />
                </div>

                <div className="flex-1">
                  <p className="font-medium">โปรไฟล์ของคุณยังไม่สมบูรณ์</p>
                  <p className="text-sm text-muted-foreground">
                    กรอกข้อมูลเพิ่มเติมเพื่อเพิ่มโอกาสในการถูกค้นพบ
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {user.profileCompletion}%
                    </p>
                    <p className="text-xs text-muted-foreground">สมบูรณ์</p>
                  </div>
                  <Progress
                    value={user.profileCompletion}
                    className="w-32 h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        variants={itemVariants}
        className={[
          "grid grid-cols-1 sm:grid-cols-2 gap-4",
          statsCards.length === 3
            ? "lg:grid-cols-3"
            : statsCards.length === 4
              ? "lg:grid-cols-4"
              : "lg:grid-cols-5",
        ].join(" ")}
      >
        {statsCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card
              key={stat.label}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        stat.value
                      )}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-success" />
                      <span className="text-xs text-success">ข้อมูลล่าสุด</span>
                    </div>
                  </div>

                  <div
                    className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">ข่าวสารล่าสุด</CardTitle>
                <CardDescription>
                  ติดตามข่าวสารจากสมาคมศิษย์เก่า
                </CardDescription>
              </div>

              <Link href="/news">
                <Button variant="ghost" size="sm">
                  ดูทั้งหมด
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="space-y-4">
              {recentNews.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  ยังไม่มีข่าวสาร
                </p>
              ) : (
                recentNews.map((news) => (
                  <motion.div
                    key={news.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setSelectedNews(news)}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Newspaper className="w-5 h-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">
                        {news.title}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        {news.category && (
                          <Badge variant="secondary" className="text-xs">
                            {news.category}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatThaiDate(news.created_at)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">
                  กิจกรรมที่กำลังจะมาถึง
                </CardTitle>
                <CardDescription>อย่าพลาดกิจกรรมสำคัญ</CardDescription>
              </div>

              <Link href="/events">
                <Button variant="ghost" size="sm">
                  ดูทั้งหมด
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  ยังไม่มีกิจกรรมที่กำลังจะมาถึง
                </p>
              ) : (
                upcomingEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedEvent(event)}
                    className="p-3 rounded-lg border bg-card hover:shadow-sm transition-all cursor-pointer"
                  >
                    <p className="font-medium text-sm">{event.title}</p>

                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatThaiDate(event.event_date)}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {event.location || "ไม่ระบุสถานที่"}
                      </span>

                      <Badge variant="outline" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {event.registrationCount}
                        {event.capacity ? `/${event.capacity}` : ""}
                      </Badge>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>

          <Dialog
            open={!!selectedNews}
            onOpenChange={(open) => !open && setSelectedNews(null)}
          >
            <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-primary" />
                  {selectedNews?.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedNews?.category || "ข่าวสาร"} •{" "}
                  {formatThaiDate(selectedNews?.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selectedNews?.cover_image_url && (
                  <img
                    src={selectedNews.cover_image_url}
                    alt={selectedNews.title}
                    className="w-full max-h-80 rounded-2xl object-cover border"
                  />
                )}

                {selectedNews?.excerpt && (
                  <div className="rounded-2xl bg-muted/40 p-4 text-sm leading-7">
                    {selectedNews.excerpt}
                  </div>
                )}

                <div className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {selectedNews?.content || "ไม่มีรายละเอียดเพิ่มเติม"}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={!!selectedEvent}
            onOpenChange={(open) => !open && setSelectedEvent(null)}
          >
            <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {selectedEvent?.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedEvent?.category || "กิจกรรม"} •{" "}
                  {formatThaiDate(selectedEvent?.event_date)}
                </DialogDescription>
              </DialogHeader>

              {selectedEvent && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-muted/30 p-4">
                  <div>
                    <p className="font-medium">สถานะการเข้าร่วม</p>
                    <p className="text-sm text-muted-foreground">
                      {registeredEventIds.includes(selectedEvent.id)
                        ? "คุณลงทะเบียนกิจกรรมนี้แล้ว"
                        : "คุณยังไม่ได้ลงทะเบียนกิจกรรมนี้"}
                    </p>
                  </div>

                  <Button
                    onClick={handleJoinEvent}
                    disabled={
                      joiningEvent ||
                      registeredEventIds.includes(selectedEvent.id) ||
                      (selectedEvent.capacity !== null &&
                        selectedEvent.registrationCount >=
                          selectedEvent.capacity)
                    }
                  >
                    {joiningEvent ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        กำลังลงทะเบียน...
                      </>
                    ) : registeredEventIds.includes(selectedEvent.id) ? (
                      "ลงทะเบียนแล้ว"
                    ) : selectedEvent.capacity !== null &&
                      selectedEvent.registrationCount >=
                        selectedEvent.capacity ? (
                      "กิจกรรมเต็มแล้ว"
                    ) : (
                      "เข้าร่วมกิจกรรม"
                    )}
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                {selectedEvent?.cover_image_url && (
                  <img
                    src={selectedEvent.cover_image_url}
                    alt={selectedEvent.title}
                    className="w-full max-h-80 rounded-2xl object-cover border"
                  />
                )}

                <div className="grid sm:grid-cols-2 gap-3">
                  <InfoBox
                    label="วันที่"
                    value={formatThaiDate(selectedEvent?.event_date)}
                  />
                  <InfoBox
                    label="เวลา"
                    value={`${selectedEvent?.start_time || "-"} - ${selectedEvent?.end_time || "-"}`}
                  />
                  <InfoBox
                    label="สถานที่"
                    value={selectedEvent?.location || "ไม่ระบุ"}
                  />
                  <InfoBox
                    label="จำนวนผู้เข้าร่วม"
                    value={`${selectedEvent?.registrationCount ?? 0}${selectedEvent?.capacity ? `/${selectedEvent.capacity}` : ""}`}
                  />
                </div>

                <div className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {selectedEvent?.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>

      {isStudent && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-chart-5" />
                  นักศึกษาที่น่าสนใจ
                </CardTitle>
                <CardDescription>
                  นักศึกษาที่มีโปรไฟล์สมบูรณ์และอาจเหมาะกับการสร้างเครือข่าย
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              {featuredStudents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  ยังไม่มีนักศึกษาแนะนำ
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredStudents.map((student) => (
                    <Link key={student.id} href={`/profile/${student.id}`}>
                      <motion.div
                        whileHover={{ y: -4 }}
                        className="p-4 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage
                              src={student.avatar || "/placeholder.svg"}
                              alt={student.name}
                            />
                            <AvatarFallback>
                              {student.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {student.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {student.major}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                          <Building2 className="w-3 h-3" />
                          <span className="truncate">{student.faculty}</span>
                        </div>

                        {student.admissionYear && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            ปีเข้า {student.admissionYear}
                          </Badge>
                        )}
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isAlumni && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-warning" />
                  ศิษย์เก่าที่น่าสนใจ
                </CardTitle>
                <CardDescription>
                  ศิษย์เก่าที่ประสบความสำเร็จในสาขาต่าง ๆ
                </CardDescription>
              </div>

              <Link href="/directory">
                <Button variant="ghost" size="sm">
                  ค้นหาเพิ่มเติม
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent>
              {featuredAlumni.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  ยังไม่มีศิษย์เก่าแนะนำ
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredAlumni.map((alumni) => (
                    <Link key={alumni.id} href={`/profile/${alumni.id}`}>
                      <motion.div
                        whileHover={{ y: -4 }}
                        className="p-4 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage
                              src={alumni.avatar || "/placeholder.svg"}
                              alt={alumni.name}
                            />
                            <AvatarFallback>
                              {alumni.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {alumni.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {alumni.position}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                          <Building2 className="w-3 h-3" />
                          <span className="truncate">{alumni.company}</span>
                        </div>

                        {alumni.graduationYear && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            รุ่น {alumni.graduationYear}
                          </Badge>
                        )}
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">การดำเนินการด่วน</CardTitle>
            <CardDescription>สิ่งที่คุณสามารถทำได้</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {isAdmin && (
                <>
                  <Link href="/admin">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                    >
                      <CheckCircle className="w-4 h-4 mr-2 text-success" />
                      จัดการระบบ
                    </Button>
                  </Link>

                  <Link href="/admin">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                    >
                      <Newspaper className="w-4 h-4 mr-2" />
                      จัดการข่าวสาร
                    </Button>
                  </Link>
                </>
              )}

              {(isAlumni || isAdmin) && (
                <>
                  <Link href="/opportunities">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                    >
                      <Briefcase className="w-4 h-4 mr-2 text-chart-2" />
                      โพสต์ตำแหน่งงาน
                    </Button>
                  </Link>

                  <Link href="/insights">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                    >
                      <TrendingUp className="w-4 h-4 mr-2 text-chart-1" />
                      ดู Career Insights
                    </Button>
                  </Link>
                </>
              )}

              <Link href="/profile">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  อัปเดตโปรไฟล์
                </Button>
              </Link>

              {isAlumni && (
                <Link href="/directory">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    ค้นหาศิษย์เก่า
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
