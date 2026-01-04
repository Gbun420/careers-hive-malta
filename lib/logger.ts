import { NextRequest } from "next/server";
import { randomUUID } from "crypto";

export interface AuditLog {
  requestId: string;
  timestamp: string;
  route: string;
  method: string;
  userId?: string;
  statusCode: number;
  duration: number;
  errorCode?: string;
}

class AuditLogger {
  private generateRequestId(): string {
    return randomUUID();
  }

  logRequest(
    req: NextRequest,
    startTime: number,
    statusCode: number,
    userId?: string,
    errorCode?: string
  ): AuditLog {
    const log: AuditLog = {
      requestId: this.generateRequestId(),
      timestamp: new Date().toISOString(),
      route: req.nextUrl.pathname,
      method: req.method,
      userId,
      statusCode,
      duration: Date.now() - startTime,
      errorCode,
    };

    console.log(JSON.stringify(log));
    return log;
  }

  logSecurityEvent(event: string, details: Record<string, unknown>) {
    const securityLog = {
      type: "SECURITY",
      timestamp: new Date().toISOString(),
      event,
      ...details,
    };
    console.warn(JSON.stringify(securityLog));
  }
}

export const auditLogger = new AuditLogger();
