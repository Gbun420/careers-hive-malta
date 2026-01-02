const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export function getMissingSupabaseEnv(): string[] {
  return requiredEnv.filter((key) => !process.env[key]);
}

export function isSupabaseConfigured(): boolean {
  return getMissingSupabaseEnv().length === 0;
}
