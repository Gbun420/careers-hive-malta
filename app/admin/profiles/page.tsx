import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminProfilesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect("/");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .eq("status", "PENDING")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-900">Pending Profiles</h1>
      <div className="space-y-4">
        {profiles?.map((p: any) => (
          <div key={p.id} className="border p-6 rounded-lg bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                 <p className="font-bold text-lg text-slate-900">{p.full_name || "Unnamed User"}</p>
                 <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{p.role}</span>
              </div>
              <p className="text-slate-600">{p.headline || "No headline"}</p>
              {p.location && <p className="text-sm text-slate-500 mt-1">{p.location}</p>}
              
              <div className="mt-3 flex gap-2 text-xs">
                 {p.cv_file_path ? (
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-semibold border border-indigo-100">CV Uploaded</span>
                 ) : (
                    <span className="bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-100">No CV</span>
                 )}
              </div>
            </div>
            <div className="flex items-center gap-3">
                 <form action={`/api/admin/profiles/${p.id}/status`} method="POST">
                    <input type="hidden" name="status" value="APPROVED" />
                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm">Approve</button>
                 </form>
                 <form action={`/api/admin/profiles/${p.id}/status`} method="POST">
                    <input type="hidden" name="status" value="REJECTED" />
                    <button className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors">Reject</button>
                 </form>
            </div>
          </div>
        ))}
        {(!profiles || profiles.length === 0) && (
            <div className="text-center py-16 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <p className="text-slate-500 font-medium">No pending profiles to review.</p>
            </div>
        )}
      </div>
    </div>
  );
}
