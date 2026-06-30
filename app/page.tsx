"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Users,
  Briefcase,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Award,
  Sparkles,
  TrendingUp,
  MessageSquare,
  UserPlus,
  Target,
  Zap,
  Shield,
  Globe,
  Building2,
  Star,
} from "lucide-react";
import { useRef } from "react";
import { useSystemSettings } from "@/contexts/system-settings-context";

const features = [
  {
    icon: Users,
    title: "ระบบเครือข่ายศิษย์เก่า",
    description: "ค้นหาและเชื่อมต่อกับศิษย์เก่าจากทุกรุ่น ทุกสาขา ทุกอาชีพ",
  },
  {
    icon: Briefcase,
    title: "ศูนย์รวมโอกาสทางวิชาชีพ",
    description: "เข้าถึงตำแหน่งงานและโอกาสพิเศษจากเครือข่ายศิษย์เก่า",
  },
  {
    icon: BarChart3,
    title: "ข้อมูลวิเคราะห์เส้นทางอาชีพ",
    description: "วิเคราะห์เส้นทางอาชีพจากข้อมูลจริงของศิษย์เก่า",
  },
  {
    icon: Award,
    title: "กิจกรรมและข่าวสาร",
    description: "ติดตามข่าวสารและเข้าร่วมกิจกรรมของสมาคมศิษย์เก่า",
  },
];

const whyJoinReasons = [
  {
    icon: Briefcase,
    title: "เข้าถึงโอกาสงานเฉพาะเครือข่ายศิษย์เก่า",
    description:
      "โอกาสทางอาชีพที่เปิดรับเฉพาะในเครือข่ายเพิ่มความได้เปรียบในการเติบโตสายงาน",
    color: "from-blue-500/20 to-blue-600/20",
    iconColor: "text-blue-500",
  },
  {
    icon: Globe,
    title: "สร้างเครือข่ายข้ามอุตสาหกรรม",
    description:
      "เชื่อมต่อกับมืออาชีพในหลากหลายสายงาน ขยายโอกาสทางธุรกิจและอาชีพ",
    color: "from-emerald-500/20 to-emerald-600/20",
    iconColor: "text-emerald-500",
  },
  {
    icon: UserPlus,
    title: "รับการแนะนำงาน",
    description:
      "ได้รับการ Refer จากศิษย์เก่าในบริษัทชั้นนำ เพิ่มโอกาสได้งานมากขึ้น 10 เท่า",
    color: "from-amber-500/20 to-amber-600/20",
    iconColor: "text-amber-500",
  },
  {
    icon: TrendingUp,
    title: "บันทึกและต่อยอดเส้นทางอาชีพ",
    description: "บันทึกและติดตามเส้นทางอาชีพของคุณ พร้อมรับคำแนะนำจากรุ่นพี่",
    color: "from-purple-500/20 to-purple-600/20",
    iconColor: "text-purple-500",
  },
  {
    icon: MessageSquare,
    title: "เชื่อมต่อกับรุ่นเดียวกัน",
    description:
      "ไม่พลาดการติดต่อกับเพื่อนร่วมรุ่น จัดกิจกรรมพบปะ แลกเปลี่ยนประสบการณ์",
    color: "from-pink-500/20 to-pink-600/20",
    iconColor: "text-pink-500",
  },
  {
    icon: BarChart3,
    title: "เข้าถึง Career Insights",
    description:
      "ข้อมูลวิเคราะห์เงินเดือน แนวโน้มตลาด และเส้นทางอาชีพจากศิษย์เก่าจริง",
    color: "from-cyan-500/20 to-cyan-600/20",
    iconColor: "text-cyan-500",
  },
];

const stats = [
  { value: "10,000+", label: "ศิษย์เก่าในเครือข่าย", icon: Users },
  { value: "500+", label: "บริษัทและองค์กรพันธมิตร", icon: Building2 },
  { value: "1,200+", label: "โอกาสทางอาชีพที่เปิดอยู่", icon: Briefcase },
  { value: "50+", label: "ปีแห่งการสร้างเครือข่าย", icon: Award },
];

// const testimonials = [
//   {
//     quote: "Alumni Connect ช่วยให้ผมได้เชื่อมต่อกับรุ่นพี่ในสายงานเดียวกัน และได้รับคำแนะนำที่มีค่ามาก ตอนนี้ได้งานในบริษัทที่ใฝ่ฝันแล้ว!",
//     name: "ธนากร สุขใจ",
//     role: "Software Engineer @ LINE Thailand",
//     avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
//     rating: 5,
//   },
//   {
//     quote: "ระบบนี้ทำให้การหาคนมาทำงานง่ายขึ้นมาก เพราะได้คนที่มีพื้นฐานและค่านิยมใกล้เคียงกัน คุณภาพของ candidate ดีมาก",
//     name: "สมหญิง รักงาน",
//     role: "HR Director @ SCB",
//     avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
//     rating: 5,
//   },
//   {
//     quote: "Career Insights ช่วยให้เข้าใจเส้นทางอาชีพได้ชัดเจนขึ้น และวางแผนอนาคตได้ดีขึ้น ข้อมูลละเอียดและอัพเดทตลอด",
//     name: "วิชัย มุ่งมั่น",
//     role: "Product Manager @ Agoda",
//     avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
//     rating: 5,
//   },
// ];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const floatingVariants: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: [0.4, 0, 0.6, 1], // ← easeInOut มาตรฐาน
    },
  },
};

const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function LandingPage() {
  const heroRef = useRef<HTMLElement>(null);
  const { settings } = useSystemSettings();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {settings.loginLogoUrl ? (
              <motion.img
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                src={settings.loginLogoUrl}
                alt={settings.systemName}
                className="h-10 w-auto max-w-[160px] object-contain"
              />
            ) : (
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center"
              >
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </motion.div>
            )}

            <span className="font-bold text-lg">
              {settings.systemName}
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">
                เข้าสู่ระบบ
              </Button>
            </Link>
            <Link href="/register">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button>สมัครสมาชิก</Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="pt-32 pb-24 px-4 relative overflow-hidden min-h-screen flex items-center"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            variants={pulseVariants}
            animate="animate"
            className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
          />
          <motion.div
            variants={pulseVariants}
            animate="animate"
            style={{ animationDelay: "1s" }}
            className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          />
          <motion.div
            variants={pulseVariants}
            animate="animate"
            style={{ animationDelay: "2s" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"
          />
        </div>

        {/* Floating Shapes */}
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="absolute top-40 right-20 hidden lg:block"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-primary" />
          </div>
        </motion.div>
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: "1s" }}
          className="absolute bottom-40 left-20 hidden lg:block"
        >
          <div className="w-14 h-14 rounded-xl bg-accent/10 backdrop-blur-sm border border-accent/20 flex items-center justify-center">
            <Users className="w-7 h-7 text-accent" />
          </div>
        </motion.div>
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: "2s" }}
          className="absolute top-60 left-40 hidden lg:block"
        >
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
          </div>
        </motion.div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="container mx-auto text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.2,
              duration: 0.5,
              type: "spring",
              stiffness: 200,
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>ศูนย์กลางเครือข่ายศิษย์เก่ามหาวิทยาลัยศรีปทุม</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-balance"
          >
            เชื่อมโยงศิษย์เก่า
            <br />
            <span className="relative">
              <span className="text-primary">ต่อยอดโอกาสทางอาชีพ</span>
              <motion.svg
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
              >
                <motion.path
                  d="M2 10C50 4 150 4 298 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="text-primary/50"
                />
              </motion.svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-pretty"
          >
            แพลตฟอร์มศูนย์กลางสำหรับศิษย์เก่า นักศึกษาปัจจุบัน
            และสถาบันเพื่อเชื่อมโยงเครือข่าย แบ่งปันโอกาสทางวิชาชีพ
            และเติบโตร่วมกันอย่างยั่งยืน
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/register">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  className="text-base px-8 h-14 text-lg shadow-lg shadow-primary/25"
                >
                  เริ่มต้นใช้งานฟรี
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/login">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 h-14 text-lg bg-transparent"
                >
                  เข้าสู่ระบบ
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Trusted by */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-16 pt-8 border-t border-border/50"
          >
            <p className="text-sm text-muted-foreground mb-4">
              ศิษย์เก่าของเราทำงานที่
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
              {["Google", "LINE", "Agoda", "SCB", "PTT", "AIS"].map(
                (company, i) => (
                  <motion.span
                    key={company}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + i * 0.1 }}
                    className="text-lg font-semibold text-muted-foreground"
                  >
                    {company}
                  </motion.span>
                ),
              )}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-muted/30 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="container mx-auto relative z-10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center group"
                >
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                  >
                    <Icon className="w-7 h-7 text-primary" />
                  </motion.div>
                  <motion.div
                    className="text-4xl md:text-5xl font-bold text-primary mb-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.2 + i * 0.1,
                      type: "spring",
                      stiffness: 200,
                    }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Why Join Section - NEW */}
      <section className="py-24 px-4 relative overflow-hidden">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="container mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4"
            >
              <Target className="w-4 h-4" />
              <span>สิทธิประโยชน์มากมาย</span>
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-balance">
              ทำไมศิษย์เก่าควรเป็น
              <span className="text-primary">ส่วนหนึ่งของเครือข่าย</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              การเป็นส่วนหนึ่งของเครือข่ายศิษย์เก่าที่มีความเคลื่อนไหว
              ช่วยให้ข้อมูลของคุณถูกนำไปใช้จริง
              และเปิดโอกาสทางวิชาชีพอย่างต่อเนื่อง
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyJoinReasons.map((reason, i) => {
              const Icon = reason.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <Card className="h-full border-0 bg-card hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${reason.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    />
                    <CardContent className="p-6 relative z-10">
                      <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${reason.color} flex items-center justify-center mb-5`}
                      >
                        <Icon className={`w-7 h-7 ${reason.iconColor}`} />
                      </motion.div>
                      <h3 className="font-bold text-xl mb-3">{reason.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {reason.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-muted/30 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="container mx-auto relative z-10"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              ฟีเจอร์หลักของเครือข่ายศิษย์เก่า
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              เราสร้างแพลตฟอร์มที่ครบครันเพื่อเชื่อมต่อศิษย์เก่าและสร้างคุณค่าร่วมกัน
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-card group overflow-hidden">
                    <CardContent className="p-6">
                      <motion.div
                        whileHover={{ rotate: -10, scale: 1.1 }}
                        className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-300"
                      >
                        <Icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                      </motion.div>
                      <h3 className="font-bold text-lg mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 relative overflow-hidden">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="container mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            >
              <Zap className="w-4 h-4" />
              <span>เริ่มต้นง่ายๆ</span>
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              เริ่มต้นสร้างเครือข่ายใน 3 ขั้นตอน
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              เข้าร่วมเครือข่ายศิษย์เก่าได้ง่ายๆ ไม่กี่นาที
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

            {[
              {
                step: "01",
                title: "ลงทะเบียน",
                desc: "สร้างบัญชีและยืนยันตัวตนว่าเป็นศิษย์เก่าจริงด้วยอีเมลมหาวิทยาลัย",
                icon: UserPlus,
              },
              {
                step: "02",
                title: "สร้างโปรไฟล์ศิษย์เก่า",
                desc: "โปรไฟล์ของคุณคือ “ตัวตนดิจิทัล” ในเครือข่ายและเป็นกุญแจสำคัญสู่โอกาสใหม่",
                icon: Shield,
              },
              {
                step: "03",
                title: "เชื่อมต่อ",
                desc: "ค้นหาและเชื่อมต่อกับเครือข่ายศิษย์เก่า เริ่มสร้างโอกาสใหม่",
                icon: Globe,
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="text-center relative"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-20 h-20 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/30 relative z-10"
                  >
                    <Icon className="w-10 h-10" />
                  </motion.div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      {/* <section className="py-24 px-4 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="container mx-auto relative z-10"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium mb-4"
            >
              <Star className="w-4 h-4 fill-current" />
              <span>รีวิวจริงจากผู้ใช้จริง</span>
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">ประสบการณ์จริงจากเครือข่ายศิษย์เก่า</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ฟังประสบการณ์จริงจากศิษย์เก่าที่ใช้งาน 
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Card className="h-full border-0 bg-card hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed text-pretty">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                      />
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section> */}

      {/* CTA Section */}
      <section className="py-24 px-4 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Animated Background */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="container mx-auto text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-sm font-medium mb-6"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ฟรี ไม่มีค่าใช้จ่าย</span>
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-balance">
            พร้อมขยายเครือข่ายและต่อยอดโอกาสทางอาชีพแล้วหรือยัง?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
            เข้าร่วมเครือข่ายศิษย์เก่าที่ข้อมูลของคุณมีคุณค่าและถูกนำไปใช้ในการสร้างโอกาสอย่างต่อเนื่อง
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-base px-10 h-14 text-lg shadow-xl"
                >
                  เริ่มต้นใช้งานฟรี
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/login">
              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-10 h-14 text-lg border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  เข้าสู่ระบบ
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-sidebar text-sidebar-foreground">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-6">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center"
                >
                  <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
                </motion.div>
                <span className="font-bold text-lg"> Sripatum Alumni </span>
              </Link>
              <p className="text-sm text-sidebar-foreground/70 leading-relaxed">
                แพลตฟอร์มศูนย์กลางเครือข่ายศิษย์เก่าเพื่อขยายความสัมพันธ์และสร้างโอกาสทางวิชาชีพอย่างยั่งยืน
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-6">เกี่ยวกับเรา</h4>
              <ul className="space-y-3 text-sm text-sidebar-foreground/70">
                <li>
                  <a
                    href="#"
                    className="hover:text-sidebar-foreground transition-colors"
                  >
                    เกี่ยวกับ Sripatum Alumni{" "}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-sidebar-foreground transition-colors"
                  >
                    ทีมงาน
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-sidebar-foreground transition-colors"
                  >
                    ติดต่อเรา
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6">ฟีเจอร์</h4>
              <ul className="space-y-3 text-sm text-sidebar-foreground/70">
                <li>
                  <a
                    href="#"
                    className="hover:text-sidebar-foreground transition-colors"
                  >
                    ค้นหาศิษย์เก่า
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-sidebar-foreground transition-colors"
                  >
                    โอกาสงาน
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-sidebar-foreground transition-colors"
                  >
                    Career Insights
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6">ช่วยเหลือ</h4>
              <ul className="space-y-3 text-sm text-sidebar-foreground/70">
                <li>
                  <a
                    href="#"
                    className="hover:text-sidebar-foreground transition-colors"
                  >
                    คำถามที่พบบ่อย
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-sidebar-foreground transition-colors"
                  >
                    นโยบายความเป็นส่วนตัว
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-sidebar-foreground transition-colors"
                  >
                    เงื่อนไขการใช้งาน
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-sidebar-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-sidebar-foreground/50">
            <p>Copyright 2026 Sripatum Alumni. All rights reserved.</p>
            <div className="flex gap-6">
              <a
                href="#"
                className="hover:text-sidebar-foreground transition-colors"
              >
                Facebook
              </a>
              <a
                href="#"
                className="hover:text-sidebar-foreground transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="#"
                className="hover:text-sidebar-foreground transition-colors"
              >
                Twitter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
