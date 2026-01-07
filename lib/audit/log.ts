import { createServiceRoleClient } from "@/lib/supabase/server";

type AuditLogParams = {
  actorId: string;
  actorEmail?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
};

/**
 * Logs an administrative action to the audit_logs table.
 * Uses the service role client to bypass RLS.
 */
export async function logAudit({
  actorId,
  actorEmail = null,
  action,
  entityType,
  entityId,
  metadata = {},
}: AuditLogParams) {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    console.error("Failed to create service role client for audit logging");
    return;
  }

  const { error } = await supabase.from("audit_logs").insert({
    actor_id: actorId,
    actor_email: actorEmail,
    action,
    entity_type: entityType,
    entity_id: entityId,
    meta: metadata,
  });

  if (error) {
    console.error("Failed to insert audit log:", error.message);
  }
}
