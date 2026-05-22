import { setRequestLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { fetchCategories, fetchCategoryCounts } from '@/lib/queries';
import CategoriesGrid from '@/components/categories/CategoriesGrid';
import type { AppLocale } from '@/i18n/routing';

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const supabase = await createClient();
  const [categories, counts] = await Promise.all([
    fetchCategories(supabase),
    fetchCategoryCounts(supabase),
  ]);

  const withCounts = categories.map((c) => ({ ...c, products_count: counts[c.slug] ?? 0 }));

  return (
    <div style={{ paddingBottom: 80, paddingTop: 80 }}>
      <div className="section">
        <div className="section-header">
          <div className="section-title">
            {t('browseCategories')} <span>{t('categories')}</span>
          </div>
        </div>
        <CategoriesGrid categories={withCounts} locale={locale} countLabel={t('listingsCount')} />
      </div>
    </div>
  );
}
