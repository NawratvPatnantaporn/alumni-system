"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallback(){
    const router = useRouter();

    useEffect(() => {
        supabase.auth.getSession().then(() => {
            router.push("/dashboard");
        });
    }, []);

    return <p>กำลังยืนยันตัวตัน...</p>;
}