export function assertSupabaseEnv() {
  if (process.env.NODE_ENV === "development") {
    const missing = ["NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_ANON_KEY"].filter(
      (k) => !process.env[k]
    );
    if (missing.length) {
      console.warn("[Supabase] Missing env:", missing.join(", "));
    }
  }
}


