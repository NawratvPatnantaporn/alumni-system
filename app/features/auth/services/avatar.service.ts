import { supabase } from "@/lib/supabase/client";

export async function uploadAvatar(userId: string, file: File) {
    if (!file.type.startsWith("image/")) {
        throw new Error("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น");
    }

    const fileExt = file.type.split("/")[1];
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
        });

    if (uploadError) {
        console.error("UPLOAD AVATAR ERROR:", uploadError.message, uploadError);
        throw uploadError;
    }

    const { data: { publicUrl } } = supabase
        .storage
        .from("avatars")
        .getPublicUrl(filePath);

    return publicUrl;
}