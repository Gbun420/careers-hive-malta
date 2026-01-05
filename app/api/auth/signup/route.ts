import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendConfirmationEmail } from "@/lib/email/sender";

export const runtime = "edge";
export const dynamic = "force-dynamic";

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

    // Check if user already exists
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error("Supabase listUsers error:", listError);
      return NextResponse.json({ error: "Failed to verify user status" }, { status: 500 });
    }

    const users = listData?.users ?? [];
    const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      if (existingUser.email_confirmed_at) {
        return NextResponse.json({ 
          error: "User already registered and confirmed. Please sign in instead.",
          code: "USER_ALREADY_EXISTS" 
        }, { status: 400 });
      }
      
      // If user exists but is NOT confirmed, delete them so we can re-generate a fresh signup link
      console.log(`Deleting unconfirmed existing user: ${email}`);
      const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);
      if (deleteError) {
        console.error("Failed to delete existing unconfirmed user:", deleteError);
        return NextResponse.json({ error: "Failed to reset unconfirmed account" }, { status: 500 });
      }
    }

    // Generate the signup link using Admin SDK
    console.log(`Generating signup link for: ${email}`);
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
      console.error("Supabase generateLink error:", error);
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

    const override = process.env.EMAIL_RECIPIENT_OVERRIDE;
    const msg = override 
      ? `Verification email sent to override address: ${override}` 
      : "Verification email sent via Resend";

    return NextResponse.json({ ok: true, message: msg });
  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
