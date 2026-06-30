import { supabase } from "@/lib/supabase/client";

export async function updateProfileData(userId: string, formData: any) {
    const { error } = await supabase
        .from("profiles")
        .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            bio: formData.bio,
            company: formData.company,
            position: formData.position,
            work: formData.work,
            location: formData.location,
            linkedin: formData.linkedin,
            github: formData.github,
            line_id: formData.lineID,
            website: formData.website,
            avatar_url: formData.avatar || null,

            profile_visibility:
                formData.privacy?.profileVisibility ?? "members",
            
            show_email:
                Boolean(formData.privacy?.showEmail),
            
            show_phone:
                Boolean(formData.privacy?.showPhone),
            
            show_location:
                formData.privacy?.showLocation !== false,
            
            show_linkedin:
                formData.privacy?.showLinkedin !== false,
            
            show_website:
                formData.privacy?.showWebsite !== false,

            updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

    if (error) {
        console.error("UPDATE PROFILE ERROR:", error.message, error.details, error.hint);
        throw error;
    }
}