import "server-only";
import { createServiceRoleClient, createRouteHandlerClient } from "@/lib/supabase/server";

export type AuditLogPayload = {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  meta?: Record<string, unknown> | null;
};

export async function logAudit(payload: AuditLogPayload): Promise<void> {
  const supabase = createServiceRoleClient() ?? createRouteHandlerClient();
  if (!supabase) {
    return;
  }

  try {
    await supabase.from("audit_logs").insert({
      actor_id: payload.actorId,
      action: payload.action,
      entity_type: payload.entityType,
      entity_id: payload.entityId,
      meta: payload.meta ?? {},
    });
  } catch (error) {
    // Audit logging should not block admin actions.
  }
}
