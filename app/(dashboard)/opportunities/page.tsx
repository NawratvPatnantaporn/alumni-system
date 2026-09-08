"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Search, Briefcase, MapPin, Clock, Building2, DollarSign, BookmarkPlus, Send, Plus, Filter, GraduationCap, Users, Star, ExternalLink, Heart, Bookmark, Loader2, CheckCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { applyForJob, createJobPost, getJobPosts, getOpportunitySkills, getSavedJobIds, toggleSavedJob, getAppliedJobIds, } from "@/app/features/opportunities/services/opportunities.service";
import Link from "next/link";

const mentorships = [
  {
    id: 1,
    mentor: "ดร.สมชาย ปัญญาดี",
    title: "Career Guidance in Tech Industry",
    expertise: ["Software Development", "Tech Leadership", "Startups"],
    availability: "เสาร์-อาทิตย์",
    sessions: 24,
    rating: 4.9,
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    mentor: "คุณสมหญิง เก่งกาจ",
    title: "Marketing & Brand Strategy",
    expertise: ["Digital Marketing", "Brand Building", "Content Strategy"],
    availability: "จันทร์-ศุกร์ หลัง 18:00",
    sessions: 18,
    rating: 4.8,
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 3,
    mentor: "คุณสมศักดิ์ มั่งมี",
    title: "Finance & Investment",
    expertise: ["Investment Banking", "Financial Planning", "Risk Management"],
    availability: "นัดหมายล่วงหน้า",
    sessions: 32,
    rating: 4.7,
    avatar: "/placeholder.svg?height=80&width=80",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

type SkillOption = {
  id: string;
  name: string;
  category: string | null;
};

type JobFormState = {
  title: string;
  company: string;
  description: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  jobType: "full-time" | "part-time" | "internship" | "contract";
  experienceLevel: "junior" | "mid" | "senior" | "lead";
  minExperienceYears: string;
  selectedSkillIds: string[];
};

const initialJobForm: JobFormState = {
  title: "",
  company: "",
  description: "",
  location: "",
  salaryMin: "",
  salaryMax: "",
  jobType: "full-time",
  experienceLevel: "junior",
  minExperienceYears: "",
  selectedSkillIds: [],
};

function formatSalary(min?: number | null, max?: number | null, currency = "THB") {
  if (!min && !max) return "ไม่ระบุ";
  if (min && max) {
    return `${min.toLocaleString("th-TH")} - ${max.toLocaleString("th-TH")} ${currency}`;
  }
  if (min) return `${min.toLocaleString("th-TH")} ${currency}`;
  return `${max?.toLocaleString("th-TH")} ${currency}`;
}

function getRelativeThaiDate(dateString: string) {
  const now = new Date();
  const target = new Date(dateString);
  const diffMs = now.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "วันนี้";
  if (diffDays === 1) return "1 วันที่แล้ว";
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์ที่แล้ว`;
  return `${Math.floor(diffDays / 30)} เดือนที่แล้ว`;
}

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);

  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [postingJob, setPostingJob] = useState(false);
  const [savingJobIds, setSavingJobIds] = useState<string[]>([]);
  const [applyingJobIds, setApplyingJobIds] = useState<string[]>([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([]);
  const [skillOptions, setSkillOptions] = useState<SkillOption[]>([]);
  const [jobForm, setJobForm] = useState<JobFormState>(initialJobForm);

  const canPostJob = user?.role === "alumni" || user?.role === "admin";
  const canApply = user?.role === "alumni" || user?.role === "student";

  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);

  const currentTab = useMemo(() => {
    const tab = searchParams.get("tab");
    if (tab === "internships") return "internships";
    if (tab === "mentorship") return "mentorship";
    return "jobs";
  }, [searchParams]);

  const loadSkills = async () => {
    try {
      const result = await getOpportunitySkills();
      setSkillOptions(result);
    } catch (error) {
      console.error("LOAD OPPORTUNITY SKILLS ERROR:", error);
    }
  };

  const loadSavedJobs = async () => {
    if (!user?.id) return;

    try {
      const ids = await getSavedJobIds(user.id);
      setBookmarkedJobs(ids);
    } catch (error) {
      console.error("LOAD SAVED JOB IDS ERROR:", error);
    }
  };

  const loadAppliedJobs = async () => {
    if (!user?.id) return;

    try {
      const ids = await getAppliedJobIds(user.id);
      setAppliedJobIds(ids);
    } catch (error) {
      console.error("LOAD APPLIED JOBS ERROR:", error);
    }
  }

  const loadJobs = async () => {
    try {
      setLoadingJobs(true);

      const result = await getJobPosts({
        search: searchQuery,
        jobType: filterType,
        onlyInternship: currentTab === "internships",
      });

      setJobs(result);
    } catch (error) {
      console.error("LOAD JOBS ERROR:", error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลโอกาสงานได้",
      });
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadSavedJobs();
      loadAppliedJobs();
    }
  }, [user?.id]);

  useEffect(() => {
    if (currentTab === "jobs" || currentTab === "internships") {
      loadJobs();
    }
  }, [searchQuery, filterType, currentTab]);

  const toggleSkillSelection = (skillId: string) => {
    setJobForm((prev) => {
      const selected = prev.selectedSkillIds.includes(skillId);

      return {
        ...prev,
        selectedSkillIds: selected
          ? prev.selectedSkillIds.filter((id) => id !== skillId)
          : [...prev.selectedSkillIds, skillId],
      };
    });
  };

  const handleCreateJob = async () => {
    if (!user?.id) return;

    if (!jobForm.title.trim()) {
      toast({
        variant: "destructive",
        title: "ข้อมูลไม่ครบ",
        description: "กรุณากรอกชื่อตำแหน่งงาน",
      });
      return;
    }

    try {
      setPostingJob(true);

      await createJobPost(user.id, {
        title: jobForm.title.trim(),
        company: jobForm.company.trim(),
        description: jobForm.description.trim(),
        location: jobForm.location.trim(),
        salaryMin: jobForm.salaryMin ? Number(jobForm.salaryMin) : null,
        salaryMax: jobForm.salaryMax ? Number(jobForm.salaryMax) : null,
        currency: "THB",
        jobType: jobForm.jobType,
        experienceLevel: jobForm.experienceLevel,
        minExperienceYears: jobForm.minExperienceYears
          ? Number(jobForm.minExperienceYears)
          : null,
        skills: jobForm.selectedSkillIds.map((skillId) => ({
          skillId,
          isRequired: true,
          minLevel: null,
        })),
      });

      toast({
        title: "โพสต์งานสำเร็จ",
        description: "ระบบได้สร้างประกาศงานและแจ้งเตือนผู้ใช้ที่มีทักษะตรงกันแล้ว",
      });

      setIsPostJobOpen(false);
      setJobForm(initialJobForm);
      await loadJobs();
    } catch (error) {
      console.error("HANDLE CREATE JOB ERROR:", error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโพสต์งานได้",
      });
    } finally {
      setPostingJob(false);
    }
  };

  const handleToggleBookmark = async (jobId: string) => {
    if (!user?.id) return;

    try {
      setSavingJobIds((prev) => [...prev, jobId]);
      const isCurrentlySaved = bookmarkedJobs.includes(jobId);

      const nextSaved = await toggleSavedJob(user.id, jobId, isCurrentlySaved);

      setBookmarkedJobs((prev) =>
        nextSaved ? [...prev, jobId] : prev.filter((id) => id !== jobId)
      );
    } catch (error) {
      console.error("HANDLE TOGGLE BOOKMARK ERROR:", error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกงานนี้ได้",
      });
    } finally {
      setSavingJobIds((prev) => prev.filter((id) => id !== jobId));
    }
  };

  const handleApplyJob = async (jobId: string) => {
    if (!user?.id) return;

    try {
      setApplyingJobIds((prev) => [...prev, jobId]);
      
      const result = await applyForJob(user.id, jobId);

      if (result.alreadyApplied) {
        toast({
          title: "สมัครไปแล้ว",
          description: "คุณเคยสมัครงานนี้ไปแล้ว",
        });
      } else {
        toast({
          title: "สมัครงานสำเร็จ",
          description: "ระบบได้รับใบสมัครของคุณแล้ว และแจ้งเตือนไปยังผู้โพสต์แล้ว",
        });
      }

      await loadJobs();
      await loadAppliedJobs();
    } catch (error: any) {
      console.error("HANDLE APPLY JOB ERROR:", error);

      toast({
        variant: "destructive",
        title: "สมัครงานไม่สำเร็จ",
        description:
          error?.message?.includes("duplicate")
            ? "คุณสมัครงานนี้ไปแล้ว"
            : "ไม่สามารถสมัครงานได้",
      });
    } finally {
      setApplyingJobIds((prev) => prev.filter((id) => id !== jobId));
    }
  };

  const jobItems = jobs;
  const internshipItems = jobs.filter((job) => job.job_type === "internship");

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">โอกาสอาชีพ</h1>
          <p className="mt-1 text-muted-foreground">
            ค้นหางาน ฝึกงาน และโปรแกรม Mentorship จากเครือข่ายศิษย์เก่า
          </p>
        </div>

        {canPostJob && (
          <Dialog open={isPostJobOpen} onOpenChange={setIsPostJobOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                โพสต์งานใหม่
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>โพสต์ตำแหน่งงานใหม่</DialogTitle>
                <DialogDescription>
                  แชร์โอกาสงานให้กับเครือข่ายศิษย์เก่าและนักศึกษา
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="job-title">ตำแหน่งงาน</Label>
                  <Input
                    id="job-title"
                    placeholder="เช่น Software Engineer"
                    value={jobForm.title}
                    onChange={(e) =>
                      setJobForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="company">บริษัท</Label>
                    <Input
                      id="company"
                      placeholder="ชื่อบริษัท"
                      value={jobForm.company}
                      onChange={(e) =>
                        setJobForm((prev) => ({ ...prev, company: e.target.value }))
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="location">สถานที่</Label>
                    <Input
                      id="location"
                      placeholder="กรุงเทพมหานคร"
                      value={jobForm.location}
                      onChange={(e) =>
                        setJobForm((prev) => ({ ...prev, location: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>ประเภทงาน</Label>
                    <Select
                      value={jobForm.jobType}
                      onValueChange={(value) =>
                        setJobForm((prev) => ({
                          ...prev,
                          jobType: value as JobFormState["jobType"],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภทงาน" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>ระดับประสบการณ์</Label>
                    <Select
                      value={jobForm.experienceLevel}
                      onValueChange={(value) =>
                        setJobForm((prev) => ({
                          ...prev,
                          experienceLevel: value as JobFormState["experienceLevel"],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกระดับ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid">Mid</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="salary-min">เงินเดือนต่ำสุด</Label>
                    <Input
                      id="salary-min"
                      type="number"
                      placeholder="30000"
                      value={jobForm.salaryMin}
                      onChange={(e) =>
                        setJobForm((prev) => ({ ...prev, salaryMin: e.target.value }))
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="salary-max">เงินเดือนสูงสุด</Label>
                    <Input
                      id="salary-max"
                      type="number"
                      placeholder="60000"
                      value={jobForm.salaryMax}
                      onChange={(e) =>
                        setJobForm((prev) => ({ ...prev, salaryMax: e.target.value }))
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="min-exp">ประสบการณ์ขั้นต่ำ (ปี)</Label>
                    <Input
                      id="min-exp"
                      type="number"
                      placeholder="2"
                      value={jobForm.minExperienceYears}
                      onChange={(e) =>
                        setJobForm((prev) => ({
                          ...prev,
                          minExperienceYears: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">รายละเอียดงาน</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="อธิบายลักษณะงานและความรับผิดชอบ..."
                    value={jobForm.description}
                    onChange={(e) =>
                      setJobForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label>ทักษะที่เกี่ยวข้อง</Label>
                  <div className="flex flex-wrap gap-2 rounded-xl border p-3">
                    {skillOptions.map((skill) => {
                      const selected = jobForm.selectedSkillIds.includes(skill.id);

                      return (
                        <Button
                          key={skill.id}
                          type="button"
                          size="sm"
                          variant={selected ? "default" : "outline"}
                          onClick={() => toggleSkillSelection(skill.id)}
                        >
                          {skill.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsPostJobOpen(false)}
                  disabled={postingJob}
                >
                  ยกเลิก
                </Button>

                <Button onClick={handleCreateJob} disabled={postingJob}>
                  {postingJob ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังโพสต์...
                    </>
                  ) : (
                    "โพสต์งาน"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      <Tabs defaultValue={currentTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="jobs" className="gap-2">
            <Briefcase className="h-4 w-4" />
            ตำแหน่งงาน
          </TabsTrigger>

          <TabsTrigger value="internships" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            ฝึกงาน
          </TabsTrigger>

          {/* <TabsTrigger value="mentorship" className="gap-2">
            <Users className="h-4 w-4" />
            Mentorship
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหาตำแหน่งงาน หรือบริษัท..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="ประเภทงาน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {loadingJobs ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              กำลังโหลดข้อมูลตำแหน่งงาน...
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-4"
            >
              <AnimatePresence mode="popLayout">
                {jobItems.map((job) => {
                  const skillNames =
                    job.job_post_skills?.map((item: any) => item.skills?.name).filter(Boolean) ?? [];

                  const postedByName = [
                    job.profiles?.first_name,
                    job.profiles?.last_name,
                  ]
                    .filter(Boolean)
                    .join(" ");

                  const isSaved = bookmarkedJobs.includes(job.id);
                  const isSaving = savingJobIds.includes(job.id);
                  const isApplying = applyingJobIds.includes(job.id);
                  const isApplied = appliedJobIds.includes(job.id);

                  return (
                    <motion.div
                      key={job.id}
                      variants={item}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                    >
                      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                {job.title}
                              </CardTitle>

                              <CardDescription className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                {job.company || "-"}
                              </CardDescription>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  job.job_type === "full-time"
                                    ? "default"
                                    : job.job_type === "internship"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {job.job_type}
                              </Badge>

                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isSaving}
                                onClick={() => handleToggleBookmark(job.id)}
                                className={isSaved ? "text-primary" : ""}
                              >
                                {isSaving ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : isSaved ? (
                                  <Bookmark className="h-5 w-5 fill-current" />
                                ) : (
                                  <BookmarkPlus className="h-5 w-5" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            {job.description || "-"}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location || "ไม่ระบุ"}
                            </span>

                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {formatSalary(job.salary_min, job.salary_max, job.currency)}
                            </span>

                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {getRelativeThaiDate(job.created_at)}
                            </span>

                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {job.application_count ?? 0} ผู้สมัคร
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {skillNames.map((req: string, index: number) => (
                              <Badge key={`${job.id}-skill-${index}-${req}`} variant="secondary" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>โพสต์โดย</span>
                            <Badge variant="outline">
                              {postedByName || "ไม่ระบุ"}
                            </Badge>
                          </div>
                        </CardContent>

                        <CardFooter className="border-t bg-muted/30 pt-4">
                          <div className="flex w-full items-center justify-between">
                            <Button asChild variant="outline" size="sm" className="gap-2 bg-transparent">
                              <Link href={`/opportunities/${job.id}`}>
                                <ExternalLink className="h-4 w-4"/>
                                ดูรายละเอียด
                              </Link>
                            </Button>

                            {canApply && (
                              <Button
                                size="sm"
                                className="gap-2"
                                disabled={isApplying || isApplied}
                                onClick={() => handleApplyJob(job.id)}
                              >
                                {isApplying ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    กำลังสมัคร...
                                  </>
                                ) : isApplied ? (
                                  <>
                                    <CheckCircle className="h-4 w-4" />
                                    สมัครแล้ว
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-4 w-4" />
                                    สมัครงาน
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {!jobItems.length && (
                <Card className="p-12 text-center">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">ยังไม่มีตำแหน่งงาน</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    ประกาศงานใหม่จะปรากฏที่นี่
                  </p>
                </Card>
              )}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="internships" className="space-y-6">
          {loadingJobs ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              กำลังโหลดข้อมูลฝึกงาน...
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-4"
            >
              {internshipItems.map((job) => {
                const skillNames =
                  job.job_post_skills?.map((item: any) => item.skills?.name).filter(Boolean) ?? [];

                return (
                  <Card key={job.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{job.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Building2 className="h-4 w-4" />
                            {job.company || "-"}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">Internship</Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className="mb-4 text-sm text-muted-foreground">
                        {job.description || "-"}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {skillNames.map((req: string, index: number) => (
                          <Badge key={`${job.id}-intern-${index}-${req}`} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="border-t bg-muted/30">
                      <div className="flex w-full items-center justify-between pt-4">
                        <span className="text-sm text-muted-foreground">
                          {formatSalary(job.salary_min, job.salary_max, job.currency)}
                        </span>

                        {user?.role === "student" && (
                          <Button
                            size="sm"
                            className="gap-2"
                            onClick={() => handleApplyJob(job.id)}
                          >
                            <Send className="h-4 w-4" />
                            สมัครฝึกงาน
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}

              {internshipItems.length === 0 && (
                <Card className="p-12 text-center">
                  <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">ยังไม่มีตำแหน่งฝึกงาน</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    ตำแหน่งฝึกงานใหม่จะปรากฏที่นี่
                  </p>
                </Card>
              )}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="mentorship" className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/20 p-3">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>

                  <div>
                    <h3 className="font-semibold">โปรแกรม Mentorship</h3>
                    <p className="text-sm text-muted-foreground">
                      เชื่อมต่อกับศิษย์เก่าผู้เชี่ยวชาญเพื่อรับคำแนะนำและพัฒนาอาชีพของคุณ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {mentorships.map((mentor) => (
              <motion.div key={mentor.id} variants={item}>
                <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent p-0.5">
                      <img
                        src={mentor.avatar || "/placeholder.svg"}
                        alt={mentor.mentor}
                        className="h-full w-full rounded-full object-cover bg-background"
                      />
                    </div>
                    <CardTitle className="text-lg">{mentor.mentor}</CardTitle>
                    <CardDescription>{mentor.title}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap justify-center gap-1">
                      {mentor.expertise.map((exp, index) => (
                        <Badge key={`${mentor.id}-exp-${index}`} variant="secondary" className="text-xs">
                          {exp}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {mentor.rating}
                      </span>
                      <span>{mentor.sessions} sessions</span>
                    </div>

                    <p className="text-center text-xs text-muted-foreground">
                      พร้อมให้คำปรึกษา: {mentor.availability}
                    </p>
                  </CardContent>

                  <CardFooter>
                    {(user?.role === "student" || user?.role === "alumni") && (
                      <Button className="w-full gap-2">
                        <Users className="h-4 w-4" />
                        ขอนัดหมาย
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {user?.role === "alumni" && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 font-semibold">เป็น Mentor ให้รุ่นน้อง</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    แบ่งปันประสบการณ์และช่วยเหลือรุ่นน้องในการพัฒนาอาชีพ
                  </p>
                  <Button className="mt-4 bg-transparent" variant="outline">
                    สมัครเป็น Mentor
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}