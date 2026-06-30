import { supabase } from "@/lib/supabase/client";
import type { CareerCategoryRow, CareerExperienceSkillForm } from "@/components/types/career";

export async function getCareerCategories(): Promise<CareerCategoryRow[]> {
  const { data, error } = await supabase
    .from("career_categories")
    .select(
      `
        id,
        name,
        label_th,
        label_en,
        description,
        icon_key,
        color,
        display_order,
        is_active
      `,
    )
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error(
      "GET CAREER CATEGORIES ERROR:",
      error.message,
      error.details,
      error.hint
    );
    throw error;
  }

  return data ?? [];
}

export function isCareerMatchedBySkillCategory({
  careerCategory,
  skillCategories,
}: {
  careerCategory: string;
  skillCategories: string[];
}) {
  const normalizedCareer = careerCategory.trim();

  const categories = new Set(
    skillCategories
      .map((item) => item?.trim())
      .filter(Boolean),
  );

  if (!normalizedCareer || normalizedCareer === "Other") {
    return false;
  }

  if (normalizedCareer === "Full Stack") {
    return (
      categories.has("Full Stack") ||
      (categories.has("Frontend") && categories.has("Backend")) ||
      (categories.has("Frontend") && categories.has("Database")) ||
      (categories.has("Backend") && categories.has("Database"))
    );
  };

  if (normalizedCareer === "Data/AI") {
    return categories.has("Data/AI") || categories.has("AI/Automation");
  }

  return categories.has(normalizedCareer);
}

export function calculateCareerAlignment({
  careerCategory,
  relatedSkills,
}: {
  careerCategory: string;
  relatedSkills: CareerExperienceSkillForm[];
}) {
  if (!careerCategory || relatedSkills.length === 0) {
    return {
      score: 0,
      isAligned: false,
      reason: "ยังไม่มีข้อมูลสายงานหรือทักษะที่เกี่ยวข้องเพียงพอ",
    };
  }

  let matchedWeight = 0;
  let totalWeight = 0;

  for (const skill of relatedSkills) {
    const years = Number(skill.yearsExperience ?? 0);
    const level = Number(skill.level ?? 1);
    const relevance = Number(skill.relevanceScore ?? 1);

    const primaryBonus = skill.isPrimary ? 1.5 : 1;
    const yearsBonus = years >= 5 ? 1.5 : years >= 3 ? 1.25 : years >= 1 ? 1.1 : 1;

    const weight = Math.max(1, level) * primaryBonus * yearsBonus * relevance;

    totalWeight += weight;

    const matched = isCareerMatchedBySkillCategory({
      careerCategory,
      skillCategories: [skill.selectedCategory],
    });

    if (matched) {
      matchedWeight += weight;
    }
  }

  const score = 
    totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;
  
  const isAligned = score >= 60;
  
  return {
    score,
    isAligned,
    reason: isAligned
      ? `ทักษะที่เกี่ยวข้องกับงานสอดคล้องกับสาย ${careerCategory} ${score}%`
      : `ทักษะที่เกี่ยวข้องกับงานไม่สอดคล้องกับสาย ${careerCategory} เพียง ${score}%`,
  };
}