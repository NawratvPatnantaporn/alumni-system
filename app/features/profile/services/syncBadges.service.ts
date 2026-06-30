import { supabase } from "@/lib/supabase/client";

export type BadgeDefinition = {
  id: string;
  code: string;
  rule_type: string;
  rule_config: {
    min?: number;
  };
};

export type BadgeMetrics = {
  skillsCount: number;
  achievementsCount: number;
  careerCount: number;
  profileCompletion: number;
};

function isBadgeUnlocked(badge: BadgeDefinition, metrics: BadgeMetrics) {
  const min = Number(badge.rule_config?.min ?? 0);

  switch (badge.rule_type) {
    case "skills_count":
      return metrics.skillsCount >= min;
    case "achievements_count":
      return metrics.achievementsCount >= min;
    case "career_count":
      return metrics.careerCount >= min;
    case "profile_completion":
      return metrics.profileCompletion >= min;
    default:
      return false;
  }
}

export async function syncUserBadges(userId: string, metrics: BadgeMetrics) {
  console.log("SYNC BADGES START:", { userId, metrics });

  const { data: badgeDefs, error: badgeError } = await supabase
    .from("badge_definitions")
    .select("id, code, rule_type, rule_config")
    .eq("is_active", true);

  if (badgeError) {
    console.error(
      "GET BADGE DEFINITIONS ERROR:",
      badgeError.message,
      badgeError.details,
      badgeError.hint
    );
    throw badgeError;
  }

  const unlockedBadges = (badgeDefs ?? []).filter((badge) =>
    isBadgeUnlocked(badge as BadgeDefinition, metrics)
  ) as BadgeDefinition[];

  console.log("UNLOCKED BADGES:", unlockedBadges);

  const { data: existingUserBadges, error: existingError } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId);

  if (existingError) {
    console.error(
      "GET EXISTING USER BADGES ERROR:",
      existingError.message,
      existingError.details,
      existingError.hint
    );
    throw existingError;
  }

  const existingBadgeIds = new Set(
    (existingUserBadges ?? []).map((item) => item.badge_id)
  );

  const rowsToInsert = unlockedBadges
    .filter((badge) => !existingBadgeIds.has(badge.id))
    .map((badge) => ({
      user_id: userId,
      badge_id: badge.id,
      source: "system",
    }));

  console.log("BADGES TO INSERT:", rowsToInsert);

  if (rowsToInsert.length === 0) {
    console.log("NO NEW BADGES TO INSERT");
    return [];
  }

  const { data, error: insertError } = await supabase
    .from("user_badges")
    .insert(rowsToInsert)
    .select("id, badge_id, source");

  if (insertError) {
    console.error(
      "INSERT USER BADGES ERROR:",
      insertError.message,
      insertError.details,
      insertError.hint
    );
    throw insertError;
  }

  console.log("INSERTED USER BADGES:", data);
  return data ?? [];
}