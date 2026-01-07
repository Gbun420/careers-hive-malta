import "server-only";

export interface Mailer {
  send(to: string, subject: string, html: string): Promise<void>;
}

export class ConsoleMailer implements Mailer {
  async send(to: string, subject: string, html: string): Promise<void> {
    console.log("--- CONSOLE MAILER ---");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html.substring(0, 200)}...`);
    console.log("-----------------------");
  }
}

// We'll use this factory pattern to swap between Console and Resend
export function getMailer(): Mailer {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey && process.env.NODE_ENV === "production") {
    // In production, we'd use a ResendMailer implementation
    // For now, returning console to avoid accidental costs/spam
    return new ConsoleMailer();
  }
  return new ConsoleMailer();
}
