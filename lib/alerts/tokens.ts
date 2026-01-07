import "server-only";
import { createHmac } from "crypto";

const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET || "fallback-secret-for-dev-only";

export function generateUnsubscribeToken(userId: string, alertId: string): string {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 365; // 1 year
  const payload = `${userId}:${alertId}:${expiresAt}`;
  const signature = createHmac("sha256", UNSUBSCRIBE_SECRET)
    .update(payload)
    .digest("hex");
  
  const tokenData = `${payload}:${signature}`;
  return Buffer.from(tokenData).toString("base64url");
}

export function verifyUnsubscribeToken(token: string): { userId: string; alertId: string } | null {
  try {
    const tokenData = Buffer.from(token, "base64url").toString("utf-8");
    const [userId, alertId, expiresAt, signature] = tokenData.split(":");
    
    if (!userId || !alertId || !expiresAt || !signature) return null;
    
    const payload = `${userId}:${alertId}:${expiresAt}`;
    const expectedSignature = createHmac("sha256", UNSUBSCRIBE_SECRET)
      .update(payload)
      .digest("hex");
    
    if (signature !== expectedSignature) return null;
    if (Date.now() > parseInt(expiresAt)) return null;
    
    return { userId, alertId };
  } catch (e) {
    return null;
  }
}
