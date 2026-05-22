import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { cast } from '@/lib/supabase/helpers';
import StoreOnboardingForm from './StoreOnboardingForm';
import type { Store } from '@/lib/supabase/database.types';
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

export default async function StoreOnboardingPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('profile');
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect({ href: '/auth', locale });

  const { data } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', user!.id)
    .maybeSingle();
  const store = cast<Store | null>(data);

  return (
    <div style={{ paddingTop: 80, paddingBottom: 100 }}>
      <div style={{ padding: '0 20px 16px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>
          {store ? t('myStore') : t('createStore')}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 4 }}>
          {t('createStoreSubtitle')}
        </p>
      </div>
      <StoreOnboardingForm userId={user!.id} store={store} cities={MR_CITIES} />
    </div>
  );
}
