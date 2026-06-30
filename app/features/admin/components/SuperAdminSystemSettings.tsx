"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Settings, Plus, Save, Power } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useSystemSettings } from "@/contexts/system-settings-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

import {
  getRegistrationMajors,
  getSystemSettings,
  setRegistrationMajorActive,
  updateSystemSettings,
  upsertRegistrationMajor,
  uploadSystemLogo,
} from "@/app/features/system/services/systemSettings.service";

import type {
  RegistrationMajor,
  RegistrationMajorForm,
  SystemSettings,
} from "@/app/features/system/types/systemSettings";

const emptyMajorForm: RegistrationMajorForm = {
  name: "",
  startYear: "",
  endYear: "",
  allowStudent: true,
  allowAlumni: true,
  allowManualYear: false,
  isActive: true,
  displayOrder: 0,
};

export function SuperAdminSystemSettings() {
  const { user } = useAuth();
  const { reloadSettings } = useSystemSettings();

  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [majors, setMajors] = useState<RegistrationMajor[]>([]);
  const [majorForm, setMajorForm] =
    useState<RegistrationMajorForm>(emptyMajorForm);

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingMajor, setSavingMajor] = useState(false);

  const [uploadingLogo, setUploadingLogo] = useState<
    "login" | "register" | null
  >(null);

  const loadData = async () => {
    try {
      setLoading(true);

      const [settingsData, majorsData] = await Promise.all([
        getSystemSettings(),
        getRegistrationMajors({ includeInactive: true }),
      ]);

      setSettings(settingsData);
      setMajors(majorsData);
    } catch (error) {
      console.error("LOAD SUPER ADMIN SETTINGS ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "โหลดการตั้งค่าระบบไม่สำเร็จ",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUploadLogo = async (
    file: File | null,
    type: "login" | "register",
  ) => {
    if (!file || !settings) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/svg+xml",
    ];

    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: "warning",
        title: "ประเภทไฟล์ไม่ถูกต้อง",
        text: "รองรับเฉพาะ PNG, JPG, WEBP หรือ SVG",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "ไฟล์ใหญ่เกินไป",
        text: "ขนาดไฟล์ต้องไม่เกิน 5MB",
      });
      return;
    }

    try {
      setUploadingLogo(type);

      const publicUrl = await uploadSystemLogo({
        file,
        type,
      });

      setSettings({
        ...settings,
        ...(type === "login"
          ? { loginLogoUrl: publicUrl }
          : { registerLogoUrl: publicUrl }),
      });

      Swal.fire({
        icon: "success",
        title: "อัปโหลด Logo สำเร็จ",
        text: "อย่าลืมกดบันทึกชื่อระบบเพื่อบันทึก URL ลงฐานข้อมูล",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "อัปโหลด Logo ไม่สำเร็จ",
        text: error?.message ?? "เกิดข้อผิดพลาด",
      });
    } finally {
      setUploadingLogo(null);
    }
  };

  const handleSaveSystemSettings = async () => {
    if (!user?.id || !settings) return;

    try {
      setSavingSettings(true);

      await updateSystemSettings(settings.id, {
        systemName: settings.systemName,
        systemShortName: settings.systemShortName,
        systemTagline: settings.systemTagline,

        loginBrandTitle: settings.loginBrandTitle,
        registerBrandTitle: settings.registerBrandTitle,

        loginLogoUrl: settings.loginLogoUrl,
        registerLogoUrl: settings.registerLogoUrl,

        updatedBy: user.id,
      });

      await reloadSettings();
      await loadData();

      Swal.fire({
        icon: "success",
        title: "บันทึกชื่อระบบสำเร็จ",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1800,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "บันทึกไม่สำเร็จ",
        text: error?.message ?? "เกิดข้อผิดพลาด",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSubmitMajor = async () => {
    if (!user?.id) return;

    try {
      setSavingMajor(true);

      await upsertRegistrationMajor(majorForm, user.id);

      setMajorForm(emptyMajorForm);
      await loadData();

      Swal.fire({
        icon: "success",
        title: majorForm.id ? "แก้ไขสาขาสำเร็จ" : "เพิ่มสาขาสำเร็จ",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1800,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "บันทึกสาขาไม่สำเร็จ",
        text: error?.message ?? "เกิดข้อผิดพลาด",
      });
    } finally {
      setSavingMajor(false);
    }
  };

  const handleEditMajor = (major: RegistrationMajor) => {
    setMajorForm({
      id: major.id,
      name: major.name,
      startYear: String(major.startYear),
      endYear: String(major.endYear),
      allowStudent: major.allowStudent,
      allowAlumni: major.allowAlumni,
      allowManualYear: major.allowManualYear,
      isActive: major.isActive,
      displayOrder: major.displayOrder,
    });
  };

  const handleToggleMajorActive = async (major: RegistrationMajor) => {
    if (!user?.id) return;

    try {
      await setRegistrationMajorActive(major.id, !major.isActive, user.id);

      await loadData();

      Swal.fire({
        icon: "success",
        title: !major.isActive ? "เปิดใช้งานสาขาแล้ว" : "ปิดใช้งานสาขาแล้ว",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1600,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "อัปเดตสถานะไม่สำเร็จ",
        text: error?.message ?? "เกิดข้อผิดพลาด",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        กำลังโหลดการตั้งค่าระบบ...
      </div>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          ไม่พบข้อมูลการตั้งค่าระบบ
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            ตั้งค่าชื่อระบบ
          </CardTitle>
          <CardDescription>เปลี่ยนชื่อระบบที่แสดง</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>ชื่อระบบเต็ม</Label>
            <Input
              value={settings.systemName}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  systemName: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>ชื่อย่อบน Navbar</Label>
            <Input
              value={settings.systemShortName}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  systemShortName: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Tagline</Label>
            <Input
              value={settings.systemTagline}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  systemTagline: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-3">
            <Label>Logo ของระบบ</Label>

            <div className="rounded-xl border p-4 space-y-3">
              {settings.loginLogoUrl ? (
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl border bg-muted overflow-hidden">
                    <img
                      src={settings.loginLogoUrl}
                      alt="Login logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium">Logo ปัจจุบัน</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {settings.loginLogoUrl}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  ยังไม่ได้อัปโหลด Logo
                </div>
              )}

              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                disabled={uploadingLogo === "login"}
                onChange={(e) =>
                  handleUploadLogo(e.target.files?.[0] ?? null, "login")
                }
              />

              <p className="text-xs text-muted-foreground">
                รองรับ PNG, JPG, WEBP, SVG ขนาดไม่เกิน 5MB
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>ชื่อบนหน้า Register</Label>
            <Input
              value={settings.registerBrandTitle}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  registerBrandTitle: e.target.value,
                })
              }
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button
              onClick={handleSaveSystemSettings}
              disabled={savingSettings}
            >
              <Save className="mr-2 h-4 w-4" />
              {savingSettings ? "กำลังบันทึก..." : "บันทึกชื่อระบบ"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>จัดการสาขาหน้า Register</CardTitle>
          <CardDescription>
            เพิ่ม แก้ไข หรือปิดสาขาที่ผู้สมัครสามารถเลือกได้ตอนลงทะเบียน
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-2xl border p-4 space-y-4">
            <h3 className="font-semibold">
              {majorForm.id ? "แก้ไขสาขา" : "เพิ่มสาขาใหม่"}
            </h3>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2 md:col-span-2">
                <Label>ชื่อสาขา</Label>
                <Input
                  value={majorForm.name}
                  onChange={(e) =>
                    setMajorForm({
                      ...majorForm,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>ปีเริ่มต้น</Label>
                <Input
                  value={majorForm.startYear}
                  onChange={(e) =>
                    setMajorForm({
                      ...majorForm,
                      startYear: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>ปีสิ้นสุด</Label>
                <Input
                  value={majorForm.endYear}
                  onChange={(e) =>
                    setMajorForm({
                      ...majorForm,
                      endYear: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-5">
              <ToggleField
                label="นักศึกษาปัจจุบัน"
                checked={majorForm.allowStudent}
                onChange={(checked) =>
                  setMajorForm({
                    ...majorForm,
                    allowStudent: checked,
                  })
                }
              />

              <ToggleField
                label="ศิษย์เก่า"
                checked={majorForm.allowAlumni}
                onChange={(checked) =>
                  setMajorForm({
                    ...majorForm,
                    allowAlumni: checked,
                  })
                }
              />

              <ToggleField
                label="เลือกปีเอง"
                checked={majorForm.allowManualYear}
                onChange={(checked) =>
                  setMajorForm({
                    ...majorForm,
                    allowManualYear: checked,
                  })
                }
              />

              <ToggleField
                label="เปิดใช้งาน"
                checked={majorForm.isActive}
                onChange={(checked) =>
                  setMajorForm({
                    ...majorForm,
                    isActive: checked,
                  })
                }
              />

              <div className="space-y-2">
                <Label>ลำดับ</Label>
                <Input
                  value={majorForm.displayOrder}
                  onChange={(e) =>
                    setMajorForm({
                      ...majorForm,
                      displayOrder: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {majorForm.id && (
                <Button
                  variant="outline"
                  onClick={() => setMajorForm(emptyMajorForm)}
                >
                  ยกเลิกแก้ไข
                </Button>
              )}

              <Button onClick={handleSubmitMajor} disabled={savingMajor}>
                <Plus className="mr-2 h-4 w-4" />
                {savingMajor
                  ? "กำลังบันทึก..."
                  : majorForm.id
                    ? "บันทึกการแก้ไข"
                    : "เพิ่มสาขา"}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {majors.map((major) => (
              <div
                key={major.id}
                className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{major.name}</p>

                    {major.isActive ? (
                      <Badge>Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    พ.ศ. {major.startYear} - {major.endYear}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {major.allowStudent && (
                      <Badge variant="outline">นักศึกษาปัจจุบัน</Badge>
                    )}
                    {major.allowAlumni && (
                      <Badge variant="outline">ศิษย์เก่า</Badge>
                    )}
                    {major.allowManualYear && (
                      <Badge variant="outline">เลือกปีเองได้</Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleEditMajor(major)}
                  >
                    แก้ไข
                  </Button>

                  <Button
                    variant={major.isActive ? "destructive" : "outline"}
                    onClick={() => handleToggleMajorActive(major)}
                  >
                    <Power className="mr-2 h-4 w-4" />
                    {major.isActive ? "ปิด" : "เปิด"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-3">
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
