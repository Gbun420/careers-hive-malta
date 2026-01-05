"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

export default function ReloadSchemaButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleReload = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/db/reload-schema", {
        method: "POST",
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("✅ Schema reloaded!");
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(data.error?.message || "Failed to reload schema");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Error reloading schema");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {message && <span className="text-xs font-medium text-slate-600">{message}</span>}
      <Button
        variant="outline"
        size="default"
        onClick={handleReload}
        disabled={loading}
        className="gap-2"
      >
        <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Reloading..." : "Reload Schema Cache"}
      </Button>
    </div>
  );
}
