import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (email !== "bundyglenn@gmail.com") {
      return NextResponse.json({ error: "Unauthorized email" }, { status: 403 });
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    // 1. Find user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Update Metadata
    const { error: authError } = await supabase.auth.admin.updateUserById(
      user.id,
      { user_metadata: { role: "admin" } }
    );

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 3. Update Profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", user.id);

    if (profileError) {
      // If profile update fails, metadata was still updated which might be enough for login
      return NextResponse.json({ 
        ok: true, 
        message: "Metadata updated, but profile update failed.", 
        details: profileError.message 
      });
    }

    return NextResponse.json({ ok: true, message: `Successfully promoted ${email} to admin.` });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
