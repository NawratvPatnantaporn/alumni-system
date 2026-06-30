"use client";

import { useEffect, useState } from "react";
import {
  getUserSettings,
  saveAccountSettings,
  saveAppearanceSettings,
  saveNotificationSettings,
  savePrivacySettings,
} from "@/app/features/settings/services/settings.service";
import { updateUserPassword } from "@/app/features/settings/services/password.service";
import type {
  AccountSettingsForm,
  AppearanceSettingsForm,
  NotificationSettingsForm,
  PrivacySettingsForm,
  SettingsForm,
} from "@/app/features/settings/types/settings";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  Lock,
  Smartphone,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";

const defaultSettingsForm: SettingsForm = {
  account: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    preferredLanguage: "th",
  },

  notifications: {
    emailEnabled: true,
    pushEnabled: true,
    newsEnabled: true,
    eventsEnabled: true,
    jobsEnabled: true,
    messagesEnabled: true,
    marketingEnabled: false,
  },

  privacy: {
    profileVisibility: "members",
    showEmail: false,
    showPhone: false,
    showLocation: true,
    showLinkedin: true,
    showWebsite: true,
    allowMessages: true,
  },

  appearance: {
    theme: "system",
    fontSize: "medium",
    reducedMotion: false,
  },
};

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingTab, setSavingTab] = useState<
    "account" | "notifications" | "privacy" | "appearance" | "password" | null
  >(null);

  const [formData, setFormData] = useState<SettingsForm>(defaultSettingsForm);

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const loadSettings = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const settings = await getUserSettings(user.id);

      setFormData(settings);
    } catch (error: any) {
      console.error("LOAD SETTINGS ERROR:", error);

      toast({
        variant: "destructive",
        title: "โหลดการตั้งค่าไม่สำเร็จ",
        description: error?.message ?? "กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [user?.id]);

  const updateAccountField = <K extends keyof AccountSettingsForm>(
    field: K,
    value: AccountSettingsForm[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      account: {
        ...prev.account,
        [field]: value,
      },
    }));
  };

  const updateNotificationField = <K extends keyof NotificationSettingsForm>(
    field: K,
    value: NotificationSettingsForm[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }));
  };

  const updatePrivacyField = <K extends keyof PrivacySettingsForm>(
    field: K,
    value: PrivacySettingsForm[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value,
      },
    }));
  };

  const updateAppearanceField = <K extends keyof AppearanceSettingsForm>(
    field: K,
    value: AppearanceSettingsForm[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [field]: value,
      },
    }));
  };

  const handleSaveAccount = async () => {
    if (!user?.id) return;

    if (!formData.account.firstName.trim()) {
      toast({
        variant: "destructive",
        title: "กรุณากรอกชื่อ",
      });
      return;
    }

    try {
      setSavingTab("account");

      await saveAccountSettings(user.id, formData.account);

      updateProfile?.({
        firstName: formData.account.firstName,
        lastName: formData.account.lastName,
        phone: formData.account.phone,
      });

      toast({
        title: "บันทึกสำเร็จ",
        description: "อัปเดตข้อมูลบัญชีแล้ว",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "บันทึกไม่สำเร็จ",
        description: error?.message ?? "เกิดข้อผิดพลาด",
      });
    } finally {
      setSavingTab(null);
    }
  };

  // const handleSaveNotifications = async () => {
  //   if (!user?.id) return;

  //   try {
  //     setSavingTab("notifications");

  //     await saveNotificationSettings(user.id, formData.notifications);

  //     toast({
  //       title: "บันทึกสำเร็จ",
  //       description: "อัปเดตการแจ้งเตือนแล้ว",
  //     });
  //   } catch (error: any) {
  //     toast({
  //       variant: "destructive",
  //       title: "บันทึกไม่สำเร็จ",
  //       description: error?.message ?? "เกิดข้อผิดพลาด",
  //     });
  //   } finally {
  //     setSavingTab(null);
  //   }
  // };

  const handleSavePrivacy = async () => {
    if (!user?.id) return;

    try {
      setSavingTab("privacy");

      await savePrivacySettings(user.id, formData.privacy);

      toast({
        title: "บันทึกสำเร็จ",
        description: "อัปเดตความเป็นส่วนตัวแล้ว",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "บันทึกไม่สำเร็จ",
        description: error?.message ?? "เกิดข้อผิดพลาด",
      });
    } finally {
      setSavingTab(null);
    }
  };

  const handleSaveAppearance = async () => {
    if (!user?.id) return;

    try {
      setSavingTab("appearance");

      await saveAppearanceSettings(user.id, formData.appearance);

      toast({
        title: "บันทึกสำเร็จ",
        description: "อัปเดตการแสดงผลแล้ว",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "บันทึกไม่สำเร็จ",
        description: error?.message ?? "เกิดข้อผิดพลาด",
      });
    } finally {
      setSavingTab(null);
    }
  };

  const handleChangePassword = async () => {
    const newPassword = passwordForm.newPassword.trim();
    const confirmPassword = passwordForm.confirmPassword.trim();

    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "รหัสผ่านสั้นเกินไป",
        description: "รหัสผ่านควรมีอย่างน้อย 8 ตัวอักษร",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "รหัสผ่านไม่ตรงกัน",
        description: "กรุณายืนยันรหัสผ่านใหม่อีกครั้ง",
      });
      return;
    }

    try {
      setSavingTab("password");

      await updateUserPassword({
        newPassword,
      });

      setPasswordForm({
        newPassword: "",
        confirmPassword: "",
      });

      toast({
        title: "เปลี่ยนรหัสผ่านสำเร็จ",
        description: "กรุณาใช้รหัสผ่านใหม่ในการเข้าสู่ระบบครั้งถัดไป",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "เปลี่ยนรหัสผ่านไม่สำเร็จ",
        description: error?.message ?? "เกิดข้อผิดพลาด",
      });
    } finally {
      setSavingTab(null);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="h-9 w-40 rounded-xl bg-muted animate-pulse" />
          <div className="h-4 w-72 rounded-xl bg-muted animate-pulse" />
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="h-6 w-48 rounded-xl bg-muted animate-pulse" />
            <div className="h-10 w-full rounded-xl bg-muted animate-pulse" />
            <div className="h-10 w-full rounded-xl bg-muted animate-pulse" />
            <div className="h-10 w-32 rounded-xl bg-muted animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground">ตั้งค่า</h1>
        <p className="mt-1 text-muted-foreground">
          จัดการบัญชีและการตั้งค่าของคุณ
        </p>
      </motion.div>

      <Tabs defaultValue="account" className="space-y-6">
        {/* <TabsList className="grid w-full max-w-lg grid-cols-4"> */}
        <TabsList className="grid">
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">บัญชี</span>
          </TabsTrigger>
          {/* <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">แจ้งเตือน</span>
          </TabsTrigger> */}
          {/* <TabsTrigger value="privacy" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">ความเป็นส่วนตัว</span>
          </TabsTrigger> */}
          {/* <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">ธีม</span>
          </TabsTrigger> */}
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  ข้อมูลบัญชี
                </CardTitle>
                <CardDescription>อัพเดทข้อมูลพื้นฐานของบัญชี</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">ชื่อ</Label>
                      <Input
                        id="first-name"
                        value={formData.account.firstName}
                        onChange={(e) =>
                          updateAccountField("firstName", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last-name">นามสกุล</Label>
                      <Input
                        id="last-name"
                        value={formData.account.lastName}
                        onChange={(e) =>
                          updateAccountField("lastName", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">อีเมล</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.account.email}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      หากต้องการเปลี่ยนอีเมล กรุณาติดต่อผู้ดูแลระบบ
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                    <Input
                      id="phone"
                      value={formData.account.phone}
                      onChange={(e) =>
                        updateAccountField("phone", e.target.value)
                      }
                      placeholder="0XX-XXX-XXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">ภาษา</Label>
                    <Select
                      value={formData.account.preferredLanguage}
                      onValueChange={(value) =>
                        updateAccountField(
                          "preferredLanguage",
                          value as "th" | "en",
                        )
                      }
                    />
                  </div>
                </div>
                <Button
                  className="gap-2"
                  onClick={handleSaveAccount}
                  disabled={savingTab === "account"}
                >
                  <Save className="h-4 w-4" />
                  {savingTab === "account"
                    ? "กำลังบันทึก..."
                    : "บันทึกการเปลี่ยนแปลง"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  เปลี่ยนรหัสผ่าน
                </CardTitle>
                <CardDescription>อัพเดทรหัสผ่านของคุณ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">รหัสผ่านปัจจุบัน</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="รหัสผ่านปัจจุบัน"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">รหัสผ่านใหม่</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="รหัสผ่านใหม่"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">ยืนยันรหัสผ่านใหม่</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="ยืนยันรหัสผ่านใหม่"
                    />
                  </div>
                </div>
                <Button className="gap-2">
                  <Lock className="h-4 w-4" />
                  เปลี่ยนรหัสผ่าน
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notifications Tab */}
        {/* <TabsContent value="notifications" className="space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  การแจ้งเตือน
                </CardTitle>
                <CardDescription>จัดการการรับการแจ้งเตือน</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    ช่องทางการแจ้งเตือน
                  </h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">แจ้งเตือนทางอีเมล</p>
                        <p className="text-xs text-muted-foreground">
                          รับการแจ้งเตือนทางอีเมล
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.notifications.emailEnabled}
                      onCheckedChange={(checked) =>
                        savingTab === "notifications"
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          Push Notifications
                        </p>
                        <p className="text-xs text-muted-foreground">
                          รับการแจ้งเตือนบนเบราว์เซอร์
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, push: checked })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    ประเภทการแจ้งเตือน
                  </h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">ข่าวสารและประกาศ</p>
                      <p className="text-xs text-muted-foreground">
                        ข่าวใหม่จากมหาวิทยาลัย
                      </p>
                    </div>
                    <Switch
                      checked={notifications.news}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, news: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">กิจกรรมและอีเวนต์</p>
                      <p className="text-xs text-muted-foreground">
                        กิจกรรมที่กำลังจะมาถึง
                      </p>
                    </div>
                    <Switch
                      checked={notifications.events}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, events: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">ตำแหน่งงานใหม่</p>
                      <p className="text-xs text-muted-foreground">
                        ประกาศรับสมัครงานใหม่
                      </p>
                    </div>
                    <Switch
                      checked={notifications.jobs}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, jobs: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">ข้อความ</p>
                      <p className="text-xs text-muted-foreground">
                        ข้อความจากศิษย์เก่าคนอื่น
                      </p>
                    </div>
                    <Switch
                      checked={notifications.messages}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          messages: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent> */}

        {/* Privacy Tab */}
        {/* <TabsContent value="privacy" className="space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  ความเป็นส่วนตัว
                </CardTitle>
                <CardDescription>
                  ควบคุมการมองเห็นโปรไฟล์และข้อมูลของคุณ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>การมองเห็นโปรไฟล์</Label>
                  <Select
                    value={formData.privacy.profileVisibility}
                    onValueChange={(value) =>
                      updatePrivacyField(
                        "profileVisibility",
                        value as "public" | "members" | "private",
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">สาธารณะ</SelectItem>
                      <SelectItem value="members">เฉพาะสมาชิกในระบบ</SelectItem>
                      <SelectItem value="private">เฉพาะฉัน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        แสดงโปรไฟล์ใน Directory
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ให้ศิษย์เก่าและนักศึกษาคนอื่นค้นหาโปรไฟล์ของคุณได้
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">แสดงอีเมล</p>
                      <p className="text-xs text-muted-foreground">
                        แสดงอีเมลในโปรไฟล์สาธารณะ
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">แสดงเบอร์โทรศัพท์</p>
                      <p className="text-xs text-muted-foreground">
                        แสดงเบอร์โทรศัพท์ในโปรไฟล์สาธารณะ
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">อนุญาตการติดต่อ</p>
                      <p className="text-xs text-muted-foreground">
                        รับข้อความจากศิษย์เก่าและนักศึกษาคนอื่น
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent> */}

        {/* Appearance Tab */}
        {/* <TabsContent value="appearance" className="space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  ธีมและการแสดงผล
                </CardTitle>
                <CardDescription>
                  ปรับแต่งรูปลักษณ์ของแอพพลิเคชัน
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>ธีม</Label>
                    <Select defaultValue="system">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">สว่าง</SelectItem>
                        <SelectItem value="dark">มืด</SelectItem>
                        <SelectItem value="system">ตามระบบ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ขนาดตัวอักษร</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">เล็ก</SelectItem>
                        <SelectItem value="medium">ปกติ</SelectItem>
                        <SelectItem value="large">ใหญ่</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
