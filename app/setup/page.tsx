import Link from "next/link";
import { notFound } from "next/navigation";
import { getMissingSupabaseEnv, getMissingStripeEnv, isStripeConfigured } from "@/lib/auth/session";
import { getMissingMeiliEnv, isMeiliConfigured } from "@/lib/search/meili";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";

export default function SetupPage() {
  // Allow viewing setup in production for debugging/config purposes during this phase
  /*
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  */

  const missing = getMissingSupabaseEnv();
  const missingMeili = getMissingMeiliEnv();
  const missingStripe = getMissingStripeEnv();

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <SectionHeading
            title="System Configuration"
            subtitle="Link your database and search engine to initialize the Malta job board."
          />
        </header>

        <div className="space-y-8">
          {/* Supabase Section */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-950 tracking-tight">Supabase Core</h3>
              {missing.length === 0 ? (
                <Badge variant="success">Sync Active</Badge>
              ) : (
                <Badge variant="error">Pending Link</Badge>
              )}
            </div>

            {missing.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 font-medium">Add these missing environment variables to your <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">.env.local</code> file:</p>
                <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
                  <ul className="list-disc space-y-1 pl-5 text-sm font-bold text-rose-700">
                    {missing.map((key) => (
                      <li key={key}>{key}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-secondary font-bold">
                Database synchronization is active. You can now <Link href="/login" className="underline decoration-2 underline-offset-4">Sign in to your account</Link>.
              </p>
            )}
          </div>

          {/* Stripe Section */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-950 tracking-tight">Stripe Payments</h3>
              {isStripeConfigured() ? (
                <Badge variant="success">Payments Ready</Badge>
              ) : (
                <Badge variant="error">Setup Required</Badge>
              )}
            </div>

            {missingStripe.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 font-medium">Add these Stripe environment variables to your deployment (Vercel):</p>
                <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
                  <ul className="list-disc space-y-1 pl-5 text-sm font-bold text-rose-700">
                    {missingStripe.map((key) => (
                      <li key={key}>{key}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-secondary font-bold">
                Payment gateway is fully configured for Malta job board.
              </p>
            )}
          </div>

          {/* Meilisearch Section */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-950 tracking-tight">Meilisearch (Optional)</h3>
              {isMeiliConfigured() ? (
                <Badge variant="success">Fast Search Ready</Badge>
              ) : (
                <Badge>Standard Mode</Badge>
              )}
            </div>

            {!isMeiliConfigured() && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 font-medium">Add Meilisearch credentials to enable lightning-fast filtering and real-time indexing.</p>
                {missingMeili.length > 0 && (
                  <ul className="list-disc space-y-1 pl-5 text-sm font-bold text-slate-400">
                    {missingMeili.map((key) => (
                      <li key={key}>{key}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="mt-12 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
          Need help? Consult <code className="text-brand">docs/DB.md</code> for platform architectural details.
        </p>
      </div>
    </PageShell>
  );
}