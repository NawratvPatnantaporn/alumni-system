import { supabase } from "@/lib/supabase/client";

type SaveUserSkillInput = {
  id?: string;
  name: string;
  category?: string;
  level?: number;
  yearsExperience?: number;
  isPrimary?: boolean;
  verified?: boolean;
  displayOrder?: number;
};

export async function saveUserSkills(
  userId: string,
  skills: SaveUserSkillInput[] = [],
) {
  const safeSkills = Array.isArray(skills) ? skills : [];

  const normalizedSkills = safeSkills
    .map((skill, index) => ({
      name: skill.name?.trim(),
      category: skill.category?.trim() || "Other",
      level: Number(skill.level ?? 3),
      yearsExperience: Number(skill.yearsExperience ?? 0),
      isPrimary: !!skill.isPrimary,
      verified: false,
      displayOrder: skill.displayOrder ?? index,
    }))
    .filter((skill) => !!skill.name);

  // ถ้าไม่มีเลย -> ลบ user_skills ของ user นี้ทั้งหมด
  if (normalizedSkills.length === 0) {
    const { error } = await supabase
      .from("user_skills")
      .delete()
      .eq("user_id", userId);

    console.log("NORMALIZED SKILLS:", normalizedSkills);

    if (error) {
      console.error(
        "DELETE USER SKILLS ERROR:",
        error.message,
        error.details,
        error.hint,
      );
      throw error;
    }

    return;
  }

  // กันชื่อซ้ำใน request เดียวกัน
  const uniqueSkillsMap = new Map<string, (typeof normalizedSkills)[number]>();
  for (const skill of normalizedSkills) {
    uniqueSkillsMap.set(skill.name.toLowerCase(), skill);
  }
  const uniqueSkills = Array.from(uniqueSkillsMap.values());

  const skillNames = uniqueSkills.map((s) => s.name!);

  // หา skills ที่มีอยู่แล้ว
  const { data: existingSkills, error: fetchExistingError } = await supabase
    .from("skills")
    .select("id, name, category")
    .in("name", skillNames);

  if (fetchExistingError) {
    console.error(
      "FETCH EXISTING SKILLS ERROR:",
      fetchExistingError.message,
      fetchExistingError.details,
      fetchExistingError.hint,
    );
    throw fetchExistingError;
  }

  const existingNameSet = new Set((existingSkills ?? []).map((s) => s.name));

  // เพิ่ม skills ที่ยังไม่มีในระบบ
  const missingSkills = uniqueSkills.filter(
    (skill) => !existingNameSet.has(skill.name!),
  );

  // insert skill ใหม่เข้า table skills ก่อน
  if (missingSkills.length > 0) {
    const { error: insertNewSkillsError } = await supabase
      .from("skills")
      .insert(
        missingSkills.map((skill) => ({
          name: skill.name,
          category: skill.category || "Other",
        })),
      );

    console.log("MISSING SKILLS:", missingSkills);

    if (insertNewSkillsError) {
      console.error(
        "INSERT NEW SKILLS ERROR:",
        insertNewSkillsError.message,
        insertNewSkillsError.details,
        insertNewSkillsError.hint,
      );
      throw insertNewSkillsError;
    }
  }

  // ดึง skills ทั้งหมดอีกรอบ เพื่อให้ได้ id ครบ
  const { data: allSkills, error: refetchError } = await supabase
    .from("skills")
    .select("id, name")
    .in("name", skillNames);

  if (refetchError) {
    console.error(
      "REFETCH SKILLS ERROR:",
      refetchError.message,
      refetchError.details,
      refetchError.hint,
    );
    throw refetchError;
  }

  const skillMap = new Map((allSkills ?? []).map((row) => [row.name, row.id]));

  const userSkillRows = uniqueSkills
    .map((skill, index) => {
      const skillId = skillMap.get(skill.name!);
      if (!skillId) return null;

      return {
        user_id: userId,
        skill_id: skillId,
        level: skill.level,
        years_experience: skill.yearsExperience,
        is_primary: skill.isPrimary,
        verified: skill.verified,
        display_order: skill.displayOrder ?? index,
        selected_category: skill.category || "Other",
      };
    })
    .filter(Boolean);

  // const { error: existsingUserSkills, error: existsingUserSkillsError } = await supabase
  //   .from("user_skills")
  //   .select(`
  //     id,
  //     user_id,
  //     verified,
  //     verified_at,
  //     verified_by,
  //     verification_source,
  //     verification_note
  //   `)
  //   .eq("user_id", userId);

  // if (existsingUserSkillsError) {
  //   console.error("EXISTSING USER SKILLS ERROR:", existsingUserSkillsError.message, existsingUserSkillsError.details, existsingUserSkillsError.hint);
  //   throw existsingUserSkillsError;
  // }

  // const existingVerificationMap = new Map(
  //   (existsingUserSkills ?? []).map((row: any) => [
  //     row.skill_id,
  //     {
  //       verified: !!row.verified,
  //       verified_at: row.verified_at ?? null,
  //       verified_by: row.verified_by ?? null,
  //       verification_source: row.verification_source ?? null,
  //       verification_note: row.verification_note ?? null,
  //     },
  //   ])
  // );

  // const userSkillPayload = normalizedSkills
  //   .map((skill) => {
  //     const skillId = skillMap.get(skill.name);
  //     if (!skillId) return null;

  //     const existingVarification = existingVerificationMap.get(skillId);

  //     return {
  //       user_id: userId,
  //       skill_id: skillId,
  //       level: skill.level,
  //       years_experience: skill.yearsExperience,
  //       is_primary: skill.isPrimary,
  //       verified: existingVarification?.verified ?? false,
  //       verified_at: existingVarification?.verified_at ?? null,
  //       verified_by: existingVarification?.verified_by ?? null,
  //       verification_source: existingVarification?.verification_source ?? null,
  //       verification_note: existingVarification?.verification_note ?? null,
  //       display_order: skill.displayOrder,
  //     };
  //   })
  //   .filter(Boolean);

  // ลบของเก่าก่อน
  const { error: deleteOldError } = await supabase
    .from("user_skills")
    .delete()
    .eq("user_id", userId);

  if (deleteOldError) {
    console.error(
      "DELETE OLD USER SKILLS ERROR:",
      deleteOldError.message,
      deleteOldError.details,
      deleteOldError.hint,
    );
    throw deleteOldError;
  }

  // 6) insert ของใหม่
  if (userSkillRows.length > 0) {
    const { error: insertUserSkillsError } = await supabase
      .from("user_skills")
      .insert(userSkillRows);

    console.log("USER SKILL PAYLOAD:", userSkillRows);

    if (insertUserSkillsError) {
      console.error(
        "INSERT USER SKILLS ERROR:",
        insertUserSkillsError.message,
        insertUserSkillsError.details,
        insertUserSkillsError.hint,
      );
      throw insertUserSkillsError;
    }
  }
}
