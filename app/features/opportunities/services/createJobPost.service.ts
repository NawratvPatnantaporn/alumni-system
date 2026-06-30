import { supabase } from "@/lib/supabase/client";

type JobSkillInput = {
  skillId: string;
  isRequired?: boolean;
  minLevel?: number | null;
};

type CreateJobPostInput = {
  title: string;
  company?: string;
  description?: string;
  location?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
  jobType?: string;
  experienceLevel?: string;
  minExperienceYears?: number | null;
  skills?: JobSkillInput[];
};

export async function createJobPost(
  userId: string,
  payload: CreateJobPostInput
) {
  const { data: jobPost, error: jobError } = await supabase
    .from("job_posts")
    .insert({
      user_id: userId,
      title: payload.title,
      company: payload.company || null,
      description: payload.description || null,
      location: payload.location || null,
      salary_min: payload.salaryMin ?? null,
      salary_max: payload.salaryMax ?? null,
      currency: payload.currency || "THB",
      job_type: payload.jobType || null,
      experience_level: payload.experienceLevel || null,
      min_experience_years: payload.minExperienceYears ?? null,
      is_active: true,
    })
    .select()
    .single();

  if (jobError) {
    console.error("CREATE JOB POST ERROR:", jobError.message, jobError.details, jobError.hint);
    throw jobError;
  }

  const skillRows =
    payload.skills?.map((item) => ({
      job_post_id: jobPost.id,
      skill_id: item.skillId,
      is_required: item.isRequired ?? true,
      min_level: item.minLevel ?? null,
    })) ?? [];

  if (skillRows.length > 0) {
    const { error: skillError } = await supabase
      .from("job_post_skills")
      .insert(skillRows);

    if (skillError) {
      console.error("CREATE JOB POST SKILLS ERROR:", skillError.message, skillError.details, skillError.hint);
      throw skillError;
    }
  }

  const { error: notifyError } = await supabase.rpc("notify_users_for_job_match", {
    p_job_post_id: jobPost.id,
  });

  if (notifyError) {
    console.error("NOTIFY JOB MATCH ERROR:", notifyError.message, notifyError.details, notifyError.hint);
    throw notifyError;
  }

  return jobPost;
}