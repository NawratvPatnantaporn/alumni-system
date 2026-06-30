import { supabase } from "@/lib/supabase/client";

export async function uploadAdminContentImage(
  file: File,
  folder: "news" | "events",
) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("content-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("UPLOAD CONTENT IMAGE ERROR:", error.message);
    throw error;
  }

  const { data } = supabase.storage
    .from("content-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}