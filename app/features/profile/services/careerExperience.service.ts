import { supabase } from "@/lib/supabase/client";

export type CareerExperienceSkillForm = {
  userSkillId: string;
  skillName?: string;
  selectedCategory?: string;
  level?: number;
  yearsExperience?: number;
  isPrimary?: boolean;
  relevanceScore?: number;
};

export type CareerExperienceForm = {
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

  careerCategory?: string;
  careerLevel?: string;
  alignmentScore?: number;
  isAligned?: boolean;
  alignmentReason?: string;
  relatedSkills?: CareerExperienceSkillForm[];
};

function logSupabaseError(label: string, error: any, extra?: any) {
  console.error(label, {
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    code: error?.code,
    extra,
    raw: error,
  });
}

export async function saveCareerExperiences(
  userId: string,
  experiences: CareerExperienceForm[] = [],
) {
  const safeExperiences = Array.isArray(experiences) ? experiences : [];

  const normalizedExperiences = safeExperiences
    .map((item, index) => ({
      originalIndex: index,
      originalDisplayOrder: item.displayOrder ?? index,
      relatedSkills: item.relatedSkills ?? [],

      row: {
        id: item.id || undefined,
        user_id: userId,

        company: item.company?.trim() || null,
        position: item.position?.trim() || null,
        employment_type: item.employmentType?.trim() || null,
        location: item.location?.trim() || null,
        work_mode: item.workMode?.trim() || null,
        start_date: item.startDate || null,
        end_date: item.isCurrent ? null : item.endDate || null,
        is_current: !!item.isCurrent,
        description: item.description?.trim() || null,
        achievements: item.achievements?.trim() || null,
        display_order: item.displayOrder ?? index,

        career_category: item.careerCategory?.trim() || null,
        career_level: item.careerLevel?.trim() || null,
        alignment_score: Number(item.alignmentScore ?? 0),
        is_aligned: !!item.isAligned,
        alignment_reason: item.alignmentReason?.trim() || null,
      },
    }))
    .filter(({ row }) => {
      return (
        row.company || row.position || row.description || row.career_category
      );
    });

  const incomingIds = normalizedExperiences
    .map((item) => item.row.id)
    .filter(Boolean) as string[];

  const { data: existingRows, error: fetchError } = await supabase
    .from("career_experiences")
    .select("id")
    .eq("user_id", userId);

  if (fetchError) {
    logSupabaseError("FETCH CAREER EXPERIENCES ERROR:", fetchError);
    throw fetchError;
  }

  const existingDbIds = (existingRows ?? []).map((row) => row.id);
  const idsToDelete = existingDbIds.filter((id) => !incomingIds.includes(id));

  if (idsToDelete.length > 0) {
    const { error: deleteRelError } = await supabase
      .from("career_experience_skills")
      .delete()
      .in("career_experience_id", idsToDelete);

    if (deleteRelError) {
      logSupabaseError(
        "DELETE OLD CAREER SKILL RELATIONS ERROR:",
        deleteRelError,
        {
          idsToDelete,
        },
      );
      throw deleteRelError;
    }

    const { error: deleteCareerError } = await supabase
      .from("career_experiences")
      .delete()
      .eq("user_id", userId)
      .in("id", idsToDelete);

    if (deleteCareerError) {
      logSupabaseError("DELETE CAREER EXPERIENCES ERROR:", deleteCareerError, {
        idsToDelete,
      });
      throw deleteCareerError;
    }
  }

  const { data: savedUserSkills, error: userSkillsError } = await supabase
    .from("user_skills")
    .select(
      `
    id,
    selected_category,
    skills (
      id,
      name,
      category
    )
  `,
    )
    .eq("user_id", userId);

  if (userSkillsError) {
    logSupabaseError(
      "FETCH USER SKILLS FOR CAREER RELATION ERROR:",
      userSkillsError,
    );
    throw userSkillsError;
  }

  const validUserSkillIds = new Set(
    (savedUserSkills ?? []).map((item: any) => item.id),
  );

  const resolveUserSkillId = (skill: CareerExperienceSkillForm) => {
    if (skill.userSkillId && validUserSkillIds.has(skill.userSkillId)) {
      return skill.userSkillId;
    }

    const matched = (savedUserSkills ?? []).find((item: any) => {
      const dbSkillName = item.skills?.name?.trim().toLowerCase();
      const inputSkillName = skill.skillName?.trim().toLowerCase();

      const dbCategory =
        item.selected_category || item.skills?.category || "Other";

      return (
        dbSkillName &&
        inputSkillName &&
        dbSkillName === inputSkillName &&
        dbCategory === skill.selectedCategory
      );
    });

    return matched?.id ?? null;
  };

  for (const item of normalizedExperiences) {
    const { row, relatedSkills } = item;
    const { id, ...careerRowWithoutId } = row;

    let careerId = id;

    if (careerId) {
      const { error: updateError } = await supabase
        .from("career_experiences")
        .update(careerRowWithoutId)
        .eq("id", careerId)
        .eq("user_id", userId);

      if (updateError) {
        logSupabaseError("UPDATE CAREER EXPERIENCE ERROR:", updateError, {
          careerId,
          careerRowWithoutId,
        });
        throw updateError;
      }
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("career_experiences")
        .insert(careerRowWithoutId)
        .select("id")
        .single();

      if (insertError) {
        logSupabaseError("INSERT CAREER EXPERIENCE ERROR:", insertError, {
          careerRowWithoutId,
        });
        throw insertError;
      }

      careerId = inserted.id;
    }

    if (!careerId) continue;

    const { error: deleteOldRelationsError } = await supabase
      .from("career_experience_skills")
      .delete()
      .eq("career_experience_id", careerId);

    if (deleteOldRelationsError) {
      logSupabaseError(
        "DELETE CAREER EXPERIENCE SKILL RELATIONS ERROR:",
        deleteOldRelationsError,
        { careerId },
      );
      throw deleteOldRelationsError;
    }

    const relationRows = relatedSkills
      .map((skill) => {
        const resolvedUserSkillId = resolveUserSkillId(skill);

        if (!resolvedUserSkillId) return null;

        return {
          career_experience_id: careerId,
          user_skill_id: resolvedUserSkillId,
          relevance_score: Number(skill.relevanceScore ?? 1),
        };
      })
      .filter(Boolean) as {
      career_experience_id: string;
      user_skill_id: string;
      relevance_score: number;
    }[];

    if (relationRows.length > 0) {
      const { error: insertRelationsError } = await supabase
        .from("career_experience_skills")
        .insert(relationRows);

      if (insertRelationsError) {
        logSupabaseError(
          "INSERT CAREER EXPERIENCE SKILL RELATIONS ERROR:",
          insertRelationsError,
          {
            careerId,
            relatedSkills,
            relationRows,
            validUserSkillIds: Array.from(validUserSkillIds),
          },
        );
        throw insertRelationsError;
      }
    }
  }
}
