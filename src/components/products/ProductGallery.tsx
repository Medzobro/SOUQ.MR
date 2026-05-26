'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from '@/i18n/routing';

interface Props {
  images: string[];
  emojiFallback?: string;
  title: string;
}

export default function ProductGallery({ images, emojiFallback = '📦', title }: Props) {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const isRTL = pathname.startsWith('/ar');

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const hasImages = images.length > 0;
  const current = hasImages ? images[index] : null;

  const goNext = useCallback(() => {
    if (images.length > 1) {
      setIndex((i) => (i + 1) % images.length);
    }
  }, [images.length]);

  const goPrev = useCallback(() => {
    if (images.length > 1) {
      setIndex((i) => (i - 1 + images.length) % images.length);
    }
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left → next
        goNext();
      } else {
        // Swipe right → prev
        goPrev();
      }
    }
  };

  return (
    <div
      className="product-gallery"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
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
          top: 'max(16px, env(safe-area-inset-top, 16px))',
          insetInlineStart: 16,
          background: 'rgba(0,0,0,0.5)',
          border: 'none',
          color: '#fff',
          width: 44,
          height: 44,
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: 22,
          backdropFilter: 'blur(4px)',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isRTL ? '→' : '←'}
      </button>

      {hasImages && images.length > 1 && (
        <>
          <button
            type="button"
            onClick={isRTL ? goNext : goPrev}
            aria-label="Previous"
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              insetInlineStart: 12,
              background: 'rgba(0,0,0,0.4)',
              border: 'none',
              color: '#fff',
              width: 40,
              height: 40,
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: 20,
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            {isRTL ? '▶' : '◀'}
          </button>
          <button
            type="button"
            onClick={isRTL ? goPrev : goNext}
            aria-label="Next"
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              insetInlineEnd: 12,
              background: 'rgba(0,0,0,0.4)',
              border: 'none',
              color: '#fff',
              width: 40,
              height: 40,
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: 20,
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            {isRTL ? '◀' : '▶'}
          </button>
        </>
      )}
    </div>
  );
}
