import { supabase } from "@/lib/supabase/client";

export async function getJobApplications(jobPostId: string) {
  const { data, error } = await supabase
    .from("job_applications")
    .select(`
      id,
      status,
      created_at,
      user_id,
      profiles!job_applications_user_id_fkey (
        id,
        first_name,
        last_name,
        email,
        phone,
        avatar_url,
        position,
        company
      )
    `)
    .eq("job_post_id", jobPostId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET JOB APPLICATIONS ERROR:", error.message, error.details, error.hint);
    throw error;
  }

  return data ?? [];
}

export async function updateJobPost(
  jobPostId: string,
  userId: string,
  payload: {
    title: string;
    company?: string;
    description?: string;
    location?: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    jobType?: string;
    experienceLevel?: string;
    minExperienceYears?: number | null;
    isActive?: boolean;
  }
) {
  const { error } = await supabase
    .from("job_posts")
    .update({
      title: payload.title,
      company: payload.company || null,
      description: payload.description || null,
      location: payload.location || null,
      salary_min: payload.salaryMin ?? null,
      salary_max: payload.salaryMax ?? null,
      job_type: payload.jobType || null,
      experience_level: payload.experienceLevel || null,
      min_experience_years: payload.minExperienceYears ?? null,
      is_active: payload.isActive ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobPostId)
    .eq("user_id", userId);

  if (error) {
    console.error("UPDATE JOB POST ERROR:", error.message, error.details, error.hint);
    throw error;
  }
}

export async function deleteJobPost(jobPostId: string, userId: string) {
  const { error } = await supabase
    .from("job_posts")
    .delete()
    .eq("id", jobPostId)
    .eq("user_id", userId);

  if (error) {
    console.error("DELETE JOB POST ERROR:", error.message, error.details, error.hint);
    throw error;
  }
}