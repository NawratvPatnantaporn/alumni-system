import { supabase } from "@/lib/supabase/client";
import type { UserSkill } from "@/components/types/skill";

export async function getUserSkills(userId: string): Promise<UserSkill[]> {
  const { data, error } = await supabase
    .from("user_skills")
    .select(
      `
      id,
      user_id,
      skill_id,
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
    .order("display_order", { ascending: true });

  if (error) {
    console.error(
      "GET USER SKILLS ERROR:",
      error.message,
      error.details,
      error.hint,
    );
    throw error;
  }

  return (data ?? []).map((item: any): UserSkill => {
    const displayCategory =
      item.selected_category || item.skills?.category || "Other";

    return {
      id: item.id,
      userId: item.user_id, // ✅ ตัวที่ error ฟ้องว่าขาด
      skillId: item.skill_id,

      level: Number(item.level ?? 1),
      yearsExperience: Number(item.years_experience ?? 0),
      isPrimary: Boolean(item.is_primary),
      verified: Boolean(item.verified),
      displayOrder: item.display_order ?? 0,

      // ✅ เก็บไว้เผื่อ component อื่นเรียก
      selectedCategory: displayCategory,
      selected_category: displayCategory,

      skill: {
        id: item.skills?.id ?? item.skill_id,
        name: item.skills?.name ?? "",
        category: displayCategory, // ✅ ใช้ selected_category ก่อน
      },
    } as UserSkill;
  });
}