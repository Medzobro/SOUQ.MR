'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from '@/i18n/routing';

interface Props {
  images: string[];
  emojiFallback?: string;
  title: string;
}

export default function ProductGallery({ images, emojiFallback = '📦', title }: Props) {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const hasImages = images.length > 0;
  const current = hasImages ? images[index] : null;

  return (
    <div className="product-gallery">
      {current ? (
        <Image src={current} alt={title} fill sizes="100vw" priority />
      ) : (
        <span aria-hidden style={{ fontSize: 100 }}>
          {emojiFallback}
        </span>
      )}

      {hasImages && images.length > 1 ? (
        <div className="gallery-dots">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Image ${i + 1}`}
              className={`gallery-dot ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Back"
        style={{
          position: 'absolute',
          top: 76,
          insetInlineStart: 16,
          background: 'rgba(0,0,0,0.5)',
          border: 'none',
          color: '#fff',
          width: 36,
          height: 36,
          borderRadius: 50,
          cursor: 'pointer',
          fontSize: 20,
          backdropFilter: 'blur(4px)',
          zIndex: 2,
        }}
      >
        ←
      </button>
    </div>
  );
}
