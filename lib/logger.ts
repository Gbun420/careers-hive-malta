import { NextRequest } from "next/server";

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
    return crypto.randomUUID();
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
      severity: "HIGH",
      event,
      ...details,
    };
    console.warn(JSON.stringify(securityLog));
  }

  logPerformance(route: string, duration: number, threshold: number = 1000) {
    const perfLog = {
      type: "PERFORMANCE",
      timestamp: new Date().toISOString(),
      route,
      duration,
      threshold,
      slow: duration > threshold,
      severity: duration > threshold ? "WARNING" : "INFO",
    };
    console.log(JSON.stringify(perfLog));
  }

  logError(error: Error, context: Record<string, unknown>) {
    const errorLog = {
      type: "ERROR",
      timestamp: new Date().toISOString(),
      severity: "ERROR",
      message: error.message,
      stack: error.stack,
      ...context,
    };
    console.error(JSON.stringify(errorLog));
  }

  logBusinessEvent(event: string, details: Record<string, unknown>) {
    const businessLog = {
      type: "BUSINESS",
      timestamp: new Date().toISOString(),
      severity: "INFO",
      event,
      ...details,
    };
    console.log(JSON.stringify(businessLog));
  }
}

export const auditLogger = new AuditLogger();

// Convenience exports for common logging patterns
export const logSecurity = (event: string, details: Record<string, unknown>) =>
  auditLogger.logSecurityEvent(event, details);

export const logPerformance = (route: string, duration: number, threshold?: number) =>
  auditLogger.logPerformance(route, duration, threshold);

export const logError = (error: Error, context: Record<string, unknown>) =>
  auditLogger.logError(error, context);

export const logBusiness = (event: string, details: Record<string, unknown>) =>
  auditLogger.logBusinessEvent(event, details);
