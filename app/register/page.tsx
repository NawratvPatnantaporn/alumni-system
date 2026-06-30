"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Swal from "sweetalert2";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GraduationCap, ArrowLeft, ArrowRight, Check, Eye, EyeOff, Mail, User, Loader2, IdCard, Calendar } from "lucide-react";
import YearPicker from "@/components/ui/YearPicker";
import { registerUser } from "../features/auth/services/register.service";
import type { FormData, EducationStatus } from "../../components/types/auth";

import { getRegistrationMajors } from "../features/system/services/systemSettings.service";
import type { RegistrationMajor } from "../features/system/types/systemSettings";
import { useSystemSettings } from "@/contexts/system-settings-context";
import { fi } from "date-fns/locale";

  type PersonalInfoProps = {
    formData: FormData;
    handleInputChange: <K extends keyof FormData>(
      field: K,
      value: FormData[K]
    ) => void;
    handleNext: () => void;
    handleBack: () => void;
    yearPickerOpen: boolean;
    setYearPickerOpen: (open: boolean) => void;
    registrationMajors: RegistrationMajor[];
  };

  const PersonalInfo = ({
    formData,
    handleInputChange,
    handleNext,
    handleBack,
    yearPickerOpen,
    setYearPickerOpen,
    registrationMajors,
  }: PersonalInfoProps) =>{

    const availableMajors = registrationMajors.filter((major) => {
      if (formData.educationStatus === "studying") {
        return major.allowStudent;
      }

      if (formData.educationStatus === "graduated") {
        return major.allowAlumni;
      }

      return false;
    });

    const selectedMajorConfig = registrationMajors.find(
      (m) => m.name === formData.major
    );

    const startYear = selectedMajorConfig?.startYear ?? 2500;
    const endYear = selectedMajorConfig?.endYear ?? 2570;

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">ข้อมูลส่วนตัว</h2>
          <p className="text-muted-foreground mt-2">กรอกข้อมูลการศึกษาของคุณ</p>
        </div>

        <div className="space-y-4">
          {/* ชื่อ-นามสกุล (เหมือนเดิม) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">ชื่อ</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="firstName"
                  placeholder="ชื่อ"
                  className="pl-10"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">นามสกุล</Label>
              <Input
                id="lastName"
                placeholder="นามสกุล"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 3. ปรับส่วนสถานะการศึกษา ให้ Reset ค่าสาขาเมื่อเปลี่ยนสถานะ */}
              <div className="space-y-2">
                <Label>สถานะการศึกษา</Label>
                <Select
                  value={formData.educationStatus}
                  onValueChange={(value: EducationStatus) => {
                    handleInputChange("educationStatus", value);
                    handleInputChange("major", "");
                    handleInputChange("studyYear", undefined as FormData["studyYear"]);
                    // ถ้าสถานะเป็น จบการศึกษา อาจจะอยากล้างรหัสนักศึกษาด้วย
                    if (value === "graduated") {
                      handleInputChange("studentId", "");
                    }
                  }}
                >
                  <SelectTrigger className="h-11 shadow-sm">
                    <SelectValue placeholder="เลือกสถานะการศึกษา" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="studying">กำลังศึกษาอยู่</SelectItem>
                    <SelectItem value="graduated">จบการศึกษาแล้ว</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.educationStatus === "graduated" && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    ปีที่เข้าศึกษา (พ.ศ.)
                  </Label>

                  {/* ❗ เตือนให้เลือกสาขาก่อน */}
                  {!formData.major && (
                    <p className="text-xs text-muted-foreground">
                      กรุณาเลือกสาขาก่อน
                    </p>
                  )}

                  {formData.major && (
                    <>
                      <div className="space-y-3 p-4 rounded-xl border bg-muted/30">
                        <Popover
                          open={yearPickerOpen}
                          onOpenChange={setYearPickerOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full h-11 justify-start gap-2 font-normal ${formData.studyYear ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              <Calendar className="w-4 h-4 opacity-70" />

                              {formData.studyYear
                                ? `พ.ศ. ${formData.studyYear}`
                                : "เลือกปีที่เข้าศึกษา"}
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent
                            align="start"
                            className="w-[320px] p-4 rounded-xl shadow-xl border"
                          >
                            <YearPicker
                              startYear={startYear}
                              endYear={endYear}
                              value={formData.studyYear}
                              onChange={(year) => {
                                handleInputChange("studyYear", year);
                                setYearPickerOpen(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>

                        {/* ✅ แสดงเมื่อเลือกปีแล้ว */}
                        {formData.studyYear && (
                          <p className="text-xs text-muted-foreground">
                            อยู่ในช่วงที่เปิดรับของสาขานี้
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 4. รวมส่วนแสดงผล "สาขา" ให้ใช้ Logic เดียวกันทั้งสองสถานะ */}
          {(formData.educationStatus === "studying" ||
            formData.educationStatus === "graduated") && (
            <>
              {formData.educationStatus === "studying" && (
                <div className="space-y-2">
                  <Label>รหัสนักศึกษา</Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={formData.studentId}
                      onChange={(e) =>
                        handleInputChange("studentId", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>สาขา</Label>
                <Select
                  value={formData.major}
                  onValueChange={(value) => {
                    handleInputChange("major", value);
                    handleInputChange("studyYear", undefined);
                  }}
                >
                  <SelectTrigger className="h-11 shadow-sm">
                    <SelectValue placeholder="เลือกสาขา" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMajors.map((major) => (
                      <SelectItem key={major.id} value={major.name}>
                        {major.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ย้อนกลับ
          </Button>
          <Button onClick={handleNext} className="flex-1">
            ถัดไป
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    );
  };

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  // ... states อื่นๆ คงเดิม ...
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);

  const { settings } = useSystemSettings();
  const [registrationMajors, setRegistrationMajors] = useState<
    RegistrationMajor[]
  >([]);
  const [loadingMajors, setLoadingMajors] = useState(true);

  useEffect(() => {
    const loadRegistrationMajors = async () => {
      try {
        setLoadingMajors(true);
        const majors = await getRegistrationMajors();
        setRegistrationMajors(majors);
      } catch (error) {
        console.error("LOAD REGISTRATION MAJORS ERROR:", error);

        Swal.fire({
          icon: "error",
          title: "โหลดข้อมูลสาขาไม่สำเร็จ",
        text: "กรุณาลองใหม่อีกครั้ง",
        });
      } finally {
        setLoadingMajors(false);
      }
    };

    loadRegistrationMajors();
  }, []);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    educationStatus: "",
    studentId: "",
    major: "",
    studyYear: undefined as number | undefined,
    education: {
      faculty: "",
      gpa: "",
      honors: "",
    },
  });

  const handleInputChange = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value};

      if (field === "educationStatus") {
        next.major = "";
        next.studyYear = undefined;

        if (value === "graduated") {
          next.studentId = "";
        }
      }

      if (field === "major") {
        next.studyYear = undefined;
      }

      return next;
    }); 
  }

  const showError = (msg: string) => {
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: msg,
      confirmButtonText: "ตกลง",
      customClass: { popup: "rounded-xl", confirmButton: "px-6 py-2" },
    });
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        showError("กรุณากรอกข้อมูลบัญชีให้ครบ");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        showError("รหัสผ่านไม่ตรงกัน");
        return false;
      }
      if (formData.password.length < 6) {
        // Supabase default min length
        showError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
        return false;
      }
    }
    if (step === 2) {
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.educationStatus
      ) {
        showError("กรุณากรอกข้อมูลส่วนตัวให้ครบ");
        return false;
      }
      if (
        formData.educationStatus === "studying" &&
        (!formData.studentId || !formData.major)
      ) {
        showError("กรุณากรอกรหัสนักศึกษาและสาขา");
        return false;
      }
      if (
        formData.educationStatus === "graduated" &&
        (!formData.major || formData.studyYear === undefined)
      ) {
        showError("กรุณาเลือกสาขาและปีที่เข้าศึกษา");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!acceptTerms) {
      Swal.fire({
        icon: "warning",
        title: "กรุณายอมรับเงื่อนไข",
        text: "โปรดยอมรับข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัว",
      });
      return;
    }

    setIsLoading(true);

    try {
      await registerUser(formData); 

      await Swal.fire({
        icon: "success",
        title: "ลงทะเบียนสำเร็จ",
        text: "กรุณาเข้าสู่ระบบ",
      });

      router.push("/login");
      
    } catch (err: any) {
      showError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-10">
      {[1, 2, 3].map((s) => {
        const isActive = s === step;
        const isDone = s < step;

        return (
          <div key={s} className="flex items-center">
            <motion.div
              className={`
              relative w-11 h-11 rounded-full flex items-center justify-center 
              text-sm font-semibold transition-all duration-300
              ${isDone && "bg-primary text-white shadow-lg shadow-primary/40"}
              ${isActive && "bg-primary text-white ring-4 ring-primary/20"}
              ${!isDone && !isActive && "bg-muted text-muted-foreground"}
            `}
              animate={{ scale: isActive ? 1.1 : 1 }}
            >
              {isDone ? <Check className="w-5 h-5" /> : s}
            </motion.div>

            {s < 3 && (
              <div
                className={`
                w-20 h-[2px] mx-2 transition-colors
                ${s < step ? "bg-primary" : "bg-muted"}
              `}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderAccountInfo = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8 space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">สร้างบัญชีใหม่</h2>
        <p className="text-muted-foreground">เริ่มต้นใช้งาน Alumni Connect</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">อีเมล</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              className="pl-10"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">รหัสผ่าน</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวอักษรและตัวเลข
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <Button
        onClick={handleNext}
        className="w-full h-11 text-base font-medium shadow-md hover:shadow-lg transition-all"
        size="lg"
      >
        ถัดไป
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );

  const renderConfirmation = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">ยืนยันข้อมูล</h2>
        <p className="text-muted-foreground mt-2">
          ตรวจสอบข้อมูลก่อนยืนยันการลงทะเบียน
        </p>
      </div>

      <div className="space-y-6">
        <Card className="border shadow-sm">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="p-2 rounded-lg bg-primary">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Email: {formData.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">สถานะการศึกษา</p>
                <p className="font-medium">
                  {" "}
                  {formData.educationStatus === "studying"
                    ? "กำลังศึกษาอยู่"
                    : "จบการศึกษาแล้ว"}{" "}
                </p>
              </div>
              {/* แสดงเฉพาะเมื่อสถานะเป็นกำลังศึกษา */}
              {formData.educationStatus === "studying" && (
                <div>
                  <p className="text-muted-foreground">รหัสนักศึกษา</p>
                  <p className="font-medium">{formData.studentId || "-"}</p>
                </div>
              )}

              {/* 3. ปีที่เข้าศึกษา - แสดงเฉพาะตอน "จบการศึกษาแล้ว" (ศิษย์เก่า) */}
              {formData.educationStatus !== "studying" && (
                <div>
                  <p className="text-muted-foreground">ปีที่เข้าศึกษา</p>
                  <p className="font-medium">
                    {formData.studyYear ? `พ.ศ. ${formData.studyYear}` : "-"}
                  </p>
                </div>
              )}

              {/* ถ้าจบการศึกษาแล้ว ให้สาขากินพื้นที่เต็ม 2 คอลัมน์เพื่อให้ดูสมดุล */}
              <div
                className={
                  formData.educationStatus === "studying"
                    ? "col-span-2"
                    : "col-span-2"
                }
              >
                <p className="text-muted-foreground">สาขา</p>
                <p className="font-medium">{formData.major || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="terms"
          checked={acceptTerms}
          onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
        />
        <label
          htmlFor="terms"
          className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
        >
          ข้าพเจ้ายอมรับ{" "}
          <Link href="#" className="text-primary hover:underline">
            ข้อกำหนดการใช้งาน
          </Link>{" "}
          และ{" "}
          <Link href="#" className="text-primary hover:underline">
            นโยบายความเป็นส่วนตัว
          </Link>
        </label>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex-1 bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          ย้อนกลับ
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1"
          disabled={!acceptTerms || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              กำลังลงทะเบียน...
            </>
          ) : (
            <>
              ยืนยันการลงทะเบียน
              <Check className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br  from-primary/10  via-background  to-accent/10 flex items-center justify-center p-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent/10 blur-[120px]" />
      </div>
      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">
              {settings.registerBrandTitle}
            </span>
          </Link>
        </motion.div>
        <Card className="border shadow-md bg-gradient-to-br from-background to-muted/30">
          <CardContent className="p-8">
            {renderStepIndicator()}
            {step === 1 && renderAccountInfo()}
            {step === 2 && (
              <PersonalInfo
                formData={formData}
                handleInputChange={handleInputChange}
                handleNext={handleNext}
                handleBack={handleBack}
                yearPickerOpen={yearPickerOpen}
                setYearPickerOpen={setYearPickerOpen}
                registrationMajors={registrationMajors}
              />
            )}
            {step === 3 && renderConfirmation()}
          </CardContent>
        </Card>
        <div className="text-center mt-6 text-sm text-muted-foreground">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="text-primary hover:underline">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}