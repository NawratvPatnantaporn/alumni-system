"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  MoreHorizontal,
  UserCheck,
  UserX,
  Mail,
  Shield,
  GraduationCap,
  BookOpen,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { redirect } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const mockUsers = [
  {
    id: 1,
    name: "สมชาย ใจดี",
    email: "somchai@example.com",
    role: "alumni",
    status: "active",
    faculty: "วิศวกรรมศาสตร์",
    graduationYear: 2018,
    avatar: "",
    joinedAt: "2024-01-15",
    lastActive: "2024-12-20",
  },
  {
    id: 2,
    name: "สมหญิง รักเรียน",
    email: "somying@example.com",
    role: "student",
    status: "active",
    faculty: "บริหารธุรกิจ",
    graduationYear: 2026,
    avatar: "",
    joinedAt: "2024-03-10",
    lastActive: "2024-12-19",
  },
  {
    id: 3,
    name: "วิชัย สำเร็จ",
    email: "wichai@example.com",
    role: "alumni",
    status: "pending",
    faculty: "วิทยาศาสตร์",
    graduationYear: 2015,
    avatar: "",
    joinedAt: "2024-12-18",
    lastActive: "2024-12-18",
  },
  {
    id: 4,
    name: "มานี มีสุข",
    email: "manee@example.com",
    role: "student",
    status: "active",
    faculty: "ศิลปศาสตร์",
    graduationYear: 2025,
    avatar: "",
    joinedAt: "2024-02-20",
    lastActive: "2024-12-17",
  },
  {
    id: 5,
    name: "ประสิทธิ์ เก่งกาจ",
    email: "prasit@example.com",
    role: "alumni",
    status: "suspended",
    faculty: "นิติศาสตร์",
    graduationYear: 2010,
    avatar: "",
    joinedAt: "2023-08-05",
    lastActive: "2024-10-01",
  },
  {
    id: 6,
    name: "สุดา ขยันเรียน",
    email: "suda@example.com",
    role: "student",
    status: "active",
    faculty: "แพทยศาสตร์",
    graduationYear: 2027,
    avatar: "",
    joinedAt: "2024-06-01",
    lastActive: "2024-12-20",
  },
];

const Loading = () => null;

export default function AdminUsersPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  const filteredUsers = mockUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-admin text-admin-foreground"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case "alumni":
        return <Badge className="bg-alumni text-alumni-foreground"><GraduationCap className="w-3 h-3 mr-1" />ศิษย์เก่า</Badge>;
      case "student":
        return <Badge className="bg-student text-student-foreground"><BookOpen className="w-3 h-3 mr-1" />นักศึกษา</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">ใช้งาน</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50">รอยืนยัน</Badge>;
      case "suspended":
        return <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50">ระงับ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    total: mockUsers.length,
    alumni: mockUsers.filter((u) => u.role === "alumni").length,
    students: mockUsers.filter((u) => u.role === "student").length,
    pending: mockUsers.filter((u) => u.status === "pending").length,
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-admin/10">
                    <Users className="w-6 h-6 text-admin" />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground">จัดการผู้ใช้</h1>
                </div>
                <p className="text-muted-foreground">
                  จัดการบัญชีผู้ใช้งานทั้งหมดในระบบ
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  ส่งออก
                </Button>
                <Button size="sm" className="bg-admin hover:bg-admin/90">
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มผู้ใช้
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            {[
              { label: "ผู้ใช้ทั้งหมด", value: stats.total, icon: Users, color: "text-primary" },
              { label: "ศิษย์เก่า", value: stats.alumni, icon: GraduationCap, color: "text-alumni" },
              { label: "นักศึกษา", value: stats.students, icon: BookOpen, color: "text-student" },
              { label: "รอยืนยัน", value: stats.pending, icon: RefreshCw, color: "text-yellow-500" },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="ค้นหาชื่อหรืออีเมล..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="บทบาท" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกบทบาท</SelectItem>
                      <SelectItem value="alumni">ศิษย์เก่า</SelectItem>
                      <SelectItem value="student">นักศึกษา</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="สถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกสถานะ</SelectItem>
                      <SelectItem value="active">ใช้งาน</SelectItem>
                      <SelectItem value="pending">รอยืนยัน</SelectItem>
                      <SelectItem value="suspended">ระงับ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>รายชื่อผู้ใช้ ({filteredUsers.length})</CardTitle>
                <CardDescription>
                  จัดการข้อมูลและสิทธิ์การเข้าถึงของผู้ใช้แต่ละคน
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ผู้ใช้</TableHead>
                        <TableHead>บทบาท</TableHead>
                        <TableHead>คณะ</TableHead>
                        <TableHead>สถานะ</TableHead>
                        <TableHead>เข้าร่วม</TableHead>
                        <TableHead>ใช้งานล่าสุด</TableHead>
                        <TableHead className="text-right">จัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u, index) => (
                        <motion.tr
                          key={u.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-9 h-9">
                                <AvatarImage src={u.avatar || "/placeholder.svg"} alt={u.name} />
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                  {u.name.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground">{u.name}</p>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(u.role)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{u.faculty}</TableCell>
                          <TableCell>{getStatusBadge(u.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{u.joinedAt}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{u.lastActive}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>จัดการ</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  ดูโปรไฟล์
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedUser(u);
                                  setIsEditDialogOpen(true);
                                }}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  แก้ไข
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="w-4 h-4 mr-2" />
                                  ส่งอีเมล
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {u.status === "active" ? (
                                  <DropdownMenuItem className="text-yellow-600">
                                    <UserX className="w-4 h-4 mr-2" />
                                    ระงับบัญชี
                                  </DropdownMenuItem>
                                ) : u.status === "suspended" ? (
                                  <DropdownMenuItem className="text-green-600">
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    เปิดใช้งาน
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem className="text-green-600">
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    อนุมัติ
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  ลบบัญชี
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Delete Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ยืนยันการลบบัญชี</DialogTitle>
                <DialogDescription>
                  คุณต้องการลบบัญชีของ {selectedUser?.name} หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(false)}>
                  ลบบัญชี
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>แก้ไขข้อมูลผู้ใช้</DialogTitle>
                <DialogDescription>
                  แก้ไขข้อมูลและสิทธิ์การเข้าถึงของ {selectedUser?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">ชื่อ</label>
                  <Input defaultValue={selectedUser?.name} />
                </div>
                <div>
                  <label className="text-sm font-medium">อีเมล</label>
                  <Input defaultValue={selectedUser?.email} />
                </div>
                <div>
                  <label className="text-sm font-medium">บทบาท</label>
                  <Select defaultValue={selectedUser?.role}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alumni">ศิษย์เก่า</SelectItem>
                      <SelectItem value="student">นักศึกษา</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">สถานะ</label>
                  <Select defaultValue={selectedUser?.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">ใช้งาน</SelectItem>
                      <SelectItem value="pending">รอยืนยัน</SelectItem>
                      <SelectItem value="suspended">ระงับ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={() => setIsEditDialogOpen(false)}>
                  บันทึก
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Suspense>
  );
}
