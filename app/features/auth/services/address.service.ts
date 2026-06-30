import { supabase } from "@/lib/supabase/client";

export async function upsertAddress(userId: string, address: any) {
    const { error } = await supabase
        .from("addresses")
        .upsert({
            user_id: userId,
            house_no: address.houseNo || null,
            sub_district: address.subDistrict || null,
            district: address.district || null,
            province: address.province || null,
            postal_code: address.postalCode || null,
        },
        { onConflict: "user_id" }
    );

    if (error) {
        console.error("ADDRESS UPSERT ERROR:", error.message, error.details, error.hint);
        throw error;
    }
}