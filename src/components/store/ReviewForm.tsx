'use client';

import { useState, useActionState, useEffect, useRef } from 'react';
import { submitReviewAction } from '@/app/[locale]/store/[id]/actions';
import type { SubmitReviewState } from '@/app/[locale]/store/[id]/actions';

type Props = {
  storeId: string;
  ownerId: string;
  userId: string | null;
  writeReview: string;
  yourRating: string;
  yourComment: string;
  submitReview: string;
  reviewSubmitted: string;
  cannotReviewOwn: string;
};

const STARS = [1, 2, 3, 4, 5];

export default function ReviewForm({
  storeId,
  ownerId,
  userId,
  writeReview,
  yourRating,
  yourComment,
  submitReview,
  reviewSubmitted,
  cannotReviewOwn,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  const actionWithIds = submitReviewAction.bind(null, storeId, ownerId);
  const [state, formAction, pending] = useActionState(actionWithIds, null);

  // Reset form on success
  useEffect(() => {
    if (state?.ok) {
      setRating(0);
      setHovered(0);
      formRef.current?.reset();
    }
  }, [state]);

  if (!userId) return null;

  if (userId === ownerId) {
    return (
      <div
        style={{
          padding: '12px 16px',
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          textAlign: 'center',
          fontSize: 13,
          color: 'var(--color-text-muted)',
        }}
      >
        {cannotReviewOwn}
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{writeReview}</h3>

      {/* Star rating */}
      <div>
        <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--color-text-muted)' }}>
          {yourRating}
        </label>
        <div style={{ display: 'flex', gap: 6 }}>
          {STARS.map((star) => {
            const filled = star <= (hovered || rating);
            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 28,
                  cursor: 'pointer',
                  padding: '0 2px',
                  lineHeight: 1,
                  color: filled ? '#f59e0b' : '#d1d5db',
                  transition: 'color 0.15s',
                }}
              >
                ★
              </button>
            );
          })}
        </div>
        <input type="hidden" name="rating" value={rating} />
      </div>

      {/* Comment */}
      <div>
        <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--color-text-muted)' }}>
          {yourComment} <span style={{ opacity: 0.5 }}>({writeReview === 'Write a review' ? 'optional' : 'اختياري'})</span>
        </label>
        <textarea
          name="comment"
          maxLength={1000}
          rows={3}
          placeholder="..."
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            fontSize: 14,
            resize: 'vertical',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Error / success messages */}
      {state?.ok ? (
        <p style={{ color: '#10b981', fontSize: 13, margin: 0 }}>{reviewSubmitted}</p>
      ) : null}
      {state?.error ? (
        <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending || rating === 0}
        style={{
          padding: '10px 20px',
          borderRadius: 10,
          border: 'none',
          background: rating === 0 ? '#9ca3af' : '#2563eb',
          color: '#fff',
          fontWeight: 600,
          fontSize: 14,
          cursor: rating === 0 ? 'not-allowed' : 'pointer',
          opacity: pending ? 0.7 : 1,
        }}
      >
        {pending ? '...' : submitReview}
      </button>
    </form>
  );
}
