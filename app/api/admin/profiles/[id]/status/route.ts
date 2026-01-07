import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await request.formData();
  const status = formData.get("status") as string;
  const redirectTo = request.headers.get("referer") || "/admin/profiles";

  if (!status || !["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const supabase = createRouteHandlerClient();
  if (!supabase) {
      return NextResponse.redirect(new URL(redirectTo + "?error=supabase_config", request.url));
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check admin
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.redirect(new URL(redirectTo + "?error=" + encodeURIComponent(error.message), request.url));
  }

  return NextResponse.redirect(new URL(redirectTo + "?success=true", request.url));
}
