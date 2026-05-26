import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from './AdminSidebar';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/ar/auth');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = profile as any;
  if (p?.role !== 'admin') {
    redirect('/ar');
  }

  return (
    <div className="admin-layout">
      <AdminSidebar userName={p?.full_name ?? 'المشرف'} />
      <main className="admin-main">{children}</main>
    </div>
  );
}
