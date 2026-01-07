"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type CheckoutButtonProps = {
  companyId: string;
  jobId?: string;
  product: "JOB_POST" | "FEATURED_ADDON" | "PRO_SUB";
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "premium";
  size?: "default" | "lg" | "sm";
};

export default function CheckoutButton({
  companyId,
  jobId,
  product,
  children,
  className,
  variant,
  size
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, jobId, product }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Checkout failed");

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className={className}
      variant={variant}
      size={size}
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}
