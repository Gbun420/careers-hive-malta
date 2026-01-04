import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendConfirmationEmail } from "@/lib/email/sender";

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    // Generate the signup link using Admin SDK
    // This creates the user in auth.users without sending the default Supabase email
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        data: { role },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 400 });
    }

    if (!data.properties?.action_link) {
      return NextResponse.json({ error: "Failed to generate confirmation link" }, { status: 500 });
    }

    // Send the link via Resend
    const emailResult = await sendConfirmationEmail({
      to: email,
      confirmationUrl: data.properties.action_link,
    });

    if (!emailResult.ok) {
      return NextResponse.json({ error: emailResult.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Verification email sent via Resend" });
  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
