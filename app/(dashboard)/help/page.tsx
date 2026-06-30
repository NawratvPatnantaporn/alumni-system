"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  Search,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  Users,
  Settings,
  Briefcase,
  GraduationCap,
  Send,
  ExternalLink,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Loading from "./loading"; // Import the loading component

const faqCategories = [
  {
    category: "บัญชีและการลงทะเบียน",
    icon: Users,
    questions: [
      {
        q: "ฉันจะลงทะเบียนเป็นศิษย์เก่าได้อย่างไร?",
        a: "คุณสามารถลงทะเบียนได้โดยคลิกที่ปุ่ม 'ลงทะเบียน' บนหน้าหลัก เลือกประเภท 'ศิษย์เก่า' และกรอกข้อมูลพร้อมแนบเอกสารยืนยันตัวตน เช่น Transcript หรือใบรับรองการสำเร็จการศึกษา",
      },
      {
        q: "ใช้เวลานานแค่ไหนในการยืนยันสถานะศิษย์เก่า?",
        a: "โดยปกติจะใช้เวลา 1-3 วันทำการในการตรวจสอบเอกสารและยืนยันสถานะ คุณจะได้รับอีเมลแจ้งเตือนเมื่อการยืนยันเสร็จสิ้น",
      },
      {
        q: "ฉันลืมรหัสผ่าน ต้องทำอย่างไร?",
        a: "คลิกที่ 'ลืมรหัสผ่าน' ในหน้า Login และกรอกอีเมลที่ใช้ลงทะเบียน ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณ",
      },
    ],
  },
  {
    category: "โปรไฟล์และความเป็นส่วนตัว",
    icon: Settings,
    questions: [
      {
        q: "ฉันจะแก้ไขข้อมูลโปรไฟล์ได้อย่างไร?",
        a: "ไปที่เมนู 'โปรไฟล์' และคลิก 'แก้ไขโปรไฟล์' คุณสามารถอัพเดทข้อมูลส่วนตัว ประวัติการศึกษา และประสบการณ์การทำงานได้",
      },
      {
        q: "ฉันจะตั้งค่าความเป็นส่วนตัวได้อย่างไร?",
        a: "ไปที่ 'ตั้งค่า' > 'ความเป็นส่วนตัว' คุณสามารถเลือกได้ว่าจะให้ใครเห็นข้อมูลใดบ้าง เช่น อีเมล เบอร์โทร หรือประวัติการทำงาน",
      },
    ],
  },
  {
    category: "โอกาสงานและการสมัคร",
    icon: Briefcase,
    questions: [
      {
        q: "ฉันจะโพสต์ตำแหน่งงานได้อย่างไร?",
        a: "เฉพาะศิษย์เก่าที่ได้รับการยืนยันเท่านั้นที่สามารถโพสต์งานได้ ไปที่ 'โอกาสงาน' > 'สร้างประกาศงาน' และกรอกรายละเอียดตำแหน่ง",
      },
      {
        q: "ฉันจะสมัครงานที่โพสต์ได้อย่างไร?",
        a: "คลิกที่ตำแหน่งงานที่สนใจ จากนั้นคลิก 'สมัครงาน' ระบบจะส่งข้อมูลโปรไฟล์ของคุณไปยังผู้ประกาศ",
      },
    ],
  },
  {
    category: "Mentor Program",
    icon: GraduationCap,
    questions: [
      {
        q: "ฉันจะสมัครเป็น Mentor ได้อย่างไร?",
        a: "ไปที่ 'โอกาสงาน' > 'Mentorship' > 'สมัครเป็น Mentor' กรอกข้อมูลความเชี่ยวชาญและเวลาที่สะดวก ทีมงานจะตรวจสอบและติดต่อกลับ",
      },
      {
        q: "ฉันเป็นนักศึกษา จะขอนัด Mentor ได้อย่างไร?",
        a: "ไปที่ 'โอกาสงาน' > 'Mentorship' เลือก Mentor ที่สนใจและคลิก 'นัดหมาย' เลือกวันเวลาที่สะดวกและรอการยืนยันจาก Mentor",
      },
    ],
  },
];

const contactMethods = [
  {
    icon: Mail,
    title: "อีเมล",
    value: "alumni@university.ac.th",
    description: "ตอบกลับภายใน 24 ชั่วโมง",
  },
  {
    icon: Phone,
    title: "โทรศัพท์",
    value: "02-XXX-XXXX",
    description: "จันทร์ - ศุกร์ 9:00 - 17:00",
  },
  {
    icon: MessageCircle,
    title: "Line Official",
    value: "@alumni-connect",
    description: "ตอบกลับรวดเร็ว",
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });

  const filteredFAQ = faqCategories
    .map((cat) => ({
      ...cat,
      questions: cat.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.questions.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<Loading />}> {/* Wrap the main content in a Suspense boundary */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              ศูนย์ช่วยเหลือ
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              ค้นหาคำตอบจากคำถามที่พบบ่อย หรือติดต่อทีมงานหากต้องการความช่วยเหลือเพิ่มเติม
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="ค้นหาคำถาม..."
                className="pl-12 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">
              คำถามที่พบบ่อย
            </h2>

            <div className="space-y-6">
              {(searchQuery ? filteredFAQ : faqCategories).map((category, catIndex) => {
                const Icon = category.icon;
                return (
                  <Card key={catIndex} className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className="w-5 h-5 text-primary" />
                        {category.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {category.questions.map((item, qIndex) => (
                          <AccordionItem key={qIndex} value={`item-${catIndex}-${qIndex}`}>
                            <AccordionTrigger className="text-left text-foreground hover:no-underline">
                              {item.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                              {item.a}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {searchQuery && filteredFAQ.length === 0 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">ไม่พบคำถามที่ตรงกัน</h3>
                  <p className="text-muted-foreground">
                    ลองค้นหาด้วยคำอื่น หรือติดต่อทีมงานด้านล่าง
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Contact Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">
              ช่องทางติดต่อ
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer"
                  >
                    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow h-full">
                      <CardContent className="p-5 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{method.title}</h3>
                        <p className="text-primary font-medium mb-1">{method.value}</p>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  ส่งข้อความถึงทีมงาน
                </CardTitle>
                <CardDescription>
                  หากไม่พบคำตอบที่ต้องการ สามารถส่งข้อความถึงเราได้ที่นี่
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">หัวข้อ</label>
                  <Input
                    placeholder="หัวข้อที่ต้องการสอบถาม..."
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">ข้อความ</label>
                  <Textarea
                    placeholder="รายละเอียด..."
                    className="min-h-[150px]"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  />
                </div>
                <Button className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  ส่งข้อความ
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-muted-foreground mb-3">ลิงก์ที่เกี่ยวข้อง</p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: "เงื่อนไขการใช้งาน", href: "#" },
                { label: "นโยบายความเป็นส่วนตัว", href: "#" },
                { label: "คู่มือการใช้งาน", href: "#" },
              ].map((link, index) => (
                <Button key={index} variant="ghost" size="sm" asChild>
                  <a href={link.href}>
                    {link.label}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      </Suspense>
    </div>
  );
}
