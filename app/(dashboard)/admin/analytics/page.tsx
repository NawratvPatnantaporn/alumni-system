"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Users, Briefcase, GraduationCap, Building, MapPin, DollarSign, BarChart3, PieChart, LineChart, Target, CheckCircle2, XCircle, ArrowUpRight, Download, Calendar, Code, Database, Layout, Layers, Server, Smartphone, Cloud, Cpu, Palette, X, TrendingUp, Eye } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Sector } from "recharts"

// Career alignment data by specialization
const careerAlignmentData = [
  { 
    name: "Full Stack", 
    total: 245, 
    aligned: 198, 
    notAligned: 47, 
    alignmentRate: 80.8,
    icon: Layers,
    color: "#3b82f6",
    topCompanies: ["LINE", "Agoda", "SCB"],
    avgSalary: "55,000"
  },
  { 
    name: "Frontend", 
    total: 189, 
    aligned: 162, 
    notAligned: 27, 
    alignmentRate: 85.7,
    icon: Layout,
    color: "#10b981",
    topCompanies: ["Shopee", "Grab", "KBTG"],
    avgSalary: "48,000"
  },
  { 
    name: "Backend", 
    total: 203, 
    aligned: 175, 
    notAligned: 28, 
    alignmentRate: 86.2,
    icon: Server,
    color: "#8b5cf6",
    topCompanies: ["True Digital", "AIS", "dtac"],
    avgSalary: "52,000"
  },
  { 
    name: "Mobile Dev", 
    total: 134, 
    aligned: 108, 
    notAligned: 26, 
    alignmentRate: 80.6,
    icon: Smartphone,
    color: "#f59e0b",
    topCompanies: ["Ascend", "2C2P", "Finnomena"],
    avgSalary: "50,000"
  },
  { 
    name: "DevOps/Cloud", 
    total: 98, 
    aligned: 89, 
    notAligned: 9, 
    alignmentRate: 90.8,
    icon: Cloud,
    color: "#06b6d4",
    topCompanies: ["AWS", "Google", "Azure"],
    avgSalary: "60,000"
  },
  { 
    name: "Data/AI", 
    total: 156, 
    aligned: 141, 
    notAligned: 15, 
    alignmentRate: 90.4,
    icon: Cpu,
    color: "#ec4899",
    topCompanies: ["SCB", "PTT", "CP"],
    avgSalary: "65,000"
  },
  { 
    name: "UI/UX Design", 
    total: 87, 
    aligned: 72, 
    notAligned: 15, 
    alignmentRate: 82.8,
    icon: Palette,
    color: "#f97316",
    topCompanies: ["Wongnai", "Pomelo", "Kerry"],
    avgSalary: "45,000"
  },
  { 
    name: "Database", 
    total: 76, 
    aligned: 62, 
    notAligned: 14, 
    alignmentRate: 81.6,
    icon: Database,
    color: "#14b8a6",
    topCompanies: ["Oracle", "IBM", "Microsoft"],
    avgSalary: "55,000"
  },
]

// Yearly trend data
const yearlyTrendData = [
  { year: "2019", aligned: 72, notAligned: 28, total: 450, graduates: 450 },
  { year: "2020", aligned: 75, notAligned: 25, total: 520, graduates: 520 },
  { year: "2021", aligned: 78, notAligned: 22, total: 580, graduates: 580 },
  { year: "2022", aligned: 82, notAligned: 18, total: 650, graduates: 650 },
  { year: "2023", aligned: 85, notAligned: 15, total: 720, graduates: 720 },
  { year: "2024", aligned: 87, notAligned: 13, total: 800, graduates: 800 },
]

// Employment status data
const employmentStatusData = [
  { name: "ได้งานตรงสาย", value: 1007, color: "#10b981", description: "ทำงานตรงตามสายที่เรียน" },
  { name: "ได้งานไม่ตรงสาย", value: 181, color: "#f59e0b", description: "ทำงานในสายงานอื่น" },
  { name: "กำลังหางาน", value: 45, color: "#ef4444", description: "อยู่ระหว่างหางาน" },
  { name: "ศึกษาต่อ", value: 78, color: "#3b82f6", description: "กำลังศึกษาต่อระดับสูงขึ้น" },
  { name: "ประกอบธุรกิจส่วนตัว", value: 67, color: "#8b5cf6", description: "เป็นเจ้าของกิจการ" },
]

// Salary range by specialization
const salaryData = [
  { name: "Full Stack", entry: 28000, mid: 55000, senior: 95000, growth: "+15%" },
  { name: "Frontend", entry: 25000, mid: 48000, senior: 85000, growth: "+12%" },
  { name: "Backend", entry: 27000, mid: 52000, senior: 92000, growth: "+14%" },
  { name: "Mobile", entry: 26000, mid: 50000, senior: 88000, growth: "+13%" },
  { name: "DevOps", entry: 30000, mid: 60000, senior: 110000, growth: "+18%" },
  { name: "Data/AI", entry: 32000, mid: 65000, senior: 120000, growth: "+22%" },
]

// Company distribution
const companyDistribution = [
  { name: "Tech Startups", value: 320, color: "#3b82f6", examples: ["LINE", "Agoda", "Grab"] },
  { name: "Corporate/Enterprise", value: 280, color: "#10b981", examples: ["SCB", "KBTG", "PTT Digital"] },
  { name: "Consulting", value: 150, color: "#f59e0b", examples: ["Accenture", "Deloitte", "PwC"] },
  { name: "Government/State Enterprise", value: 95, color: "#8b5cf6", examples: ["ETDA", "DGA", "NT"] },
  { name: "Freelance", value: 85, color: "#ec4899", examples: ["Upwork", "Toptal", "Fiverr"] },
  { name: "International Companies", value: 258, color: "#06b6d4", examples: ["Google", "Microsoft", "Amazon"] },
]

// Skills demand radar
const skillsDemandData = [
  { skill: "React/Vue/Angular", demand: 92, alumni: 85, gap: -7 },
  { skill: "Node.js/Python", demand: 88, alumni: 78, gap: -10 },
  { skill: "Cloud Services", demand: 85, alumni: 65, gap: -20 },
  { skill: "Database", demand: 82, alumni: 75, gap: -7 },
  { skill: "Mobile Dev", demand: 75, alumni: 58, gap: -17 },
  { skill: "AI/ML", demand: 78, alumni: 45, gap: -33 },
  { skill: "DevOps/CI/CD", demand: 80, alumni: 55, gap: -25 },
  { skill: "Security", demand: 72, alumni: 42, gap: -30 },
]

// Time to employment
const timeToEmployment = [
  { range: "ก่อนจบ", count: 245, percentage: 17.8 },
  { range: "0-1 เดือน", count: 385, percentage: 28.0 },
  { range: "1-3 เดือน", count: 420, percentage: 30.5 },
  { range: "3-6 เดือน", count: 218, percentage: 15.8 },
  { range: "6+ เดือน", count: 110, percentage: 8.0 },
]

// Geographic distribution
const geographicData = [
  { region: "กรุงเทพและปริมณฑล", count: 856, percentage: 62.2 },
  { region: "ภาคกลาง", count: 145, percentage: 10.5 },
  { region: "ภาคเหนือ", count: 132, percentage: 9.6 },
  { region: "ภาคตะวันออกเฉียงเหนือ", count: 98, percentage: 7.1 },
  { region: "ภาคใต้", count: 67, percentage: 4.9 },
  { region: "ต่างประเทศ", count: 80, percentage: 5.8 },
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

// Custom Tooltip Components
const CustomBarTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    const data = careerAlignmentData.find(d => d.name === label)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-lg shadow-xl p-4 min-w-[200px]"
      >
        <p className="font-bold text-foreground mb-2">{label}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-green-500">ตรงสาย:</span>
            <span className="font-medium">{payload[0]?.value} คน</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-500">ไม่ตรงสาย:</span>
            <span className="font-medium">{payload[1]?.value} คน</span>
          </div>
          <div className="border-t border-border pt-1 mt-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">อัตราตรงสาย:</span>
              <span className="font-bold text-primary">{data?.alignmentRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">เงินเดือนเฉลี่ย:</span>
              <span className="font-medium">{data?.avgSalary} บาท</span>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }
  return null
}

const CustomAreaTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; dataKey: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    const data = yearlyTrendData.find(d => d.year === label)
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg shadow-xl p-4"
      >
        <p className="font-bold text-foreground mb-2">ปี {label}</p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>ตรงสาย: {payload.find(p => p.dataKey === 'aligned')?.value}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>ไม่ตรงสาย: {payload.find(p => p.dataKey === 'notAligned')?.value}%</span>
          </div>
          <div className="border-t border-border pt-1 mt-2 text-muted-foreground">
            <span>จำนวนบัณฑิต: {data?.graduates.toLocaleString()} คน</span>
          </div>
        </div>
      </motion.div>
    )
  }
  return null
}

const CustomSalaryTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; dataKey: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    const data = salaryData.find(d => d.name === label)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-lg shadow-xl p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-foreground">{label}</p>
          <Badge variant="outline" className="text-green-500 border-green-500">
            {data?.growth}
          </Badge>
        </div>
        <div className="space-y-2 text-sm">
          {payload.map((p, i) => (
            <div key={i} className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: p.dataKey === 'entry' ? '#3b82f6' : p.dataKey === 'mid' ? '#10b981' : '#8b5cf6' }}
                />
                <span className="text-muted-foreground">
                  {p.dataKey === 'entry' ? 'Entry Level' : p.dataKey === 'mid' ? 'Mid Level' : 'Senior Level'}
                </span>
              </div>
              <span className="font-medium">{p.value.toLocaleString()} บาท</span>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }
  return null
}

const CustomRadarTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string; dataKey: string; payload: { skill: string; gap: number } }> }) => {
  if (active && payload && payload.length) {
    const skillData = payload[0]?.payload
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-lg shadow-xl p-4"
      >
        <p className="font-bold text-foreground mb-2">{skillData?.skill}</p>
        <div className="space-y-1 text-sm">
          {payload.map((p, i) => (
            <div key={i} className="flex justify-between items-center gap-4">
              <span className={p.dataKey === 'demand' ? 'text-blue-500' : 'text-green-500'}>
                {p.name}:
              </span>
              <span className="font-medium">{p.value}%</span>
            </div>
          ))}
          <div className="border-t border-border pt-1 mt-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gap:</span>
              <span className={`font-bold ${skillData?.gap && skillData.gap < -20 ? 'text-red-500' : 'text-amber-500'}`}>
                {skillData?.gap}%
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }
  return null
}

// Active Pie Sector
const renderActiveShape = (props: {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: { name: string; value: number; description: string };
  percent: number;
}) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props

  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="currentColor" className="text-sm font-bold">
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="currentColor" className="text-xs text-muted-foreground">
        {payload.value} คน ({(percent * 100).toFixed(1)}%)
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        fill={fill}
      />
    </g>
  )
}

export default function AdminAnalyticsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedYear, setSelectedYear] = useState("all")
  const [activeSpecIndex, setActiveSpecIndex] = useState<number | null>(null)
  const [activePieIndex, setActivePieIndex] = useState(0)
  const [selectedBarData, setSelectedBarData] = useState<typeof careerAlignmentData[0] | null>(null)
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null)
  const [hoveredTimeIndex, setHoveredTimeIndex] = useState<number | null>(null)
  const [hoveredGeoIndex, setHoveredGeoIndex] = useState<number | null>(null)

  const onPieEnter = useCallback((_: unknown, index: number) => {
    setActivePieIndex(index)
  }, [])

  // Redirect if not admin
  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="p-8">
            <Shield className="mx-auto h-16 w-16 text-destructive/50" />
            <h2 className="mt-4 text-xl font-bold">ไม่มีสิทธิ์เข้าถึง</h2>
            <p className="mt-2 text-muted-foreground">
              หน้านี้สำหรับผู้ดูแลระบบเท่านั้น
            </p>
            <Button className="mt-4" onClick={() => router.push("/dashboard")}>
              กลับหน้าหลัก
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalAlumni = careerAlignmentData.reduce((acc, curr) => acc + curr.total, 0)
  const totalAligned = careerAlignmentData.reduce((acc, curr) => acc + curr.aligned, 0)
  const overallAlignmentRate = ((totalAligned / totalAlumni) * 100).toFixed(1)

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Career Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            วิเคราะห์ข้อมูลการได้งานและเส้นทางอาชีพของศิษย์เก่า (Interactive Charts)
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="ปี" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกปี</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card className="relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ศิษย์เก่าทั้งหมด</p>
                  <p className="mt-1 text-3xl font-bold">{totalAlumni.toLocaleString()}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-green-600">
                    <ArrowUpRight className="h-3 w-3" />
                    +12.5% จากปีก่อน
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-primary group-hover:h-2 transition-all" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ได้งานตรงสาย</p>
                  <p className="mt-1 text-3xl font-bold">{overallAlignmentRate}%</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-green-600">
                    <ArrowUpRight className="h-3 w-3" />
                    +2.3% จากปีก่อน
                  </p>
                </div>
                <div className="rounded-full bg-green-500/10 p-3 group-hover:bg-green-500/20 transition-colors">
                  <Target className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500/50 to-green-500 group-hover:h-2 transition-all" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">เงินเดือนเฉลี่ย (Entry)</p>
                  <p className="mt-1 text-3xl font-bold">28K</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-green-600">
                    <ArrowUpRight className="h-3 w-3" />
                    +8.2% จากปีก่อน
                  </p>
                </div>
                <div className="rounded-full bg-amber-500/10 p-3 group-hover:bg-amber-500/20 transition-colors">
                  <DollarSign className="h-6 w-6 text-amber-500" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/50 to-amber-500 group-hover:h-2 transition-all" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ได้งานภายใน 3 เดือน</p>
                  <p className="mt-1 text-3xl font-bold">76.3%</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-green-600">
                    <ArrowUpRight className="h-3 w-3" />
                    +5.1% จากปีก่อน
                  </p>
                </div>
                <div className="rounded-full bg-blue-500/10 p-3 group-hover:bg-blue-500/20 transition-colors">
                  <Briefcase className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/50 to-blue-500 group-hover:h-2 transition-all" />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Career Alignment by Specialization - Interactive */}
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
              <Badge variant="secondary" className="ml-2">Interactive</Badge>
            </CardTitle>
            <CardDescription>
              คลิกที่แท่งกราฟหรือการ์ดเพื่อดูรายละเอียดเพิ่มเติม
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Bar Chart */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={careerAlignmentData} 
                    layout="vertical"
                    onClick={(data) => {
                      if (data?.activePayload) {
                        const clickedData = careerAlignmentData.find(
                          d => d.name === data.activeLabel
                        )
                        setSelectedBarData(clickedData || null)
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend 
                      formatter={(value) => value === "aligned" ? "ตรงสาย" : "ไม่ตรงสาย"}
                    />
                    <Bar 
                      dataKey="aligned" 
                      stackId="a" 
                      fill="#10b981" 
                      name="aligned"
                      className="cursor-pointer"
                      onMouseEnter={(_, index) => setActiveSpecIndex(index)}
                      onMouseLeave={() => setActiveSpecIndex(null)}
                    />
                    <Bar 
                      dataKey="notAligned" 
                      stackId="a" 
                      fill="#f59e0b" 
                      name="notAligned"
                      className="cursor-pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Cards */}
              <div className="grid gap-3 sm:grid-cols-2">
                {careerAlignmentData.map((spec, index) => {
                  const Icon = spec.icon
                  const isActive = activeSpecIndex === index
                  return (
                    <motion.div
                      key={spec.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ 
                        opacity: 1, 
                        scale: isActive ? 1.02 : 1,
                      }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedBarData(spec)}
                      onMouseEnter={() => setActiveSpecIndex(index)}
                      onMouseLeave={() => setActiveSpecIndex(null)}
                      className="cursor-pointer"
                    >
                      <Card className={`p-4 transition-all duration-200 ${isActive ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}`}>
                        <div className="flex items-start gap-3">
                          <div 
                            className="rounded-lg p-2 transition-transform duration-200"
                            style={{ 
                              backgroundColor: `${spec.color}20`,
                              transform: isActive ? 'scale(1.1)' : 'scale(1)'
                            }}
                          >
                            <Icon className="h-5 w-5" style={{ color: spec.color }} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{spec.name}</p>
                            <p className="text-sm text-muted-foreground">{spec.total} คน</p>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${spec.alignmentRate}%` }}
                                  transition={{ delay: index * 0.1, duration: 0.5 }}
                                  style={{ backgroundColor: spec.color }}
                                />
                              </div>
                              <span className="text-sm font-medium" style={{ color: spec.color }}>
                                {spec.alignmentRate}%
                              </span>
                            </div>
                            <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                {spec.aligned}
                              </span>
                              <span className="flex items-center gap-1">
                                <XCircle className="h-3 w-3 text-amber-500" />
                                {spec.notAligned}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedBarData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBarData(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-xl shadow-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="rounded-lg p-3"
                    style={{ backgroundColor: `${selectedBarData.color}20` }}
                  >
                    <selectedBarData.icon className="h-6 w-6" style={{ color: selectedBarData.color }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedBarData.name}</h3>
                    <p className="text-sm text-muted-foreground">รายละเอียดสายงาน</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedBarData(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">จำนวนทั้งหมด</p>
                    <p className="text-2xl font-bold">{selectedBarData.total}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">อัตราตรงสาย</p>
                    <p className="text-2xl font-bold" style={{ color: selectedBarData.color }}>
                      {selectedBarData.alignmentRate}%
                    </p>
                  </Card>
                </div>

                <div className="flex items-center gap-4 justify-center">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-green-500">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-xl font-bold">{selectedBarData.aligned}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">ตรงสาย</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-amber-500">
                      <XCircle className="h-5 w-5" />
                      <span className="text-xl font-bold">{selectedBarData.notAligned}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">ไม่ตรงสาย</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">เงินเดือนเฉลี่ย</p>
                  <p className="text-lg font-bold text-primary">{selectedBarData.avgSalary} บาท/เดือน</p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">บริษัทยอดนิยม</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedBarData.topCompanies.map((company, i) => (
                      <Badge key={i} variant="secondary">{company}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trend and Employment Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Yearly Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                แนวโน้มการได้งานตรงสาย (รายปี)
                <Badge variant="secondary" className="ml-2">Hover for details</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yearlyTrendData}>
                    <defs>
                      <linearGradient id="colorAligned" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorNotAligned" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <Tooltip content={<CustomAreaTooltip />} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="aligned" 
                      stackId="1"
                      stroke="#10b981" 
                      fill="url(#colorAligned)"
                      name="ตรงสาย"
                      activeDot={{ r: 8, strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="notAligned" 
                      stackId="1"
                      stroke="#f59e0b" 
                      fill="url(#colorNotAligned)"
                      name="ไม่ตรงสาย"
                      activeDot={{ r: 8, strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Employment Status Pie Chart - Interactive */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                สถานะการทำงานของศิษย์เก่า
                <Badge variant="secondary" className="ml-2">Click to explore</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="h-64 w-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        activeIndex={activePieIndex}
                        activeShape={(props: unknown) =>
                          renderActiveShape(
                            props as Parameters<typeof renderActiveShape>[0]
                          )
                        }
                        data={employmentStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                      >
                        {employmentStatusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            className="cursor-pointer transition-all duration-200"
                            style={{
                              filter: activePieIndex === index ? 'brightness(1.1)' : 'brightness(1)',
                            }}
                          />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {employmentStatusData.map((status, index) => (
                    <motion.div 
                      key={index} 
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                        activePieIndex === index ? 'bg-muted shadow-sm' : 'hover:bg-muted/50'
                      }`}
                      onMouseEnter={() => setActivePieIndex(index)}
                      whileHover={{ x: 4 }}
                    >
                      <div 
                        className="h-3 w-3 rounded-full transition-transform"
                        style={{ 
                          backgroundColor: status.color,
                          transform: activePieIndex === index ? 'scale(1.3)' : 'scale(1)'
                        }}
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{status.name}</span>
                        {activePieIndex === index && (
                          <motion.p 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-xs text-muted-foreground"
                          >
                            {status.description}
                          </motion.p>
                        )}
                      </div>
                      <span className="text-sm font-bold">{status.value}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Salary and Company Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Salary Range - Interactive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Geographic Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-5 w-5" />
                การกระจายตัวตามภูมิภาค
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {geographicData.map((geo, index) => {
                  const isHovered = hoveredGeoIndex === index
                  return (
                    <motion.div 
                      key={index} 
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                        isHovered ? 'bg-muted' : ''
                      }`}
                      onMouseEnter={() => setHoveredGeoIndex(index)}
                      onMouseLeave={() => setHoveredGeoIndex(null)}
                      whileHover={{ x: 4 }}
                    >
                      <span className="w-36 text-sm truncate">{geo.region}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${geo.percentage}%` }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className="h-full bg-accent rounded-full transition-all"
                          style={{
                            filter: isHovered ? 'brightness(1.2)' : 'brightness(1)'
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.span 
                          className="text-sm font-medium"
                          animate={{ scale: isHovered ? 1.1 : 1 }}
                        >
                          {geo.count}
                        </motion.span>
                        <span className="text-xs text-muted-foreground">({geo.percentage}%)</span>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <Eye className="h-4 w-4 text-primary" />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Company Distribution - Interactive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                ประเภทองค์กรที่ทำงาน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companyDistribution.map((company, index) => {
                  const total = companyDistribution.reduce((acc, c) => acc + c.value, 0)
                  const percentage = ((company.value / total) * 100).toFixed(1)
                  const isHovered = hoveredCompany === company.name
                  return (
                    <motion.div 
                      key={index}
                      onMouseEnter={() => setHoveredCompany(company.name)}
                      onMouseLeave={() => setHoveredCompany(null)}
                      className={`p-2 rounded-lg transition-all cursor-pointer ${
                        isHovered ? 'bg-muted' : ''
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{company.name}</span>
                        <span className="text-sm font-bold">{company.value} คน ({percentage}%)</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className="h-full rounded-full transition-all"
                          style={{ 
                            backgroundColor: company.color,
                            filter: isHovered ? 'brightness(1.2)' : 'brightness(1)'
                          }}
                        />
                      </div>
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 flex flex-wrap gap-1"
                          >
                            {company.examples.map((ex, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {ex}
                              </Badge>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
