import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type UserRole = "student" | "alumni" | "admin" | "super_admin";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      createdBy,
      currentUserRole,
      firstName,
      lastName,
      email,
      password,
      role,
    }: {
      createdBy: string;
      currentUserRole: UserRole;
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: UserRole;
    } = body;

    if (!createdBy || !email || !password || !role) {
      return NextResponse.json(
        { message: "ข้อมูลไม่ครบถ้วน" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
        { status: 400 }
      );
    }

    if (
      currentUserRole !== "super_admin" &&
      (role === "admin" || role === "super_admin")
    ) {
      return NextResponse.json(
        { message: "เฉพาะ Super Admin เท่านั้นที่สร้าง Admin หรือ Super Admin ได้" },
        { status: 403 }
      );
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          role,
        },
      });

    if (authError) {
      return NextResponse.json(
        { message: authError.message },
        { status: 400 }
      );
    }

    const authUserId = authData.user?.id;

    if (!authUserId) {
      return NextResponse.json(
        { message: "Cannot create auth user." },
        { status: 400 }
      );
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: authUserId,
        first_name: firstName,
        last_name: lastName,
        email,
        role,
        profile_completion: 10,
        is_active: true,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      return NextResponse.json(
        { message: profileError.message },
        { status: 400 }
      );
    }

    await supabaseAdmin.from("admin_activity_logs").insert({
      actor_id: createdBy,
      action_type: "user_created",
      title: `สร้างผู้ใช้ใหม่: ${firstName || email}`,
      description: `สร้างบัญชี role ${role}`,
      target_user_id: authUserId,
    });

    return NextResponse.json({
      user: authData.user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message ?? "Create user failed" },
      { status: 500 }
    );
  }
}