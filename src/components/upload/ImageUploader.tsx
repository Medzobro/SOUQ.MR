'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

interface UploadedImage {
  url: string;
  path: string;
}

interface Props {
  /** Storage bucket id, e.g. "product-images" or "store-images" */
  bucket: string;
  /** Authenticated user id. Files go under "{uid}/..." per RLS. */
  userId: string;
  /** Maximum number of images allowed */
  max?: number;
  /** Initial uploaded images (for edit flows) */
  initial?: UploadedImage[];
  /** Called whenever the list changes */
  onChange?: (images: UploadedImage[]) => void;
  /** Hidden input name — values submitted as JSON in form data */
  name?: string;
}

export default function ImageUploader({
  bucket,
  userId,
  max = 8,
  initial = [],
  onChange,
  name,
}: Props) {
  const t = useTranslations('sell');
  const [items, setItems] = useState<UploadedImage[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const update = (next: UploadedImage[]) => {
    setItems(next);
    onChange?.(next);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const supabase = createClient();
    setError(null);
    setUploading(true);

    try {
      const remaining = Math.max(0, max - items.length);
      const toUpload = Array.from(files).slice(0, remaining);
      const uploaded: UploadedImage[] = [];

      for (const file of toUpload) {
        const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from(bucket)
          .upload(path, file, { cacheControl: '31536000', upsert: false });
        if (upErr) {
          console.error('[upload]', upErr);
          setError(upErr.message);
          continue;
        }
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        uploaded.push({ url: data.publicUrl, path });
      }

      update([...items, ...uploaded]);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async (path: string) => {
    const supabase = createClient();
    update(items.filter((i) => i.path !== path));
    // Best-effort delete; RLS allows owners only
    await supabase.storage.from(bucket).remove([path]);
  };

  return (
    <div>
      <button
        type="button"
        className="upload-area"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || items.length >= max}
      >
        <div className="upload-area-icon">📷</div>
        <div className="upload-area-text">
          {uploading ? '…' : t('uploadImages')}
        </div>
        <div className="upload-area-hint">
          {t('imagesHint')} · {items.length}/{max}
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error ? (
        <div className="toast error" style={{ position: 'static', transform: 'none', marginTop: 12 }}>
          {error}
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="upload-previews">
          {items.map((img) => (
            <div className="upload-preview" key={img.path}>
              <Image src={img.url} alt="" fill sizes="100px" />
              <button
                type="button"
                className="upload-preview-remove"
                onClick={() => remove(img.path)}
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {name ? <input type="hidden" name={name} value={JSON.stringify(items)} /> : null}
    </div>
  );
}
