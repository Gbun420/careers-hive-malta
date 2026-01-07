"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Poll for status or just wait
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [sessionId]);

  return (
    <div className="max-w-2xl mx-auto text-center py-20">
      {loading ? (
        <div className="space-y-6">
          <Loader2 className="h-16 w-16 text-brand animate-spin mx-auto" />
          <h2 className="text-2xl font-black text-slate-900">Processing your payment...</h2>
          <p className="text-slate-500">We are finalizing your order and updating your entitlements.</p>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          <div className="h-24 w-24 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Payment Successful!</h2>
            <p className="text-lg text-slate-600 font-medium">Your new entitlements are now active. Thank you for choosing Careers.mt.</p>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-xl px-10 bg-brand text-white border-none shadow-cta">
              <Link href="/employer/dashboard">Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl px-10">
              <Link href="/pricing">View Plans</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <PageShell>
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin mx-auto" />}>
        <SuccessContent />
      </Suspense>
    </PageShell>
  );
}
