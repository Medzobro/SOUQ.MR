import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

/**
 * Convenience alias for an authenticated Supabase client typed against our schema.
 *
 * Note: we only pass `Database` and let SupabaseClient default the schema generics.
 * supabase-js v2.106+ has 5 generics — we use defaults to avoid mismatch.
 */
export type AppSupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

/**
 * Supabase client for the browser (Client Components).
 */
export function createClient(): AppSupabaseClient {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
