'use client';

import { useActionState, useState } from 'react';
import { useTranslations } from 'next-intl';
import ImageUploader from '@/components/upload/ImageUploader';
import { upsertStoreAction, type StoreFormState } from '../actions';
import type { Store } from '@/lib/supabase/database.types';

interface Props {
  userId: string;
  store: Store | null;
  cities: string[];
}

const initial: StoreFormState | null = null;

export default function StoreOnboardingForm({ userId, store, cities }: Props) {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const [state, formAction, pending] = useActionState(upsertStoreAction, initial);

  const [avatar, setAvatar] = useState<string | null>(store?.avatar_url ?? null);
  const [cover, setCover] = useState<string | null>(store?.cover_url ?? null);

  return (
    <form action={formAction} style={{ padding: '0 20px', maxWidth: 720, margin: '0 auto' }}>
      <div className="input-group">
        <label className="input-label">{t('myStore')}</label>
        <div className="input-wrap">
          <input
            className="input-field"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={80}
            defaultValue={store?.name ?? ''}
          />
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">{t('storeDescription')}</label>
        <div className="input-wrap">
          <textarea
            className="input-field"
            name="description"
            rows={4}
            maxLength={2000}
            defaultValue={store?.description ?? ''}
            placeholder={t('storeDescriptionPlaceholder')}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="input-group">
          <label className="input-label">{t('storeCity')}</label>
          <div className="input-wrap">
            <select className="input-field" name="city" defaultValue={store?.city ?? ''}>
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
          <label className="input-label">{t('storeOpeningHours')}</label>
          <div className="input-wrap">
            <input
              className="input-field"
              name="opening_hours"
              type="text"
              defaultValue={store?.opening_hours ?? ''}
              placeholder={t('openingHoursPlaceholder')}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="input-group">
          <label className="input-label">{t('storePhone')}</label>
          <div className="input-wrap">
            <input
              className="input-field"
              name="phone"
              type="tel"
              defaultValue={store?.phone ?? ''}
              placeholder="+222 ..."
              dir="ltr"
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">{t('storeWhatsapp')}</label>
          <div className="input-wrap">
            <input
              className="input-field"
              name="whatsapp"
              type="tel"
              defaultValue={store?.whatsapp ?? ''}
              placeholder="+222 ..."
              dir="ltr"
            />
          </div>
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">Avatar</label>
        <ImageUploader
          bucket="store-images"
          userId={userId}
          max={1}
          initial={avatar ? [{ url: avatar, path: avatar.split('/store-images/')[1] ?? avatar }] : []}
          onChange={(items) => setAvatar(items[0]?.url ?? null)}
        />
        <input type="hidden" name="avatar_url" value={avatar ?? ''} />
      </div>

      <div className="input-group">
        <label className="input-label">Cover</label>
        <ImageUploader
          bucket="store-images"
          userId={userId}
          max={1}
          initial={cover ? [{ url: cover, path: cover.split('/store-images/')[1] ?? cover }] : []}
          onChange={(items) => setCover(items[0]?.url ?? null)}
        />
        <input type="hidden" name="cover_url" value={cover ?? ''} />
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
        {pending ? tCommon('loading') : tCommon('save')}
      </button>
    </form>
  );
}
