import { supabase } from "@/lib/supabase/client";

export type UserAchievementForm = {
  id?: string;
  title: string;
  issuer: string;
  achievementDate: string;
  description: string;
  url: string;
  achievementType: string;
  isFeatured: boolean;
  displayOrder: number;
};

export async function saveUserAchievements(
  userId: string,
  achievements: UserAchievementForm[] = []
) {
  const safeAchievements = Array.isArray(achievements) ? achievements : [];

  const rows = safeAchievements
    .map((item, index) => ({
      id: item.id,
      user_id: userId,
      title: item.title?.trim() || null,
      issuer: item.issuer?.trim() || null,
      achievement_date: item.achievementDate || null,
      description: item.description?.trim() || null,
      url: item.url?.trim() || null,
      achievement_type: item.achievementType?.trim() || null,
      is_featured: !!item.isFeatured,
      display_order: item.displayOrder ?? index,
    }))
    .filter((row) => row.title);

  const incomingIds = rows.map((r) => r.id).filter(Boolean) as string[];

  const { data: existingRows, error: fetchError } = await supabase
    .from("user_achievements")
    .select("id")
    .eq("user_id", userId);

  if (fetchError) {
    console.error(
      "FETCH USER ACHIEVEMENTS ERROR:",
      fetchError.message,
      fetchError.details,
      fetchError.hint
    );
    throw fetchError;
  }

  const existingDbIds = (existingRows ?? []).map((r) => r.id);
  const idsToDelete = existingDbIds.filter((id) => !incomingIds.includes(id));

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("user_achievements")
      .delete()
      .eq("user_id", userId)
      .in("id", idsToDelete);

    if (deleteError) {
      console.error(
        "DELETE USER ACHIEVEMENTS ERROR:",
        deleteError.message,
        deleteError.details,
        deleteError.hint
      );
      throw deleteError;
    }
  }

  const rowsToInsert = rows
    .filter((row) => !row.id)
    .map(({ id, ...rest }) => rest);

  const rowsToUpdate = rows.filter((row) => !!row.id);

  if (rowsToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("user_achievements")
      .insert(rowsToInsert);

    if (insertError) {
      console.error(
        "INSERT USER ACHIEVEMENTS ERROR:",
        insertError.message,
        insertError.details,
        insertError.hint
      );
      throw insertError;
    }
  }

  if (rowsToUpdate.length > 0) {
    const { error: updateError } = await supabase
      .from("user_achievements")
      .upsert(rowsToUpdate, { onConflict: "id" });

    if (updateError) {
      console.error(
        "UPDATE USER ACHIEVEMENTS ERROR:",
        updateError.message,
        updateError.details,
        updateError.hint
      );
      throw updateError;
    }
  }
}