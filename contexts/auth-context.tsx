"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { supabase } from "@/lib/supabase/client";
import type { SkillForm } from "@/components/Skills/skillform";
import Swal from "sweetalert2";

const SESSION_MAX_AGE_MS = 60 * 60 * 1000;
const SESSION_STORAGE_PREFIX = "alumni_session_timeout";

type SessionTimeoutMeta = {
  userId: string;
  startedAt: number;
  expiresAt: number;
};

function getSessionStorageKey(userId: string) {
  return `${SESSION_STORAGE_PREFIX}:${userId}`;
}

function createSessionTimeoutMeta(userId: string): SessionTimeoutMeta {
  const startedAt = Date.now();

  return {
    userId,
    startedAt,
    expiresAt: startedAt + SESSION_MAX_AGE_MS,
  };
}

function saveSessionTimeoutMeta(meta: SessionTimeoutMeta) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    getSessionStorageKey(meta.userId),
    JSON.stringify(meta),
  );
}

function getSessionTimeoutMeta(userId: string): SessionTimeoutMeta | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(getSessionStorageKey(userId));

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SessionTimeoutMeta;

    if (!parsed?.userId || !parsed?.expiresAt) return null;

    return parsed;
  } catch {
    return null;
  }
}

function clearSessionTimeoutMeta(userId?: string) {
  if (typeof window === "undefined") return;

  if (userId) {
    window.localStorage.removeItem(getSessionStorageKey(userId));
    return;
  }

  Object.keys(window.localStorage).forEach((key) => {
    if (key.startsWith(`SESSION_STORAGE_PREFIX:`)) {
      window.localStorage.removeItem(key);
    }
  });
}

function getSessionRemainingMs(userId: string) {
  const meta = getSessionTimeoutMeta(userId);

  if (!meta) return 0;

  return meta.expiresAt - Date.now();
}

function ensureSessionTimeoutMeta(userId: string) {
  const existing = getSessionTimeoutMeta(userId);

  if (existing) return existing;

  const next = createSessionTimeoutMeta(userId);
  saveSessionTimeoutMeta(next);

  return next;
}

export type UserRole = "alumni" | "student" | "admin" | "super_admin";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  role: UserRole;
  skills?: SkillForm[];
  avatar?: string;
  faculty?: string;
  major?: string;
  department?: string;
  graduationYear?: number;
  company?: string;
  position?: string;
  work?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  lineID?: string;
  website?: string;
  studentId?: string;
  address?: {
    houseNo?: string;
    subDistrict?: string;
    district?: string;
    province?: string;
    postalCode?: string;
  };
  educations?: {
    id?: string;
    university: string;
    degree: string;
    faculty: string;
    major: string;
    gpa?: string;
    honors?: string;
    admissionYear?: number;
    graduationYear?: number;
    isCurrent?: boolean;
    description?: string;
    displayOrder?: number;
  }[];
  careerExperiences?: {
    id?: string;
    company: string;
    position: string;
    employmentType: string;
    location: string;
    workMode: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
    achievements: string;
    displayOrder: number;
  }[];
  achievements?: {
    id?: string;
    title: string;
    issuer: string;
    achievementDate: string;
    description: string;
    url: string;
    achievementType: string;
    isFeatured: boolean;
    displayOrder: number;
  }[];
  studyYear?: number;
  isVerified: boolean;
  profileCompletion: number;
  lastUpdated: Date;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapProfile = (profile: any): User | null => {
  if (!profile) return null;

  const address = Array.isArray(profile.addresses)
    ? profile.addresses[0]
    : (profile.addresses ?? null);

  const educations = Array.isArray(profile.educations)
    ? profile.educations
    : profile.educations
      ? [profile.educations]
      : [];

  const careerExperiences = Array.isArray(profile.career_experiences)
    ? profile.career_experiences
    : profile.career_experiences
      ? [profile.career_experiences]
      : [];

  const achievements = Array.isArray(profile.user_achievements)
    ? profile.user_achievements
    : profile.user_achievements
      ? [profile.user_achievements]
      : [];

  return {
    id: profile.id,
    firstName: profile.first_name ?? "",
    lastName: profile.last_name ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    bio: profile.bio ?? "",
    role: profile.role,

    skills: (profile.user_skills ?? []).map((item: any, index: number) => ({
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

    avatar: profile.avatar_url ?? "",
    faculty: profile.faculty ?? "",
    major: profile.major ?? "",
    department: profile.department ?? "",
    company: profile.company ?? "",
    position: profile.position ?? "",
    work: profile.work ?? "",
    location: profile.location ?? "",
    linkedin: profile.linkedin ?? "",
    github: profile.github ?? "",
    lineID: profile.line_id ?? "",
    website: profile.website ?? "",
    studentId: profile.student_id ?? "",

    address: address
      ? {
          houseNo: address.house_no ?? "",
          subDistrict: address.sub_district ?? "",
          district: address.district ?? "",
          province: address.province ?? "",
          postalCode: address.postal_code ?? "",
        }
      : undefined,

    educations: educations.map((edu: any, index: number) => ({
      id: edu.id,
      university: edu.university ?? "",
      degree: edu.degree ?? "",
      faculty: edu.faculty ?? "",
      major: edu.major ?? "",
      gpa: edu.gpa ?? "",
      honors: edu.honors ?? "",
      admissionYear: edu.admission_year ?? undefined,
      graduationYear: edu.graduation_year ?? undefined,
      isCurrent: edu.is_current ?? false,
      description: edu.description ?? "",
      displayOrder: edu.display_order ?? index,
    })),

    careerExperiences: careerExperiences.map((item: any, index: number) => ({
      id: item.id,
      company: item.company ?? "",
      position: item.position ?? "",
      employmentType: item.employment_type ?? "",
      location: item.location ?? "",
      workMode: item.work_mode ?? "",
      startDate: item.start_date ?? "",
      endDate: item.end_date ?? "",
      isCurrent: !!item.is_current,
      description: item.description ?? "",
      achievements: item.achievements ?? "",
      displayOrder: item.display_order ?? index,
    })),

    achievements: achievements.map((item: any, index: number) => ({
      id: item.id,
      title: item.title ?? "",
      issuer: item.issuer ?? "",
      achievementDate: item.achievement_date ?? "",
      description: item.description ?? "",
      url: item.url ?? "",
      achievementType: item.achievement_type ?? "",
      isFeatured: !!item.is_featured,
      displayOrder: item.display_order ?? index,
    })),

    isVerified: profile.is_verified ?? false,
    profileCompletion: profile.profile_completion ?? 0,
    lastUpdated: new Date(profile.updated_at ?? profile.created_at),
    isActive: profile.is_active ?? true,
  };
};

const logSupabaseError = (label: string, error: any) => {
  console.error(label, {
    message: error?.message ?? null,
    details: error?.details ?? null,
    hint: error?.hint ?? null,
    code: error?.code ?? null,
    raw: error,
  });
};

const fetchCurrentUserProfile = async (userId: string) => {
  const [
    profileRes,
    addressRes,
    educationsRes,
    userSkillsRes,
    careerRes,
    achievementsRes,
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
        role,
        avatar_url,
        company,
        position,
        work,
        location,
        linkedin,
        github,
        line_id,
        website,
        student_id,
        is_verified,
        profile_completion,
        updated_at,
        created_at,
        is_active
      `,
      )
      .eq("id", userId)
      .maybeSingle(),

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
      .eq("user_id", userId)
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
        display_order
      `,
      )
      .eq("user_id", userId)
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
      .eq("user_id", userId)
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
        display_order
      `,
      )
      .eq("user_id", userId)
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
      .eq("user_id", userId)
      .order("display_order", { ascending: true }),
  ]);

  if (profileRes.error) {
    logSupabaseError("FETCH PROFILE ERROR:", profileRes.error);
    throw profileRes.error;
  }

  if (addressRes.error) {
    logSupabaseError("FETCH ADDRESS ERROR:", addressRes.error);
    throw addressRes.error;
  }

  if (educationsRes.error) {
    logSupabaseError("FETCH EDUCATIONS ERROR:", educationsRes.error);
    throw educationsRes.error;
  }

  if (userSkillsRes.error) {
    logSupabaseError("FETCH USER SKILLS ERROR:", userSkillsRes.error);
    throw userSkillsRes.error;
  }

  if (careerRes.error) {
    logSupabaseError("FETCH CAREER EXPERIENCES ERROR:", careerRes.error);
    throw careerRes.error;
  }

  if (achievementsRes.error) {
    logSupabaseError("FETCH USER ACHIEVEMENTS ERROR:", achievementsRes.error);
    throw achievementsRes.error;
  }

  if (!profileRes.data) return null;

  return {
    ...profileRes.data,
    addresses: addressRes.data ? [addressRes.data] : [],
    educations: educationsRes.data ?? [],
    user_skills: userSkillsRes.data ?? [],
    career_experiences: careerRes.data ?? [],
    user_achievements: achievementsRes.data ?? [],
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionTimeoutDialogOpenRef = useRef(false);

  const forceLogoutBySessionTimeout = useCallback(async () => {
    if (sessionTimeoutDialogOpenRef.current) return;

    sessionTimeoutDialogOpenRef.current = true;

    const currentUserId = user?.id;

    try {
      await supabase.auth.signOut();
    } catch (error) {
      clearSessionTimeoutMeta(currentUserId);
      setUser(null);
      setLoading(false);
    }

    await Swal.fire({
      icon: "warning",
      title: "หมดเวลาใช้งานระบบ",
      text: "คุณอยู่ในระบบครบระยะเวลาที่กำหนดแล้ว กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
      confirmButtonText: "เข้าสู่ระบบใหม่",
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    window.location.href = "/login";
  }, [user?.id]);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
    }

    try {
      const profile = await fetchCurrentUserProfile(data.user.id);

      if (profile && profile.is_active === false) {
        await supabase.auth.signOut();

        return {
          success: false,
          error: "บัญชีของท่านถูกผู้ดูแลระบบระงับ",
        };
      }

      if (profile) {
        const mappedUser = mapProfile(profile);

        if (mappedUser) {
          const meta = createSessionTimeoutMeta(mappedUser.id);
          saveSessionTimeoutMeta(meta);
        }

        setUser(mappedUser);
      } else {
        setUser(null);
      }

      return { success: true };
    } catch (profileError: any) {
      logSupabaseError("LOGIN PROFILE ERROR:", profileError);
      return {
        success: false,
        error: profileError?.message ?? "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้",
      };
    }
  }, []);

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          logSupabaseError("GET SESSION ERROR:", error);
          setUser(null);
          return;
        }

        if (!data.session?.user) {
          setUser(null);
          return;
        }

        const sessionUserId = data.session.user.id;
        const meta = ensureSessionTimeoutMeta(sessionUserId);

        if (meta.expiresAt <= Date.now()) {
          clearSessionTimeoutMeta(sessionUserId);
          await supabase.auth.signOut();
          setUser(null);

          await Swal.fire({
            icon: "warning",
            title: "หมดเวลาใช้งานระบบ",
            text: "คุณอยู่ในระบบครบระยะเวลาที่กำหนดแล้ว กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
            confirmButtonText: "เข้าสู่ระบบใหม่",
            allowOutsideClick: false,
            allowEscapeKey: false,
          });

          window.location.href = "/login";
          return;
        }

        const profile = await fetchCurrentUserProfile(sessionUserId);

        if (profile) {
          if (profile.is_active === false) {
            await supabase.auth.signOut();
            setUser(null);
            return;
          }

          setUser(mapProfile(profile));
        } else {
          setUser(null);
        }
      } catch (error: any) {
        logSupabaseError("GET SESSION PROFILE ERROR:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            const sessionUserId = session.user.id;

            if (event === "SIGNED_IN") {
              const meta = createSessionTimeoutMeta(sessionUserId);
              saveSessionTimeoutMeta(meta);
            } else {
              const meta = ensureSessionTimeoutMeta(sessionUserId);

              if (meta.expiresAt <= Date.now()) {
                await forceLogoutBySessionTimeout();
                return;
              }
            }

            const profile = await fetchCurrentUserProfile(sessionUserId);

            if (profile && profile.is_active === false) {
              await supabase.auth.signOut();
              setUser(null);
              return;
            }

            if (profile) {
              setUser(mapProfile(profile));
            } else {
              setUser(null);
            }
          } else {
            clearSessionTimeoutMeta();
            setUser(null);
          }
        } catch (error: any) {
          logSupabaseError("AUTH PROFILE FETCH ERROR:", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      },
    );
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const checkSessionTimeout = () => {
      const remainingMs = getSessionRemainingMs(user.id);

      if (remainingMs <= 0) {
        forceLogoutBySessionTimeout();
      }
    };

    checkSessionTimeout();

    const remainingMs = getSessionRemainingMs(user.id);

    const timeoutId = window.setTimeout(() => {
      forceLogoutBySessionTimeout();
    }, Math.max(remainingMs, 0));

    const intervalId = window.setInterval(() => {
      checkSessionTimeout();
    }, 30 * 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSessionTimeout();
      }
    };

    window.addEventListener("focus", checkSessionTimeout);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
      window.removeEventListener("focus", checkSessionTimeout);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user?.id, forceLogoutBySessionTimeout]);

  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/dashboard`
            : undefined,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    const currentUserId = user?.id;

    await supabase.auth.signOut();

    clearSessionTimeoutMeta(currentUserId);
    setUser(null);
  }, [user?.id]);

  const updateProfile = useCallback((data: Partial<User>) => {
    setUser((prev) =>
      prev ? { ...prev, ...data, lastUpdated: new Date() } : null,
    );
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        logout,
        updateProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

const isAdminRole = (role?: UserRole) =>
  role === "admin" || role === "super_admin";

export const permissions = {
  canVerifyAlumni: (role?: UserRole) => isAdminRole(role),
  canManageNews: (role?: UserRole) => isAdminRole(role),
  canViewStats: (role?: UserRole) => isAdminRole(role),
  canManageUsers: (role?: UserRole) => isAdminRole(role),

  canPostJobs: (role?: UserRole) => role === "alumni" || isAdminRole(role),
  canReferCandidates: (role?: UserRole) =>
    role === "alumni" || isAdminRole(role),
  canAccessCareerInsights: (role?: UserRole) =>
    role === "alumni" || isAdminRole(role),
  canViewAlumniDirectory: (role?: UserRole) =>
    role === "alumni" || isAdminRole(role),

  canViewNews: (role?: UserRole) => !!role,
  canUpdateProfile: (role?: UserRole) => !!role,
  canViewPublicProfiles: (role?: UserRole) => !!role,
};
