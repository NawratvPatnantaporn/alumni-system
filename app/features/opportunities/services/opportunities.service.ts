import { supabase } from "@/lib/supabase/client";

export type OpportunitySkillInput = {
  skillId: string;
  isRequired?: boolean;
  minLevel?: number | null;
};

export type CreateJobPostInput = {
  title: string;
  company: string;
  description: string;
  location: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
  jobType: "full-time" | "part-time" | "internship" | "contract";
  experienceLevel?: "junior" | "mid" | "senior" | "lead" | null;
  minExperienceYears?: number | null;
  skills: OpportunitySkillInput[];
};

export async function getOpportunitySkills() {
  const { data, error } = await supabase
    .from("skills")
    .select("id, name, category")
    .order("name", { ascending: true });

  if (error) {
    console.error(
      "GET OPPORTUNITY SKILLS ERROR:",
      error.message,
      error.details,
      error.hint
    );
    throw error;
  }

  return data ?? [];
}

export async function getJobPosts(params?: {
  search?: string;
  jobType?: string;
  onlyInternship?: boolean;
}) {
  let query = supabase
    .from("job_posts")
    .select(`
      id,
      user_id,
      title,
      company,
      description,
      location,
      salary_min,
      salary_max,
      currency,
      job_type,
      experience_level,
      min_experience_years,
      application_count,
      is_active,
      created_at,
      updated_at,
      profiles!job_posts_user_id_fkey (
        id,
        first_name,
        last_name,
        role
      ),
      job_post_skills (
        id,
        skill_id,
        is_required,
        min_level,
        skills (
          id,
          name,
          category
        )
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (params?.onlyInternship) {
    query = query.eq("job_type", "internship");
  } else if (params?.jobType && params.jobType !== "all") {
    query = query.eq("job_type", params.jobType);
  }

  if (params?.search?.trim()) {
    const search = params.search.trim();
    query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("GET JOB POSTS ERROR:", error.message, error.details, error.hint);
    throw error;
  }

  return data ?? [];
}

export async function createJobPost(
  userId: string,
  payload: CreateJobPostInput
) {
  const { data: jobPost, error: postError } = await supabase
    .from("job_posts")
    .insert({
      user_id: userId,
      title: payload.title,
      company: payload.company || null,
      description: payload.description || null,
      location: payload.location || null,
      salary_min: payload.salaryMin ?? null,
      salary_max: payload.salaryMax ?? null,
      currency: payload.currency ?? "THB",
      job_type: payload.jobType,
      experience_level: payload.experienceLevel ?? null,
      min_experience_years: payload.minExperienceYears ?? null,
      is_active: true,
    })
    .select("id")
    .single();

  if (postError) {
    console.error(
      "CREATE JOB POST ERROR:",
      postError.message,
      postError.details,
      postError.hint
    );
    throw postError;
  }

  if (payload.skills.length > 0) {
    const { error: skillError } = await supabase
      .from("job_post_skills")
      .insert(
        payload.skills.map((skill) => ({
          job_post_id: jobPost.id,
          skill_id: skill.skillId,
          is_required: skill.isRequired ?? true,
          min_level: skill.minLevel ?? null,
        }))
      );

    if (skillError) {
      console.error(
        "CREATE JOB POST SKILLS ERROR:",
        skillError.message,
        skillError.details,
        skillError.hint
      );
      throw skillError;
    }
  }

  const { error: notifyError } = await supabase.rpc(
    "notify_users_for_job_match",
    {
      p_job_post_id: jobPost.id,
    }
  );

  if (notifyError) {
    console.error(
      "NOTIFY USERS FOR JOB MATCH ERROR:",
      notifyError.message,
      notifyError.details,
      notifyError.hint
    );
    throw notifyError;
  }

  return jobPost.id;
}

export async function toggleSavedJob(
  userId: string,
  jobPostId: string,
  isCurrentlySaved: boolean
) {
  if (isCurrentlySaved) {
    const { error } = await supabase
      .from("job_saved")
      .delete()
      .eq("user_id", userId)
      .eq("job_post_id", jobPostId);

    if (error) {
      console.error("UNSAVE JOB ERROR:", error.message, error.details, error.hint);
      throw error;
    }

    return false;
  }

  const { error } = await supabase.from("job_saved").insert({
    user_id: userId,
    job_post_id: jobPostId,
  });

  if (error) {
    console.error("SAVE JOB ERROR:", error.message, error.details, error.hint);
    throw error;
  }

  return true;
}

export async function getSavedJobIds(userId: string) {
  const { data, error } = await supabase
    .from("job_saved")
    .select("job_post_id")
    .eq("user_id", userId);

  if (error) {
    console.error("GET SAVED JOB IDS ERROR:", error.message, error.details, error.hint);
    throw error;
  }

  return (data ?? []).map((item) => item.job_post_id as string);
}

export async function applyForJob(userId: string, jobPostId: string) {
  const { data: existingApplication, error: checkError } = await supabase
    .from("job_applications")
    .select("id")
    .eq("user_id", userId)
    .eq("job_post_id", jobPostId)
    .maybeSingle();

  if (checkError) {
    console.error(
      "CHECK JOB APPLICATION ERROR:",
      checkError.message,
      checkError.details,
      checkError.hint
    );
    throw checkError;
  }

  if (existingApplication) {
    return {
      applied: false,
      alreadyApplied: true,
    };
  }

  const { data: application, error: insertError } = await supabase
    .from("job_applications")
    .insert({
      user_id: userId,
      job_post_id: jobPostId,
      status: "pending",
    })
    .select("id, job_post_id, user_id")
    .single();

  if (insertError) {
    console.error(
      "INSERT JOB APPLICATION ERROR:",
      insertError.message,
      insertError.details,
      insertError.hint
    );
    throw insertError;
  }

  const { error: rpcError } = await supabase.rpc(
    "handle_job_application_created",
    {
      p_applicant_id: userId,
      p_job_post_id: jobPostId,
    }
  );

  if (rpcError) {
    console.error(
      "HANDLE JOB APPLICATION CREATED ERROR:",
      rpcError.message,
      rpcError.details,
      rpcError.hint
    );
    throw rpcError;
  }

  return {
    applied: true,
    alreadyApplied: false,
  };
}

export async function getAppliedJobIds(userId: string) {
    const { data, error } = await supabase
        .from("job_applications")
        .select("job_post_id")
        .eq("user_id", userId);

    if (error) {
        console.error("GET APPLIED JOB IDS ERROR:", error.message, error.details, error.hint);
        throw error;
    }

    return (data ?? []).map((item) => item.job_post_id as string);
}