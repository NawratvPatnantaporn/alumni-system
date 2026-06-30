import { supabase } from "@/lib/supabase/client";

export type InterestTag = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
};

export type UserInterestForm = {
  id?: string;
  tagId: string;
  name: string;
  slug: string;
  category: string | null;
  displayOrder: number;
};

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0E00-\u0E7F-]/g, "");
}

function normalizeTagName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export async function getInterestTags(): Promise<InterestTag[]> {
  const { data, error } = await supabase
    .from("interest_tags")
    .select("id, name, slug, category")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("GET INTEREST TAGS ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }

  return (data ?? []) as InterestTag[];
}

export async function createInterestTag(name: string): Promise<InterestTag> {
  const normalizedName = normalizeTagName(name);

  if (!normalizedName) {
    throw new Error("กรุณากรอกชื่อความสนใจ");
  }

  const slug = createSlug(normalizedName);

  const { data, error } = await supabase
    .from("interest_tags")
    .upsert(
      {
        name: normalizedName,
        slug,
        category: "custom",
        is_active: true,
      },
      { onConflict: "slug" },
    )
    .select("id, name, slug, category")
    .single();

  if (error) {
    console.error("CREATE INTEREST TAG ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }

  return data as InterestTag;
}

export async function saveUserInterests(
  userId: string,
  interests: UserInterestForm[] = [],
) {
  const safeInterests = Array.isArray(interests) ? interests : [];

  const { error: deleteError } = await supabase
    .from("user_interests")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    console.error("DELETE USER INTERESTS ERROR:", {
      message: deleteError.message,
      details: deleteError.details,
      hint: deleteError.hint,
      code: deleteError.code,
    });
    throw deleteError;
  }

  const rows = safeInterests
    .filter((item) => !!item.tagId)
    .slice(0, 10)
    .map((item, index) => ({
      user_id: userId,
      interest_tag_id: item.tagId,
      display_order: item.displayOrder ?? index,
    }));

  if (rows.length === 0) return;

  const { error: insertError } = await supabase
    .from("user_interests")
    .insert(rows);

  if (insertError) {
    console.error("INSERT USER INTERESTS ERROR:", {
      message: insertError.message,
      details: insertError.details,
      hint: insertError.hint,
      code: insertError.code,
    });
    throw insertError;
  }
}