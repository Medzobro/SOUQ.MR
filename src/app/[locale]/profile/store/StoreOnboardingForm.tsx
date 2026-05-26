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

const OPENING_HOURS_PRESETS = [
  { value: '24h', labelKey: '24h' },
  { value: '8 صباحاً - 10 مساءً', labelKey: 'morningEvening' },
  { value: '9 صباحاً - 6 مساءً', labelKey: 'businessHours' },
  { value: '8 صباحاً - 12 ظهراً', labelKey: 'morningOnly' },
  { value: '__custom__', labelKey: 'custom' },
];

const initial: StoreFormState | null = null;

export default function StoreOnboardingForm({ userId, store, cities }: Props) {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const [state, formAction, pending] = useActionState(upsertStoreAction, initial);

  const [avatar, setAvatar] = useState<string | null>(store?.avatar_url ?? null);
  const [cover, setCover] = useState<string | null>(store?.cover_url ?? null);
  const [hoursPreset, setHoursPreset] = useState('');
  const [customHours, setCustomHours] = useState(store?.opening_hours ?? '');

  const handlePresetChange = (value: string) => {
    setHoursPreset(value);
    if (value !== '__custom__') {
      setCustomHours(value);
    }
  };

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
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">{t('storeOpeningHours')}</label>
          <div className="input-wrap">
            <select
              className="input-field"
              value={hoursPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              style={{ borderBottomLeftRadius: hoursPreset === '__custom__' ? 0 : undefined, borderBottomRightRadius: hoursPreset === '__custom__' ? 0 : undefined }}
            >
              <option value="">— {t('openingHoursPlaceholder')} —</option>
              {OPENING_HOURS_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {t(`openingHoursPresets.${p.labelKey}` as never)}
                </option>
              ))}
            </select>
            {hoursPreset === '__custom__' && (
              <input
                className="input-field"
                name="opening_hours"
                type="text"
                maxLength={120}
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
                placeholder={t('openingHoursPlaceholder')}
                style={{ borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: 0 }}
              />
            )}
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

      {/* Hidden field for opening hours when using preset */}
      <input type="hidden" name="opening_hours" value={hoursPreset && hoursPreset !== '__custom__' ? customHours : customHours} />

      {/* Store Avatar with preview */}
      <div className="input-group">
        <label className="input-label">{t('storeAvatar')}</label>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <ImageUploader
              bucket="store-images"
              userId={userId}
              max={1}
              initial={avatar ? [{ url: avatar, path: avatar.split('/store-images/')[1] ?? avatar }] : []}
              onChange={(items) => setAvatar(items[0]?.url ?? null)}
            />
          </div>
          {/* Live Avatar Preview */}
          <div style={{
            width: 80, height: 80, borderRadius: 18,
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, flexShrink: 0, overflow: 'hidden',
          }}>
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="Avatar preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 28, opacity: 0.4 }}>🏪</span>
            )}
          </div>
        </div>
        <input type="hidden" name="avatar_url" value={avatar ?? ''} />
      </div>

      {/* Store Cover — optional, can be added later from profile */}
      <div className="input-group">
        <label className="input-label">
          {t('storeCover')}
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 400, marginInlineStart: 8 }}>
            ({tCommon('optional') || 'اختياري'})
          </span>
        </label>
        <ImageUploader
          bucket="store-images"
          userId={userId}
          max={1}
          initial={cover ? [{ url: cover, path: cover.split('/store-images/')[1] ?? cover }] : []}
          onChange={(items) => setCover(items[0]?.url ?? null)}
        />
        {cover ? (
          <div style={{
            width: '100%', height: 80, borderRadius: 10,
            background: `url(${cover}) center/cover`,
            border: '1px solid var(--color-border)',
            marginTop: 8, overflow: 'hidden',
          }} />
        ) : null}
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
