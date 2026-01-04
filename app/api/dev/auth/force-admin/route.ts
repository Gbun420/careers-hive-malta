import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    // 1. Find user in auth.users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Force confirm and update metadata
    const { error: authError } = await supabase.auth.admin.updateUserById(
      user.id,
      { 
        email_confirm: true, 
        user_metadata: { role: "admin" } 
      }
    );

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 3. Force update public.profiles
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", user.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: `User ${email} is now a confirmed Admin.` });
  } catch (error) {
    console.error("Force admin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
