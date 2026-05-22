'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { createProductAction, type CreateProductState } from './actions';
import ImageUploader from '@/components/upload/ImageUploader';
import { categoryName } from '@/lib/categories';
import type { Category } from '@/lib/supabase/database.types';
import type { AppLocale } from '@/i18n/routing';

interface Props {
  userId: string;
  categories: Category[];
  cities: string[];
  locale: AppLocale;
}

const initial: CreateProductState | null = null;

export default function SellForm({ userId, categories, cities, locale }: Props) {
  const t = useTranslations('sell');
  const tCommon = useTranslations('common');
  const tProduct = useTranslations('product');
  const [state, formAction, pending] = useActionState(createProductAction, initial);

  return (
    <form action={formAction} style={{ padding: '20px', maxWidth: 720, margin: '0 auto' }}>
      <div className="input-group">
        <label className="input-label">{t('productTitle')}</label>
        <div className="input-wrap">
          <input
            className="input-field"
            name="title"
            type="text"
            required
            minLength={3}
            maxLength={120}
            placeholder={t('productTitlePlaceholder')}
          />
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">{t('productCategory')}</label>
        <div className="input-wrap">
          <select className="input-field" name="category_id" required>
            <option value="">{t('selectCategory')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {categoryName(c, locale)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="input-group">
          <label className="input-label">
            {t('productPrice')} ({tCommon('currency')})
          </label>
          <div className="input-wrap">
            <input
              className="input-field"
              name="price"
              type="number"
              min={0}
              step="0.01"
              required
              placeholder={t('productPricePlaceholder')}
              dir="ltr"
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">{t('productCondition')}</label>
          <div className="input-wrap">
            <select className="input-field" name="condition" defaultValue="used">
              <option value="new">{tProduct('conditionNew')}</option>
              <option value="like_new">{tProduct('conditionLikeNew')}</option>
              <option value="used">{tProduct('conditionUsed')}</option>
              <option value="refurbished">{tProduct('conditionRefurbished')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">{t('productCity')}</label>
        <div className="input-wrap">
          <select className="input-field" name="city">
            <option value="">—</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">{t('productDescription')}</label>
        <div className="input-wrap">
          <textarea
            className="input-field"
            name="description"
            rows={5}
            maxLength={4000}
            placeholder={t('productDescriptionPlaceholder')}
          />
        </div>
      </div>

      <div className="input-group">
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            color: 'var(--color-text-muted)',
          }}
        >
          <input type="checkbox" name="is_negotiable" defaultChecked /> {t('negotiable')}
        </label>
      </div>

      <div className="input-group">
        <label className="input-label">{t('productImages')}</label>
        <ImageUploader bucket="product-images" userId={userId} max={8} name="images" />
      </div>

      {state?.ok === false ? (
        <div className="toast error" style={{ position: 'static', transform: 'none', marginBottom: 16 }}>
          {state.error ?? 'errorGeneric'}
        </div>
      ) : null}

      <button
        type="submit"
        className="btn-primary"
        style={{ width: '100%', fontSize: 16, padding: '14px' }}
        disabled={pending}
      >
        {pending ? tCommon('loading') : t('publish')}
      </button>
    </form>
  );
}
