import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function NotFound() {
  const t = await getTranslations('product');
  const tNav = await getTranslations('nav');
  return (
    <div className="empty-state" style={{ paddingTop: 120 }}>
      <div className="empty-state-icon">🔎</div>
      <p>{t('notFound')}</p>
      <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: 16 }}>
        {tNav('home')}
      </Link>
    </div>
  );
}
