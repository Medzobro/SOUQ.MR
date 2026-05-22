import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect, Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { cast } from '@/lib/supabase/helpers';
import { fetchCategories } from '@/lib/queries';
import SellForm from './SellForm';
import type { Profile } from '@/lib/supabase/database.types';
import type { AppLocale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

const MR_CITIES = [
  'نواكشوط',
  'نواذيبو',
  'روصو',
  'كيهيدي',
  'ازويرات',
  'أطار',
  'كيفه',
  'سيلبابي',
  'ألاك',
  'تجكجة',
];

export default async function SellPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('sell');
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect({ href: '/auth', locale });
  const userId = user!.id;

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  const profile = cast<Pick<Profile, 'role'> | null>(profileData);

  if (profile?.role !== 'seller') {
    return (
      <div className="empty-state" style={{ paddingTop: 100 }}>
        <div className="empty-state-icon">🏪</div>
        <p>{t('needSellerAccount')}</p>
        <Link
          href="/profile"
          className="btn-primary"
          style={{ display: 'inline-block', marginTop: 16 }}
        >
          {t('createStore')}
        </Link>
      </div>
    );
  }

  const { data: storeData } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle();
  const store = cast<{ id: string } | null>(storeData);

  if (!store) {
    return (
      <div className="empty-state" style={{ paddingTop: 100 }}>
        <div className="empty-state-icon">🏪</div>
        <p>{t('needStore')}</p>
        <Link
          href="/profile/store"
          className="btn-primary"
          style={{ display: 'inline-block', marginTop: 16 }}
        >
          {t('createStore')}
        </Link>
      </div>
    );
  }

  const categories = await fetchCategories(supabase);

  return (
    <div style={{ paddingTop: 80, paddingBottom: 100 }}>
      <div style={{ padding: '0 20px', textAlign: 'center', marginBottom: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900 }}>{t('title')}</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 4 }}>
          {t('subtitle')}
        </p>
      </div>
      <SellForm userId={userId} categories={categories} cities={MR_CITIES} locale={locale} />
    </div>
  );
}
