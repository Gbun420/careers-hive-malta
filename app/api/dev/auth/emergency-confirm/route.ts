import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email, secret } = await request.json();

    // Security check to prevent unauthorized usage
    if (secret !== process.env.DEV_TOOLS_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    // 1. Find the user
    const { data: { users }, error: findError } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Confirm email and update metadata to admin
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { 
        email_confirm: true,
        user_metadata: { role: "admin" }
      }
    );

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: `User ${email} confirmed and promoted to admin.` });
  } catch (error) {
    console.error("Emergency confirm error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
