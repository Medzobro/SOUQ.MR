import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * One-time migration: add promotion fields.
 * DELETE this file after running!
 * Usage: GET /api/migrate (must be admin)
 */
export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Allow both admin auth and secret key
  const secret = new URL(req.url).searchParams.get('secret');
  const isSecretValid = secret && secret === process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isSecretValid) {
    if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 });
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((data as any)?.role !== 'admin') return NextResponse.json({ error: 'admin' }, { status: 403 });
  }

  // Read service role key from env
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const sql = `
    ALTER TABLE products ADD COLUMN IF NOT EXISTS is_promoted boolean DEFAULT false;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS promoted_until timestamptz;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS promotion_requested boolean DEFAULT false;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS promotion_requested_at timestamptz;
    CREATE INDEX IF NOT EXISTS idx_products_promoted ON products(is_promoted, promoted_until) WHERE is_promoted = true;
  `;

  try {
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: 'aws-0-eu-west-1.pooler.supabase.com',
      port: 6543,
      database: 'postgres',
      user: `postgres.${new URL(url).hostname.split('.')[0]}`,
      password: key,
      ssl: { rejectUnauthorized: false },
    });

    await pool.query(sql);
    await pool.end();

    return NextResponse.json({ ok: true, message: 'Migration complete' });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
