"use client";

import { getCareerInsightsDashboardData } from "@/app/features/insights/services/careerInsights.service";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Building2,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  CheckCircle,
  XCircle,
  Code,
  Palette,
  Database,
  Smartphone,
  Cloud,
  Brain,
} from "lucide-react";

const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload?.[0]?.payload;
    if (!data) return null;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-xl shadow-xl p-4 min-w-[240px]"
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${data.color}20` }}
          >
            <data.icon className="w-4 h-4" style={{ color: data.color }} />
          </div>
          <span className="font-bold text-foreground">{data.fullName}</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" /> ตรงสาย
            </span>
            <span className="font-bold">{payload[0]?.value} คน</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <XCircle className="w-3 h-3 text-amber-500" /> ไม่ตรงสาย
            </span>
            <span className="font-bold">{payload[1]?.value} คน</span>
          </div>
          <div className="pt-2 border-t border-border mt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">อัตราตรงสาย</span>
              <Badge
                style={{
                  backgroundColor: `${data.color}20`,
                  color: data.color,
                }}
              >
                {data.matchRate}%
              </Badge>
            </div>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">ความต้องการ</span>
            <span className="font-medium text-primary">{data.demand}</span>
          </div>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-3">
          คลิกเพื่อดูรายละเอียดเพิ่มเติม
        </p>
      </motion.div>
    );
  }
  return null;
};

type CareerAlignmentItem = {
  name: string;
  fullName: string;
  matched: number;
  unmatched: number;
  total: number;
  matchRate: number;
  avgSalary: number;
  icon: any;
  color: string;
  topCompanies: string[];
  skills: string[];
  demand: string;
  growthRate: number;
};

type IndustryItem = {
  name: string;
  percentage: number;
  count: number;
  growth: number;
  companies: string[];
};

type TopCompanyItem = {
  name: string;
  count: number;
  logo: string;
  color: string;
  industry: string;
};

type CareerPathTemplateItem = {
  title: string;
  steps: string[];
  avgYears: number[];
};

const careerMetaMap: Record<
  string,
  {
    fullName: string;
    icon: any;
    color: string;
    demand: string;
    growthRate: number;
  }
> = {
  Frontend: {
    fullName: "Frontend Developer",
    icon: Palette,
    color: "#8b5cf6",
    demand: "สูง",
    growthRate: 12,
  },
  Backend: {
    fullName: "Backend Developer",
    icon: Database,
    color: "#10b981",
    demand: "สูง",
    growthRate: 10,
  },
  "Full Stack": {
    fullName: "Full Stack Developer",
    icon: Code,
    color: "#3b82f6",
    demand: "สูงมาก",
    growthRate: 15,
  },
  DevOps: {
    fullName: "DevOps Engineer",
    icon: Cloud,
    color: "#06b6d4",
    demand: "สูงมาก",
    growthRate: 20,
  },
  Mobile: {
    fullName: "Mobile Developer",
    icon: Smartphone,
    color: "#f59e0b",
    demand: "ปานกลาง",
    growthRate: 8,
  },
  "AI/Automation": {
    fullName: "AI / Automation",
    icon: Brain,
    color: "#ec4899",
    demand: "สูงมาก",
    growthRate: 18,
  },
  Design: {
    fullName: "UI/UX Designer",
    icon: Palette,
    color: "#f97316",
    demand: "ปานกลาง",
    growthRate: 7,
  },
  Database: {
    fullName: "Database / Data Engineer",
    icon: Database,
    color: "#14b8a6",
    demand: "สูง",
    growthRate: 9,
  },
  Programming: {
    fullName: "Software Developer",
    icon: Code,
    color: "#6366f1",
    demand: "สูง",
    growthRate: 10,
  },
  Tools: {
    fullName: "Technical Tools",
    icon: Code,
    color: "#64748b",
    demand: "ปานกลาง",
    growthRate: 4,
  },
  Other: {
    fullName: "สายงานอื่น ๆ",
    icon: Briefcase,
    color: "#6b7280",
    demand: "ไม่ระบุ",
    growthRate: 0,
  },
};

function normalizeCareerCategory(value?: string | null) {
  const text = value?.trim();
  if (!text) return "Other";

  if (text === "Frontend Developer") return "Frontend";
  if (text === "Backend Developer") return "Backend";
  if (text === "Full Stack Developer") return "Full Stack";
  if (text === "DevOps Engineer") return "DevOps";
  if (text === "Mobile Developer") return "Mobile";
  if (text === "UI/UX Designer") return "Design";
  if (text === "Data/AI" || text === "AI") return "AI/Automation";

  return text;
}

function getCareerMeta(category: string) {
  return careerMetaMap[category] ?? careerMetaMap.Other;
}

function buildLogoText(companyName: string) {
  return companyName.trim().slice(0, 1).toUpperCase() || "?";
}

function getCompanyColor(index: number) {
  const colors = [
    "#4285f4",
    "#00a4ef",
    "#00529b",
    "#4e2a84",
    "#5392f9",
    "#00c300",
    "#ed1c24",
    "#138f2d",
  ];

  return colors[index % colors.length];
}

export default function InsightsPage() {
  const { user } = useAuth();

  // States
  const [selectedCareerPath, setSelectedCareerPath] = useState(0);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [realTopCompanies, setRealTopCompanies] = useState<TopCompanyItem[]>(
    [],
  );
  const [careerPathTemplates, setCareerPathTemplates] = useState<
    CareerPathTemplateItem[]
  >([]);
  const [lastLoadedAt, setLastLoadedAt] = useState<Date | null>(null);
  const [selectedCareerData, setSelectedCareerData] =
    useState<CareerAlignmentItem | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [realJobAlignmentData, setRealJobAlignmentData] = useState<
    CareerAlignmentItem[]
  >([]);
  const [realIndustryData, setRealIndustryData] = useState<IndustryItem[]>([]);
  const [realYearlyTrendData, setRealYearlyTrendData] = useState<
    { year: string; matchRate: number; graduates: number }[]
  >([]);
  const [realStats, setRealStats] = useState({
    alumniCount: 0,
    skillCount: 0,
    matchRate: 0,
    companyCount: 0,
  });

  // Callbacks
  const handleBarClick = useCallback(
    (data: any) => {
      const careerName = data?.payload?.name ?? data?.name;
      if (!careerName) return;

      const career = realJobAlignmentData.find(
        (item) => item.name === careerName,
      );

      if (!career) return;

      setSelectedCareerData(career);
      setDetailModalOpen(true);
    },
    [realJobAlignmentData],
  );

  // Fetch Logic
  const loadInsights = async () => {
    try {
      setLoadingInsights(true);

      const { summary, categories, companies, yearlyTrend, topSkillsByCareer } =
        await getCareerInsightsDashboardData();

      const skillMapByCareer = new Map<string, string[]>();

      topSkillsByCareer.forEach((item) => {
        const current = skillMapByCareer.get(item.career_category) ?? [];

        if (current.length < 8) {
          current.push(item.skill_name);
        }

        skillMapByCareer.set(item.career_category, current);
      });

      const nextJobAlignmentData: CareerAlignmentItem[] = categories.map(
        (item) => {
          const category = normalizeCareerCategory(item.career_category);
          const meta = getCareerMeta(category);

          return {
            name: category,
            fullName: meta.fullName,
            matched: Number(item.matched ?? 0),
            unmatched: Number(item.unmatched ?? 0),
            total: Number(item.total ?? 0),
            matchRate: Number(item.match_rate ?? 0),
            avgSalary: 0,
            icon: meta.icon,
            color: meta.color,
            topCompanies: companies
              .filter(
                (company) => company.main_category === item.career_category,
              )
              .slice(0, 3)
              .map((company) => company.company),
            skills: skillMapByCareer.get(item.career_category) ?? [],
            demand: meta.demand,
            growthRate: meta.growthRate,
          };
        },
      );

      const totalPeople = Number(summary?.total_people ?? 0);

      const nextIndustryData: IndustryItem[] = nextJobAlignmentData.map(
        (item) => ({
          name: item.name,
          percentage:
            totalPeople > 0 ? Math.round((item.total / totalPeople) * 100) : 0,
          count: item.total,
          growth: item.growthRate,
          companies: item.topCompanies,
        }),
      );

      const nextCareerPathTemplates: CareerPathTemplateItem[] =
        nextJobAlignmentData.slice(0, 4).map((item) => {
          const category = item.name;

          const baseSteps =
            category === "Frontend"
              ? [
                  "Junior Frontend",
                  "Frontend Developer",
                  "Senior Frontend",
                  "Frontend Lead",
                ]
              : category === "Backend"
                ? [
                    "Junior Backend",
                    "Backend Developer",
                    "Senior Backend",
                    "Backend Lead",
                  ]
                : category === "Full Stack"
                  ? [
                      "Junior Full Stack",
                      "Full Stack Developer",
                      "Senior Full Stack",
                      "Tech Lead",
                    ]
                  : category === "DevOps"
                    ? [
                        "Junior DevOps",
                        "DevOps Engineer",
                        "Senior DevOps",
                        "DevOps Lead",
                      ]
                    : ["Junior", "Mid Level", "Senior", "Lead"];

          return {
            title: item.fullName,
            steps: baseSteps,
            avgYears: [0, 2, 5, 8],
          };
        });

      const nextTopCompanies: TopCompanyItem[] = companies
        .filter((item) => !!item.company)
        .map((item, index) => {
          const companyName = item.company ?? "ไม่ระบุบริษัท";

          return {
            name: companyName,
            count: Number(item.total_people ?? 0),
            logo: buildLogoText(companyName),
            color: getCompanyColor(index),
            industry: normalizeCareerCategory(item.main_category),
          };
        });

      const nextYearlyTrendData = yearlyTrend.map((item) => ({
        year: String(item.year),
        matchRate: Number(item.match_rate ?? 0),
        graduates: Number(item.total_people ?? 0),
      }));

      const totalMatched = Number(summary?.matched ?? 0);
      const totalUnmatched = Number(summary?.unmatched ?? 0);

      setRealJobAlignmentData(nextJobAlignmentData);
      setRealIndustryData(nextIndustryData);
      setCareerPathTemplates(nextCareerPathTemplates);
      setRealTopCompanies(nextTopCompanies);
      setRealYearlyTrendData(nextYearlyTrendData);

      setRealStats({
        alumniCount: Number(summary?.total_people ?? 0),
        skillCount: topSkillsByCareer.reduce(
          (sum, item) => sum + Number(item.usage_count ?? 0),
          0,
        ),
        matchRate: Number(summary?.match_rate ?? 0),
        companyCount: Number(summary?.company_count ?? 0),
      });

      setLastLoadedAt(new Date());
    } catch (error: any) {
      console.error("LOAD INSIGHTS ERROR:", {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
      });
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  useEffect(() => {
    if (selectedCareerPath >= careerPathTemplates.length) {
      setSelectedCareerPath(0);
    }
  }, [careerPathTemplates.length, selectedCareerPath]);

  // Memos
  const totalMatched = realJobAlignmentData.reduce(
    (acc, cur) => acc + cur.matched,
    0,
  );
  const totalUnmatched = realJobAlignmentData.reduce(
    (acc, cur) => acc + cur.unmatched,
    0,
  );
  const overallMatchRate =
    totalMatched + totalUnmatched > 0
      ? Math.round((totalMatched / (totalMatched + totalUnmatched)) * 100)
      : 0;

  const hasInsightData = realJobAlignmentData.length > 0;

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (!user) return null;

  if (loadingInsights) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <div className="mb-8 space-y-3">
          <div className="h-9 w-72 rounded-xl bg-muted animate-pulse" />
          <div className="h-4 w-96 max-w-full rounded-xl bg-muted animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
                <div className="h-7 w-24 rounded-xl bg-muted animate-pulse" />
                <div className="h-4 w-32 rounded-xl bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="h-[360px] rounded-2xl bg-muted animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col gap-3 mb-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
              วิเคราะห์เส้นทางอาชีพ
            </h1>
            <Badge
              variant="secondary"
              className="w-fit sm:ml-2 bg-primary/10 text-primary border-primary/20"
            >
              ข้อมูลแบบโต้ตอบ
            </Badge>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadInsights}
            disabled={loadingInsights}
            className="w-fit"
          >
            รีเฟรชข้อมูล
          </Button>
        </div>
        <p className="text-muted-foreground">
          ข้อมูลเชิงลึกจากโปรไฟล์ ทักษะ และเส้นทางอาชีพของศิษย์เก่าในระบบ
        </p>
        {lastLoadedAt && (
          <p className="mt-1 text-xs text-muted-foreground">
            อัปเดตล่าสุด: {lastLoadedAt.toLocaleString("th-TH")}
          </p>
        )}
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
      >
        {[
          {
            label: "ศิษย์เก่าทั้งหมด",
            value: realStats.alumniCount.toLocaleString("th-TH"),
            icon: Users,
            change: "ข้อมูลจริง",
            positive: true,
          },
          {
            label: "ทักษะในระบบ",
            value: realStats.skillCount.toLocaleString("th-TH"),
            icon: Code,
            change: "จากโปรไฟล์",
            positive: true,
          },
          {
            label: "อัตราตรงสาย",
            value: `${realStats.matchRate}%`,
            icon: Briefcase,
            change: "จากเส้นทางอาชีพ",
            positive: true,
          },
          {
            label: "บริษัทในระบบ",
            value: realStats.companyCount.toLocaleString("th-TH"),
            icon: Building2,
            change: "จากประสบการณ์",
            positive: true,
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        stat.positive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {stat.positive ? (
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 mr-1" />
                      )}
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <Tabs defaultValue="jobalignment" className="space-y-6">
        <TabsList className="w-full h-auto bg-muted/50 p-1 grid grid-cols-2 sm:inline-flex sm:flex-wrap gap-1 overflow-x-auto">
          <TabsTrigger
            value="jobalignment"
            className="text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            การได้งานตรงสาย
          </TabsTrigger>
          <TabsTrigger
            value="industry"
            className="text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            อุตสาหกรรม
          </TabsTrigger>
          <TabsTrigger
            value="career"
            className="text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            เส้นทางอาชีพ
          </TabsTrigger>
          <TabsTrigger
            value="companies"
            className="text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            บริษัทชั้นนำ
          </TabsTrigger>
        </TabsList>

        {/* Tab Content: Job Alignment */}
        <TabsContent value="jobalignment">
          {!hasInsightData ? (
            <InsightEmptyState
              title="ยังไม่มีข้อมูสำหรับวิเคราะห์"
              description="ระบบจะแสดงผลเมื่อผู้ใช้เพิ่มเส้นทางอาชีพ พร้อมสายงานและคะแนนความตรงสายแล้ว"
            />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                <SummaryCard
                  title="ได้งานตรงสาย"
                  value={totalMatched}
                  subValue={`${overallMatchRate}% ของทั้งหมด`}
                  icon={CheckCircle}
                  gradient="from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20"
                  textColor="text-green-700 dark:text-green-400"
                  delay={0.1}
                />
                <SummaryCard
                  title="ไม่ตรงสาย"
                  value={totalUnmatched}
                  subValue={`${100 - overallMatchRate}% ของทั้งหมด`}
                  icon={XCircle}
                  gradient="from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20"
                  textColor="text-amber-700 dark:text-amber-400"
                  delay={0.2}
                />
                <SummaryCard
                  title="อัตราตรงสายเฉลี่ย"
                  value={`${overallMatchRate}%`}
                  subValue="คำนวณจากงานหลักในโปรไฟล์"
                  icon={Target}
                  gradient="from-primary/5 to-primary/10"
                  textColor="text-primary"
                  delay={0.3}
                  isTrend
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="w-full"
                >
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="space-y-2">
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        การได้งานตรงสาย แยกตามสายอาชีพ
                      </CardTitle>
                      <CardDescription>
                        คลิกที่แท่งกราฟเพื่อดูรายละเอียดเพิ่มเติม
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-hidden">
                      <div className="h-[320px] sm:h-[380px] lg:h-[420px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={realJobAlignmentData}
                            margin={{ top: 20, right: 12, left: 0, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              className="stroke-border"
                            />
                            <XAxis
                              dataKey="name"
                              interval={0}
                              angle={-20}
                              textAnchor="end"
                              height={70}
                              tick={{ fill: "currentColor", fontSize: 11 }}
                            />
                            <YAxis
                              tick={{ fill: "currentColor", fontSize: 12 }}
                            />
                            <Tooltip
                              content={<CustomBarTooltip />}
                              cursor={{ fill: "rgba(0,0,0,0.05)" }}
                            />
                            <Legend wrapperStyle={{ paddingTop: 20 }} />
                            <Bar
                              dataKey="matched"
                              name="ตรงสาย"
                              fill="#10b981"
                              radius={[4, 4, 0, 0]}
                              onClick={handleBarClick}
                              style={{ cursor: "pointer" }}
                            />
                            <Bar
                              dataKey="unmatched"
                              name="ไม่ตรงสาย"
                              fill="#f59e0b"
                              radius={[4, 4, 0, 0]}
                              onClick={handleBarClick}
                              style={{ cursor: "pointer" }}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Career Cards */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>รายละเอียดแต่ละสายอาชีพ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                    {realJobAlignmentData.map((career, index) => {
                      const Icon = career.icon;
                      return (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.03, y: -4 }}
                          className="p-4 rounded-xl border-2 border-border hover:border-primary/30 cursor-pointer transition-all min-w-0"
                          onClick={() => {
                            setSelectedCareerData(career);
                            setDetailModalOpen(true);
                          }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: `${career.color}20` }}
                            >
                              <Icon
                                className="w-5 h-5"
                                style={{ color: career.color }}
                              />
                            </div>
                            <div>
                              <p className="font-semibold truncate">
                                {career.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {career.total} คน
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> ตรงสาย
                              </span>
                              <span className="font-medium">
                                {career.matched}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-amber-600 flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> ไม่ตรงสาย
                              </span>
                              <span className="font-medium">
                                {career.unmatched}
                              </span>
                            </div>
                            <Progress
                              value={career.matchRate}
                              className="h-1.5 mt-2"
                              style={{ backgroundColor: `${career.color}20` }}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Industry Tab Content */}
        <TabsContent value="industry">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                การกระจายตัวตามสายงาน
              </CardTitle>
              <CardDescription>
                สรุปจากสายงานหลักในเส้นทางอาชีพของผู้ใช้
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {realIndustryData.length === 0 ? (
                <InsightEmptyState
                  title="ยังไม่มีข้อมูลการกระจายตัวตามสายงาน"
                  description="ระบบจะสรุปข้อมูลเมื่อมีเส้นทางอาชีพในโปรไฟล์ของผู้ใช้"
                />
              ) : (
                realIndustryData.map((ind, i) => (
                  <motion.div
                    key={`${ind.name}-${i}`}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-all cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="font-medium">{ind.name}</span>

                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <span className="text-sm text-muted-foreground">
                          {ind.count} คน
                        </span>

                        <Badge
                          variant="secondary"
                          className={
                            ind.growth >= 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }
                        >
                          {ind.growth >= 0 ? "+" : ""}
                          {ind.growth}%
                        </Badge>
                      </div>
                    </div>

                    <Progress value={ind.percentage} className="h-2" />

                    {ind.companies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {ind.companies.slice(0, 4).map((company) => (
                          <Badge
                            key={company}
                            variant="outline"
                            className="text-[10px]"
                          >
                            {company}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Career Path Tab Content */}
        <TabsContent value="career">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                เส้นทางความก้าวหน้าในอาชีพ
              </CardTitle>
              <CardDescription>
                แม่แบบเส้นทางอาชีพที่สร้างจากสายงานที่พบในระบบ
              </CardDescription>
            </CardHeader>

            <CardContent>
              {careerPathTemplates.length === 0 ? (
                <InsightEmptyState
                  title="ยังไม่มีข้อมูลเส้นทางอาชีพ"
                  description="ระบบจะสร้างเส้นทางอาชีพจากสายงานที่พบในข้อมูลโปรไฟล์"
                />
              ) : (
                <>
                  <div className="flex gap-2 mb-6 flex-wrap">
                    {careerPathTemplates.map((path, i) => (
                      <Button
                        key={`${path.title}-${i}`}
                        variant={
                          selectedCareerPath === i ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedCareerPath(i)}
                      >
                        {path.title}
                      </Button>
                    ))}
                  </div>

                  <div className="relative pl-5 sm:pl-8 border-l-2 border-primary/30 space-y-6 sm:space-y-8">
                    {careerPathTemplates[selectedCareerPath]?.steps.map(
                      (step, i) => (
                        <motion.div
                          key={`${step}-${i}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="relative"
                        >
                          <div className="absolute -left-[31px] sm:-left-[41px] w-5 h-5 rounded-full bg-primary border-4 border-background" />

                          <div className="p-4 rounded-lg bg-muted/50 border hover:bg-muted transition-all">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                              <span className="font-medium">{step}</span>

                              <Badge variant="secondary">
                                ~
                                {careerPathTemplates[selectedCareerPath]
                                  ?.avgYears[i] ?? 0}{" "}
                                ปี
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      ),
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Companies Tab Content */}
        <TabsContent value="companies">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                บริษัทที่ศิษย์เก่าทำงานมากที่สุด
              </CardTitle>
            </CardHeader>
            <CardContent>
              {realTopCompanies.length === 0 ? (
                <InsightEmptyState
                  title="ยังไม่มีข้อมูลบริษัท"
                  description="ระบบจะแสดงบริษัทเมื่อมีผู้ใช้เพิ่มประสบการณ์ทำงานในโปรไฟล์"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {realTopCompanies.map((comp, i) => (
                    <motion.div
                      key={`${comp.name}-${i}`}
                      whileHover={{ y: -5 }}
                      className="p-4 rounded-xl border-2 border-border text-center hover:border-primary/30 transition-all cursor-pointer"
                    >
                      <div
                        className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                        style={{ backgroundColor: comp.color }}
                      >
                        {comp.logo}
                      </div>
                      <p className="font-semibold">{comp.name}</p>
                      <p className="text-sm text-primary font-medium">
                        {comp.count} คน
                      </p>
                      <Badge variant="outline" className="mt-2 text-[10px]">
                        {comp.industry}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedCareerData && (
                <>
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${selectedCareerData.color}20` }}
                  >
                    <selectedCareerData.icon
                      className="w-6 h-6"
                      style={{ color: selectedCareerData.color }}
                    />
                  </div>
                  {selectedCareerData.fullName}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedCareerData && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-4 rounded-lg bg-green-500/10">
                  <p className="text-sm text-green-600 mb-1">ตรงสาย</p>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedCareerData.matched} คน
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10">
                  <p className="text-sm text-amber-600 mb-1">ไม่ตรงสาย</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {selectedCareerData.unmatched} คน
                  </p>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span>อัตราตรงสาย</span>
                  <span className="font-bold">
                    {selectedCareerData.matchRate}%
                  </span>
                </div>
                <Progress
                  value={selectedCareerData.matchRate}
                  className="h-2"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">ความต้องการ</p>
                  <p className="font-bold">{selectedCareerData.demand}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">การเติบโต</p>
                  <p className="font-bold text-green-600">
                    +{selectedCareerData.growthRate}%
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">ทักษะที่พบจากโปรไฟล์</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCareerData.skills.length > 0 ? (
                    selectedCareerData.skills.map((s, i) => (
                      <Badge key={i} variant="outline">
                        {s}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      ยังไม่มีข้อมูลทักษะที่เกี่ยวข้อง
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InsightEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed bg-muted/20 p-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <BarChart3 className="h-6 w-6 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold">{title}</h3>

      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  subValue,
  icon: Icon,
  gradient,
  textColor,
  delay,
  isTrend,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
    >
      <Card
        className={`border-0 shadow-sm bg-gradient-to-br ${gradient} cursor-pointer hover:shadow-lg transition-all`}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-white/20">
              <Icon className={`w-5 h-5 ${textColor}`} />
            </div>
            <span className={`text-sm font-medium ${textColor}`}>{title}</span>
          </div>
          <p className={`text-2xl sm:text-3xl font-bold ${textColor}`}>
            {typeof value === "number" ? `${value} คน` : value}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {isTrend && <ArrowUpRight className="w-3 h-3 text-green-600" />}
            <p className={`text-sm opacity-80 ${textColor}`}>{subValue}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
