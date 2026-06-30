"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Linkedin, Globe, MapPin, Building2, GraduationCap, Calendar, CheckCircle, Briefcase, Award, Users, MessageCircle, UserPlus, Share2, Flag, Clock, BookOpen, Target, Heart } from "lucide-react";
import Link from "next/link";
import { getPublicAlumniProfile, PublicProfileNotFoundError, PublicProfileForbiddenError } from "@/app/features/public-profile/service/publicProfile.service";
import type { PublicAlumniProfile } from "@/app/features/public-profile/types/publicProfile";
import Swal from "sweetalert2";
import { createOrGetDirectConversation } from "@/app/features/chat/services/chat.service";
import { reportProfile } from "@/app/features/directory/service/profileReport.service";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  type ProfileLoadStatus = | "loading" | "success" | "not_found" | "forbidden" | "error";

  const [profile, setProfile] = useState<PublicAlumniProfile | null>(null);
  const [loadStatus, setLoadStatus] = useState<ProfileLoadStatus>("loading");

  const profileId = params.id as string;

  const loadProfile = useCallback(async () => {
    if (!profileId) {
      setLoadStatus("not_found");
      return;
    }

    try {
      setLoadStatus("loading");
      setProfile(null);

      const result = await getPublicAlumniProfile(profileId);

      setProfile(result);
      setLoadStatus("success");
    } catch (error) {
      console.error("LOAD PROFILE ERROR:", error);

      if (error instanceof PublicProfileNotFoundError) {
        setLoadStatus("not_found")
        return;
      }

      if (error instanceof PublicProfileForbiddenError) {
        setLoadStatus("forbidden")
        return;
      }

      setLoadStatus("error");
    }
  }, [profileId]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!mounted) return;
      await loadProfile();
    };

    run();

    return () => {
      mounted = false;
    };
  }, [loadProfile]);

  const handleMessageUser = async (targetUserId: string) => {
    if (!user?.id) return;

    try {
      const conversationId = await createOrGetDirectConversation({
        currentUserId: user.id,
        targetUserId: targetUserId,
      });

      router.push(`/messages?conversationId=${conversationId}`);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "เริ่มแชทไม่สำเร็จ",
        text: error?.message ?? "เกิดข้อผิดพลาด",
      });
    }
  };

  if (loadStatus === "loading") {
    return (
      <div className="space-y-6">
        <Card className="h-40 animate-pulse" />
        <Card className="h-96 animate-pulse" />
      </div>
    );
  }

  if (loadStatus === "not_found") {
    return (
      <div className="space-y-6">
        <Card className="h-40 animate-pulse" />
        <Card className="h-96 animate-pulse" />
      </div>
    );
  }

  if (loadStatus === "forbidden") {
    return (
      <div className="space-y-6">
        <Card className="h-40 animate-pulse" />
        <Card className="h-96 animate-pulse" />
      </div>
    );
  }

  if (loadStatus === "error") {
    return (
      <div className="space-y-6">
        <Card className="h-40 animate-pulse" />
        <Card className="h-96 animate-pulse" />
      </div>
    );
  }

  if (!profile) return null;

  const handleShareProfile = async () => {
    if (!profile) return;

    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: profile?.name ?? "Alumni Profile",
          text: `ดูโปรไฟล์ของ ${profile?.name ?? "ศิษย์เก่า"}`,
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);

      Swal.fire({
        icon: "success",
        title: "คัดลอกลิงค์แล้ว",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("HANDLE SHARE PROFILE ERROR:", error);
    }
  };

  const handleReportProfile = async () => {
    if (!user?.id || !profile?.id) return;

    const result = await Swal.fire({
      icon: "warning",
      title: "รายงานโปรไฟล์",
      input: "select",
      inputOptions: {
        inappropriate: "เนื้อหาไม่เหมาะสม",
        fake: "ข้อมูลปลอมหรือแอบอ้าง",
        spam: "สแปมหรือรบกวน",
        other: "อื่นๆ",
      },
      inputPlaceholder: "เลือกเหตุผล",
      showCancelButton: true,
      confirmButtonText: "ส่งรายงาน",
      cancelButtonText: "ยกเลิก",
      inputValidator: (value) => {
        if (!value) return "กรุณาเลือกเหตุผล";
        return null;
      },
    });

    if (!result.isConfirmed || !result.value) return;

    try {
      await reportProfile({
        reporterId: user.id,
        reportedUserId: profile.id,
        reason: result.value,
      });

      Swal.fire({
        icon: "success",
        title: "ส่งรายงานแล้ว",
        text: "ขอบคุณสําหรับการรายงาน",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "ส่งรายงานไม่สําเร็จ",
        text: error?.message ?? "เกิดข้อผิดพลาด",
      });
    }
  };

  const isOwnProfile = user?.id === profile.id;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          กลับ
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden rounded-2xl shadow-sm">
          <div className="h-32 bg-gradient-to-r from-primary/80 to-accent/80" />
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-12">
              <div className="relative">
                <Avatar className="w-28 h-28 md:w-32 md:h-32 ring-4 ring-background">
                  <AvatarImage
                    src={profile.avatar || "/placeholder.svg"}
                    alt={profile.name}
                  />
                  <AvatarFallback className="text-2xl">
                    {profile.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                {profile.isVerified && (
                  <div className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center ring-4 ring-background">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 pt-4 md:pt-0 md:pb-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl md:text-3xl font-bold">
                        {profile.name}
                      </h1>

                      {profile.isActive && (
                        <Badge className="bg-emerald-500 text-white">
                          Active
                        </Badge>
                      )}
                    </div>

                    <p className="text-lg text-muted-foreground mt-1">
                      {profile.position || "-"} @ {profile.company || "-"}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {profile.location || "-"}
                      </span>

                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {profile.faculty || "-"} รุ่น{" "}
                        {profile.graduationYear ?? "-"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {!isOwnProfile && (
                      <>
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleMessageUser(profile.id)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          ส่งข้อความ
                        </Button>

                        {/* <Button variant="outline">
                          <UserPlus className="w-4 h-4 mr-2" />
                          เชื่อมต่อ
                        </Button> */}
                      </>
                    )}

                    {isOwnProfile && (
                      <Link href="/profile">
                        <Button>แก้ไขโปรไฟล์</Button>
                      </Link>
                    )}

                    <Button variant="ghost" size="icon" onClick={handleShareProfile}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-muted/70 p-1">
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="experience">ประสบการณ์</TabsTrigger>
            <TabsTrigger value="education">การศึกษา</TabsTrigger>
            <TabsTrigger value="achievements">ผลงาน</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card className="rounded-2xl shadow-sm border-border/60">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      เกี่ยวกับ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {profile.bio || "-"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm border-border/60">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      ทักษะ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.length > 0 ? (
                        profile.skills.map((skill, index) => (
                          <Badge
                            key={`profile-skill-${skill}-${index}`}
                            variant="secondary"
                            className="px-3 py-1 rounded-full"
                          >
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">-</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm border-border/60">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      ความสนใจ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.length > 0 ? (
                        profile.interests.map((interest, index) => (
                          <Badge
                            key={interest.id}
                            variant="outline"
                            className="px-3 py-1 rounded-full"
                          >
                            {interest.name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">-</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="rounded-2xl shadow-sm border-border/60">
                  <CardHeader>
                    <CardTitle className="text-base">ข้อมูลติดต่อ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.email && (
                      <a
                        href={`mailto:${profile.email}`}
                        className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                      >
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{profile.email}</span>
                      </a>
                    )}

                    {!profile.linkedin && !profile.website && (
                      <p className="text-sm text-muted-foreground">
                        ผู้ใช้นี้ยังไม่ได้เปิดเผยช่องทางติดต่อสาธารณะ
                      </p>
                    )}

                    {profile.linkedin && (
                      <a
                        href={
                          profile.linkedin.startsWith("http")
                            ? profile.linkedin
                            : `https://${profile.linkedin}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                      >
                        <Linkedin className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{profile.linkedin}</span>
                      </a>
                    )}

                    {profile.website && (
                      <a
                        href={
                          profile.website.startsWith("http")
                            ? profile.website
                            : `https://${profile.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                      >
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{profile.website}</span>
                      </a>
                    )}

                    {!profile.email && !profile.linkedin && !profile.website && (
                      <p className="text-sm text-muted-foreground">-</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm border-border/60">
                  <CardHeader>
                    <CardTitle className="text-base">ข้อมูลเพิ่มเติม</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    {/* <div className="flex items-center gap-3">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">รหัสนักศึกษา</p>
                        <p className="font-medium">{profile.studentId || "-"}</p>
                      </div>
                    </div> */}

                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">ภาควิชา</p>
                        <p className="font-medium">{profile.department || "-"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">เข้าร่วมเมื่อ</p>
                        <p className="font-medium">
                          {profile.joinedDate
                            ? new Date(profile.joinedDate).toLocaleDateString(
                                "th-TH",
                                {
                                  year: "numeric",
                                  month: "long",
                                },
                              )
                            : "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">อัปเดตล่าสุด</p>
                        <p className="font-medium">
                          {profile.lastUpdated
                            ? new Date(profile.lastUpdated).toLocaleDateString(
                                "th-TH",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {!isOwnProfile && (
                  <Button
                    variant="ghost"
                    className="w-full text-destructive hover:text-destructive"
                    onClick={handleReportProfile}
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    รายงานโปรไฟล์
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="experience" className="space-y-4">
            <Card className="rounded-2xl shadow-sm border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  ประสบการณ์การทำงาน
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.experience.length > 0 ? (
                  <div className="space-y-6">
                    {profile.experience.map((exp, index) => (
                      <div
                        key={`exp-${exp.id ?? index}`}
                        className={`relative pl-6 ${
                          index !== profile.experience.length - 1
                            ? "pb-6 border-l-2 border-border"
                            : ""
                        }`}
                      >
                        <div className="absolute left-0 top-0 w-3 h-3 -translate-x-[7px] rounded-full bg-primary" />
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                          <div>
                            <h3 className="font-semibold">{exp.position}</h3>
                            <p className="text-muted-foreground">{exp.company}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {exp.duration}
                            </span>
                            {exp.current && (
                              <Badge className="bg-emerald-500 text-white">
                                ปัจจุบัน
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-4">
            <Card className="rounded-2xl shadow-sm border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  ประวัติการศึกษา
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.education.length > 0 ? (
                  <div className="space-y-6">
                    {profile.education.map((edu, index) => (
                      <div
                        key={`edu-${edu.id ?? index}`}
                        className={`relative pl-6 ${
                          index !== profile.education.length - 1
                            ? "pb-6 border-l-2 border-border"
                            : ""
                        }`}
                      >
                        <div className="absolute left-0 top-0 w-3 h-3 -translate-x-[7px] rounded-full bg-primary" />
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                          <div>
                            <h3 className="font-semibold">
                              {edu.degree || "-"} - {edu.field || "-"}
                            </h3>
                            <p className="text-muted-foreground">
                              {edu.institution || "-"}
                            </p>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {edu.admissionYear ?? "-"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card className="rounded-2xl shadow-sm border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  รางวัลและผลงาน
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.achievements.length > 0 ? (
                  <div className="space-y-6">
                    {profile.achievements.map((achievement, index) => (
                      <div
                        key={`achievement-${achievement.id ?? index}`}
                        className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Award className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold">
                              {achievement.title || "-"}
                            </h3>
                            <span className="text-sm text-muted-foreground">
                              {achievement.year ?? "-"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {achievement.description || "-"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>ยังไม่มีรางวัลหรือผลงานที่บันทึกไว้</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

function ProfileStateCard({
  title,
  description,
  onBack,
  onRetry,
}: {
  title: string;
  description: string;
  onBack: () => void;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>

          <h2 className="text-xl font-semibold">
            {title}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {description}
          </p>

          <div className="mt-6 flex justify-center gap-2">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับ
            </Button>

            {onRetry && (
              <Button onClick={onRetry}>
                ลองใหม่
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}