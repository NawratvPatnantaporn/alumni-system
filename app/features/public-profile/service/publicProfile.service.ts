import { supabase } from "@/lib/supabase/client";
import type { PublicAlumniProfile } from "../types/publicProfile";

export type PublicProfilePreview = {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  isActive: boolean;
  profileVisibility: string;
  isOwner: boolean;
};

type PublicProfilePreviewRpcRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
  is_active: boolean | null;
  profile_visibility: string | null;
  is_owner: boolean | null;
};

type PublicProfileBaseRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  company: string | null;
  position: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  website: string | null;
  is_verified: boolean | null;
  is_active: boolean | null;
  profile_visibility: string;
  created_at: string | null;
  updated_at: string | null;
};

export class PublicProfileNotFoundError extends Error {
  constructor() {
    super("ไม่พบโปรไฟล์");
    this.name = "PublicProfileNotFoundError";
  }
}

export class PublicProfileForbiddenError extends Error {
  constructor() {
    super("คุณไม่มีสิทธิ์ดูโปรไฟล์นี้");
    this.name = "PublicProfileForbiddenError";
  }
}

function buildFullName(
  firstName?: string | null,
  lastName?: string | null,
) {
  const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return name || "ไม่ระบุชื่อ";
}

function formatDuration(
  startDate?: string | null,
  endDate?: string | null,
  isCurrent?: boolean | null,
) {
  const start = startDate ? startDate.slice(0, 7) : "-";

  const end = isCurrent
    ? "ปัจจุบัน"
    : endDate
      ? endDate.slice(0, 7)
      : "-";

  return `${start} - ${end}`;
}

export async function getPublicAlumniProfile(
  profileId: string,
): Promise<PublicAlumniProfile> {
  if (!profileId) {
    throw new PublicProfileNotFoundError();
  }

  const [
    profileResult,
    educationResult,
    skillResult,
    interestResult,
    experienceResult,
    achievementResult,
  ] = await Promise.all([
    supabase
      .from("v_public_alumni_profiles")
      .select(`
        id,
        first_name,
        last_name,
        avatar_url,
        bio,
        company,
        position,
        location,
        email,
        phone,
        linkedin,
        website,
        is_verified,
        is_active,
        profile_visibility,
        created_at,
        updated_at
      `)
      .eq("id", profileId)
      .maybeSingle(),

    supabase
      .from("educations")
      .select(`
        id,
        university,
        degree,
        faculty,
        major,
        admission_year,
        graduation_year,
        display_order,
        is_primary
      `)
      .eq("user_id", profileId)
      .order("display_order", { ascending: true }),

    supabase
      .from("user_skills")
      .select(`
        id,
        display_order,
        skills (
          id,
          name
        )
      `)
      .eq("user_id", profileId)
      .order("display_order", { ascending: true }),

    supabase
      .from("user_interests")
      .select(`
        id,
        display_order,
        interest_tags (
          id,
          name,
          slug,
          category
        )
      `)
      .eq("user_id", profileId)
      .order("display_order", { ascending: true }),

    supabase
      .from("career_experiences")
      .select(`
        id,
        company,
        position,
        start_date,
        end_date,
        is_current,
        description,
        display_order
      `)
      .eq("user_id", profileId)
      .order("display_order", { ascending: true }),

    supabase
      .from("user_achievements")
      .select(`
        id,
        title,
        issuer,
        achievement_type,
        achievement_date,
        description,
        url,
        is_featured,
        display_order
      `)
      .eq("user_id", profileId)
      .order("is_featured", { ascending: false })
      .order("achievement_date", {
        ascending: false,
        nullsFirst: false,
      }),
  ]);

  if (profileResult.error) {
    console.error("GET PUBLIC PROFILE BASE ERROR:", {
      message: profileResult.error.message,
      details: profileResult.error.details,
      hint: profileResult.error.hint,
      code: profileResult.error.code,
    });

    throw profileResult.error;
  }

  if (!profileResult.data) {
    throw new PublicProfileNotFoundError();
  }

  const secondaryErrors = [
    educationResult.error,
    skillResult.error,
    interestResult.error,
    experienceResult.error,
    achievementResult.error,
  ].filter(Boolean);

  if (secondaryErrors.length > 0) {
    const firstError = secondaryErrors[0];

    console.error("GET PUBLIC PROFILE RELATED DATA ERROR:", {
      message: firstError?.message,
      details: firstError?.details,
      hint: firstError?.hint,
      code: firstError?.code,
    });

    throw firstError;
  }

  const base = profileResult.data as PublicProfileBaseRow;

  const educationRows = educationResult.data ?? [];
  const skillRows = skillResult.data ?? [];
  const interestRows = interestResult.data ?? [];
  const experienceRows = experienceResult.data ?? [];
  const achievementRows = achievementResult.data ?? [];

  const primaryEducation =
    educationRows.find((item: any) => item.is_primary) ??
    educationRows[0] ??
    null;

  const education = educationRows.map((item: any) => ({
    id: item.id,
    institution: item.university ?? "",
    degree: item.degree ?? "",
    field: item.major ?? "",
    faculty: item.faculty ?? "",
    admissionYear: item.admission_year ?? null,
    graduationYear: item.graduation_year ?? null,
  }));

  const skills = skillRows
    .map((item: any) => item.skills?.name)
    .filter((name): name is string => Boolean(name));

  const interests = interestRows
    .map((item: any) => {
      const tag = item.interest_tags;

      if (!tag?.id || !tag?.name) return null;

      return {
        id: tag.id,
        name: tag.name,
        slug: tag.slug ?? "",
        category: tag.category ?? null,
      };
    })
    .filter(
      (
        item,
      ): item is {
        id: string;
        name: string;
        slug: string;
        category: string | null;
      } => item !== null,
    );

  const experience = experienceRows.map((item: any) => ({
    id: item.id,
    company: item.company ?? "",
    position: item.position ?? "",
    duration: formatDuration(
      item.start_date,
      item.end_date,
      item.is_current,
    ),
    current: Boolean(item.is_current),
    description: item.description ?? "",
  }));

  const achievements = achievementRows.map((item: any) => ({
    id: item.id,
    title: item.title ?? "",
    issuer: item.issuer ?? "",
    achievementType: item.achievement_type ?? "",
    achievementDate: item.achievement_date ?? null,
    year: item.achievement_date
      ? new Date(item.achievement_date).getFullYear()
      : null,
    description: item.description ?? "",
    url: item.url ?? null,
    isFeatured: Boolean(item.is_featured),
  }));

  return {
    id: base.id,
    name: buildFullName(base.first_name, base.last_name),
    avatar: base.avatar_url ?? "",
    bio: base.bio ?? "",

    company: base.company ?? "",
    position: base.position ?? "",
    location: base.location ?? "",

    email: base.email ?? "",
    phone: base.phone ?? "",
    linkedin: base.linkedin ?? "",
    website: base.website ?? "",

    faculty: primaryEducation?.faculty ?? "",
    department: primaryEducation?.major ?? "",
    admissionYear: primaryEducation?.admission_year ?? null,
    graduationYear: primaryEducation?.graduation_year ?? null,

    isVerified: Boolean(base.is_verified),
    isActive: Boolean(base.is_active),

    joinedDate: base.created_at ?? null,
    lastUpdated: base.updated_at ?? null,

    skills,
    interests,
    experience,
    education,
    achievements,
  };
}

export async function getPublicProfilePreview(
  profileId: string,
): Promise<PublicProfilePreview | null> {
  const { data, error } = await supabase
    .rpc("get_profile_preview", {
      p_profile_id: profileId,
    })
    .maybeSingle();

  if (error) {
    console.error("GET PROFILE PREVIEW ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw error;
  }

  if (!data) return null;

  const row = data as PublicProfilePreviewRpcRow;

  return {
    id: row.id,
    name:
      [row.first_name, row.last_name]
        .filter(Boolean)
        .join(" ")
        .trim() || "ผู้ใช้งาน",

    avatar: row.avatar_url ?? "",
    isVerified: row.is_verified ?? false,
    isActive: row.is_active ?? true,
    profileVisibility: row.profile_visibility ?? "public",
    isOwner: row.is_owner ?? false,
  };
}