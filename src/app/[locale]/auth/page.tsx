import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import AuthForm from './AuthForm';
import type { AppLocale } from '@/i18n/routing';

export const metadata = {
  title: 'SOUQ.MR',
};

export default async function AuthPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Already signed in → redirect home
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect({ href: '/', locale });
  }

  return (
    <div className="auth-page">
      <AuthForm />
    </div>
  );
}
