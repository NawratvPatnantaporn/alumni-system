"use client";

import { useState, useEffect } from "react";
import { Bell, CalendarDays, Eye, Loader2, Newspaper, Plus, Star, Upload, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { createEvent, createNewsPost, type TargetAudience } from "@/app/features/admin/services/adminContent.service";

import { updateNewsPost, updateEvent } from "@/app/features/admin/services/adminContentManage.service";
import { uploadAdminContentImage } from "@/app/features/admin/services/adminUpload.service";
import { createAdminUser } from "@/app/features/admin/services/adminUser.service";

import Swal from "sweetalert2";

type UserRole = "student" | "alumni" | "admin" | "super_admin";

type AdminContentDialogsProps = {
  currentUserId: string;
  currentUserRole: UserRole;
  openType: "news" | "event" | "user" | null;
  onOpenChange: (value: "news" | "event" | "user" | null) => void;
  onSuccess: () => Promise<void> | void;
  editItem?: any;
};

export function AdminContentDialogs({
  currentUserId,
  currentUserRole,
  openType,
  onOpenChange,
  onSuccess,
  editItem,
}: AdminContentDialogsProps) {
  const [newsSaving, setNewsSaving] = useState(false);
  const [eventSaving, setEventSaving] = useState(false);
  const [userSaving, setUserSaving] = useState(false);

  const [newsImageFile, setNewsImageFile] = useState<File | null>(null);
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);

  const [newsForm, setNewsForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "ประกาศ",
    isPublished: true,
    isFeatured: false,
    sendNotification: true,
    targetAudience: "all" as TargetAudience,
  });

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    category: "Networking",
    eventDate: "",
    startTime: "",
    endTime: "",
    location: "",
    eventMode: "on-site" as "on-site" | "online" | "hybrid",
    capacity: "",
    isPublished: true,
    isFeatured: false,
    sendNotification: true,
    targetAudience: "all" as TargetAudience,
  });

  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student" as UserRole,
  });

  const resetNews = () => {
    setNewsForm({
      title: "",
      excerpt: "",
      content: "",
      category: "ประกาศ",
      isPublished: true,
      isFeatured: false,
      sendNotification: true,
      targetAudience: "all",
    });
    setNewsImageFile(null);
  };

  const resetEvent = () => {
    setEventForm({
      title: "",
      description: "",
      category: "Networking",
      eventDate: "",
      startTime: "",
      endTime: "",
      location: "",
      eventMode: "on-site",
      capacity: "",
      isPublished: true,
      isFeatured: false,
      sendNotification: true,
      targetAudience: "all",
    });
    setEventImageFile(null);
  };

  const resetUser = () => {
    setUserForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
    });
  };

  useEffect(() => {
    if (!editItem) return;

    if (openType === "news") {
      setNewsForm({
        title: editItem.title || "",
        excerpt: editItem.excerpt || "",
        content: editItem.content || "",
        category: editItem.category || "ประกาศ",
        isPublished: editItem.is_published ?? true,
        isFeatured: editItem.is_featured ?? false,
        sendNotification: false,
        targetAudience: editItem.target_audience || "all",
      });

      setNewsImageFile(null);
    }

    if (openType === "event") {
      setEventForm({
        title: editItem.title || "",
        description: editItem.description || "",
        category: editItem.category || "Networking",
        eventDate: editItem.event_date || "",
        startTime: editItem.start_time || "",
        endTime: editItem.end_time || "",
        location: editItem.location || "",
        eventMode: editItem.event_mode || "on-site",
        capacity: editItem.capacity ? String(editItem.capacity) : "",
        isPublished: editItem.is_published ?? true,
        isFeatured: editItem.is_featured ?? false,
        sendNotification: false,
        targetAudience: editItem.target_audience || "all",
      });

      setEventImageFile(null);
    }
  }, [editItem, openType]);

  const closeActiveElement = () => {
    if (typeof document === "undefined") return;

    const active = document.activeElement as HTMLElement | null;

    if (active && typeof active.blur === "function") {
      active.blur();
    }
  };

  const showSuccess = (title: string) => {
    closeActiveElement();

    Swal.fire({
      icon: "success",
      title,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      target: document.body,
      didOpen: () => closeActiveElement(),
    });
  };

  const showError = (title: string, text?: string) => {
    closeActiveElement();

    Swal.fire({
      icon: "error",
      title,
      text,
      target: document.body,
      confirmButtonText: "ตกลง",
      didOpen: () => closeActiveElement(),
    });
  };

  const showWarning = (title: string) => {
    closeActiveElement();

    Swal.fire({
      icon: "warning",
      title,
      target: document.body,
      confirmButtonText: "ตกลง",
      didOpen: () => closeActiveElement(),
    });
  };

  const handleCreateNews = async () => {
    if (!newsForm.title.trim()) {
      showWarning("กรุณากรอกหัวข้อข่าวสาร");
      return;
    }

    setNewsSaving(true);

    try {
      let coverImageUrl = editItem?.cover_image_url || "";

      if (newsImageFile) {
        coverImageUrl = await uploadAdminContentImage(newsImageFile, "news");
      }

      if (editItem && openType === "news") {
        await updateNewsPost(editItem.id, {
          title: newsForm.title.trim(),
          excerpt: newsForm.excerpt.trim(),
          content: newsForm.content.trim(),
          category: newsForm.category,
          coverImageUrl,
          isPublished: newsForm.isPublished,
          isFeatured: newsForm.isFeatured,
          targetAudience: newsForm.targetAudience,
        });

        showSuccess("แก้ไขข่าวสารสำเร็จ");
      } else {
        await createNewsPost({
          authorId: currentUserId,
          title: newsForm.title.trim(),
          excerpt: newsForm.excerpt.trim(),
          content: newsForm.content.trim(),
          category: newsForm.category,
          coverImageUrl,
          isPublished: newsForm.isPublished,
          isFeatured: newsForm.isFeatured,
          sendNotification: newsForm.sendNotification,
          targetAudience: newsForm.targetAudience,
        });

        showSuccess("สร้างข่าวสารสำเร็จ");
      }

      resetNews();
      onOpenChange(null);

      Promise.resolve(onSuccess()).catch((error) => {
        console.error("REFRESH ADMIN DATA AFTER NEWS ERROR:", error);
      });
    } catch (error) {
      console.error("SAVE NEWS HANDLE ERROR:", error);
      showError(
        editItem ? "แก้ไขข่าวสารไม่สำเร็จ" : "สร้างข่าวสารไม่สำเร็จ",
        "ดู error ใน console",
      );
    } finally {
      setNewsSaving(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventForm.title.trim()) {
      showWarning("กรุณากรอกชื่อกิจกรรม");
      return;
    }

    if (!eventForm.eventDate) {
      showWarning("กรุณาเลือกวันที่จัดกิจกรรม");
      return;
    }

    setEventSaving(true);

    try {
      let coverImageUrl = editItem?.cover_image_url || "";

      if (eventImageFile) {
        coverImageUrl = await uploadAdminContentImage(eventImageFile, "events");
      }

      if (editItem && openType === "event") {
        await updateEvent(editItem.id, {
          title: eventForm.title.trim(),
          description: eventForm.description.trim(),
          category: eventForm.category,
          coverImageUrl,
          eventDate: eventForm.eventDate,
          startTime: eventForm.startTime,
          endTime: eventForm.endTime,
          location: eventForm.location.trim(),
          eventMode: eventForm.eventMode,
          capacity: eventForm.capacity ? Number(eventForm.capacity) : null,
          isPublished: eventForm.isPublished,
          isFeatured: eventForm.isFeatured,
          targetAudience: eventForm.targetAudience,
        });

        showSuccess("แก้ไขกิจกรรมสำเร็จ");
      } else {
        await createEvent({
          authorId: currentUserId,
          title: eventForm.title.trim(),
          description: eventForm.description.trim(),
          category: eventForm.category,
          coverImageUrl,
          eventDate: eventForm.eventDate,
          startTime: eventForm.startTime,
          endTime: eventForm.endTime,
          location: eventForm.location.trim(),
          eventMode: eventForm.eventMode,
          capacity: eventForm.capacity ? Number(eventForm.capacity) : null,
          isPublished: eventForm.isPublished,
          isFeatured: eventForm.isFeatured,
          sendNotification: eventForm.sendNotification,
          targetAudience: eventForm.targetAudience,
        });

        showSuccess("สร้างกิจกรรมสำเร็จ");
      }

      resetEvent();
      onOpenChange(null);

      Promise.resolve(onSuccess()).catch((error) => {
        console.error("REFRESH ADMIN DATA AFTER EVENT ERROR:", error);
      });
    } catch (error) {
      console.error("SAVE EVENT HANDLE ERROR:", error);
      showError(editItem ? "แก้ไขกิจกรรมไม่สำเร็จ" : "สร้างกิจกรรมไม่สำเร็จ");
    } finally {
      setEventSaving(false);
    }
  };

  const handleCreateUser = async () => {
    if (!userForm.email.trim()) {
      showWarning("กรุณากรอกอีเมล");
      return;
    }

    if (!userForm.password.trim()) {
      showWarning("กรุณากรอกรหัสผ่าน");
      return;
    }

    if (userForm.password.length < 6) {
      showWarning("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (userForm.password !== userForm.confirmPassword) {
      showWarning("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    if (
      currentUserRole !== "super_admin" &&
      ["admin", "super_admin"].includes(userForm.role)
    ) {
      showWarning("เฉพาะ Super Admin เท่านั้นที่สร้าง Admin หรือ Super Admin ได้");
      return;
    }

    try {
      setUserSaving(true);

      await createAdminUser({
        createdBy: currentUserId,
        currentUserRole,
        firstName: userForm.firstName.trim(),
        lastName: userForm.lastName.trim(),
        email: userForm.email.trim(),
        password: userForm.password,
        role: userForm.role,
      });

      resetUser();
      onOpenChange(null);

      Promise.resolve(onSuccess()).catch((error) => {
        console.error("REFRESH ADMIN DATA AFTER CREATE USER ERROR:", error);
      });

      showSuccess("สร้างผู้ใช้สำเร็จ");
    } catch (error) {
      console.error("CREATE ADMIN USER HANDLE ERROR:", error);
      showError(
        "สร้างผู้ใช้ไม่สำเร็จ",
        error instanceof Error ? error.message : "ดู error ใน console",
      );
    } finally {
      setUserSaving(false);
    }
  };

  return (
    <>
      <Dialog
        open={openType === "news"}
        onOpenChange={(open) => onOpenChange(open ? "news" : null)}
      >
        <DialogContent className="w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Newspaper className="w-5 h-5" />
              {editItem && openType === "news"
                ? "แก้ไขข่าวสาร"
                : "สร้างข่าวสารใหม่"}
            </DialogTitle>
            <DialogDescription>
              ข่าวสารจะแสดงในหน้าข่าวสาร และส่งแจ้งเตือนได้ตามกลุ่มเป้าหมาย
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <ImagePicker
              file={newsImageFile}
              onChange={setNewsImageFile}
              label="รูปภาพข่าวสาร"
            />

            <div className="grid lg:grid-cols-2 gap-5">
              <div className="space-y-2 md:col-span-2">
                <Label>หัวข้อข่าวสาร</Label>
                <Input
                  value={newsForm.title}
                  onChange={(e) =>
                    setNewsForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="เช่น ประกาศรายชื่อศิษย์เก่าดีเด่นประจำปี"
                />
              </div>

              <div className="space-y-2">
                <Label>หมวดหมู่</Label>
                <select
                  value={newsForm.category}
                  onChange={(e) =>
                    setNewsForm((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="ประกาศ">ประกาศ</option>
                  <option value="กิจกรรม">กิจกรรม</option>
                  <option value="ทุนการศึกษา">ทุนการศึกษา</option>
                  <option value="Workshop">Workshop</option>
                  <option value="รายงาน">รายงาน</option>
                </select>
              </div>

              <AudienceSelect
                value={newsForm.targetAudience}
                onChange={(value) =>
                  setNewsForm((prev) => ({ ...prev, targetAudience: value }))
                }
              />

              <div className="space-y-2 md:col-span-2">
                <Label>คำโปรย</Label>
                <Textarea
                  value={newsForm.excerpt}
                  onChange={(e) =>
                    setNewsForm((prev) => ({
                      ...prev,
                      excerpt: e.target.value,
                    }))
                  }
                  placeholder="สรุปสั้น ๆ สำหรับแสดงบนการ์ดข่าวสาร"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>เนื้อหาข่าวสาร</Label>
                <Textarea
                  value={newsForm.content}
                  onChange={(e) =>
                    setNewsForm((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  className="min-h-40"
                  placeholder="รายละเอียดข่าวสารทั้งหมด"
                />
              </div>
            </div>

            <ContentOptions
              isPublished={newsForm.isPublished}
              isFeatured={newsForm.isFeatured}
              sendNotification={newsForm.sendNotification}
              onPublishedChange={(value) =>
                setNewsForm((prev) => ({ ...prev, isPublished: value }))
              }
              onFeaturedChange={(value) =>
                setNewsForm((prev) => ({ ...prev, isFeatured: value }))
              }
              onNotificationChange={(value) =>
                setNewsForm((prev) => ({ ...prev, sendNotification: value }))
              }
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(null)}
              disabled={newsSaving}
            >
              ยกเลิก
            </Button>
            <Button onClick={handleCreateNews} disabled={newsSaving}>
              {newsSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังสร้างข่าว...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {editItem && openType === "news"
                    ? "บันทึกการแก้ไข"
                    : "สร้างข่าวสาร"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openType === "event"}
        onOpenChange={(open) => onOpenChange(open ? "event" : null)}
      >
        <DialogContent className="w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              {editItem && openType === "event"
                ? "แก้ไขกิจกรรม"
                : "สร้างกิจกรรมใหม่"}
            </DialogTitle>
            <DialogDescription>
              กิจกรรมจะแสดงในหน้ากิจกรรม และส่งแจ้งเตือนได้ตามกลุ่มเป้าหมาย
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <ImagePicker
              file={eventImageFile}
              onChange={setEventImageFile}
              label="รูปภาพกิจกรรม"
            />

            <div className="grid lg:grid-cols-2 gap-5">
              <div className="space-y-2 md:col-span-2">
                <Label>ชื่อกิจกรรม</Label>
                <Input
                  value={eventForm.title}
                  onChange={(e) =>
                    setEventForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="เช่น Alumni Networking Night"
                />
              </div>

              <div className="space-y-2">
                <Label>หมวดหมู่</Label>
                <select
                  value={eventForm.category}
                  onChange={(e) =>
                    setEventForm((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="Networking">Networking</option>
                  <option value="Workshop">Workshop</option>
                  <option value="สัมมนา">สัมมนา</option>
                  <option value="Homecoming">Homecoming</option>
                  <option value="Startup">Startup</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>รูปแบบกิจกรรม</Label>
                <select
                  value={eventForm.eventMode}
                  onChange={(e) =>
                    setEventForm((prev) => ({
                      ...prev,
                      eventMode: e.target.value as
                        | "on-site"
                        | "online"
                        | "hybrid",
                    }))
                  }
                  className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="on-site">On-site</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>วันที่จัดกิจกรรม</Label>
                <Input
                  type="date"
                  value={eventForm.eventDate}
                  onChange={(e) =>
                    setEventForm((prev) => ({
                      ...prev,
                      eventDate: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>เวลาเริ่ม</Label>
                  <Input
                    type="time"
                    value={eventForm.startTime}
                    onChange={(e) =>
                      setEventForm((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>เวลาสิ้นสุด</Label>
                  <Input
                    type="time"
                    value={eventForm.endTime}
                    onChange={(e) =>
                      setEventForm((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>สถานที่</Label>
                <Input
                  value={eventForm.location}
                  onChange={(e) =>
                    setEventForm((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="เช่น มหาวิทยาลัย / Online via Zoom"
                />
              </div>

              <div className="space-y-2">
                <Label>จำนวนรับสมัคร</Label>
                <Input
                  type="number"
                  value={eventForm.capacity}
                  onChange={(e) =>
                    setEventForm((prev) => ({
                      ...prev,
                      capacity: e.target.value,
                    }))
                  }
                  placeholder="เช่น 200"
                />
              </div>

              <AudienceSelect
                value={eventForm.targetAudience}
                onChange={(value) =>
                  setEventForm((prev) => ({ ...prev, targetAudience: value }))
                }
              />

              <div className="space-y-2 md:col-span-2">
                <Label>รายละเอียดกิจกรรม</Label>
                <Textarea
                  value={eventForm.description}
                  onChange={(e) =>
                    setEventForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="min-h-40"
                  placeholder="รายละเอียดกิจกรรมทั้งหมด"
                />
              </div>
            </div>

            <ContentOptions
              isPublished={eventForm.isPublished}
              isFeatured={eventForm.isFeatured}
              sendNotification={eventForm.sendNotification}
              onPublishedChange={(value) =>
                setEventForm((prev) => ({ ...prev, isPublished: value }))
              }
              onFeaturedChange={(value) =>
                setEventForm((prev) => ({ ...prev, isFeatured: value }))
              }
              onNotificationChange={(value) =>
                setEventForm((prev) => ({ ...prev, sendNotification: value }))
              }
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(null)}
              disabled={eventSaving}
            >
              ยกเลิก
            </Button>
            <Button onClick={handleCreateEvent} disabled={eventSaving}>
              {eventSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังสร้างกิจกรรม...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {editItem && openType === "event"
                    ? "บันทึกการแก้ไข"
                    : "สร้างกิจกรรม"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openType === "user"}
        onOpenChange={(open) => onOpenChange(open ? "user" : null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              สร้างผู้ใช้ใหม่
            </DialogTitle>
            <DialogDescription>
              กรอกข้อมูลเริ่มต้น ที่เหลือให้ผู้ใช้ไปอัปเดตโปรไฟล์เองภายหลัง
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ชื่อ</Label>
              <Input
                value={userForm.firstName}
                onChange={(e) =>
                  setUserForm((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>นามสกุล</Label>
              <Input
                value={userForm.lastName}
                onChange={(e) =>
                  setUserForm((prev) => ({ ...prev, lastName: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>อีเมล</Label>
              <Input
                type="email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="user@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label>รหัสผ่าน</Label>
              <Input
                type="password"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="อย่างน้อย 6 ตัวอักษร"
              />
            </div>

            <div className="space-y-2">
              <Label>ยืนยันรหัสผ่าน</Label>
              <Input
                type="password"
                value={userForm.confirmPassword}
                onChange={(e) =>
                  setUserForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="กรอกรหัสผ่านอีกครั้ง"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Role</Label>
              <select
                value={userForm.role}
                onChange={(e) =>
                  setUserForm((prev) => ({
                    ...prev,
                    role: e.target.value as UserRole,
                  }))
                }
                className="w-full h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="student">นักศึกษา</option>
                <option value="alumni">ศิษย์เก่า</option>
                {currentUserRole === "super_admin" && (
                  <>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(null)}
              disabled={userSaving}
            >
              ยกเลิก
            </Button>
            <Button onClick={handleCreateUser} disabled={userSaving}>
              {userSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังสร้างผู้ใช้...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  สร้างผู้ใช้
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AudienceSelect({
  value,
  onChange,
}: {
  value: TargetAudience;
  onChange: (value: TargetAudience) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>กลุ่มเป้าหมาย</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TargetAudience)}
        className="w-full h-10 rounded-md border bg-background px-3 text-sm"
      >
        <option value="all">ทุกคน</option>
        <option value="alumni">ศิษย์เก่า</option>
        <option value="student">นักศึกษา</option>
      </select>
    </div>
  );
}

function ImagePicker({
  file,
  onChange,
  label,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  label: string;
}) {
  const previewUrl = file ? URL.createObjectURL(file) : "";

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <div className="rounded-2xl border border-dashed overflow-hidden">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="preview"
              className="w-full h-64 object-cover"
            />

            <div className="absolute top-3 right-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onChange(null)}
              >
                ลบรูป
              </Button>
            </div>
          </div>
        ) : (
          <label className="h-48 flex flex-col items-center justify-center gap-3 cursor-pointer bg-muted/20 hover:bg-muted/40 transition">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">อัปโหลดรูปภาพ</p>
              <p className="text-sm text-muted-foreground">
                รองรับไฟล์ JPG, PNG, WEBP
              </p>
            </div>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) onChange(selected);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}

function ContentOptions({
  isPublished,
  isFeatured,
  sendNotification,
  onPublishedChange,
  onFeaturedChange,
  onNotificationChange,
}: {
  isPublished: boolean;
  isFeatured: boolean;
  sendNotification: boolean;
  onPublishedChange: (value: boolean) => void;
  onFeaturedChange: (value: boolean) => void;
  onNotificationChange: (value: boolean) => void;
}) {
  return (
    <div className="grid md:grid-cols-3 gap-3">
      <label className="rounded-xl border p-4 flex items-start gap-3 cursor-pointer hover:bg-muted/30 transition">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => onPublishedChange(e.target.checked)}
          className="mt-1"
        />
        <div>
          <div className="flex items-center gap-2 font-medium">
            <Eye className="w-4 h-4" />
            เผยแพร่ทันที
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ถ้าไม่เลือก จะถือเป็นฉบับร่าง
          </p>
        </div>
      </label>

      <label className="rounded-xl border p-4 flex items-start gap-3 cursor-pointer hover:bg-muted/30 transition">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => onFeaturedChange(e.target.checked)}
          className="mt-1"
        />
        <div>
          <div className="flex items-center gap-2 font-medium">
            <Star className="w-4 h-4" />
            ปักหมุดเป็นรายการเด่น
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ใช้สำหรับแสดงบนส่วนแนะนำ
          </p>
        </div>
      </label>

      <label className="rounded-xl border p-4 flex items-start gap-3 cursor-pointer hover:bg-muted/30 transition">
        <input
          type="checkbox"
          checked={sendNotification}
          onChange={(e) => onNotificationChange(e.target.checked)}
          className="mt-1"
        />
        <div>
          <div className="flex items-center gap-2 font-medium">
            <Bell className="w-4 h-4" />
            ส่งแจ้งเตือน
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ส่งเฉพาะคนที่เปิดรับแจ้งเตือน
          </p>
        </div>
      </label>
    </div>
  );
}
