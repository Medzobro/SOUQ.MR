import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { env } from '@/lib/env';

/**
 * Service-role client — bypasses RLS for admin operations.
 * ONLY use in server-side code that needs elevated privileges
 * (seed scripts, migrations, one-time setup endpoints).
 */
export function createServiceClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
