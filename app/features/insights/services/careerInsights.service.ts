import { supabase } from "@/lib/supabase/client";

export type CareerAlignmentCategoryRow = {
  career_category: string;
  total: number;
  matched: number;
  unmatched: number;
  match_rate: number;
  avg_alignment_score: number;
};

export type CareerAlignmentSummaryRow = {
  total_people: number;
  matched: number;
  unmatched: number;
  match_rate: number;
  company_count: number;
};

export type TopCompanySummaryRow = {
  company: string;
  total_people: number;
  main_category: string | null;
};

export type YearlyTrendRow = {
  year: number;
  total_people: number;
  matched: number;
  match_rate: number;
};

export type TopSkillByCareerRow = {
  career_category: string;
  skill_name: string;
  usage_count: number;
  avg_level: number;
  avg_years: number;
};

function logSupabaseError(label: string, error: any) {
  console.error(label, {
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    code: error?.code,
    raw: error,
  });
}

function throwSupabaseError(label: string, error: any): never {
  logSupabaseError(label, error);
  throw error;
}

export async function getCareerAlignmentSummary() {
  const { data, error } = await supabase
    .from("v_career_alignment_summary")
    .select("total_people, matched, unmatched, match_rate, company_count")
    .maybeSingle();

  if (error) {
    throwSupabaseError("GET CAREER ALIGNMENT SUMMARY ERROR", error);
  }

  return data as CareerAlignmentSummaryRow | null;
}

export async function getCareerAlignmentByCategory() {
  const { data, error } = await supabase
    .from("v_career_alignment_by_category")
    .select(
      "career_category, total, matched, unmatched, match_rate, avg_alignment_score",
    )
    .order("total", { ascending: false });

  if (error) {
    throwSupabaseError("GET CAREER ALIGNMENT CATEGORY ERROR", error);
  }

  return (data ?? []) as CareerAlignmentCategoryRow[];
}

export async function getTopCompaniesSummary(limit = 8) {
  const { data, error } = await supabase
    .from("v_top_companies_summary")
    .select("company, total_people, main_category")
    .order("total_people", { ascending: false })
    .limit(limit);

  if (error) {
    throwSupabaseError("GET TOP COMPANIES SUMMARY ERROR", error);
  }

  return (data ?? []) as TopCompanySummaryRow[];
}

export async function getCareerAlignmentYearlyTrend() {
  const { data, error } = await supabase
    .from("v_career_alignment_yearly_trend")
    .select("year, total_people, matched, match_rate")
    .order("year", { ascending: true });

  if (error) {
    throwSupabaseError("GET CAREER YEARLY TREND ERROR", error);
  }

  return (data ?? []) as YearlyTrendRow[];
}

export async function getTopSkillsByCareerCategory() {
  const { data, error } = await supabase
    .from("v_top_skills_by_career_category")
    .select("career_category, skill_name, usage_count, avg_level, avg_years");

  if (error) {
    throwSupabaseError("GET TOP SKILLS BY CAREER ERROR", error);
  }

  return (data ?? []) as TopSkillByCareerRow[];
}

export async function getCareerInsightsDashboardData() {
  const [
    summaryResult,
    categoriesResult,
    companiesResult,
    yearlyTrendResult,
    topSkillsResult,
  ] = await Promise.allSettled([
    getCareerAlignmentSummary(),
    getCareerAlignmentByCategory(),
    getTopCompaniesSummary(),
    getCareerAlignmentYearlyTrend(),
    getTopSkillsByCareerCategory(),
  ]);

  const summary =
    summaryResult.status === "fulfilled" ? summaryResult.value : null;

  const categories =
    categoriesResult.status === "fulfilled" ? categoriesResult.value : [];

  const companies =
    companiesResult.status === "fulfilled" ? companiesResult.value : [];

  const yearlyTrend =
    yearlyTrendResult.status === "fulfilled" ? yearlyTrendResult.value : [];

  const topSkillsByCareer =
    topSkillsResult.status === "fulfilled" ? topSkillsResult.value : [];

  if (summaryResult.status === "rejected") {
    console.error("CAREER INSIGHT SUMMARY FAILED:", summaryResult.reason);
  }

  if (categoriesResult.status === "rejected") {
    console.error("CAREER INSIGHT CATEGORIES FAILED:", categoriesResult.reason);
  }

  if (companiesResult.status === "rejected") {
    console.error("CAREER INSIGHT COMPANIES FAILED:", companiesResult.reason);
  }

  if (yearlyTrendResult.status === "rejected") {
    console.error(
      "CAREER INSIGHT YEARLY TREND FAILED:",
      yearlyTrendResult.reason,
    );
  }

  if (topSkillsResult.status === "rejected") {
    console.error("CAREER INSIGHT TOP SKILLS FAILED:", topSkillsResult.reason);
  }

  return {
    summary,
    categories,
    companies,
    yearlyTrend,
    topSkillsByCareer,
  };
}