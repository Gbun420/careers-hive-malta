import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();
  const { type } = body;

  if (!['view', 'click'].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  
  // Use the RPC function we created in migration 0033
  const { error } = await supabase.rpc('track_job_metric', {
    p_job_id: id,
    p_type: type
  });

  if (error) {
    console.error("Error tracking metric:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
