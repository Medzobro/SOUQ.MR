/**
 * Admin authorization helper.
 * Every admin server action MUST call requireAdmin() before executing.
 */
import { createClient } from './server';

export class AdminAuthError extends Error {
  constructor(message = 'غير مصرح — يتطلب صلاحيات المشرف') {
    super(message);
    this.name = 'AdminAuthError';
  }
}

/**
 * Throws AdminAuthError if the current user is not an admin.
 * Use at the top of every admin-only server action.
 */
export async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new AdminAuthError();

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!data || data.role !== 'admin') throw new AdminAuthError();

  return user.id;
}

/**
 * Returns { ok, error } style result — use in server actions that return
 * a state object rather than throwing.
 */
export async function checkAdmin(): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  try {
    const userId = await requireAdmin();
    return { ok: true, userId };
  } catch {
    return { ok: false, error: 'غير مصرح — يتطلب صلاحيات المشرف' };
  }
}
