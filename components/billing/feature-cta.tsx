"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  trackCheckoutCreated,
  trackCheckoutFailed,
  trackFeatureClick,
} from "@/lib/analytics/events";

type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

type FeatureCTAProps = {
  jobId: string;
  billingEnabled: boolean;
  label?: string;
  size?: "default" | "lg";
  variant?: "default" | "outline";
  className?: string;
  redirectPath?: string;
};

export default function FeatureCTA({
  jobId,
  billingEnabled,
  label = "Feature",
  size = "default",
  variant = "outline",
  className,
  redirectPath,
}: FeatureCTAProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (!billingEnabled) {
      const message = "Billing is not configured.";
      setError(message);
      trackCheckoutFailed({ jobId, reason: "STRIPE_NOT_CONFIGURED" });
      return;
    }

    setError(null);
    trackFeatureClick({ jobId, source: "employer_ui" });
    setLoading(true);

    try {
      const response = await fetch("/api/billing/checkout-featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId }),
      });
      const payload = (await response.json().catch(() => ({}))) as ApiError & {
        url?: string;
      };

      if (!response.ok) {
        const code = payload.error?.code;
        const message =
          payload.error?.message ?? "Unable to start checkout.";

        if (code === "UNAUTHORIZED") {
          const redirect = redirectPath ?? window.location.pathname;
          router.push(`/login?redirectedFrom=${encodeURIComponent(redirect)}`);
          return;
        }

        if (code === "FORBIDDEN") {
          setError("Employer access required to feature a job.");
          trackCheckoutFailed({ jobId, reason: "FORBIDDEN" });
          return;
        }

        if (code === "STRIPE_NOT_CONFIGURED") {
          setError("Billing is not configured.");
          trackCheckoutFailed({ jobId, reason: "STRIPE_NOT_CONFIGURED" });
          return;
        }

        setError(message);
        trackCheckoutFailed({ jobId, reason: code ?? "UNKNOWN" });
        return;
      }

      if (!payload.url) {
        setError("Checkout URL missing. Try again.");
        trackCheckoutFailed({ jobId, reason: "MISSING_URL" });
        return;
      }

      trackCheckoutCreated({ jobId, sessionUrl: payload.url });
      window.location.href = payload.url;
    } catch (err) {
      setError("Network error. Please retry.");
      trackCheckoutFailed({ jobId, reason: "NETWORK_ERROR" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        size={size}
        variant={variant}
        disabled={!billingEnabled || loading}
        onClick={handleClick}
      >
        {loading ? "Redirecting..." : label}
      </Button>
      {error ? (
        <p className="mt-2 text-xs text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}
