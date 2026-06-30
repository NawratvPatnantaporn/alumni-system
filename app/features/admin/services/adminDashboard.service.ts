import { supabase } from "@/lib/supabase/client";

export type AdminOverview = {
  totalUsers: number;
  alumniCount: number;
  studentCount: number;
  adminCount: number;
  superAdminCount: number;
  jobCount: number;
  newsCount: number;
  eventCount: number;
};

export type AdminActivityItem = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  createdAt: string;
  actorName: string | null;
  actorRole: string | null;
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const [
    totalUsersRes,
    alumniRes,
    studentRes,
    adminRes,
    superAdminRes,
    jobRes,
    newsRes,
    eventRes,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "alumni"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "student"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin"),
    supabase.from("job_posts").select("id", { count: "exact", head: true }),
    supabase.from("news_posts").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
  ]);

  const responses = [
    totalUsersRes,
    alumniRes,
    studentRes,
    adminRes,
    superAdminRes,
    jobRes,
    newsRes,
    eventRes,
  ];

  const firstError = responses.find((res) => res.error)?.error;

  if (firstError) {
    console.error(
      "GET ADMIN OVERVIEW ERROR:",
      firstError.message,
      firstError.details,
      firstError.hint
    );
    throw firstError;
  }

  return {
    totalUsers: totalUsersRes.count ?? 0,
    alumniCount: alumniRes.count ?? 0,
    studentCount: studentRes.count ?? 0,
    adminCount: adminRes.count ?? 0,
    superAdminCount: superAdminRes.count ?? 0,
    jobCount: jobRes.count ?? 0,
    newsCount: newsRes.count ?? 0,
    eventCount: eventRes.count ?? 0,
  };
}

export async function getRecentAdminActivities(): Promise<AdminActivityItem[]> {
  const { data, error } = await supabase
    .from("admin_activity_logs")
    .select(
      `
      id,
      action_type,
      title,
      description,
      created_at,
      actor:profiles!admin_activity_logs_actor_id_fkey (
        id,
        first_name,
        last_name,
        role
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error(
      "GET ADMIN ACTIVITIES ERROR:",
      error.message,
      error.details,
      error.hint
    );
    throw error;
  }

  return (data ?? []).map((item: any) => ({
    id: item.id,
    type: item.action_type,
    title: item.title,
    description: item.description,
    createdAt: item.created_at,
    actorName: [item.actor?.first_name, item.actor?.last_name]
      .filter(Boolean)
      .join(" ") || null,
    actorRole: item.actor?.role ?? null,
  }));
}