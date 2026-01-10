const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const stripeEnv = [
  "STRIPE_SECRET_KEY",
  "STRIPE_PRICE_JOB_POST",
  "STRIPE_PRICE_FEATURED_ADDON",
  "STRIPE_PRICE_PRO_SUB",
  "STRIPE_WEBHOOK_SECRET",
] as const;

export function getMissingSupabaseEnv(): string[] {
  return requiredEnv.filter((key) => !process.env[key]);
}

export function isSupabaseConfigured(): boolean {
  return getMissingSupabaseEnv().length === 0;
}

export function getMissingStripeEnv(): string[] {
  return stripeEnv.filter((key) => !process.env[key]);
}

export function isStripeConfigured(): boolean {
  return getMissingStripeEnv().length === 0;
}
