"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  DollarSign,
  Edit2,
  ExternalLink,
  Loader2,
  MapPin,
  Send,
  Trash2,
  Users,
  Briefcase,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  applyForJob,
  getAppliedJobIds,
} from "@/app/features/opportunities/services/opportunities.service";
import {
  deleteJobPost,
  getJobApplications,
  updateJobPost,
} from "@/app/features/opportunities/services/jobOwner.service";

function formatSalary(min?: number | null, max?: number | null, currency = "THB") {
  if (!min && !max) return "ไม่ระบุ";
  if (min && max) return `${min.toLocaleString("th-TH")} - ${max.toLocaleString("th-TH")} ${currency}`;
  if (min) return `${min.toLocaleString("th-TH")} ${currency}`;
  return `${max?.toLocaleString("th-TH")} ${currency}`;
}

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params?.id as string;

  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [applicantsOpen, setApplicantsOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    jobType: "",
    experienceLevel: "",
    minExperienceYears: "",
    isActive: true,
  });

  const isOwner = !!user?.id && !!job?.user_id && user.id === job.user_id;
  const isApplied = appliedJobIds.includes(id);

  const postedBy = useMemo(() => {
    return [job?.profiles?.first_name, job?.profiles?.last_name]
      .filter(Boolean)
      .join(" ");
  }, [job]);

  const loadJob = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("job_posts")
        .select(`
          *,
          profiles!job_posts_user_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone,
            avatar_url
          ),
          job_post_skills (
            id,
            min_level,
            is_required,
            skills (
              id,
              name,
              category
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      setJob(data);
      setEditForm({
        title: data.title || "",
        company: data.company || "",
        description: data.description || "",
        location: data.location || "",
        salaryMin: data.salary_min?.toString() || "",
        salaryMax: data.salary_max?.toString() || "",
        jobType: data.job_type || "",
        experienceLevel: data.experience_level || "",
        minExperienceYears: data.min_experience_years?.toString() || "",
        isActive: !!data.is_active,
      });
    } catch (error) {
      console.error("LOAD JOB DETAIL ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    if (!id) return;
    const rows = await getJobApplications(id);
    setApplications(rows);
  };

  const loadApplied = async () => {
    if (!user?.id) return;
    const ids = await getAppliedJobIds(user.id);
    setAppliedJobIds(ids);
  };

  useEffect(() => {
    if (id) loadJob();
  }, [id]);

  useEffect(() => {
    if (user?.id) loadApplied();
  }, [user?.id]);

  useEffect(() => {
    if (isOwner) loadApplications();
  }, [isOwner, id]);

  const handleApply = async () => {
    if (!user?.id) return;

    try {
      setApplying(true);
      const result = await applyForJob(user.id, id);

      if (!result.alreadyApplied) {
        setAppliedJobIds((prev) => [...prev, id]);
      }

      await loadJob();
      await loadApplied();
    } catch (error) {
      console.error("APPLY JOB DETAIL ERROR:", error);
    } finally {
      setApplying(false);
    }
  };

  const handleUpdate = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);

      await updateJobPost(id, user.id, {
        title: editForm.title,
        company: editForm.company,
        description: editForm.description,
        location: editForm.location,
        salaryMin: editForm.salaryMin ? Number(editForm.salaryMin) : null,
        salaryMax: editForm.salaryMax ? Number(editForm.salaryMax) : null,
        jobType: editForm.jobType,
        experienceLevel: editForm.experienceLevel,
        minExperienceYears: editForm.minExperienceYears ? Number(editForm.minExperienceYears) : null,
        isActive: editForm.isActive,
      });

      setEditOpen(false);
      await loadJob();
    } catch (error) {
      console.error("UPDATE JOB DETAIL ERROR:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.id) return;

    const ok = window.confirm("ยืนยันลบประกาศงานนี้?");
    if (!ok) return;

    try {
      await deleteJobPost(id, user.id);
      router.push("/opportunities");
    } catch (error) {
      console.error("DELETE JOB DETAIL ERROR:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        กำลังโหลดรายละเอียดงาน...
      </div>
    );
  }

  if (!job) {
    return <div className="py-16 text-center text-muted-foreground">ไม่พบประกาศงานนี้</div>;
  }

  const skillRows = job.job_post_skills ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Button variant="ghost" onClick={() => router.push("/opportunities")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        กลับไปหน้าโอกาสอาชีพ
      </Button>

      <Card className="overflow-hidden border-primary/20">
        <div className="h-28 bg-gradient-to-r from-primary/80 via-sky-500/70 to-emerald-400/70" />

        <CardContent className="-mt-10 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-background shadow-lg ring-4 ring-background">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>

              <div>
                <h1 className="text-3xl font-bold">{job.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {job.company || "-"}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location || "ไม่ระบุ"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {job.application_count ?? 0} ผู้สมัคร
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full px-3 py-1">{job.job_type || "job"}</Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {job.experience_level || "ไม่ระบุระดับ"}
              </Badge>

              {isOwner ? (
                <>
                  <Button variant="outline" onClick={() => setApplicantsOpen(true)}>
                    <Users className="w-4 h-4 mr-2" />
                    ดูผู้สมัคร
                  </Button>
                  <Button variant="outline" onClick={() => setEditOpen(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    แก้ไข
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    ลบ
                  </Button>
                </>
              ) : (
                <Button disabled={applying || isApplied} onClick={handleApply}>
                  {applying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      กำลังสมัคร...
                    </>
                  ) : isApplied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      สมัครแล้ว
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      สมัครงาน
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>รายละเอียดงาน</CardTitle>
              <CardDescription>ข้อมูลเกี่ยวกับตำแหน่งและความรับผิดชอบ</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="leading-7 text-muted-foreground whitespace-pre-line">
                {job.description || "-"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ทักษะที่เกี่ยวข้อง</CardTitle>
              <CardDescription>ทักษะเหล่านี้ใช้สำหรับจับคู่แจ้งเตือนผู้ใช้</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {skillRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">ไม่ระบุทักษะ</p>
              ) : (
                skillRows.map((item: any) => (
                  <Badge key={item.id} variant="secondary" className="rounded-full px-3 py-1">
                    {item.skills?.name || "-"}
                    {item.min_level ? ` · Lv.${item.min_level}` : ""}
                  </Badge>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลสรุป</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">เงินเดือน</span>
                <span className="font-medium">{formatSalary(job.salary_min, job.salary_max, job.currency)}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">ประสบการณ์ขั้นต่ำ</span>
                <span className="font-medium">{job.min_experience_years ?? 0} ปี</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">วันที่โพสต์</span>
                <span className="font-medium">
                  {new Date(job.created_at).toLocaleDateString("th-TH")}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">สถานะ</span>
                <Badge variant={job.is_active ? "default" : "secondary"}>
                  {job.is_active ? "เปิดรับสมัคร" : "ปิดรับสมัคร"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ผู้โพสต์</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{postedBy || "ไม่ระบุ"}</p>
              <p className="text-muted-foreground">{job.profiles?.email || "-"}</p>
              {job.profiles?.phone && <p className="text-muted-foreground">{job.profiles.phone}</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={applicantsOpen} onOpenChange={setApplicantsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>รายชื่อผู้สมัคร</DialogTitle>
            <DialogDescription>
              ผู้สมัครทั้งหมด {applications.length} คน
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[520px] overflow-y-auto">
            {applications.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                ยังไม่มีผู้สมัคร
              </div>
            ) : (
              applications.map((app) => {
                const profile = Array.isArray(app.profiles) ? app.profiles[0] : app.profiles;
                const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");

                return (
                  <Card key={app.id}>
                    <CardContent className="p-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{name || "ไม่ระบุชื่อ"}</p>
                        <p className="text-sm text-muted-foreground">{profile?.email || "-"}</p>
                        <p className="text-sm text-muted-foreground">
                          {profile?.position || "-"} {profile?.company ? `@ ${profile.company}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          สมัครเมื่อ {new Date(app.created_at).toLocaleString("th-TH")}
                        </p>
                      </div>

                      <Badge variant="secondary">{app.status || "pending"}</Badge>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไขประกาศงาน</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลประกาศงานของคุณ</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>ชื่อตำแหน่ง</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>บริษัท</Label>
                <Input
                  value={editForm.company}
                  onChange={(e) => setEditForm((p) => ({ ...p, company: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label>สถานที่</Label>
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>เงินเดือนต่ำสุด</Label>
                <Input
                  type="number"
                  value={editForm.salaryMin}
                  onChange={(e) => setEditForm((p) => ({ ...p, salaryMin: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label>เงินเดือนสูงสุด</Label>
                <Input
                  type="number"
                  value={editForm.salaryMax}
                  onChange={(e) => setEditForm((p) => ({ ...p, salaryMax: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label>ประสบการณ์ขั้นต่ำ</Label>
                <Input
                  type="number"
                  value={editForm.minExperienceYears}
                  onChange={(e) => setEditForm((p) => ({ ...p, minExperienceYears: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>รายละเอียด</Label>
              <Textarea
                rows={5}
                value={editForm.description}
                onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editForm.isActive}
                onChange={(e) => setEditForm((p) => ({ ...p, isActive: e.target.checked }))}
              />
              เปิดรับสมัครอยู่
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
              ยกเลิก
            </Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}