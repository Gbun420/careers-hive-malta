import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminAuth = await requireAdminApi();
  if ("error" in adminAuth) return adminAuth.error;
  const { supabase } = adminAuth;

  const formData = await request.formData();
  const status = formData.get("status") as string;
  const redirectTo = request.headers.get("referer") || "/admin/profiles";

  if (!status || !["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
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