"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Newspaper,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Send,
  Archive,
  Calendar,
  Clock,
} from "lucide-react";
import { redirect } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Loading from "./loading";

const mockNews = [
  {
    id: 1,
    title: "งานคืนสู่เหย้าประจำปี 2567",
    excerpt: "ขอเชิญศิษย์เก่าทุกท่านร่วมงานคืนสู่เหย้าประจำปี...",
    status: "published",
    category: "กิจกรรม",
    author: "Admin",
    publishedAt: "2024-12-15",
    views: 1250,
  },
  {
    id: 2,
    title: "ทุนการศึกษาสำหรับศิษย์เก่าที่ต้องการศึกษาต่อ",
    excerpt: "มหาวิทยาลัยเปิดรับสมัครทุนการศึกษาต่อระดับปริญญาโท...",
    status: "published",
    category: "ทุนการศึกษา",
    author: "Admin",
    publishedAt: "2024-12-10",
    views: 890,
  },
  {
    id: 3,
    title: "เปิดรับสมัคร Mentor Program รุ่นที่ 5",
    excerpt: "โครงการ Mentor Program เปิดรับสมัครศิษย์เก่าที่ต้องการ...",
    status: "draft",
    category: "โครงการ",
    author: "Admin",
    publishedAt: null,
    views: 0,
  },
  {
    id: 4,
    title: "ศิษย์เก่าดีเด่นประจำปี 2567",
    excerpt: "ขอแสดงความยินดีกับศิษย์เก่าที่ได้รับรางวัลศิษย์เก่าดีเด่น...",
    status: "scheduled",
    category: "รางวัล",
    author: "Admin",
    publishedAt: "2024-12-25",
    views: 0,
  },
];

export default function AdminNewsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<typeof mockNews[0] | null>(null);

  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  const filteredNews = mockNews.filter((news) => {
    const matchesSearch = news.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || news.status === statusFilter;
    return matchesSearch && matchesStatus;
  });


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-700">เผยแพร่แล้ว</Badge>;
      case "draft":
        return <Badge variant="secondary">แบบร่าง</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-700">กำหนดเวลา</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const stats = {
    total: mockNews.length,
    published: mockNews.filter((n) => n.status === "published").length,
    draft: mockNews.filter((n) => n.status === "draft").length,
    scheduled: mockNews.filter((n) => n.status === "scheduled").length,
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
                    <Newspaper className="w-6 h-6 text-admin" />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground">จัดการข่าวสาร</h1>
                </div>
                <p className="text-muted-foreground">
                  สร้างและจัดการข่าวสารประชาสัมพันธ์
                </p>
              </div>
              <Button 
                className="bg-admin hover:bg-admin/90"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                สร้างข่าวใหม่
              </Button>
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
              { label: "ข่าวทั้งหมด", value: stats.total, color: "text-primary" },
              { label: "เผยแพร่แล้ว", value: stats.published, color: "text-green-600" },
              { label: "แบบร่าง", value: stats.draft, color: "text-muted-foreground" },
              { label: "กำหนดเวลา", value: stats.scheduled, color: "text-blue-600" },
            ].map((stat, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
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
                      placeholder="ค้นหาข่าว..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="สถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกสถานะ</SelectItem>
                      <SelectItem value="published">เผยแพร่แล้ว</SelectItem>
                      <SelectItem value="draft">แบบร่าง</SelectItem>
                      <SelectItem value="scheduled">กำหนดเวลา</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* News Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>รายการข่าว ({filteredNews.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>หัวข้อ</TableHead>
                        <TableHead>หมวดหมู่</TableHead>
                        <TableHead>สถานะ</TableHead>
                        <TableHead>วันที่เผยแพร่</TableHead>
                        <TableHead>ยอดเข้าชม</TableHead>
                        <TableHead className="text-right">จัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNews.map((news, index) => (
                        <motion.tr
                          key={news.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground line-clamp-1">{news.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{news.excerpt}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{news.category}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(news.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {news.publishedAt || "-"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {news.views.toLocaleString()}
                          </TableCell>
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
                                  ดูตัวอย่าง
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  แก้ไข
                                </DropdownMenuItem>
                                {news.status === "draft" && (
                                  <DropdownMenuItem>
                                    <Send className="w-4 h-4 mr-2" />
                                    เผยแพร่
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <Archive className="w-4 h-4 mr-2" />
                                  เก็บถาวร
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedNews(news);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  ลบ
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

          {/* Create Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>สร้างข่าวใหม่</DialogTitle>
                <DialogDescription>
                  กรอกข้อมูลเพื่อสร้างข่าวสารใหม่
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">หัวข้อ</label>
                  <Input placeholder="หัวข้อข่าว..." />
                </div>
                <div>
                  <label className="text-sm font-medium">หมวดหมู่</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกหมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activity">กิจกรรม</SelectItem>
                      <SelectItem value="scholarship">ทุนการศึกษา</SelectItem>
                      <SelectItem value="program">โครงการ</SelectItem>
                      <SelectItem value="award">รางวัล</SelectItem>
                      <SelectItem value="announcement">ประกาศ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">เนื้อหา</label>
                  <Textarea 
                    placeholder="เนื้อหาข่าว..." 
                    className="min-h-[200px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      กำหนดวันเผยแพร่
                    </label>
                    <Input type="date" />
                  </div>
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      เวลา
                    </label>
                    <Input type="time" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button variant="secondary">
                  บันทึกร่าง
                </Button>
                <Button className="bg-admin hover:bg-admin/90">
                  เผยแพร่
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ยืนยันการลบ</DialogTitle>
                <DialogDescription>
                  คุณต้องการลบข่าว &quot;{selectedNews?.title}&quot; หรือไม่?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(false)}>
                  ลบ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Suspense>
  );
}
