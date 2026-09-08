"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User, Building2, GraduationCap, MapPin, Mail, Phone, Linkedin, Github, Globe, Briefcase, Edit2, Save, Plus, CheckCircle, Clock, TrendingUp, House, Map, Mailbox, Upload, X, Check, ZoomIn, Loader2 } from "lucide-react";
import { FaLine } from "react-icons/fa";
import { AnimatePresence } from "framer-motion";
import { fuzzyMatchSkill } from "@/lib/skills";
import { SkillsInput } from "@/components/Skills/Skills-input";
import { SkillTab } from "@/components/Skills/SkillTab";
import { Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { saveFullProfile } from "@/app/features/auth/services/saveFullProfile.service";
import { uploadAvatar } from "@/app/features/auth/services/avatar.service";
import Cropper from "react-easy-crop";
import { createPortal } from "react-dom";
import { getCroppedImg } from "@/app/features/auth/services/cropImage.service";
import { SkillForm } from "@/components/Skills/skillform";
import { CareerTimelineTab } from "@/components/Profile/CareerTimeline/CareerTimelineTab";
import type { CareerExperienceForm } from "@/components/Profile/CareerTimeline/types";
import { AchievementsTab } from "@/components/Profile/Achievements/AchievementsTab";
import { getInterestTags, createInterestTag, type InterestTag, type UserInterestForm } from "@/app/features/profile/services/userInterest.service";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 },
  },
};

type EducationForm = {
  id?: string;
  university: string;
  degree: string;
  faculty: string;
  major: string;
  admissionYear: string;
  graduationYear: string;
  gpa: string;
  honors: string;
  isCurrent: boolean;
  description: string;
  displayOrder: number;
  isPrimary: boolean;
};

const emptyEducation = (): EducationForm => ({
  university: "",
  degree: "",
  faculty: "",
  major: "",
  admissionYear: "",
  graduationYear: "",
  gpa: "",
  honors: "",
  isCurrent: false,
  description: "",
  displayOrder: 0,
  isPrimary: false,
});

const emptyCareerExperience = (): CareerExperienceForm => ({
  company: "",
  position: "",
  employmentType: "",
  location: "",
  workMode: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  description: "",
  achievements: "",
  displayOrder: 0,

  careerCategory: "",
  careerLevel: "",
  alignmentScore: 0,
  isAligned: false,
  alignmentReason: "",
  relatedSkills: [],
});

type UserAchievementForm = {
  id?: string;
  title: string;
  issuer: string;
  achievementDate: string;
  description: string;
  url: string;
  achievementType: string;
  isFeatured: boolean;
  displayOrder: number;
};

const emptyAchievement = (): UserAchievementForm => ({
  title: "",
  issuer: "",
  achievementDate: "",
  description: "",
  url: "",
  achievementType: "",
  isFeatured: false,
  displayOrder: 0,
});

type ProfileVisibility = "public" | "members" | "private";

type ProfilePrivacyForm = {
  profileVisibility: ProfileVisibility;
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showLinkedin: boolean;
  showWebsite: boolean;
};

function getProfileVisibilityLabel(
  visibility: ProfileVisibility,
) {
  switch (visibility) {
    case "public":
      return "สาธารณะ";
    
    case "members":
      return "เฉพาะสมาชิกในระบบ";

    case "private":
      return "เฉพาะคุณ";

    default:
      return "เฉพาะสมาชิกในระบบ";
  }
}

function getProfileVisibilityDescription(
  visibility: ProfileVisibility,
) {
  switch (visibility) {
    case "public":
      return "โปรไฟล์ของคุณสามารถแสดงในพื้นที่สาธารณะตามนโยบายของระบบ";
    
    case "members":
      return "เฉพาะผู้ใช้ที่เข้าสู่ระบบเท่านั้นที่สามารถดูโปรไฟล์ของคุณได้";

    case "private":
      return "ผู้อื่นไม่สามารถเปิดดูโปรไฟล์ของคุณได้";

    default:
      return "";
  }
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
  const [careerCategories, setCareerCategories] = useState<
    { id: string; name: string; label_th: string }[]
  >([]);
  const [interestTags, setInterestTags] = useState<InterestTag[]>([]);
  const [interestInput, setInterestInput] = useState("");

  const loadCareerCategories = async () => {
    const { data, error } = await supabase
      .from("career_categories")
      .select("id, name, label_th")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error(
        "GET CAREER CATEGORIES ERROR:",
        error.message,
        error.details,
        error.hint,
      );
      throw error;
    }

    setCareerCategories(data ?? []);
  };

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    company: user?.company || "",
    position: user?.position || "",
    work: user?.work || "",
    location: user?.location || "",
    linkedin: user?.linkedin || "",
    github: user?.github || "",
    lineID: user?.lineID || "",
    website: user?.website || "",
    address: {
      houseNo: user?.address?.houseNo || "",
      subDistrict: user?.address?.subDistrict || "",
      district: user?.address?.district || "",
      province: user?.address?.province || "",
      postalCode: user?.address?.postalCode || "",
    },
    educations: [] as EducationForm[],
    studyYear: user?.studyYear || "",
    skills: [] as SkillForm[],
    avatar: "",
    careerExperiences: [] as CareerExperienceForm[],
    achievements: [] as UserAchievementForm[],
    interests: [] as UserInterestForm[],

    privacy: {
      profileVisibility: "members",
      showEmail: false,
      showPhone: false,
      showLocation: true,
      showLinkedin: true,
      showWebsite: true,
    } as ProfilePrivacyForm,
  });

  const loadInterestTags = async () => {
    try {
      const tags = await getInterestTags();
      setInterestTags(tags);
    } catch (error) {
      console.error("LOAD INTEREST TAGS ERROR:", error);
    }
  };

  const onCropComplete = (_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsCropping(true);

      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);

      setAvatarFile(croppedFile);

      const previewUrl = URL.createObjectURL(croppedFile);

      setFormData((prev) => {
        if (prev.avatar?.startsWith("blob:")) {
          URL.revokeObjectURL(prev.avatar);
        }

        return {
          ...prev,
          avatar: previewUrl,
        };
      });

      if (selectedImageUrl) {
        URL.revokeObjectURL(selectedImageUrl);
        setSelectedImageUrl("");
      }

      setCropModalOpen(false);
      setImageSrc("");
    } catch (error) {
      console.error("Error cropping image:", error);

      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถตัดรูปภาพได้",
      });
    } finally {
      setIsCropping(false);
    }
  };

  const handleCloseCropModal = () => {
    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl);
      setSelectedImageUrl("");
    }

    setCropModalOpen(false);
    setImageSrc("");
    setIsImageLoaded(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  useEffect(() => {
    return () => {
      if (formData.avatar?.startsWith("blob:")) {
        URL.revokeObjectURL(formData.avatar);
      }
    };
  }, [formData.avatar]);

  useEffect(() => {
    return () => {
      if (selectedImageUrl) {
        URL.revokeObjectURL(selectedImageUrl);
      }
    };
  }, [selectedImageUrl]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [skillInput, setSkillInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!skillInput) {
      setSuggestions([]);
      return;
    }

    const matches = fuzzyMatchSkill(skillInput);
    setSuggestions(matches.slice(0, 5));
  }, [skillInput]);

  const { toast } = useToast();

  const addEducation = () => {
    setFormData((prev) => {
      const hasPrimary = prev.educations.some((edu) => edu.isPrimary);

      return {
        ...prev,
        educations: [
          ...prev.educations,
          {
            ...emptyEducation(),
            displayOrder: prev.educations.length,
            isPrimary: !hasPrimary,
          },
        ],
      };
    });
  };

  const removeEducation = (index: number) => {
    setFormData((prev) => {
      const removed = prev.educations[index];
      const nextEducations = prev.educations.filter((_, i) => i !== index);

      if (removed?.isPrimary && nextEducations.length > 0) {
        nextEducations[0] = {
          ...nextEducations[0],
          isPrimary: true,
        };
      }

      return {
        ...prev,
        educations: nextEducations.map((edu, i) => ({
          ...edu,
          displayOrder: i,
        })),
      };
    });
  };

  const updateEducationField = (
    index: number,
    field: keyof EducationForm,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      educations: prev.educations.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu,
      ),
    }));
  };

  const addCareerExperience = () => {
    setFormData((prev) => ({
      ...prev,
      careerExperiences: [
        ...prev.careerExperiences,
        {
          ...emptyCareerExperience(),
          displayOrder: prev.careerExperiences.length,
        },
      ],
    }));
  };

  const removeCareerExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      careerExperiences: prev.careerExperiences
        .filter((_, i) => i !== index)
        .map((item, i) => ({
          ...item,
          displayOrder: i,
        })),
    }));
  };

  const updateCareerField = (
    index: number,
    field: keyof CareerExperienceForm,
    value: string | boolean | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      careerExperiences: prev.careerExperiences.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addAchievement = () => {
    setFormData((prev) => ({
      ...prev,
      achievements: [
        ...prev.achievements,
        {
          ...emptyAchievement(),
          displayOrder: prev.achievements.length,
        },
      ],
    }));
  };

  const removeAchievement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      achievements: prev.achievements
        .filter((_, i) => i !== index)
        .map((item, i) => ({
          ...item,
          displayOrder: i,
        })),
    }));
  };

  const updateAchievementField = (
    index: number,
    field: keyof UserAchievementForm,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addInterest = async (tag: InterestTag) => {
    setFormData((prev) => {
      const exists = prev.interests.some((item) => item.tagId === tag.id);

      if (exists) return prev;

      if (prev.interests.length >= 10) {
        toast({
          variant: "destructive",
          title: "เพิ่มความสนใจได้สูงสุด 10 รายการ",
        });
        return prev;
      }

      return {
        ...prev,
        interests: [
          ...prev.interests,
          {
            tagId: tag.id,
            name: tag.name,
            slug: tag.slug,
            category: tag.category,
            displayOrder: prev.interests.length,
          },
        ],
      };
    });

    setInterestInput("");
  };

  const addCustomInterest = async () => {
    const value = interestInput.trim();

    if (!value) return;

    try {
      const tag = await createInterestTag(value);

      setInterestTags((prev) => {
        const exists = prev.some((item) => item.id === tag.id);
        return exists ? prev : [...prev, tag];
      });

      await addInterest(tag);
    } catch (error: any) {
      console.error("ADD CUSTOM INTEREST ERROR:", error.message, error.details, error.hint);
      toast({
        variant: "destructive",
        title: "เพิ่มความสนใจล้มเหลว",
        description: error?.message ?? "เกิดข้อผิดพลาด",
      });
    }
  };

  const removeInterest = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests
        .filter((item) => item.tagId !== tagId)
        .map((item, index) => ({
          ...item,
          displayOrder: index,
        })),
    }));
  };

  const updateBadgeDisplay = async (
    userBadgeId: string,
    showOnProfile: boolean
  ) => {
    if (!user?.id) return;

    setEarnedBadges((prev) => 
      prev.map((item) => 
        item.id === userBadgeId
          ? { ...item, show_on_profile: showOnProfile }
          : item,
      ),
    );

    const { error } = await supabase
      .from("user_badges")
      .update({ show_on_profile: showOnProfile })
      .eq("id", userBadgeId)
      .eq("user_id", user.id);

    if (error) {
      console.error("UPDATE BADGE DISPLAY ERROR:", error.message, error.details, error.hint);

      setEarnedBadges((prev) => 
        prev.map((item) => 
          item.id === userBadgeId
            ? { ...item, show_on_profile: !showOnProfile }
            : item,
        ),
      );

      toast({
        variant: "destructive",
        title: "อัพเดทเหรียญไม่สำเร็จ",
        description: "ไม่สามารถเปลี่ยนสถานะการแสดงเหรียญได้",
      });
    }
  };

  const getCareerAcceptedSkillCategories = (careerCategory: string) => {
    switch (careerCategory) {
      case "Frontend":
      case "Frontend Developer":
        return ["Frontend", "Design"];

      case "Backend":
      case "Backend Developer":
        return ["Backend", "Database", "DevOps"];

      case "Full Stack":
      case "Full Stack Developer":
        return ["Frontend", "Backend", "Database", "DevOps", "Programming"];

      case "Mobile":
      case "Mobile Developer":
        return ["Mobile", "Frontend", "Programming"];

      case "Data/AI":
      case "Data":
      case "AI":
        return ["Data/AI", "AI/Automation", "Database", "Programming"];

      case "DevOps":
      case "DevOps Engineer":
        return ["DevOps", "Tools", "Backend"];

      case "Design":
      case "UI/UX":
        return ["Design", "Frontend"];

      default:
        return [careerCategory];
    }
  };

  const isCareerMatchedBySkillCategory = ({
    careerCategory,
    skillCategories,
  }: {
    careerCategory: string;
    skillCategories: string[];
  }) => {
    const acceptedCategories = getCareerAcceptedSkillCategories(careerCategory);
    const categories = skillCategories
      .map((item) => item?.trim())
      .filter(Boolean);

    if (!careerCategory || careerCategory === "Other") return false;

    return categories.some((category) => acceptedCategories.includes(category));
  };

  const calculateCareerAlignment = (career: CareerExperienceForm) => {
    const relatedSkills = career.relatedSkills ?? [];

    if (!career.careerCategory || relatedSkills.length === 0) {
      return {
        score: 0,
        isAligned: false,
        reason: "ยังไม่มีข้อมูลสายงานหรือทักษะที่เกี่ยวข้องเพียงพอ",
      };
    }

    let matchedWeight = 0;
    let totalWeight = 0;

    relatedSkills.forEach((skill) => {
      const level = Number(skill.level ?? 1);
      const years = Number(skill.yearsExperience ?? 0);
      const relevance = Number(skill.relevanceScore ?? 1);

      const primaryBonus = skill.isPrimary ? 1.5 : 1;
      const yearsBonus =
        years >= 5 ? 1.5 : years >= 3 ? 1.25 : years >= 1 ? 1.1 : 1;

      const weight = Math.max(1, level) * primaryBonus * yearsBonus * relevance;

      totalWeight += weight;

      const matched = isCareerMatchedBySkillCategory({
        careerCategory: career.careerCategory,
        skillCategories: [skill.selectedCategory],
      });

      if (matched) matchedWeight += weight;
    });

    const score =
      totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;

    const isAligned = score >= 60;

    return {
      score,
      isAligned,
      reason: isAligned
        ? `ทักษะที่เลือกสอดคล้องกับสาย ${career.careerCategory} ${score}%`
        : `ทักษะที่เลือกสอดคล้องกับสาย ${career.careerCategory} เพียง ${score}%`,
    };
  };

  const toggleCareerRelatedSkill = (careerIndex: number, skill: SkillForm) => {
    setFormData((prev) => ({
      ...prev,
      careerExperiences: prev.careerExperiences.map((career, index) => {
        if (index !== careerIndex) return career;

        const skillId = skill.id;
        if (!skillId) return career;

        const exists = career.relatedSkills.some(
          (item) => item.userSkillId === skillId,
        );

        const nextRelatedSkills = exists
          ? career.relatedSkills.filter((item) => item.userSkillId !== skillId)
          : [
              ...career.relatedSkills,
              {
                userSkillId: skillId,
                skillName: skill.name,
                selectedCategory: skill.category || "Other",
                level: Number(skill.level ?? 1),
                yearsExperience: Number(skill.yearsExperience ?? 0),
                isPrimary: !!skill.isPrimary,
                relevanceScore: 1,
              },
            ];

        const nextCareer = {
          ...career,
          relatedSkills: nextRelatedSkills,
        };

        const result = calculateCareerAlignment(nextCareer);

        return {
          ...nextCareer,
          alignmentScore: result.score,
          isAligned: result.isAligned,
          alignmentReason: result.reason,
        };
      }),
    }));
  };

  const updateCareerCategory = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      careerExperiences: prev.careerExperiences.map((career, i) => {
        if (i !== index) return career;

        const nextCareer = {
          ...career,
          careerCategory: value,
        };

        const result = calculateCareerAlignment(nextCareer);

        return {
          ...nextCareer,
          alignmentScore: result.score,
          isAligned: result.isAligned,
          alignmentReason: result.reason,
        };
      }),
    }));
  };

  const updateCareerLevel = (index: number, value: string) => {
    updateCareerField(
      index,
      "careerLevel" as keyof CareerExperienceForm,
      value,
    );
  };

  const updatePrivacyField = <K extends keyof ProfilePrivacyForm>(
    field: K,
    value: ProfilePrivacyForm[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value,
      },
    }));
  };

  const handleCancelEdit = async () => {
    setIsEditing(false);
    setInterestInput("");

    if (formData.avatar?.startsWith("blob:")) {
      URL.revokeObjectURL(formData.avatar);
    }

    setAvatarFile(null);

    await loadProfile();
  };

  const handleSave = async () => {
    if (!user?.id || saving) return;

    setSaving(true);

    try {
      let avatarUrl = formData.avatar;

      if (avatarFile) {
        setIsUploadingAvatar(true);
        avatarUrl = await uploadAvatar(user.id, avatarFile);
        setIsUploadingAvatar(false);
      }

      const normalizedCareerExperiences = formData.careerExperiences.map((career) => {
        const result = calculateCareerAlignment(career);

        return {
          ...career,
          alignmentScore: result.score,
          isAligned: result.isAligned,
          alignmentReason: result.reason,
        };
      });

      const payload = {
        ...formData,
        avatar: avatarUrl,
        careerExperiences: normalizedCareerExperiences,
        interests: formData.interests,
      };

      // console.log("SAVE PAYLOAD EDUCATIONS:", payload.educations);
      // console.log("SAVE PAYLOAD SKILLS:", payload.skills);
      // console.log("SAVE PAYLOAD CAREER:", payload.careerExperiences);
      // console.log("SAVE PAYLOAD ACHIEVEMENTS:", payload.achievements);

      const newCompletion = await saveFullProfile(user.id, payload);

      await loadProfile();

      updateProfile({
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
        bio: payload.bio,
        company: payload.company,
        position: payload.position,
        location: payload.location,
        work: payload.work,
        linkedin: payload.linkedin,
        github: payload.github,
        lineID: payload.lineID,
        website: payload.website,
        avatar: payload.avatar,

        address: {
          houseNo: payload.address.houseNo,
          subDistrict: payload.address.subDistrict,
          district: payload.address.district,
          province: payload.address.province,
          postalCode: payload.address.postalCode,
        },

        educations: payload.educations.map((edu) => ({
          id: edu.id,
          university: edu.university,
          degree: edu.degree,
          faculty: edu.faculty,
          major: edu.major,
          admissionYear: edu.admissionYear
            ? Number(edu.admissionYear)
            : undefined,
          graduationYear: edu.graduationYear
            ? Number(edu.graduationYear)
            : undefined,
          gpa: edu.gpa,
          honors: edu.honors,
          isCurrent: edu.isCurrent,
          description: edu.description,
          displayOrder: edu.displayOrder,
          isPrimary: edu.isPrimary,
        })),
        skills: payload.skills,
        careerExperiences: payload.careerExperiences,
        achievements: payload.achievements,
        profileCompletion: newCompletion,
        lastUpdated: new Date(),
      });

      setAvatarFile(null);
      setIsEditing(false);

      toast({
        title: "บันทึกสำเร็จ",
        description: "ข้อมูลของคุณถูกอัปเดทแล้ว",
      });
    } catch (err: any) {
      console.error("UPDATE PROFILE ERROR:", {
        message: err?.message,
        datails: err?.details,
        hint: err?.hint,
        code: err?.code,
        raw: err,
      });

      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: 
          err?.message || "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setSaving(false);
      setIsUploadingAvatar(false);
    }
  };

  const getRoleColor = () => {
    const role = user?.role;

    switch (role) {
      case "admin":
        return "bg-admin text-admin-foreground";
      case "alumni":
        return "bg-alumni text-alumni-foreground";
      case "student":
        return "bg-student text-student-foreground";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  const getRoleLabel = () => {
    const role = user?.role;

    switch (role) {
      case "admin":
        return "Admin";
      case "alumni":
        return "ศิษย์เก่า";
      case "student":
        return "นักศึกษา";
      default:
        return role || "";
    }
  };

  const topSkills = [...formData.skills]
    .sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      if (b.level !== a.level) return b.level - a.level;
      return b.yearsExperience - a.yearsExperience;
    })
    .slice(0, 4);

  const loadProfile = async () => {
    if (!user?.id) return;

    try {
      const [
        profileRes,
        addressRes,
        educationsRes,
        userSkillsRes,
        careerRes,
        achievementsRes,
        badgesRes,
        interestsRes,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            `
            id,
            first_name,
            last_name,
            email,
            phone,
            bio,
            company,
            position,
            location,
            work,
            linkedin,
            github,
            line_id,
            website,
            avatar_url,
            profile_visibility,
            show_email,
            show_phone,
            show_location,
            show_linkedin,
            show_website
          `,
          )
          .eq("id", user.id)
          .single(),

        supabase
          .from("addresses")
          .select(
            `
            house_no,
            sub_district,
            district,
            province,
            postal_code
          `,
          )
          .eq("user_id", user.id)
          .maybeSingle(),

        supabase
          .from("educations")
          .select(
            `
            id,
            university,
            degree,
            faculty,
            major,
            admission_year,
            graduation_year,
            gpa,
            honors,
            is_current,
            description,
            display_order,
            is_primary
          `,
          )
          .eq("user_id", user.id)
          .order("display_order", { ascending: true }),

        supabase
          .from("user_skills")
          .select(
            `
            id,
            level,
            years_experience,
            is_primary,
            verified,
            display_order,
            selected_category,
            skills (
              id,
              name,
              category
            )
          `,
          )
          .eq("user_id", user.id)
          .order("display_order", { ascending: true }),

        supabase
          .from("career_experiences")
          .select(
            `
            id,
            company,
            position,
            employment_type,
            location,
            work_mode,
            start_date,
            end_date,
            is_current,
            description,
            achievements,
            display_order,
            career_category,
            career_level,
            alignment_score,
            is_aligned,
            alignment_reason,
            career_experience_skills (
              id,
              relevance_score,
              user_skills (
                id,
                level,
                years_experience,
                is_primary,
                selected_category,
                skills (
                  id,
                  name,
                  category
                )
              )
            )
          `,
          )
          .eq("user_id", user.id)
          .order("display_order", { ascending: true }),

        supabase
          .from("user_achievements")
          .select(
            `
            id,
            title,
            issuer,
            achievement_date,
            description,
            url,
            achievement_type,
            is_featured,
            display_order
          `,
          )
          .eq("user_id", user.id)
          .order("display_order", { ascending: true }),

        supabase
          .from("user_badges")
          .select(
            `
            id,
            badge_id,
            awarded_at,
            source,
            show_on_profile,
            is_pinned,
            display_order,
            badge_definitions (
              id,
              code,
              name,
              description,
              icon,
              color,
              rule_type,
              badge_group,
              tier_level,
              points,
              rarity,
              display_order
            )
          `,
          )
          .eq("user_id", user.id)
          .order("awarded_at", { ascending: false }),

        supabase
          .from("user_interests")
          .select(
            `
            id,
            display_order,
            interest_tags (
              id,
              name,
              slug,
              category
            )
          `,
          )
          .eq("user_id", user.id)
          .order("display_order", { ascending: true }),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (addressRes.error) throw addressRes.error;
      if (educationsRes.error) throw educationsRes.error;
      if (userSkillsRes.error) throw userSkillsRes.error;
      if (careerRes.error) throw careerRes.error;
      if (achievementsRes.error) throw achievementsRes.error;
      if (badgesRes.error) throw badgesRes.error;
      if (interestsRes.error) throw interestsRes.error;

      const profile = profileRes.data;
      const address = addressRes.data;
      const interests = interestsRes.data ?? [];
      const educations = educationsRes.data ?? [];
      const userSkills = userSkillsRes.data ?? [];
      const careerExperiences = careerRes.data ?? [];
      const achievements = achievementsRes.data ?? [];
      const badgeRows = badgesRes.data ?? [];
      setEarnedBadges(badgeRows);

      setFormData((prev) => ({
        ...prev,
        firstName: profile?.first_name || "",
        lastName: profile?.last_name || "",
        email: profile?.email || "",
        phone: profile?.phone || "",
        bio: profile?.bio || "",
        company: profile?.company || "",
        position: profile?.position || "",
        location: profile?.location || "",
        work: profile?.work || "",
        linkedin: profile?.linkedin || "",
        github: profile?.github || "",
        lineID: profile?.line_id || "",
        website: profile?.website || "",
        avatar: profile?.avatar_url || "",

        privacy: {
          profileVisibility: 
            (profile?.profile_visibility as ProfileVisibility) ?? "members",
          showEmail: Boolean(profile?.show_email),
          showPhone: Boolean(profile?.show_phone),
          showLocation: profile?.show_location !== false,
          showLinkedin: profile?.show_linkedin !== false,
          showWebsite: profile?.show_website !== false,
        },

        address: {
          houseNo: address?.house_no || "",
          subDistrict: address?.sub_district || "",
          district: address?.district || "",
          province: address?.province || "",
          postalCode: address?.postal_code || "",
        },

        interests: interests.map((item: any, index: number) => ({
          id: item.id,
          tagId: item.interest_tags?.id,
          name: item.interest_tags?.name || "",
          slug: item.interest_tags?.slug || "",
          category: item.interest_tags?.category ?? null,
          displayOrder: item.display_order ?? index,
        }))
        .filter((item: any) => !!item.tagId),

        educations: educations.map((edu: any, index: number) => ({
          id: edu.id,
          university: edu.university || "",
          degree: edu.degree || "",
          faculty: edu.faculty || "",
          major: edu.major || "",
          admissionYear: edu.admission_year?.toString() || "",
          graduationYear: edu.graduation_year?.toString() || "",
          gpa: edu.gpa?.toString() || "",
          honors: edu.honors || "",
          isCurrent: !!edu.is_current,
          description: edu.description || "",
          displayOrder: edu.display_order ?? index,
          isPrimary: !!edu.is_primary,
        })),

        skills: userSkills.map((item: any, index: number) => ({
          id: item.id,
          skillId: item.skills?.id,
          name: item.skills?.name || "",
          category: item.selected_category || item.skills?.category || "Other",
          level: item.level ?? 3,
          yearsExperience: Number(item.years_experience ?? 0),
          isPrimary: !!item.is_primary,
          verified: !!item.verified,
          displayOrder: item.display_order ?? index,
        })),

        careerExperiences: careerExperiences.map(
          (item: any, index: number) => ({
            id: item.id,
            company: item.company || "",
            position: item.position || "",
            employmentType: item.employment_type || "",
            location: item.location || "",
            workMode: item.work_mode || "",
            startDate: item.start_date || "",
            endDate: item.end_date || "",
            isCurrent: !!item.is_current,
            description: item.description || "",
            achievements: item.achievements || "",
            displayOrder: item.display_order ?? index,

            careerCategory: item.career_category || "",
            careerLevel: item.career_level || "",
            alignmentScore: Number(item.alignment_score ?? 0),
            isAligned: !!item.is_aligned,
            alignmentReason: item.alignment_reason || "",
            relatedSkills: (item.career_experience_skills ?? [])
              .map((rel: any) => {
                const us = rel.user_skills;

                return {
                  userSkillId: us?.id,
                  skillName: us?.skills?.name || "",
                  selectedCategory:
                    us?.selected_category || us?.skills?.category || "Other",
                  level: Number(us?.level ?? 1),
                  yearsExperience: Number(us?.years_experience ?? 0),
                  isPrimary: !!us?.is_primary,
                  relevanceScore: Number(rel?.relevance_score ?? 1),
                };
              })
              .filter((skill: any) => !!skill.userSkillId),
          }),
        ),

        achievements: achievements.map((item: any, index: number) => ({
          id: item.id,
          title: item.title || "",
          issuer: item.issuer || "",
          achievementDate: item.achievement_date || "",
          description: item.description || "",
          url: item.url || "",
          achievementType: item.achievement_type || "",
          isFeatured: !!item.is_featured,
          displayOrder: item.display_order ?? index,
        })),
      }));
    } catch (error: any) {
      console.error(
        "LOAD PROFILE ERROR:",
        error.message,
        error.details,
        error.hint,
      );

      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลได้",
      });
    }
  };

  useEffect(() => {
    loadCareerCategories();
    loadInterestTags();
  }, []);

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  if (!user) return null;

  // แสดงแค่การศึกษาหลัก 1 อัน
  const setPrimaryEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      educations: prev.educations.map((edu, i) => ({
        ...edu,
        isPrimary: i === index,
      })),
    }));
  };

  const primaryEducation =
    formData.educations.find((edu) => edu.isPrimary) ||
    formData.educations[0] ||
    null;

  // const featuredAchievements = formData.achievements.filter((a) => a.isFeatured);
  // const normalAchievements = formData.achievements.filter((a) => !a.isFeatured);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Profile Header */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary/80 to-accent/60" />
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
              <div className="relative group shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-md scale-110" />

                <Avatar className="relative w-28 h-28 ring-4 ring-background shadow-xl border border-white/30 bg-muted">
                  <AvatarImage
                    src={formData.avatar || user.avatar || ""}
                    alt={formData.firstName || user.firstName}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl font-semibold bg-muted text-foreground">
                    {(formData.firstName || user.firstName || "U").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                {isEditing && (
                  <>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute inset-0 rounded-full bg-black/50 text-white flex flex-col items-center justify-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>เปลี่ยนรูป</span>
                    </label>

                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        if (!file.type.startsWith("image/")) {
                          toast({
                            variant: "destructive",
                            title: "ไฟล์ไม่ถูกต้อง",
                            description: "กรุุณาเลือกไฟล์รูปภาพเท่านั้น",
                          });
                          return;
                        }

                        if (selectedImageUrl) {
                          URL.revokeObjectURL(selectedImageUrl);
                        }

                        const objectUrl = URL.createObjectURL(file);

                        setImageSrc(objectUrl);
                        setSelectedImageUrl(objectUrl);
                        setCrop({ x: 0, y: 0 });
                        setZoom(1);
                        setIsImageLoaded(false);
                        setCropModalOpen(true);

                        e.target.value = "";
                      }}
                    />
                  </>
                )}

                {user.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-success rounded-full flex items-center justify-center ring-4 ring-background">
                    <CheckCircle className="w-5 h-5 text-success-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold">
                        {formData.firstName || user.firstName}
                      </h1>
                      <Badge className={getRoleColor()}>{getRoleLabel()}</Badge>
                      {user.isActive && (
                        <Badge
                          variant="outline"
                          className="border-success text-success"
                        >
                          Active
                        </Badge>
                      )}
                    </div>
                    {topSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {topSkills.map((skill, index) => (
                          <Badge
                            key={`top-skill-${skill.id ?? skill.skillId ?? skill.name ?? index}`}
                            variant="secondary"
                            className="rounded-full"
                          >
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    แก้ไขโปรไฟล์
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile Completion */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">ความสมบูรณ์ของโปรไฟล์</span>
              <span className="text-sm font-bold">
                {user.profileCompletion}%
              </span>
            </div>
            <Progress value={user.profileCompletion} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              เพิ่มข้อมูลเพื่อให้โปรไฟล์สมบูรณ์ 100% และเพิ่มโอกาสในการถูกค้นพบ
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">ข้อมูลส่วนตัว</TabsTrigger>
          <TabsTrigger value="skill">ทักษะ</TabsTrigger>
          <TabsTrigger value="career">เส้นทางอาชีพ</TabsTrigger>
          <TabsTrigger value="achievements">ความสำเร็จ</TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <AnimatePresence initial={false}>
          {activeTab === "info" && (
            <motion.div
              key="info"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid md:grid-cols-2 gap-6"
            >
              {/* Basic info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    ข้อมูลพื้นฐาน
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* ================= Personal Name ================= */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ชื่อ</Label>
                      {isEditing ? (
                        <Input
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="text-sm">{formData.firstName || "-"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>นามสกุล</Label>
                      {isEditing ? (
                        <Input
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="text-sm">{formData.lastName || "-"}</p>
                      )}
                    </div>
                  </div>

                  {/* ================= Contact ================= */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>อีเมล</Label>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        {formData.email}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>เบอร์โทรศัพท์</Label>
                      {isEditing ? (
                        <Input
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              phone: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {formData.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ================= Address ================= */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 font-semibold">
                      <MapPin className="w-4 h-4" />
                      ที่อยู่
                    </div>

                    {/* House */}
                    <div className="space-y-2">
                      <Label>บ้านเลขที่</Label>
                      {isEditing ? (
                        <Input
                          value={formData.address.houseNo}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: {
                                ...formData.address,
                                houseNo: e.target.value,
                              },
                            })
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-sm">
                          <House className="w-4 h-4 text-muted-foreground" />
                          {formData.address.houseNo || "-"}
                        </div>
                      )}
                    </div>

                    {/* Sub District + District */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>ตำบล / แขวง</Label>
                        {isEditing ? (
                          <Input
                            value={formData.address.subDistrict}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                address: {
                                  ...formData.address,
                                  subDistrict: e.target.value,
                                },
                              })
                            }
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            {formData.address.subDistrict || "-"}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>อำเภอ / เขต</Label>
                        {isEditing ? (
                          <Input
                            value={formData.address.district}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                address: {
                                  ...formData.address,
                                  district: e.target.value,
                                },
                              })
                            }
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            {formData.address.district || "-"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Province + Postal */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>จังหวัด</Label>
                        {isEditing ? (
                          <Input
                            value={formData.address.province}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                address: {
                                  ...formData.address,
                                  province: e.target.value,
                                },
                              })
                            }
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm">
                            <Map className="w-4 h-4 text-muted-foreground" />
                            {formData.address.province || "-"}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>รหัสไปรษณีย์</Label>
                        {isEditing ? (
                          <Input
                            value={formData.address.postalCode}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                address: {
                                  ...formData.address,
                                  postalCode: e.target.value,
                                },
                              })
                            }
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm">
                            <Mailbox className="w-4 h-4 text-muted-foreground" />
                            {formData.address.postalCode || "-"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ================= Bio ================= */}
                  <div className="space-y-2">
                    <Label>แนะนำตัว</Label>
                    {isEditing ? (
                      <Textarea
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {formData.bio}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label>ความสนใจ</Label>
                      <p className="mt-1 text-xs text-muted-foreground">
                        เลือกหัวข้อที่คุณสนใจ เพื่อให้รุ่นพี่/รุ่นน้องค้นหาและเชื่อมต่อกับคุณได้ง่ายขึ้น
                      </p>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {formData.interests.length > 0 ? (
                            formData.interests.map((interest) => (
                              <Badge
                                key={interest.tagId}
                                variant="secondary"
                                className="rounded-full px-3 py-1"
                              >
                                {interest.name}
                                <button
                                  type="button"
                                  onClick={() => removeInterest(interest.tagId)}
                                  className="ml-2 text-muted-foreground hover:text-destructive"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              ยังไม่มีความสนใจ
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Input 
                            value={interestInput}
                            onChange={(e) => setInterestInput(e.target.value)}
                            placeholder="ค้นหาหรือเพิ่มความสนใจ เช่น AI, Startup, Mentoring"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addCustomInterest();
                              }
                            }}
                          />

                          <Button type="button" variant="outline" onClick={addCustomInterest}>
                            เพิ่ม
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {interestTags
                            .filter((tag) => {
                              const keyword = interestInput.trim().toLowerCase();
                              const alreadySelected = formData.interests.some(
                                (item) => item.tagId === tag.id,
                              );

                              if (alreadySelected) return false;
                              if (!keyword) return true;

                              return tag.name.toLowerCase().includes(keyword);
                            })
                            .slice(0, 12)
                            .map((tag) => (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => addInterest(tag)}
                                className="rounded-full border px-3 py-1.5 text-sm transition hover:bg-muted"
                              >
                                {tag.name}
                              </button>
                            ))}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          แนะนำให้เลือก 3–10 รายการ เช่น Mentoring, Frontend, Career Advice, Startup
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {formData.interests.length > 0 ? (
                          formData.interests.map((interest) => (
                            <Badge
                              key={interest.tagId}
                              variant="outline"
                              className="rounded-full px-3 py-1"
                            >
                              {interest.name}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            -
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Education & Work */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    การศึกษาและอาชีพ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>ประวัติการศึกษา</Label>
                      {isEditing && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addEducation}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          เพิ่มวุฒิการศึกษา
                        </Button>
                      )}
                    </div>

                    {!isEditing && !primaryEducation && (
                      <p className="text-sm text-muted-foreground">-</p>
                    )}

                    {isEditing
                      ? formData.educations.map((edu, index) => (
                          <Card
                            key={`edu-${edu.id ?? edu.university ?? index}`}
                          >
                            <CardContent className="space-y-4 pt-4">
                              <div className="flex justify-between items-center">
                                <Badge
                                  variant={
                                    edu.isPrimary ? "default" : "secondary"
                                  }
                                >
                                  {edu.isPrimary
                                    ? "แสดงบนหน้าโปรไฟล์"
                                    : "ไม่แสดงบนหน้าโปรไฟล์"}
                                </Badge>

                                {!edu.isPrimary && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPrimaryEducation(index)}
                                  >
                                    ตั้งเป็นราบการหลัก
                                  </Button>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>มหาวิทยาลัย</Label>
                                  <Input
                                    value={edu.university}
                                    onChange={(e) =>
                                      updateEducationField(
                                        index,
                                        "university",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>ระดับการศึกษา</Label>
                                  <Input
                                    value={edu.degree}
                                    onChange={(e) =>
                                      updateEducationField(
                                        index,
                                        "degree",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>คณะ</Label>
                                  <Input
                                    value={edu.faculty}
                                    onChange={(e) =>
                                      updateEducationField(
                                        index,
                                        "faculty",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>สาขา</Label>
                                  <Input
                                    value={edu.major}
                                    onChange={(e) =>
                                      updateEducationField(
                                        index,
                                        "major",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>ปีที่เข้าศึกษา</Label>
                                  <Input
                                    value={edu.admissionYear}
                                    onChange={(e) =>
                                      updateEducationField(
                                        index,
                                        "admissionYear",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>ปีที่จบการศึกษา</Label>
                                  <Input
                                    value={edu.graduationYear}
                                    onChange={(e) =>
                                      updateEducationField(
                                        index,
                                        "graduationYear",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>เกรดเฉลี่ย</Label>
                                  <Input
                                    value={edu.gpa}
                                    onChange={(e) =>
                                      updateEducationField(
                                        index,
                                        "gpa",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>เกียรตินิยม</Label>
                                  <select
                                    className="w-full border rounded-md px-3 py-2"
                                    value={edu.honors}
                                    onChange={(e) =>
                                      updateEducationField(
                                        index,
                                        "honors",
                                        e.target.value,
                                      )
                                    }
                                  >
                                    <option value="">ไม่มี</option>
                                    <option value="เกียรตินิยมอันดับหนึ่ง">
                                      เกียรตินิยมอันดับหนึ่ง
                                    </option>
                                    <option value="เกียรตินิยมอันดับสอง">
                                      เกียรตินิยมอันดับสอง
                                    </option>
                                  </select>
                                </div>
                              </div>

                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  variant="destructive"
                                  onClick={() => removeEducation(index)}
                                >
                                  ลบรายการนี้
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      : primaryEducation && (
                          <Card
                            key={primaryEducation.id || "primary-education"}
                          >
                            <CardContent className="space-y-4 pt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>มหาวิทยาลัย</Label>
                                  <p className="text-sm">
                                    {primaryEducation.university || "-"}
                                  </p>
                                </div>

                                <div>
                                  <Label>ระดับการศึกษา</Label>
                                  <p className="text-sm">
                                    {primaryEducation.degree || "-"}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>คณะ</Label>
                                  <p className="text-sm">
                                    {primaryEducation.faculty || "-"}
                                  </p>
                                </div>

                                <div>
                                  <Label>สาขา</Label>
                                  <p className="text-sm">
                                    {primaryEducation.major || "-"}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>ปีที่เข้าศึกษา</Label>
                                  <p className="text-sm">
                                    {primaryEducation.admissionYear || "-"}
                                  </p>
                                </div>

                                <div>
                                  <Label>ปีที่จบการศึกษา</Label>
                                  <p className="text-sm">
                                    {primaryEducation.graduationYear || "-"}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>เกรดเฉลี่ย</Label>
                                  <p className="text-sm">
                                    {primaryEducation.gpa || "-"}
                                  </p>
                                </div>

                                <div>
                                  <Label>เกียรตินิยม</Label>
                                  <p className="text-sm">
                                    {primaryEducation.honors || "-"}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">บริษัท / องค์กร</Label>
                    {isEditing ? (
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            company: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        {formData.company || "-"}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="position">ตำแหน่ง</Label>
                      {isEditing ? (
                        <Input
                          id="position"
                          value={formData.position}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              position: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="w-4 h-4 text-muted-foreground" />
                          {formData.position || "-"}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="work">อาชีพ</Label>
                      {isEditing ? (
                        <Input
                          id="work"
                          value={formData.work}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              work: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="w-4 h-4 text-muted-foreground" />
                          {formData.work || "-"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">ที่อยู่ปัจจุบัน</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            location: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {formData.location}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    ลิงก์โซเชียล
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      {isEditing ? (
                        <Input
                          id="linkedin"
                          value={formData.linkedin}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              linkedin: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-sm">
                          <Linkedin className="w-4 h-4 text-muted-foreground" />
                          {formData.linkedin}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="github">Github</Label>
                      {isEditing ? (
                        <Input
                          id="github"
                          value={formData.github}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              github: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-sm">
                          <Github className="w-4 h-4 text-muted-foreground" />
                          {formData.github}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lineid">LineID</Label>
                      {isEditing ? (
                        <Input
                          id="lineid"
                          value={formData.lineID}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lineID: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-sm">
                          <FaLine className="w-4 h-4 text-muted-foreground" />
                          {formData.lineID}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">เว็บไซต์</Label>
                      {isEditing ? (
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              website: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          {formData.website}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    ความเป็นส่วนตัวของโปรไฟล์
                  </CardTitle>

                  <CardDescription>
                    เลือกว่าผู้ใช้อื่นสามารถมองเห็นโปรไฟล์และข้อมูลใดของคุณได้บ้าง
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>การมองเห็นโปรไฟล์</Label>

                    {isEditing ? (
                      <Select
                        value={formData.privacy.profileVisibility}
                        onValueChange={(value) =>
                          updatePrivacyField("profileVisibility", value as ProfileVisibility,)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="การมองเห็นโปรไฟล์" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="public">
                            สาธารณะ
                          </SelectItem>

                          <SelectItem value="members">
                            เฉพาะสมาชิกในระบบ
                          </SelectItem>

                          <SelectItem value="private">
                            เฉพาะคุณ
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="rounded-lg border bg-muted/30 p-3">
                        <p className="text-sm font-medium">
                          {getProfileVisibilityLabel(
                            formData.privacy.profileVisibility,
                          )}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      {getProfileVisibilityDescription(
                        formData.privacy.profileVisibility,
                      )}
                    </p>
                  </div>

                  <div className="border-t pt-5 space-y-5">
                    <PrivacyToggle 
                      label="แสดงอีเมล"
                      description="อนุญาติให้ผู้ที่ดูโปรไฟล์เห็นอีเมลของคุณ"
                      checked={formData.privacy.showEmail}
                      disabled={!isEditing}
                      onCheckedChange={(checked) =>
                        updatePrivacyField("showEmail", checked)
                      }
                    />

                    <PrivacyToggle 
                      label="แสดงเบอร์โทรศัพท์"
                      description="อนุญาตให้ผู้ที่ดูโปรไฟล์เห็นเบอร์โทรศัพท์ของคุณ"
                      checked={formData.privacy.showPhone}
                      disabled={!isEditing}
                      onCheckedChange={(checked) =>
                        updatePrivacyField("showPhone", checked)
                      }
                    />

                    {/* <PrivacyToggle 
                      label="แสดงตำแหน่งที่ตั้ง"
                      description="แสดงเฉพาะสถานที่ทำงานของคุณ"
                      checked={formData.privacy.showLocation}
                      disabled={!isEditing}
                      onCheckedChange={(checked) =>
                        updatePrivacyField("showLocation", checked)
                      }
                    /> */}

                    {/* <PrivacyToggle 
                      label="แสดง LinkedIn"
                      description="แสดงลิงก์ LinkedIn บนหน้าโปรไฟล์สาธารณะ"
                      checked={formData.privacy.showLinkedin}
                      disabled={!isEditing}
                      onCheckedChange={(checked) =>
                        updatePrivacyField("showLinkedin", checked)
                      }
                    /> */}

                    {/* <PrivacyToggle 
                      label="แสดงเว็บไซต์"
                      description="แสดงเว็บไซต์หรือ Portfolio บนหน้าโปรไฟล์สาธารณะ"
                      checked={formData.privacy.showWebsite}
                      disabled={!isEditing}
                      onCheckedChange={(checked) =>
                        updatePrivacyField("showWebsite", checked)
                      }
                    /> */}
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      ข้อมูลที่อยู่แบบละเอียดจะไม่แสดงบนโปรไฟล์สาธารณะ
                    </p>

                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                      บ้านเลขที่ แขวง/ตำบล เขต/อำเภอ และรหัสไปรษณีย์จะใช้ภายในระบบเท่านั้น
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Skill Tab */}
          {activeTab === "skill" && (
            <motion.div
              key="skil"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold">ทักษะของคุณ</h2>
                      <p className="text-sm text-muted-foreground">
                        {" "}
                        ระบุทักษะที่เกี่ยวข้องกับสายงานของคุณ
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <SkillsInput
                    value={formData.skills}
                    isEditing={isEditing}
                    onChange={(skills) =>
                      setFormData({
                        ...formData,
                        skills,
                      })
                    }
                  />
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-primary">
                    <TrendingUp className="w-5 h-5" /> ทักษะความเชี่ยวชาญ
                  </CardTitle>
                  <CardDescription>
                    ระบบวิเคราะห์และจัดอันดับทักษะของคุณ
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <SkillTab />
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {/* Career Timeline Tab */}
          {activeTab === "career" && (
            <motion.div
              key="career"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Card className="border-none shadow-sm md:col-span-2">
                <CardContent className="p-6">
                  <CareerTimelineTab 
                    isEditing={isEditing}
                    careers={formData.careerExperiences}
                    skills={formData.skills}
                    careerCategories={careerCategories}
                    onAddCareer={addCareerExperience}
                    onRemoveCareer={removeCareerExperience}
                    onUpdateCareerField={updateCareerField}
                    onUpdateCareerCategory={updateCareerCategory}
                    onUpdateCareerLevel={updateCareerLevel}
                    onToggleCareerRelatedSkill={toggleCareerRelatedSkill}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Achievements Tab */}
          {activeTab === "achievements" && (
            <motion.div
              key="achievements"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Card className="border-none shadow-sm md:col-span-2">
                <CardContent className="p-6">
                  <AchievementsTab 
                    isEditing={isEditing}
                    earnedBadges={earnedBadges}
                    achievements={formData.achievements}
                    onAddAchievement={addAchievement}
                    onRemoveAchievement={removeAchievement}
                    onUpdateAchievementField={updateAchievementField}
                    onUpdateBadgeDisplay={updateBadgeDisplay}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>

      {isEditing && (
        <div className="md:col-span-2 flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
            ยกเลิก
          </Button>

          <Button onClick={handleSave} disabled={saving || isUploadingAvatar}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isUploadingAvatar ? "กำลังอัปโหลดรูป..." : "กำลังบันทึก..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                บันทึกการเปลี่ยนแปลง
              </>
            )}
          </Button>
        </div>
      )}

      {/* Last Updated */}
      <motion.div variants={itemVariants}>
        <p className="text-center text-sm text-muted-foreground">
          <Clock className="w-4 h-4 inline mr-1" />
          อัปเดตล่าสุด:{" "}
          {user.lastUpdated.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </motion.div>

      {mounted &&
        cropModalOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: 0.2 }}
                className="bg-background rounded-2xl w-full max-w-2xl shadow-2xl border overflow-hidden"
              >
                <div className="px-5 py-4 border-b flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">ปรับรูปโปรไฟล์</h3>
                    <p className="text-sm text-muted-foreground">
                      เลือกตำแหน่งรูปที่ต้องการให้แสดง
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseCropModal}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="p-5 space-y-5">
                  <div className="grid md:grid-cols-[1fr_220px] gap-5">
                    <div className="relative w-full h-80 bg-black rounded-2xl overflow-hidden">
                      {!isImageLoaded && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        </div>
                      )}

                      <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        onMediaLoaded={() => setIsImageLoaded(true)}
                      />
                    </div>

                    {!imageSrc && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center text-white text-sm">
                        ไม่พบ source ของรูป
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">ตัวอย่าง</Label>
                        <div className="mt-2 flex justify-center">
                          <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-border bg-muted">
                            <img
                              src={imageSrc}
                              alt="Avatar preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <ZoomIn className="w-4 h-4" />
                          ซูม
                        </Label>
                        <input
                          type="range"
                          min={1}
                          max={3}
                          step={0.01}
                          value={zoom}
                          onChange={(e) => setZoom(Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-xs text-muted-foreground">
                          ปรับขนาดภาพให้พอดีกับกรอบวงกลม
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 border-t flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCloseCropModal}
                    disabled={isCropping}
                  >
                    ยกเลิก
                  </Button>
                  <Button onClick={handleCropConfirm} disabled={isCropping}>
                    {isCropping ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        กำลังประมวลผล...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        ใช้รูปนี้
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )}
    </motion.div>
  );
}

function PrivacyToggle({
  label,
  description,
  checked,
  disabled = false,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">
          {label}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      </div>

      <Switch 
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-label={label}
        className="shrink-0"
      />
    </div>
  );
}