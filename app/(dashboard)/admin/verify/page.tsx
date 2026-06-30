"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  GraduationCap,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Calendar,
  Building2,
  Eye,
  Download,
} from "lucide-react";
import { redirect } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const pendingVerifications = [
  {
    id: 1,
    name: "วิชัย สำเร็จ",
    email: "wichai@example.com",
    faculty: "วิทยาศาสตร์",
    major: "วิทยาการคอมพิวเตอร์",
    graduationYear: 2015,
    studentId: "55012345",
    submittedAt: "2024-12-18",
    documents: ["transcript.pdf", "id_card.jpg"],
    avatar: "",
  },
  {
    id: 2,
    name: "พิมพ์ใจ สุขสันต์",
    email: "pimjai@example.com",
    faculty: "บริหารธุรกิจ",
    major: "การจัดการ",
    graduationYear: 2020,
    studentId: "60034567",
    submittedAt: "2024-12-17",
    documents: ["transcript.pdf", "diploma.jpg"],
    avatar: "",
  },
  {
    id: 3,
    name: "สุรชัย มั่นคง",
    email: "surachai@example.com",
    faculty: "วิศวกรรมศาสตร์",
    major: "วิศวกรรมไฟฟ้า",
    graduationYear: 2012,
    studentId: "52056789",
    submittedAt: "2024-12-16",
    documents: ["transcript.pdf"],
    avatar: "",
  },
];

const Loading = () => null;

export default function AdminVerifyPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("query") || "");
  const [selectedRequest, setSelectedRequest] = useState<typeof pendingVerifications[0] | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  const filteredRequests = pendingVerifications.filter((req) =>
    req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.studentId.includes(searchQuery)
  );

  const handleApprove = (id: number) => {
    // Mock approval
    alert(`อนุมัติคำขอ ID: ${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-admin/10">
              <GraduationCap className="w-6 h-6 text-admin" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">ยืนยันศิษย์เก่า</h1>
          </div>
          <p className="text-muted-foreground">
            ตรวจสอบและยืนยันสถานะศิษย์เก่าสำหรับผู้ใช้ที่ลงทะเบียน
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          {[
            { label: "รอการยืนยัน", value: pendingVerifications.length, icon: Clock, color: "text-yellow-500" },
            { label: "อนุมัติแล้ววันนี้", value: 5, icon: CheckCircle, color: "text-green-500" },
            { label: "ปฏิเสธวันนี้", value: 1, icon: XCircle, color: "text-red-500" },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อ, อีเมล, หรือรหัสนักศึกษา..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Pending Verifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-foreground">
            คำขอรอการยืนยัน ({filteredRequests.length})
          </h2>
          
          {filteredRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={request.avatar || "/placeholder.svg"} alt={request.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {request.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{request.name}</h3>
                        <p className="text-sm text-muted-foreground">{request.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            <Building2 className="w-3 h-3 mr-1" />
                            {request.faculty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <GraduationCap className="w-3 h-3 mr-1" />
                            รุ่น {request.graduationYear}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <User className="w-3 h-3 mr-1" />
                            {request.studentId}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:items-end gap-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>ส่งเมื่อ {request.submittedAt}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span>{request.documents.length} เอกสาร</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          ดูรายละเอียด
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsRejectDialogOpen(true);
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          ปฏิเสธ
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(request.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          อนุมัติ
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {filteredRequests.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  ไม่มีคำขอรอการยืนยัน
                </h3>
                <p className="text-muted-foreground">
                  คำขอทั้งหมดได้รับการตรวจสอบแล้ว
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>รายละเอียดคำขอยืนยัน</DialogTitle>
              <DialogDescription>
                ตรวจสอบข้อมูลและเอกสารก่อนอนุมัติ
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedRequest.avatar || "/placeholder.svg"} alt={selectedRequest.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {selectedRequest.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedRequest.name}</h3>
                    <p className="text-muted-foreground">{selectedRequest.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">คณะ</p>
                    <p className="font-medium">{selectedRequest.faculty}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">สาขา</p>
                    <p className="font-medium">{selectedRequest.major}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">ปีที่จบ</p>
                    <p className="font-medium">{selectedRequest.graduationYear}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">รหัสนักศึกษา</p>
                    <p className="font-medium">{selectedRequest.studentId}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">เอกสารแนบ</h4>
                  <div className="space-y-2">
                    {selectedRequest.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="text-sm">{doc}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          ดาวน์โหลด
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                ปิด
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                onClick={() => {
                  setIsDetailDialogOpen(false);
                  setIsRejectDialogOpen(true);
                }}
              >
                <XCircle className="w-4 h-4 mr-1" />
                ปฏิเสธ
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  handleApprove(selectedRequest!.id);
                  setIsDetailDialogOpen(false);
                }}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                อนุมัติ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ปฏิเสธคำขอ</DialogTitle>
              <DialogDescription>
                กรุณาระบุเหตุผลในการปฏิเสธคำขอของ {selectedRequest?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="เหตุผลในการปฏิเสธ..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  alert(`ปฏิเสธคำขอ: ${rejectReason}`);
                  setIsRejectDialogOpen(false);
                  setRejectReason("");
                }}
              >
                ยืนยันการปฏิเสธ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export const unstable_settings = {
  // Ensure the component is wrapped in a Suspense boundary
  suspense: true,
};

export { Loading };
