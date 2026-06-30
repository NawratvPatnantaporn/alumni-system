"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts"
import {
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  GraduationCap,
  Award,
  MapPin,
  Briefcase,
  DollarSign,
  Target,
  Lightbulb,
  BookOpen,
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react"

// Job alignment data by career field
const jobAlignmentData = [
  { 
    field: "Full Stack", 
    aligned: 156, 
    notAligned: 24, 
    alignedPercent: 86.7,
    color: "#3b82f6",
    description: "พัฒนาทั้ง Frontend และ Backend"
  },
  { 
    field: "Frontend", 
    aligned: 89, 
    notAligned: 18, 
    alignedPercent: 83.2,
    color: "#10b981",
    description: "พัฒนา UI/UX และ Web Interface"
  },
  { 
    field: "Backend", 
    aligned: 112, 
    notAligned: 15, 
    alignedPercent: 88.2,
    color: "#8b5cf6",
    description: "พัฒนา Server และ Database"
  },
  { 
    field: "Mobile", 
    aligned: 67, 
    notAligned: 12, 
    alignedPercent: 84.8,
    color: "#f59e0b",
    description: "พัฒนา iOS และ Android App"
  },
  { 
    field: "DevOps", 
    aligned: 45, 
    notAligned: 8, 
    alignedPercent: 84.9,
    color: "#ef4444",
    description: "จัดการ Infrastructure และ CI/CD"
  },
  { 
    field: "Data/AI", 
    aligned: 78, 
    notAligned: 9, 
    alignedPercent: 89.7,
    color: "#06b6d4",
    description: "วิเคราะห์ข้อมูลและ Machine Learning"
  },
  { 
    field: "UI/UX", 
    aligned: 52, 
    notAligned: 14, 
    alignedPercent: 78.8,
    color: "#ec4899",
    description: "ออกแบบประสบการณ์ผู้ใช้"
  },
  { 
    field: "QA/Testing", 
    aligned: 38, 
    notAligned: 7, 
    alignedPercent: 84.4,
    color: "#14b8a6",
    description: "ทดสอบและประกันคุณภาพซอฟต์แวร์"
  },
]

// Overall alignment pie data
const overallAlignmentData = [
  { name: "ได้งานตรงสาย", value: 637, color: "#10b981" },
  { name: "ไม่ตรงสาย", value: 107, color: "#f59e0b" },
]

const careerStats = {
  totalAlumni: 12500,
  employmentRate: 94,
  averageSalary: "55,000",
  topIndustries: [
    { name: "เทคโนโลยี", percentage: 35, count: 4375 },
    { name: "การเงิน", percentage: 25, count: 3125 },
    { name: "การศึกษา", percentage: 15, count: 1875 },
    { name: "สุขภาพ", percentage: 12, count: 1500 },
    { name: "อื่นๆ", percentage: 13, count: 1625 },
  ],
  topCompanies: [
    { name: "Google Thailand", count: 45 },
    { name: "SCB", count: 38 },
    { name: "PTT", count: 32 },
    { name: "True Corporation", count: 28 },
    { name: "Agoda", count: 25 },
  ],
  topLocations: [
    { name: "กรุงเทพมหานคร", percentage: 65 },
    { name: "เชียงใหม่", percentage: 12 },
    { name: "ต่างประเทศ", percentage: 10 },
    { name: "ภาคตะวันออก", percentage: 8 },
    { name: "อื่นๆ", percentage: 5 },
  ],
}

const careerPaths = [
  {
    title: "Software Engineering",
    levels: [
      { title: "Junior Developer", years: "0-2 ปี", salary: "25,000-40,000" },
      { title: "Mid Developer", years: "2-5 ปี", salary: "40,000-70,000" },
      { title: "Senior Developer", years: "5-8 ปี", salary: "70,000-120,000" },
      { title: "Tech Lead / Architect", years: "8+ ปี", salary: "120,000+" },
    ],
  },
  {
    title: "Data Science",
    levels: [
      { title: "Data Analyst", years: "0-2 ปี", salary: "30,000-45,000" },
      { title: "Data Scientist", years: "2-5 ปี", salary: "50,000-80,000" },
      { title: "Senior Data Scientist", years: "5-8 ปี", salary: "80,000-130,000" },
      { title: "Head of Data", years: "8+ ปี", salary: "150,000+" },
    ],
  },
  {
    title: "Product Management",
    levels: [
      { title: "Associate PM", years: "0-2 ปี", salary: "35,000-50,000" },
      { title: "Product Manager", years: "2-5 ปี", salary: "55,000-85,000" },
      { title: "Senior PM", years: "5-8 ปี", salary: "90,000-140,000" },
      { title: "VP of Product", years: "8+ ปี", salary: "180,000+" },
    ],
  },
]

const skills = [
  { name: "Python", demand: 92 },
  { name: "JavaScript", demand: 88 },
  { name: "Data Analysis", demand: 85 },
  { name: "Cloud Computing", demand: 82 },
  { name: "Machine Learning", demand: 78 },
  { name: "Project Management", demand: 75 },
  { name: "UI/UX Design", demand: 72 },
  { name: "Communication", demand: 95 },
]

const resources = [
  {
    title: "เตรียมตัวสัมภาษณ์งาน Tech",
    type: "บทความ",
    author: "ดร.สมชาย ปัญญาดี",
    views: 1250,
  },
  {
    title: "Career Path ใน Data Science",
    type: "วิดีโอ",
    author: "คุณสมหญิง เก่งกาจ",
    views: 980,
  },
  {
    title: "Resume Writing Workshop",
    type: "Workshop",
    author: "Alumni Career Center",
    views: 2100,
  },
  {
    title: "Networking Tips สำหรับนักศึกษาจบใหม่",
    type: "บทความ",
    author: "คุณสมศักดิ์ มั่งมี",
    views: 850,
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

// Custom Tooltip for Bar Chart
const CustomBarTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    const data = jobAlignmentData.find(d => d.field === label)
    return (
      <div className="bg-card border border-border rounded-lg p-4 shadow-xl">
        <p className="font-bold text-foreground mb-2">{label}</p>
        <p className="text-sm text-muted-foreground mb-3">{data?.description}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm">ตรงสาย: <span className="font-semibold">{payload[0]?.value} คน</span></span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-amber-500" />
            <span className="text-sm">ไม่ตรงสาย: <span className="font-semibold">{payload[1]?.value} คน</span></span>
          </div>
          <div className="pt-2 border-t border-border">
            <span className="text-sm font-medium">อัตราตรงสาย: <span className="text-green-500">{data?.alignedPercent}%</span></span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

// Custom Tooltip for Pie Chart
const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
  if (active && payload && payload.length) {
    const total = overallAlignmentData.reduce((sum, d) => sum + d.value, 0)
    const percent = ((payload[0].value / total) * 100).toFixed(1)
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
        <p className="font-semibold" style={{ color: payload[0].payload.color }}>{payload[0].name}</p>
        <p className="text-sm">{payload[0].value} คน ({percent}%)</p>
      </div>
    )
  }
  return null
}

export default function CareerPage() {
  const { user } = useAuth()
  const [selectedPath, setSelectedPath] = useState(0)
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null)
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null)

  const totalAligned = jobAlignmentData.reduce((sum, d) => sum + d.aligned, 0)
  const totalNotAligned = jobAlignmentData.reduce((sum, d) => sum + d.notAligned, 0)
  const overallAlignedPercent = ((totalAligned / (totalAligned + totalNotAligned)) * 100).toFixed(1)

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Career Insights</h1>
        <p className="mt-1 text-muted-foreground">
          ข้อมูลและแนวโน้มอาชีพของศิษย์เก่า เพื่อช่วยวางแผนอนาคตของคุณ
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ศิษย์เก่าทั้งหมด</p>
                  <p className="mt-1 text-3xl font-bold">{careerStats.totalAlumni.toLocaleString()}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">อัตราการมีงานทำ</p>
                  <p className="mt-1 text-3xl font-bold">{careerStats.employmentRate}%</p>
                </div>
                <div className="rounded-full bg-green-500/10 p-3">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">เงินเดือนเฉลี่ย</p>
                  <p className="mt-1 text-3xl font-bold">{careerStats.averageSalary}</p>
                  <p className="text-xs text-muted-foreground">บาท/เดือน</p>
                </div>
                <div className="rounded-full bg-accent/10 p-3">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ได้งานตรงสาย</p>
                  <p className="mt-1 text-3xl font-bold text-green-500">{overallAlignedPercent}%</p>
                  <p className="text-xs text-muted-foreground">{totalAligned} จาก {totalAligned + totalNotAligned} คน</p>
                </div>
                <div className="rounded-full bg-green-500/10 p-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Job Alignment Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              การได้งานตรงสาย แยกตามสายอาชีพ
            </CardTitle>
            <CardDescription>
              แสดงจำนวนศิษย์เก่าที่ได้งานตรงสายและไม่ตรงสายในแต่ละสายอาชีพ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Bar Chart */}
              <div className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={jobAlignmentData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="field" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      className="fill-muted-foreground"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      className="fill-muted-foreground"
                      label={{ value: 'จำนวนคน', angle: -90, position: 'insideLeft', className: 'fill-muted-foreground' }}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend 
                      wrapperStyle={{ paddingTop: 20 }}
                      formatter={(value) => <span className="text-foreground">{value}</span>}
                    />
                    <Bar 
                      dataKey="aligned" 
                      name="ตรงสาย" 
                      stackId="a"
                      radius={[0, 0, 0, 0]}
                      onMouseEnter={(_, index) => setActiveBarIndex(index)}
                      onMouseLeave={() => setActiveBarIndex(null)}
                    >
                      {jobAlignmentData.map((entry, index) => (
                        <Cell 
                          key={`cell-aligned-${index}`} 
                          fill="#10b981"
                          opacity={activeBarIndex === null || activeBarIndex === index ? 1 : 0.5}
                          style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                        />
                      ))}
                    </Bar>
                    <Bar 
                      dataKey="notAligned" 
                      name="ไม่ตรงสาย" 
                      stackId="a"
                      radius={[4, 4, 0, 0]}
                      onMouseEnter={(_, index) => setActiveBarIndex(index)}
                      onMouseLeave={() => setActiveBarIndex(null)}
                    >
                      {jobAlignmentData.map((entry, index) => (
                        <Cell 
                          key={`cell-notAligned-${index}`} 
                          fill="#f59e0b"
                          opacity={activeBarIndex === null || activeBarIndex === index ? 1 : 0.5}
                          style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart and Summary */}
              <div className="space-y-6">
                {/* Pie Chart */}
                <Card className="border-none shadow-none bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">ภาพรวมทั้งหมด</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={overallAlignmentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          onMouseEnter={(_, index) => setActivePieIndex(index)}
                          onMouseLeave={() => setActivePieIndex(null)}
                        >
                          {overallAlignmentData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color}
                              opacity={activePieIndex === null || activePieIndex === index ? 1 : 0.5}
                              style={{ 
                                cursor: 'pointer', 
                                transition: 'all 0.2s',
                                transform: activePieIndex === index ? 'scale(1.05)' : 'scale(1)',
                                transformOrigin: 'center'
                              }}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-2">
                      {overallAlignmentData.map((entry, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-2 cursor-pointer"
                          onMouseEnter={() => setActivePieIndex(index)}
                          onMouseLeave={() => setActivePieIndex(null)}
                        >
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-sm">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Field Cards */}
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                  {jobAlignmentData.map((field, index) => (
                    <motion.div
                      key={field.field}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        activeBarIndex === index ? 'bg-muted border-primary shadow-md' : 'bg-card hover:bg-muted/50'
                      }`}
                      onMouseEnter={() => setActiveBarIndex(index)}
                      onMouseLeave={() => setActiveBarIndex(null)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: field.color }}
                          />
                          <span className="font-medium text-sm">{field.field}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ 
                            borderColor: field.alignedPercent >= 85 ? '#10b981' : '#f59e0b',
                            color: field.alignedPercent >= 85 ? '#10b981' : '#f59e0b'
                          }}
                        >
                          {field.alignedPercent}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {field.aligned}
                        </span>
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-amber-500" />
                          {field.notAligned}
                        </span>
                        <span>รวม {field.aligned + field.notAligned} คน</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="insights" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            ภาพรวม
          </TabsTrigger>
          <TabsTrigger value="paths" className="gap-2">
            <Target className="h-4 w-4" />
            Career Path
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Industries */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    อุตสาหกรรมยอดนิยม
                  </CardTitle>
                  <CardDescription>
                    การกระจายตัวของศิษย์เก่าในแต่ละอุตสาหกรรม
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {careerStats.topIndustries.map((industry, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{industry.name}</span>
                        <span className="text-muted-foreground">
                          {industry.percentage}% ({industry.count.toLocaleString()} คน)
                        </span>
                      </div>
                      <Progress value={industry.percentage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Companies */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    บริษัทที่ศิษย์เก่าทำงาน
                  </CardTitle>
                  <CardDescription>
                    องค์กรชั้นนำที่มีศิษย์เก่าทำงานมากที่สุด
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {careerStats.topCompanies.map((company, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium">{company.name}</span>
                        </div>
                        <Badge variant="secondary">{company.count} คน</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Locations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    สถานที่ทำงาน
                  </CardTitle>
                  <CardDescription>
                    พื้นที่ที่ศิษย์เก่าทำงานมากที่สุด
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {careerStats.topLocations.map((location, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-primary" style={{ opacity: 1 - index * 0.2 }} />
                      <span className="flex-1 text-sm">{location.name}</span>
                      <span className="text-sm font-medium">{location.percentage}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* In-Demand Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    ทักษะที่ต้องการในตลาด
                  </CardTitle>
                  <CardDescription>
                    ทักษะที่นายจ้างต้องการมากที่สุด
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="px-3 py-1.5 text-sm"
                        style={{
                          borderColor: `hsl(${240 - skill.demand}deg 70% 50%)`,
                          backgroundColor: `hsl(${240 - skill.demand}deg 70% 50% / 0.1)`,
                        }}
                      >
                        {skill.name}
                        <span className="ml-1 text-xs text-muted-foreground">
                          {skill.demand}%
                        </span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="paths" className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>เส้นทางอาชีพยอดนิยม</CardTitle>
                <CardDescription>
                  ดูเส้นทางความก้าวหน้าในอาชีพและช่วงเงินเดือนโดยประมาณ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-6">
                  {careerPaths.map((path, index) => (
                    <Button
                      key={index}
                      variant={selectedPath === index ? "default" : "outline"}
                      onClick={() => setSelectedPath(index)}
                    >
                      {path.title}
                    </Button>
                  ))}
                </div>

                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-6">
                    {careerPaths[selectedPath].levels.map((level, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex items-start gap-4 pl-12"
                      >
                        <div className="absolute left-4 top-1 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                        <Card className="flex-1">
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div>
                                <h4 className="font-semibold">{level.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  ประสบการณ์: {level.years}
                                </p>
                              </div>
                              <Badge variant="secondary" className="w-fit">
                                {level.salary} บาท
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {user?.role === "student" && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="rounded-full bg-primary/20 p-3">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">วางแผนอาชีพของคุณ</h3>
                    <p className="text-sm text-muted-foreground">
                      พูดคุยกับ Career Advisor เพื่อวางแผนเส้นทางอาชีพที่เหมาะกับคุณ
                    </p>
                  </div>
                  <Button className="gap-2">
                    นัดหมาย
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2"
          >
            {resources.map((resource, index) => (
              <motion.div key={index} variants={item}>
                <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="mb-3">
                        {resource.type}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {resource.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      โดย {resource.author}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {resource.views.toLocaleString()} views
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {(user?.role === "alumni" || user?.role === "admin") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 font-semibold">แบ่งปันความรู้</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    สร้างเนื้อหาเพื่อช่วยเหลือรุ่นน้องและศิษย์เก่าคนอื่นๆ
                  </p>
                  <Button className="mt-4 bg-transparent" variant="outline">
                    สร้างเนื้อหาใหม่
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
