import { supabase } from "@/lib/supabase/client";
import type {
  AlumniCardItem,
  AlumniProfileDetail,
  DirectoryFilterOptions,
  DirectoryQueryParams,
  DirectoryResult,
} from "../types/alumi";

function buildFullName(profile: any) {
  return `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
}

function formatDuration(
  startDate?: string | null,
  endDate?: string | null,
  isCurrent?: boolean,
) {
  const start = startDate ? startDate.slice(0, 7) : "-";
  const end = isCurrent ? "ปัจจุบัน" : endDate ? endDate.slice(0, 7) : "-";
  return `${start} - ${end}`;
}

function normalizeDirectoryItem(row: any): AlumniCardItem {
  return {
    id: row.id,
    name: row.name || "ไม่ระบุชื่อ",
    avatar: row.avatar_url ?? "",
    faculty: row.faculty ?? "",
    department: row.department ?? "",
    admissionYear: row.admission_year ?? null,
    graduationYear: row.graduation_year ?? null,
    company: row.company ?? "",
    position: row.position ?? "",
    location: row.location ?? "",
    isVerified: !!row.is_verified,
    isActive: !!row.is_active,
    lastUpdated: row.updated_at ?? null,
  };
}

export async function getAlumniDirectory({
  currentUserId,
  search = "",
  faculty = "ทั้งหมด",
  admissionYear = "",
  graduationYear = "",
  sortBy = "recent",
  page = 1,
  pageSize = 12,
}: DirectoryQueryParams = {}): Promise<DirectoryResult> {
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 48);
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  let query = supabase
    .from("v_alumni_directory_cards")
    .select(
      `
      id,
      name,
      avatar_url,
      is_verified,
      is_active,
      updated_at,
      faculty,
      department,
      admission_year,
      graduation_year,
      company,
      position,
      location,
      career_category
      `,
      { count: "exact" },
    );

  if (currentUserId) {
    query = query.neq("id", currentUserId);
  }

  const q = search.trim();

  if (q) {
    const escaped = q.replace(/[%_]/g, "\\$&");

    query = query.or(
      [
        `name.ilike.%${escaped}%`,
        `company.ilike.%${escaped}%`,
        `position.ilike.%${escaped}%`,
        `department.ilike.%${escaped}%`,
        `faculty.ilike.%${escaped}%`,
        `location.ilike.%${escaped}%`,
        `career_category.ilike.%${escaped}%`,
      ].join(","),
    );
  }

  if (faculty && faculty !== "ทั้งหมด") {
    query = query.eq("faculty", faculty);
  }

  if (admissionYear.trim()) {
    query = query.eq("admission_year", Number(admissionYear));
  }

  if (graduationYear.trim()) {
    query = query.eq("graduation_year", Number(graduationYear));
  }

  if (sortBy === "name") {
    query = query.order("name", { ascending: true });
  } else if (sortBy === "admission_year") {
    query = query.order("admission_year", {
      ascending: false,
      nullsFirst: false,
    });
  } else if (sortBy === "graduation_year") {
    query = query.order("graduation_year", {
      ascending: false,
      nullsFirst: false,
    });
  } else {
    query = query.order("updated_at", {
      ascending: false,
      nullsFirst: false,
    });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("GET ALUMNI DIRECTORY ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw error;
  }

  const total = count ?? 0;

  return {
    items: (data ?? []).map(normalizeDirectoryItem),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
  };
}

export async function getAlumniDirectoryFilterOptions(): Promise<DirectoryFilterOptions> {
  const { data, error } = await supabase
    .from("v_alumni_directory_filter_options")
    .select("faculties, admission_years, graduation_years")
    .maybeSingle();

  if (error) {
    console.error("GET DIRECTORY FILTER OPTIONS ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw error;
  }

  return {
    faculties: Array.isArray(data?.faculties) ? data.faculties : [],
    admissionYears: Array.isArray(data?.admission_years)
      ? data.admission_years
      : [],
    graduationYears: Array.isArray(data?.graduation_years)
      ? data.graduation_years
      : [],
  };
}

export async function getAlumniProfileDetail(
  profileId: string,
): Promise<AlumniProfileDetail | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      bio,
      avatar_url,
      company,
      position,
      location,
      linkedin,
      website,
      is_verified,
      is_active,
      created_at,
      updated_at,
      user_interests (
        id,
        display_order,
        interest_tags (
          id,
          name,
          slug,
          category
        )
      ),
      educations (
        id,
        university,
        degree,
        faculty,
        major,
        admission_year,
        graduation_year,
        display_order,
        is_primary
      ),
      user_skills!user_skills_user_id_fkey (
        id,
        display_order,
        skills (
          id,
          name
        )
      ),
      career_experiences (
        id,
        company,
        position,
        start_date,
        end_date,
        is_current,
        display_order
      ),
      user_achievements (
        id,
        title,
        achievement_date,
        description,
        display_order,
        is_featured
      )
    `)
    .eq("id", profileId)
    .eq("is_active", true)
    .eq("role", "alumni")
    .maybeSingle();

  if (error) {
    console.error("GET ALUMNI PROFILE DETAIL ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }

  if (!data) return null;

  const educations = Array.isArray(data.educations) ? data.educations : [];

  const primaryEducation =
    educations.find((e: any) => e?.is_primary) ??
    [...educations].sort(
      (a: any, b: any) =>
        (a?.display_order ?? 999) - (b?.display_order ?? 999),
    )[0] ??
    null;

  const skills = (Array.isArray(data.user_skills) ? data.user_skills : [])
    .sort(
      (a: any, b: any) =>
        (a?.display_order ?? 999) - (b?.display_order ?? 999),
    )
    .map((item: any) => item?.skills?.name)
    .filter(Boolean);

  const interests = (Array.isArray(data.user_interests)
    ? data.user_interests
    : []
  )
    .sort(
      (a: any, b: any) =>
      (a?.display_order ?? 999) - (b?.display_order ?? 999),
    )
    .map((item: any) => item?.interest_tags?.name)
    .filter(Boolean);

  const experience = (Array.isArray(data.career_experiences)
    ? data.career_experiences
    : []
  )
    .sort((a: any, b: any) => {
      if (!!a?.is_current !== !!b?.is_current) return a?.is_current ? -1 : 1;
      return (b?.start_date ?? "").localeCompare(a?.start_date ?? "");
    })
    .map((item: any) => ({
      id: item.id,
      company: item.company ?? "",
      position: item.position ?? "",
      duration: formatDuration(item.start_date, item.end_date, item.is_current),
      current: !!item.is_current,
    }));

  const education = educations
    .sort(
      (a: any, b: any) =>
        (b?.graduation_year ?? 0) - (a?.graduation_year ?? 0),
    )
    .map((item: any) => ({
      id: item.id,
      institution: item.university ?? "",
      degree: item.degree ?? "",
      field: item.major ?? "",
      year: item.graduation_year ?? null,
    }));

  const achievements = (Array.isArray(data.user_achievements)
    ? data.user_achievements
    : []
  )
    .sort((a: any, b: any) => {
      if (!!a?.is_featured !== !!b?.is_featured) {
        return a?.is_featured ? -1 : 1;
      }

      return (b?.achievement_date ?? "").localeCompare(
        a?.achievement_date ?? "",
      );
    })
    .map((item: any) => ({
      id: item.id,
      title: item.title ?? "",
      year: item.achievement_date
        ? new Date(item.achievement_date).getFullYear()
        : null,
      description: item.description ?? "",
    }));

  return {
    id: data.id,
    name: buildFullName(data) || "ไม่ระบุชื่อ",
    avatar: data.avatar_url ?? "",
    email: "",
    phone: "",
    linkedin: data.linkedin ?? "",
    website: data.website ?? "",
    faculty: primaryEducation?.faculty ?? "",
    department: primaryEducation?.major ?? "",
    admissionYear: primaryEducation?.admission_year ?? null,
    graduationYear: primaryEducation?.graduation_year ?? null,
    studentId: "",
    company: data.company ?? "",
    position: data.position ?? "",
    location: data.location ?? "",
    bio: data.bio ?? "",
    skills,
    interests,
    isVerified: !!data.is_verified,
    isActive: !!data.is_active,
    isMentor: false,
    lastUpdated: data.updated_at ?? null,
    joinedDate: data.created_at ?? null,
    experience,
    education,
    achievements,
  };
}