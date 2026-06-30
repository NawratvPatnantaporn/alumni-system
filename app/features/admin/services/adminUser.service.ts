import { supabase } from "@/lib/supabase/client";

export type AdminUserRole = "student" | "alumni" | "admin" | "super_admin";

type CreateAdminUserInput = {
  createdBy: string;
  currentUserRole: AdminUserRole;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: AdminUserRole;
};

export type AdminUserItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AdminUserRole;
  studentId: string | null;
  isActive: boolean;
  isVerified: boolean;
  profileCompletion: number;
  createdAt: string;
  updatedAt: string;
};

export type GetAdminUsersParams = {
  search?: string;
  role?: string;
  page?: number;
  pageSize?: number;
};

export async function createAdminUser(payload: CreateAdminUserInput) {
  const res = await fetch("/api/admin/create-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "สร้างผู้ใช้ไม่สำเร็จ");
  }

  return result.user;
}

export async function getAdminUsers({
  search = "",
  role = "all",
  page = 1,
  pageSize = 10,
}: GetAdminUsersParams) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("profiles")
    .select(
      `
      id,
      first_name,
      last_name,
      email,
      role,
      student_id,
      is_active,
      is_verified,
      profile_completion,
      created_at,
      updated_at
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (role !== "all") {
    query = query.eq("role", role);
  }

  const keyword = search.trim();

  if (keyword) {
    query = query.or(
      `first_name.ilike.%${keyword}%,last_name.ilike.%${keyword}%,email.ilike.%${keyword}%,student_id.ilike.%${keyword}%`,
    );
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    users: (data ?? []).map(
      (item: any): AdminUserItem => ({
        id: item.id,
        firstName: item.first_name ?? "",
        lastName: item.last_name ?? "",
        email: item.email ?? "",
        role: item.role ?? "student",
        studentId: item.student_id ?? null,
        isActive: item.is_active ?? true,
        isVerified: item.is_verified ?? false,
        profileCompletion: item.profile_completion ?? 0,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }),
    ),
    total: count ?? 0,
  };
}

export async function updateAdminUserRole(
  userId: string,
  role: Exclude<AdminUserRole, "super_admin">,
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;
}

export async function updateAdminUserActiveStatus(
  userId: string,
  isActive: boolean,
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;
}

export async function deleteAdminUserProfile(userId: string) {
  const { error } = await supabase.from("profiles").delete().eq("id", userId);

  if (error) throw error;
}

export async function getPendingAlumniApprovals() {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      first_name,
      last_name,
      email,
      role,
      student_id,
      is_active,
      is_verified,
      profile_completion,
      created_at,
      updated_at
    `,
    )
    .eq("role", "alumni")
    .or("is_verified.eq.false,is_verified.is.null")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map(
    (item: any): AdminUserItem => ({
      id: item.id,
      firstName: item.first_name ?? "",
      lastName: item.last_name ?? "",
      email: item.email ?? "",
      role: item.role ?? "alumni",
      studentId: item.student_id ?? null,
      isActive: item.is_active ?? true,
      isVerified: item.is_verified ?? false,
      profileCompletion: item.profile_completion ?? 0,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }),
  );
}

export async function approveAlumniUser(userId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({
      role: "alumni",
      is_verified: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;
}

export async function rejectAlumniUser(userId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({
      role: "student",
      is_verified: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;
}

export type AlumniVerificationDetail = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  studentId: string | null;
  role: AdminUserRole;
  isVerified: boolean;
  isActive: boolean;
  profileCompletion: number;
  createdAt: string;
  updatedAt: string | null;
  educations: {
    id: string;
    university: string | null;
    degree: string | null;
    faculty: string | null;
    major: string | null;
    admissionYear: number | null;
    graduationYear: number | null;
    isCurrent: boolean | null;
    displayOrder: number | null;
  }[];
  careerExperiences: {
    id: string;
    company: string | null;
    position: string | null;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean | null;
  }[];
  achievements: {
    id: string;
    title: string | null;
    issuer: string | null;
    achievementDate: string | null;
  }[];
};

export async function getAlumniVerificationDetail(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      avatar_url,
      student_id,
      role,
      is_verified,
      is_active,
      profile_completion,
      created_at,
      updated_at,
      educations (
        id,
        university,
        degree,
        faculty,
        major,
        admission_year,
        graduation_year,
        is_current,
        display_order
      ),
      career_experiences (
        id,
        company,
        position,
        start_date,
        end_date,
        is_current
      ),
      user_achievements (
        id,
        title,
        issuer,
        achievement_date
      )
    `)
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    firstName: data.first_name ?? "",
    lastName: data.last_name ?? "",
    email: data.email ?? "",
    phone: data.phone ?? null,
    avatarUrl: data.avatar_url ?? null,
    studentId: data.student_id ?? null,
    role: data.role ?? "student",
    isVerified: data.is_verified ?? false,
    isActive: data.is_active ?? true,
    profileCompletion: data.profile_completion ?? 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at ?? null,
    educations: (data.educations ?? []).map((edu: any) => ({
      id: edu.id,
      university: edu.university ?? null,
      degree: edu.degree ?? null,
      faculty: edu.faculty ?? null,
      major: edu.major ?? null,
      admissionYear: edu.admission_year ?? null,
      graduationYear: edu.graduation_year ?? null,
      isCurrent: edu.is_current ?? null,
      displayOrder: edu.display_order ?? null,
    })),
    careerExperiences: (data.career_experiences ?? []).map((item: any) => ({
      id: item.id,
      company: item.company ?? null,
      position: item.position ?? null,
      startDate: item.start_date ?? null,
      endDate: item.end_date ?? null,
      isCurrent: item.is_current ?? null,
    })),
    achievements: (data.user_achievements ?? []).map((item: any) => ({
      id: item.id,
      title: item.title ?? null,
      issuer: item.issuer ?? null,
      achievementDate: item.achievement_date ?? null,
    })),
  } satisfies AlumniVerificationDetail;
}